package com.nju.travel.module.friend.service;

import com.nju.travel.common.AuthUtils;
import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.module.auth.entity.UserAccount;
import com.nju.travel.module.auth.repository.UserAccountRepository;
import com.nju.travel.module.friend.entity.Friendship;
import com.nju.travel.module.friend.repository.FriendshipRepository;
import com.nju.travel.module.friend.vo.FriendRequestVO;
import com.nju.travel.module.friend.vo.FriendVO;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FriendService {

    private final FriendshipRepository friendshipRepo;
    private final UserAccountRepository userRepo;

    public FriendService(FriendshipRepository friendshipRepo, UserAccountRepository userRepo) {
        this.friendshipRepo = friendshipRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public FriendRequestVO sendRequest(HttpSession session, Long toUserId, String message) {
        Long fromUserId = AuthUtils.requireUserId(session);
        if (fromUserId.equals(toUserId)) {
            throw new BusinessException(400, "不能添加自己为好友");
        }
        if (!userRepo.existsById(toUserId)) {
            throw new BusinessException(404, "用户不存在");
        }
        if (friendshipRepo.existsByFromUserIdAndToUserIdAndStatus(fromUserId, toUserId, Friendship.FriendshipStatus.PENDING)) {
            throw new BusinessException(409, "已有待处理的好友申请");
        }
        // Check if already friends
        List<Friendship> existing = friendshipRepo.findBetweenUsers(fromUserId, toUserId);
        boolean alreadyFriend = existing.stream().anyMatch(f -> f.getStatus() == Friendship.FriendshipStatus.ACCEPTED);
        if (alreadyFriend) {
            throw new BusinessException(409, "已经是好友了");
        }

        Friendship f = new Friendship(fromUserId, toUserId, message != null ? message : "你好，一起探索南京！");
        f = friendshipRepo.save(f);
        return toRequestVO(f, userRepo);
    }

    @Transactional
    public FriendRequestVO acceptRequest(HttpSession session, Long requestId) {
        Long userId = AuthUtils.requireUserId(session);
        Friendship f = friendshipRepo.findById(requestId)
                .orElseThrow(() -> new BusinessException(404, "申请不存在"));
        if (!f.getToUserId().equals(userId)) {
            throw new BusinessException(403, "无权操作");
        }
        if (f.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new BusinessException(400, "申请已处理");
        }
        f.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        f.setUpdatedAt(LocalDateTime.now());
        f = friendshipRepo.save(f);
        return toRequestVO(f, userRepo);
    }

    @Transactional
    public FriendRequestVO rejectRequest(HttpSession session, Long requestId) {
        Long userId = AuthUtils.requireUserId(session);
        Friendship f = friendshipRepo.findById(requestId)
                .orElseThrow(() -> new BusinessException(404, "申请不存在"));
        if (!f.getToUserId().equals(userId)) {
            throw new BusinessException(403, "无权操作");
        }
        if (f.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new BusinessException(400, "申请已处理");
        }
        f.setStatus(Friendship.FriendshipStatus.REJECTED);
        f.setUpdatedAt(LocalDateTime.now());
        f = friendshipRepo.save(f);
        return toRequestVO(f, userRepo);
    }

    public List<FriendVO> getFriends(HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        List<Friendship> friendships = friendshipRepo.findAcceptedFriendships(userId);
        List<Long> friendIds = new ArrayList<>();
        for (Friendship f : friendships) {
            if (f.getFromUserId().equals(userId)) {
                friendIds.add(f.getToUserId());
            } else {
                friendIds.add(f.getFromUserId());
            }
        }
        if (friendIds.isEmpty()) return List.of();
        Map<Long, UserAccount> users = userRepo.findAllById(friendIds).stream()
                .collect(Collectors.toMap(UserAccount::getId, u -> u));
        return friendIds.stream()
                .map(id -> {
                    UserAccount u = users.get(id);
                    return u != null ? toFriendVO(u) : null;
                })
                .filter(v -> v != null)
                .collect(Collectors.toList());
    }

    public List<FriendRequestVO> getPendingRequests(HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        List<Friendship> pending = friendshipRepo.findPendingRequestsForUser(userId);
        return pending.stream().map(f -> toRequestVO(f, userRepo)).collect(Collectors.toList());
    }

    public List<UserAccount> searchUsers(HttpSession session, String query) {
        AuthUtils.requireUserId(session);
        if (query == null || query.isBlank() || query.length() < 1) {
            return List.of();
        }
        return userRepo.findByNicknameContainingOrPublicUserCodeContaining(query.trim(), query.trim());
    }

    @Transactional
    public void blockUser(HttpSession session, Long targetUserId) {
        Long userId = AuthUtils.requireUserId(session);
        List<Friendship> existing = friendshipRepo.findBetweenUsers(userId, targetUserId);
        Friendship f;
        if (existing.isEmpty()) {
            f = new Friendship(userId, targetUserId, null);
        } else {
            f = existing.get(0);
        }
        f.setStatus(Friendship.FriendshipStatus.BLOCKED);
        f.setUpdatedAt(LocalDateTime.now());
        friendshipRepo.save(f);
    }

    @Transactional
    public void unblockUser(HttpSession session, Long targetUserId) {
        Long userId = AuthUtils.requireUserId(session);
        List<Friendship> existing = friendshipRepo.findBetweenUsers(userId, targetUserId);
        for (Friendship f : existing) {
            if (f.getStatus() == Friendship.FriendshipStatus.BLOCKED && f.getFromUserId().equals(userId)) {
                friendshipRepo.delete(f);
            }
        }
    }

    private FriendVO toFriendVO(UserAccount u) {
        return new FriendVO(u.getId(), u.getNickname(), u.getAvatarUrl(), u.getBio(), u.getTravelPersona(), u.getPublicUserCode());
    }

    private FriendRequestVO toRequestVO(Friendship f, UserAccountRepository userRepo) {
        String fromNick = null, fromAvatar = null, toNick = null;
        UserAccount fromUser = userRepo.findById(f.getFromUserId()).orElse(null);
        if (fromUser != null) {
            fromNick = fromUser.getNickname();
            fromAvatar = fromUser.getAvatarUrl();
        }
        UserAccount toUser = userRepo.findById(f.getToUserId()).orElse(null);
        if (toUser != null) {
            toNick = toUser.getNickname();
        }
        return new FriendRequestVO(f.getId(), f.getFromUserId(), fromNick, fromAvatar,
                f.getToUserId(), toNick, f.getMessage(), f.getStatus().name(), f.getCreatedAt());
    }
}
