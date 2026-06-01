package com.nju.travel.integration.schedule;

import com.nju.travel.module.exhibition.service.ExhibitionService;
import com.nju.travel.module.exhibition.vo.ReserveRemindVO;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReserveRemindScheduler {

    private final ExhibitionService exhibitionService;

    public ReserveRemindScheduler(ExhibitionService exhibitionService) {
        this.exhibitionService = exhibitionService;
    }

    @Scheduled(fixedDelay = 60000)
    public void scanReserveReminds() {
        List<ReserveRemindVO> dueReminds = exhibitionService.dueReminds();
        if (!dueReminds.isEmpty()) {
            // 学生项目第一版先保留扫描能力，后续接 APP 站内消息或推送服务。
            dueReminds.forEach(remind -> System.out.println("预约提醒待推送：" + remind));
        }
    }
}
