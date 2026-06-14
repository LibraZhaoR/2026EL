package com.nju.travel.module.invite.vo;

import java.time.LocalDateTime;

public record InviteCardVO(
        Long inviteId,
        Long userId,
        Long routeId,
        String inviteCode,
        LocalDateTime meetTime,
        String meetPlace,
        Integer expectedCost,
        Integer peopleLimit,
        String shareUrl,
        String qrCodeText,
        String routeName
) {
}
