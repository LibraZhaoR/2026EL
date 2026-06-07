package com.nju.travel.integration.meituan;

import com.nju.travel.integration.meituan.dto.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@ConditionalOnProperty(name = "travel.meituan.enabled", havingValue = "false", matchIfMissing = true)
public class MockMeituanClient implements MeituanClient {

    private static final List<PoiItem> ALL_POIS = List.of(
        // ── 南京经典美食 ──
        new PoiItem("m001", "鸭得堡老鸭粉丝汤（丰富路店）",
                "南京市秦淮区丰富路134号", 32.035, 118.780,
                "food", "025-52201234", 4.6, 35,
                "", "06:30-21:00", 280),
        new PoiItem("m002", "回味鸭血粉丝汤（夫子庙店）",
                "南京市秦淮区夫子庙贡院西街12号", 32.022, 118.788,
                "food", "025-52215678", 4.4, 28,
                "", "07:00-22:00", 180),
        new PoiItem("m003", "蒋有记锅贴（老门东店）",
                "南京市秦淮区老门东三条营49号", 32.018, 118.792,
                "food", "025-86625836", 4.7, 22,
                "", "07:00-19:30", 320),
        new PoiItem("m004", "李记清真馆（评事街店）",
                "南京市秦淮区评事街打钉巷1号", 32.030, 118.785,
                "food", "025-52215782", 4.8, 25,
                "", "05:30-19:00", 450),
        new PoiItem("m005", "芳婆糕团店（王府大街店）",
                "南京市秦淮区王府大街50号", 32.038, 118.782,
                "food", "025-84461860", 4.5, 15,
                "", "05:00-13:00", 380),
        new PoiItem("m006", "南京大牌档（狮子桥店）",
                "南京市鼓楼区湖南路狮子桥2号", 32.072, 118.775,
                "food", "025-83305888", 4.3, 68,
                "", "11:00-21:30", 520),
        new PoiItem("m007", "小潘记鸭血粉丝汤（相府营店）",
                "南京市玄武区相府营2号", 32.048, 118.792,
                "food", "025-83619297", 4.5, 22,
                "", "06:00-20:00", 600),
        new PoiItem("m008", "章云板鸭（升州路店）",
                "南京市秦淮区升州路236号", 32.028, 118.780,
                "food", "025-52201895", 4.6, 38,
                "", "07:30-19:00", 250),

        // ── 咖啡茶饮 ──
        new PoiItem("m009", "先锋书店（五台山店）",
                "南京市鼓楼区广州路173号", 32.053, 118.770,
                "coffee", "025-83711455", 4.8, 40,
                "", "10:00-22:00", 450),
        new PoiItem("m010", "UNiUNi凯瑟琳广场店",
                "南京市玄武区北京东路1号凯瑟琳广场1层", 32.060, 118.790,
                "coffee", "025-83600123", 4.5, 45,
                "", "08:00-22:00", 350),
        new PoiItem("m011", "Seesaw Coffee（德基广场店）",
                "南京市玄武区中山路18号德基广场B1", 32.058, 118.786,
                "coffee", "025-84761234", 4.3, 42,
                "", "09:00-22:00", 300),
        new PoiItem("m012", "南京1912街区·星巴克臻选",
                "南京市玄武区长江后街8号1912街区", 32.050, 118.798,
                "coffee", "025-84501111", 4.2, 38,
                "", "07:00-23:00", 420),

        // ── 景点门票 ──
        new PoiItem("m013", "南京博物院",
                "南京市玄武区中山东路321号", 32.042, 118.820,
                "ticket", "025-84807923", 4.7, 0,
                "", "09:00-17:00", 1200),
        new PoiItem("m014", "夫子庙秦淮河画舫",
                "南京市秦淮区夫子庙秦淮河畔", 32.022, 118.788,
                "ticket", "025-52265008", 4.5, 80,
                "", "09:00-21:30", 200),
        new PoiItem("m015", "明孝陵（梅花山）",
                "南京市玄武区明孝陵景区内", 32.058, 118.845,
                "ticket", "025-84446111", 4.6, 70,
                "", "06:30-18:00", 2400),
        new PoiItem("m016", "总统府",
                "南京市玄武区长江路292号", 32.045, 118.800,
                "ticket", "025-84578718", 4.4, 40,
                "", "08:30-17:30", 800),

        // ── 酒店住宿 ──
        new PoiItem("m017", "金陵饭店",
                "南京市鼓楼区汉中路2号", 32.045, 118.782,
                "hotel", "025-84711888", 4.5, 680,
                "", "00:00-23:59", 320),
        new PoiItem("m018", "南京中心大酒店",
                "南京市鼓楼区中山路251号", 32.062, 118.788,
                "hotel", "025-83195888", 4.3, 420,
                "", "00:00-23:59", 280),
        new PoiItem("m019", "古南都饭店",
                "南京市鼓楼区广州路208号", 32.051, 118.768,
                "hotel", "025-83311999", 4.4, 388,
                "", "00:00-23:59", 500),
        new PoiItem("m020", "全季酒店（南京夫子庙店）",
                "南京市秦淮区建康路169号", 32.025, 118.790,
                "hotel", "025-86899666", 4.6, 260,
                "", "00:00-23:59", 150)
    );

