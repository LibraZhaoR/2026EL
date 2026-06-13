package com.nju.travel.module.auth.repository;

import com.nju.travel.module.auth.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByPublicUserCode(String publicUserCode);
    boolean existsByEmail(String email);
    boolean existsByPublicUserCode(String publicUserCode);

    @Query("SELECT u FROM UserAccount u WHERE LOWER(u.nickname) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.publicUserCode) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY u.nickname ASC")
    List<UserAccount> findByNicknameContainingOrPublicUserCodeContaining(@Param("q") String q1, @Param("q") String q2);

    @Query("SELECT u FROM UserAccount u WHERE u.id <> :excludeId AND (LOWER(u.nickname) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.publicUserCode) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY u.nickname ASC")
    List<UserAccount> searchUsersExcluding(@Param("q") String q, @Param("excludeId") Long excludeId);
}
