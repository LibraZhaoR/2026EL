# 🏮 灵动金陵 · Lingdong Jinling

> **2026 EL 智能应用开发与创新大赛参赛作品**
>
> 一款融合手绘水墨美学、高德地图深度交互、AI 智慧伴游的南京城市探索应用。以"新艺术运动"设计语言重塑城市漫游体验，为 Gen-Z 探索者和在宁大学生打造一本活的数字旅行手账。

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?logo=springboot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java-17-orange?logo=java" alt="Java 17">
  <img src="https://img.shields.io/badge/前端-纯_Vanilla_JS-F7DF1E?logo=javascript" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/地图-高德_JS_API_2.0-0099FF" alt="AMap">
  <img src="https://img.shields.io/badge/AI-DeepSeek_|_豆包-6C4AB6" alt="AI">
  <img src="https://img.shields.io/badge/动画-GSAP_|_Three.js-88CE02?logo=threedotjs" alt="Animation">
  <img src="https://img.shields.io/badge/数据库-H2-blue" alt="H2">
</p>

---

## ✨ 项目简介

**灵动金陵**不止是一款地图导航应用——它是一款有"人格"的城市探索伴侣。从打开 App 那一刻的水墨卷轴动画，到选择你今日的"探索人格"，再到 AI 向导「南小鲸」为你量身推荐路线——每一步都像翻开一本手绘旅行手账。

我们在地图之上叠加了**故事剧情**、**成就收集**、**社区分享**、**宠物陪伴**和**虚拟校园**，让"探索城市"这件事变得像玩一场沉浸式剧本杀。

---

## 🎨 设计理念

本项目遵循自建的 **[灵动金陵设计系统 (DESIGN.md)](./DESIGN.md)**——一套完整的"折衷新艺术运动 (Eclectic Art Nouveau)" 设计语言：

| 维度 | 描述 |
|------|------|
| **风格融合** | 巴斯克石材质感 × 穆夏植物装饰 × 印象派光影 |
| **色彩体系** | 日落橙 (`#E07A5F`) · 深海蓝 (`#3D405B`) · 鼠尾草绿 (`#81B29A`) · 古城墙白 (`#F4F1DE`) · 浮雕金 (`#D4AF37`) |
| **视觉隐喻** | 界面如同一张张手绘明信片堆叠——金色浮雕边框、水墨笔触下划线、印象派毛玻璃遮罩 |
| **日夜间切换** | 暖光模式（日间）→ 月光模式（夜间），Deep Sea Blue 为基底自动过渡 |
| **排版** | Epilogue（标题）+ Source Sans 3（正文）+ Work Sans（标签），中文匹配思源黑体 + 艺术宋体 |

---

## 🚀 核心功能矩阵

### 🎬 一、沉浸式开屏体验
- **五幕水墨卷轴动画**：基于 Three.js + GSAP 的视差交互开屏
- 金陵地标手绘场景逐幕展开：秦淮河 → 明城墙 → 梧桐大道 → 夫子庙 → 紫峰大厦
- 支持跳过 / 回看，动画时长可配置

### 🧑‍🎨 二、8 种探索人格系统
首次进入选择你的"今日人格"，每种人格对应不同的地图视觉风格和路线推荐：

| 人格 | 推荐路线倾向 | 地图主题 | 适用场景 |
|------|-------------|----------|----------|
| 🍜 **美食家** | 午后餐茶 / 秦淮夜游 | 暖色系，美食 POI 突出 | 想吃遍南京的你 |
| 📚 **文学爱好者** | 南大校史 / 午后餐茶 | 清新柔和，书店标注 | 爱逛书店咖啡馆 |
| 🌙 **夜游玩家** | 秦淮夜游 | 暗色模式，夜景突出 | 享受南京夜生活 |
| 🎓 **校园情怀派** | 南大校史 | 学院风，建筑标注 | NJUer 和校园控 |
| 🏛️ **博物馆迷** | 博物馆展览线 | 典雅古风，展览标注 | 展览不落一场 |
| 🏯 **古风爱好者** | 秦淮夜游 | 古风手绘风格 | 汉服出行标配 |
| 🌿 **自然探索者** | 午后餐茶 | 绿色系，公园标注 | 钟山玄武湖选手 |
| 📸 **摄影达人** | 秦淮夜游 / 博物馆 | 高对比，打卡点标注 | 出片第一优先级 |

> 人格可随时切换，地图主题和推荐内容实时更新。

### 🗺️ 三、35 条主题路线 × 74 个精准地标

**路线分类**（数据文件：[routes-data.js](./交互代码/主app代码/2026EL-main/src/main/resources/static/app/routes-data.js)）：

