package com.nju.travel.module.ai.service;

import com.nju.travel.module.ai.dto.AiChatRequest;
import com.nju.travel.module.ai.dto.AiRoutePlanRequest;
import com.nju.travel.module.ai.vo.AiChatVO;
import com.nju.travel.integration.ai.AiClient;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AiService {

    private final AiClient aiClient;

    public AiService(AiClient aiClient) {
        this.aiClient = aiClient;
    }

    public AiChatVO chat(AiChatRequest request) {
        String sessionId = request.sessionId() == null ? UUID.randomUUID().toString() : request.sessionId();
        String role = request.guideRole() == null ? "二次元城市向导" : request.guideRole();
        String prompt = "角色=" + role + "，路线=" + request.routeId() + "，点位=" + request.pointId() + "，用户问题=" + request.message();
        return new AiChatVO(sessionId, role, aiClient.chat(prompt), "mock");
    }

    public AiChatVO routePlan(AiRoutePlanRequest request) {
        String prompt = "请按时长=" + request.durationMinutes() + "分钟，预算=" + request.budgetMax() + "元，规划南京路线。用户补充：" + request.userText();
        return new AiChatVO(UUID.randomUUID().toString(), "AI路线规划师", aiClient.chat(prompt), "mock");
    }
}