    private static final Map<String, PoiDetail> DETAIL_MAP = new HashMap<>();
    static {
        DETAIL_MAP.put("m001", new PoiDetail("m001", "鸭得堡老鸭粉丝汤（丰富路店）",
                "南京市秦淮区丰富路134号", 32.035, 118.780,
                "food", "025-52201234", 4.6, 35,
                List.of(
                    "",
                    "",
                    ""
                ), "06:30-21:00",
                "南京老字号鸭血粉丝汤，汤底浓郁，配料丰富。鸭血嫩滑，粉丝Q弹，配上鸭胗鸭肝鸭肠，一碗下肚暖到心底。",
                List.of("老字号", "鸭血粉丝", "秦淮小吃", "人均35", "明厨亮灶"),
                15203));

        DETAIL_MAP.put("m004", new PoiDetail("m004", "李记清真馆（评事街店）",
                "南京市秦淮区评事街打钉巷1号", 32.030, 118.785,
                "food", "025-52215782", 4.8, 25,
                List.of(
                    "",
                    ""
                ), "05:30-19:00",
                "南京最出名的清真锅贴店，开了30多年。牛肉锅贴金黄酥脆，咬开汤汁四溢。每天排队一小时是常态。",
                List.of("清真", "锅贴", "老字号", "排队王", "人均25"),
                28450));

        DETAIL_MAP.put("m006", new PoiDetail("m006", "南京大牌档（狮子桥店）",
                "南京市鼓楼区湖南路狮子桥2号", 32.072, 118.775,
                "food", "025-83305888", 4.3, 68,
                List.of(
                    "",
                    "",
                    "",
                    ""
                ), "11:00-21:30",
                "南京特色餐饮名片，古色古香的装修，穿着古装的服务员，地道金陵菜肴。盐水鸭、美龄粥、糖芋苗是必点。",
                List.of("金陵菜", "古风装修", "家庭聚餐", "人均68", "必吃榜"),
                36200));

        DETAIL_MAP.put("m009", new PoiDetail("m009", "先锋书店（五台山店）",
                "南京市鼓楼区广州路173号", 32.053, 118.770,
                "coffee", "025-83711455", 4.8, 40,
                List.of(
                    "",
                    "",
                    ""
                ), "10:00-22:00",
                "地下车库改建的独立书店，被誉为'中国最美书店'。巨大的十字架、文艺的阅读空间、精选的书籍，是南京必打卡的文化地标。",
                List.of("最美书店", "咖啡", "文创", "打卡地标", "人均40"),
                51200));

        DETAIL_MAP.put("m013", new PoiDetail("m013", "南京博物院",
                "南京市玄武区中山东路321号", 32.042, 118.820,
                "ticket", "025-84807923", 4.7, 0,
                List.of(
                    "",
                    "",
                    "",
                    ""
                ), "09:00-17:00",
                "中国三大博物馆之一，馆藏从史前到近代贯穿万年。银缕玉衣、坤舆万国全图、竹林七贤砖画都是镇馆之宝。免费但需预约。",
                List.of("免费", "需预约", "国宝级", "必去", "适合雨天"),
                128000));
    }

