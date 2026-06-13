package com.nju.travel.module.friend.vo;

import java.time.LocalDateTime;

public record FriendRequestVO(
        Long id,
        Long fromUserId,
        String fromUserNickname,
        String fromUserAvatar,
        Long toUserId,
        String toUserNickname,
        String message,
        String status,
        LocalDateTime createdAt
) {}

