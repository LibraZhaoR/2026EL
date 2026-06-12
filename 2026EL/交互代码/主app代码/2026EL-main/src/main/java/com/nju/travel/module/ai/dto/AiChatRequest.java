package com.nju.travel.module.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AiChatRequest(
        @NotNull Long userId,
        String sessionId,
        @NotBlank String message,
        Long routeId,
        Long pointId,
        String guideRole,
        List<String> imageUrls
) {
}
