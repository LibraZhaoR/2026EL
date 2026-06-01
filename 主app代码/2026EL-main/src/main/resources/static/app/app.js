const API_BASE = window.location.protocol === "file:" || window.location.port === "5173" ? "http://localhost:8080" : "";

const state = {
    routes: [],
    routeFilter: "all",
    map: null,
    markerLayer: null,
    routeLayer: null,
    pointCache: new Map()
};

const screens = {
    splash: document.querySelector("#splash-screen"),
    onboarding: document.querySelector("#onboarding-screen"),
    home: document.querySelector("#home-screen"),
    routes: document.querySelector("#routes-screen"),
    story: document.querySelector("#story-screen"),
    nju: document.querySelector("#nju-screen"),
    exhibitions: document.querySelector("#exhibitions-screen"),
    achievements: document.querySelector("#achievements-screen"),
    ai: document.querySelector("#ai-screen")
};

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
    document.querySelector(`#${screenId}`).classList.add("active");
    const tab = screenId.replace("-screen", "");
    document.querySelectorAll(".bottom-nav button").forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tab);
    });
    if (screenId === "home-screen" && state.map) {
        setTimeout(() => state.map.invalidateSize(), 80);
    }
}

function bindNavigation() {
    document.querySelectorAll("[data-go]").forEach((button) => {
        button.addEventListener("click", () => showScreen(button.dataset.go));
    });
    document.querySelectorAll("[data-tab]").forEach((button) => {
        button.addEventListener("click", () => showScreen(`${button.dataset.tab}-screen`));
    });
    document.querySelectorAll(".choice-card, .pill").forEach((button) => {
        button.addEventListener("click", () => {
            button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
            button.classList.add("selected");
        });
    });
    document.querySelectorAll(".filter-chip").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("selected"));
            button.classList.add("selected");
            state.routeFilter = button.dataset.filter;
            renderRoutes();
        });
    });
    document.addEventListener("click", (event) => {
        const routeCard = event.target.closest(".route-card");
        if (!routeCard) return;
        focusRouteOnMap(Number(routeCard.dataset.routeId));
        if (routeCard.dataset.routeId === "1") {
            showScreen("nju-screen");
        } else if (routeCard.classList.contains("night")) {
            showScreen("story-screen");
        } else if (routeCard.textContent.includes("展览")) {
            showScreen("exhibitions-screen");
        }
    });
    document.querySelectorAll("[data-map-focus]").forEach((button) => {
        button.addEventListener("click", () => focusMapGroup(button.dataset.mapFocus));
    });
}

function bindGuideSheet() {
    const sheet = document.querySelector("#guide-sheet");
    document.querySelectorAll("[data-open-guide]").forEach((button) => {
        button.addEventListener("click", () => sheet.classList.add("open"));
    });
    document.querySelectorAll("[data-close-guide]").forEach((button) => {
        button.addEventListener("click", () => sheet.classList.remove("open"));
    });
}

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options
    });
    const result = await response.json();
    if (result.code !== 200) {
        throw new Error(result.msg || "请求失败");
    }
    return result.data;
}

function routeCard(route) {
    const className = route.routeId === 1 ? "nju" : route.title.includes("夜游") ? "night" : route.category === "生活" ? "life" : "";
    const tags = route.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
    const reserve = route.needReserve ? `<span class="tag reserve">需预约</span>` : "";
    return `
        <article class="route-card ${className}" data-route-id="${route.routeId}">
            <div class="route-title">${route.title}</div>
            <div class="route-meta">
                <span class="meta">${route.durationMinutes} 分钟</span>
                <span class="meta">${route.intensity === "LOW" ? "轻松" : "适中"}</span>
                <span class="meta">预算 ${route.budgetMin}-${route.budgetMax}</span>
                ${reserve}
            </div>
            <div class="route-meta">${tags}</div>
            <p class="route-desc">${route.crowdTags}</p>
        </article>
    `;
}

function renderRoutes() {
    const filtered = state.routes.filter((route) => {
        if (state.routeFilter === "all") return true;
        if (state.routeFilter === "预约") return route.needReserve;
        return route.category === state.routeFilter;
    });
    document.querySelector("#route-list").innerHTML = filtered.map(routeCard).join("");
    const homeRoutes = document.querySelector("#home-routes");
    if (homeRoutes) {
        homeRoutes.innerHTML = state.routes.slice(0, 2).map(routeCard).join("");
    }
}

