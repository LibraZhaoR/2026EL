package com.nju.travel.integration.ai;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ArkApiRequest(
        String model,
        List<InputMessage> input
) {

    public record InputMessage(
            String role,
            List<ContentBlock> content
    ) {
    }

    public sealed interface ContentBlock permits TextContent, ImageContent {
    }

    public record TextContent(
            String type,   // "input_text"
            String text
    ) implements ContentBlock {
    }

    public record ImageContent(
            String type,   // "input_image"
            @JsonProperty("image_url") String imageUrl
    ) implements ContentBlock {
    }

    public static ContentBlock text(String text) {
        return new TextContent("input_text", text);
    }

    public static ContentBlock image(String url) {
        return new ImageContent("input_image", url);
    }
}
