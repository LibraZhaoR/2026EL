package com.nju.travel.module.homepage.vo;

import java.time.LocalDateTime;
import java.util.List;

public record CommunityReviewVO(
        String reviewId,
        String userName,
        String avatarUrl,
        String content,
        String poiName,
        String category,
        List<String> tags,
        Integer likeCount,
        LocalDateTime createdAt
) {
}
