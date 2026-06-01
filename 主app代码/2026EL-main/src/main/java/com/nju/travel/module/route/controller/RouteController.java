package com.nju.travel.module.route.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.common.result.PageResult;
import com.nju.travel.module.route.dto.RouteRecommendRequest;
import com.nju.travel.module.route.service.RouteService;
import com.nju.travel.module.route.vo.RouteDetailVO;
import com.nju.travel.module.route.vo.RouteVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public ApiResult<PageResult<RouteVO>> listRoutes(@RequestParam(required = false) String category,
                                                     @RequestParam(required = false) Integer durationMinutes,
                                                     @RequestParam(required = false) Integer budgetMax,
                                                     @RequestParam(required = false) String tag,
                                                     @RequestParam(defaultValue = "1") Integer page,
                                                     @RequestParam(defaultValue = "10") Integer size) {
        return ApiResult.success(routeService.listRoutes(category, durationMinutes, budgetMax, tag, page, size));
    }

    @GetMapping("/{routeId}")
    public ApiResult<RouteDetailVO> getRouteDetail(@PathVariable Long routeId) {
        return ApiResult.success(routeService.getRouteDetail(routeId));
    }

    @PostMapping("/recommend")
    public ApiResult<List<RouteVO>> recommend(@RequestBody RouteRecommendRequest request) {
        return ApiResult.success(routeService.recommend(request));
    }

    @GetMapping("/popular-copies")
    public ApiResult<List<RouteVO>> popularCopies() {
        return ApiResult.success(routeService.popularCopies());
    }
}
