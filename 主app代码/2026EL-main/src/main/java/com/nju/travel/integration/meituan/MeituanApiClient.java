package com.nju.travel.integration.meituan;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nju.travel.config.MeituanConfig;
import com.nju.travel.integration.meituan.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;

@Component
@ConditionalOnProperty(name = "travel.meituan.enabled", havingValue = "true")
public class MeituanApiClient implements MeituanClient {

    private static final Logger log = LoggerFactory.getLogger(MeituanApiClient.class);

    private final RestClient restClient;
    private final MeituanConfig config;
    private final ObjectMapper objectMapper;

    public MeituanApiClient(MeituanConfig config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(config.getBaseUrl())
                .defaultHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
                .build();
    }

    @Override
    public List<PoiItem> searchPoi(PoiSearchRequest request) {
        Map<String, String> params = buildBaseParams();
        params.put("keyword", request.keyword() != null ? request.keyword() : "");
        if (request.latitude() != null) params.put("latitude", String.valueOf(request.latitude()));
        if (request.longitude() != null) params.put("longitude", String.valueOf(request.longitude()));
        params.put("radius", String.valueOf(request.radius()));
        params.put("pageNum", String.valueOf(request.pageNum()));
        params.put("pageSize", String.valueOf(request.pageSize()));
        if (request.category() != null) params.put("category", request.category());

        JsonNode result = post("/openapi/v1/poi/search", params);
        return parseList(result, "data", PoiItem.class);
    }

    @Override
    public PoiDetail getPoiDetail(String storeId) {
        Map<String, String> params = buildBaseParams();
        params.put("storeId", storeId);

        JsonNode result = post("/openapi/v1/poi/detail", params);
        return parseObject(result, "data", PoiDetail.class);
    }

    @Override
    public List<DealItem> searchDeals(DealSearchRequest request) {
        Map<String, String> params = buildBaseParams();
        if (request.latitude() != null) params.put("latitude", String.valueOf(request.latitude()));
        if (request.longitude() != null) params.put("longitude", String.valueOf(request.longitude()));
        params.put("radius", String.valueOf(request.radius()));
        params.put("pageNum", String.valueOf(request.pageNum()));
        params.put("pageSize", String.valueOf(request.pageSize()));
        if (request.category() != null) params.put("category", request.category());

        JsonNode result = post("/openapi/v1/deal/search", params);
        return parseList(result, "data", DealItem.class);
    }

    // ── HTTP + Signature ──

    private JsonNode post(String path, Map<String, String> params) {
        params.put("sign", MeituanSignatureUtil.sign(params, config.getSignKey()));

        StringBuilder formBody = new StringBuilder();
        params.forEach((k, v) -> {
            if (v != null) {
                if (!formBody.isEmpty()) formBody.append("&");
                formBody.append(k).append("=").append(v);
            }
        });

        log.debug("Meituan API call: {} with params count={}", path, params.size());

        try {
            String response = restClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formBody.toString())
                    .retrieve()
                    .body(String.class);

            log.debug("Meituan API response: {}", response);
            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.error("Meituan API call failed: {}", path, e);
            throw new RuntimeException("美团 API 调用失败: " + e.getMessage(), e);
        }
    }

    private Map<String, String> buildBaseParams() {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("developerId", config.getDeveloperId());
        params.put("timestamp", String.valueOf(System.currentTimeMillis() / 1000));
        params.put("charset", "utf-8");
        params.put("version", "2");
        return params;
    }

    private <T> List<T> parseList(JsonNode root, String key, Class<T> clazz) {
        if (root == null || !root.has(key)) {
            return Collections.emptyList();
        }
        JsonNode data = root.get(key);
        if (data == null || data.isNull() || !data.isArray()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(
                    data.traverse(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, clazz)
            );
        } catch (Exception e) {
            log.error("Failed to parse Meituan response list", e);
            return Collections.emptyList();
        }
    }

    private <T> T parseObject(JsonNode root, String key, Class<T> clazz) {
        if (root == null || !root.has(key)) {
            return null;
        }
        JsonNode data = root.get(key);
        if (data == null || data.isNull()) {
            return null;
        }
        try {
            return objectMapper.treeToValue(data, clazz);
        } catch (Exception e) {
            log.error("Failed to parse Meituan response object", e);
            return null;
        }
    }
}
