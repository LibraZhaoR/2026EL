package com.nju.travel.module.auth.controller;

import com.nju.travel.common.AuthUtils;
import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.auth.dto.LoginRequest;
import com.nju.travel.module.auth.dto.RegisterRequest;
import com.nju.travel.module.auth.service.AuthService;
import com.nju.travel.module.auth.vo.UserAccountVO;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResult<UserAccountVO> register(@Valid @RequestBody RegisterRequest request, HttpSession session) {
        UserAccountVO user = authService.register(request);
        AuthUtils.login(session, user.id());
        return ApiResult.success(user);
    }

    @PostMapping("/login")
    public ApiResult<UserAccountVO> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        UserAccountVO user = authService.login(request.email(), request.password());
        AuthUtils.login(session, user.id());
        return ApiResult.success(user);
    }

    @GetMapping("/me")
    public ApiResult<?> me(HttpSession session) {
        Long userId = AuthUtils.getUserId(session);
        if (userId == null) {
            return ApiResult.fail(401, "未登录");
        }
        return ApiResult.success(authService.getCurrentUser(userId));
    }

    @PostMapping("/logout")
    public ApiResult<Void> logout(HttpSession session) {
        AuthUtils.logout(session);
        return ApiResult.success(null);
    }

    @PutMapping("/profile")
    public ApiResult<UserAccountVO> updateProfile(@RequestBody Map<String, String> body, HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        UserAccountVO user = authService.updateProfile(userId,
                body.get("nickname"),
                body.get("bio"),
                body.get("interests"),
                body.get("travelPersona")
        );
        return ApiResult.success(user);
    }

    @PostMapping("/change-password")
    public ApiResult<Void> changePassword(@RequestBody Map<String, String> body, HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        authService.changePassword(userId, body.get("oldPassword"), body.get("newPassword"));
        return ApiResult.success(null);
    }
}