async function loadRoutes() {
    try {
        const page = await request("/api/routes");
        state.routes = page.list;
        renderRoutes();
        await loadRoutePointsForMap();
        initMap();
    } catch (error) {
        const fallback = [
            { routeId: 1, title: "南大新生校史线：从三江师范到今天", category: "文化", durationMinutes: 150, budgetMin: 0, budgetMax: 50, crowdTags: "南大新生,访校同学,校友", intensity: "LOW", needReserve: false, tags: ["学校教育", "校史", "二次元向导"] },
            { routeId: 2, title: "金陵夜游线：秦淮河-夫子庙-老门东", category: "文化", durationMinutes: 210, budgetMin: 80, budgetMax: 200, crowdTags: "第一次来南京,情侣,朋友聚会", intensity: "MEDIUM", needReserve: false, tags: ["景点", "夜游", "剧情任务"] }
        ];
        state.routes = fallback;
        renderRoutes();
        initMap();
    }
}

async function loadRoutePointsForMap() {
    const detailRequests = state.routes.map(async (route) => {
        try {
            const detail = await request(`/api/routes/${route.routeId}`);
            state.pointCache.set(route.routeId, detail.points || []);
        } catch (error) {
            state.pointCache.set(route.routeId, []);
        }
    });
    await Promise.all(detailRequests);
}

function routeKind(route) {
    if (route.routeId === 1) return "nju";
    if (route.title.includes("夜游")) return "night";
    if (route.needReserve || route.title.includes("展览")) return "exhibition";
    if (route.category === "生活") return "life";
    return "city";
}

function routeColor(kind) {
    return {
        nju: "#7a4e8a",
        night: "#334e68",
        exhibition: "#c9825a",
        life: "#a8cbb7",
        city: "#6fa8a6"
    }[kind] || "#6fa8a6";
}

function initMap() {
    const mapEl = document.querySelector("#nanjing-map");
    if (!mapEl || state.map) return;
    if (typeof L === "undefined") {
        mapEl.classList.add("map-fallback");
        mapEl.innerHTML = "<p>地图资源暂时无法加载。后端路线数据仍可在下方卡片查看。</p>";
        return;
    }

    state.map = L.map("nanjing-map", {
        zoomControl: true,
        attributionControl: false
    }).setView([32.045, 118.79], 12);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap © CARTO"
    }).addTo(state.map);

    state.markerLayer = L.layerGroup().addTo(state.map);
    state.routeLayer = L.layerGroup().addTo(state.map);
    renderMapMarkers();
    setTimeout(() => state.map.invalidateSize(), 160);
}

function renderMapMarkers() {
    if (!state.map || !state.markerLayer) return;
    state.markerLayer.clearLayers();
    state.routeLayer.clearLayers();

    state.routes.forEach((route) => {
        const kind = routeKind(route);
        const points = state.pointCache.get(route.routeId) || [];
        points.forEach((point, index) => {
            if (!point.latitude || !point.longitude) return;
            const icon = L.divIcon({
                className: "",
                html: `<div class="map-marker ${kind}"><span>${index + 1}</span></div>`,
                iconSize: [34, 34],
                iconAnchor: [17, 32],
                popupAnchor: [0, -28]
            });
            const marker = L.marker([point.latitude, point.longitude], { icon })
                .bindPopup(`<strong>${point.name}</strong>${point.intro}<br><span>${route.title}</span>`);
            marker.on("click", () => focusRouteOnMap(route.routeId, false));
            marker.addTo(state.markerLayer);
        });
    });
}

function focusRouteOnMap(routeId, drawLine = true) {
    if (!state.map) return;
    const route = state.routes.find((item) => item.routeId === routeId);
    const points = state.pointCache.get(routeId) || [];
    const latLngs = points
        .filter((point) => point.latitude && point.longitude)
        .map((point) => [point.latitude, point.longitude]);
    if (!latLngs.length) return;

    const bounds = L.latLngBounds(latLngs);
    state.map.fitBounds(bounds.pad(0.38), { animate: true, duration: 0.5 });
    state.routeLayer.clearLayers();
    if (drawLine && route) {
        L.polyline(latLngs, {
            color: routeColor(routeKind(route)),
            weight: 5,
            opacity: 0.78,
            dashArray: routeKind(route) === "night" ? "8 8" : null
        }).addTo(state.routeLayer);
    }
}

