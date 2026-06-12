package com.nju.travel.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "travel.meituan")
public class MeituanConfig {

    private String developerId;
    private String signKey;
    private String baseUrl = "https://api-open-cater.meituan.com";
    private boolean enabled = false;

    public String getDeveloperId() {
        return developerId;
    }

    public void setDeveloperId(String developerId) {
        this.developerId = developerId;
    }

    public String getSignKey() {
        return signKey;
    }

    public void setSignKey(String signKey) {
        this.signKey = signKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
