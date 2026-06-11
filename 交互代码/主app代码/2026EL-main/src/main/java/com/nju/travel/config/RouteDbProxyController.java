package com.nju.travel.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Enumeration;

/**
 * 路线数据库代理 —— 将 /api/route-db/** 请求转发到 Python 路线数据库服务 (port 8800)
 *
 * 使用方式：
 *   前端调用 /api/route-db/routes  →  实际请求 http://localhost:8800/api/routes
 *   前端调用 /api/route-db/routes/5 →  实际请求 http://localhost:8800/api/routes/5
 */
@RestController
@RequestMapping("/api/route-db")
public class RouteDbProxyController {

    private static final String ROUTE_DB_BASE = "http://localhost:8800/api";
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 代理所有 /api/route-db/** 请求到路线数据库服务
     */
    @RequestMapping(value = "/**", method = {
            RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
            RequestMethod.DELETE, RequestMethod.PATCH
    })
    public ResponseEntity<?> proxy(HttpServletRequest request, @RequestBody(required = false) String body) {
        try {
            // 构造目标 URL
            String suffix = request.getRequestURI().replace("/api/route-db", "");
            String query = request.getQueryString();
            String targetUrl = ROUTE_DB_BASE + suffix + (query != null ? "?" + query : "");

            // 复制请求头
            HttpHeaders headers = new HttpHeaders();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String name = headerNames.nextElement();
                if ("host".equalsIgnoreCase(name) || "content-length".equalsIgnoreCase(name)) continue;
                headers.add(name, request.getHeader(name));
            }

            // 构造请求
            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            // 转发请求
            ResponseEntity<String> response = restTemplate.exchange(
                    URI.create(targetUrl), method, entity, String.class);

            // 返回响应
            return ResponseEntity.status(response.getStatusCode())
                    .headers(response.getHeaders())
                    .body(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"error\":\"路线数据库服务不可用: " + e.getMessage() + "\"}");
        }
    }
}
