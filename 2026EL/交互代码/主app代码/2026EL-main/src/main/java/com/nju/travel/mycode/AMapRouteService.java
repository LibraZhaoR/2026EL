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
    private static final String AMAP_DRIVING_URL = "https://restapi.amap.com/v5/direction";

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
        String mode = "driving".equalsIgnoreCase(request.strategy()) ? "/driving" : "/walking";
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(AMAP_DRIVING_URL + mode)
                .queryParam("key", AMAP_KEY)
                .queryParam("origin", request.origin())
                .queryParam("destination", request.destination())
                .queryParam("show_fields", "polyline");

        if (request.waypoints() != null && !request.waypoints().isBlank()) {
            builder.queryParam("waypoints", request.waypoints());
        }

        String url = builder.toUriString();
        log.info("AMap planRoute: {}→{} via {}", request.origin(), request.destination(), request.waypoints());
        return restClient.get().uri(url).retrieve().body(String.class);
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
