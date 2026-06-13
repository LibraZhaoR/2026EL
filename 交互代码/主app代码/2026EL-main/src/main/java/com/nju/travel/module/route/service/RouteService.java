package com.nju.travel.module.route.service;

import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.common.result.PageResult;
import com.nju.travel.module.route.dto.RouteRecommendRequest;
import com.nju.travel.module.route.dto.UserRouteCreateRequest;
import com.nju.travel.module.route.entity.CustomRoute;
import com.nju.travel.module.route.entity.RouteStop;
import com.nju.travel.module.route.repository.CustomRouteRepository;
import com.nju.travel.module.route.vo.RouteDetailVO;
import com.nju.travel.module.route.vo.RoutePointVO;
import com.nju.travel.module.route.vo.RouteVO;
import com.nju.travel.module.route.vo.UserRouteVO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final CustomRouteRepository routeRepo;

    public RouteService(CustomRouteRepository routeRepo) {
        this.routeRepo = routeRepo;
    }

    // ── Built-in official routes (read-only, static) ──

    private final List<RouteVO> routes = List.of(
            new RouteVO(1L, "南大新生校史线：从三江师范到今天", "文化", 150, 0, 50,
                    "南大新生,访校同学,校友", "LOW", false, "", true,
                    List.of("学校教育", "校史", "二次元向导"), 0),
            new RouteVO(2L, "金陵夜游线：秦淮河-夫子庙-老门东", "文化", 210, 80, 200,
                    "第一次来南京,情侣,朋友聚会", "MEDIUM", false, "", true,
                    List.of("景点", "夜游", "剧情任务"), 0),
            new RouteVO(3L, "午后餐茶线：小吃-咖啡-书店-散步", "生活", 120, 50, 150,
                    "一个人闲逛,朋友聊天,轻松约会", "LOW", false, "", true,
                    List.of("美食", "咖啡", "书店"), 0),
            new RouteVO(4L, "博物馆 / 展览路线：预约提醒 + 多展览串联", "文化", 240, 30, 120,
                    "展览爱好者,南大新生,周末出行", "MEDIUM", true, "", true,
                    List.of("博物馆展览", "科技馆", "预约提醒"), 0)
    );

    private final Map<Long, List<RoutePointVO>> routePoints = Map.of(
            1L, List.of(
                    new RoutePointVO(101L, "南京大学鼓楼校区", "南京市鼓楼区汉口路22号", 1, "南大历史体验起点。", "从三江师范学堂到今日南大，校园承载百年学术记忆。", 32.056, 118.779),
                    new RoutePointVO(102L, "北大楼", "南京大学鼓楼校区", 2, "校史标志建筑。", "北大楼见证了南大近现代教育传统。", 32.057, 118.779)
            ),
            2L, List.of(
                    new RoutePointVO(201L, "秦淮河", "南京市秦淮区", 1, "金陵夜色代表点位。", "秦淮河连接六朝风华与城市烟火。", 32.020, 118.788),
                    new RoutePointVO(202L, "夫子庙", "南京市秦淮区贡院街", 2, "夜游核心点位。", "夫子庙是南京文化与商业记忆的重要交汇。", 32.021, 118.789),
                    new RoutePointVO(203L, "老门东", "南京市秦淮区剪子巷", 3, "适合结尾打卡。", "老门东保留南京老城南街巷气质。", 32.012, 118.791)
            ),
            3L, List.of(
                    new RoutePointVO(301L, "小吃街", "南京市中心", 1, "适合轻量出门。", "从小吃开始进入松弛的午后节奏。", 32.045, 118.790),
                    new RoutePointVO(302L, "咖啡店", "南京市中心", 2, "适合聊天和放空。", "把路线从目的地变成情绪容器。", 32.046, 118.791)
            ),
            4L, List.of(
                    new RoutePointVO(401L, "南京博物院", "南京市玄武区中山东路321号", 1, "展览路线核心。", "展览、历史与城市空间串联。", 32.040, 118.830),
                    new RoutePointVO(402L, "明故宫遗址", "南京市玄武区", 2, "可与南博串联。", "明故宫遗址补足半日文化路线。", 32.039, 118.817)
            )
    );

    // ── Built-in route queries ──

    public PageResult<RouteVO> listRoutes(String category, Integer durationMinutes, Integer budgetMax, String tag, Integer page, Integer size) {
        List<RouteVO> filtered = routes.stream()
                .filter(route -> category == null || route.category().equals(category))
                .filter(route -> durationMinutes == null || route.durationMinutes() <= durationMinutes)
                .filter(route -> budgetMax == null || route.budgetMax() <= budgetMax)
                .filter(route -> tag == null || route.tags().contains(tag))
                .toList();
        return new PageResult<>((long) filtered.size(), page, size, filtered);
    }

    public RouteDetailVO getRouteDetail(Long routeId) {
        RouteVO route = findRoute(routeId);
        return new RouteDetailVO(route,
                route.routeId() == 1L ? "从 1902 到 2026 的南大历史线" : "城市剧情体验",
                routePoints.getOrDefault(routeId, List.of()));
    }

    public List<RouteVO> recommend(RouteRecommendRequest request) {
        return routes.stream()
                .sorted(Comparator.comparingInt(route -> -score(route, request)))
                .toList();
    }

    public List<RouteVO> popularCopies() {
        return routes.stream().filter(RouteVO::official).toList();
    }

    private RouteVO findRoute(Long routeId) {
        return routes.stream().filter(r -> r.routeId().equals(routeId)).findFirst()
                .orElseThrow(() -> new BusinessException(404, "路线不存在"));
    }

    private int score(RouteVO route, RouteRecommendRequest request) {
        int score = 0;
        if (request.durationMinutes() != null && route.durationMinutes() <= request.durationMinutes()) score += 30;
        if (request.budgetMax() != null && route.budgetMax() <= request.budgetMax()) score += 20;
        if (request.crowdType() != null && route.crowdTags().contains(request.crowdType())) score += 20;
        if (request.interestTags() != null) {
            for (String tag : request.interestTags()) if (route.tags().contains(tag)) score += 10;
        }
        if (request.mood() != null && route.title().contains("午后")) score += 5;
        return score;
    }

    // ── Custom route CRUD (backed by H2 database) ──

    public UserRouteVO createUserRoute(UserRouteCreateRequest request) {
        CustomRoute entity = new CustomRoute(
                request.userId(), request.sourceRouteId(),
                request.title(), request.description(),
                Boolean.TRUE.equals(request.isPublic()));
        entity = routeRepo.save(entity);
        return toUserRouteVO(entity);
    }

    public UserRouteVO createUserRoute(Long userId, UserRouteCreateRequest request) {
        CustomRoute entity = new CustomRoute(
                userId, request.sourceRouteId(),
                request.title(), request.description(),
                Boolean.TRUE.equals(request.isPublic()));
        entity = routeRepo.save(entity);
        return toUserRouteVO(entity);
    }

    public UserRouteVO saveCustomRoute(Long userId, String title, String description, String coverUrl) {
        CustomRoute entity = new CustomRoute(userId, null, title, description, false);
        entity = routeRepo.save(entity);
        return toUserRouteVO(entity);
    }

    public UserRouteVO copyRoute(Long routeId, Long userId) {
        RouteVO route = findRoute(routeId);
        CustomRoute entity = new CustomRoute(userId, routeId, route.title() + "（我的复刻版）",
                "基于公开路线复刻", false);
        // Copy route points as stops
        List<RoutePointVO> pts = routePoints.getOrDefault(routeId, List.of());
        List<RouteStop> stops = new ArrayList<>();
        for (RoutePointVO p : pts) {
            stops.add(new RouteStop(entity, p.name(), p.sortOrder(), p.intro(), p.latitude(), p.longitude()));
        }
        entity.setStops(stops);
        entity = routeRepo.save(entity);
        return toUserRouteVO(entity);
    }

    public List<UserRouteVO> listUserRoutes(Long userId) {
        return routeRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toUserRouteVO).collect(Collectors.toList());
    }

    public UserRouteVO getUserRoute(Long userRouteId) {
        CustomRoute entity = routeRepo.findById(userRouteId)
                .orElseThrow(() -> new BusinessException(404, "路线不存在"));
        return toUserRouteVO(entity);
    }

    public com.nju.travel.module.route.vo.UserRouteDetailVO getUserRouteDetail(Long userRouteId) {
        CustomRoute entity = routeRepo.findById(userRouteId)
                .orElseThrow(() -> new BusinessException(404, "路线不存在"));
        List<com.nju.travel.module.route.vo.UserRouteDetailVO.RouteStopInfo> stops =
                entity.getStops().stream()
                        .map(s -> new com.nju.travel.module.route.vo.UserRouteDetailVO.RouteStopInfo(
                                s.getId(), s.getName(), s.getSortOrder(), s.getDetail(),
                                s.getLatitude(), s.getLongitude()))
                        .toList();
        return new com.nju.travel.module.route.vo.UserRouteDetailVO(
                entity.getId(), entity.getUserId(), entity.getTitle(),
                entity.getDescription(), stops, entity.getCreatedAt());
    }

    public void deleteUserRoute(Long userRouteId, Long userId) {
        CustomRoute entity = routeRepo.findById(userRouteId)
                .orElseThrow(() -> new BusinessException(404, "路线不存在"));
        if (!entity.getUserId().equals(userId)) throw new BusinessException(403, "无权删除");
        routeRepo.delete(entity);
    }

    // ── Save with stops (for map editor) ──

    public UserRouteVO saveCustomRouteWithStops(Long userId, String title, String description,
                                                 List<RouteStop> stops) {
        CustomRoute route = new CustomRoute(userId, null, title, description, false);
        for (RouteStop s : stops) s.setRoute(route);
        route.setStops(stops);
        route = routeRepo.save(route);
        return toUserRouteVO(route);
    }

    // ── DTO conversion ──

    private UserRouteVO toUserRouteVO(CustomRoute entity) {
        List<Long> pointIds = entity.getStops().stream()
                .map(RouteStop::getId).collect(Collectors.toList());
        return new UserRouteVO(entity.getId(), entity.getUserId(), entity.getSourceRouteId(),
                entity.getTitle(), entity.getDescription(), entity.getIsPublic(),
                pointIds, entity.getCreatedAt());
    }
}
