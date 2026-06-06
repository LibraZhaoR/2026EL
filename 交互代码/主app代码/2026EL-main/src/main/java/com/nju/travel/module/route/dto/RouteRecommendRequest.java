package com.nju.travel.module.route.dto;

import java.util.List;

public record RouteRecommendRequest(
        Integer durationMinutes,
        String mood,
        String crowdType,
        Integer budgetMax,
        List<String> interestTags
) {
}
