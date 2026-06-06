package com.nju.travel.module.story.vo;

public record TaskSubmitVO(
        Long taskId,
        Long userId,
        Boolean correct,
        Integer progressPercent,
        String nextHint,
        Long unlockedAchievementId
) {
}
