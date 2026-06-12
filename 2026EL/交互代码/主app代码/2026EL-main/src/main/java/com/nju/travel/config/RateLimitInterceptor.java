package com.nju.travel.config;

import com.nju.travel.common.annotation.RateLimit;
import com.nju.travel.common.result.ApiResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);

    /** Default: 100 requests per minute per IP+URI when no @RateLimit annotation present. */
    private static final int DEFAULT_MAX = 100;
    private static final int DEFAULT_WINDOW_SEC = 60;

    private final Map<String, ConcurrentLinkedDeque<Long>> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitInterceptor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {

        if (!(handler instanceof HandlerMethod hm)) {
            return true;
        }

        RateLimit annotation = resolveAnnotation(hm);

        String key;
        int maxRequests;
        long windowMs;
        String message;

        if (annotation != null) {
            key = buildKey(request, annotation);
            maxRequests = annotation.maxRequests();
            windowMs = annotation.unit().toMillis(annotation.duration());
            message = annotation.message();
        } else {
            // Fallback default for all /api/** without explicit annotation
            key = request.getRemoteAddr() + ":" + request.getRequestURI();
            maxRequests = DEFAULT_MAX;
            windowMs = DEFAULT_WINDOW_SEC * 1000L;
            message = "请求过于频繁，请稍后再试";
        }

        ConcurrentLinkedDeque<Long> timestamps = buckets.computeIfAbsent(
                key, k -> new ConcurrentLinkedDeque<>());

        long now = System.currentTimeMillis();
        timestamps.addLast(now);

        long cutoff = now - windowMs;
        while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
            timestamps.pollFirst();
        }

        if (timestamps.size() > maxRequests) {
            log.warn("Rate limit exceeded: key={}, count={}, limit={}, window={}ms",
                    key, timestamps.size(), maxRequests, windowMs);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write(
                    objectMapper.writeValueAsString(
                            ApiResult.fail(429, message)
                    )
            );
            return false;
        }

        return true;
    }

    private RateLimit resolveAnnotation(HandlerMethod hm) {
        RateLimit a = hm.getMethodAnnotation(RateLimit.class);
        if (a != null) return a;
        return hm.getBeanType().getAnnotation(RateLimit.class);
    }

    private String buildKey(HttpServletRequest request, RateLimit annotation) {
        if (!annotation.key().isBlank()) {
            return annotation.key() + ":" + request.getRemoteAddr();
        }
        return request.getRemoteAddr() + ":" + request.getRequestURI();
    }
}
