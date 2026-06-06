package com.nju.travel.mycode;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * 路径规划系统数据传输对象 (DTO)
 * 包含请求参数、API 响应以及高德地图业务模型
 * 
 * @author 2026 EL Assistant
 */
public class PathPlanningModels {

    /**
     * 路径规划请求参数
     */
    public record RouteRequest(
        String origin,      // 起点经纬度 (lon,lat)
        String destination, // 终点经纬度 (lon,lat)
        String waypoints,   // 途径点 (lon,lat;lon,lat...)
        String strategy     // 规划策略 (如驾车的避让拥堵等)
    ) {}

    /**
     * 用户自定义路线保存请求
     */
    public record UserRouteSaveRequest(
        String routeName,      // 路线自定义名称
        String origin,         // 起点名称与坐标
        String destination,    // 终点名称与坐标
        String waypoints,      // 途径点列表
        String transportMode,  // 出行方式 (walking/driving)
        Integer totalDistance, // 总距离 (米)
        Integer totalDuration  // 总耗时 (秒)
    ) {}

    /**
     * 标准 API 统一响应结构
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        Long timestamp
    ) {
        public static <T> ApiResponse<T> ok(String msg, T data) {
            return new ApiResponse<>(true, msg, data, System.currentTimeMillis());
        }
        
        public static <T> ApiResponse<T> error(String msg) {
            return new ApiResponse<>(false, msg, null, System.currentTimeMillis());
        }
    }

    // --- 高德地图业务返回模型 ---

    public record RouteResponse(
        String status,
        String info,
        RouteData route
    ) {}

    public record RouteData(
        String origin,
        String destination,
        List<PathPlan> paths
    ) {}

    public record PathPlan(
        Integer distance,
        Integer duration,
        List<Step> steps
    ) {}

    public record Step(
        String instruction,
        String polyline,
        String action
    ) {}
}
