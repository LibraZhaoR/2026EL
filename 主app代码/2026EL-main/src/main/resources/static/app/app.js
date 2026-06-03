/* ═══════════════════════════════════════
   南京城市手绘卷轴
   墨迹晕开转场 · 视差交互 · 印章启程
   ═══════════════════════════════════════ */

const SCENES = 5;
const SCENE_NAMES = ["wutong", "nju", "qinhuai", "street", "museum"];

// ── DOM ──
const appRoot = document.getElementById("app-root");
const stage = document.getElementById("stage");
const canvas = document.getElementById("landscape-canvas");
const ctx = canvas.getContext("2d");
const poems = document.querySelectorAll(".poem");
const dots = document.querySelectorAll(".dots i");
const sheet = document.getElementById("route-sheet");
const sheetBody = document.getElementById("sheet-body");
const opening = document.getElementById("opening");
const personaPage = document.getElementById("persona-page");
const personaStart = document.getElementById("persona-start");
const personaSkip = document.getElementById("persona-skip");
const personaBg = document.getElementById("persona-bg");
const personaBgCtx = personaBg ? personaBg.getContext("2d") : null;

// ── State ──
let W, H;
let sceneW, sceneH;
let currentScene = 0;
let ripples = [];
let images = Array(SCENES).fill(null);
let loaded = Array(SCENES).fill(false);
let sceneCanvases = Array(SCENES).fill(null);
let paperTex = null;
let transition = null;
let scenesVisited = 0;
let showCompletion = false;
let enteredApp = false;
let completionAlpha = 0;
let completionParticles = [];
let mouseX = 0, mouseY = 0;
let enterTransition = null;
let sealHover = false;
let sealPress = 0;
let selectedPersona = null;
let personaPageShown = false;
let pickedTags = [];
const MAX_TAGS = 6;

// ── Preference Data ──
const stateTags = [
    "一个人放空", "朋友聊天", "情侣约会", "社团小队",
    "南大新生", "第一次来南京", "想拍照", "想运动",
    "想吃点好的", "不想走太累"
];

const preferenceGroups = [
    {
        key: "food", name: "美食", tone: "warm",
        tags: ["南京菜", "川菜", "粤菜", "日料", "韩餐", "火锅", "烧烤", "小吃", "甜品", "咖啡", "茶饮", "夜宵", "鸭血粉丝", "盐水鸭", "精致餐厅", "平价学生餐", "情侣餐厅", "朋友聚餐"]
    },
    {
        key: "sport", name: "运动", tone: "fresh",
        tags: ["羽毛球", "篮球", "足球", "网球", "乒乓球", "台球", "健身", "跑步", "骑行", "飞盘", "滑板", "攀岩", "游泳", "瑜伽", "江边骑行", "校园运动", "轻运动", "室内运动"]
    },
    {
        key: "life", name: "生活", tone: "soft",
        tags: ["电影", "潮玩", "桌游", "剧本杀", "密室", "Livehouse", "KTV", "逛街", "买手店", "市集", "萌宠", "猫咖", "数码", "摄影", "书店", "咖啡馆", "手作", "中古店", "文创"]
    },
    {
        key: "culture", name: "文化", tone: "calm",
        tags: ["博物馆", "美术馆", "展览", "剧院", "图书馆", "科技馆", "历史建筑", "非遗", "讲座", "寺庙", "古街", "民国建筑", "秦淮文化", "六朝历史", "明清建筑", "校园历史"]
    },
    {
        key: "campus", name: "校园", tone: "purple",
        tags: ["南大北大楼", "三江师范", "校史馆", "梧桐大道", "鼓楼校区", "仙林校区", "校园拍照", "新生入门", "校友回忆", "二次元向导", "校园剧情", "学术氛围"]
    },
    {
        key: "night", name: "夜游", tone: "night",
        tags: ["秦淮河", "夫子庙", "老门东", "夜景拍照", "灯会", "夜宵", "酒吧", "Livehouse", "江边夜风", "情侣夜游", "朋友夜游", "烟火气"]
    },
    {
        key: "shopping", name: "购物", tone: "gold",
        tags: ["德基", "新街口", "商场", "潮牌", "香水", "美妆", "数码", "文创", "买手店", "中古", "书店", "礼物", "情侣礼物", "学生预算"]
    },
    {
        key: "expo", name: "展览", tone: "blue",
        tags: ["南博", "美术馆", "科技馆", "图书馆", "剧院", "演出", "临展", "常设展", "需要预约", "今天可去", "本周末可去", "艺术展", "历史展", "摄影展"]
    }
];

const constraintOptions = {
    time: ["90分钟", "2小时", "3小时", "半日", "一整天", "晚9点前"],
    budget: ["0元", "50以内", "100以内", "200以内", "不设限"],
    people: ["一个人", "两个人", "三五好友", "社团小队"],
    pace: ["不想走路", "轻松散步", "适中", "可以暴走"]
};

let constraintPicks = { time: null, budget: null, people: null, pace: null };
let activeCategory = null;

// ── Image Loading ──
function loadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

async function loadAllImages() {
    for (let i = 0; i < SCENES; i++) {
        const img = await loadImage(`./assets/scenes/${SCENE_NAMES[i]}/scene.png`);
        if (img) { images[i] = img; loaded[i] = true; }
    }
}

// ── Paper Texture ──
function genPaperTexture() {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = "#FCFCFB";
    g.fillRect(0, 0, 256, 256);

    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 6;
        img.data[i] = 252 + n;
        img.data[i + 1] = 252 + n;
        img.data[i + 2] = 251 + n;
        img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);

    g.strokeStyle = "rgba(180,178,175,0.025)";
    g.lineWidth = 0.5;
    for (let y = 0; y < 256; y += 7) {
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x < 256; x += 12) g.lineTo(x, y + (Math.random() - 0.5) * 1.5);
        g.stroke();
    }
    return c;
}

// ── Scene Processing ──
function generateParticleScene(img, w, h) {
    const off = document.createElement("canvas");
    off.width = w; off.height = h;
    const og = off.getContext("2d");

    og.drawImage(img, 0, 0, w, h);

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = w; srcCanvas.height = h;
    const sg = srcCanvas.getContext("2d");
    sg.drawImage(img, 0, 0, w, h);
    const imgData = sg.getImageData(0, 0, w, h).data;

    const stepX = 8;
    const stepY = 8;
    const dotsArr = [];

    for (let py = 0; py < h; py += stepY) {
        for (let px = 0; px < w; px += stepX) {
            const idx = (py * w + px) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];
            if (a < 20) continue;
            if (r > 245 && g > 240 && b > 235) continue;

            const intensity = 1 - (r + g + b) / (255 * 3);
            if (intensity < 0.15) continue;

            const jx = (Math.random() - 0.5) * stepX * 0.8;
            const jy = (Math.random() - 0.5) * stepY * 0.8;
            dotsArr.push({
                x: px + jx, y: py + jy,
                r, g, b,
                size: 1.5 + intensity * 4 + Math.random() * 2
            });
        }
    }

    og.globalAlpha = 0.25;
    dotsArr.forEach(p => {
        og.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        og.beginPath();
        og.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        og.fill();
    });
    og.globalAlpha = 0.35;
    dotsArr.forEach(p => {
        og.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        og.beginPath();
        og.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        og.fill();
    });
    og.globalAlpha = 1;

    // Soft vignette
    const cx = w / 2, cy = h / 2;
    const maxDim = Math.max(w, h);
    const vignetteGrad = og.createRadialGradient(cx, cy, maxDim * 0.38, cx, cy, maxDim * 0.72);
    vignetteGrad.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGrad.addColorStop(0.65, "rgba(0,0,0,0)");
    vignetteGrad.addColorStop(1, "rgba(252,252,251,0.4)");
    og.fillStyle = vignetteGrad;
    og.fillRect(0, 0, w, h);

    return { canvas: off, particles: dotsArr };
}

