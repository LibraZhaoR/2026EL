package com.nju.travel.integration.ai;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record OpenAiRequest(
        String model,
        List<Message> messages,
        Boolean stream,
        @JsonProperty("max_tokens") Integer maxTokens,
        Double temperature
) {
    public OpenAiRequest(String model, List<Message> messages) {
        this(model, messages, false, null, null);
    }

    public record Message(
            String role,
            String content
    ) {
    }

    public record ImageUrl(
            String url,
            String detail
    ) {
        public ImageUrl(String url) {
            this(url, "auto");
        }
    }

    public record ImageContentPart(
            String type,
            @JsonProperty("image_url") ImageUrl imageUrl
    ) {
    }

    public static Message textMessage(String role, String content) {
        return new Message(role, content);
    }
}
