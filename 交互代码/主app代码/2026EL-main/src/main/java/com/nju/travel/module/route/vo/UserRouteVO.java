package com.nju.travel.module.route.vo;

import java.time.LocalDateTime;
import java.util.List;

public record UserRouteVO(
        Long userRouteId,
        Long userId,
        Long sourceRouteId,
        String title,
        String description,
        Boolean isPublic,
        List<Long> pointIds,
        LocalDateTime createdAt
) {
}
