package com.nju.travel.module.meituan;

import com.nju.travel.common.annotation.RateLimit;
import com.nju.travel.common.result.ApiResult;
import com.nju.travel.integration.meituan.dto.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meituan")
@RateLimit(key = "meituan", maxRequests = 30, duration = 1, message = "美团接口请求过于频繁，请稍后再试")
public class MeituanController {

    private final MeituanService meituanService;

    public MeituanController(MeituanService meituanService) {
        this.meituanService = meituanService;
    }

    @GetMapping("/poi/search")
    public ApiResult<List<PoiItem>> searchPoi(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        return ApiResult.success(meituanService.searchNearby(lat, lng, keyword, category));
    }

    @GetMapping("/poi/detail/{storeId}")
    public ApiResult<PoiDetail> getDetail(@PathVariable String storeId) {
        return ApiResult.success(meituanService.getDetail(storeId));
    }

    @GetMapping("/deals")
    public ApiResult<List<DealItem>> searchDeals(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) String category) {
        return ApiResult.success(meituanService.searchDeals(lat, lng, category));
    }
}
