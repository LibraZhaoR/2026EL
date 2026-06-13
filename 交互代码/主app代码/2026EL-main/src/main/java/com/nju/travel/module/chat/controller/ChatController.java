package com.nju.travel.module.chat.controller;

import com.nju.travel.common.result.ApiResult;
import com.nju.travel.module.chat.service.ChatService;
import com.nju.travel.module.chat.vo.ChatMessageVO;
import com.nju.travel.module.chat.vo.ConversationVO;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/send")
    public ApiResult<ChatMessageVO> send(@RequestBody Map<String, Object> body, HttpSession session) {
        Long receiverId = Long.valueOf(body.get("receiverId").toString());
        String content = body.get("content").toString();
        return ApiResult.success(chatService.sendMessage(session, receiverId, content));
    }

    @GetMapping("/messages/{userId}")
    public ApiResult<List<ChatMessageVO>> getMessages(@PathVariable Long userId, HttpSession session) {
        return ApiResult.success(chatService.getMessages(session, userId));
    }

    @GetMapping("/conversations")
    public ApiResult<List<ConversationVO>> getConversations(HttpSession session) {
        return ApiResult.success(chatService.getConversations(session));
    }

    @PutMapping("/read/{userId}")
    public ApiResult<Void> markRead(@PathVariable Long userId, HttpSession session) {
        chatService.markRead(session, userId);
        return ApiResult.success(null);
    }
}
