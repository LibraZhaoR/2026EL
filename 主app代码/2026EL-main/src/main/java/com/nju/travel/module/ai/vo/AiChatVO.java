package com.nju.travel.module.ai.vo;

public record AiChatVO(
        String sessionId,
        String role,
        String content,
        String provider
) {
}
