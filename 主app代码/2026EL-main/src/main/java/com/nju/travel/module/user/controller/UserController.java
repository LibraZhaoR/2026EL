package com.nju.travel.module.user.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.user.dto.LoginRequest;
import com.nju.travel.module.user.dto.PreferenceUpdateRequest;
import com.nju.travel.module.user.service.UserService;
import com.nju.travel.module.user.vo.UserVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ApiResult<UserVO> login(@Valid @RequestBody LoginRequest request) {
        return ApiResult.success(userService.login(request));
    }

    @GetMapping("/{userId}")
    public ApiResult<UserVO> getUser(@PathVariable Long userId) {
        return ApiResult.success(userService.getUser(userId));
    }

    @PutMapping("/{userId}/preferences")
    public ApiResult<UserVO> updatePreferences(@PathVariable Long userId,
                                               @RequestBody PreferenceUpdateRequest request) {
        return ApiResult.success(userService.updatePreferences(userId, request));
    }
}
