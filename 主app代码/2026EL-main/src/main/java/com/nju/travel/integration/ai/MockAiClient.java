package com.nju.travel.integration.ai;

import org.springframework.stereotype.Component;

@Component
public class MockAiClient implements AiClient {

    @Override
    public String chat(String prompt) {
        return "我是你的南京出行向导。根据你的问题，我会结合路线、点位、剧情和预约信息给出轻量建议：" + prompt;
    }
}
