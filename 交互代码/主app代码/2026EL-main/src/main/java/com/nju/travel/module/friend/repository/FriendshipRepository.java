package com.nju.travel.module.friend.repository;

import com.nju.travel.module.friend.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    boolean existsByFromUserIdAndToUserIdAndStatus(Long fromUserId, Long toUserId, Friendship.FriendshipStatus status);

    Optional<Friendship> findByFromUserIdAndToUserId(Long fromUserId, Long toUserId);

    @Query("SELECT f FROM Friendship f WHERE f.toUserId = :userId AND f.status = 'PENDING'")
    List<Friendship> findPendingRequestsForUser(@Param("userId") Long userId);

    @Query("SELECT f FROM Friendship f WHERE (f.fromUserId = :userId OR f.toUserId = :userId) AND f.status = 'ACCEPTED'")
    List<Friendship> findAcceptedFriendships(@Param("userId") Long userId);

    @Query("SELECT f FROM Friendship f WHERE (f.fromUserId = :userId1 AND f.toUserId = :userId2) OR (f.fromUserId = :userId2 AND f.toUserId = :userId1)")
    List<Friendship> findBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
