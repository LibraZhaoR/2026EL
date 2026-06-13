package com.nju.travel.module.chat.repository;

import com.nju.travel.module.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationKeyOrderByCreatedAtAsc(String conversationKey);

    @Query("SELECT m FROM ChatMessage m WHERE (m.senderId = :userId OR m.receiverId = :userId) AND m.id IN (SELECT MAX(m2.id) FROM ChatMessage m2 WHERE m2.conversationKey = m.conversationKey) ORDER BY m.createdAt DESC")
    List<ChatMessage> findLatestMessagesForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiverId = :userId AND m.read = false")
    long countUnreadMessages(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.read = true WHERE m.conversationKey = :key AND m.receiverId = :userId AND m.read = false")
    void markConversationRead(@Param("key") String conversationKey, @Param("userId") Long userId);
}
