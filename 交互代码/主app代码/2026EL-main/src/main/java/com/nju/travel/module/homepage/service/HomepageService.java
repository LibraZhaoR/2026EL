package com.nju.travel.module.homepage.service;

import com.nju.travel.integration.meituan.MockMeituanClient;
import com.nju.travel.integration.meituan.dto.PoiItem;
import com.nju.travel.module.homepage.model.Persona;
import com.nju.travel.module.homepage.vo.CommunityReviewVO;
import com.nju.travel.module.homepage.vo.HomepageVO;
import com.nju.travel.module.route.service.RouteService;
import com.nju.travel.module.route.vo.RouteVO;
import com.nju.travel.module.user.service.UserService;
import com.nju.travel.module.user.vo.UserVO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class HomepageService {

    private final UserService userService;
    private final RouteService routeService;
    private final MockMeituanClient meituanClient;

    public HomepageService(UserService userService, RouteService routeService,
                           MockMeituanClient meituanClient) {
        this.userService = userService;
        this.routeService = routeService;
        this.meituanClient = meituanClient;
    }

    public HomepageVO getHomepage(Long userId, String personaLabel) {
        Persona persona = resolvePersona(userId, personaLabel);
        UserVO user = userService.getUser(userId);

        List<PoiItem> merchants = getMerchantsForPersona(persona);
        List<RouteVO> routes = getRoutesForPersona(persona);
        List<CommunityReviewVO> reviews = getReviewsForPersona(persona);

        return new HomepageVO(
                persona.getLabel(),
                persona.getDescription(),
                Persona.all().stream()
                        .map(p -> new HomepageVO.PersonaOption(p.getLabel(), p.getDescription()))
                        .toList(),
                merchants,
                routes,
                reviews
        );
    }

    private Persona resolvePersona(Long userId, String personaLabel) {
        if (personaLabel != null && !personaLabel.isEmpty()) {
            Persona p = Persona.fromLabel(personaLabel);
            if (p != null) {
                userService.updatePersona(userId, p.getLabel());
                return p;
            }
        }
        UserVO user = userService.getUser(userId);
        if (user.persona() != null && !user.persona().isEmpty()) {
            Persona p = Persona.fromLabel(user.persona());
            if (p != null) return p;
        }
        return Persona.FOODIE;
    }

    private List<PoiItem> getMerchantsForPersona(Persona persona) {
        return ALL_POIS.stream()
                .filter(poi -> persona.getPoiCategories().contains(poi.category()))
                .sorted(Comparator.comparingDouble(PoiItem::rating).reversed()
                        .thenComparingInt(PoiItem::distance))
                .limit(6)
                .toList();
    }

    private List<RouteVO> getRoutesForPersona(Persona persona) {
        return routeService.popularCopies().stream()
                .sorted(Comparator.comparingInt(route -> -scoreRouteForPersona(route, persona)))
                .toList();
    }

    private int scoreRouteForPersona(RouteVO route, Persona persona) {
        int score = 0;
        for (String tag : route.tags()) {
            if (persona.getRouteTags().contains(tag)) score += 30;
        }
        for (String crowd : route.crowdTags().split(",")) {
            if (persona.getRouteTags().contains(crowd.trim())) score += 15;
        }
        if (persona == Persona.BUDGET_TRAVELER && route.budgetMax() <= 150) score += 20;
        if (persona == Persona.FOODIE && route.category().equals("生活")) score += 10;
        if (persona == Persona.CULTURE_EXPLORER && route.category().equals("文化")) score += 10;
        if (persona == Persona.NIGHT_OWL && route.title().contains("夜")) score += 25;
        return score;
    }

    private List<CommunityReviewVO> getReviewsForPersona(Persona persona) {
        return MOCK_REVIEWS.stream()
                .filter(r -> r.tags().stream().anyMatch(t -> persona.getReviewTags().contains(t)))
                .sorted(Comparator.comparingInt(CommunityReviewVO::likeCount).reversed())
                .limit(5)
                .toList();
    }

    // ── Mock POI data (subset for homepage display) ──

    private static final List<PoiItem> ALL_POIS = List.of(
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

    // ── Mock community reviews ──

    private static final List<CommunityReviewVO> MOCK_REVIEWS = List.of(
            new CommunityReviewVO("r001", "吃货小明", "",
                    "李记清真馆的牛肉锅贴真的太绝了！皮薄馅大，一口咬下去满满的汤汁，排了半小时队完全值得。",
                    "李记清真馆", "food", List.of("美食探店", "老字号", "锅贴"), 238,
                    LocalDateTime.of(2025, 6, 8, 12, 30)),
            new CommunityReviewVO("r002", "探店小王", "",
                    "鸭得堡的汤底是真的浓，和那些连锁店完全不是一个级别。鸭血嫩滑，粉丝Q弹，35块钱吃到撑。",
                    "鸭得堡老鸭粉丝汤", "food", List.of("美食探店", "鸭血粉丝", "小吃"), 186,
                    LocalDateTime.of(2025, 6, 7, 18, 15)),
            new CommunityReviewVO("r003", "文艺青年小张", "",
                    "先锋书店不愧是'中国最美书店'，地下车库改建的空间特别有氛围感，十字架下拍照超出片！咖啡也不错。",
                    "先锋书店", "coffee", List.of("最美书店", "拍照", "打卡", "咖啡店"), 315,
                    LocalDateTime.of(2025, 6, 9, 15, 0)),
            new CommunityReviewVO("r004", "博物馆控", "",
                    "南京博物院馆藏太丰富了，从史前到近现代，银缕玉衣和坤舆万国全图是必看的。建议至少留半天时间。",
                    "南京博物院", "ticket", List.of("博物馆", "展览", "历史"), 421,
                    LocalDateTime.of(2025, 6, 10, 10, 45)),
            new CommunityReviewVO("r005", "夜游达人", "",
                    "秦淮河夜游画舫太美了！灯影桨声里的金陵城，和白天完全不一样的感觉。建议选最后一班，人少景美。",
                    "夫子庙秦淮河画舫", "ticket", List.of("夜景", "打卡", "秦淮河"), 267,
                    LocalDateTime.of(2025, 6, 9, 21, 30)),
            new CommunityReviewVO("r006", "学生党小陈", "",
                    "南京博物院免费但需要提前预约！刷身份证就能进，里面很大，逛了三小时才看了一半。强烈推荐给预算有限的同学。",
                    "南京博物院", "ticket", List.of("免费", "博物馆", "展览"), 352,
                    LocalDateTime.of(2025, 6, 11, 14, 20)),
            new CommunityReviewVO("r007", "咖啡爱好者", "",
                    "UNiUNi的手冲真的太棒了，豆子都是自家烘焙的，坐在凯瑟琳广场的露台上喝咖啡晒太阳，完美的周末午后。",
                    "UNiUNi凯瑟琳广场店", "coffee", List.of("咖啡店", "打卡", "拍照"), 178,
                    LocalDateTime.of(2025, 6, 8, 11, 0)),
            new CommunityReviewVO("r008", "深夜食客", "",
                    "1912街区的夜宵真是绝了，逛完夜市来一碗鸭血粉丝汤，配上锅贴，这才是南京夜生活的正确打开方式。",
                    "南京1912街区", "food", List.of("夜宵", "深夜食堂", "小吃"), 145,
                    LocalDateTime.of(2025, 6, 10, 23, 15)),
            new CommunityReviewVO("r009", "散步爱好者", "",
                    "从玄武湖走到明孝陵，一路梧桐树荫，不晒不累。适合不想赶景点的休闲游，路上还有很多小吃摊可以歇脚。",
                    "明孝陵", "ticket", List.of("散步", "公园", "休闲"), 203,
                    LocalDateTime.of(2025, 6, 6, 9, 30)),
            new CommunityReviewVO("r010", "历史迷", "",
                    "总统府真的值得细细逛一上午，从太平天国到民国，建筑和展陈都很有看头。建议租个讲解器，比自己看有意思多了。",
                    "总统府", "ticket", List.of("历史", "博物馆", "展览"), 298,
                    LocalDateTime.of(2025, 6, 11, 16, 45)),
            new CommunityReviewVO("r011", "摄影小白", "",
                    "老门东真的太好拍了！青砖黛瓦、老街巷弄，随手一拍都是大片。建议傍晚去，光线特别柔和，拍人像绝了。",
                    "老门东", "ticket", List.of("拍照", "打卡", "夜景"), 189,
                    LocalDateTime.of(2025, 6, 7, 17, 30)),
            new CommunityReviewVO("r012", "南京土著", "",
                    "芳婆糕团店的赤豆元宵是我的童年回忆啊！五块钱一碗，香甜软糯，早上来一碗整个人都暖了。外地朋友来必带。",
                    "芳婆糕团店", "food", List.of("老字号", "小吃", "美食探店"), 412,
                    LocalDateTime.of(2025, 6, 12, 7, 45))
    );
}
