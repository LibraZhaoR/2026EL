package com.nju.travel.module.auth.repository;

import com.nju.travel.module.auth.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByPublicUserCode(String publicUserCode);
    boolean existsByEmail(String email);
    boolean existsByPublicUserCode(String publicUserCode);
}
