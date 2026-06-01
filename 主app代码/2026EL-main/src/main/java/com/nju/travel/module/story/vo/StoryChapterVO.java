package com.nju.travel.module.story.vo;

public record StoryChapterVO(
        Long chapterId,
        Long storyId,
        String title,
        String content,
        Integer sortOrder,
        Long pointId
) {
}
