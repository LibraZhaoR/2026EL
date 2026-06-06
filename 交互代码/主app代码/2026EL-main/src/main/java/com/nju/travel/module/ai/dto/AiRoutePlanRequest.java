package com.nju.travel.module.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record AiRoutePlanRequest(
        Long userId,
        Integer durationMinutes,
        Integer budgetMax,
        @NotBlank String userText
) {
}
