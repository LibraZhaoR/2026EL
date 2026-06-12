package com.nju.travel.module.homepage.vo;

import com.nju.travel.integration.meituan.dto.PoiItem;
import com.nju.travel.module.route.vo.RouteVO;

import java.util.List;

public record HomepageVO(
        String persona,
        String personaDescription,
        List<PersonaOption> availablePersonas,
        List<PoiItem> merchants,
        List<RouteVO> routes,
        List<CommunityReviewVO> reviews
) {

    public record PersonaOption(String label, String description) {}
}
