package com.nju.travel.mycode;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.route.vo.UserRouteVO;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 路径规划与路线保存 API
 */
@RestController
@RequestMapping("/api/custom-route")
public class RoutePlanningController {

    private final AMapRouteService aMapRouteService;

    public RoutePlanningController(AMapRouteService aMapRouteService) {
        this.aMapRouteService = aMapRouteService;
    }

    /** 路径规划代理 (GET) */
    @GetMapping("/plan")
    public Object getRoutePlan(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false) String waypoints,
            @RequestParam(defaultValue = "10") String strategy) {
        return aMapRouteService.planRoute(
                new PathPlanningModels.RouteRequest(origin, destination, waypoints, strategy));
    }

    /** 保存自定义路线 (POST) */
    @PostMapping("/save")
    public ApiResult<UserRouteVO> saveRoute(@RequestBody Map<String, Object> body) {
        try {
            UserRouteSaveRequest req = new UserRouteSaveRequest();
            req.setRouteName((String) body.getOrDefault("routeName", "自定义路线"));
            req.setOrigin((String) body.get("origin"));
            req.setDestination((String) body.get("destination"));
            req.setWaypoints((String) body.get("waypoints"));
            req.setTransportMode((String) body.getOrDefault("transportMode", "walking"));
            req.setTotalDistance(toInt(body.get("totalDistance")));
            req.setTotalDuration(toInt(body.get("totalDuration")));
            return ApiResult.success(aMapRouteService.saveUserRoute(req));
        } catch (Exception e) {
            return ApiResult.fail(500, "保存失败: " + e.getMessage());
        }
    }

    private Integer toInt(Object v) {
        if (v instanceof Number n) return n.intValue();
        if (v instanceof String s) return Integer.parseInt(s);
        return 0;
    }
}
