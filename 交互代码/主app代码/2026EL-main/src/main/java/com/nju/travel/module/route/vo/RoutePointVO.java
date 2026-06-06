package com.nju.travel.module.route.vo;

public record RoutePointVO(
        Long pointId,
        String name,
        String address,
        Integer sortOrder,
        String intro,
        String historyStory,
        Double latitude,
        Double longitude
) {
}
