package com.nju.travel.module.exhibition.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.exhibition.dto.ReserveRemindCreateRequest;
import com.nju.travel.module.exhibition.service.ExhibitionService;
import com.nju.travel.module.exhibition.vo.ReserveRemindVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reserve-reminds")
public class ReserveRemindController {

    private final ExhibitionService exhibitionService;

    public ReserveRemindController(ExhibitionService exhibitionService) {
        this.exhibitionService = exhibitionService;
    }

    @PostMapping
    public ApiResult<ReserveRemindVO> createRemind(@Valid @RequestBody ReserveRemindCreateRequest request) {
        return ApiResult.success(exhibitionService.createRemind(request));
    }

    @DeleteMapping("/{remindId}")
    public ApiResult<ReserveRemindVO> cancelRemind(@PathVariable Long remindId) {
        return ApiResult.success(exhibitionService.cancelRemind(remindId));
    }
}
