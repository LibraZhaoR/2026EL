# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"灵动金陵" (Lingdong Jinling) — a Nanjing city exploration app blending hand-drawn ink-wash aesthetics, AMap (高德地图) interaction, and an AI assistant. Built for the 2026 EL Intelligent Application Development & Innovation Competition.

Target: Gen-Z explorers and university students in Nanjing. The main app is a single-page application (`index.html`) with ~12K lines of core JavaScript — all vanilla JS, no framework.

## Build & Run

The main Spring Boot app lives at `交互代码/主app代码/2026EL-main/`. All commands below run from that directory.

```bash
# Build (skip tests — none exist)
mvn package -DskipTests

# Run the built JAR
java -jar target/campus-nanjing-travel-0.0.1-SNAPSHOT.jar

# Or build + run in one step
mvn spring-boot:run
```

The app serves on **port 8080**. Main page: `http://localhost:8080/app/index.html`.

### Before rebuilding: kill existing Java processes

The JAR file gets locked by running Java processes on Windows. Before `mvn package`:

```powershell
powershell -Command "Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force"
```

### Alternative: Python dev server (bypasses Spring Boot)

```bash
python proxy-server.py
```

Serves static files directly from `src/main/resources/static/app/` and proxies `/api/ai/chat` to Doubao (Volcengine Ark). Use this when you only need frontend changes without rebuilding.

### Route database service (optional)

```bash
cd route-database
pip install -r requirements.txt
python server.py  # FastAPI on port 8800
```

The Spring Boot app proxies `/api/route-db/**` to this service.

## Architecture

### Backend (Spring Boot 3.3.5, Java 17)

```
src/main/java/com/nju/travel/
├── TravelApplication.java          # @SpringBootApplication + @EnableScheduling
├── common/                          # Annotations, exceptions, API response wrappers
├── config/                          # SecurityConfig (permissive), WebConfig (CORS)
├── integration/
│   ├── ai/                          # AI client (mock | openai | doubao providers)
│   ├── meituan/                     # Meituan (美团) POI API client
│   └── schedule/                    # Cron jobs (exhibition reminders)
└── module/
    ├── achievement/                 # Achievement tracking (backend schema, unused at runtime)
    ├── ai/                          # AI chat/route-plan endpoints
    ├── auth/                        # User registration/login
    ├── exhibition/                  # Exhibition booking reminders
    ├── homepage/                    # Homepage + persona
    ├── invite/                      # Invite card generation
    ├── meituan/                     # Meituan POI search proxy
    ├── nju/                         # NJU history data
    ├── route/                       # Routes + custom routes CRUD → H2 database
    ├── story/                       # Story/chapter/task progression
    └── user/                        # User profile CRUD
```

- **Database:** H2 file-based at `./data/custom-routes` (MySQL-mode compatibility). JPA `ddl-auto: update` creates schema automatically. The `sql/init.sql` is a reference only, not used at runtime.
- **Security:** CSRF disabled, all requests permitted (`anyRequest().permitAll()`). Rate limiting on `/api/**`.
- **AI:** Configured via `travel.ai.provider` in `application.yml`. Default is `openai` pointing to DeepSeek API (`deepseek-chat` model). Alternatives: `mock` (keyword-based replies) or `doubao` (Volcengine Ark).

### Frontend (vanilla JS SPA)

All static files under `src/main/resources/static/app/`:

| File | Lines | Role |
|------|-------|------|
| `app.js` | ~12K | **Core application logic** — everything: opening animation, Three.js 3D scroll, persona swiper (8 cards), AMap map, route rendering, story overlays, AI chat, invite cards, achievement system, wheel navigation (5 tabs: routes/community/home/pet/profile), settings modal |
| `styles.css` | ~12K | Single monolithic stylesheet — Impressionist design system with CSS custom properties, Art Nouveau botanical themes, Mucha-inspired decorative frames |
| `index.html` | ~430 | Main SPA shell with inline templates for all sections |
| `route-editor.html` | separate | Route editor with AMap integration for custom walking/driving routes |
| `routes-data.js` | ~490 | 35 curated route definitions (12 cultural, 7 food, 5 photo, 4 nju, 4 night) |
| `landmarks-data.js` | ~1.3K | 74 Nanjing landmark POIs with verified coordinates |
| `verified-map-points.js` | ~1.6K | Amap-verified POIs with POI IDs and addresses |
| `persona-map-styles.js` | ~80 | 8 persona → Amap map style mappings |
| `supply-data.js` | ~540 | 30+ merchant/food business records (simulated Meituan data) |
| `opening.js` | ~880 | Standalone Three.js ink-wash opening animation |
| `apple-refresh.css` | separate | Apple-inspired theme overrides (blue tint, SF feel) |

### Key architectural patterns

1. **Data is mostly client-side:** Routes, landmarks, personae are loaded as `window.*` globals from the data JS files, not fetched from the backend API. The backend H2 database is primarily for custom routes, user profiles, and invite cards.

2. **localStorage for client persistence:**
   - `nj_achievements` — achievement unlock state (15 achievements, 6 hidden)
   - `nj_user_profile` — user profile data (name, avatar, bio)
   - `nj_custom_routes` — user-created custom routes (rendered as stacked cards on route page)

3. **SPA navigation:** The wheel navbar has 5 tabs (路线/community/首页/pet/我的). Tab switching shows/hides DOM sections, no routing library.

4. **AMap integration:** Loaded via CDN (`webapi.amap.com/loader.js`). The `initAMap()` function in app.js handles map initialization, marker rendering, and route drawing.

5. **CSS is monolithic:** `styles.css` is ~12K lines. When adding new styles, append to the end with clear section comments. Match the existing design language: CSS custom properties for colors, organic shapes, gold relief borders for premium elements.

## Key conventions

- **Incremental changes only:** Never delete existing code. Append new CSS at the bottom. Add new JS functions without modifying existing ones unless explicitly needed.
- **UI consistency:** Match the existing Impressionist/Art Nouveau design language. Use the CSS custom properties defined at the top of `styles.css`.
- **No framework:** The frontend is pure vanilla JavaScript. Do not introduce npm, bundlers, or frameworks.
- **No tests exist:** There is no `src/test` directory. The `spring-boot-test` dependency is declared but unused.
- **Chinese text content:** All user-facing text is in Chinese. Route names, achievement names, UI labels — keep them in Chinese.
- **GitHub URL:** `https://github.com/LibraZhaoR/2026EL`
- **Developers:** LibraZhaoR, Li Xiangze, Du Xinyao

## Design system (from DESIGN.md)

- **Style:** Eclectic Art Nouveau — Mucha botanical frames, Impressionist light, Basque stone textures
- **Palette:** Sunset Orange (`#E07A5F`) primary, Deep Sea Blue (`#3D405B`) secondary, Sage Green (`#81B29A`) tertiary, Ancient Wall cream (`#F4F1DE`) background, Relief Gold (`#D4AF37`) for achievements/unlocks
- **Typography:** Epilogue (headlines), Source Sans 3 (body), Work Sans (labels). Chinese: Source Han Sans (body), Artistic Songti (display)
- **Cards:** 0.5rem rounded corners, "Golden Relief" borders for premium, tonal layering instead of drop shadows
- **Overlays:** Frosted glass with film grain ("Impressionist Glassmorphism")
