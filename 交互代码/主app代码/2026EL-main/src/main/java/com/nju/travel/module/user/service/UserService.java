package com.nju.travel.module.user.service;

import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.module.user.dto.LoginRequest;
import com.nju.travel.module.user.dto.PreferenceUpdateRequest;
import com.nju.travel.module.user.vo.UserVO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class UserService {

    private final AtomicLong userIdGenerator = new AtomicLong(1000);
    private final Map<Long, UserVO> users = new ConcurrentHashMap<>();

    public UserVO login(LoginRequest request) {
        Long userId = userIdGenerator.incrementAndGet();
        UserVO user = new UserVO(
                userId,
                request.nickname(),
                request.avatarUrl(),
                "NJU_FRESHMAN",
                "CURIOUS",
                new ArrayList<>(List.of("南京", "校史", "展览")),
                LocalDateTime.now()
        );
        users.put(userId, user);
        return user;
    }

    public UserVO getUser(Long userId) {
        UserVO user = users.get(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return user;
    }

    public UserVO updatePreferences(Long userId, PreferenceUpdateRequest request) {
        UserVO old = getUser(userId);
        UserVO updated = new UserVO(
                old.userId(),
                old.nickname(),
                old.avatarUrl(),
                request.roleType(),
                request.mood(),
                request.interestTags() == null ? List.of() : request.interestTags(),
                old.createdAt()
        );
        users.put(userId, updated);
        return updated;
    }
}
