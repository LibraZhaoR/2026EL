package com.nju.travel.module.ai.controller;

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
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ApiResult<AiChatVO> chat(@Valid @RequestBody AiChatRequest request) {
        return ApiResult.success(aiService.chat(request));
    }

    @PostMapping("/route-plan")
    public ApiResult<AiChatVO> routePlan(@Valid @RequestBody AiRoutePlanRequest request) {
        return ApiResult.success(aiService.routePlan(request));
    }
}
