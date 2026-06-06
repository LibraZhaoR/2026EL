package com.nju.travel.mycode;

import org.springframework.web.bind.annotation.*;

/**
 * RoutePlanningController - 提供路径规划与路线管理相关的 API 接口
 * 
 * @author 2026 EL Assistant
 */
@RestController
@RequestMapping("/api/custom-route")
public class RoutePlanningController {

    private final AMapRouteService aMapRouteService;

    public RoutePlanningController(AMapRouteService aMapRouteService) {
        this.aMapRouteService = aMapRouteService;
    }

    /**
     * 获取路径规划方案 (驾车/分段)
     * 
     * @param origin 起点坐标
     * @param destination 终点坐标
     * @param waypoints 途径点坐标 (可选)
     * @return 原始高德响应数据
     */
    @GetMapping("/plan")
    public Object getRoutePlan(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false) String waypoints) {
        
        PathPlanningModels.RouteRequest request = new PathPlanningModels.RouteRequest(
            origin, destination, waypoints, "10"
        );
        return aMapRouteService.planRoute(request);
    }

    /**
     * 持久化保存用户设计的自定义路线
     * 
     * @param request 路线详细信息
     * @return 包含操作结果与记录 ID 的标准响应
     */
    @PostMapping("/save")
    public PathPlanningModels.ApiResponse<Long> saveRoute(@RequestBody PathPlanningModels.UserRouteSaveRequest request) {
        try {
            return aMapRouteService.saveUserRoute(request);
        } catch (Exception e) {
            return PathPlanningModels.ApiResponse.error("保存失败: " + e.getMessage());
        }
    }
}