| 分类 | 数量 | 代表路线 |
|------|------|----------|
| 🏯 文化历史 | 12 条 | 秦淮文脉线、老城南漫步、明城墙巡礼、民国建筑线… |
| 🍜 美食探店 | 7 条 | 科巷小吃线、南大后街、老门东美食巷… |
| 📸 摄影出片 | 5 条 | 颐和路梧桐光影、玄武湖日落线、紫峰天际线… |
| 🎓 南大专线 | 4 条 | 鼓楼校史线、仙林探索线、浦口记忆… |
| 🌃 夜景路线 | 4 条 | 秦淮夜游、眼桥夜色、新街口霓虹… |
| 🎯 更多主题 | 3+ 条 | 亲子研学、艺术看展、佛系禅意… |

每条路线包含：**站点详情** + **剧情故事文本** + **时长/费用/难度** + **封面图** + **关联人格标签**。

**地标数据**：74 个南京地标 POI，全部通过高德 API 坐标校准（[landmarks-data.js](./交互代码/主app代码/2026EL-main/src/main/resources/static/app/landmarks-data.js) + [verified-map-points.js](./交互代码/主app代码/2026EL-main/src/main/resources/static/app/verified-map-points.js)）。

### 🗣️ 四、AI 向导「南小鲸」
- **多模型支持**：DeepSeek Chat / 豆包 (Volcengine Ark) / OpenAI 兼容接口，通过配置文件灵活切换
- **对话式路线推荐**：理解你的偏好，推荐最匹配的路线
- **南京知识问答**：吃喝玩乐、历史文化、实时资讯
- **上下文感知**：结合当前选中的人格和路线给出个性化建议
- **后端模块**：`module/ai/` — 完整的 AI 对话 + 路线规划 API

### ✍️ 五、路线编辑器
- **自由创建路线**：在地图上点击添加途经点，拖拽调整顺序
- **自动路径规划**：调用高德路径规划 API，自动生成步行/驾车路线
- **全屏地图模式**：沉浸式地图查看，路线一目了然
- **预填充模板**：基于现有路线快速修改
- **保存为自定义路线**：本地存储，出现在"我的路线"列表中
- 独立页面：[route-editor.html](./交互代码/主app代码/2026EL-main/src/main/resources/static/app/route-editor.html)

### 👥 六、社区发现系统
- **微博式信息流**：图文 + 视频帖子，按路线/美食/摄影/展览等主题分类
- **路线评价**：用户对路线的评分与点评
- **搜索 + 筛选**：按分类、关键词筛选社区内容
- **种草互动**：点赞、收藏、分享
- 后端模块：`module/route/` · 数据存储：H2 Database

### 🦆 七、桌面宠物 · 金陵鸭鸭 / Pet77 V2
- **陪伴精灵**：可爱像素风桌面宠物，在页面角落活动
- **双击交互**：双击宠物弹出可拖拽对话框，直接与 AI「南小鲸」对话
- **养成系统 (Pet77 V2)**：喂食、抚摸、玩耍 — 提升幸福感和亲密度
- **多种状态动画**：待机、行走、跳跃、挥手等帧动画
- 数据持久化到 localStorage

### 🎭 八、路线剧情系统 (Story Mode)
- **章节式叙事**：每条路线拆分为多个章节 (Chapter) → 任务 (Task)
- **任务驱动探索**：到达站点 → 完成任务 → 解锁下一章节
- **沉浸式故事文本**：每个站点配有剧情对话和场景描写
- 后端模块：`module/story/` — Story / Chapter / Task 完整 CRUD

### 🏆 九、成就系统
**15 个常规成就 + 6 个隐藏成就**，覆盖探索、社交、收集、挑战四个维度：

| 类型 | 成就示例 |
|------|----------|
| 🗺️ 探索类 | 夜泊秦淮、南大记忆、文化漫游者、金陵通（完成全部路线） |
| 🍜 体验类 | 美食猎人（探索 3+ 美食点）、午后慢享、城市记录者（5+ 打卡点） |
| 🕐 时间类 | 早鸟（9:00 前出发）、夜猫子（20:00 后还在探索） |
| 👥 社交类 | 邀约达人、社交达人（分享 5 次）、向导挚友（对话 10+ 次） |
| 🎴 收集类 | 收藏家（创建 3+ 自定义路线）、首条复刻 |
| 🔒 隐藏 | 6 个隐藏成就，触发特定条件解锁 |

成就数据存储于 localStorage，解锁时弹出浮雕金边框动画提示。

