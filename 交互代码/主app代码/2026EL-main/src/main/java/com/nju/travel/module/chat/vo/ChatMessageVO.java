package com.nju.travel.module.chat.vo;

import java.time.LocalDateTime;

public record ChatMessageVO(
        Long id,
        Long senderId,
        String senderNickname,
        Long receiverId,
        String content,
        String conversationKey,
        boolean read,
        LocalDateTime createdAt
) {}

