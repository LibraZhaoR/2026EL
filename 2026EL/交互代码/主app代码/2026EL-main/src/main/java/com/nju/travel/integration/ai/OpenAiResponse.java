package com.nju.travel.integration.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenAiResponse(
        String id,
        String model,
        List<Choice> choices,
        Usage usage
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Choice(
            int index,
            Message message,
            @JsonProperty("finish_reason") String finishReason
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Message(
            String role,
            String content
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Usage(
            @JsonProperty("prompt_tokens") int promptTokens,
            @JsonProperty("completion_tokens") int completionTokens,
            @JsonProperty("total_tokens") int totalTokens
    ) {
    }

    public String extractText() {
        if (choices == null || choices.isEmpty()) {
            return "";
        }
        Choice first = choices.get(0);
        if (first.message() == null || first.message().content() == null) {
            return "";
        }
        return first.message().content();
    }
}
