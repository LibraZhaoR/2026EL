package com.nju.travel.module.story.vo;

import java.util.List;

public record StoryTaskVO(
        Long taskId,
        Long chapterId,
        String taskType,
        String question,
        List<String> options,
        Long rewardAchievementId
) {
}
