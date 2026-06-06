package com.nju.travel.mycode;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RouteRequest(
        @JsonProperty("origin") String origin,
        @JsonProperty("destination") String destination,
        @JsonProperty("waypoints") String waypoints,
        @JsonProperty("strategy") String strategy
    ) {}

    /**
     * 用户自定义路线保存请求
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UserRouteSaveRequest {
        private String routeName;
        private String origin;
        private String destination;
        private String waypoints;
        private String transportMode;
        private int totalDistance;
        private int totalDuration;

        public UserRouteSaveRequest() {}

        public String getRouteName() { return routeName; }
        public void setRouteName(String routeName) { this.routeName = routeName; }
        public String getOrigin() { return origin; }
        public void setOrigin(String origin) { this.origin = origin; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public String getWaypoints() { return waypoints; }
        public void setWaypoints(String waypoints) { this.waypoints = waypoints; }
        public String getTransportMode() { return transportMode; }
        public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
        public int getTotalDistance() { return totalDistance; }
        public void setTotalDistance(int totalDistance) { this.totalDistance = totalDistance; }
        public int getTotalDuration() { return totalDuration; }
        public void setTotalDuration(int totalDuration) { this.totalDuration = totalDuration; }
    }

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
