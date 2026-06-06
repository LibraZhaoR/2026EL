package com.nju.travel.integration.meituan.dto;

public record PoiSearchRequest(
        String keyword,
        Double latitude,
        Double longitude,
        Integer radius,
        Integer pageNum,
        Integer pageSize,
        String category
) {
    public PoiSearchRequest {
        if (radius == null) radius = 3000;
        if (pageNum == null) pageNum = 1;
        if (pageSize == null) pageSize = 20;
    }

    public static PoiSearchRequest nearby(Double lat, Double lng, String keyword) {
        return new PoiSearchRequest(keyword, lat, lng, 3000, 1, 20, null);
    }
}
