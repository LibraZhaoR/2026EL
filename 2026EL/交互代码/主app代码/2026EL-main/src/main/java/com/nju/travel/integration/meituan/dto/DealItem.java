package com.nju.travel.integration.meituan.dto;

public record DealItem(
        String dealId,
        String title,
        String storeName,
        Double price,
        Double originalPrice,
        String imageUrl,
        Integer soldCount,
        String category
) {
}
