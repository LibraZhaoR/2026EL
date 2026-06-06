package com.nju.travel.module.route.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UserRouteCreateRequest(
        @NotNull Long userId,
        Long sourceRouteId,
        @NotBlank String title,
        String description,
        Boolean isPublic,
        List<Long> pointIds
) {
}
