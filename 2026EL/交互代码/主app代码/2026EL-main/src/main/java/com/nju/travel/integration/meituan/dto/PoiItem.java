package com.nju.travel.integration.meituan.dto;

public record PoiItem(
        String storeId,
        String name,
        String address,
        Double latitude,
        Double longitude,
        String category,
        String phone,
        Double rating,
        Integer avgPrice,
        String imageUrl,
        String openTime,
        Integer distance
) {
}
