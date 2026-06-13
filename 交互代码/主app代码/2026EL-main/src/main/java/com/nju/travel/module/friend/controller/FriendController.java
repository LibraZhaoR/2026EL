package com.nju.travel.module.friend.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.auth.entity.UserAccount;
import com.nju.travel.module.friend.service.FriendService;
import com.nju.travel.module.friend.vo.FriendRequestVO;
import com.nju.travel.module.friend.vo.FriendVO;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friend")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @PostMapping("/request")
    public ApiResult<FriendRequestVO> sendRequest(@RequestBody Map<String, Object> body, HttpSession session) {
        Long toUserId = Long.valueOf(body.get("toUserId").toString());
        String message = body.get("message") != null ? body.get("message").toString() : null;
        return ApiResult.success(friendService.sendRequest(session, toUserId, message));
    }

    @PutMapping("/accept/{id}")
    public ApiResult<FriendRequestVO> acceptRequest(@PathVariable Long id, HttpSession session) {
        return ApiResult.success(friendService.acceptRequest(session, id));
    }

    @PutMapping("/reject/{id}")
    public ApiResult<FriendRequestVO> rejectRequest(@PathVariable Long id, HttpSession session) {
        return ApiResult.success(friendService.rejectRequest(session, id));
    }

    @GetMapping("/list")
    public ApiResult<List<FriendVO>> getFriends(HttpSession session) {
        return ApiResult.success(friendService.getFriends(session));
    }

    @GetMapping("/requests/pending")
    public ApiResult<List<FriendRequestVO>> getPendingRequests(HttpSession session) {
        return ApiResult.success(friendService.getPendingRequests(session));
    }

    @GetMapping("/search")
    public ApiResult<?> searchUsers(@RequestParam String q, HttpSession session) {
        List<UserAccount> users = friendService.searchUsers(session, q);
        return ApiResult.success(users.stream().map(u -> Map.of(
                "id", u.getId(),
                "nickname", u.getNickname() != null ? u.getNickname() : "",
                "publicUserCode", u.getPublicUserCode(),
                "bio", u.getBio() != null ? u.getBio() : "",
                "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "",
                "travelPersona", u.getTravelPersona() != null ? u.getTravelPersona() : ""
        )).collect(Collectors.toList()));
    }

    @PostMapping("/block/{userId}")
    public ApiResult<Void> blockUser(@PathVariable Long userId, HttpSession session) {
        friendService.blockUser(session, userId);
        return ApiResult.success(null);
    }

    @DeleteMapping("/block/{userId}")
    public ApiResult<Void> unblockUser(@PathVariable Long userId, HttpSession session) {
        friendService.unblockUser(session, userId);
        return ApiResult.success(null);
    }
}
