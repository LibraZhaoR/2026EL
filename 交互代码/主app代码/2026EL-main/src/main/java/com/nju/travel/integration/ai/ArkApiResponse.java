package com.nju.travel.integration.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ArkApiResponse(
        String id,
        String model,
        List<OutputItem> output,
        Usage usage
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OutputItem(
            String type,
            String role,
            List<ContentBlock> content
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ContentBlock(
            String type,
            String text
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Usage(
            @JsonProperty("input_tokens") int inputTokens,
            @JsonProperty("output_tokens") int outputTokens
    ) {
    }

    public String extractText() {
        if (output == null) {
            return "";
        }
        return output.stream()
                .filter(o -> "message".equals(o.type) && o.content != null)
                .flatMap(o -> o.content.stream())
                .filter(c -> "output_text".equals(c.type))
                .map(ContentBlock::text)
                .reduce("", (a, b) -> a + b);
    }
}
