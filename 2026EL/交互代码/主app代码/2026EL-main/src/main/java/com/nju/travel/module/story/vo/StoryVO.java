package com.nju.travel.module.story.vo;

public record StoryVO(
        Long storyId,
        Long routeId,
        String title,
        String storyType,
        String guideRole,
        String summary
) {
}
