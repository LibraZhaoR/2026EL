package com.nju.travel.module.ai.controller;

import com.nju.travel.common.annotation.RateLimit;
import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.ai.dto.AiChatRequest;
import com.nju.travel.module.ai.dto.AiRoutePlanRequest;
import com.nju.travel.module.ai.service.AiService;
import com.nju.travel.module.ai.vo.AiChatVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RateLimit(key = "ai", maxRequests = 20, duration = 1, message = "AI 接口请求过于频繁，请稍后再试")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ApiResult<AiChatVO> chat(@RequestBody AiChatRequest request) {
        return ApiResult.success(aiService.chat(request));
    }

    @PostMapping("/route-plan")
    public ApiResult<AiChatVO> routePlan(@RequestBody AiRoutePlanRequest request) {
        return ApiResult.success(aiService.routePlan(request));
    }
}
