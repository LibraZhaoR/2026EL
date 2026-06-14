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
 * 注意：路线数据库 Python 服务为可选组件。当服务不可用时，GET 请求返回空列表
 * （而非 503），避免前端控制台报错。
 */
@RestController
@RequestMapping("/api/route-db")
public class RouteDbProxyController {

    private static final String ROUTE_DB_BASE = "http://localhost:8800/api";
    private final RestTemplate restTemplate = new RestTemplate();

    @RequestMapping(value = "/**", method = {
            RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
            RequestMethod.DELETE, RequestMethod.PATCH
    })
    public ResponseEntity<?> proxy(HttpServletRequest request, @RequestBody(required = false) String body) {
        try {
            String suffix = request.getRequestURI().replace("/api/route-db", "");
            String query = request.getQueryString();
            String targetUrl = ROUTE_DB_BASE + suffix + (query != null ? "?" + query : "");

            HttpHeaders headers = new HttpHeaders();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String name = headerNames.nextElement();
                if ("host".equalsIgnoreCase(name) || "content-length".equalsIgnoreCase(name)) continue;
                headers.add(name, request.getHeader(name));
            }

            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    URI.create(targetUrl), method, entity, String.class);

            return ResponseEntity.status(response.getStatusCode())
                    .headers(response.getHeaders())
                    .body(response.getBody());

        } catch (Exception e) {
            // 路线数据库服务不可用时，GET 请求返回空列表避免控制台报错
            if ("GET".equalsIgnoreCase(request.getMethod())) {
                return ResponseEntity.ok("{\"items\":[],\"total\":0}");
            }
            // POST/PUT 等写操作返回友好提示
            return ResponseEntity.ok("{\"id\":null,\"message\":\"路线数据库暂不可用\"}");
        }
    }
}
