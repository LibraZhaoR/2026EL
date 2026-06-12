package com.nju.travel.module.achievement.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.achievement.service.AchievementService;
import com.nju.travel.module.achievement.vo.AchievementVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping("/api/achievements")
    public ApiResult<List<AchievementVO>> listAchievements() {
        return ApiResult.success(achievementService.listAchievements());
    }

    @GetMapping("/api/users/{userId}/achievements")
    public ApiResult<List<AchievementVO>> userAchievements(@PathVariable Long userId) {
        return ApiResult.success(achievementService.userAchievements(userId));
    }
}
