package com.nju.travel.module.exhibition.service;

import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.module.exhibition.dto.ReserveRemindCreateRequest;
import com.nju.travel.module.exhibition.vo.ExhibitionVO;
import com.nju.travel.module.exhibition.vo.ReserveRemindVO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ExhibitionService {

    private final AtomicLong remindIdGenerator = new AtomicLong(3000);
    private final Map<Long, ReserveRemindVO> remindMap = new ConcurrentHashMap<>();

    private final List<ExhibitionVO> exhibitions = List.of(
            new ExhibitionVO(1L, "南京博物院常设展", "南京博物院", "南京市玄武区中山东路321号",
                    "周二至周日 09:00-17:00", "每日 18:00 放票，可提前 7 日预约，分上午和下午时段。", "weixin://nanjing-museum", "18:00", ""),
            new ExhibitionVO(2L, "图书馆与科技馆展览", "南京市公共文化场馆", "南京市区",
                    "以场馆公告为准", "展示开放时间和官方预约入口，APP 只做提醒和跳转。", "https://example.com/reserve", "以官方为准", "")
    );

    public List<ExhibitionVO> listExhibitions() {
        return exhibitions;
    }

    public ExhibitionVO getExhibition(Long exhibitionId) {
        return exhibitions.stream()
                .filter(exhibition -> exhibition.exhibitionId().equals(exhibitionId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(404, "展览不存在"));
    }

    public ReserveRemindVO createRemind(ReserveRemindCreateRequest request) {
        getExhibition(request.exhibitionId());
        ReserveRemindVO remind = new ReserveRemindVO(
                remindIdGenerator.incrementAndGet(),
                request.userId(),
                request.exhibitionId(),
                request.remindTime(),
                "WAITING"
        );
        remindMap.put(remind.remindId(), remind);
        return remind;
    }

    public ReserveRemindVO cancelRemind(Long remindId) {
        ReserveRemindVO old = remindMap.get(remindId);
        if (old == null) {
            throw new BusinessException(404, "预约提醒不存在");
        }
        ReserveRemindVO canceled = new ReserveRemindVO(old.remindId(), old.userId(), old.exhibitionId(), old.remindTime(), "CANCELED");
        remindMap.put(remindId, canceled);
        return canceled;
    }

    public List<ReserveRemindVO> dueReminds() {
        LocalDateTime now = LocalDateTime.now();
        return remindMap.values().stream()
                .filter(remind -> "WAITING".equals(remind.status()))
                .filter(remind -> !remind.remindTime().isAfter(now.plusMinutes(10)))
                .toList();
    }
}
