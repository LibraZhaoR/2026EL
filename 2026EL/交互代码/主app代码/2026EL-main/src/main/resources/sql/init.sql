CREATE DATABASE IF NOT EXISTS campus_nanjing_travel DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_nanjing_travel;

CREATE TABLE IF NOT EXISTS `user` (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nickname VARCHAR(64) NOT NULL,
    avatar_url VARCHAR(255),
    role_type VARCHAR(32),
    mood VARCHAR(32),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) COMMENT='用户信息表';

CREATE TABLE IF NOT EXISTS user_preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    tag_code VARCHAR(64) NOT NULL,
    tag_type VARCHAR(32) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_preference_user_id (user_id)
) COMMENT='用户偏好标签表';

CREATE TABLE IF NOT EXISTS route (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL,
    duration_minutes INT NOT NULL,
    budget_min INT DEFAULT 0,
    budget_max INT DEFAULT 0,
    crowd_tags VARCHAR(255),
    intensity VARCHAR(32),
    need_reserve TINYINT(1) NOT NULL DEFAULT 0,
    cover_url VARCHAR(255),
    is_official TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) COMMENT='路线基础信息表';

CREATE TABLE IF NOT EXISTS route_point (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    address VARCHAR(255),
    sort_order INT NOT NULL,
    intro TEXT,
    history_story TEXT,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    INDEX idx_route_point_route_id (route_id)
) COMMENT='路线点位表';

CREATE TABLE IF NOT EXISTS route_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_id BIGINT NOT NULL,
    tag_code VARCHAR(64) NOT NULL,
    tag_name VARCHAR(64) NOT NULL,
    tag_group VARCHAR(32) NOT NULL,
    INDEX idx_route_tag_route_id (route_id),
    INDEX idx_route_tag_code (tag_code)
) COMMENT='路线标签表';

CREATE TABLE IF NOT EXISTS user_route (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    source_route_id BIGINT,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    is_public TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_route_user_id (user_id)
) COMMENT='用户自制路线表';

CREATE TABLE IF NOT EXISTS story (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_id BIGINT NOT NULL,
    title VARCHAR(128) NOT NULL,
    story_type VARCHAR(64) NOT NULL,
    guide_role VARCHAR(64),
    summary TEXT,
    INDEX idx_story_route_id (route_id)
) COMMENT='剧情主线表';

CREATE TABLE IF NOT EXISTS story_chapter (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    story_id BIGINT NOT NULL,
    title VARCHAR(128) NOT NULL,
    content TEXT,
    sort_order INT NOT NULL,
    point_id BIGINT,
    INDEX idx_story_chapter_story_id (story_id)
) COMMENT='剧情章节表';

CREATE TABLE IF NOT EXISTS story_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chapter_id BIGINT NOT NULL,
    task_type VARCHAR(32) NOT NULL,
    question TEXT,
    options_json TEXT,
    answer VARCHAR(255),
    reward_achievement_id BIGINT,
    INDEX idx_story_task_chapter_id (chapter_id)
) COMMENT='剧情互动任务表';

CREATE TABLE IF NOT EXISTS user_story_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    story_id BIGINT NOT NULL,
    current_chapter_id BIGINT,
    progress_percent INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'STARTED',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_story (user_id, story_id)
) COMMENT='用户剧情进度表';

CREATE TABLE IF NOT EXISTS task_submit_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    submit_content TEXT,
    is_correct TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_submit_user_id (user_id),
    INDEX idx_task_submit_task_id (task_id)
) COMMENT='互动任务提交记录表';

CREATE TABLE IF NOT EXISTS achievement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,
    description VARCHAR(255),
    icon_url VARCHAR(255),
    unlock_type VARCHAR(64) NOT NULL,
    unlock_condition VARCHAR(255)
) COMMENT='成就配置表';

CREATE TABLE IF NOT EXISTS user_achievement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_achievement (user_id, achievement_id)
) COMMENT='用户成就解锁表';

CREATE TABLE IF NOT EXISTS exhibition (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(128) NOT NULL,
    venue VARCHAR(128),
    address VARCHAR(255),
    open_time VARCHAR(128),
    reserve_rule TEXT,
    reserve_url VARCHAR(255),
    release_time VARCHAR(64),
    cover_url VARCHAR(255)
) COMMENT='展览与场馆信息表';

CREATE TABLE IF NOT EXISTS reserve_remind (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    exhibition_id BIGINT NOT NULL,
    remind_time DATETIME NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'WAITING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reserve_remind_user_id (user_id),
    INDEX idx_reserve_remind_time (remind_time)
) COMMENT='预约提醒表';

CREATE TABLE IF NOT EXISTS invite_card (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    route_id BIGINT NOT NULL,
    invite_code VARCHAR(64) NOT NULL,
    meet_time DATETIME,
    meet_place VARCHAR(128),
    expected_cost INT,
    people_limit INT,
    share_url VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_invite_code (invite_code)
) COMMENT='路线邀约卡表';

CREATE TABLE IF NOT EXISTS ai_chat_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ai_chat_session_id (session_id)
) COMMENT='AI 对话记录表';

INSERT INTO achievement (id, name, description, icon_url, unlock_type, unlock_condition)
VALUES
    (1, '南大时光旅人', '完成南大 1902-2026 校史线任务。', '', 'TASK_COMPLETE', 'taskId=3001'),
    (2, '夜泊秦淮', '完成金陵夜游线灯影任务和隐藏结局。', '', 'STORY_COMPLETE', 'storyType=JINLING_NIGHT'),
    (3, '展览预约官', '创建一次博物馆或展览预约提醒。', '', 'RESERVE_REMIND', 'count>=1'),
    (4, '路线召集人', '生成一次闲逛搭子邀约卡。', '', 'INVITE_CARD', 'count>=1')
ON DUPLICATE KEY UPDATE name = VALUES(name);
