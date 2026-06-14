# 灵动金陵 · 交互代码

本目录包含「灵动金陵」应用的**前端 SPA + Spring Boot 后端**完整交互代码。

## 🎨 核心特色

- **水墨开屏动画** — 五幕手绘场景卷轴式展开，GSAP 驱动的视差交互
- **8 种人格选择** — 美食家、文学爱好者、夜游玩家…每种人格对应不同的地图风格与路线推荐
- **高德地图集成** — 基于 AMap JS API 2.0，支持 3D 视图、手势缩放拖拽、路线绘制、路径规划
- **34 条精品路线** — 覆盖文化历史 / 美食探店 / 摄影出片 / 南大校史 / 夜景 / 亲子等多主题，含剧情节点故事
- **全网 POI 坐标验证** — 87 个唯一 POI 经高德 PlaceSearch API 交叉验证
- **AI 南小鲸助手** — 对话式路线推荐，回答南京吃喝玩乐问题，默认使用阿里百炼 DashScope (Qwen-Turbo)
- **好友系统** — 搜索添加好友，JPA 持久化关系，1v1 私聊消息
- **路线编辑器** — 全屏地图 + 高德路径规划 API + 自由编辑站点 + 自定义路线保存
- **邀约卡系统** — 随机码分享 + routeKey 智能导航 + 一键接收自动保存
- **美团 API 集成** — 实时 POI 搜索、商家详情、优惠券（默认关闭，需配置开发者账号）

## 🏆 成就系统

| 成就 | 名称 | 解锁条件 |
|------|------|----------|
| 🏮 | 夜泊秦淮 | 完成秦淮夜游路线 |
| 🎓 | 南大记忆 | 完成南大校史路线 |
| 🍜 | 美食猎人 | 探索 3 家以上美食点位 |
| 🏛 | 文化漫游者 | 完成博物馆展览路线 |
| 📸 | 城市记录者 | 拍摄 5 个以上打卡点位 |
| ☕ | 午后慢享 | 完成午后餐茶路线 |
| 💜 | 首条复刻 | 复刻一条喜欢的路线 |
| 🤝 | 邀约达人 | 成功邀请朋友一起出发 |
| 🌟 | 金陵通 | 完成全部路线 |
| 📌 | 打卡达人 | 累计打卡 10 个站点 |
| 🌅 | 早鸟 | 在上午 9 点前出发探索 |
| 🦉 | 夜猫子 | 晚上 8 点后还在探索 |
| 💬 | 向导挚友 | 与南小鲸对话 10 次以上 |
| 🎴 | 收藏家 | 创建 3 条以上自定义路线 |
| 👥 | 社交达人 | 分享路线给 5 位好友 |
| 🔒 | +6 隐藏成就 | 触发特定条件解锁 |

## 🧑‍🎨 人格系统

| 人格 | 推荐路线 | 地图主题 |
|------|----------|----------|
| 美食家 | 食光漫步 / 秦淮夜游 | 暖色系，美食 POI 突出 |
| 文学爱好者 | 南大校史 / 午后餐茶 | 清新柔和，书店标注 |
| 夜游玩家 | 秦淮夜游 | 暗色模式，夜景突出 |
| 校园情怀派 | 南大校史 | 学院风，建筑标注 |
| 博物馆迷 | 博物馆展览线 | 典雅古风，展览标注 |
| 古风爱好者 | 秦淮夜游 | 古风手绘风格 |
| 自然探索者 | 午后餐茶 | 绿色系，公园标注 |
| 摄影达人 | 秦淮夜游 / 博物馆 | 高对比，打卡点标注 |

## 🔧 技术栈

- **前端**: 纯 JavaScript (无框架) + GSAP 动画 + Three.js
- **地图**: 高德地图 JS API 2.0 + 路径规划 API
- **后端**: Spring Boot 3.3.5 (Java 17) + JPA + H2 Database
- **AI**: 阿里百炼 DashScope (Qwen-Turbo) / DeepSeek / 豆包 — 可切换 Provider 模式
- **社交**: 好友关系管理 + 私聊消息存储 (H2)
- **性能**: RAF throttle + DOM 缓存 + localStorage 缓存层 + CSS containment

## 🚀 启动方式

```bash
# 进入源码目录
cd 主app代码/2026EL-main

# 启动 Spring Boot 应用
mvn clean spring-boot:run

# 访问
# 主应用: http://localhost:8080/app/index.html
# 路线编辑器: http://localhost:8080/app/route-editor.html
# 虚拟校园: http://localhost:8080/app/assets/workadventure/standalone.html
```

> 也可以使用 Python 开发服务器：`python proxy-server.py` — 绕过 Spring Boot 直接提供前端文件 + AI 代理。

## 📁 项目结构

```
主app代码/2026EL-main/
├── pom.xml                         # Maven 依赖配置
├── proxy-server.py                 # Python 开发服务器 + AI 代理
├── application.yml                 # Spring Boot 核心配置
├── src/main/java/com/nju/travel/
│   ├── TravelApplication.java      # 启动类 + @EnableScheduling
│   ├── common/                     # 注解 · 异常 · API 响应封装
│   ├── config/                     # Security · CORS · AI/美团配置
│   ├── integration/
│   │   ├── ai/                     # AI Provider (mock | openai | doubao)
│   │   ├── meituan/                # 美团 API 客户端
│   │   └── schedule/               # Cron 定时任务
│   ├── mycode/                     # 路径规划 API (高德代理)
│   └── module/
│       ├── ai/                     # AI 对话 + 路线规划
│       ├── auth/                   # 用户注册登录
│       ├── chat/                   # 好友私聊消息
│       ├── exhibition/             # 展览预约提醒
│       ├── friend/                 # 好友关系管理
│       ├── homepage/               # 首页 + 人格推荐
│       ├── invite/                 # 邀约卡系统
│       ├── meituan/                # 美团搜索代理
│       ├── nju/                    # 南大校史
│       ├── route/                  # 路线 + 自定义路线
│       ├── story/                  # 剧情章节任务
│       └── user/                   # 用户资料
└── src/main/resources/static/app/
    ├── index.html                  # 主 SPA 页面
    ├── route-editor.html           # 独立路线编辑器
    ├── app.js                      # 核心应用逻辑 (~12.8K 行)
    ├── styles.css                  # 全局样式 (~12.4K 行)
    ├── opening.js                  # 水墨开屏动画
    ├── routes-data.js              # 34 条路线数据
    ├── all-route-pois.js           # 87 个唯一 POI 坐标库
    ├── landmarks-data.js           # 74 个地标数据
    ├── verified-map-points.js      # 高德验证坐标
    ├── building-points.js          # 22 个建筑图文详情
    ├── supply-data.js              # 美食商户数据
    ├── persona-map-styles.js       # 人格地图样式
    ├── gsap.min.js                 # GSAP 动画库
    ├── ScrollTrigger.min.js        # GSAP 滚动触发器
    └── assets/                     # 图片 · 宠物 · 虚拟校园资源
```
