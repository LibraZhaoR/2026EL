package com.nju.travel.module.story.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.story.service.StoryService;
import com.nju.travel.module.story.vo.StoryChapterVO;
import com.nju.travel.module.story.vo.StoryVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping("/{storyId}")
    public ApiResult<StoryVO> getStory(@PathVariable Long storyId) {
        return ApiResult.success(storyService.getStory(storyId));
    }

    @GetMapping("/{storyId}/chapters")
    public ApiResult<List<StoryChapterVO>> listChapters(@PathVariable Long storyId) {
        return ApiResult.success(storyService.listChapters(storyId));
    }
}
