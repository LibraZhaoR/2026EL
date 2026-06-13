package com.nju.travel.module.homepage.controller;

import com.nju.travel.common.AuthUtils;
import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.homepage.service.HomepageService;
import com.nju.travel.module.homepage.vo.HomepageVO;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/homepage")
public class HomepageController {

    private final HomepageService homepageService;

    public HomepageController(HomepageService homepageService) {
        this.homepageService = homepageService;
    }

    @GetMapping
    public ApiResult<HomepageVO> getHomepage(@RequestParam(required = false) String persona,
                                              HttpSession session) {
        Long userId = AuthUtils.getUserId(session);
        // Fall back to 1 for anonymous browsing
        Long effectiveUserId = userId != null ? userId : 1L;
        return ApiResult.success(homepageService.getHomepage(effectiveUserId, persona));
    }
}
