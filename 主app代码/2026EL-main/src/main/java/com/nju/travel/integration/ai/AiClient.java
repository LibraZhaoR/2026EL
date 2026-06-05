package com.nju.travel.integration.ai;

import java.util.List;

public interface AiClient {

    String chat(String prompt);

    String chat(String systemPrompt, String userPrompt);

    String chatWithImages(String systemPrompt, String userPrompt, List<String> imageUrls);

    String chatWithImages(String userPrompt, List<String> imageUrls);
}
