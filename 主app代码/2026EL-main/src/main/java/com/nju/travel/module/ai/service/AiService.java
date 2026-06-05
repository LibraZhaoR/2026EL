package com.nju.travel.module.ai.service;

import com.nju.travel.module.ai.dto.AiChatRequest;
import com.nju.travel.module.ai.dto.AiRoutePlanRequest;
import com.nju.travel.module.ai.vo.AiChatVO;
import com.nju.travel.integration.ai.AiClient;
import com.nju.travel.config.AiConfig;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AiService {

    private final AiClient aiClient;
    private final AiConfig aiConfig;

    public AiService(AiClient aiClient, AiConfig aiConfig) {
        this.aiClient = aiClient;
        this.aiConfig = aiConfig;
    }

    public AiChatVO chat(AiChatRequest request) {
        String sessionId = request.sessionId() == null ? UUID.randomUUID().toString() : request.sessionId();
        String role = request.guideRole() == null ? "二次元城市向导" : request.guideRole();

        String systemPrompt = buildSystemPrompt(role, request.routeId(), request.pointId());

        String reply;
        if (request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            reply = aiClient.chatWithImages(systemPrompt, request.message(), request.imageUrls());
        } else {
            reply = aiClient.chat(systemPrompt, request.message());
        }

        return new AiChatVO(sessionId, role, reply, aiConfig.getProvider());
    }

    public AiChatVO routePlan(AiRoutePlanRequest request) {
        String sessionId = UUID.randomUUID().toString();
        String role = "AI路线规划师";

        String systemPrompt = buildRoutePlanSystemPrompt();
        String userPrompt = buildRoutePlanUserPrompt(request);
        String reply = aiClient.chat(systemPrompt, userPrompt);

        return new AiChatVO(sessionId, role, reply, aiConfig.getProvider());
    }

    private String buildSystemPrompt(String role, Long routeId, Long pointId) {
        StringBuilder sb = new StringBuilder();
        sb.append("你是").append(role).append("，名叫「南小鲸」🐋，是「金陵漫游」APP的AI向导。");
        sb.append("你的性格：温暖、博学、偶尔俏皮，像一位熟悉南京每条街巷的本地朋友。");
        sb.append("回复风格：用中文，2-4句话为宜（除非用户要求详细攻略），语气轻松自然，可以适当加一个emoji。");
        sb.append("\n\n");
        sb.append("=== 你熟悉的南京 ===");
        sb.append("\n【核心路线】");
        sb.append("\n- 南大校史线(nju)：三江师范学堂→北大楼→梧桐大道→校史馆，约2.5小时，校园人文路线");
        sb.append("\n- 秦淮夜游线(night)：秦淮河→夫子庙→老门东，约3小时，夜景美食路线");
        sb.append("\n- 美食路线(food)：老门东小吃→夫子庙秦淮八绝→新街口商圈，约2小时，休闲美食");
        sb.append("\n- 展览路线(expo)：南京博物院→先锋书店→六朝博物馆，约3小时，文化艺术");
        sb.append("\n【必知景点】中山陵、明孝陵、总统府、鸡鸣寺、玄武湖、南京城墙、大报恩寺");
        sb.append("\n【必吃美食】鸭血粉丝汤、盐水鸭、牛肉锅贴、桂花糖芋苗、赤豆元宵、蟹黄汤包、秦淮八绝");
        sb.append("\n【实用贴士】南京春秋最美（3-5月、10-11月），梧桐大道秋天绝佳，博物院需提前预约，地铁出行方便");
        sb.append("\n\n");
        if (routeId != null) {
            sb.append("用户当前在路线ID=").append(routeId).append("上，可以结合该路线特点推荐。");
        }
        if (pointId != null) {
            sb.append("用户当前在点位ID=").append(pointId).append("附近，可以介绍该点位及周边。");
        }
        return sb.toString();
    }

    private String buildRoutePlanSystemPrompt() {
        return "你是南京出行规划师，擅长根据用户的时间、预算和兴趣，规划最合适的南京游玩路线。回复需包含具体的景点顺序、交通方式和预计时间。";
    }

    private String buildRoutePlanUserPrompt(AiRoutePlanRequest request) {
        return String.format("时长%d分钟，预算%d元。用户需求：%s",
                request.durationMinutes(), request.budgetMax(), request.userText());
    }
}
