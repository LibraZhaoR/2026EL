package com.nju.travel.module.friend.vo;

import java.time.LocalDateTime;

public record FriendVO(
        Long userId,
        String nickname,
        String avatarUrl,
        String bio,
        String travelPersona,
        String publicUserCode
) {}

