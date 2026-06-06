package com.nju.travel.mycode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * AMapRouteService - 高德地图路径规划与用户路线业务实现
 * 
 * @author 2026 EL Assistant
 */
@Service
public class AMapRouteService {

    private static final Logger log = LoggerFactory.getLogger(AMapRouteService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${amap.api-key}")
    private String apiKey;

    private static final String AMAP_DRIVING_URL = "https://restapi.amap.com/v5/direction/driving";

    /**
     * 调用高德驾车路径规划接口
     * 
     * @param request 规划请求参数
     * @return 高德 API 返回的原始 JSON 字符串
     */
    public String planRoute(PathPlanningModels.RouteRequest request) {
        log.info("执行路径规划请求: origin={}, destination={}", request.origin(), request.destination());
        
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(AMAP_DRIVING_URL)
                .queryParam("key", apiKey)
                .queryParam("origin", request.origin())
                .queryParam("destination", request.destination())
                .queryParam("show_fields", "polyline")
                .queryParam("strategy", "10");

            if (request.waypoints() != null && !request.waypoints().isEmpty()) {
                builder.queryParam("waypoints", request.waypoints());
            }

            String response = restTemplate.getForObject(builder.toUriString(), String.class);
            log.debug("高德 API 原始响应: {}", response);
            return response;
        } catch (Exception e) {
            log.error("调用高德 API 发生异常: ", e);
            throw new RuntimeException("地图服务暂时不可用，请稍后重试");
        }
    }

    /**
     * 保存/同步用户自定义路线
     * 
     * @param request 包含路线完整信息的 DTO
     * @return 统一格式的 ApiResponse
     */
    public PathPlanningModels.ApiResponse<Long> saveUserRoute(PathPlanningModels.UserRouteSaveRequest request) {
        log.info("正在持久化用户路线: 「{}」, 模式: {}", request.routeName(), request.transportMode());
        
        // 核心逻辑：此处后续可嫁接 JPA/MyBatis Repository
        // RouteEntity entity = new RouteEntity(request);
        // routeRepository.save(entity);
        
        long mockId = System.currentTimeMillis();
        String successMsg = String.format("路线「%s」已成功同步到云端", request.routeName());
        
        return PathPlanningModels.ApiResponse.ok(successMsg, mockId);
    }
}
