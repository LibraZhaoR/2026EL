package com.nju.travel.module.exhibition.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReserveRemindCreateRequest(
        @NotNull Long userId,
        @NotNull Long exhibitionId,
        @NotNull LocalDateTime remindTime
) {
}
