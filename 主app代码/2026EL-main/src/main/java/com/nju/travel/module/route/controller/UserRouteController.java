package com.nju.travel.module.route.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.route.dto.UserRouteCreateRequest;
import com.nju.travel.module.route.service.RouteService;
import com.nju.travel.module.route.vo.UserRouteVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-routes")
public class UserRouteController {

    private final RouteService routeService;

    public UserRouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping
    public ApiResult<UserRouteVO> createUserRoute(@Valid @RequestBody UserRouteCreateRequest request) {
        return ApiResult.success(routeService.createUserRoute(request));
    }

    @PostMapping("/{routeId}/copy")
    public ApiResult<UserRouteVO> copyRoute(@PathVariable Long routeId, @RequestParam Long userId) {
        return ApiResult.success(routeService.copyRoute(routeId, userId));
    }
}
