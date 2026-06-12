package com.nju.travel.module.exhibition.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.exhibition.service.ExhibitionService;
import com.nju.travel.module.exhibition.vo.ExhibitionVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exhibitions")
public class ExhibitionController {

    private final ExhibitionService exhibitionService;

    public ExhibitionController(ExhibitionService exhibitionService) {
        this.exhibitionService = exhibitionService;
    }

    @GetMapping
    public ApiResult<List<ExhibitionVO>> listExhibitions() {
        return ApiResult.success(exhibitionService.listExhibitions());
    }

    @GetMapping("/{exhibitionId}")
    public ApiResult<ExhibitionVO> getExhibition(@PathVariable Long exhibitionId) {
        return ApiResult.success(exhibitionService.getExhibition(exhibitionId));
    }
}
