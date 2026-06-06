package com.nju.travel.module.invite.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.invite.dto.InviteCardCreateRequest;
import com.nju.travel.module.invite.service.InviteService;
import com.nju.travel.module.invite.vo.InviteCardVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invites")
public class InviteController {

    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    @PostMapping("/cards")
    public ApiResult<InviteCardVO> createInviteCard(@Valid @RequestBody InviteCardCreateRequest request) {
        return ApiResult.success(inviteService.createInviteCard(request));
    }

    @GetMapping("/{inviteCode}")
    public ApiResult<InviteCardVO> getInviteCard(@PathVariable String inviteCode) {
        return ApiResult.success(inviteService.getInviteCard(inviteCode));
    }
}
