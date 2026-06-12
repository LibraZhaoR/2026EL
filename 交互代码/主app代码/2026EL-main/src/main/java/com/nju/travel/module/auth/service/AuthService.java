package com.nju.travel.module.auth.service;

import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.module.auth.dto.RegisterRequest;
import com.nju.travel.module.auth.entity.UserAccount;
import com.nju.travel.module.auth.repository.UserAccountRepository;
import com.nju.travel.module.auth.vo.UserAccountVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserAccountRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserAccountVO register(RegisterRequest request) {
        if (userRepo.existsByEmail(request.email())) {
            throw new BusinessException(409, "该邮箱已注册");
        }

        String publicCode = generatePublicCode();
        while (userRepo.existsByPublicUserCode(publicCode)) {
            publicCode = generatePublicCode();
        }

        UserAccount account = new UserAccount();
        account.setEmail(request.email().toLowerCase().trim());
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.setNickname(request.nickname().trim());
        account.setPublicUserCode(publicCode);
        account.setStatus(UserAccount.AccountStatus.ACTIVE);
        account.setCreatedAt(LocalDateTime.now());

        account = userRepo.save(account);
        return toVO(account);
    }

    public UserAccountVO login(String email, String password) {
        UserAccount account = userRepo.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException(401, "账号或密码不正确"));

        if (!passwordEncoder.matches(password, account.getPasswordHash())) {
            throw new BusinessException(401, "账号或密码不正确");
        }

        if (account.getStatus() == UserAccount.AccountStatus.LOCKED ||
            account.getStatus() == UserAccount.AccountStatus.SUSPENDED) {
            throw new BusinessException(403, "账号已被冻结，请联系客服");
        }
        if (account.getStatus() == UserAccount.AccountStatus.DELETED) {
            throw new BusinessException(404, "账号已注销");
        }

        account.setLastLoginAt(LocalDateTime.now());
        userRepo.save(account);
        return toVO(account);
    }

    public UserAccountVO getCurrentUser(Long userId) {
        UserAccount account = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        return toVO(account);
    }

    @Transactional
    public UserAccountVO updateProfile(Long userId, String nickname, String bio, String interests, String travelPersona) {
        UserAccount account = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));

        if (nickname != null && !nickname.isBlank()) account.setNickname(nickname.trim());
        if (bio != null) account.setBio(bio.trim());
        if (interests != null) account.setInterests(interests.trim());
        if (travelPersona != null) account.setTravelPersona(travelPersona.trim());
        account.setOnboardingCompleted(true);
        account.setUpdatedAt(LocalDateTime.now());

        account = userRepo.save(account);
        return toVO(account);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        UserAccount account = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));

        if (!passwordEncoder.matches(oldPassword, account.getPasswordHash())) {
            throw new BusinessException(400, "当前密码不正确");
        }
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setUpdatedAt(LocalDateTime.now());
        userRepo.save(account);
    }

    private UserAccountVO toVO(UserAccount a) {
        return new UserAccountVO(
                a.getId(),
                a.getPublicUserCode(),
                a.getEmail() != null ? maskEmail(a.getEmail()) : null,
                a.getNickname(),
                a.getAvatarUrl(),
                a.getBio(),
                a.getInterests(),
                a.getTravelPersona(),
                a.isOnboardingCompleted(),
                a.getStatus().name(),
                a.getLastLoginAt(),
                a.getCreatedAt()
        );
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) return email;
        return email.charAt(0) + "***" + email.substring(at);
    }

    private String generatePublicCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder("NJW-");
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(rng.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
