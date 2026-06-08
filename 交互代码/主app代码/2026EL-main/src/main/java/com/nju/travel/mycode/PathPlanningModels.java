package com.nju.travel.mycode;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * 路径规划系统数据传输对象 (DTO)
 * 包含请求参数、API 响应以及高德地图业务模型
 */
public class PathPlanningModels {

    /** 路径规划请求参数 */
    public record RouteRequest(
            String origin,
            String destination,
            String waypoints,
            String strategy
    ) {}

    /** 标准 API 统一响应 */
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

    /** 高德路径规划响应 */
    public record RouteResponse(String status, String info, RouteData route) {}
    public record RouteData(String origin, String destination, List<PathPlan> paths) {}
    public record PathPlan(Integer distance, Integer duration, List<Step> steps) {}
    public record Step(String instruction, String polyline, String action) {}
}
