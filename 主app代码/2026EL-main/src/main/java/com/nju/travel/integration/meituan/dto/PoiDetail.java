package com.nju.travel.integration.meituan.dto;

import java.util.List;

public record PoiDetail(
        String storeId,
        String name,
        String address,
        Double latitude,
        Double longitude,
        String category,
        String phone,
        Double rating,
        Integer avgPrice,
        List<String> imageUrls,
        String openTime,
        String description,
        List<String> tags,
        Integer reviewCount
) {
}
