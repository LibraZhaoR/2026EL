package com.nju.travel.module.user.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "昵称不能为空") String nickname,
        String avatarUrl
) {
}
