package com.nju.travel.module.chat.service;

import com.nju.travel.common.AuthUtils;
import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.module.auth.entity.UserAccount;
import com.nju.travel.module.auth.repository.UserAccountRepository;
import com.nju.travel.module.chat.entity.ChatMessage;
import com.nju.travel.module.chat.repository.ChatMessageRepository;
import com.nju.travel.module.chat.vo.ChatMessageVO;
import com.nju.travel.module.chat.vo.ConversationVO;
import com.nju.travel.module.friend.entity.Friendship;
import com.nju.travel.module.friend.repository.FriendshipRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository messageRepo;
    private final UserAccountRepository userRepo;
    private final FriendshipRepository friendshipRepo;

    public ChatService(ChatMessageRepository messageRepo, UserAccountRepository userRepo, FriendshipRepository friendshipRepo) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.friendshipRepo = friendshipRepo;
    }

    @Transactional
    public ChatMessageVO sendMessage(HttpSession session, Long receiverId, String content) {
        Long senderId = AuthUtils.requireUserId(session);
        if (senderId.equals(receiverId)) {
            throw new BusinessException(400, "不能给自己发消息");
        }
        if (content == null || content.isBlank()) {
            throw new BusinessException(400, "消息不能为空");
        }
        if (!userRepo.existsById(receiverId)) {
            throw new BusinessException(404, "用户不存在");
        }

        // Check if they are friends (or have accepted relationship)
        List<Friendship> relations = friendshipRepo.findBetweenUsers(senderId, receiverId);
        boolean canChat = relations.stream().anyMatch(f ->
            f.getStatus() == Friendship.FriendshipStatus.ACCEPTED);
        if (!canChat) {
            throw new BusinessException(403, "需要先成为好友才能聊天");
        }

        String convKey = ChatMessage.conversationKey(senderId, receiverId);
        ChatMessage msg = new ChatMessage(senderId, receiverId, content, convKey);
        msg = messageRepo.save(msg);

        UserAccount sender = userRepo.findById(senderId).orElse(null);
        return new ChatMessageVO(msg.getId(), msg.getSenderId(),
                sender != null ? sender.getNickname() : "未知",
                msg.getReceiverId(), msg.getContent(),
                msg.getConversationKey(), msg.isRead(), msg.getCreatedAt());
    }

    public List<ChatMessageVO> getMessages(HttpSession session, Long otherUserId) {
        Long userId = AuthUtils.requireUserId(session);
        String convKey = ChatMessage.conversationKey(userId, otherUserId);
        List<ChatMessage> messages = messageRepo.findByConversationKeyOrderByCreatedAtAsc(convKey);

        Set<Long> userIds = new HashSet<>();
        messages.forEach(m -> { userIds.add(m.getSenderId()); userIds.add(m.getReceiverId()); });
        Map<Long, UserAccount> users = userRepo.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserAccount::getId, u -> u));

        return messages.stream().map(m -> {
            UserAccount s = users.get(m.getSenderId());
            return new ChatMessageVO(m.getId(), m.getSenderId(),
                    s != null ? s.getNickname() : "未知",
                    m.getReceiverId(), m.getContent(),
                    m.getConversationKey(), m.isRead(), m.getCreatedAt());
        }).collect(Collectors.toList());
    }

    public List<ConversationVO> getConversations(HttpSession session) {
        Long userId = AuthUtils.requireUserId(session);
        List<ChatMessage> latest = messageRepo.findLatestMessagesForUser(userId);

        Set<Long> otherUserIds = new HashSet<>();
        Map<String, Long> unreadMap = new HashMap<>();
        for (ChatMessage m : latest) {
            Long otherId = m.getSenderId().equals(userId) ? m.getReceiverId() : m.getSenderId();
            otherUserIds.add(otherId);
            if (m.getSenderId().equals(otherId) && !m.isRead()) {
                unreadMap.merge(m.getConversationKey(), 1L, Long::sum);
            }
        }

        Map<Long, UserAccount> users = userRepo.findAllById(otherUserIds).stream()
                .collect(Collectors.toMap(UserAccount::getId, u -> u));

        return latest.stream().map(m -> {
            Long otherId = m.getSenderId().equals(userId) ? m.getReceiverId() : m.getSenderId();
            UserAccount u = users.get(otherId);
            return new ConversationVO(otherId,
                    u != null ? u.getNickname() : "未知",
                    u != null ? u.getAvatarUrl() : null,
                    m.getContent(),
                    m.getCreatedAt(),
                    unreadMap.getOrDefault(m.getConversationKey(), 0L));
        }).collect(Collectors.toList());
    }

    @Transactional
    public void markRead(HttpSession session, Long otherUserId) {
        Long userId = AuthUtils.requireUserId(session);
        String convKey = ChatMessage.conversationKey(userId, otherUserId);
        messageRepo.markConversationRead(convKey, userId);
    }
}
