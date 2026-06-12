package com.nju.travel.module.invite.service;

import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.module.invite.dto.InviteCardCreateRequest;
import com.nju.travel.module.invite.vo.InviteCardVO;
import com.nju.travel.module.route.service.RouteService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InviteService {

    private final AtomicLong inviteIdGenerator = new AtomicLong(4000);
    private final Map<String, InviteCardVO> inviteCards = new ConcurrentHashMap<>();
    private final RouteService routeService;
    private final String shareBaseUrl;

    public InviteService(RouteService routeService, @Value("${travel.share.base-url:https://example.com/invite/}") String shareBaseUrl) {
        this.routeService = routeService;
        this.shareBaseUrl = shareBaseUrl;
    }

    public InviteCardVO createInviteCard(InviteCardCreateRequest request) {
        routeService.getRouteDetail(request.routeId());
        String inviteCode = UUID.randomUUID().toString().substring(0, 8);
        String shareUrl = shareBaseUrl + inviteCode;
        InviteCardVO card = new InviteCardVO(
                inviteIdGenerator.incrementAndGet(),
                request.userId(),
                request.routeId(),
                inviteCode,
                request.meetTime(),
                request.meetPlace(),
                request.expectedCost(),
                request.peopleLimit(),
                shareUrl,
                shareUrl
        );
        inviteCards.put(inviteCode, card);
        return card;
    }

    public InviteCardVO getInviteCard(String inviteCode) {
        InviteCardVO card = inviteCards.get(inviteCode);
        if (card == null) {
            throw new BusinessException(404, "邀约卡不存在");
        }
        return card;
    }
}