// ── Pre-render all scenes ──
function preRenderScenes() {
    for (let i = 0; i < SCENES; i++) {
        if (!loaded[i]) continue;
        const result = generateParticleScene(images[i], sceneW, sceneH);
        sceneCanvases[i] = result;
    }
}

// ── Resize ──
function resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    W = vw;
    H = vh;
    sceneW = vw;
    sceneH = Math.round(vh * 0.55);

    canvas.width = vw;
    canvas.height = vh;
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";

    if (loaded.some(Boolean)) preRenderScenes();
    paperTex = genPaperTexture();
    if (personaBg && personaBgCtx) {
        personaBg.width = vw;
        personaBg.height = vh;
        personaBg.style.width = vw + "px";
        personaBg.style.height = vh + "px";
    }
}

// ── Ripple System ──
function createRipple(x, y) {
    ripples.push({
        x, y,
        radius: 0,
        maxRadius: Math.max(W, H) * 0.9,
        opacity: 0.5,
        speed: 3.5 + Math.random() * 2,
        life: 0
    });
    setTimeout(() => {
        ripples.push({
            x, y,
            radius: 0,
            maxRadius: Math.max(W, H) * 0.7,
            opacity: 0.3,
            speed: 2.5 + Math.random() * 1.5,
            life: 0
        });
    }, 150);
}

function updateRipples() {
    ripples = ripples.filter(r => {
        r.radius += r.speed;
        r.life += r.speed / r.maxRadius;
        r.opacity *= 0.985;
        return r.life < 1;
    });
}