### 🎫 十、邀约卡系统
- **生成精美邀约卡**：选择路线 → 设置时间地点 → 生成手绘风格邀约卡片
- **一键分享**：复制链接 / 生成图片分享给好友
- **邀约管理**：查看已发送和已收到的邀约
- 后端模块：`module/invite/`

### 🏛️ 十一、展览预约与提醒
- **展览信息聚合**：南京各大博物馆/美术馆展览信息
- **预约提醒**：设置观展提醒，到期 Cron 定时推送通知
- 后端模块：`module/exhibition/` + `integration/schedule/`（`@EnableScheduling`）

### 🏫 十二、南大校史数据
- **南大历史知识库**：鼓楼/仙林/浦口校区历史建筑与故事
- **校史路线**：专门定制的校园漫步路线
- 后端模块：`module/nju/`

### 🌐 十三、WorkAdventure 虚拟校园
- **独立虚拟校园引擎**：基于 WorkAdventure 开源项目二次开发
- **南大软院虚拟地图**：像素风虚拟校园，支持多人实时互动
- **音视频通话**：进入同一房间自动连接
- 代码路径：[assets/workadventure/](./交互代码/主app代码/2026EL-main/src/main/resources/static/app/assets/workadventure/)

### 🏪 十四、美团 POI 集成
- **实时商家搜索**：周边餐饮/咖啡/便利店 POI 搜索
- **商家详情**：评分、人均、营业时间、地址
- **优惠券展示**：美团优惠券信息
- 后端模块：`module/meituan/` + `integration/meituan/`

### 👤 十五、用户系统
- **注册/登录**：JWT-free 简化认证
- **个人主页**：头像（可自定义）、昵称、个性签名
- **我的路线**：自定义路线 + 复刻路线管理
- **成就墙**：已解锁成就以插画卡片形式展示
- 后端模块：`module/auth/` + `module/user/`

---

## 🏗️ 技术架构

```
┌──────────────────────────────────────────────────────┐
│                    前端 (SPA)                          │
│  Vanilla JS · GSAP · Three.js · 高德 JS API 2.0      │
│  12K+ 行核心 JS · 12K+ 行 CSS · 整体式设计系统         │
├──────────────────────────────────────────────────────┤
│                  Spring Boot 3.3.5                     │
│                    Java 17 · Maven                     │
├──────────┬──────────┬──────────┬─────────────────────┤
│   AI     │  地图/路线 │  社区/社交 │   展览/提醒         │
│ DeepSeek │ 高德API   │  H2 DB   │  Cron Schedule     │
│ 豆包Ark  │ 美团API   │  REST    │  @Scheduled        │
├──────────┴──────────┴──────────┴─────────────────────┤
│               H2 File Database (MySQL-mode)            │
│       用户 · 路线 · 邀约 · 展览 · 成就 · 故事          │
└──────────────────────────────────────────────────────┘
```

### 技术选型说明

| 层面 | 技术 | 选择理由 |
|------|------|----------|
| **前端框架** | 无框架，纯 Vanilla JS | 零依赖、极致轻量；比赛场景看重原生能力展示 |
| **动画** | GSAP + Three.js | GSAP 实现卷轴视差；Three.js 驱动水墨开屏和 0520 游戏 |
| **地图** | 高德 JS API 2.0 | 国内最稳定地图服务、3D 视图、路径规划 API 完善 |
| **后端** | Spring Boot 3.3.5 | 成熟生态、JPA 自动建表、`@EnableScheduling` 开箱即用 |
| **数据库** | H2 File (MySQL 兼容模式) | 零配置部署、数据持久化到文件、适合比赛演示 |
| **AI** | 可切换 Provider 模式 | `mock` 本地演示 / `openai` 兼容 (DeepSeek) / `doubao` (火山引擎) |
| **CSS** | 整体式 CSS 设计系统 | 12K 行单一样式表、CSS 自定义属性驱动、无预处理器 |

### 后端模块结构

```
src/main/java/com/nju/travel/
├── TravelApplication.java          # 启动类 + @EnableScheduling
├── common/                          # 注解 · 异常 · API 响应包装
├── config/                          # Security (全放行) · WebConfig (CORS)
├── integration/
│   ├── ai/                          # AI Provider (mock | openai | doubao)
│   ├── meituan/                     # 美团 POI API 客户端
│   └── schedule/                    # Cron 定时任务 (展览提醒)
└── module/
    ├── achievement/                 # 成就系统
    ├── ai/                          # AI 对话 / 路线规划 API
    ├── auth/                        # 用户注册登录
    ├── exhibition/                  # 展览信息 + 预约提醒
    ├── homepage/                    # 首页 + 人格推荐
    ├── invite/                      # 邀约卡生成
    ├── meituan/                     # 美团搜索代理
    ├── nju/                         # 南大校史数据
    ├── route/                       # 路线 + 自定义路线 CRUD
    ├── story/                       # 故事/章节/任务系统
    └── user/                        # 用户资料管理
```

