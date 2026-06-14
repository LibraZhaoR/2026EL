package com.nju.travel.mycode;

import com.nju.travel.module.route.entity.RouteStop;
import com.nju.travel.module.route.service.RouteService;
import com.nju.travel.module.route.vo.UserRouteVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 高德地图路径规划 API 服务
 * 使用 v5 Direction API 进行驾车/步行路径规划
 */
@Service
public class AMapRouteService {

    private static final Logger log = LoggerFactory.getLogger(AMapRouteService.class);

    private static final String AMAP_KEY = "5427cfbccb2209b756af7fc782e8105b";
    private static final String AMAP_DIRECTION_URL = "https://restapi.amap.com/v3/direction";

    private final RestClient restClient;
    private final RouteService routeService;

    // 内存存储自定义路线 (简单 demo)
    private final AtomicLong idGen = new AtomicLong(5000);
    private final ConcurrentHashMap<Long, UserRouteSaveRequest> savedRoutes = new ConcurrentHashMap<>();

    public AMapRouteService(RouteService routeService) {
        this.routeService = routeService;
        this.restClient = RestClient.builder().build();
    }

    /**
     * 调用高德 v5 路径规划 API
     */
    public Object planRoute(PathPlanningModels.RouteRequest request) {
        boolean isDriving = "driving".equalsIgnoreCase(request.strategy());
        String mode = isDriving ? "/driving" : "/walking";
        String origin = request.origin();
        String destination = request.destination();
        String waypoints = request.waypoints();

        // 驾车模式支持直接传途经点
        if (isDriving || waypoints == null || waypoints.isBlank()) {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(AMAP_DIRECTION_URL + mode)
                    .queryParam("key", AMAP_KEY)
                    .queryParam("origin", origin)
                    .queryParam("destination", destination)
                    .queryParam("show_fields", "polyline");
            if (waypoints != null && !waypoints.isBlank()) {
                builder.queryParam("waypoints", waypoints);
            }
            String url = builder.toUriString();
            log.info("AMap planRoute: {}→{} via {}", origin, destination, waypoints);
            return restClient.get().uri(url).retrieve().body(String.class);
        }

        // 步行模式分段规划：origin→wp1→wp2→...→destination
        String[] wpArray = waypoints.split(";");
        String[] allPoints = new String[wpArray.length + 2];
        allPoints[0] = origin;
        System.arraycopy(wpArray, 0, allPoints, 1, wpArray.length);
        allPoints[allPoints.length - 1] = destination;

        int totalDist = 0;
        int totalDur = 0;
        StringBuilder combinedPolyline = new StringBuilder();
        java.util.List<PathPlanningModels.Step> allSteps = new java.util.ArrayList<>();

        for (int i = 0; i < allPoints.length - 1; i++) {
            String from = allPoints[i];
            String to = allPoints[i + 1];
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(AMAP_DIRECTION_URL + "/walking")
                    .queryParam("key", AMAP_KEY)
                    .queryParam("origin", from)
                    .queryParam("destination", to)
                    .queryParam("show_fields", "polyline");
            String resp = restClient.get().uri(builder.toUriString()).retrieve().body(String.class);
            log.info("AMap walking segment {}→{}: {}", from, to, resp.substring(0, Math.min(100, resp.length())));

            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                var node = mapper.readTree(resp);
                if (!"1".equals(node.path("status").asText())) continue;
                var route = node.path("route");
                var paths = route.path("paths");
                if (!paths.isArray() || paths.isEmpty()) continue;
                var path = paths.get(0);
                int dist = path.path("distance").asInt();
                int dur = path.path("duration").asInt();
                totalDist += dist;
                totalDur += dur;
                var steps = path.path("steps");
                if (steps.isArray()) {
                    for (var step : steps) {
                        String poly = step.path("polyline").asText();
                        if (!poly.isEmpty()) {
                            if (combinedPolyline.length() > 0) combinedPolyline.append(";");
                            combinedPolyline.append(poly);
                        }
                        allSteps.add(new PathPlanningModels.Step(
                            step.path("instruction").asText(),
                            poly,
                            step.path("action").asText()
                        ));
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse walking segment: {}", e.getMessage());
            }
        }

        // 组装合并后的响应
        String result = String.format(
            "{\"status\":\"1\",\"info\":\"OK\",\"count\":\"1\",\"route\":{\"origin\":\"%s\",\"destination\":\"%s\"," +
            "\"paths\":[{\"distance\":\"%d\",\"duration\":\"%d\",\"steps\":%s}]}}",
            origin, destination, totalDist, totalDur, toStepsJson(allSteps));
        log.info("Combined walking route: {}m, {}s, {} steps", totalDist, totalDur, allSteps.size());
        return result;
    }

    private String toStepsJson(java.util.List<PathPlanningModels.Step> steps) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < steps.size(); i++) {
            if (i > 0) sb.append(",");
            var s = steps.get(i);
            sb.append(String.format("{\"instruction\":\"%s\",\"polyline\":\"%s\",\"action\":\"%s\"}",
                escapeJson(s.instruction()), escapeJson(s.polyline()), escapeJson(s.action() != null ? s.action() : "")));
        }
        sb.append("]");
        return sb.toString();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    /**
     * 保存用户自定义路线 (委托 RouteService 持久化到 H2 数据库)
     */
    public UserRouteVO saveUserRoute(UserRouteSaveRequest request) {
        String desc = (request.getTransportMode() != null ? request.getTransportMode() : "walking")
                + "|" + request.getTotalDistance() + "m|" + request.getTotalDuration() + "s";

        String title = request.getRouteName() != null ? request.getRouteName() : "自定义路线";

        // Parse origin/destination/waypoints into RouteStop entities
        List<RouteStop> stops = new ArrayList<>();
        int order = 0;

        // Parse: "起点名|lng,lat"
        if (request.getOrigin() != null) {
            var parsed = parsePoint(request.getOrigin());
            stops.add(new RouteStop(null, parsed.name(), ++order, "", parsed.lat(), parsed.lng()));
        }
        // Parse waypoints: "途经1|lng,lat;途经2|lng,lat"
        if (request.getWaypoints() != null && !request.getWaypoints().isBlank()) {
            for (String wp : request.getWaypoints().split(";")) {
                var parsed = parsePoint(wp.trim());
                if (!parsed.name().isEmpty()) {
                    stops.add(new RouteStop(null, parsed.name(), ++order, "", parsed.lat(), parsed.lng()));
                }
            }
        }
        // Parse: "终点名|lng,lat"
        if (request.getDestination() != null) {
            var parsed = parsePoint(request.getDestination());
            stops.add(new RouteStop(null, parsed.name(), ++order, "", parsed.lat(), parsed.lng()));
        }

        UserRouteVO saved = routeService.saveCustomRouteWithStops(1L, title, desc, stops);
        log.info("Custom route saved with {} stops: id={}, name={}", stops.size(), saved.userRouteId(), saved.title());
        return saved;
    }

    /** Parse "名称|lng,lat" or "lng,lat" into (name, lat, lng) */
    private record ParsedPoint(String name, Double lat, Double lng) {}
    private ParsedPoint parsePoint(String raw) {
        String name = "";
        String coord = raw;
        if (raw.contains("|")) {
            String[] parts = raw.split("\\|", 2);
            name = parts[0].trim();
            coord = parts[1].trim();
        }
        String[] ll = coord.split(",");
        double lng = ll.length >= 1 ? Double.parseDouble(ll[0].trim()) : 0;
        double lat = ll.length >= 2 ? Double.parseDouble(ll[1].trim()) : 0;
        return new ParsedPoint(name, lat, lng);
    }
}
