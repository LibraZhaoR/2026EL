package com.nju.travel.module.exhibition.vo;

public record ExhibitionVO(
        Long exhibitionId,
        String name,
        String venue,
        String address,
        String openTime,
        String reserveRule,
        String reserveUrl,
        String releaseTime,
        String coverUrl
) {
}
