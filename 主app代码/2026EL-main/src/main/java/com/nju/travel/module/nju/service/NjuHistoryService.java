package com.nju.travel.module.nju.service;

import com.nju.travel.module.route.service.RouteService;
import com.nju.travel.module.route.vo.RouteDetailVO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NjuHistoryService {

    private final RouteService routeService;

    public NjuHistoryService(RouteService routeService) {
        this.routeService = routeService;
    }

    public RouteDetailVO getHistoryRoute() {
        return routeService.getRouteDetail(1L);
    }

    public List<TimelineItem> timeline() {
        return List.of(
                new TimelineItem(1902, "三江师范学堂", "南大历史叙事起点，适合作为剧情序章。"),
                new TimelineItem(1920, "现代大学精神形成", "以校园建筑和人物故事承接历史记忆。"),
                new TimelineItem(1952, "院系调整", "展示学校发展中的关键转折。"),
                new TimelineItem(2026, "今天的南大", "面向新生和访校同学生成个人探索回忆。")
        );
    }

    public record TimelineItem(Integer year, String title, String description) {
    }
}
