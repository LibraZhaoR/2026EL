package com.nju.travel.module.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_account")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String publicUserCode;

    @Column(unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 50)
    private String nickname;

    @Column(length = 255)
    private String avatarUrl;

    @Column(length = 200)
    private String bio;

    @Column(length = 100)
    private String interests; // comma-separated tags

    @Column(length = 30)
    private String travelPersona;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column
    private boolean onboardingCompleted = false;

    @Column
    private LocalDateTime lastLoginAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    public enum AccountStatus {
        PENDING_VERIFICATION, ACTIVE, LOCKED, SUSPENDED, DEACTIVATED, DELETED
    }

    public UserAccount() {}

    public UserAccount(String publicUserCode, String email, String passwordHash, String nickname) {
        this.publicUserCode = publicUserCode;
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.status = AccountStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPublicUserCode() { return publicUserCode; }
    public void setPublicUserCode(String publicUserCode) { this.publicUserCode = publicUserCode; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    public String getTravelPersona() { return travelPersona; }
    public void setTravelPersona(String travelPersona) { this.travelPersona = travelPersona; }
    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }
    public boolean isOnboardingCompleted() { return onboardingCompleted; }
    public void setOnboardingCompleted(boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
