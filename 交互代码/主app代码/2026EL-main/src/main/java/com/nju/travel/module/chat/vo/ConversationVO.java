package com.nju.travel.module.chat.vo;

import java.time.LocalDateTime;

public record ConversationVO(
        Long otherUserId,
        String otherUserNickname,
        String otherUserAvatar,
        String lastMessage,
        LocalDateTime lastMessageTime,
        long unreadCount
) {}

