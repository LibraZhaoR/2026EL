package com.nju.travel.module.route.vo;

import java.util.List;

public record RouteVO(
        Long routeId,
        String title,
        String category,
        Integer durationMinutes,
        Integer budgetMin,
        Integer budgetMax,
        String crowdTags,
        String intensity,
        Boolean needReserve,
        String coverUrl,
        Boolean official,
        List<String> tags,
        Integer storyProgress
) {
}
