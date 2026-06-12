package com.nju.travel.module.achievement.vo;

import java.time.LocalDateTime;

public record AchievementVO(
        Long achievementId,
        String name,
        String description,
        String iconUrl,
        String unlockType,
        String unlockCondition,
        Boolean unlocked,
        LocalDateTime unlockedAt
) {
}
