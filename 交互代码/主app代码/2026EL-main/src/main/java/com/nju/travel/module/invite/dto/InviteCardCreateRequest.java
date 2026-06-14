package com.nju.travel.module.invite.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record InviteCardCreateRequest(
        @NotNull Long userId,
        String routeKey,
        String routeName,
        LocalDateTime meetTime,
        String meetPlace,
        Integer expectedCost,
        Integer peopleLimit
) {
}
