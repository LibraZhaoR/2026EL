package com.nju.travel.module.route.vo;

import java.util.List;

public record RouteDetailVO(
        RouteVO route,
        String storyTitle,
        List<RoutePointVO> points
) {
}
