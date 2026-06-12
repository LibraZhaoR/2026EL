package com.nju.travel.module.user.vo;

import java.time.LocalDateTime;
import java.util.List;

public record UserVO(
        Long userId,
        String nickname,
        String avatarUrl,
        String roleType,
        String mood,
        List<String> interestTags,
        String persona,
        LocalDateTime createdAt
) {
}
