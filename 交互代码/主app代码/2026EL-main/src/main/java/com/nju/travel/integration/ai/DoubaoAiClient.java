package com.nju.travel.integration.ai;

import com.nju.travel.config.AiConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Component
@ConditionalOnProperty(name = "travel.ai.provider", havingValue = "doubao")
public class DoubaoAiClient implements AiClient {

    private static final Logger log = LoggerFactory.getLogger(DoubaoAiClient.class);

    private final RestClient restClient;
    private final AiConfig config;

    public DoubaoAiClient(AiConfig config) {
        this.config = config;
        this.restClient = RestClient.builder()
                .baseUrl(config.getBaseUrl())
                .defaultHeader("Authorization", "Bearer " + config.getApiKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public String chat(String prompt) {
        return chat(null, prompt);
    }

    @Override
    public String chat(String systemPrompt, String userPrompt) {
        return callArkApi(buildMessages(systemPrompt, userPrompt));
    }

    @Override
    public String chatWithImages(String userPrompt, List<String> imageUrls) {
        return chatWithImages(null, userPrompt, imageUrls);
    }

    @Override
    public String chatWithImages(String systemPrompt, String userPrompt, List<String> imageUrls) {
        List<ArkApiRequest.ContentBlock> blocks = new ArrayList<>();
        for (String url : imageUrls) {
            blocks.add(ArkApiRequest.image(url));
        }
        blocks.add(ArkApiRequest.text(userPrompt));

        ArkApiRequest.InputMessage userMsg = new ArkApiRequest.InputMessage("user", blocks);
        List<ArkApiRequest.InputMessage> messages = new ArrayList<>();

        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(new ArkApiRequest.InputMessage("system",
                    List.of(ArkApiRequest.text(systemPrompt))));
        }
        messages.add(userMsg);

        return callArkApi(messages);
    }

    private List<ArkApiRequest.InputMessage> buildMessages(String systemPrompt, String userPrompt) {
        List<ArkApiRequest.InputMessage> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(new ArkApiRequest.InputMessage("system",
                    List.of(ArkApiRequest.text(systemPrompt))));
        }
        messages.add(new ArkApiRequest.InputMessage("user",
                List.of(ArkApiRequest.text(userPrompt))));
        return messages;
    }

    private String callArkApi(List<ArkApiRequest.InputMessage> messages) {
        ArkApiRequest request = new ArkApiRequest(config.getModel(), messages);

        try {
            ArkApiResponse response = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ArkApiResponse.class);

            if (response == null) {
                log.error("Ark API returned null response");
                return "AI 服务暂时不可用，请稍后重试。";
            }

            String text = response.extractText();
            log.debug("Ark API response: model={}, tokens={}/{}",
                    response.model(),
                    response.usage() != null ? response.usage().inputTokens() : 0,
                    response.usage() != null ? response.usage().outputTokens() : 0);

            return text.isEmpty() ? "AI 返回了空内容，请重试。" : text;
        } catch (Exception e) {
            log.error("Ark API call failed", e);
            return "AI 服务调用失败：" + e.getMessage();
        }
    }
}
