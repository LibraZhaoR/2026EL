package com.nju.travel.module.story.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.story.dto.TaskSubmitRequest;
import com.nju.travel.module.story.service.StoryService;
import com.nju.travel.module.story.vo.StoryTaskVO;
import com.nju.travel.module.story.vo.TaskSubmitVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/story-tasks")
public class StoryTaskController {

    private final StoryService storyService;

    public StoryTaskController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping("/{taskId}")
    public ApiResult<StoryTaskVO> getTask(@PathVariable Long taskId) {
        return ApiResult.success(storyService.getTask(taskId));
    }

    @PostMapping("/{taskId}/submit")
    public ApiResult<TaskSubmitVO> submitTask(@PathVariable Long taskId,
                                              @Valid @RequestBody TaskSubmitRequest request) {
        return ApiResult.success(storyService.submitTask(taskId, request));
    }
}