### 前端文件结构

```
src/main/resources/static/app/
├── index.html                      # 主 SPA 页面（含所有内联模板）
├── route-editor.html               # 独立路线编辑器页面
├── app.js                          # 核心应用逻辑 (~12K 行)
├── styles.css                      # 全局样式表 (~12K 行)
├── opening.js                      # Three.js 水墨开屏动画
├── routes-data.js                  # 35 条主题路线数据
├── landmarks-data.js               # 74 个南京地标 POI
├── verified-map-points.js          # 高德验证 POI 坐标
├── building-points.js              # 建筑级定位数据
├── supply-data.js                  # 商户/美食模拟数据
├── persona-map-styles.js           # 8 种人格地图样式映射
├── assets/pets/                    # 宠物精灵资源
└── assets/workadventure/           # 虚拟校园引擎
```

---

## 🚀 快速启动

### 前置要求
- **JDK 17+**
- **Maven 3.6+**
- （可选）Python 3.8+ — 用于 dev server 和 route-database 微服务

### 方式一：Spring Boot 完整启动

```bash
# 进入主应用目录
cd 交互代码/主app代码/2026EL-main

# 清理并构建启动（推荐使用 clean 避免构建缓存问题）
mvn clean spring-boot:run

# 或先清理打包再运行
mvn clean package -DskipTests
java -jar target/campus-nanjing-travel-0.0.1-SNAPSHOT.jar
```

访问：
- 主应用：`http://localhost:8080/app/index.html`
- 路线编辑器：`http://localhost:8080/app/route-editor.html`
- WorkAdventure 虚拟校园：`http://localhost:8080/app/assets/workadventure/standalone.html`

### 方式二：Python Dev Server（仅前端开发）

```bash
cd 交互代码/主app代码/2026EL-main
python proxy-server.py
```

直接提供静态文件，并代理 `/api/ai/chat` 到豆包 API。适合纯前端调试，无需重启 Java。

### 方式三：Route Database 微服务（可选）

```bash
cd route-database
pip install -r requirements.txt
python server.py    # FastAPI → port 8800
```

Spring Boot 通过 `/api/route-db/**` 代理到此服务。

### Windows 特别注意

重新打包前需先终止占用 JAR 的 Java 进程：

```powershell
powershell -Command "Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force"
```

---

## ⚙️ 配置说明

核心配置文件：[application.yml](./交互代码/主app代码/2026EL-main/src/main/resources/application.yml)

```yaml
# AI Provider 切换
travel.ai.provider: openai    # mock | openai | doubao

# openai 模式下使用 DeepSeek
travel.ai.openai:
  api-key: ${DEEPSEEK_API_KEY}
  model: deepseek-chat

# doubao 模式下使用火山引擎
travel.ai.doubao:
  api-key: ${DOUBAO_API_KEY}
  model: doubao-pro-32k

# H2 数据库文件路径
spring.datasource.url: jdbc:h2:file:./data/custom-routes;MODE=MySQL
```

### 高德地图 Key 配置

高德 JS API Key 配置于前端 HTML 中：
- `index.html` → 主应用地图
- `route-editor.html` → 路线编辑器地图

使用前请替换为自己的高德 Key（需开启 Web服务 API + JS API 权限）。

---

## 👥 开发团队

| 成员 | GitHub | 角色 |
|------|--------|------|
| **LibraZhaoR** | [@LibraZhaoR](https://github.com/LibraZhaoR) | — |
| **Li Xiangze** | — | — |
| **Du Xinyao** | — | — |

> 📌 项目仓库：[github.com/LibraZhaoR/2026EL](https://github.com/LibraZhaoR/2026EL)

---

## 📄 相关文档

| 文档 | 路径 | 内容 |
|------|------|------|
| 🎨 设计系统 | [DESIGN.md](./DESIGN.md) | 完整设计规范：色彩 · 排版 · 组件 · 动效 |
| 📋 CLAUDE.md | [CLAUDE.md](./CLAUDE.md) | AI 协作开发指引（Claude Code 专用） |
| 📖 前端设计规范 | [前端设计规范.md](./交互代码/主app代码/2026EL-main/前端设计规范.md) | 前端实现设计细节 |

---

## 📝 许可证

本项目为 **2026 EL 智能应用开发与创新大赛** 参赛作品，仅供学习与竞赛用途。

---

<p align="center">
  <sub>Made with ❤️ in Nanjing · 2026</sub>
</p>
