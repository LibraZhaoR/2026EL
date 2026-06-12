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
@ConditionalOnProperty(name = "travel.ai.provider", havingValue = "openai")
public class OpenAiClient implements AiClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiClient.class);

    private final RestClient restClient;
    private final AiConfig config;

    public OpenAiClient(AiConfig config) {
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
        List<OpenAiRequest.Message> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(OpenAiRequest.textMessage("system", systemPrompt));
        }
        messages.add(OpenAiRequest.textMessage("user", userPrompt));

        OpenAiRequest request = new OpenAiRequest(config.getModel(), messages);

        try {
            OpenAiResponse response = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(OpenAiResponse.class);

            if (response == null) {
                log.error("OpenAI API returned null response");
                return "AI 服务暂时不可用，请稍后重试。";
            }

            String text = response.extractText();
            log.debug("OpenAI API response: model={}, tokens={}/{}",
                    response.model(),
                    response.usage() != null ? response.usage().promptTokens() : 0,
                    response.usage() != null ? response.usage().completionTokens() : 0);

            return text.isEmpty() ? "AI 返回了空内容，请重试。" : text;
        } catch (Exception e) {
            log.error("OpenAI API call failed", e);
            return "AI 服务调用失败：" + e.getMessage();
        }
    }

    @Override
    public String chatWithImages(String userPrompt, List<String> imageUrls) {
        return chatWithImages(null, userPrompt, imageUrls);
    }

    @Override
    public String chatWithImages(String systemPrompt, String userPrompt, List<String> imageUrls) {
        // Build a message with image support using content array format
        // For simplicity, append image URLs to the text prompt
        StringBuilder promptBuilder = new StringBuilder(userPrompt);
        if (imageUrls != null && !imageUrls.isEmpty()) {
            promptBuilder.append("\n\n[图片参考]");
            for (int i = 0; i < imageUrls.size(); i++) {
                promptBuilder.append("\n图片").append(i + 1).append(": ").append(imageUrls.get(i));
            }
        }
        return chat(systemPrompt, promptBuilder.toString());
    }
}