    @Override
    public List<PoiItem> searchPoi(PoiSearchRequest request) {
        String category = request.category();
        double lat = request.latitude();
        double lng = request.longitude();
        int radius = request.radius() != null ? request.radius() : 3000;

        return ALL_POIS.stream()
            .filter(p -> {
                if (category != null && !category.isEmpty() && !"all".equals(category)) {
                    if (!p.category().equals(category)) return false;
                }
                // Simple distance check (approximate)
                double dlat = Math.abs(p.latitude() - lat);
                double dlng = Math.abs(p.longitude() - lng);
                double approxDist = Math.sqrt(dlat*dlat + dlng*dlng) * 111000;
                return approxDist <= radius;
            })
            .sorted(Comparator.comparingDouble(p -> {
                double dlat = Math.abs(p.latitude() - lat);
                double dlng = Math.abs(p.longitude() - lng);
                return Math.sqrt(dlat*dlat + dlng*dlng);
            }))
            .limit(request.pageSize() != null ? request.pageSize() : 20)
            .toList();
    }

    @Override
    public PoiDetail getPoiDetail(String storeId) {
        return DETAIL_MAP.getOrDefault(storeId,
            new PoiDetail(storeId, "未知商家",
                "南京市", 32.060, 118.796,
                "food", "", 4.0, 30,
                List.of(), "09:00-21:00",
                "暂无详细信息", List.of(), 0));
    }

    @Override
    public List<DealItem> searchDeals(DealSearchRequest request) {
        return List.of(
            // ── 美食套餐 ──
            new DealItem("d001", "鸭血粉丝汤单人套餐（含锅巴）", "鸭得堡老鸭粉丝汤",
                    28.8, 38.0, null, 15203, "food"),
            new DealItem("d002", "牛肉锅贴12只+牛肉汤1碗", "李记清真馆",
                    22.0, 30.0, null, 28450, "food"),
            new DealItem("d003", "金牌盐水鸭半只+美龄粥+糖芋苗", "南京大牌档",
                    88.0, 128.0, null, 36200, "food"),
            new DealItem("d004", "鸭血粉丝+小笼包+鸭油烧饼三件套", "回味鸭血粉丝汤",
                    35.9, 48.0, null, 8900, "food"),
            new DealItem("d005", "桂花糖芋苗+酒酿赤豆元宵双拼", "芳婆糕团店",
                    12.0, 18.0, null, 6800, "food"),
            new DealItem("d006", "金陵双人餐（4菜1汤+米饭）", "南京大牌档",
                    168.0, 238.0, null, 12400, "food"),

            // ── 咖啡茶饮套餐 ──
            new DealItem("d007", "手冲咖啡+当日甜点", "先锋书店",
                    35.0, 52.0, null, 8600, "coffee"),
            new DealItem("d008", "精品手冲单人体验（含小食）", "UNiUNi",
                    48.0, 68.0, null, 3200, "coffee"),
            new DealItem("d009", "拿铁+可颂早餐组合", "Seesaw Coffee",
                    32.0, 45.0, null, 4500, "coffee"),

            // ── 景点门票套餐 ──
            new DealItem("d010", "秦淮河画舫夜游船票（含茶点）", "夫子庙秦淮河画舫",
                    68.0, 100.0, null, 25600, "ticket"),
            new DealItem("d011", "明孝陵+灵谷寺+音乐台联票", "明孝陵景区",
                    85.0, 120.0, null, 18200, "ticket"),
            new DealItem("d012", "总统府+六朝博物馆联票", "总统府",
                    55.0, 80.0, null, 9500, "ticket"),

            // ── 酒店套餐 ──
            new DealItem("d013", "豪华大床房1晚（含双早）", "金陵饭店",
                    598.0, 880.0, null, 3200, "hotel"),
            new DealItem("d014", "商务标间1晚+停车", "全季酒店南京夫子庙店",
                    228.0, 328.0, null, 5600, "hotel")
        );
    }
}
