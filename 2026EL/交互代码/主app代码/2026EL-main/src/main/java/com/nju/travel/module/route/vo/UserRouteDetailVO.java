package com.nju.travel.module.route.vo;

import java.time.LocalDateTime;
import java.util.List;

public record UserRouteDetailVO(
        Long userRouteId,
        Long userId,
        String title,
        String description,
        List<RouteStopInfo> stops,
        LocalDateTime createdAt
) {
    public record RouteStopInfo(
            Long id,
            String name,
            Integer sortOrder,
            String detail,
            Double latitude,
            Double longitude
    ) {}
}
