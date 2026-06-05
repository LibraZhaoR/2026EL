package com.nju.travel.integration.meituan.dto;

public record DealSearchRequest(
        Double latitude,
        Double longitude,
        Integer radius,
        Integer pageNum,
        Integer pageSize,
        String category
) {
    public DealSearchRequest {
        if (radius == null) radius = 3000;
        if (pageNum == null) pageNum = 1;
        if (pageSize == null) pageSize = 20;
    }
}