function renderRipples() {
    ripples.forEach(r => {
        const progress = r.life;
        const fade = (1 - progress) * r.opacity;

        ctx.strokeStyle = `rgba(78,126,122,${fade * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(78,126,122,${fade * 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(158,166,162,${fade * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 1.35, 0, Math.PI * 2);
        ctx.stroke();

        const glow = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.radius * 0.5);
        glow.addColorStop(0, `rgba(78,126,122,${fade * 0.12})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ── Render Static Scene ──
function renderStaticScene(idx) {
    if (paperTex) {
        ctx.fillStyle = ctx.createPattern(paperTex, "repeat") || "#FCFCFB";
    } else {
        ctx.fillStyle = "#FCFCFB";
    }
    ctx.fillRect(0, 0, W, H);

    const ay = Math.round((H - sceneH) / 2);
    const px = mouseX * 12;
    const py = mouseY * 8;

    if (loaded[idx] && images[idx]) {
        const img = images[idx];
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const sceneAspect = sceneW / sceneH;
        let dw, dh, dx, dy;
        if (imgAspect > sceneAspect) {
            dh = sceneH; dw = sceneH * imgAspect;
            dx = (sceneW - dw) / 2 + px; dy = ay + py;
        } else {
            dw = sceneW; dh = sceneW / imgAspect;
            dx = px; dy = ay + (sceneH - dh) / 2 + py;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
    } else {
        const colors = ["#c8d8c0", "#d8c8e0", "#c0ccd8", "#d8d0c8", "#c8c8d4"];
        ctx.fillStyle = colors[idx] || "#d0cecc";
        ctx.fillRect(px, ay + py, sceneW, sceneH);
    }

    const vfH = Math.round(H * 0.08);
    const vtg = ctx.createLinearGradient(0, 0, 0, vfH);
    vtg.addColorStop(0, "#FCFCFB");
    vtg.addColorStop(1, "rgba(252,252,251,0)");
    ctx.fillStyle = vtg;
    ctx.fillRect(0, 0, W, vfH);

    const vbg = ctx.createLinearGradient(0, H - vfH, 0, H);
    vbg.addColorStop(0, "rgba(252,252,251,0)");
    vbg.addColorStop(1, "#FCFCFB");
    ctx.fillStyle = vbg;
    ctx.fillRect(0, H - vfH, W, vfH);
}

// ── Easing ──
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── Draw scene at opacity (with parallax) ──
function drawScene(idx, alpha) {
    ctx.globalAlpha = alpha;
    const ay = Math.round((H - sceneH) / 2);
    const px = mouseX * 12;
    const py = mouseY * 8;

    if (loaded[idx] && images[idx]) {
        const img = images[idx];
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const sceneAspect = sceneW / sceneH;
        let dw, dh, dx, dy;
        if (imgAspect > sceneAspect) {
            dh = sceneH; dw = sceneH * imgAspect;
            dx = (sceneW - dw) / 2 + px; dy = ay + py;
        } else {
            dw = sceneW; dh = sceneW / imgAspect;
            dx = px; dy = ay + (sceneH - dh) / 2 + py;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
    } else {
        const colors = ["#c8d8c0", "#d8c8e0", "#c0ccd8", "#d8d0c8", "#c8c8d4"];
        ctx.fillStyle = colors[idx] || "#d0cecc";
        ctx.fillRect(px, ay + py, sceneW, sceneH);
    }

    ctx.globalAlpha = 1;
}

// ── Main Render ──
function render() {
    ctx.clearRect(0, 0, W, H);

    // Enter transition
    if (enterTransition) {
        renderCompletion();
        const et = easeInOutCubic(enterTransition.progress);
        const maxR = Math.sqrt(W * W + H * H) * 1.2;
        const r = et * maxR;
        ctx.fillStyle = `rgba(252,252,251,${et})`;
        ctx.beginPath();
        ctx.arc(enterTransition.cx, enterTransition.cy, r, 0, Math.PI * 2);
        ctx.fill();
        const eg = ctx.createRadialGradient(enterTransition.cx, enterTransition.cy, Math.max(0, r - 30), enterTransition.cx, enterTransition.cy, r);
        eg.addColorStop(0, "rgba(252,252,251,0)");
        eg.addColorStop(1, "rgba(252,252,251,0.6)");
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(enterTransition.cx, enterTransition.cy, r, 0, Math.PI * 2);
        ctx.fill();
        renderRipples();
        return;
    }

    if (personaPageShown && !enteredApp) {
        poems.forEach(el => { el.style.opacity = "0"; el.classList.remove("on"); });
        dots.forEach(d => d.classList.remove("lit"));
        // Paper-only background — persona page overlays on top
        if (paperTex) {
            ctx.fillStyle = ctx.createPattern(paperTex, "repeat") || "#FCFCFB";
        } else {
            ctx.fillStyle = "#FCFCFB";
        }
        ctx.fillRect(0, 0, W, H);
        renderRipples();
        return;
    }

    if (enteredApp) {
        poems.forEach(el => { el.style.opacity = "0"; el.classList.remove("on"); });
        dots.forEach(d => d.classList.remove("lit"));
        renderMainApp();
        renderRipples();
        return;
    }

    if (showCompletion) {
        poems.forEach(el => { el.style.opacity = "0"; el.classList.remove("on"); });
        dots.forEach(d => d.classList.remove("lit"));
        renderCompletion();
        renderRipples();
        return;
    }

    if (transition) {
        if (paperTex) {
            ctx.fillStyle = ctx.createPattern(paperTex, "repeat") || "#FCFCFB";
        } else {
            ctx.fillStyle = "#FCFCFB";
        }
        ctx.fillRect(0, 0, W, H);

        const t = easeInOutCubic(transition.progress);
        const { from, to, cx, cy } = transition;

        const oldAlpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
        drawScene(from, oldAlpha);

        const maxR = Math.sqrt(W * W + H * H);
        const spreadR = t * maxR;

        ctx.save();
        ctx.beginPath();
        const segments = 60;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const noise = Math.sin(angle * 7 + t * 5) * 8 + Math.sin(angle * 13 + t * 3) * 5 + Math.sin(angle * 3) * 12;
            const r = spreadR + noise * (1 - t) * 2;
            const sx = cx + Math.cos(angle) * r;
            const sy = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.clip();

        drawScene(to, 1);
        ctx.restore();

        // Ink-dark rim + scattered ink dots
        if (t > 0.03 && t < 0.92) {
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const noise = Math.sin(angle * 7 + t * 5) * 8 + Math.sin(angle * 13 + t * 3) * 5 + Math.sin(angle * 3) * 12;
                const r = spreadR + noise * (1 - t) * 2;
                const sx = cx + Math.cos(angle) * r;
                const sy = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.closePath();
            const rimAlpha = (1 - Math.abs(t - 0.35) * 1.8) * 0.4;
            ctx.strokeStyle = `rgba(26,28,27,${Math.max(0, rimAlpha)})`;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.strokeStyle = `rgba(26,28,27,${Math.max(0, rimAlpha * 0.4)})`;
            ctx.lineWidth = 6;
            ctx.stroke();

            // Scattered ink dots near the spreading edge
            const dotAlpha = rimAlpha * 0.7;
            for (let d = 0; d < 8; d++) {
                const da = Math.random() * Math.PI * 2;
                const dr = spreadR + (Math.random() - 0.5) * 60;
                const dx = cx + Math.cos(da) * dr;
                const dy = cy + Math.sin(da) * dr;
                const ds = 1.5 + Math.random() * 3.5;
                ctx.fillStyle = `rgba(26,28,27,${dotAlpha * (0.3 + Math.random() * 0.7)})`;
                ctx.beginPath();
                ctx.arc(dx, dy, ds, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        const vfH = Math.round(H * 0.08);
        const vtg = ctx.createLinearGradient(0, 0, 0, vfH);
        vtg.addColorStop(0, "#FCFCFB");
        vtg.addColorStop(1, "rgba(252,252,251,0)");
        ctx.fillStyle = vtg;
        ctx.fillRect(0, 0, W, vfH);

        const vbg = ctx.createLinearGradient(0, H - vfH, 0, H);
        vbg.addColorStop(0, "rgba(252,252,251,0)");
        vbg.addColorStop(1, "#FCFCFB");
        ctx.fillStyle = vbg;
        ctx.fillRect(0, H - vfH, W, vfH);

        dots.forEach((d, i) => { d.classList.toggle("lit", i === to); });
        poems.forEach((el, i) => {
            const isCenter = el.classList.contains("poem-center-bottom");
            if (i === to) {
                el.style.opacity = "1";
                el.style.transform = isCenter ? "translate(-50%, 0)" : "translateY(0)";
                el.classList.add("on");
            } else {
                el.style.opacity = "0";
                el.style.transform = isCenter ? "translate(-50%, 24px)" : "translateY(24px)";
                el.classList.remove("on");
            }
        });
    } else {
        renderStaticScene(currentScene);
    }

    renderRipples();

    if (!transition) {
        dots.forEach((d, i) => { d.classList.toggle("lit", i === currentScene); });
        poems.forEach((el, i) => {
            const isCenter = el.classList.contains("poem-center-bottom");
            if (i === currentScene) {
                el.style.opacity = "1";
                el.style.transform = isCenter ? "translate(-50%, 0)" : "translateY(0)";
                el.classList.add("on");
            } else {
                el.style.opacity = "0";
                el.style.transform = isCenter ? "translate(-50%, 24px)" : "translateY(24px)";
                el.classList.remove("on");
            }
        });
    }
}

// ── Scene Navigation ──
function goNextScene(cx, cy) {
    if (transition || showCompletion || enteredApp) return;
    if (scenesVisited >= SCENES) {
        showCompletion = true;
        completionAlpha = 0;
        spawnCompletionParticles();
        return;
    }
    const next = (currentScene + 1) % SCENES;
    const tx = cx != null ? cx : W * (0.3 + Math.random() * 0.4);
    const ty = cy != null ? cy : H * (0.3 + Math.random() * 0.4);
    transition = { from: currentScene, to: next, progress: 0, cx: tx, cy: ty };
}

function goPrevScene() {
    if (transition || showCompletion || enteredApp) return;
    const prev = (currentScene - 1 + SCENES) % SCENES;
    const cx = W * (0.3 + Math.random() * 0.4);
    const cy = H * (0.3 + Math.random() * 0.4);
    transition = { from: currentScene, to: prev, progress: 0, cx, cy };
}

// ── Click handler — ripple only, wheel switches scenes ──
function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener("click", (e) => {
    if (transition) return;
    const pos = getCanvasPos(e);

    if (enteredApp) {
        createRipple(pos.x, pos.y);
        const rects = getMainAppRouteRects();
        for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
                openRoute(mainAppRoutes[i].key);
                return;
            }
        }
        return;
    }

    if (showCompletion) {
        const cx = W / 2, cy = H * 0.46;
        const dist = Math.hypot(pos.x - cx, pos.y - cy);
        if (dist < 68) {
            sealPress = 1;
            createRipple(cx, cy);
            setTimeout(() => {
                enterTransition = { progress: 0, cx, cy };
                completionAlpha = 0;
            }, 120);
            return;
        }
        createRipple(pos.x, pos.y);
        return;
    }

    // Click creates ripple + advances to next scene from click point
    createRipple(pos.x, pos.y);
    goNextScene(pos.x, pos.y);
});

canvas.style.cursor = "pointer";

// ── Parallax ──
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX = x / W - 0.5;
    mouseY = y / H - 0.5;

    if (showCompletion && !enteredApp && !enterTransition) {
        const cx = W / 2, cy = H * 0.46;
        sealHover = Math.hypot(x - cx, y - cy) < 68;
        canvas.style.cursor = sealHover ? "pointer" : "default";
    } else {
        canvas.style.cursor = "pointer";
    }
});
canvas.addEventListener("mouseleave", () => { mouseX = 0; mouseY = 0; });
canvas.addEventListener("touchmove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) / W - 0.5;
    mouseY = (e.touches[0].clientY - rect.top) / H - 0.5;
}, { passive: true });
canvas.addEventListener("touchend", () => { mouseX = 0; mouseY = 0; });

// ── Route Data ──
const routes = {
    nju: {
        title: "南大校史线：从三江师范到今天",
        desc: "从三江师范到今天，把一座校园慢慢走完。",
        meta: ["150 分钟", "轻松漫步", "免费"],
        stops: [
            { name: "三江师范学堂旧址", detail: "故事开始的地方，梧桐叶落满台阶。" },
            { name: "北大楼", detail: "红砖在夕阳里安静地站着，见过很多人的第一天。" },
            { name: "校史馆", detail: "从1902到2026，一座校园的记忆。" },
            { name: "梧桐大道", detail: "风吹过树梢，像翻开一本旧书。" }
        ]
    },
    night: {
        title: "秦淮夜游：秦淮河 - 夫子庙 - 老门东",
        desc: "今晚的灯，会把你带进一场旧梦。",
        meta: ["210 分钟", "适中节奏", "80 - 200 元"],
        stops: [
            { name: "秦淮河畔", detail: "夜色落下时，河面泛起第一盏灯。" },
            { name: "夫子庙", detail: "灯火渐明，人群里藏着南京的旧梦。" },
            { name: "老门东", detail: "巷子深处，烟火气和故事一样浓。" }
        ]
    },
    food: {
        title: "午后餐茶线：小吃 - 咖啡 - 书店 - 散步",
        desc: "不赶路，只把下午慢慢花掉。",
        meta: ["120 分钟", "轻松漫步", "30 - 120 元"],
        stops: [
            { name: "街角咖啡馆", detail: "从一杯手冲开始，下午慢慢展开。" },
            { name: "独立书店", detail: "找一个靠窗的位置，翻几页闲书。" },
            { name: "梧桐小径", detail: "阳光穿过树叶，在地上画满光斑。" },
            { name: "晚餐小馆", detail: "一顿刚好的晚饭，不必赶时间。" }
        ]
    },
    expo: {
        title: "博物馆展览线：南博 - 明故宫 - 半日文化",
        desc: "安静地走进一座博物馆，和旧物说说话。",
        meta: ["240 分钟", "轻松漫步", "0 - 180 元", "需预约"],
        stops: [
            { name: "南京博物院", detail: "安静地走进去，和千年旧物对话。" },
            { name: "明故宫遗址", detail: "残垣之间，能听见六百年前的风。" },
            { name: "展览特厅", detail: "这一季的展览，恰好是你喜欢的主题。" }
        ]
    }
};

function openRoute(key) {
    const r = routes[key];
    if (!r) return;
    sheetBody.innerHTML =
        `<p class="tag">路线画卷</p>` +
        `<h3>${r.title}</h3>` +
        `<p class="desc">${r.desc}</p>` +
        `<div class="sheet-meta">${r.meta.map(m => `<span>${m}</span>`).join("")}</div>` +
        `<div class="stops">${r.stops.map((s, i) =>
            `<div class="stop">
                <span class="stop-num">${String(i+1).padStart(2,"0")}</span>
                <div class="stop-text"><h4>${s.name}</h4><p>${s.detail}</p></div>
            </div>`
        ).join("")}</div>` +
        `<button class="sheet-close">收起画卷</button>`;
    sheet.classList.add("open");
}

function closeSheet() {
    sheet.classList.remove("open");
}

document.querySelectorAll(".enter").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openRoute(btn.dataset.route);
    });
});
sheet.addEventListener("click", (e) => {
    if (e.target === sheet || e.target.matches(".sheet-close")) closeSheet();
});

