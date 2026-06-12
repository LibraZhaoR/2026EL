package com.nju.travel.module.story.service;

import com.nju.travel.common.exception.BusinessException;
import com.nju.travel.module.story.dto.TaskSubmitRequest;
import com.nju.travel.module.story.vo.StoryChapterVO;
import com.nju.travel.module.story.vo.StoryTaskVO;
import com.nju.travel.module.story.vo.StoryVO;
import com.nju.travel.module.story.vo.TaskSubmitVO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StoryService {

    private final Map<Long, Integer> userProgress = new ConcurrentHashMap<>();

    private final List<StoryVO> stories = List.of(
            new StoryVO(1L, 1L, "从 1902 到 2026 的南大历史线", "NJU_HISTORY", "呢喃向导", "把南大校史做成校园互动剧情。"),
            new StoryVO(2L, 2L, "金陵旧梦夜游", "JINLING_NIGHT", "金陵引路人", "秦淮河、夫子庙、老门东的夜游剧情。")
    );

    private final Map<Long, List<StoryChapterVO>> chapters = Map.of(
            1L, List.of(
                    new StoryChapterVO(1001L, 1L, "序章：三江师范的来信", "你收到一封来自 1902 年的校园来信。", 1, 101L),
                    new StoryChapterVO(1002L, 1L, "第一站：北大楼记忆", "二次元向导带你靠近南大的百年建筑。", 2, 102L),
                    new StoryChapterVO(1003L, 1L, "终章：走向 2026", "把今天的校园探索保存为回忆卡。", 3, 102L)
            ),
            2L, List.of(
                    new StoryChapterVO(2001L, 2L, "序章：金陵旧梦邀请函", "今晚你收到一封来自秦淮河畔的邀请函。", 1, 201L),
                    new StoryChapterVO(2002L, 2L, "灯影任务", "在夫子庙回答文化问题并留下夜色记录。", 2, 202L),
                    new StoryChapterVO(2003L, 2L, "隐藏结局", "在老门东选择今晚的情绪结尾。", 3, 203L)
            )
    );

    private final Map<Long, StoryTaskVO> tasks = Map.of(
            3001L, new StoryTaskVO(3001L, 1002L, "CHOICE", "南大校史线从哪一年开始讲述？", List.of("1902", "1912", "2026"), 1L),
            3002L, new StoryTaskVO(3002L, 2002L, "PHOTO", "拍一张秦淮灯影照片，完成夜游打卡。", List.of(), 2L),
            3003L, new StoryTaskVO(3003L, 2003L, "EMOTION", "你觉得今晚更像哪种情绪？", List.of("热闹", "怀旧", "浪漫", "孤独"), 2L)
    );

    public StoryVO getStory(Long storyId) {
        return stories.stream()
                .filter(story -> story.storyId().equals(storyId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(404, "剧情不存在"));
    }

    public List<StoryChapterVO> listChapters(Long storyId) {
        getStory(storyId);
        return chapters.getOrDefault(storyId, List.of());
    }

    public StoryTaskVO getTask(Long taskId) {
        StoryTaskVO task = tasks.get(taskId);
        if (task == null) {
            throw new BusinessException(404, "任务不存在");
        }
        return task;
    }

    public TaskSubmitVO submitTask(Long taskId, TaskSubmitRequest request) {
        StoryTaskVO task = getTask(taskId);
        boolean correct = !"CHOICE".equals(task.taskType()) || "1902".equals(request.submitContent());
        int newProgress = Math.min(100, userProgress.getOrDefault(request.userId(), 0) + (correct ? 35 : 10));
        userProgress.put(request.userId(), newProgress);
        String nextHint = correct ? "任务完成，已推进下一段剧情。" : "答案未完全正确，已记录尝试，可重新挑战。";
        return new TaskSubmitVO(taskId, request.userId(), correct, newProgress, nextHint, correct ? task.rewardAchievementId() : null);
    }
}
