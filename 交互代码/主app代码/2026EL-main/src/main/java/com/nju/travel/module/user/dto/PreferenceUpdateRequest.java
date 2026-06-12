package com.nju.travel.module.user.dto;

import java.util.List;

public record PreferenceUpdateRequest(
        String roleType,
        String mood,
        List<String> interestTags,
        String persona
) {
}
