package com.nju.travel.module.story.dto;

import jakarta.validation.constraints.NotNull;

public record TaskSubmitRequest(
        @NotNull Long userId,
        String submitContent
) {
}
