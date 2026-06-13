package com.nju.travel.module.route.controller;

import com.nju.travel.common.AuthUtils;
import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.route.dto.UserRouteCreateRequest;
import com.nju.travel.module.route.service.RouteService;
import com.nju.travel.module.route.vo.UserRouteVO;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-routes")
public class UserRouteController {

    private final RouteService routeService;

    public UserRouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping
    public ApiResult<UserRouteVO> createUserRoute(@Valid @RequestBody UserRouteCreateRequest request,
                                                   HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        return ApiResult.success(routeService.createUserRoute(userId, request));
    }

    @PostMapping("/{routeId}/copy")
    public ApiResult<UserRouteVO> copyRoute(@PathVariable Long routeId, HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        return ApiResult.success(routeService.copyRoute(routeId, userId));
    }

    @GetMapping
    public ApiResult<List<UserRouteVO>> listUserRoutes(HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        return ApiResult.success(routeService.listUserRoutes(userId));
    }

    @GetMapping("/{userRouteId}/detail")
    public ApiResult<com.nju.travel.module.route.vo.UserRouteDetailVO> getUserRouteDetail(
            @PathVariable Long userRouteId) {
        return ApiResult.success(routeService.getUserRouteDetail(userRouteId));
    }

    @DeleteMapping("/{userRouteId}")
    public ApiResult<Void> deleteUserRoute(@PathVariable Long userRouteId, HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        routeService.deleteUserRoute(userRouteId, userId);
        return ApiResult.success(null);
    }
}
