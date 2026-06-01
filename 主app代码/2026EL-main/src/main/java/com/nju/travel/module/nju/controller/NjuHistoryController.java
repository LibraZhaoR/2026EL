package com.nju.travel.module.nju.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.nju.service.NjuHistoryService;
import com.nju.travel.module.route.vo.RouteDetailVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/nju")
public class NjuHistoryController {

    private final NjuHistoryService njuHistoryService;

    public NjuHistoryController(NjuHistoryService njuHistoryService) {
        this.njuHistoryService = njuHistoryService;
    }

    @GetMapping("/history-route")
    public ApiResult<RouteDetailVO> getHistoryRoute() {
        return ApiResult.success(njuHistoryService.getHistoryRoute());
    }

    @GetMapping("/timeline")
    public ApiResult<List<NjuHistoryService.TimelineItem>> timeline() {
        return ApiResult.success(njuHistoryService.timeline());
    }
}
