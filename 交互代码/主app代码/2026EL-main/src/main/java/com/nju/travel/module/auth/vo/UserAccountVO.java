package com.nju.travel.module.auth.vo;

import java.time.LocalDateTime;

public record UserAccountVO(
        Long id,
        String publicUserCode,
        String email,
        String nickname,
        String avatarUrl,
        String bio,
        String interests,
        String travelPersona,
        boolean onboardingCompleted,
        String status,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt
) {}
