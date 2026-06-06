package com.nju.travel.mycode;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.route.service.RouteService;
import com.nju.travel.module.route.vo.UserRouteVO;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

/**
 * RoutePlanningController - 自由绘制路径规划与路线保存
 * 前端通过此代理调用高德 API，避免浏览器跨域/Key限制
 *
 * @author 2026 EL Assistant
 */
@RestController
@RequestMapping("/api/custom-route")
public class RoutePlanningController {

    private final AMapRouteService aMapRouteService;
    private final RouteService routeService;
    private final ObjectMapper objectMapper;

    public RoutePlanningController(AMapRouteService aMapRouteService, RouteService routeService, ObjectMapper objectMapper) {
        this.aMapRouteService = aMapRouteService;
        this.routeService = routeService;
        this.objectMapper = objectMapper;
    }

    /**
     * 路径规划代理接口 (步行/驾车)
     * 返回标准 JSON Content-Type，确保浏览器 fetch().json() 正常解析
     */
    @GetMapping("/plan")
    public ResponseEntity<Object> getRoutePlan(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false) String waypoints,
            @RequestParam(defaultValue = "walking") String mode) {

        try {
            String amapJson = aMapRouteService.planRoute(origin, destination, waypoints, mode);
            Object jsonNode = objectMapper.readTree(amapJson);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonNode);
        } catch (Exception e) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(objectMapper.createObjectNode()
                        .put("status", "0")
                        .put("info", "地图服务暂时不可用: " + e.getMessage()));
        }
    }

    /**
     * 保存用户自由绘制的路线到我的路线库
     */
    @PostMapping("/save")
    public ApiResult<UserRouteVO> saveRoute(@RequestBody PathPlanningModels.UserRouteSaveRequest request) {
        try {
            String routeDesc = buildRouteDescription(request);

            UserRouteVO saved = routeService.saveCustomRoute(
                1L,
                request.getRouteName(),
                routeDesc,
                ""
            );

            return ApiResult.success(saved);
        } catch (Exception e) {
            return ApiResult.fail(500, "保存失败: " + e.getMessage());
        }
    }

    private String buildRouteDescription(PathPlanningModels.UserRouteSaveRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append(request.getTransportMode()).append("|");
        sb.append(request.getTotalDistance()).append("|");
        sb.append(request.getTotalDuration()).append("|");
        sb.append(request.getOrigin()).append("|");
        sb.append(request.getDestination());
        if (request.getWaypoints() != null && !request.getWaypoints().isEmpty()) {
            sb.append("|").append(request.getWaypoints());
        }
        return sb.toString();
    }
}