// ── Completion Screen ──
function spawnCompletionParticles() {
    completionParticles = [];
    for (let i = 0; i < 28; i++) {
        completionParticles.push({
            x: W * (0.12 + Math.random() * 0.76),
            y: H * (0.18 + Math.random() * 0.68),
            size: 1.2 + Math.random() * 3.2,
            speed: 0.08 + Math.random() * 0.22,
            opacity: 0.08 + Math.random() * 0.18,
            drift: (Math.random() - 0.5) * 0.18,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function updateCompletion(dt) {
    if (!showCompletion || enteredApp) return;
    completionAlpha = Math.min(1, completionAlpha + dt * 0.6);
    sealPress *= 0.84;
    completionParticles.forEach(p => {
        p.y -= p.speed;
        p.x += Math.sin(p.phase + performance.now() / 3000) * p.drift;
        if (p.y < H * 0.08) { p.y = H * 0.92; p.x = W * (0.12 + Math.random() * 0.76); }
    });
}

function renderCompletion() {
    if (!showCompletion) return;

    const a = completionAlpha;
    const ay = Math.round((H - sceneH) / 2);

    if (paperTex) {
        ctx.fillStyle = ctx.createPattern(paperTex, "repeat") || "#FCFCFB";
    } else {
        ctx.fillStyle = "#FCFCFB";
    }
    ctx.fillRect(0, 0, W, H);

    // Blend all 5 scenes as misty backdrop
    ctx.globalAlpha = a * 0.22;
    for (let i = 0; i < SCENES; i++) {
        if (sceneCanvases[i]) {
            const offsetY = ay + (i - 2) * 16;
            ctx.drawImage(sceneCanvases[i].canvas, 0, offsetY, sceneW, sceneH);
        }
    }
    ctx.globalAlpha = 1;

    // Gradient veil
    const veil = ctx.createLinearGradient(0, 0, 0, H);
    veil.addColorStop(0, `rgba(252,252,251,${a * 0.7})`);
    veil.addColorStop(0.35, `rgba(252,252,251,${a * 0.4})`);
    veil.addColorStop(0.65, `rgba(252,252,251,${a * 0.4})`);
    veil.addColorStop(1, `rgba(252,252,251,${a * 0.78})`);
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, W, H);

    // Floating ink particles
    completionParticles.forEach(p => {
        ctx.fillStyle = `rgba(26,28,27,${p.opacity * a * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    const cx = W / 2;
    const cy = H * 0.46;
    const now = performance.now() / 1000;
    const pulse = Math.sin(now * 1.45) * 0.5 + 0.5;

    // Hide dots on completion page
    const dotsEl = document.getElementById("dots");
    if (dotsEl) dotsEl.style.opacity = "0";

    // Central ink mist focus band
    const focusGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.48);
    focusGrad.addColorStop(0, `rgba(26,28,27,${a * 0.045})`);
    focusGrad.addColorStop(0.38, `rgba(26,28,27,${a * 0.028})`);
    focusGrad.addColorStop(1, "rgba(26,28,27,0)");
    ctx.fillStyle = focusGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, W * 0.34, H * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top title
    ctx.fillStyle = `rgba(26,28,27,${a * 0.72})`;
    ctx.font = "400 19px 'Noto Serif SC', 'STSong', 'SimSun', serif";
    ctx.textAlign = "center";
    ctx.fillText("南京，在此展开", cx, H * 0.27);

    // Top subtitle
    ctx.fillStyle = `rgba(98,105,101,${a * 0.32})`;
    ctx.font = "10px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.fillText("CITY ROUTE · INK MEMORY", cx, H * 0.27 + 24);

    // Leaf hover / press scale
    const hoverScale = sealHover ? 1.06 : 1;
    const pressScale = 1 - sealPress * 0.08;
    const leafScale = hoverScale * pressScale;

    const leafR = 48;
    const goldBase = `rgba(216,169,74,${a})`;
    const goldLight = `rgba(240,200,110,${a})`;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(leafScale, leafScale);
    ctx.translate(-cx, -cy);

    // Outer breathing rings — golden
    for (let i = 0; i < 3; i++) {
        const rr = leafR + 14 + i * 10 + pulse * 8;
        ctx.strokeStyle = `rgba(216,169,74,${a * (0.12 - i * 0.025 + pulse * 0.04)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Soft golden glow
    const glowR = leafR + 32 + pulse * 14;
    const glow = ctx.createRadialGradient(cx, cy, leafR * 0.35, cx, cy, glowR);
    glow.addColorStop(0, `rgba(216,169,74,${a * (sealHover ? 0.26 : 0.16)})`);
    glow.addColorStop(0.5, `rgba(216,169,74,${a * 0.06})`);
    glow.addColorStop(1, "rgba(216,169,74,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();

    // ── Wutong leaf shape ──
    // Leaf gradient — gold to amber
    const leafGrad = ctx.createLinearGradient(cx, cy - leafR, cx, cy + leafR * 0.6);
    leafGrad.addColorStop(0, goldLight);
    leafGrad.addColorStop(0.45, goldBase);
    leafGrad.addColorStop(0.8, `rgba(190,135,50,${a})`);
    leafGrad.addColorStop(1, `rgba(160,105,35,${a})`);
    ctx.fillStyle = leafGrad;

    ctx.beginPath();
    // Start at stem base
    ctx.moveTo(cx, cy + leafR * 0.75);

    // Right side of leaf base → right lobe
    ctx.bezierCurveTo(cx + leafR * 0.35, cy + leafR * 0.55, cx + leafR * 0.7, cy + leafR * 0.2, cx + leafR * 0.85, cy - leafR * 0.15);
    // Right lobe return
    ctx.bezierCurveTo(cx + leafR * 0.65, cy - leafR * 0.05, cx + leafR * 0.3, cy + leafR * 0.05, cx + leafR * 0.2, cy - leafR * 0.45);
    // Top-right lobe
    ctx.bezierCurveTo(cx + leafR * 0.25, cy - leafR * 0.65, cx + leafR * 0.1, cy - leafR * 0.75, cx, cy - leafR * 0.9);
    // Top-left lobe
    ctx.bezierCurveTo(cx - leafR * 0.1, cy - leafR * 0.75, cx - leafR * 0.25, cy - leafR * 0.65, cx - leafR * 0.2, cy - leafR * 0.45);
    // Left lobe return
    ctx.bezierCurveTo(cx - leafR * 0.3, cy + leafR * 0.05, cx - leafR * 0.65, cy - leafR * 0.05, cx - leafR * 0.85, cy - leafR * 0.15);
    // Left lobe outer
    ctx.bezierCurveTo(cx - leafR * 0.7, cy + leafR * 0.2, cx - leafR * 0.35, cy + leafR * 0.55, cx, cy + leafR * 0.75);

    ctx.closePath();
    ctx.fill();

    // Leaf edge — subtle stroke
    ctx.strokeStyle = `rgba(160,115,40,${a * 0.35})`;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // ── Leaf veins ──
    ctx.strokeStyle = `rgba(160,115,40,${a * 0.28})`;
    ctx.lineWidth = 0.9;

    // Central vein
    ctx.beginPath();
    ctx.moveTo(cx, cy + leafR * 0.7);
    ctx.quadraticCurveTo(cx, cy - leafR * 0.1, cx, cy - leafR * 0.8);
    ctx.stroke();

    // Left veins
    ctx.beginPath();
    ctx.moveTo(cx, cy + leafR * 0.15);
    ctx.quadraticCurveTo(cx - leafR * 0.25, cy - leafR * 0.05, cx - leafR * 0.65, cy - leafR * 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + leafR * 0.35);
    ctx.quadraticCurveTo(cx - leafR * 0.2, cy + leafR * 0.25, cx - leafR * 0.45, cy + leafR * 0.1);
    ctx.stroke();

    // Right veins
    ctx.beginPath();
    ctx.moveTo(cx, cy + leafR * 0.15);
    ctx.quadraticCurveTo(cx + leafR * 0.25, cy - leafR * 0.05, cx + leafR * 0.65, cy - leafR * 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + leafR * 0.35);
    ctx.quadraticCurveTo(cx + leafR * 0.2, cy + leafR * 0.25, cx + leafR * 0.45, cy + leafR * 0.1);
    ctx.stroke();

    // ── Stem ──
    ctx.strokeStyle = `rgba(160,105,35,${a * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + leafR * 0.7);
    ctx.quadraticCurveTo(cx + 2, cy + leafR, cx, cy + leafR * 1.15);
    ctx.stroke();

    // ── "启程" text on leaf ──
    ctx.fillStyle = `rgba(255,248,240,${a * 0.9})`;
    ctx.font = "500 20px 'Noto Serif SC', 'STKaiti', 'KaiTi', 'STSong', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("启程", cx, cy + leafR * 0.05);

    ctx.restore();

    // Subtitle below seal
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = `rgba(98,105,101,${a * (sealHover ? 0.68 : 0.48)})`;
    ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(sealHover ? "轻触进入" : "开始探索", cx, cy + leafR + 30);

    ctx.textAlign = "start";
}

// ── Persona Page ──
function showPersonaPage() {
    if (personaPageShown) return;
    personaPageShown = true;

    personaPage.style.display = "block";
    personaPage.classList.add("entering");

    showCompletion = false;
    completionAlpha = 0;
    completionParticles = [];
    poems.forEach(el => { el.style.opacity = "0"; el.classList.remove("on"); });
    dots.forEach(d => d.classList.remove("lit"));

    resizePersonaBg();
    window.addEventListener("resize", resizePersonaBg);

    buildPreferenceTop();
    buildInterestSection();
    updateSelectedTags();
    updateRouteSign();

    // Close accordion on outside click
    document.addEventListener("click", (e) => {
        if (personaPage.style.display === "none") return;
        if (!e.target.closest(".category-btn") && !e.target.closest(".subtag-inline")) {
            closeAllPanels();
        }
    });

    personaStart.addEventListener("click", () => {
        personaPage.classList.add("leaving");
        setTimeout(() => {
            personaPage.style.display = "none";
            personaPage.classList.remove("entering", "leaving");
            enteredApp = true;
            spawnCompletionParticles();
        }, 400);
    });

    personaSkip.addEventListener("click", () => {
        personaPage.classList.add("leaving");
        setTimeout(() => {
            personaPage.style.display = "none";
            personaPage.classList.remove("entering", "leaving");
            enteredApp = true;
            spawnCompletionParticles();
        }, 400);
    });

    requestAnimationFrame(renderPersonaBgLoop);
}

// ── Build all filter rows in sticky top ──
function buildPreferenceTop() {
    const container = document.getElementById("filter-rows");
    if (!container) return;
    container.innerHTML = "";

    // Row 1: mood states (from stateTags)
    addFilterRow(container, "状态", stateTags, "state");

    // Row 2: time
    addFilterRow(container, "时间", constraintOptions.time, "time");

    // Row 3: budget
    addFilterRow(container, "预算", constraintOptions.budget, "budget");

    // Row 4: people
    addFilterRow(container, "人数", constraintOptions.people, "people");

    // Row 5: pace
    addFilterRow(container, "强度", constraintOptions.pace, "pace");
}

function addFilterRow(container, label, options, key) {
    const row = document.createElement("div");
    row.className = "filter-row";

    const lbl = document.createElement("span");
    lbl.className = "filter-label";
    lbl.textContent = label;
    row.appendChild(lbl);

    options.forEach(opt => {
        const chip = document.createElement("button");
        chip.className = "filter-chip";
        chip.textContent = opt;
        chip.dataset.key = key;
        chip.dataset.value = opt;

        // Check if already picked
        if (key === "state") {
            if (pickedTags.includes(opt)) chip.classList.add("picked");
        } else {
            if (constraintPicks[key] === opt) chip.classList.add("picked");
        }

        chip.addEventListener("click", () => {
            if (key === "state") {
                if (pickedTags.includes(opt)) {
                    pickedTags = pickedTags.filter(pt => pt !== opt);
                    chip.classList.remove("picked");
                } else {
                    if (pickedTags.length >= MAX_TAGS) return;
                    pickedTags.push(opt);
                    chip.classList.add("picked");
                }
            } else {
                if (constraintPicks[key] === opt) {
                    constraintPicks[key] = null;
                    chip.classList.remove("picked");
                } else {
                    constraintPicks[key] = opt;
                    row.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("picked"));
                    chip.classList.add("picked");
                }
            }
            refreshInterestMarks();
            updateSelectedTags();
            updateRouteSign();
        });
        row.appendChild(chip);
    });

    container.appendChild(row);
}

// ── Build accordion interest section ──
const interestIcons = {
    food: "🍜", sport: "🏸", life: "🎬", culture: "🏛",
    campus: "🎓", night: "🌙", shopping: "🛍", expo: "🏛"
};
const interestTones = {
    food: "#ff8f6b", sport: "#7ecb76", life: "#f5a0c5", culture: "#7eb8da",
    campus: "#b38cd9", night: "#6b7fdb", shopping: "#f0c75e", expo: "#60c3c8"
};

let activePanel = null;

function buildInterestSection() {
    const section = document.getElementById("interest-section");
    if (!section) return;
    section.innerHTML = "";

    preferenceGroups.forEach(g => {
        // Category button
        const btn = document.createElement("button");
        btn.className = "category-btn";
        btn.dataset.group = g.key;
        btn.style.setProperty("--tone", interestTones[g.key] || "#ccc");
        btn.innerHTML = `${interestIcons[g.key] || "●"} ${g.name}`;

        // Inline subtag panel
        const panel = document.createElement("div");
        panel.className = "subtag-inline";
        panel.dataset.panel = g.key;

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            togglePanel(g.key);
        });

        section.appendChild(btn);
        section.appendChild(panel);
    });

    refreshInterestMarks();
}

function togglePanel(key) {
    const section = document.getElementById("interest-section");
    if (!section) return;

    const btn = section.querySelector(`.category-btn[data-group="${key}"]`);
    const panel = section.querySelector(`.subtag-inline[data-panel="${key}"]`);

    if (activePanel === key) {
        // Close current
        if (btn) btn.classList.remove("active");
        if (panel) panel.classList.remove("show");
        activePanel = null;
        return;
    }

    // Close previous
    if (activePanel) {
        const prevBtn = section.querySelector(`.category-btn[data-group="${activePanel}"]`);
        const prevPanel = section.querySelector(`.subtag-inline[data-panel="${activePanel}"]`);
        if (prevBtn) prevBtn.classList.remove("active");
        if (prevPanel) prevPanel.classList.remove("show");
    }

    // Open new
    activePanel = key;
    if (btn) btn.classList.add("active");
    if (panel) {
        buildInlineSubtags(panel, key);
        panel.classList.add("show");
    }
}

function closeAllPanels() {
    const section = document.getElementById("interest-section");
    if (!section) return;
    if (activePanel) {
        const btn = section.querySelector(`.category-btn[data-group="${activePanel}"]`);
        const panel = section.querySelector(`.subtag-inline[data-panel="${activePanel}"]`);
        if (btn) btn.classList.remove("active");
        if (panel) panel.classList.remove("show");
        activePanel = null;
    }
}

function refreshInterestMarks() {
    const section = document.getElementById("interest-section");
    if (!section) return;
    section.querySelectorAll(".category-btn").forEach(btn => {
        const key = btn.dataset.group;
        const group = preferenceGroups.find(g => g.key === key);
        if (!group) return;
        const hasPicks = group.tags.some(t => pickedTags.includes(t));
        btn.classList.toggle("has-picks", hasPicks);
    });
    // Refresh open panel subtags
    if (activePanel) {
        const panel = section.querySelector(`.subtag-inline[data-panel="${activePanel}"]`);
        if (panel) buildInlineSubtags(panel, activePanel);
    }
}

function buildInlineSubtags(panel, key) {
    const group = preferenceGroups.find(g => g.key === key);
    if (!group) return;

    panel.innerHTML = "";
    const atLimit = pickedTags.length >= MAX_TAGS;

    group.tags.forEach(t => {
        const chip = document.createElement("button");
        const isPicked = pickedTags.includes(t);
        chip.className = "subtag" + (isPicked ? " picked" : "") + (atLimit && !isPicked ? " locked" : "");
        chip.textContent = t;
        chip.style.setProperty("--st-tone", interestTones[key] || "#ccc");
        chip.addEventListener("click", (e) => {
            e.stopPropagation();
            if (pickedTags.includes(t)) {
                pickedTags = pickedTags.filter(pt => pt !== t);
            } else {
                if (pickedTags.length >= MAX_TAGS) return;
                pickedTags.push(t);
            }
            buildInlineSubtags(panel, key);
            refreshInterestMarks();
            buildPreferenceTop();
            updateSelectedTags();
            updateRouteSign();
        });
        panel.appendChild(chip);
    });
}

function updateSelectedTags() {
    const container = document.getElementById("selected-tags");
    const area = document.getElementById("selected-area");
    if (!container || !area) return;
    area.style.display = pickedTags.length > 0 ? "block" : "none";
    container.innerHTML = pickedTags.map(t =>
        `<span class="selected-tag">${t}<span class="remove-tag" data-tag="${t}">&times;</span></span>`
    ).join("");

    container.querySelectorAll(".remove-tag").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const tag = btn.dataset.tag;
            pickedTags = pickedTags.filter(pt => pt !== tag);
            buildPreferenceTop();
            refreshInterestMarks();
            updateSelectedTags();
            updateRouteSign();
        });
    });
}

function updateRouteSign() {
    const title = document.getElementById("sign-title");
    const desc = document.getElementById("sign-desc");
    const meta = document.getElementById("sign-meta");
    if (!title || !desc || !meta) return;

    let routeName = "漫步南京";
    let routeDesc = "选择一些关键词，为你生成今日路线。";
    let routeMeta = "";

    // Simple rule-based mapping
    const hasTag = (t) => pickedTags.some(pt => pt.includes(t) || t.includes(pt));

    if (hasTag("校园") || hasTag("南大") || hasTag("校史")) {
        routeName = "南大校园探索线";
        routeDesc = "从三江师范到今天，走进一座校园的记忆。";
        routeMeta = "150分钟 · 轻松 · 免费 · 剧情体验";
    } else if (hasTag("秦淮") || hasTag("夫子庙") || hasTag("夜景") || hasTag("夜游")) {
        routeName = "秦淮夜游线";
        routeDesc = "灯火亮起时，南京会换一种声音。";
        routeMeta = "210分钟 · 适中 · 80-200元 · 适合朋友";
    } else if (hasTag("咖啡") || hasTag("书店") || hasTag("甜品") || hasTag("放空") || hasTag("猫咖")) {
        routeName = "午后慢游线";
        routeDesc = "不赶路，把下午慢慢花掉。";
        routeMeta = "120分钟 · 轻松 · 30-120元 · 适合放空";
    } else if (hasTag("博物馆") || hasTag("展览") || hasTag("南博") || hasTag("美术馆")) {
        routeName = "博物馆展览线";
        routeDesc = "安静地走进一座博物馆，和旧物说说话。";
        routeMeta = "240分钟 · 轻松 · 0-180元 · 需预约";
    } else if (hasTag("电影") || hasTag("潮玩") || hasTag("桌游") || hasTag("KTV")) {
        routeName = "城市潮玩线";
        routeDesc = "看一场电影，玩一局剧本杀，逛一处买手店。";
        routeMeta = "180分钟 · 适中 · 80-200元 · 适合朋友";
    } else if (hasTag("川菜") || hasTag("火锅") || hasTag("烧烤") || hasTag("南京菜")) {
        routeName = "南京味道线";
        routeDesc = "从鸭血粉丝到精致餐厅，把南京吃进肚子里。";
        routeMeta = "120分钟 · 轻松 · 50-150元 · 朋友聚餐";
    } else if (hasTag("运动") || hasTag("骑行") || hasTag("跑步") || hasTag("羽毛球")) {
        routeName = "轻运动半日线";
        routeDesc = "约一场球，骑一段江边，出点汗就好。";
        routeMeta = "150分钟 · 适中 · 0-50元 · 朋友运动";
    } else if (hasTag("购物") || hasTag("新街口") || hasTag("潮牌") || hasTag("文创")) {
        routeName = "新街口逛街线";
        routeDesc = "从潮牌到中古，慢慢淘一个下午。";
        routeMeta = "180分钟 · 适中 · 预算自定 · 学生友好";
    } else if (hasTag("酒吧") || hasTag("夜宵") || hasTag("Livehouse")) {
        routeName = "南京夜生活线";
        routeDesc = "音乐、烟火气、江边晚风，今晚不赶时间。";
        routeMeta = "180分钟 · 适中 · 80-200元 · 夜猫子";
    } else if (hasTag("第一次") || hasTag("新生")) {
        routeName = "南京初印象线";
        routeDesc = "第一次来南京？从梧桐树下开始吧。";
        routeMeta = "半日 · 轻松 · 免费 · 入门探索";
    } else if (pickedTags.length >= 2) {
        routeName = "自定义路线";
        routeDesc = "根据你的关键词组合，为你定制一条专属路线。";
        routeMeta = buildConstraintMeta();
    }

    if (constraintPicks.time) routeMeta = routeMeta || buildConstraintMeta();

    title.textContent = routeName;
    desc.textContent = routeDesc;
    meta.textContent = routeMeta || buildConstraintMeta() || "选择更多关键词来生成路线";
}

function buildConstraintMeta() {
    const parts = [];
    if (constraintPicks.time) parts.push(constraintPicks.time);
    if (constraintPicks.budget) parts.push(constraintPicks.budget);
    if (constraintPicks.people) parts.push(constraintPicks.people);
    if (constraintPicks.pace && constraintPicks.pace !== "适中") parts.push(constraintPicks.pace);
    return parts.join(" · ") || null;
}

function resizePersonaBg() {
    if (!personaBg || !personaBgCtx) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    personaBg.width = vw;
    personaBg.height = vh;
    personaBg.style.width = vw + "px";
    personaBg.style.height = vh + "px";
}

function renderPersonaBgLoop(time) {
    if (!personaPageShown || enteredApp || personaPage.style.display === "none") return;
    if (!personaBgCtx) return;

    const vw = personaBg.width;
    const vh = personaBg.height;
    personaBgCtx.clearRect(0, 0, vw, vh);

    personaBgCtx.fillStyle = "rgba(252,252,251,0.25)";
    personaBgCtx.fillRect(0, 0, vw, vh);

    // Central ink mist
    const cx = vw / 2, cy = vh * 0.42;
    const mist = personaBgCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(vw, vh) * 0.45);
    mist.addColorStop(0, "rgba(26,28,27,0.03)");
    mist.addColorStop(0.5, "rgba(26,28,27,0.015)");
    mist.addColorStop(1, "rgba(26,28,27,0)");
    personaBgCtx.fillStyle = mist;
    personaBgCtx.fillRect(0, 0, vw, vh);

    // Floating dust
    const t = time / 1000;
    for (let i = 0; i < 22; i++) {
        const px = vw * (0.06 + 0.88 * ((i * 137.5 + t * 0.025) % 1));
        const py = vh * (0.08 + 0.84 * ((i * 251.3 + t * 0.035) % 1));
        const sz = 0.8 + 2.2 * ((Math.sin(t * 0.6 + i * 1.8) * 0.5 + 0.5));
        const op = 0.02 + 0.05 * ((Math.sin(t * 0.45 + i * 2.1) * 0.5 + 0.5));
        personaBgCtx.fillStyle = `rgba(26,28,27,${op})`;
        personaBgCtx.beginPath();
        personaBgCtx.arc(px, py, sz, 0, Math.PI * 2);
        personaBgCtx.fill();
    }

    requestAnimationFrame(renderPersonaBgLoop);
}

// ── Main App View ──
const mainAppRoutes = [
    { key: "nju",  name: "南大校史线", desc: "从三江师范到今天" },
    { key: "night", name: "秦淮夜游", desc: "秦淮河 · 夫子庙 · 老门东" },
    { key: "food",  name: "午后餐茶线", desc: "不赶路，把下午慢慢花掉" },
    { key: "expo",  name: "博物馆展览线", desc: "安静地和旧物对话" }
];

function getMainAppRouteRects() {
    const rects = [];
    const cardH = 72;
    const cardW = Math.min(W - 64, 380);
    const startY = H * 0.32;
    const gap = 14;
    const cx = W / 2;
    mainAppRoutes.forEach((_, i) => {
        const y = startY + i * (cardH + gap);
        rects.push({ x: cx - cardW / 2, y, w: cardW, h: cardH });
    });
    return rects;
}

function renderMainApp() {
    if (paperTex) {
        ctx.fillStyle = ctx.createPattern(paperTex, "repeat") || "#FCFCFB";
    } else {
        ctx.fillStyle = "#FCFCFB";
    }
    ctx.fillRect(0, 0, W, H);

    completionParticles.forEach(p => {
        ctx.fillStyle = `rgba(78,126,122,${p.opacity * 0.25})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    const cx = W / 2;

    ctx.fillStyle = "rgba(26,28,27,0.9)";
    ctx.font = "22px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("南京探索", cx, H * 0.18);
    ctx.textAlign = "start";

    // Persona-based recommendation from picked tags
    const hasTag = (t) => pickedTags.some(pt => pt.includes(t) || t.includes(pt));
    let personaRecoKey = null;
    if (hasTag("校园") || hasTag("南大") || hasTag("校史")) personaRecoKey = "nju";
    else if (hasTag("秦淮") || hasTag("夜景") || hasTag("夜游") || hasTag("夫子庙")) personaRecoKey = "night";
    else if (hasTag("咖啡") || hasTag("书店") || hasTag("甜品") || hasTag("放空")) personaRecoKey = "food";
    else if (hasTag("博物馆") || hasTag("展览") || hasTag("南博")) personaRecoKey = "expo";

    ctx.fillStyle = "rgba(98,105,101,0.55)";
    ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    const recoText = personaRecoKey ? "为你推荐今日路线" : "选一条路线，慢慢出发";
    ctx.fillText(recoText, cx, H * 0.18 + 26);
    ctx.textAlign = "start";

    const rects = getMainAppRouteRects();
    mainAppRoutes.forEach((route, i) => {
        const r = rects[i];
        const isReco = personaRecoKey && route.key === personaRecoKey;

        // Card background — highlighted for recommended
        ctx.fillStyle = isReco ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.55)";
        ctx.beginPath();
        roundRect(ctx, r.x, r.y, r.w, r.h, 10);
        ctx.fill();

        // Card border
        ctx.strokeStyle = isReco ? "rgba(182,66,54,0.3)" : "rgba(224,225,221,0.6)";
        ctx.lineWidth = isReco ? 1.5 : 1;
        ctx.beginPath();
        roundRect(ctx, r.x, r.y, r.w, r.h, 10);
        ctx.stroke();

        // Recommendation badge
        if (isReco) {
            ctx.fillStyle = "rgba(182,66,54,0.12)";
            ctx.beginPath();
            const badgeW = 48, badgeH = 18;
            roundRect(ctx, r.x + r.w - badgeW - 10, r.y + 10, badgeW, badgeH, 9);
            ctx.fill();
            ctx.fillStyle = "rgba(182,66,54,0.8)";
            ctx.font = "9px 'PingFang SC', 'Microsoft YaHei', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("今日推荐", r.x + r.w - badgeW / 2 - 10, r.y + 22);
            ctx.textAlign = "start";
        }

        ctx.fillStyle = "rgba(26,28,27,0.85)";
        ctx.font = "15px 'PingFang SC', 'Microsoft YaHei', sans-serif";
        ctx.fillText(route.name, r.x + 18, r.y + 28);

        ctx.fillStyle = "rgba(98,105,101,0.6)";
        ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
        ctx.fillText(route.desc, r.x + 18, r.y + 50);

        ctx.fillStyle = "rgba(158,166,162,0.5)";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("→", r.x + r.w - 18, r.y + r.h / 2 + 5);
        ctx.textAlign = "start";
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

// ── Transition Update ──
const TRANSITION_DURATION = 1.5;

function updateTransition(dt) {
    if (!transition) return;
    transition.progress += dt / TRANSITION_DURATION;
    if (transition.progress >= 1) {
        transition.progress = 1;
        currentScene = transition.to;
        scenesVisited = Math.max(scenesVisited, transition.to + 1);
        transition = null;
    }
}

// ── Loop ──
let lastTime = performance.now();

function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    updateRipples();
    updateTransition(dt);
    updateCompletion(dt);

    if (enterTransition) {
        enterTransition.progress += dt / 0.8;
        if (enterTransition.progress >= 1) {
            enterTransition = null;
            showPersonaPage();
        }
    }

    if (enteredApp) {
        completionParticles.forEach(p => {
            p.y -= p.speed * 0.5;
            p.x += Math.sin(p.phase + time / 3000) * p.drift * 0.5;
            if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
        });
    }
    render();
    requestAnimationFrame(loop);
}

// ── Opening Dismiss ──
function dismissOpening() {
    if (transition) return;
    opening.classList.add("dismissed");
}

if (opening) {
    opening.addEventListener("click", dismissOpening);
}

// ── Init ──
async function init() {
    resize();
    window.addEventListener("resize", () => { resize(); });

    paperTex = genPaperTexture();

    dots[0].classList.add("lit");
    poems[0].style.opacity = "1";
    poems[0].style.transform = "translateY(0)";
    poems[0].classList.add("on");

    // Start loop immediately so canvas shows paper + placeholders
    requestAnimationFrame(loop);

    // Load images in background, then swap in
    await loadAllImages();
    preRenderScenes();
}

init();
