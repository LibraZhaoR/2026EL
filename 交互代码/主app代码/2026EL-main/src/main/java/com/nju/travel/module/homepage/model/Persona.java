package com.nju.travel.module.homepage.model;

import java.util.List;
import java.util.Set;

public enum Persona {

    FOODIE("美食家", "穿梭街巷，只为一口金陵味",
            Set.of("food", "coffee"),
            Set.of("美食", "咖啡", "小吃", "生活"),
            Set.of("美食探店", "老字号", "小吃", "咖啡店")),

    CULTURE_EXPLORER("文化探索者", "在历史与艺术之间，发现南京的底色",
            Set.of("ticket"),
            Set.of("博物馆展览", "校史", "学校教育", "文化"),
            Set.of("博物馆", "展览", "历史", "校史馆")),

    PHOTOGRAPHER("摄影打卡者", "用镜头收藏这座城市的每一帧浪漫",
            Set.of("ticket", "coffee", "hotel"),
            Set.of("景点", "夜游", "打卡"),
            Set.of("拍照", "打卡", "夜景", "最美书店")),

    NIGHT_OWL("夜游者", "金陵夜色，越夜越精彩",
            Set.of("food", "coffee", "hotel"),
            Set.of("夜游", "景点", "生活"),
            Set.of("夜宵", "夜景", "酒吧", "深夜食堂")),

    BUDGET_TRAVELER("休闲漫步者", "不赶路，只感受路上的风景",
            Set.of("food", "coffee", "ticket"),
            Set.of("生活", "散步", "书店", "咖啡"),
            Set.of("散步", "免费", "公园", "书店"));

    private final String label;
    private final String description;
    private final Set<String> poiCategories;
    private final Set<String> routeTags;
    private final Set<String> reviewTags;

    Persona(String label, String description,
            Set<String> poiCategories, Set<String> routeTags, Set<String> reviewTags) {
        this.label = label;
        this.description = description;
        this.poiCategories = poiCategories;
        this.routeTags = routeTags;
        this.reviewTags = reviewTags;
    }

    public String getLabel() { return label; }
    public String getDescription() { return description; }
    public Set<String> getPoiCategories() { return poiCategories; }
    public Set<String> getRouteTags() { return routeTags; }
    public Set<String> getReviewTags() { return reviewTags; }

    public static Persona fromLabel(String label) {
        for (Persona p : values()) {
            if (p.label.equals(label)) return p;
        }
        return null;
    }

    public static List<Persona> all() {
        return List.of(values());
    }
}
