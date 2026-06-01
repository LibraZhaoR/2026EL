package com.nju.travel.module.achievement.service;

import com.nju.travel.module.achievement.vo.AchievementVO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AchievementService {

    private final List<AchievementVO> achievements = List.of(
            new AchievementVO(1L, "南大时光旅人", "完成南大 1902-2026 校史线任务。", "", "TASK_COMPLETE", "taskId=3001", false, null),
            new AchievementVO(2L, "夜泊秦淮", "完成金陵夜游线灯影任务和隐藏结局。", "", "STORY_COMPLETE", "storyType=JINLING_NIGHT", false, null),
            new AchievementVO(3L, "展览预约官", "创建一次博物馆或展览预约提醒。", "", "RESERVE_REMIND", "count>=1", false, null),
            new AchievementVO(4L, "路线召集人", "生成一次闲逛搭子邀约卡。", "", "INVITE_CARD", "count>=1", false, null)
    );

    public List<AchievementVO> listAchievements() {
        return achievements;
    }

    public List<AchievementVO> userAchievements(Long userId) {
        return achievements.stream()
                .limit(2)
                .map(item -> new AchievementVO(item.achievementId(), item.name(), item.description(), item.iconUrl(),
                        item.unlockType(), item.unlockCondition(), true, LocalDateTime.now().minusDays(item.achievementId())))
                .toList();
    }
}