function focusMapGroup(group) {
    if (!state.map) return;
    if (group === "all") {
        const allPoints = [...state.pointCache.values()].flat()
            .filter((point) => point.latitude && point.longitude)
            .map((point) => [point.latitude, point.longitude]);
        if (allPoints.length) {
            state.routeLayer.clearLayers();
            state.map.fitBounds(L.latLngBounds(allPoints).pad(0.2), { animate: true, duration: 0.5 });
        }
        return;
    }
    const route = state.routes.find((item) => routeKind(item) === group);
    if (route) {
        focusRouteOnMap(route.routeId);
    }
}

async function loadTimeline() {
    const container = document.querySelector("#nju-timeline");
    try {
        const items = await request("/api/nju/timeline");
        container.innerHTML = items.map((item) => `
            <article class="timeline-item">
                <div class="timeline-year">${item.year}</div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </article>
        `).join("");
    } catch (error) {
        container.innerHTML = `<article class="timeline-item"><div class="timeline-year">1902</div><h3>三江师范学堂</h3><p>南大历史叙事起点，适合作为剧情序章。</p></article>`;
    }
}

async function loadExhibitions() {
    const container = document.querySelector("#exhibition-list");
    try {
        const items = await request("/api/exhibitions");
        container.innerHTML = items.map((item) => `
            <article class="exhibition-card">
                <p class="eyebrow">${item.venue}</p>
                <h3>${item.name}</h3>
                <p>${item.address}</p>
                <div class="route-meta">
                    <span class="meta">${item.openTime}</span>
                    <span class="tag reserve">${item.releaseTime} 放票</span>
                </div>
                <p>${item.reserveRule}</p>
                <div class="reserve-row">
                    <span class="meta">官方入口跳转</span>
                    <button class="small-btn">设提醒</button>
                </div>
            </article>
        `).join("");
    } catch (error) {
        container.innerHTML = `<article class="exhibition-card"><h3>南京博物院常设展</h3><p>每日 18:00 放票，可提前 7 日预约。</p></article>`;
    }
}

async function loadAchievements() {
    const container = document.querySelector("#achievement-list");
    try {
        const items = await request("/api/achievements");
        container.innerHTML = items.map((item, index) => `
            <article class="achievement-card ${index > 1 ? "locked" : ""}">
                <div class="achievement-icon">${index > 1 ? "锁" : "章"}</div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </article>
        `).join("");
    } catch (error) {
        container.innerHTML = `<article class="achievement-card"><div class="achievement-icon">章</div><h3>夜泊秦淮</h3><p>完成金陵夜游线。</p></article>`;
    }
}

function bindStoryTask() {
    const button = document.querySelector("#submit-task-btn");
    const feedback = document.querySelector("#task-feedback");
    button.addEventListener("click", async () => {
        button.textContent = "提交中...";
        try {
            const data = await request("/api/story-tasks/3002/submit", {
                method: "POST",
                body: JSON.stringify({ userId: 1, submitContent: "灯影照片" })
            });
            feedback.textContent = `${data.nextHint} 当前剧情进度 ${data.progressPercent}%。`;
            button.textContent = "已完成";
        } catch (error) {
            feedback.textContent = "任务已记录，等后端重启后可继续提交。";
            button.textContent = "已完成";
        }
    });
}

function bindChat() {
    const form = document.querySelector("#chat-form");
    const input = document.querySelector("#chat-input");
    const windowEl = document.querySelector("#chat-window");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        input.value = "";
        windowEl.insertAdjacentHTML("beforeend", `<div class="chat user">${message}</div>`);
        try {
            const data = await request("/api/ai/chat", {
                method: "POST",
                body: JSON.stringify({ userId: 1, message, guideRole: "二次元城市向导" })
            });
            windowEl.insertAdjacentHTML("beforeend", `<div class="chat assistant">${data.content}</div>`);
        } catch (error) {
            windowEl.insertAdjacentHTML("beforeend", `<div class="chat assistant">我暂时连不上后端，但可以先按“时间 + 心情 + 预算”帮你做界面演示。</div>`);
        }
        windowEl.scrollTop = windowEl.scrollHeight;
    });
}

async function init() {
    bindNavigation();
    bindGuideSheet();
    bindStoryTask();
    bindChat();
    await Promise.all([loadRoutes(), loadTimeline(), loadExhibitions(), loadAchievements()]);
}

init();
