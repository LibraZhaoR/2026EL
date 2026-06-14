package com.nju.travel.module.invite.service;

import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.module.invite.dto.InviteCardCreateRequest;
import com.nju.travel.module.invite.vo.InviteCardVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InviteService {

    private final AtomicLong inviteIdGenerator = new AtomicLong(4000);
    private final Map<String, InviteCardVO> inviteCards = new ConcurrentHashMap<>();
    private final String shareBaseUrl;

    public InviteService(@Value("${travel.share.base-url:https://example.com/invite/}") String shareBaseUrl) {
        this.shareBaseUrl = shareBaseUrl;
    }

    public InviteCardVO createInviteCard(InviteCardCreateRequest request) {
        // 生成6位易读乱码：大写字母+数字，排除易混淆字符
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt((int)(Math.random() * chars.length())));
        }
        String inviteCode = sb.toString();
        String shareUrl = shareBaseUrl + inviteCode;
        String routeName = request.routeName() != null ? request.routeName() : "";
        InviteCardVO card = new InviteCardVO(
                inviteIdGenerator.incrementAndGet(),
                request.userId(),
                null,  // routeId no longer required
                inviteCode,
                request.meetTime(),
                request.meetPlace(),
                request.expectedCost(),
                request.peopleLimit(),
                shareUrl,
                shareUrl,
                routeName
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
