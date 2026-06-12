package com.nju.travel.module.invite.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record InviteCardCreateRequest(
        @NotNull Long userId,
        @NotNull Long routeId,
        LocalDateTime meetTime,
        String meetPlace,
        Integer expectedCost,
        Integer peopleLimit
) {
}
