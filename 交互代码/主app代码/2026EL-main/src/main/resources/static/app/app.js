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
const personaSwiper = document.getElementById("persona-swiper");
const swiperContainer = document.getElementById("swiper-container");
const swiperProgress = document.getElementById("swiper-progress");
const swiperGlassCard = document.getElementById("swiper-glass-card");
const glassText = document.getElementById("glass-text");
const swiperSelectBtn = document.getElementById("swiper-select-btn");
const swiperSkip = document.getElementById("swiper-skip");
const swiperSwipeHint = document.querySelector(".swiper-swipe-hint");
const mainPage = document.getElementById("main-page");
const mainMapCanvas = document.getElementById("main-map-canvas");
const mainMapCtx = mainMapCanvas ? mainMapCanvas.getContext("2d") : null;
const mainScroll = document.getElementById("main-scroll");

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
let personaSwiperShown = false;
let personaSwiperActive = false;

// ── AMap State ──
let amapInstance = null;
let amapReady = false;
let amapRouteLines = [];
let amapMarkers = [];
let amapInitializing = false;
let amapFullscreen = false;

// ── GSAP Init ──
gsap.registerPlugin(ScrollTrigger);

// ── Persona Card Data (8 cards for vertical swipe) ──
const personaCards = [
    {
        id: "foodie",
        title: "citywalker",
        subtitle: "南京特色美食，热气腾腾的烟火路线",
        tags: ["小吃", "老字号", "夜宵", "烟火气"],
        unlockText: "地道美食路线、隐藏小店、早点夜宵地图",
        mainColor: "#FF7A45",
        secondColor: "#FFD36E",
        accentColor: "#FF4D6D",
        textColor: "#FFF8EC",
        elements: [
            { emoji: "🍜", x: 15, y: 18, size: 32, floatY: 12, dur: 3.2 },
            { emoji: "🥟", x: 78, y: 14, size: 34, floatY: 14, dur: 3.8 },
            { emoji: "🦆", x: 82, y: 38, size: 36, floatY: 10, dur: 4.1 },
            { emoji: "🌶️", x: 12, y: 42, size: 28, floatY: 14, dur: 3.5 },
            { emoji: "🏮", x: 88, y: 62, size: 30, floatY: 8, dur: 4.4 },
            { emoji: "🍡", x: 22, y: 65, size: 26, floatY: 11, dur: 3.7 }
        ],
        routeKey: "food",
        bgImage: "assets/persona/1.png"
    },
    {
        id: "reader",
        title: "文学爱好者",
        subtitle: "书店、图书馆与安静角落的文艺漫游",
        tags: ["先锋书店", "阅读", "文艺", "安静"],
        unlockText: "书店路线、图书馆漫游、适合发呆的角落",
        mainColor: "#6EC6FF",
        secondColor: "#B8E8D2",
        accentColor: "#FFE7A3",
        textColor: "#123047",
        elements: [
            { emoji: "📚", x: 18, y: 16, size: 32, floatY: 12, dur: 3.3 },
            { emoji: "☕", x: 80, y: 20, size: 28, floatY: 10, dur: 3.9 },
            { emoji: "✒️", x: 85, y: 45, size: 30, floatY: 13, dur: 4.2 },
            { emoji: "📖", x: 14, y: 48, size: 34, floatY: 14, dur: 3.6 },
            { emoji: "🌿", x: 75, y: 66, size: 26, floatY: 9, dur: 4.0 },
            { emoji: "📝", x: 24, y: 68, size: 28, floatY: 11, dur: 3.4 }
        ],
        routeKey: "food",
        bgImage: "assets/persona/2.png"
    },
    {
        id: "sport",
        title: "运动达人",
        subtitle: "骑行、跑步、球类运动，开启元气一天",
        tags: ["骑行", "羽毛球", "篮球", "徒步"],
        unlockText: "低压力运动路线、公园步道、校园球场推荐",
        mainColor: "#35D07F",
        secondColor: "#69D2FF",
        accentColor: "#FFF06A",
        textColor: "#053B2E",
        elements: [
            { emoji: "🏀", x: 20, y: 15, size: 34, floatY: 13, dur: 3.1 },
            { emoji: "🏸", x: 76, y: 18, size: 30, floatY: 11, dur: 3.7 },
            { emoji: "🚲", x: 84, y: 42, size: 36, floatY: 15, dur: 4.3 },
            { emoji: "👟", x: 16, y: 44, size: 28, floatY: 10, dur: 3.5 },
            { emoji: "🌤️", x: 88, y: 60, size: 32, floatY: 8, dur: 4.0 },
            { emoji: "💦", x: 20, y: 66, size: 24, floatY: 12, dur: 3.8 }
        ],
        routeKey: "nju",
        bgImage: "assets/persona/3.png"
    },
    {
        id: "coffee",
        title: "咖啡漫游者",
        subtitle: "咖啡、书店、街角小店，适合慢慢逛的午后",
        tags: ["咖啡", "下午茶", "街角", "放松"],
        unlockText: "午后餐茶路线、独立咖啡馆、散步地图",
        mainColor: "#C98B5A",
        secondColor: "#FFE6B7",
        accentColor: "#A8E6A1",
        textColor: "#3B2415",
        elements: [
            { emoji: "☕", x: 22, y: 16, size: 34, floatY: 12, dur: 3.4 },
            { emoji: "🥐", x: 74, y: 20, size: 30, floatY: 14, dur: 4.0 },
            { emoji: "🍰", x: 82, y: 40, size: 28, floatY: 10, dur: 3.6 },
            { emoji: "🌿", x: 16, y: 46, size: 26, floatY: 13, dur: 3.9 },
            { emoji: "🪑", x: 86, y: 58, size: 32, floatY: 9, dur: 4.1 },
            { emoji: "📷", x: 20, y: 64, size: 28, floatY: 11, dur: 3.3 }
        ],
        routeKey: "food",
        bgImage: "assets/persona/4.png"
    },
    {
        id: "history",
        title: "历史探索者",
        subtitle: "沿着城墙与旧建筑，解锁南京的时间故事",
        tags: ["城墙", "博物馆", "建筑", "故事"],
        unlockText: "历史建筑路线、剧情节点、城市故事问答",
        mainColor: "#4FC3C7",
        secondColor: "#FFD166",
        accentColor: "#FF8A65",
        textColor: "#173C43",
        elements: [
            { emoji: "🏯", x: 18, y: 14, size: 34, floatY: 12, dur: 3.5 },
            { emoji: "🧭", x: 80, y: 18, size: 30, floatY: 14, dur: 4.0 },
            { emoji: "📜", x: 86, y: 40, size: 32, floatY: 10, dur: 3.7 },
            { emoji: "🧱", x: 14, y: 44, size: 28, floatY: 13, dur: 3.8 },
            { emoji: "🔍", x: 78, y: 62, size: 30, floatY: 9, dur: 4.2 },
            { emoji: "🗝️", x: 24, y: 66, size: 26, floatY: 11, dur: 3.6 }
        ],
        routeKey: "expo",
        bgImage: "assets/persona/5.png"
    },
    {
        id: "photo",
        title: "拍照打卡党",
        subtitle: "把南京最出片的街角与光影收进相册",
        tags: ["出片", "街景", "胶片", "分享"],
        unlockText: "拍照点位、梧桐街景、今日出片路线",
        mainColor: "#FF9FCE",
        secondColor: "#8EDBFF",
        accentColor: "#FFF176",
        textColor: "#47233A",
        elements: [
            { emoji: "📷", x: 20, y: 15, size: 34, floatY: 13, dur: 3.2 },
            { emoji: "🌸", x: 76, y: 20, size: 28, floatY: 11, dur: 3.8 },
            { emoji: "✨", x: 84, y: 38, size: 30, floatY: 15, dur: 4.0 },
            { emoji: "🎞️", x: 16, y: 44, size: 32, floatY: 10, dur: 3.5 },
            { emoji: "🪞", x: 88, y: 56, size: 26, floatY: 9, dur: 4.3 },
            { emoji: "☁️", x: 22, y: 64, size: 28, floatY: 12, dur: 3.7 }
        ],
        routeKey: "nju",
        bgImage: "assets/persona/6.png"
    },
    {
        id: "night",
        title: "夜游玩家",
        subtitle: "去秦淮河边、老门东里，感受金陵夜色",
        tags: ["秦淮河", "老门东", "灯影", "夜景"],
        unlockText: "夜游路线、灯影任务、隐藏结局与夜景成就",
        mainColor: "#3657FF",
        secondColor: "#7B61FF",
        accentColor: "#FFD166",
        textColor: "#FFF8E8",
        elements: [
            { emoji: "🏮", x: 18, y: 14, size: 34, floatY: 13, dur: 3.3 },
            { emoji: "🌙", x: 82, y: 16, size: 32, floatY: 10, dur: 3.9 },
            { emoji: "🚤", x: 86, y: 42, size: 35, floatY: 14, dur: 4.2 },
            { emoji: "✨", x: 14, y: 46, size: 28, floatY: 12, dur: 3.6 },
            { emoji: "🌉", x: 78, y: 60, size: 30, floatY: 9, dur: 4.1 },
            { emoji: "🎐", x: 22, y: 66, size: 26, floatY: 11, dur: 3.5 }
        ],
        routeKey: "night",
        bgImage: "assets/persona/7.png"
    },
    {
        id: "nju",
        title: "校园情怀派",
        subtitle: "从梧桐树下到北大楼前，收藏属于南大的青春记忆",
        tags: ["南大", "校园", "校史", "青春"],
        unlockText: "南大校史剧情、校园路线、1902到今天的时间线",
        mainColor: "#8E6CFF",
        secondColor: "#7DD3FC",
        accentColor: "#FFD6E7",
        textColor: "#FFFFFF",
        elements: [
            { emoji: "🎓", x: 20, y: 16, size: 34, floatY: 12, dur: 3.2 },
            { emoji: "📚", x: 76, y: 18, size: 30, floatY: 14, dur: 3.8 },
            { emoji: "🌳", x: 84, y: 38, size: 32, floatY: 10, dur: 4.0 },
            { emoji: "🕰️", x: 16, y: 44, size: 28, floatY: 13, dur: 3.5 },
            { emoji: "💜", x: 88, y: 58, size: 26, floatY: 9, dur: 4.2 },
            { emoji: "📍", x: 22, y: 62, size: 28, floatY: 11, dur: 3.7 }
        ],
        routeKey: "nju",
        bgImage: "assets/persona/8.png"
    }
];

// ═══════════════════════════════════════════
//  Pet Companion System · 陪伴精灵系统
// ═══════════════════════════════════════════

const PET_DEFS = [
    {
        id: "duck", name: "金陵鸭鸭", type: "animal",
        emoji: "🦆", color: "#FF7A45",
        personality: "热情开朗，喜欢热闹的街巷，爱带路",
        fn: "首页陪伴，推荐美食路线",
        routeKeys: [], unlockAchievement: null,
        dialogues: {
            idle: ["今天去哪玩呀？", "我在南京等你哦~", "南京的巷子里藏着好多惊喜"],
            welcome: ["你好呀！今天想去哪里探索？", "南京已经展开画卷啦！"],
            guiding: ["这条路我熟，跟我走！", "我带你去发现好地方！"],
            happy: ["耶！任务完成啦！", "今天又走了一条好路线！"],
            confused: ["嗯...还没决定去哪吗？", "要不要我帮你推荐一条路线？"],
            urging: ["喂喂！别发呆啦，出发吧！", "外面阳光正好，出去走走？"]
        }
    },
    {
        id: "cat", name: "秦淮灯猫", type: "animal",
        emoji: "🐱", color: "#D8A94A",
        personality: "神秘温柔，稍微傲娇，夜晚很可靠",
        fn: "陪伴秦淮夜游路线",
        routeKeys: ["night"], unlockAchievement: "night",
        dialogues: {
            idle: ["今晚的灯会很美吧？", "秦淮河的夜色在等你呢"],
            welcome: ["夜色降临，秦淮河在等你", "今晚适合去看看灯影"],
            guiding: ["跟着灯光走，不会迷路", "我知道河畔最好的观景点"],
            happy: ["今夜月色真美！", "金陵夜色的美，只有走过才懂"],
            confused: ["天还没黑呢，再等等？", "等到太阳落山，我们就出发"],
            urging: ["天快黑了，该出发了！", "灯都亮了，你还不来吗？"]
        }
    },
    {
        id: "deer", name: "玄武小鹿", type: "animal",
        emoji: "🦌", color: "#4FC3C7",
        personality: "安静治愈，轻柔稳定，喜欢自然",
        fn: "陪伴自然放空路线",
        routeKeys: ["food"], unlockAchievement: "food",
        dialogues: {
            idle: ["湖边的风吹得很轻...", "今天适合慢慢走"],
            welcome: ["天气真好，去湖边散个步吧", "放轻松，今天不赶时间"],
            guiding: ["沿着湖边小路慢慢走", "听听湖水的声音"],
            happy: ["散步真舒服呀！", "自然的一切都好治愈"],
            confused: ["还没想好去哪？随便走走也行"],
            urging: ["湖边的座位快满了，我们走吧？"]
        }
    },
    {
        id: "swallow", name: "云锦小燕", type: "animal",
        emoji: "🐦", color: "#6F4BB2",
        personality: "灵巧聪明，优雅有文化气质",
        fn: "陪伴展览博物馆路线",
        routeKeys: ["expo"], unlockAchievement: "expo",
        dialogues: {
            idle: ["今天的展览都很有意思", "文化的秘密藏在每件展品里"],
            welcome: ["今天想和旧物说说话吗？", "博物馆的大门已经打开了"],
            guiding: ["安静一点，听展品讲故事", "这件展品背后有个有趣的故事"],
            happy: ["又学到了新知识！", "今天收获满满的文化之旅"],
            confused: ["选个展览方向吧？南博还是明故宫？"],
            urging: ["展馆快关门了，走吗？现在出发还来得及"]
        }
    },
    {
        id: "tea", name: "雨花茶灵", type: "plant",
        emoji: "🍃", color: "#8BAE7F",
        personality: "温柔清新，安静有姐姐感，治愈系",
        fn: "陪伴文学路线和轻松散步",
        routeKeys: ["food"], unlockAchievement: "coffee",
        dialogues: {
            idle: ["一杯好茶，一段安静的时光", "书香和茶香，是南京的温柔"],
            welcome: ["今天适合慢下来，读一本书", "午后的阳光刚刚好"],
            guiding: ["我带你去一个安静的小角落", "先锋书店就在前面了"],
            happy: ["读完一本书的感觉真好", "这样的下午，值得收藏"],
            confused: ["不知道该读什么书？我帮你挑"],
            urging: ["茶快凉啦，我们出发吧？"]
        }
    },
    {
        id: "wutong", name: "梧桐叶精灵", type: "plant",
        emoji: "🍂", color: "#E8A040",
        personality: "青春温暖，陪伴感强，有校园回忆气息",
        fn: "陪伴南大校园路线",
        routeKeys: ["nju"], unlockAchievement: "nju",
        dialogues: {
            idle: ["梧桐叶沙沙作响...", "每一片叶子都有故事"],
            welcome: ["你好呀！南大校园在等我们", "从梧桐道开始今天的旅程吧"],
            guiding: ["沿着梧桐大道走吧", "北大楼就在前面了"],
            happy: ["树下记录了好多故事呢！", "这段校园记忆，收藏好了"],
            confused: ["（叶子轻轻摇了摇）还没决定？"],
            urging: ["树荫不等人哦，趁阳光正好，走吧！"]
        }
    },
    {
        id: "plum", name: "梅花小灵", type: "plant",
        emoji: "🌸", color: "#FF9FCE",
        personality: "甜美元气，俏皮浪漫，喜欢打卡拍照",
        fn: "陪伴拍照打卡路线",
        routeKeys: ["nju", "food"], unlockAchievement: "photo",
        dialogues: {
            idle: ["今天的光线很适合拍照呢！", "南京的街角处处都是风景"],
            welcome: ["出片的好天气！出发拍照吧", "今天一定会有很多好看的照片"],
            guiding: ["我知道好几个出片点！", "这个角度最好看，快拍！"],
            happy: ["咔嚓！完美~", "今天的照片可以发朋友圈啦"],
            confused: ["还没找到想拍的地方？要我推荐吗"],
            urging: ["光线不等人，黄金时刻快到了！"]
        }
    },
    {
        id: "lotus", name: "荷叶团子精", type: "plant",
        emoji: "🪷", color: "#35D07F",
        personality: "憨憨放松，软萌亲切，夏日清凉感",
        fn: "陪伴夏日散步和湖边路线",
        routeKeys: ["food"], unlockAchievement: "five_stops",
        dialogues: {
            idle: ["咕噜咕噜...荷叶在飘", "夏天最适合在水边发呆"],
            welcome: ["今天好凉快！去湖边吧", "荷花都开了呢"],
            guiding: ["水边这条路最舒服了", "跟着小荷叶走，不会热"],
            happy: ["湖边散步太舒服啦！", "今天又消暑又开心"],
            confused: ["嗯...随便走走也行啊", "不用一定要有目的地的"],
            urging: ["外面好热...但水边很凉快的，走吗？"]
        }
    }
];

// ── Pet Persistence ──
function getPetData() {
    try { return JSON.parse(localStorage.getItem("nj_pets") || "{}"); }
    catch { return {}; }
}
function savePetData(data) { localStorage.setItem("nj_pets", JSON.stringify(data)); }
function isPetUnlocked(petId) {
    if (petId === "duck") return true;
    const data = getPetData();
    return !!data[petId];
}
function unlockPet(petId) {
    const data = getPetData();
    if (data[petId]) return;
    data[petId] = { unlocked: true, date: new Date().toISOString() };
    savePetData(data);
    const pet = PET_DEFS.find(p => p.id === petId);
    if (pet) showToast("新伙伴加入！「" + pet.name + "」" + pet.emoji + " 来了！");
    updatePetDisplay(petId);
}

// ── Pet State ──
let currentPet = PET_DEFS[0];
let petState = "idle";
let petBubbleTimer = null;
let petUrgeTimer = null;
let lastUserInteraction = Date.now();
const PET_IDLE_THRESHOLD = 45000;

// ── Pet77 V2 Raising System ──
const PET77_STORAGE_KEY = "nj_pet_v2";
const PET77_CHAT_LAYOUT_KEY = "nj_pet77_chat_layout";
const USER_PROFILE_STORAGE_KEY = "nj_user_profile";
const APP_GITHUB_URL = "";
const PET77_FRAME = { width: 192, height: 208 };
const PET77_DISPLAY_FRAME = { width: 96, height: 104 };
const PET77_ASSET = "assets/pets/77/spritesheet.webp";
// 77 spritesheet rows: 0 loaf idle, 1 move right, 2 move left, 3 wave/tap,
// 4 playful crouch, 5 sad/sleepy, 6 sit idle, 7 relaxed interaction, 8 grooming.
const PET77_ANIMATIONS = {
    idle: { row: 0, frameCount: 6, frameDurationMs: 180, loop: true },
    dragRight: { row: 1, frameCount: 8, frameDurationMs: 90, loop: true },
    dragLeft: { row: 2, frameCount: 8, frameDurationMs: 90, loop: true },
    tap: { row: 3, frameCount: 4, frameDurationMs: 130, loop: false },
    petting: { row: 8, frameCount: 6, frameDurationMs: 140, loop: false },
    happy: { row: 7, frameCount: 6, frameDurationMs: 120, loop: false },
    thinking: { row: 6, frameCount: 6, frameDurationMs: 150, loop: true },
    failed: { row: 5, frameCount: 8, frameDurationMs: 150, loop: false },
    sleep: { row: 5, frameCount: 8, frameDurationMs: 220, loop: true },
    play: { row: 4, frameCount: 5, frameDurationMs: 120, loop: false },
};
const PET77_ACTIONS = {
    petting: { happiness: 8, intimacy: 3, limit: 10, state: "petting", label: "抚摸" },
    feed: { happiness: 12, intimacy: 2, limit: 5, state: "happy", label: "喂食" },
    talk: { happiness: 5, intimacy: 4, limit: 8, state: "tap", label: "聊天" },
    sleep: { happiness: 4, intimacy: 0, limit: null, state: "sleep", label: "休息" },
};
const PET77_FOODS = [
    { id: "osmanthus", name: "桂花小点", desc: "香甜，开心值多一点", happiness: 14, intimacy: 2 },
    { id: "duckling", name: "金陵饭团", desc: "扎实，亲密度多一点", happiness: 10, intimacy: 4 },
    { id: "tea", name: "热热麦茶", desc: "温柔，适合休息前", happiness: 9, intimacy: 3 },
];
const PET77_TALK_LINES = [
    "我在这里陪你慢慢逛南京。",
    "今天也要把开心值攒满。",
    "如果不知道去哪，就先摸摸我。",
    "路线想好了叫我，我会跟上。",
];
const PET77_LOW_MOOD_LINES = [
    "我有点没精神，陪我一下吧。",
    "开心值有点低，想被摸摸。",
    "今天可以多和我说几句话吗？",
];

let pet77Data = loadPet77Data();
let pet77State = "idle";
let pet77FrameIndex = 0;
let pet77AnimationTimer = null;
let pet77IdleTimer = null;
let pet77Dragging = false;
let pet77PointerStart = null;
let pet77ChatSessionId = "pet77-" + todayKey();
let pet77TapTimer = null;
let pet77LastTapAt = 0;
let pet77ChatDragState = null;

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function createDefaultPet77Data() {
    return {
        visible: true,
        position: null,
        intimacy: 10,
        happiness: 70,
        lastInteractionAt: Date.now(),
        dailyActions: { date: todayKey(), petting: 0, feed: 0, talk: 0 },
    };
}

function normalizePet77Data(data) {
    const defaults = createDefaultPet77Data();
    const merged = Object.assign({}, defaults, data || {});
    merged.visible = merged.visible !== false;
    merged.intimacy = clampNumber(Number(merged.intimacy ?? defaults.intimacy), 0, 100);
    merged.happiness = clampNumber(Number(merged.happiness ?? defaults.happiness), 0, 100);
    merged.lastInteractionAt = Number(merged.lastInteractionAt || defaults.lastInteractionAt);
    if (!merged.dailyActions || merged.dailyActions.date !== todayKey()) {
        merged.dailyActions = { date: todayKey(), petting: 0, feed: 0, talk: 0 };
    }
    return merged;
}

function loadPet77Data() {
    try {
        const stored = JSON.parse(localStorage.getItem(PET77_STORAGE_KEY) || "null");
        const data = normalizePet77Data(stored);
        return applyPet77Decay(data);
    } catch {
        return createDefaultPet77Data();
    }
}

function savePet77Data() {
    pet77Data = normalizePet77Data(pet77Data);
    localStorage.setItem(PET77_STORAGE_KEY, JSON.stringify(pet77Data));
}

function applyPet77Decay(data) {
    const normalized = normalizePet77Data(data);
    const elapsed = Date.now() - normalized.lastInteractionAt;
    const decaySteps = Math.floor(elapsed / (6 * 60 * 60 * 1000));
    if (decaySteps > 0) {
        normalized.happiness = Math.max(20, normalized.happiness - decaySteps * 5);
        normalized.lastInteractionAt = Date.now();
    }
    return normalized;
}

function getPet77IntimacyTitle() {
    if (pet77Data.intimacy >= 90) return "挚友";
    if (pet77Data.intimacy >= 60) return "亲近";
    if (pet77Data.intimacy >= 30) return "熟悉";
    return "陌生";
}

function getPet77MoodTitle() {
    if (pet77Data.happiness >= 70) return "开心";
    if (pet77Data.happiness >= 30) return "平静";
    return "低落";
}

function syncPet77Panels() {
    const intimacy = document.getElementById("pet77-intimacy-value");
    const happiness = document.getElementById("pet77-happiness-value");
    const intimacyBar = document.getElementById("pet77-intimacy-bar");
    const happinessBar = document.getElementById("pet77-happiness-bar");
    const title = document.getElementById("pet77-stage-title");
    const mood = document.getElementById("pet77-mood-title");
    const daily = document.getElementById("pet77-daily-actions");
    const toggle = document.getElementById("pet77-visible-toggle");
    if (intimacy) intimacy.textContent = String(pet77Data.intimacy);
    if (happiness) happiness.textContent = String(pet77Data.happiness);
    if (intimacyBar) intimacyBar.style.width = pet77Data.intimacy + "%";
    if (happinessBar) happinessBar.style.width = pet77Data.happiness + "%";
    if (title) title.textContent = getPet77IntimacyTitle();
    if (mood) mood.textContent = getPet77MoodTitle();
    if (daily) {
        const d = pet77Data.dailyActions;
        daily.textContent = `抚摸 ${d.petting || 0}/10 · 喂食 ${d.feed || 0}/5 · 聊天 ${d.talk || 0}/8`;
    }
    if (toggle) toggle.checked = pet77Data.visible;
}

function setPet77Visibility(visible) {
    pet77Data.visible = !!visible;
    savePet77Data();
    const overlay = document.getElementById("pet77-overlay");
    if (overlay) overlay.classList.toggle("hidden", !pet77Data.visible);
    syncPet77Panels();
}

function setPet77Frame(row, col) {
    const sprite = document.getElementById("pet77-sprite");
    const preview = document.getElementById("pet77-preview-sprite");
    const x = -(col * PET77_DISPLAY_FRAME.width) + "px";
    const y = -(row * PET77_DISPLAY_FRAME.height) + "px";
    if (sprite) sprite.style.backgroundPosition = `${x} ${y}`;
    if (preview) preview.style.backgroundPosition = `${x} ${y}`;
}

function setPet77State(state, options = {}) {
    if (!PET77_ANIMATIONS[state]) state = "idle";
    pet77State = state;
    pet77FrameIndex = 0;
    if (pet77AnimationTimer) clearTimeout(pet77AnimationTimer);
    document.getElementById("pet77-overlay")?.setAttribute("data-state", state);
    playPet77Frame(options.returnToIdle !== false);
}

function playPet77Frame(returnToIdle = true) {
    const spec = PET77_ANIMATIONS[pet77State] || PET77_ANIMATIONS.idle;
    setPet77Frame(spec.row, pet77FrameIndex);
    pet77FrameIndex += 1;
    if (pet77FrameIndex >= spec.frameCount) {
        if (spec.loop) {
            pet77FrameIndex = 0;
        } else if (returnToIdle) {
            pet77AnimationTimer = setTimeout(() => setPet77State("idle"), spec.frameDurationMs);
            return;
        } else {
            pet77FrameIndex = spec.frameCount - 1;
        }
    }
    pet77AnimationTimer = setTimeout(() => playPet77Frame(returnToIdle), spec.frameDurationMs);
}

function showPet77Bubble(message) {
    const bubble = document.getElementById("pet77-bubble");
    if (!bubble) return;
    bubble.textContent = message;
    bubble.classList.add("show");
    clearTimeout(bubble._timer);
    bubble._timer = setTimeout(() => bubble.classList.remove("show"), 3000);
}

function showPet77Affection(message = "亲密度升级") {
    const overlay = document.getElementById("pet77-overlay");
    if (!overlay || overlay.classList.contains("hidden")) return;
    overlay.querySelector(".pet77-affection-pop")?.remove();
    overlay.querySelector(".pet77-heart-burst")?.remove();

    const pop = document.createElement("div");
    pop.className = "pet77-affection-pop";
    pop.textContent = message;

    const burst = document.createElement("div");
    burst.className = "pet77-heart-burst";
    burst.innerHTML = Array.from({ length: 9 }, (_, i) =>
        `<span style="--i:${i};--x:${(i - 4) * 10}px;--d:${0.06 * i}s">${i % 3 === 0 ? "○" : "♡"}</span>`
    ).join("");

    overlay.appendChild(pop);
    overlay.appendChild(burst);
    setTimeout(() => {
        pop.remove();
        burst.remove();
    }, 1700);
}

function pet77ResetIdleTimer() {
    if (pet77IdleTimer) clearTimeout(pet77IdleTimer);
    if (pet77State === "sleep") setPet77State("idle");
    pet77IdleTimer = setTimeout(() => {
        if (pet77Data.visible) {
            setPet77State("sleep", { returnToIdle: false });
            showPet77Bubble("我先眯一会儿。");
        }
    }, PET_IDLE_THRESHOLD);
}

function pet77RecordInteraction() {
    pet77Data.lastInteractionAt = Date.now();
    savePet77Data();
    pet77ResetIdleTimer();
}

function pet77ApplyAction(action, options = {}) {
    pet77Data = applyPet77Decay(pet77Data);
    if (action === "summon") {
        setPet77Visibility(true);
        setPet77State("happy");
        showPet77Bubble("我回来啦。");
        pet77RecordInteraction();
        return;
    }
    const rule = PET77_ACTIONS[action];
    if (!rule) return;
    const dailyKey = action === "petting" ? "petting" : action === "feed" ? "feed" : action === "talk" ? "talk" : null;
    let canGain = true;
    if (dailyKey && rule.limit !== null) {
        const used = pet77Data.dailyActions[dailyKey] || 0;
        canGain = used < rule.limit;
        if (canGain) pet77Data.dailyActions[dailyKey] = used + 1;
    }
    const gain = options.food || {};
    if (canGain) {
        pet77Data.happiness = clampNumber(pet77Data.happiness + (gain.happiness ?? rule.happiness), 0, 100);
        pet77Data.intimacy = clampNumber(pet77Data.intimacy + (gain.intimacy ?? rule.intimacy), 0, 100);
    }
    pet77RecordInteraction();
    setPet77State(rule.state);
    const lines = action === "talk" ? PET77_TALK_LINES : [];
    const msg = !canGain
        ? `${rule.label}次数到达今日上限啦，明天再继续。`
        : action === "sleep"
            ? "休息一下，等会儿继续出发。"
            : action === "feed" && gain.name
                ? `喂了${gain.name}，77 很满足。`
            : lines.length
                ? lines[Math.floor(Math.random() * lines.length)]
                : `${rule.label}完成，开心值和亲密度都变好了。`;
    showPet77Bubble(options.bubbleMessage || msg);
    if (canGain) showPet77Affection("亲密度升级");
    if (!options.skipToast) showToast(msg);
    syncPet77Panels();
    if (action === "sleep") setTimeout(() => setPet77State("idle"), 3000);
}

function pet77HandleOverlayTap() {
    pet77Data = applyPet77Decay(pet77Data);
    pet77RecordInteraction();
    setPet77State("tap");
    const now = Date.now();
    if (now - pet77LastTapAt < 320) {
        pet77LastTapAt = 0;
        if (pet77TapTimer) clearTimeout(pet77TapTimer);
        showPet77Bubble("我在，想和我说什么？");
        openPet77Chat();
        return;
    }
    pet77LastTapAt = now;
    if (pet77TapTimer) clearTimeout(pet77TapTimer);
    pet77TapTimer = setTimeout(() => {
        const lines = pet77Data.happiness < 30 ? PET77_LOW_MOOD_LINES : PET77_TALK_LINES;
        showPet77Bubble(lines[Math.floor(Math.random() * lines.length)]);
        pet77LastTapAt = 0;
    }, 330);
}

function showPet77FeedMenu(anchor) {
    document.querySelector(".pet77-feed-menu")?.remove();
    const menu = document.createElement("div");
    menu.className = "pet77-feed-menu";
    const rect = anchor?.getBoundingClientRect();
    if (rect) {
        menu.style.left = Math.min(window.innerWidth - 260, Math.max(16, rect.left - 84)) + "px";
        menu.style.top = Math.max(80, rect.top - 172) + "px";
    }
    menu.innerHTML = `
        <div class="pet77-feed-title">选择食物</div>
        ${PET77_FOODS.map(food => `
            <button class="pet77-food-option" type="button" data-food="${food.id}">
                <span class="pet77-food-name">${food.name}</span>
                <span class="pet77-food-desc">${food.desc}</span>
            </button>
        `).join("")}
    `;
    document.body.appendChild(menu);
    menu.querySelectorAll(".pet77-food-option").forEach(btn => {
        btn.addEventListener("click", () => {
            const food = PET77_FOODS.find(f => f.id === btn.dataset.food);
            menu.remove();
            pet77ApplyAction("feed", { food });
        });
    });
    setTimeout(() => {
        const close = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("pointerdown", close);
            }
        };
        document.addEventListener("pointerdown", close);
    }, 0);
}

function placePet77Overlay(overlay) {
    const pos = pet77Data.position;
    const x = pos && Number.isFinite(pos.x) ? pos.x : Math.max(12, window.innerWidth - 126);
    const y = pos && Number.isFinite(pos.y) ? pos.y : Math.max(64, window.innerHeight - 244);
    const maxX = Math.max(12, window.innerWidth - PET77_DISPLAY_FRAME.width - 18);
    const maxY = Math.max(56, window.innerHeight - PET77_DISPLAY_FRAME.height - 92);
    overlay.style.left = clampNumber(x, 12, maxX) + "px";
    overlay.style.top = clampNumber(y, 56, maxY) + "px";
}

function bindPet77Drag(overlay) {
    overlay.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".pet77-hide")) return;
        pet77PointerStart = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            lastX: e.clientX,
            left: parseFloat(overlay.style.left || "0"),
            top: parseFloat(overlay.style.top || "0"),
            moved: false,
        };
        overlay.setPointerCapture(e.pointerId);
    });
    overlay.addEventListener("pointermove", (e) => {
        if (!pet77PointerStart || pet77PointerStart.pointerId !== e.pointerId) return;
        const dx = e.clientX - pet77PointerStart.startX;
        const dy = e.clientY - pet77PointerStart.startY;
        if (Math.abs(dx) + Math.abs(dy) > 6) {
            pet77PointerStart.moved = true;
            pet77Dragging = true;
            overlay.classList.add("dragging");
        }
        if (!pet77Dragging) return;
        const directionState = e.clientX >= pet77PointerStart.lastX ? "dragRight" : "dragLeft";
        if (pet77State !== directionState) setPet77State(directionState, { returnToIdle: false });
        pet77PointerStart.lastX = e.clientX;
        const maxX = Math.max(12, window.innerWidth - PET77_DISPLAY_FRAME.width - 18);
        const maxY = Math.max(56, window.innerHeight - PET77_DISPLAY_FRAME.height - 92);
        overlay.style.left = clampNumber(pet77PointerStart.left + dx, 12, maxX) + "px";
        overlay.style.top = clampNumber(pet77PointerStart.top + dy, 56, maxY) + "px";
    });
    overlay.addEventListener("pointerup", (e) => {
        if (!pet77PointerStart || pet77PointerStart.pointerId !== e.pointerId) return;
        overlay.releasePointerCapture(e.pointerId);
        overlay.classList.remove("dragging");
        if (pet77PointerStart.moved) {
            pet77Data.position = {
                x: parseFloat(overlay.style.left || "0"),
                y: parseFloat(overlay.style.top || "0"),
            };
            savePet77Data();
            setPet77State("idle");
        } else {
            pet77HandleOverlayTap();
        }
        pet77PointerStart = null;
        pet77Dragging = false;
    });
    overlay.addEventListener("pointercancel", () => {
        overlay.classList.remove("dragging");
        pet77PointerStart = null;
        pet77Dragging = false;
        setPet77State("idle");
    });
}

function openPet77Chat() {
    let panel = document.getElementById("pet77-chat-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "pet77-chat-panel";
        panel.className = "pet77-chat-panel";
        panel.innerHTML = `
            <div class="pet77-chat-head">
                <span>77</span>
                <button class="pet77-chat-close" type="button" aria-label="关闭宠物聊天">×</button>
            </div>
            <div class="pet77-chat-messages" id="pet77-chat-messages">
                <div class="pet77-chat-msg bot">我在这里，短短聊几句也可以。</div>
            </div>
            <div class="pet77-chat-input-row">
                <input class="pet77-chat-input" id="pet77-chat-input" type="text" placeholder="和 77 说句话..." />
                <button class="pet77-chat-send" id="pet77-chat-send" type="button">发送</button>
            </div>
            <div class="pet77-chat-resize" aria-label="调整聊天框大小"></div>
        `;
        document.body.appendChild(panel);
        panel.querySelector(".pet77-chat-close").addEventListener("click", closePet77Chat);
        panel.querySelector("#pet77-chat-send").addEventListener("click", sendPet77ChatMessage);
        panel.querySelector("#pet77-chat-input").addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendPet77ChatMessage();
        });
        bindPet77ChatPanelControls(panel);
    }
    placePet77ChatPanel(panel);
    panel.classList.add("open");
    document.getElementById("pet77-chat-input")?.focus();
}

function closePet77Chat() {
    document.getElementById("pet77-chat-panel")?.classList.remove("open");
}

function placePet77ChatPanel(panel) {
    const saved = loadPet77ChatLayout();
    if (saved) {
        const width = clampNumber(saved.width || 300, 240, Math.min(380, window.innerWidth - 24));
        const height = clampNumber(saved.height || 220, 176, Math.min(360, window.innerHeight - 96));
        panel.style.width = width + "px";
        panel.style.height = height + "px";
        panel.style.left = clampNumber(saved.left || 16, 12, window.innerWidth - width - 12) + "px";
        panel.style.top = clampNumber(saved.top || 96, 56, window.innerHeight - height - 12) + "px";
        panel.style.bottom = "auto";
        return;
    }
    const overlay = document.getElementById("pet77-overlay");
    const rect = overlay?.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    panel.style.width = width + "px";
    panel.style.height = "220px";
    if (rect) {
        panel.style.left = clampNumber(rect.left - width + 102, 12, window.innerWidth - width - 12) + "px";
        panel.style.top = clampNumber(rect.top - 126, 64, window.innerHeight - 236) + "px";
    } else {
        panel.style.left = "16px";
        panel.style.bottom = "92px";
    }
}

function loadPet77ChatLayout() {
    try {
        return JSON.parse(localStorage.getItem(PET77_CHAT_LAYOUT_KEY) || "null");
    } catch {
        return null;
    }
}

function savePet77ChatLayout(panel) {
    if (!panel) return;
    localStorage.setItem(PET77_CHAT_LAYOUT_KEY, JSON.stringify({
        left: parseFloat(panel.style.left || "16"),
        top: parseFloat(panel.style.top || "96"),
        width: panel.offsetWidth,
        height: panel.offsetHeight,
    }));
}

function bindPet77ChatPanelControls(panel) {
    if (!panel || panel.dataset.dragBound === "1") return;
    panel.dataset.dragBound = "1";
    const head = panel.querySelector(".pet77-chat-head");
    const resize = panel.querySelector(".pet77-chat-resize");

    const start = (e, mode) => {
        if (e.target.closest("button, input")) return;
        e.preventDefault();
        pet77ChatDragState = {
            mode,
            startX: e.clientX,
            startY: e.clientY,
            left: parseFloat(panel.style.left || "0"),
            top: parseFloat(panel.style.top || "0"),
            width: panel.offsetWidth,
            height: panel.offsetHeight,
        };
        panel.classList.add(mode === "move" ? "moving" : "resizing");
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", end, { once: true });
    };

    const move = (e) => {
        if (!pet77ChatDragState) return;
        const dx = e.clientX - pet77ChatDragState.startX;
        const dy = e.clientY - pet77ChatDragState.startY;
        if (pet77ChatDragState.mode === "move") {
            const maxLeft = window.innerWidth - panel.offsetWidth - 12;
            const maxTop = window.innerHeight - panel.offsetHeight - 12;
            panel.style.left = clampNumber(pet77ChatDragState.left + dx, 12, Math.max(12, maxLeft)) + "px";
            panel.style.top = clampNumber(pet77ChatDragState.top + dy, 56, Math.max(56, maxTop)) + "px";
            panel.style.bottom = "auto";
        } else {
            const maxWidth = Math.min(420, window.innerWidth - pet77ChatDragState.left - 12);
            const maxHeight = Math.min(380, window.innerHeight - pet77ChatDragState.top - 12);
            panel.style.width = clampNumber(pet77ChatDragState.width + dx, 240, Math.max(240, maxWidth)) + "px";
            panel.style.height = clampNumber(pet77ChatDragState.height + dy, 176, Math.max(176, maxHeight)) + "px";
        }
    };

    const end = () => {
        window.removeEventListener("pointermove", move);
        panel.classList.remove("moving", "resizing");
        savePet77ChatLayout(panel);
        pet77ChatDragState = null;
    };

    head?.addEventListener("pointerdown", (e) => start(e, "move"));
    resize?.addEventListener("pointerdown", (e) => start(e, "resize"));
}

function appendPet77ChatMsg(type, text) {
    const container = document.getElementById("pet77-chat-messages");
    if (!container) return null;
    const msg = document.createElement("div");
    msg.className = "pet77-chat-msg " + type;
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
}

function sendPet77ChatMessage() {
    const input = document.getElementById("pet77-chat-input");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    appendPet77ChatMsg("user", text);
    const typing = appendPet77ChatMsg("bot thinking", "77 正在想...");
    setPet77State("thinking", { returnToIdle: false });
    pet77ApplyAction("talk", { skipToast: true, bubbleMessage: "我在认真听。" });

    fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: 1,
            sessionId: pet77ChatSessionId,
            guideRole: "pet77",
            message: "你是南京城市漫游应用里的轻量桌宠 77。请用温柔、简短、陪伴感的中文回复，不超过两句话。用户说：" + text,
        }),
    })
    .then(res => {
        if (!res.ok) throw new Error("AI chat unavailable");
        return res.json();
    })
    .then(data => {
        const reply = data.data?.content || data.content || data.message || "我听见啦，我们慢慢来。";
        if (typing) typing.textContent = reply;
        setPet77State("happy");
        showPet77Bubble("聊完更亲近啦。");
        showPet77Affection("亲密度升级");
    })
    .catch(() => {
        const fallbacks = [
            "我陪着你。想出门的话，我们就从近一点的地方开始。",
            "今天可以慢慢走，不用急着把所有地方都逛完。",
            "我记住啦。等你想路线的时候，我会一起想。",
        ];
        if (typing) typing.textContent = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        setPet77State("happy");
    });
}

function initPet77Overlay() {
    if (document.getElementById("pet77-overlay")) return;
    pet77Data = loadPet77Data();
    const overlay = document.createElement("div");
    overlay.id = "pet77-overlay";
    overlay.className = "pet77-overlay";
    overlay.innerHTML = `
        <div class="pet77-bubble" id="pet77-bubble"></div>
        <button class="pet77-hide" type="button" aria-label="隐藏 77">×</button>
        <div class="pet77-sprite" id="pet77-sprite" aria-label="77 桌宠"></div>
        <div class="pet77-shadow"></div>
    `;
    document.body.appendChild(overlay);
    placePet77Overlay(overlay);
    overlay.classList.toggle("hidden", !pet77Data.visible);
    overlay.querySelector(".pet77-hide").addEventListener("click", (e) => {
        e.stopPropagation();
        setPet77Visibility(false);
        showToast("已隐藏 77，可在宠物页重新召唤");
    });
    bindPet77Drag(overlay);
    window.addEventListener("resize", () => placePet77Overlay(overlay));
    setPet77State("idle");
    pet77ResetIdleTimer();
    syncPet77Panels();
}

// ── Pet Display Functions ──
function updatePetDisplay(petId) {
    const pet = petId ? PET_DEFS.find(p => p.id === petId) : currentPet;
    if (!pet) return;
    currentPet = pet;
    const avatar = document.getElementById("pet-avatar");
    if (avatar) {
        avatar.textContent = pet.emoji;
        avatar.style.background = hexToRgba(pet.color, 0.14);
        avatar.style.borderColor = hexToRgba(pet.color, 0.35);
    }
}

function setPetState(state) {
    petState = state;
    const pet77StateMap = {
        idle: "idle",
        welcome: "tap",
        happy: "happy",
        guiding: "thinking",
        confused: "failed",
        urging: "tap",
    };
    if (typeof setPet77State === "function" && pet77StateMap[state]) {
        setPet77State(pet77StateMap[state]);
    }
    const avatar = document.getElementById("pet-avatar");
    if (!avatar) return;
    avatar.classList.remove("state-idle", "state-welcome", "state-happy", "state-guiding", "state-confused", "state-urging");
    if (state === "idle") avatar.classList.add("state-idle");
    else if (state === "welcome") avatar.classList.add("state-welcome");
    else if (state === "happy") avatar.classList.add("state-happy");
    else if (state === "confused") avatar.classList.add("state-confused");
    else if (state === "guiding") avatar.classList.add("state-idle");
    else if (state === "urging") avatar.classList.add("state-urging");

    const dialogues = currentPet.dialogues[state] || currentPet.dialogues["idle"];
    const msg = dialogues[Math.floor(Math.random() * dialogues.length)];
    showPetBubble(msg);
}

function showPetBubble(msg) {
    const bubble = document.getElementById("pet-bubble");
    const text = document.getElementById("pet-bubble-text");
    if (!bubble || !text) return;
    text.textContent = msg;
    bubble.classList.add("show");
    if (petBubbleTimer) clearTimeout(petBubbleTimer);
    petBubbleTimer = setTimeout(() => {
        bubble.classList.remove("show");
    }, 3500);
}

function hidePetBubble() {
    const bubble = document.getElementById("pet-bubble");
    if (bubble) bubble.classList.remove("show");
}

function getPetForRoute(routeKey) {
    const match = PET_DEFS.find(p => p.routeKeys.includes(routeKey) && isPetUnlocked(p.id));
    return match || PET_DEFS[0];
}

// ── Pet Selector ──
function showPetSelector() {
    if (document.querySelector(".pet-selector-overlay")) return;
    hidePetBubble();
    const overlay = document.createElement("div");
    overlay.className = "pet-selector-overlay";
    const panel = document.createElement("div");
    panel.className = "pet-selector-panel";
    panel.innerHTML =
        `<h3 style="font-family:'Noto Serif SC',serif;margin:0 0 4px;font-size:18px;font-weight:500;">选择旅伴</h3>
        <p style="font-size:12px;color:var(--soft);margin-bottom:16px;">更多旅伴将在后续解锁</p>
        <div class="pet-selector-grid">
            ${PET_DEFS.map(p => {
                const unlocked = isPetUnlocked(p.id);
                const isActive = currentPet.id === p.id;
                return `<div class="pet-selector-item locked" data-pet="${p.id}"
                    style="background:${isActive ? hexToRgba(p.color, 0.10) : 'var(--surface)'};
                    border:1px solid ${isActive ? hexToRgba(p.color, 0.24) : 'var(--rule)'};
                    opacity:${unlocked ? '0.82' : '0.45'};">
                    <span class="pet-sel-emoji">?</span>
                    <span class="pet-sel-name">${p.name}</span>
                    <span class="pet-sel-lock">待解锁</span>
                </div>`;
            }).join("")}
        </div>
        <button class="pet-selector-close" style="margin-top:16px;padding:10px 32px;border-radius:999px;
            background:var(--ink);color:#fff;font-size:13px;font-weight:600;cursor:pointer;border:none;
            font-family:inherit;">关闭</button>`;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    panel.querySelectorAll(".pet-selector-item:not(.locked)").forEach(item => {
        item.addEventListener("click", () => {
            const petId = item.dataset.pet;
            updatePetDisplay(petId);
            setPetState("welcome");
            setTimeout(() => setPetState("idle"), 3500);
            overlay.remove();
        });
    });
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });
    panel.querySelector(".pet-selector-close").addEventListener("click", () => overlay.remove());
}

// ── Pet Idle/Urge Timer ──
function resetPetIdleTimer() {
    lastUserInteraction = Date.now();
    if (petState === "urging") setPetState("idle");
    if (typeof pet77ResetIdleTimer === "function") pet77ResetIdleTimer();
    if (petUrgeTimer) clearTimeout(petUrgeTimer);
    petUrgeTimer = setTimeout(() => {
        if (Date.now() - lastUserInteraction >= PET_IDLE_THRESHOLD && mainPageShown && currentTab === "home") {
            setPetState("urging");
        }
    }, PET_IDLE_THRESHOLD);
}

let selectedPersonaId = null;
let selectedPersonas = [];
let activeCardIndex = 0;
let isAnimating = false;

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
    sceneH = vh;

    canvas.width = vw;
    canvas.height = vh;
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";

    if (loaded.some(Boolean)) preRenderScenes();
    paperTex = genPaperTexture();
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

    if (personaSwiperShown && !enteredApp) {
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
        if (!mainPageShown) {
            renderMainApp();
        } else {
            // Paper background when main page HTML is visible
            if (paperTex) {
                ctx.fillStyle = ctx.createPattern(paperTex, "repeat") || "#FCFCFB";
            } else {
                ctx.fillStyle = "#FCFCFB";
            }
            ctx.fillRect(0, 0, W, H);
        }
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
    // If in transition, skip to next scene immediately
    if (transition) {
        transition.progress = 1;
        return;
    }

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

// ── Route Data (with stories & duration in minutes) ──
const routes = {
    nju: {
        title: "南大校史线：从三江师范到今天",
        desc: "从三江师范到今天，把一座校园慢慢走完。",
        meta: ["150 分钟", "轻松漫步", "免费"],
        duration: 150,
        stops: [
            { name: "三江师范学堂旧址", detail: "故事开始的地方，梧桐叶落满台阶。",
              story: "1902年，张之洞在这里创办三江师范学堂，南京现代高等教育的起点。站在这里，想象一百二十多年前的学生，也是踩着这些梧桐叶走进校门的。" },
            { name: "北大楼", detail: "红砖在夕阳里安静地站着，见过很多人的第一天。",
              story: "北大楼建于1919年，是南大标志性建筑。青砖墙面、歇山顶设计，中西合璧的风格见证了一代代学子的来来往往。据说每一个南大新生都会在这里拍第一张照片。" },
            { name: "校史馆", detail: "从1902到2026，一座校园的记忆。",
              story: "走进校史馆，就像翻开一本厚重的日记。从三江师范到国立中央大学，再到今天的南京大学，124年的故事都藏在这些展品里。看看有没有你熟悉的校友？" },
            { name: "梧桐大道", detail: "风吹过树梢，像翻开一本旧书。",
              story: "南大的梧桐树是这座城市的活化石。春天新绿、夏天浓荫、秋天金黄、冬天枝桠——四季轮转，树下的故事也在不断更新。走在这条路上，你也是南大历史的一部分了。" }
        ]
    },
    night: {
        title: "秦淮夜游：秦淮河 - 夫子庙 - 老门东",
        desc: "今晚的灯，会把你带进一场旧梦。",
        meta: ["210 分钟", "适中节奏", "80 - 200 元"],
        duration: 210,
        stops: [
            { name: "秦淮河畔", detail: "夜色落下时，河面泛起第一盏灯。",
              story: "秦淮河是南京的母亲河，也是六朝金粉的缩影。「烟笼寒水月笼沙，夜泊秦淮近酒家。」杜牧的诗句让这里的夜色流传千年。今晚，你站在了这首诗里。" },
            { name: "夫子庙", detail: "灯火渐明，人群里藏着南京的旧梦。",
              story: "夫子庙始建于东晋，是中国四大文庙之一。这里曾是江南科举文化中心，无数学子在此祈求功名。如今是南京最热闹的夜市。尝尝旁边的秦淮八绝小吃吧！" },
            { name: "老门东", detail: "巷子深处，烟火气和故事一样浓。",
              story: "老门东是南京保存最完好的历史街区之一。青石板路、马头墙、雕花门窗——每条巷子都藏着一段旧事。随便拐进一条小巷，可能就偶遇了百年前的某个瞬间。" }
        ]
    },
    food: {
        title: "午后餐茶线：小吃 - 咖啡 - 书店 - 散步",
        desc: "不赶路，只把下午慢慢花掉。",
        meta: ["120 分钟", "轻松漫步", "30 - 120 元"],
        duration: 120,
        stops: [
            { name: "街角咖啡馆", detail: "从一杯手冲开始，下午慢慢展开。",
              story: "南京的独立咖啡馆藏在每一条梧桐树下的小巷里。老板可能是个会说故事的 retired 设计师，豆子是自家烘的。告诉他你的口味，他会推荐一杯适合你今天心情的咖啡。" },
            { name: "独立书店", detail: "找一个靠窗的位置，翻几页闲书。",
              story: "先锋书店是南京的文化地标，地下车库改建的阅读空间有一种特别的静谧。选一本关于南京的书，坐在窗边，让文字带你穿越这座城市的昨天与今天。" },
            { name: "梧桐小径", detail: "阳光穿过树叶，在地上画满光斑。",
              story: "南京的梧桐大道是这个城市最浪漫的细节。夏天走在里面，头顶是浓密的绿荫，阳光从叶缝间漏下来，在地上洒满光斑。这一刻，不需要想任何事。" },
            { name: "晚餐小馆", detail: "一顿刚好的晚饭，不必赶时间。",
              story: "南京的美食藏在巷子里。可能是开了二十年的鸭血粉丝汤店，也可能是只做四道菜的私房菜馆。不需要网红打卡，好吃就是唯一的道理。" }
        ]
    },
    expo: {
        title: "博物馆展览线：南博 - 明故宫 - 半日文化",
        desc: "安静地走进一座博物馆，和旧物说说话。",
        meta: ["240 分钟", "轻松漫步", "0 - 180 元", "需预约"],
        duration: 240,
        stops: [
            { name: "南京博物院", detail: "安静地走进去，和千年旧物对话。",
              story: "南京博物院是中国三大博物馆之一，藏品从史前到近代贯穿万年。银缕玉衣、《坤舆万国全图》、竹林七贤砖画……每一件都在讲述一段被遗忘的故事。建议预留至少2小时。" },
            { name: "明故宫遗址", detail: "残垣之间，能听见六百年前的风。",
              story: "明故宫是明朝初年的皇宫，比北京故宫还早建成。虽然地面建筑大多不存，但午门、五龙桥等遗址依然能让人感受到当年「金陵帝王州」的气势。站在这里，想象六百年前的朝会盛景。" },
            { name: "展览特厅", detail: "这一季的展览，恰好是你喜欢的主题。",
              story: "南博的特展厅每年轮换多个主题展览，从古代书画到当代艺术。出发前可以提前查看当前展览信息，说不定恰好遇上你感兴趣的专题。" }
        ]
    }
};

// ── Custom Routes Management ──
let customRoutes = {};
let CUSTOM_ROUTE_COUNTER = 0;

function loadCustomRoutes() {
    try {
        const saved = JSON.parse(localStorage.getItem("nj_custom_routes") || "[]");
        customRoutes = {};
        saved.forEach(cr => {
            const key = "custom_" + cr.id;
            routes[key] = {
                title: cr.title,
                desc: cr.desc || "我的自定义路线",
                meta: [(cr.duration || 120) + " 分钟", "自由探索", cr.budget || "自由预算"],
                duration: cr.duration || 120,
                stops: cr.stops || [],
                isCustom: true,
                budget: cr.budget || "自由预算",
                hasMapData: !!(cr.coords && cr.coords.length)
            };
            customRoutes[key] = cr;
            if (cr.coords && cr.coords.length) {
                ROUTE_MAP_DATA[key] = {
                    coords: cr.coords,
                    stops: (cr.stops || []).map(s => s.name || s)
                };
            }
        });
        CUSTOM_ROUTE_COUNTER = saved.length;
    } catch(e) { customRoutes = {}; }

    // 异步同步路线数据库中的用户路线
    syncRoutesFromRouteDb();
}

// ── 从路线数据库拉取用户路线并合并 ──
async function syncRoutesFromRouteDb() {
    try {
        const res = await fetch('/api/route-db/routes?is_official=0&user_id=local-user&size=50');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.items || !data.items.length) return;

        for (const rt of data.items) {
            // 转换为 app 内部格式
            const points = rt.points || [];
            const stops = points.map(p => ({
                name: p.name,
                detail: p.description || p.address || '',
                story: p.description || ''
            }));
            const key = "rdb_" + rt.id;
            const duration = rt.duration_min || 120;
            const budget = rt.budget_max > 0 ? (rt.budget_min + ' - ' + rt.budget_max + ' 元') : '自由预算';

            routes[key] = {
                title: rt.title,
                desc: rt.description || '来自路线数据库',
                meta: [duration + ' 分钟', rt.category || '自定义', budget],
                duration: duration,
                stops: stops,
                isCustom: true,
                fromRouteDb: true,
                routeDbId: rt.id,
                budget: budget,
                hasMapData: points.length > 0
            };
            // 地图数据
            if (points.length > 0) {
                ROUTE_MAP_DATA[key] = {
                    coords: points.map(p => [p.latitude, p.longitude]),
                    stops: points.map(p => p.name)
                };
            }
        }
    } catch(e) {
        console.warn('路线数据库同步失败:', e.message);
    }
}

function saveCustomRoutesToStorage() {
    const arr = Object.values(customRoutes);
    localStorage.setItem("nj_custom_routes", JSON.stringify(arr));
}

// ── Save custom route from route-editor postMessage ──
function saveCustomRouteFromEditor(d) {
    const id = Date.now();
    const key = "custom_" + id;
    const title = d.routeName || "自定义路线";
    const duration = Math.ceil((d.totalDuration || 3600) / 60); // seconds → minutes
    const distKm = d.totalDistance ? (d.totalDistance / 1000).toFixed(1) : "?";

    // Build stops array from origin + waypoints + destination
    const stopNames = [];
    if (d.stops && d.stops.length) {
        d.stops.forEach(s => stopNames.push(s.name));
    } else {
        // Fallback: parse from origin/destination/waypoints strings
        if (d.origin) stopNames.push(d.origin.split("|")[0]);
        if (d.waypoints) {
            d.waypoints.split(";").filter(Boolean).forEach(w => stopNames.push(w.split("|")[0]));
        }
        if (d.destination) stopNames.push(d.destination.split("|")[0]);
    }

    // Build ROUTE_MAP_DATA entry with path coordinates
    let mapCoords = [];
    if (d.pathCoords && d.pathCoords.length) {
        // pathCoords is [[lng, lat], ...] → convert to [[lat, lng], ...] for ROUTE_MAP_DATA
        mapCoords = d.pathCoords.map(c => [c[1], c[0]]);
    } else if (d.stops && d.stops.length) {
        // Fallback: use stop lnglat strings
        mapCoords = d.stops.filter(s => s.lnglat).map(s => {
            const parts = s.lnglat.split(",");
            return [parseFloat(parts[1]), parseFloat(parts[0])];
        });
    }

    // Store in ROUTE_MAP_DATA for map display
    if (mapCoords.length) {
        ROUTE_MAP_DATA[key] = {
            coords: mapCoords,
            stops: stopNames
        };
    }

    // Store route data
    routes[key] = {
        title: title,
        desc: (d.transportMode === "walking" ? "🚶 步行" : "🚗 驾车") + " · " + distKm + "km · " + stopNames.length + "站",
        meta: [duration + " 分钟", distKm + "公里", stopNames.length + "个站点"],
        duration: duration,
        stops: stopNames.map((name, i) => ({ name, detail: "" })),
        isCustom: true,
        budget: "自由预算",
        hasMapData: mapCoords.length > 0
    };

    // Save to localStorage
    customRoutes[key] = {
        id: id,
        title: title,
        desc: routes[key].desc,
        duration: duration,
        stops: stopNames.map((name, i) => ({ name, detail: "" })),
        isCustom: true,
        budget: "自由预算",
        coords: mapCoords,
        hasMapData: mapCoords.length > 0
    };

    // Add map accent color for custom routes
    ROUTE_ACCENT[key] = "#E07A5F";
    ROUTE_PERSONA_COLORS[key] = { color: "#E07A5F" };

    saveCustomRoutesToStorage();
    CUSTOM_ROUTE_COUNTER++;

    // 异步同步到路线数据库
    syncToRouteDb(d, mapCoords, stopNames, duration);
}

// ── 将路线编辑器的数据同步到路线数据库 ──
async function syncToRouteDb(d, mapCoords, stopNames, duration) {
    try {
        const points = [];
        const allPts = d.stops && d.stops.length ? d.stops : [];
        allPts.forEach((stop, i) => {
            let lat, lng;
            if (stop.lnglat) {
                const parts = stop.lnglat.split(',');
                lng = parseFloat(parts[0]);
                lat = parseFloat(parts[1]);
            } else if (mapCoords[i]) {
                lat = mapCoords[i][0];
                lng = mapCoords[i][1];
            }
            if (!isNaN(lat) && !isNaN(lng)) {
                points.push({
                    name: stop.name || ('点位'+(i+1)),
                    address: '',
                    latitude: lat,
                    longitude: lng,
                    sort_order: i,
                    point_type: i === 0 ? 'start' : (i === allPts.length - 1 ? 'end' : 'waypoint'),
                    description: stop.detail || '',
                    stay_minutes: 30
                });
            }
        });

        if (points.length < 2) return;

        const body = {
            title: d.routeName || '自定义路线',
            description: (d.transportMode === 'walking' ? '步行' : '驾车') + ' · ' +
                (d.totalDistance ? (d.totalDistance/1000).toFixed(1)+'km' : '') + ' · ' + stopNames.length + '站',
            category: '自定义',
            duration_min: duration,
            budget_min: 0,
            budget_max: 0,
            crowd_tags: [],
            interest_tags: [],
            user_id: 'local-user',
            is_public: false,
            points: points
        };

        await fetch('/api/route-db/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch(e) {
        console.warn('路线数据库后台同步失败:', e.message);
    }
}

function getAllDisplayRouteKeys() {
    const builtin = ["night", "nju", "food", "expo"];
    const custom = Object.keys(customRoutes);
    return [...builtin, ...custom];
}

// Load custom routes on startup
loadCustomRoutes();

function openRoute(key) {
    const r = routes[key];
    if (!r) return;
    currentRouteKey = key;
    const routeId = ROUTE_KEY_TO_ID[key] || 1;
    sheetBody.innerHTML =
        `<p class="tag">路线画卷</p>` +
        `<h3>${r.title}</h3>` +
        `<p class="desc">${r.desc}</p>` +
        `<div class="sheet-meta">${r.meta.map(m => `<span>${m}</span>`).join("")}</div>` +
        `<div class="stops">${r.stops.map((s, i) =>
            `<div class="stop" onclick="showStopStory('${key}', ${i})" style="cursor:pointer;">
                <span class="stop-num">${String(i+1).padStart(2,"0")}</span>
                <div class="stop-text"><h4>${s.name}</h4><p>${s.detail}</p></div>
                <span class="stop-story-icon">故事</span>
            </div>`
        ).join("")}</div>` +
        // Action buttons
        `<div class="route-actions">
            <button class="route-action-btn" onclick="handleCopyRoute(${routeId})">
                <span class="label">复刻路线</span>
            </button>
            <button class="route-action-btn" onclick="showRouteOnMap('${key}')">
                <span class="label">在地图查看</span>
            </button>
            <button class="route-action-btn primary-action" onclick="showInviteForm(${routeId})">
                <span class="label">邀请朋友一起走</span>
            </button>
            <button class="route-action-btn" onclick="handleGenerateCard(${routeId})">
                <span class="icon">🎴</span>
                <span class="label">路线邀请卡</span>
            </button>
            <button class="route-action-btn" onclick="handleSaveRoute('${key}')">
                <span class="icon">💾</span>
                <span class="label">存入我的路线</span>
            </button>
            ${r.isCustom ? `<button class="route-action-btn danger-action" onclick="handleDeleteCustomRoute('${key}')">
                <span class="icon">🗑️</span>
                <span class="label">删除路线</span>
            </button>` : ""}
        </div>` +
        `<button class="sheet-close">收起画卷</button>`;
    sheet.classList.add("open");
    // Add no-scroll class for compact routes (< 5 stops)
    if (r.stops.length <= 4) {
        sheetBody.classList.add("no-scroll");
    } else {
        sheetBody.classList.remove("no-scroll");
    }
    // Inject supply entry into route sheet
    setTimeout(() => addSupplyEntryToRouteSheet(sheetBody, key), 50);
    // Pet companion: switch to route-matching pet
    const pet = getPetForRoute(key);
    if (pet && pet.id !== currentPet.id) updatePetDisplay(pet.id);
    setPetState("guiding");
}

function closeSheet() {
    const hadRoute = !!currentRouteKey;
    sheet.classList.remove("open");
    sheetBody.classList.remove("no-scroll");
    currentRouteKey = null;
    if (hadRoute) setPetState("happy");
}

// ── Story Node System ──
function showStopStory(routeKey, stopIndex) {
    const r = routes[routeKey];
    if (!r || !r.stops[stopIndex]) return;
    const stop = r.stops[stopIndex];
    if (!stop.story) { showToast("这个站点还没有故事"); return; }

    document.getElementById("story-badge").textContent =
        String(stopIndex+1).padStart(2,"0") + " · " +
        (routeKey === "nju" ? "校史" : routeKey === "night" ? "夜游" : routeKey === "food" ? "漫游" : "文化") + "节点";
    document.getElementById("story-stop-name").textContent = stop.name;
    document.getElementById("story-text").textContent = stop.story;
    document.getElementById("story-overlay").classList.add("open");

    document.getElementById("story-close").onclick = () => {
        document.getElementById("story-overlay").classList.remove("open");
    };
    document.getElementById("story-overlay").onclick = (e) => {
        if (e.target === e.currentTarget) document.getElementById("story-overlay").classList.remove("open");
    };
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

// ── Persona Swiper Page ──
function showPersonaPage() {
    if (personaSwiperShown) return;
    personaSwiperShown = true;

    showCompletion = false;
    completionAlpha = 0;
    completionParticles = [];
    poems.forEach(el => { el.style.opacity = "0"; el.classList.remove("on"); });
    dots.forEach(d => d.classList.remove("lit"));

    buildSwiperCards();
    buildProgressDots();

    personaSwiper.style.display = "block";
    personaSwiper.classList.add("entering");

    // Animate in first card's elements
    setTimeout(() => animateCardIn(0), 300);

    // IntersectionObserver to track active card
    setupCardObserver();

    // Scroll listener for progress update
    swiperContainer.addEventListener("scroll", onSwiperScroll, { passive: true });

    // ── Tutorial overlay: show on entry, dismiss on first scroll ──
    const tut = document.getElementById("swiper-tutorial");
    if (tut) {
        tut.classList.add("show");
        const dismissTut = () => {
            tut.classList.remove("show");
            swiperContainer.removeEventListener("scroll", dismissTut);
            setTimeout(() => { tut.style.display = "none"; }, 600);
        };
        swiperContainer.addEventListener("scroll", dismissTut, { passive: true, once: true });
        // Auto-dismiss after 4s even if user doesn't scroll
        setTimeout(dismissTut, 4000);
    }

    // Select button handler
    swiperSelectBtn.addEventListener("click", onSelectClick);

    // Skip button
    swiperSkip.addEventListener("click", () => {
        personaSwiper.classList.add("leaving");
        setTimeout(() => {
            personaSwiper.style.display = "none";
            personaSwiper.classList.remove("entering", "leaving");
            showMainPage();
        }, 350);
    });
}

function buildProgressDots() {
    swiperProgress.innerHTML = personaCards.map((_, i) =>
        `<span class="dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
    ).join("");
}

function onSwiperScroll() {
    const scrollTop = swiperContainer.scrollTop;
    const cardHeight = swiperContainer.clientHeight;
    const idx = Math.round(scrollTop / cardHeight);
    if (idx !== activeCardIndex && idx >= 0 && idx < personaCards.length) {
        activeCardIndex = idx;
        updateProgressDots(idx);
        updateGlassCard(idx);
        updateSelectButton(idx);
    }
    // Hide swipe hint on last card
    if (swiperSwipeHint) {
        const maxScroll = swiperContainer.scrollHeight - cardHeight;
        swiperSwipeHint.classList.toggle("hidden", scrollTop >= maxScroll - 30);
    }
}

function setupCardObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
                const idx = parseInt(entry.target.dataset.index);
                if (idx !== activeCardIndex) {
                    activeCardIndex = idx;
                    updateProgressDots(idx);
                    updateGlassCard(idx);
                    updateSelectButton(idx);
                    animateCardIn(idx);
                }
            }
        });
    }, { threshold: [0.6, 0.8] });

    document.querySelectorAll(".swiper-card").forEach(card => observer.observe(card));
}

function updateProgressDots(idx) {
    document.querySelectorAll(".swiper-progress .dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === idx);
    });
}

function updateGlassCard(idx) {
    const card = personaCards[idx];
    if (glassText) {
        glassText.textContent = selectedPersonaId === card.id
            ? "已选择！点击下方按钮开启今日漫游"
            : card.unlockText;
    }
}

function updateSelectButton(idx) {
    const card = personaCards[idx];
    const isSelected = selectedPersonaId === card.id;
    swiperSelectBtn.classList.toggle("selected", isSelected);
}

function animateCardIn(idx) {
    const card = document.querySelector(`.swiper-card[data-index="${idx}"]`);
    if (!card) return;

    const title = card.querySelector(".swiper-card-title");
    const subtitle = card.querySelector(".swiper-card-subtitle");
    const tags = card.querySelectorAll(".swiper-card-tag");
    const floats = card.querySelectorAll(".swiper-float-el");

    // Only animate if elements exist and haven't been animated yet
    if (title && !title.dataset.animated) {
        title.dataset.animated = "1";
        gsap.from(title, { y: 40, autoAlpha: 0, duration: 0.55, ease: "power3.out" });
    }
    if (subtitle && !subtitle.dataset.animated) {
        subtitle.dataset.animated = "1";
        gsap.from(subtitle, { y: 24, autoAlpha: 0, duration: 0.45, delay: 0.12, ease: "power2.out" });
    }
    if (tags.length && !tags[0].dataset.animated) {
        tags.forEach(t => { t.dataset.animated = "1"; });
        gsap.from(tags, { y: 14, scale: 0.88, autoAlpha: 0, duration: 0.4, stagger: 0.06, delay: 0.2, ease: "back.out(1.5)" });
    }
    if (floats.length && !floats[0].dataset.animated) {
        floats.forEach(f => { f.dataset.animated = "1"; });
        gsap.from(floats, { scale: 0, autoAlpha: 0, duration: 0.5, stagger: 0.08, delay: 0.25, ease: "back.out(1.8)" });
    }

    // Glass card & button animation only on first card
    if (idx === 0) {
        gsap.from(swiperGlassCard, { y: 12, autoAlpha: 0, duration: 0.35, delay: 0.15, ease: "power2.out" });
        gsap.from(swiperSelectBtn, { y: 10, autoAlpha: 0, duration: 0.35, delay: 0.2, ease: "power2.out" });
    }
}

function onSelectClick() {
    if (isAnimating) return;
    const card = personaCards[activeCardIndex];

    if (selectedPersonaId === card.id) {
        proceedToMain();
        return;
    }

    isAnimating = true;
    selectedPersonaId = card.id;

    // Selection animation — brief press, then auto-proceed
    gsap.to(swiperSelectBtn, {
        scale: 0.92, duration: 0.08, ease: "power2.in",
        onComplete: () => {
            gsap.to(swiperSelectBtn, {
                scale: 1, duration: 0.2, ease: "back.out(2)",
            });
        }
    });

    swiperSelectBtn.classList.add("selected");
    glassText.textContent = "开启你的城市漫游";

    // Update route recommendation for main page
    selectedPersonas = [{
        id: card.id,
        title: card.title,
        routeKey: card.routeKey,
        routeName: getRouteName(card.routeKey),
        routeDesc: card.unlockText,
        routes: [card.routeKey]
    }];

    // Auto-proceed after brief animation
    setTimeout(() => {
        isAnimating = false;
        proceedToMain();
    }, 500);
}

function getRouteName(routeKey) {
    const names = { food: "南京味道线", nju: "南大校园探索线", night: "秦淮夜游线", expo: "博物馆展览线" };
    return names[routeKey] || "城市探索线";
}

function proceedToMain() {
    personaSwiper.classList.add("leaving");
    setTimeout(() => {
        personaSwiper.style.display = "none";
        personaSwiper.classList.remove("entering", "leaving");
        showMainPage();
    }, 350);
}

function buildSwiperCards() {
    swiperContainer.innerHTML = personaCards.map((card, i) => {
        const floatEls = card.elements.map(el => `
            <div class="swiper-float-el"
                 style="left:${el.x}%;top:${el.y}%;font-size:${el.size}px;"
                 data-float-y="${el.floatY}"
                 data-float-dur="${el.dur}">
                ${el.emoji}
            </div>
        `).join("");

        const bgImgTag = card.bgImage
            ? `<img class="swiper-card-img" src="${card.bgImage}" alt="${card.title}" />`
            : "";

        return `
        <div class="swiper-card" data-index="${i}" data-persona-id="${card.id}">
            <div class="swiper-card-bg">
                ${bgImgTag}
                <div class="gradient-layer" style="background:
                    radial-gradient(circle at 20% 20%, ${hexToRgba(card.secondColor, 0.65)} 0, transparent 35%),
                    radial-gradient(circle at 80% 15%, ${hexToRgba(card.accentColor, 0.55)} 0, transparent 32%),
                    linear-gradient(160deg, ${hexToRgba(card.mainColor, 0.45)}, ${hexToRgba(card.mainColor, 0.25)});">
                </div>
                <div class="color-blob" style="
                    background:${card.secondColor};
                    width:220px;height:220px; opacity:0.4;
                    top:8%;left:-8%;
                    animation: blobDrift1 8s ease-in-out infinite;
                "></div>
                <div class="color-blob" style="
                    background:${card.accentColor};
                    width:180px;height:180px; opacity:0.35;
                    top:55%;right:-10%;
                    animation: blobDrift2 7s ease-in-out infinite;
                "></div>
                <div class="color-blob" style="
                    background:${card.mainColor};
                    width:140px;height:140px; opacity:0.3;
                    top:30%;left:50%;
                    animation: blobDrift3 9s ease-in-out infinite;
                "></div>
            </div>
            <div class="swiper-card-elements">${floatEls}</div>
            <div class="swiper-card-veil"></div>
            <div class="swiper-card-content">
                <h1 class="swiper-card-title">${card.title}</h1>
            </div>
        </div>`;
    }).join("");

    document.querySelectorAll(".swiper-card").forEach(cardEl => {
        cardEl.addEventListener("click", () => {
            const idx = parseInt(cardEl.dataset.index, 10);
            if (Number.isInteger(idx)) {
                activeCardIndex = idx;
                updateProgressDots(idx);
                updateGlassCard(idx);
                updateSelectButton(idx);
            }
            onSelectClick();
        });
    });

    // Start floating animations on all cards
    setTimeout(startAllFloatAnimations, 100);
}

function adjustColor(hex, percent) {
    const clean = hex.replace(/^#/, "");
    const num = parseInt(clean, 16);
    if (isNaN(num)) return hex;
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `rgb(${R},${G},${B})`;
}

function hexToRgba(hex, alpha) {
    const clean = hex.replace(/^#/, "");
    const num = parseInt(clean, 16);
    if (isNaN(num)) return `rgba(0,0,0,${alpha})`;
    const R = (num >> 16) & 0xFF;
    const G = (num >> 8) & 0xFF;
    const B = num & 0xFF;
    return `rgba(${R},${G},${B},${alpha})`;
}

function startAllFloatAnimations() {
    document.querySelectorAll(".swiper-float-el").forEach(el => {
        const floatY = parseFloat(el.dataset.floatY) || 10;
        const dur = parseFloat(el.dataset.floatDur) || 3.5;
        gsap.to(el, {
            y: floatY,
            duration: dur,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
        });
        gsap.to(el, {
            rotation: (Math.random() - 0.5) * 15,
            duration: dur * 1.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 1.5
        });
    });
}

// ── Main Page ──
let mainPageShown = false;
let currentTab = "home";

function showMainPage() {
    if (mainPageShown) return;
    mainPageShown = true;
    enteredApp = true;

    mainPage.classList.add("visible");
    mainPage.classList.remove("drawer-open");
    // Lazy-init map only when needed
    window._amapDeferredInit = true;
    window.addEventListener("resize", onMainResize);

    // ── Render new Swiss layout components ──
    renderCarouselCards();
    renderFeatureSection("night"); // default featured route
    renderRouteGrid();

    // ── Carousel scroll → update dots + feature section ──
    const carousel = document.getElementById("route-carousel");
    if (carousel) {
        carousel.addEventListener("scroll", () => {
            updateCarouselDots();
            updateFeatureFromCarousel();
        }, { passive: true });
    }

    // ── Guide block button ──
    const guideBlockBtn = document.getElementById("guide-block-btn");
    if (guideBlockBtn) {
        guideBlockBtn.addEventListener("click", generateRecipeRoute);
    }
    const guideBlockCard = document.querySelector(".guide-block-card");
    if (guideBlockCard) {
        guideBlockCard.addEventListener("click", generateRecipeRoute);
    }

    // ── Bottom nav — full tab switching system (wheel + legacy)
    document.querySelectorAll(".wheel-item, .nav-item").forEach(item => {
        item.addEventListener("click", () => {
            switchTab(item.dataset.tab);
        });
    });

    // Invite form handlers
    document.getElementById("invite-submit").addEventListener("click", submitInviteCard);
    document.getElementById("invite-cancel").addEventListener("click", closeInviteForm);
    document.getElementById("invite-overlay").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeInviteForm();
    });
    document.getElementById("invite-result-overlay").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeInviteResult();
    });

    // ── Setup scroll-triggered animations ──
    setupScrollAnimations();

    // Sync initial tab state
    switchTab("home");
    setTimeout(initAMap, 300);
    initPet77Overlay();

    // ── Pet idle timer ──
    ["click", "scroll", "touchstart"].forEach(evt => {
        document.addEventListener(evt, resetPetIdleTimer, { passive: true });
    });
    resetPetIdleTimer();
}

// ═══ Swiss Layout Renderers ═══

const CAROUSEL_ROUTES = ["night", "nju", "food", "expo"];
const ROUTE_ACCENT = {
    nju: "#2E8B57",
    night: "#1A6B5E",
    food: "#F4A261",
    expo: "#5B9BD5",
};
const ROUTE_ICON = {
    nju: "🏛️",
    night: "🌙",
    food: "🍜",
    expo: "🏺",
};
const ROUTE_IMAGE = {
    night: "assets/persona/8.png",
    nju: "assets/persona/5.png",
    food: "assets/persona/2.png",
    expo: "assets/persona/3.png",
};

function getRouteDisplayTitle(route) {
    const raw = String(route?.title || "");
    return raw.split(/[，,:：]/)[0] || raw;
}

function renderRouteLaunchCard(key, route, options = {}) {
    const accent = ROUTE_ACCENT[key] || "#0066CC";
    const icon = ROUTE_ICON[key] || "📍";
    const img = ROUTE_IMAGE[key] || ROUTE_IMAGE.food;
    const isCustom = key.startsWith("custom_");
    const title = getRouteDisplayTitle(route);
    const meta = (route.meta || [])
        .slice(0, options.compact ? 2 : 3)
        .map(m => `<span>${m}</span>`)
        .join("");
    const badge = isCustom ? `<span class="route-launch-badge">自定义</span>` : "";
    const action = isCustom ? "查看我的路线" : "查看路线";

    return `<div class="route-launch-card${options.carousel ? " carousel-card route-launch-carousel" : ""}${isCustom ? " route-launch-custom" : ""}"
        data-route="${key}"
        style="--route-accent:${accent};--route-img:url(${img});">
        <div class="route-launch-thumb">
            <span class="route-launch-icon">${icon}</span>
        </div>
        <div class="route-launch-copy">
            <div class="route-launch-title-row">
                <span class="route-launch-title">${title}</span>
                ${badge}
            </div>
            <span class="route-launch-desc">${route.desc}</span>
            <div class="route-launch-meta">${meta}</div>
        </div>
        <button class="route-launch-btn" type="button">${action}</button>
    </div>`;
}

function renderCarouselCards() {
    const track = document.getElementById("carousel-track");
    const dots = document.getElementById("carousel-dots");
    if (!track) return;

    track.innerHTML = CAROUSEL_ROUTES.map((key, i) => {
        const r = routes[key];
        const accent = ROUTE_ACCENT[key];
        const icon = ROUTE_ICON[key];
        const img = ROUTE_IMAGE[key];
        const stops = (r.stops || []).slice(0, 4).map(s =>
            `<div class="card-stop-row"><span class="card-stop-dot"></span><span class="card-stop-name">${s.name}</span></div>`
        ).join("");
        const chips = (r.meta || []).slice(0, 3).map(m =>
            `<span class="meta-chip">${m}</span>`
        ).join("");
        return `<div class="carousel-card" data-route="${key}" style="flex:0 0 38vw;aspect-ratio:3/5;border-radius:12px;--card-accent:${accent};--card-img:url(${img})">
            <div class="card-banner">
                <span class="card-banner-icon">${icon}</span>
                <span class="card-index">${String(i + 1).padStart(2, "0")}</span>
            </div>
            <div class="card-body">
                <span class="card-name">${r.title.split("：")[0].split(":")[0]}</span>
                <span class="card-desc">${r.desc}</span>
                <div class="card-stops">${stops}</div>
                <div class="card-meta">${chips}</div>
            </div>
        </div>`;
    }).join("");

    if (dots) {
        dots.innerHTML = CAROUSEL_ROUTES.map((_, i) => `<span class="carousel-dot${i === 0 ? " active" : ""}"></span>`).join("");
    }

    // Card click handlers
    track.querySelectorAll(".carousel-card").forEach(card => {
        card.addEventListener("click", () => {
            const routeKey = card.dataset.route;
            if (routeKey === "nju") {
                openGame();
            } else {
                openRoute(routeKey);
            }
        });
    });
}

function updateCarouselDots() {
    const carousel = document.getElementById("route-carousel");
    const dots = document.querySelectorAll(".carousel-dot");
    if (!carousel || !dots.length) return;

    const cardW = carousel.clientWidth * 0.38 + 12; // card width + gap
    const idx = Math.round(carousel.scrollLeft / cardW);
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
}

function updateFeatureFromCarousel() {
    const carousel = document.getElementById("route-carousel");
    if (!carousel) return;
    const cardW = carousel.clientWidth * 0.38 + 12;
    const idx = Math.round(carousel.scrollLeft / cardW);
    const routeKey = CAROUSEL_ROUTES[idx];
    if (routeKey) renderFeatureSection(routeKey);
}

function renderFeatureSection(routeKey) {
    const section = document.getElementById("feature-section");
    if (!section) return;
    const r = routes[routeKey];
    if (!r) return;
    const accent = ROUTE_ACCENT[routeKey];
    const icon = ROUTE_ICON[routeKey];
    const stopNames = (r.stops || []).map(s => s.name).join(" → ");

    section.innerHTML = `
        <div class="feature-header">
            <p class="feature-eyebrow">今日推荐</p>
            <h2 class="feature-title">${r.title.split("：")[0].split(":")[0]}</h2>
            <p class="feature-desc">${r.desc}</p>
        </div>
        <div class="feature-detail-grid">
            <div class="feature-detail-item">
                <span class="feature-detail-value">${icon}</span>
                <span class="feature-detail-label">路线主题</span>
            </div>
            <div class="feature-detail-item">
                <span class="feature-detail-value">${r.duration || "—"}min</span>
                <span class="feature-detail-label">预计时长</span>
            </div>
            <div class="feature-detail-item">
                <span class="feature-detail-value">${(r.stops || []).length}</span>
                <span class="feature-detail-label">途经站点</span>
            </div>
            <div class="feature-detail-item">
                <span class="feature-detail-value" style="color:${accent}">●</span>
                <span class="feature-detail-label">路线色标</span>
            </div>
        </div>
        <p style="font-size:12px;color:#999;margin-top:4px;padding:0 4px;">${stopNames}</p>
        <div class="feature-actions">
            <button class="feature-btn-primary" data-route="${routeKey}">开始探索</button>
            <button class="feature-btn-secondary" data-route="${routeKey}">邀朋友一起走</button>
        </div>
    `;

    // Bind buttons
    section.querySelector(".feature-btn-primary").addEventListener("click", (e) => {
        const key = e.target.dataset.route;
        if (key === "nju") openGame();
        else showRouteOnMap(key);
    });
    section.querySelector(".feature-btn-secondary").addEventListener("click", (e) => {
        const key = e.target.dataset.route;
        const routeId = ROUTE_KEY_TO_ID[key] || 1;
        showInviteForm(routeId);
    });
}

function renderRouteGrid() {
    const grid = document.getElementById("route-grid");
    if (!grid) return;

    const builtinKeys = ["night", "nju", "food", "expo"];
    const customKeys = Object.keys(customRoutes);
    const allKeys = [...builtinKeys, ...customKeys];

    grid.innerHTML = allKeys.map(key => {
        const r = routes[key];
        const accent = ROUTE_ACCENT[key] || "#E07A5F";
        const img = ROUTE_IMAGE[key] || ROUTE_IMAGE.food;
        const isCustom = key.startsWith("custom_");
        const badge = isCustom ? '<span class="mini-custom-badge">自定义</span>' : "";
        return `<div class="mini-route-card" data-route="${key}" style="--card-accent:${accent}">
            <div class="mini-thumb" style="background-image:url(${img});background-color:${accent}">
                ${badge}
            </div>
            <div class="mini-body">
                <span class="mini-name">${r.title.split("：")[0].split(":")[0]}</span>
                <span class="mini-meta">${(r.stops || []).length}站 · ${r.duration || "?"}min</span>
            </div>
        </div>`;
    }).join("") +
    // Custom route upload button
    `<div class="mini-route-card mini-route-upload" id="custom-route-upload-btn" style="--card-accent:#E07A5F;border:2px dashed rgba(224,122,95,0.35);background:rgba(224,122,95,0.03);">
        <div class="mini-thumb" style="background:rgba(224,122,95,0.06);display:flex;align-items:center;justify-content:center;">
            <span class="upload-plus-icon">➕</span>
        </div>
        <div class="mini-body" style="align-items:center;text-align:center;">
            <span class="mini-name" style="color:#E07A5F;">自主上传路线</span>
            <span class="mini-meta">设计你的专属路线</span>
        </div>
    </div>`;

    // Bind click handlers
    grid.querySelectorAll(".mini-route-card").forEach(card => {
        card.addEventListener("click", () => {
            const routeKey = card.dataset.route;
            if (!routeKey) {
                // Custom route upload button clicked → open map editor
                showMapRouteEditor();
                return;
            }
            if (routeKey === "nju") openGame();
            else if (routeKey.startsWith("custom_")) openRoute(routeKey);
            else openRoute(routeKey);
        });
    });
}

function setupScrollAnimations() {
    const snapScroll = document.getElementById("snap-scroll");
    if (!snapScroll) return;

    // Mark sections with animate-in class for scroll-triggered entrance
    const sections = snapScroll.querySelectorAll(".snap-section");
    sections.forEach((sec) => {
        const heading = sec.querySelector(".section-heading, .feature-header, .hero-content");
        if (heading && !heading.classList.contains("hero-content")) {
            heading.classList.add("animate-in");
        }
        const cards = sec.querySelectorAll(".route-grid, .guide-block, .feature-detail-grid, .feature-actions, .route-carousel, .carousel-dots, .scroll-hint");
        cards.forEach(el => el.classList.add("animate-in"));
    });

    // IntersectionObserver for scroll-triggered fade-in
    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        }, { threshold: 0.2, root: snapScroll });

        snapScroll.querySelectorAll(".animate-in").forEach(el => observer.observe(el));
    } else {
        // Fallback: show all immediately
        snapScroll.querySelectorAll(".animate-in").forEach(el => el.classList.add("visible"));
    }
}

function onMainResize() {
    // AMap auto-handles resize — just flag it
    if (amapInstance) {
        amapInstance.resize();
    }
}

// ── Toggle scroll bottom drawer (compat shim for old refs) ──
function toggleScrollDrawer() {
    const scrollEl = document.getElementById("snap-scroll") || document.getElementById("main-scroll");
    const mp = document.getElementById("main-page");
    if (!scrollEl || !mp) return;

    if (scrollEl.classList.contains("expanded")) {
        scrollEl.classList.remove("expanded");
    } else {
        scrollEl.classList.add("expanded");
    }
    if (amapInstance) setTimeout(() => amapInstance.resize(), 100);
}

// ── Route marker map data for AMap ──
const ROUTE_MAP_DATA = {
    nju: {
        coords: [[32.056, 118.779], [32.057, 118.779]],
        stops: ["三江师范旧址", "北大楼"]
    },
    night: {
        coords: [[32.020, 118.788], [32.021, 118.789], [32.012, 118.791]],
        stops: ["秦淮河", "夫子庙", "老门东"]
    },
    food: {
        coords: [[32.045, 118.790], [32.046, 118.791]],
        stops: ["小吃街", "咖啡店"]
    },
    expo: {
        coords: [[32.040, 118.830], [32.039, 118.817]],
        stops: ["南京博物院", "明故宫遗址"]
    }
};

// ── AMap Initialization ──
function initAMap() {
    if (amapInitializing) return;
    if (amapInstance) {
        amapInstance.resize();
        return;
    }

    const container = document.getElementById("main-map-container");
    if (!container) return;

    amapInitializing = true;
    let loaderRetryCount = 0;

    function tryInit() {
        if (typeof AMapLoader === "undefined") {
            loaderRetryCount += 1;
            if (loaderRetryCount > 30) {
                console.warn("AMap loader unavailable, using canvas fallback.");
                startCanvasMapFallback();
                amapInitializing = false;
                return;
            }
            setTimeout(tryInit, 300);
            return;
        }

        const personaStyle = getPersonaMapStyle(selectedPersonaId);

        AMapLoader.load({
            key: "acbce3442afa6bf6251bc8014a1594b8",
            version: "2.0",
            plugins: ["AMap.ToolBar", "AMap.Scale", "AMap.MapType"],
        }).then((AMap) => {
            amapInstance = new AMap.Map(container, {
                zoom: personaStyle.zoom,
                center: [118.796, 32.060],  // Nanjing center
                viewMode: "3D",
                pitch: personaStyle.pitch,
                mapStyle: personaStyle.style,
                showIndoorMap: false,
            });

            // Add controls
            amapInstance.addControl(new AMap.ToolBar({
                position: "RT",
                offset: new AMap.Pixel(10, 60),
            }));

            // ── Map interaction → fade header, restore on idle ──
            let mapInteractTimer = null;
            const mainHeader = document.querySelector(".main-header");
            const fadeMapUI = () => {
                if (currentTab !== "home") return;
                if (mainHeader) mainHeader.style.opacity = "0";
                clearTimeout(mapInteractTimer);
                mapInteractTimer = setTimeout(() => {
                    if (currentTab !== "home") return;
                    if (mainHeader) mainHeader.style.opacity = "1";
                }, 2000);
            };
            amapInstance.on("mapmove", fadeMapUI);
            amapInstance.on("zoomchange", fadeMapUI);

            // Add all route markers and lines
            addAllRouteOverlays(AMap);

            amapReady = true;
            amapInitializing = false;

            // Trigger resize after a frame
            setTimeout(() => amapInstance.resize(), 100);
        }).catch((e) => {
            console.warn("AMap init failed, using canvas fallback:", e);
            // Fallback to canvas map
            startCanvasMapFallback();
            amapInitializing = false;
        });
    }

    tryInit();
}

function addAllRouteOverlays(AMap) {
    const markerColors = {
        nju: "#6F4BB2",
        night: "#D8A94A",
        food: "#FF7A45",
        expo: "#4FC3C7"
    };

    Object.entries(ROUTE_MAP_DATA).forEach(([key, data]) => {
        const coords = data.coords;
        const stops = data.stops;
        const color = markerColors[key] || "#B64236";
        const lngLatCoords = coords.map(c => [c[1], c[0]]);  // to [lng, lat]

        // Add polyline for route
        const polyline = new AMap.Polyline({
            path: lngLatCoords,
            strokeColor: color,
            strokeOpacity: 0.6,
            strokeWeight: 3,
            strokeStyle: "dashed",
            strokeDasharray: [10, 8],
            lineJoin: "round",
        });
        amapInstance.add(polyline);
        amapRouteLines.push(polyline);

        // Add markers for each stop
        coords.forEach((c, i) => {
            const markerContent = document.createElement("div");
            markerContent.className = "route-marker";
            markerContent.innerHTML = `<span class="dot"></span><span>${stops[i]}</span>`;

            const marker = new AMap.Marker({
                position: [c[1], c[0]],
                content: markerContent,
                offset: new AMap.Pixel(-30, -10),
                zIndex: 10,
            });
            marker._routeKey = key;
            marker._stopIndex = i;

            marker.on("click", () => {
                openRoute(key);
            });

            amapInstance.add(marker);
            amapMarkers.push(marker);
        });
    });
}

function toggleMapFullscreen() {
    const container = document.getElementById("main-map-container");
    if (!container) return;

    amapFullscreen = !amapFullscreen;
    container.classList.toggle("amap-fullscreen", amapFullscreen);

    // Hide/show all content panels
    document.querySelectorAll("#snap-scroll, .main-tab-content").forEach(el => {
        if (amapFullscreen) {
            el.style.display = "none";
        } else if (el.dataset.tab === currentTab || (!el.dataset.tab && currentTab === "home")) {
            el.style.display = "";
        }
    });
    document.querySelector(".bottom-nav").style.zIndex = amapFullscreen ? "60" : "10";

    if (amapInstance) {
        setTimeout(() => amapInstance.resize(), 50);
    }
}

function startCanvasMapFallback() {
    // Fallback: show a static placeholder when AMap is unavailable
    if (mainMapCanvas) {
        mainMapCanvas.style.display = "block";
        const ctx = mainMapCanvas.getContext("2d");
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        mainMapCanvas.width = vw * (window.devicePixelRatio || 1);
        mainMapCanvas.height = vh * (window.devicePixelRatio || 1);
        mainMapCanvas.style.width = vw + "px";
        mainMapCanvas.style.height = vh + "px";
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        ctx.fillStyle = "#FCFCFB";
        ctx.fillRect(0, 0, vw, vh);
        ctx.fillStyle = "rgba(26,28,27,0.08)";
        ctx.font = "16px 'PingFang SC', 'Microsoft YaHei', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("地图加载中… 请配置高德地图 Key", vw / 2, vh / 2);
        ctx.textAlign = "start";
    }
}

// ── Canvas Map Fallback (kept for when AMap fails) ──

// ── Main App View (legacy canvas fallback) ──
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

    // Persona-based recommendation from selected personas
    let personaRecoKey = null;
    if (selectedPersonas.length > 0) {
        personaRecoKey = selectedPersonas[0].routeKey;
    }

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
const TRANSITION_DURATION = 0.7;

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

// ═══════════════════════════════════════════
//  Route Key → Backend ID mapping
// ═══════════════════════════════════════════
const ROUTE_KEY_TO_ID = {
    nju: 1,
    night: 2,
    food: 3,
    expo: 4
};
const ROUTE_KEY_BY_ID = { 1: "nju", 2: "night", 3: "food", 4: "expo" };

// ── Toast System ──
function showToast(msg) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "toast-item";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 2500);
}

// ── Route Copy ──
async function handleCopyRoute(routeId) {
    try {
        const resp = await fetch(`/api/user-routes/${routeId}/copy?userId=1`, { method: "POST" });
        if (!resp.ok) throw new Error("复刻失败");
        const data = await resp.json();
        if (data.code === 200) {
            showToast("✅ 路线已复刻到「我的路线」");
            closeSheet();
            unlockAchievement("copy");
        } else {
            showToast("❌ 复刻失败：" + (data.msg || "未知错误"));
        }
    } catch (e) {
        // Offline fallback
        showToast("✅ 路线已保存到本地（离线模式）");
        closeSheet();
        unlockAchievement("copy");
    }
}

// ── Invite Card ──
function showInviteForm(routeId) {
    closeSheet();
    document.getElementById("invite-route-id").value = routeId;
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById("invite-date").value = tomorrow.toISOString().split("T")[0];
    document.getElementById("invite-time").value = "10:00";
    document.getElementById("invite-overlay").classList.add("open");
}

function closeInviteForm() {
    document.getElementById("invite-overlay").classList.remove("open");
}

async function submitInviteCard() {
    const routeId = parseInt(document.getElementById("invite-route-id").value);
    const meetPlace = document.getElementById("invite-place").value.trim() || "未指定";
    const meetDate = document.getElementById("invite-date").value;
    const meetTime = document.getElementById("invite-time").value;
    const cost = parseInt(document.getElementById("invite-cost").value) || 0;
    const people = parseInt(document.getElementById("invite-people").value) || 1;

    const meetDateTime = meetDate && meetTime ? `${meetDate}T${meetTime}:00` : null;

    const body = {
        userId: 1,
        routeId: routeId,
        meetPlace: meetPlace,
        expectedCost: cost,
        peopleLimit: people
    };
    if (meetDateTime) body.meetTime = meetDateTime;

    try {
        const resp = await fetch("/api/invites/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await resp.json();
        if (data.code === 200) {
            closeInviteForm();
            showInviteResult(data.data);
            unlockAchievement("invite");
        } else {
            showToast("❌ 生成失败：" + (data.msg || ""));
        }
    } catch (e) {
        // Offline: generate a local invite card
        closeInviteForm();
        showInviteResult({
            inviteId: Date.now(),
            inviteCode: "local_" + Date.now().toString(36),
            routeId: routeId,
            meetPlace: meetPlace,
            meetTime: meetDateTime,
            expectedCost: cost,
            peopleLimit: people,
            shareUrl: window.location.href + "?invite=local",
            userId: 1
        });
    }
}

function showInviteResult(card) {
    const routeKey = ROUTE_KEY_BY_ID[card.routeId] || "nju";
    const route = routes[routeKey];
    if (!route) return;

    const cardDate = card.meetTime ? new Date(card.meetTime) : null;
    const dateStr = cardDate ? `${cardDate.getMonth()+1}月${cardDate.getDate()}日 ${String(cardDate.getHours()).padStart(2,"0")}:${String(cardDate.getMinutes()).padStart(2,"0")}` : "待定";
    const costStr = card.expectedCost ? `¥${card.expectedCost}` : "免费";
    const peopleStr = card.peopleLimit ? `${card.peopleLimit}人` : "不限";

    const stopTags = route.stops.map(s => `<span class="invite-card-stop">${s.name}</span>`).join("");

    // Get persona info for avatar
    const persona = personaCards.find(p => p.routeKey === routeKey);
    const avatarEmoji = persona ? persona.elements[0].emoji : "🗺️";

    const shareLink = card.shareUrl || window.location.href;

    const body = document.getElementById("invite-result-body");

    // Determine the route's detail page URL or use share link
    const qrUrl = shareLink;

    body.innerHTML = `
        <div class="invite-card" id="invite-card-display">
            <div class="invite-card-header">
                <div class="invite-card-avatar">${avatarEmoji}</div>
                <div>
                    <div class="invite-card-author">我</div>
                    <div class="invite-card-role">邀请你一起漫游南京</div>
                </div>
            </div>
            <div class="invite-card-route-name">${route.title}</div>
            <div class="invite-card-stops">${stopTags}</div>
            <div class="invite-card-info">
                <div class="invite-card-info-item"><span>时间</span><span class="val">${dateStr}</span></div>
                <div class="invite-card-info-item"><span>集合</span><span class="val">${card.meetPlace || "待定"}</span></div>
                <div class="invite-card-info-item"><span>花费</span><span class="val">${costStr}</span></div>
                <div class="invite-card-info-item"><span>人数</span><span class="val">${peopleStr}</span></div>
            </div>
            <div class="invite-card-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}" alt="QR Code" />
            </div>
            <div class="invite-card-share-actions">
                <button class="btn-copy" onclick="copyInviteLink('${shareLink}')">📋 复制链接</button>
                <button class="btn-save" onclick="saveInviteImage()">💾 保存图片</button>
                <button class="btn-share" onclick="shareInvite('${shareLink}')">📤 分享</button>
            </div>
        </div>
        <button class="close-overlay-btn" onclick="closeInviteResult()">关闭</button>
    `;

    document.getElementById("invite-result-overlay").classList.add("open");
}

function closeInviteResult() {
    document.getElementById("invite-result-overlay").classList.remove("open");
}

function copyInviteLink(link) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            showToast("✅ 链接已复制到剪贴板");
        }).catch(() => fallbackCopy(link));
    } else {
        fallbackCopy(link);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("✅ 链接已复制");
}

function shareInvite(link) {
    if (navigator.share) {
        navigator.share({
            title: "南京城市漫游邀请",
            text: "和我一起走一条南京路线吧！",
            url: link
        }).catch(() => {});
    } else {
        copyInviteLink(link);
    }
}

function saveInviteImage() {
    const card = document.getElementById("invite-card-display");
    if (!card) return;

    // Create a canvas from the card element
    const rect = card.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);

    // Draw white background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Use html2canvas if available, else simple fallback
    try {
        // Simple rendering fallback: draw text info
        const style = getComputedStyle(card);
        ctx.fillStyle = style.color || "#1F2320";
        ctx.font = "16px 'PingFang SC', sans-serif";
        const texts = card.textContent.trim().split("\n").filter(Boolean);
        texts.forEach((t, i) => {
            ctx.fillText(t.trim(), 20, 40 + i * 28);
        });
    } catch (e) {}

    // Download
    const link = document.createElement("a");
    link.download = "nj-invite-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("✅ 邀请卡已保存");
}

function handleGenerateCard(routeId) {
    showInviteForm(routeId);
}

// ═══════════════════════════════════════════
//  Route → Map Display (show route on map with floating card)
// ═══════════════════════════════════════════

/* Persona-based route line colors & emoji */
const ROUTE_PERSONA_COLORS = {
    nju:  { color: "#6F4BB2", icon: "🎓", bg: "rgba(111,75,178,0.15)" },
    night:{ color: "#D8A94A", icon: "🏮", bg: "rgba(216,168,74,0.15)" },
    food: { color: "#FF7A45", icon: "🍜", bg: "rgba(255,122,69,0.15)" },
    expo: { color: "#4FC3C7", icon: "🏛", bg: "rgba(79,195,199,0.15)" },
};

/* Store the currently highlighted route key */
let activeRouteOnMap = null;
let currentRouteKey = null;

function showRouteOnMap(routeKey) {
    const r = routes[routeKey];
    if (!r) return;

    closeSheet();

    // Lazy-init map if not yet loaded
    if (!amapInstance || !amapReady) {
        showToast("⏳ 地图加载中，请稍候…");
        initAMap();
        // Retry once after init
        let retries = 0;
        const retryInterval = setInterval(() => {
            if (amapInstance && amapReady) {
                clearInterval(retryInterval);
                showRouteOnMap(routeKey);
            }
            retries++;
            if (retries > 20) {
                clearInterval(retryInterval);
                showToast("地图加载失败，请检查网络");
            }
        }, 500);
        return;
    }

    // Show map as temporary overlay (map is no longer a main tab)
    const mapStage = document.getElementById("map-stage");
    const mapContainer = document.getElementById("main-map-container");
    const dimOverlay = document.getElementById("map-dim-overlay");
    const snapScroll = document.getElementById("snap-scroll");
    const header = document.querySelector(".main-header");

    // Hide all tab content
    hideAllTabContent();

    // Show map fullscreen
    if (mapStage) mapStage.style.display = "";
    if (mapContainer) {
        mapContainer.style.display = "block";
        mapContainer.classList.add("amap-fullscreen");
    }
    if (dimOverlay) dimOverlay.style.display = "none";
    if (snapScroll) snapScroll.style.display = "none";
    if (header) header.style.display = "none";

    amapFullscreen = true;
    document.querySelector(".bottom-nav").style.zIndex = "60";

    activeRouteOnMap = routeKey;

    // Let map settle after resize, then draw
    setTimeout(() => {
        clearRouteOverlays();
        drawRouteOnMap(routeKey);
        showFloatCard(routeKey);
    }, 350);

    // Add map close button if not exists
    ensureMapCloseBtn();
}

function ensureMapCloseBtn() {
    if (document.getElementById("map-close-btn")) return;
    const btn = document.createElement("button");
    btn.id = "map-close-btn";
    btn.textContent = "✕ 返回";
    btn.style.cssText = "position:fixed;top:max(16px,env(safe-area-inset-top));left:16px;z-index:70;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border:1px solid rgba(0,0,0,0.08);font-size:13px;font-weight:600;color:#18212B;cursor:pointer;font-family:inherit;box-shadow:0 2px 12px rgba(0,0,0,0.1);";
    btn.addEventListener("click", exitMapOverlay);
    document.body.appendChild(btn);
}

function exitMapOverlay() {
    amapFullscreen = false;
    activeRouteOnMap = null;
    const mapContainer = document.getElementById("main-map-container");
    if (mapContainer) mapContainer.classList.remove("amap-fullscreen");
    document.querySelector(".bottom-nav").style.zIndex = "10";
    const mapStage = document.getElementById("map-stage");
    if (mapStage) mapStage.style.display = "none";
    hideFloatCard();
    const btn = document.getElementById("map-close-btn");
    if (btn) btn.remove();
    if (amapInstance) {
        restoreAllMapOverlays();
        setTimeout(() => amapInstance.resize(), 50);
    }
    document.querySelector(".main-header").style.display = "";
    switchTab("home");
}

function clearRouteOverlays() {
    if (!amapInstance) return;
    if (amapMarkers.length) {
        try { amapInstance.remove(amapMarkers); } catch(e) {}
        amapMarkers = [];
    }
    if (amapRouteLines.length) {
        try { amapInstance.remove(amapRouteLines); } catch(e) {}
        amapRouteLines = [];
    }
}

function drawRouteOnMap(routeKey) {
    if (!window.AMap || !amapInstance) return;

    const data = ROUTE_MAP_DATA[routeKey];
    if (!data || !data.coords.length) return;

    const persona = ROUTE_PERSONA_COLORS[routeKey] || { color: "#B64236" };
    const lngLatCoords = data.coords.map(c => [c[1], c[0]]);

    // Thick polyline
    const polyline = new AMap.Polyline({
        path: lngLatCoords,
        strokeColor: persona.color,
        strokeOpacity: 0.9,
        strokeWeight: 6,
        strokeStyle: "solid",
        lineJoin: "round",
        lineCap: "round",
        zIndex: 50,
    });
    amapInstance.add(polyline);
    amapRouteLines.push(polyline);

    // Glow line under
    const glowLine = new AMap.Polyline({
        path: lngLatCoords,
        strokeColor: persona.color,
        strokeOpacity: 0.2,
        strokeWeight: 16,
        strokeStyle: "solid",
        lineJoin: "round",
        zIndex: 49,
    });
    amapInstance.add(glowLine);
    amapRouteLines.push(glowLine);

    const markers = [];

    // Markers for each stop
    data.coords.forEach((c, i) => {
        const label = data.stops[i] || "途经点";
        const mc = document.createElement("div");
        mc.className = "route-marker";
        mc.innerHTML = '<span class=\"dot\"></span><span>' + label + '</span>';

        const marker = new AMap.Marker({
            position: [c[1], c[0]],
            content: mc,
            offset: new AMap.Pixel(-30, -10),
            zIndex: 60,
        });
        marker._routeKey = routeKey;
        marker.on("click", () => openRoute(routeKey));
        amapInstance.add(marker);
        amapMarkers.push(marker);
        markers.push(marker);
    });

    // Zoom to fit route bounds
    const overlays = [polyline, glowLine].concat(markers);
    try {
        amapInstance.setFitView(overlays, false, 300);
    } catch(e) {
        // fallback: set zoom and center
        amapInstance.setZoom(14);
        amapInstance.setCenter([118.796, 32.060]);
    }
}

function showFloatCard(routeKey) {
    const r = routes[routeKey];
    if (!r) return;
    const persona = ROUTE_PERSONA_COLORS[routeKey] || { color: "#B64236", icon: "📍", bg: "rgba(78,126,122,0.15)" };

    const card = document.getElementById("route-float-card");
    if (!card) return;

    document.getElementById("float-card-icon").style.background = persona.bg;
    document.getElementById("float-card-icon").textContent = persona.icon;
    document.getElementById("float-card-title").textContent = r.title;
    document.getElementById("float-card-sub").textContent = r.desc;

    const stopsEl = document.getElementById("float-card-stops");
    stopsEl.innerHTML = r.stops.map(s => `<span class="float-card-stop">${s.name}</span>`).join("");

    document.getElementById("float-card-start").onclick = () => {
        closeSheet();
        if (routeKey === "nju") {
            setTimeout(openGame, 300);
        } else {
            openRoute(routeKey);
        }
    };
    document.getElementById("float-card-invite").onclick = () => {
        const rid = ROUTE_KEY_TO_ID[routeKey] || 1;
        showInviteForm(rid);
    };
    document.getElementById("float-card-close").onclick = hideFloatCard;

    card.classList.add("show");
}

function hideFloatCard() {
    const card = document.getElementById("route-float-card");
    if (card) card.classList.remove("show");
}

// ═══════════════════════════════════════════
//  Achievement System
// ═══════════════════════════════════════════

const ACHIEVEMENT_DEFS = [
    { id: "night",   icon: "🏮", name: "夜泊秦淮", desc: "完成秦淮夜游路线" },
    { id: "nju",     icon: "🎓", name: "南大记忆", desc: "完成南大校史路线" },
    { id: "food",    icon: "🍜", name: "美食猎人", desc: "探索 3 家以上美食点位" },
    { id: "expo",    icon: "🏛", name: "文化漫游者", desc: "完成博物馆展览路线" },
    { id: "photo",   icon: "📸", name: "城市记录者", desc: "拍摄 5 个以上打卡点位" },
    { id: "coffee",  icon: "☕", name: "午后慢享", desc: "完成午后餐茶路线" },
    { id: "copy",    icon: "💜", name: "首条复刻", desc: "复刻一条喜欢的路线" },
    { id: "invite",  icon: "🤝", name: "邀约达人", desc: "成功邀请朋友一起出发" },
    { id: "all_routes", icon: "🌟", name: "金陵通", desc: "完成全部4条路线" },
    { id: "five_stops", icon: "📌", name: "打卡达人", desc: "累计打卡10个站点" },
    { id: "early", icon: "🌅", name: "早鸟", desc: "在上午9点前出发探索" },
    { id: "night_owl", icon: "🦉", name: "夜猫子", desc: "晚上8点后还在探索" },
    { id: "guide", icon: "💬", name: "向导挚友", desc: "与南小鲸对话10次以上" },
    { id: "collector", icon: "🎴", name: "收藏家", desc: "创建3条以上自定义路线" },
    { id: "social", icon: "👥", name: "社交达人", desc: "分享路线给5位好友" },
];

function getAchievements() {
    try { return JSON.parse(localStorage.getItem("nj_achievements") || "{}"); }
    catch { return {}; }
}

function saveAchievements(data) {
    localStorage.setItem("nj_achievements", JSON.stringify(data));
}

function unlockAchievement(id) {
    const data = getAchievements();
    if (data[id]) return;
    data[id] = { unlocked: true, date: new Date().toISOString() };
    saveAchievements(data);
    const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
    if (def) showToast("🏆 解锁成就：「" + def.name + "」");
    const tabInner = document.querySelector('#tab-achievements .tab-content-inner');
    if (tabInner && tabInner.dataset.rendered) {
        renderAchievementsTab(tabInner);
    }
    // Pet companion: check if this achievement unlocks a pet
    PET_DEFS.forEach(p => {
        if (p.unlockAchievement === id) {
            unlockPet(p.id);
        }
    });
}

// ═══════════════════════════════════════════
//  Time Filter for Route Cards
// ═══════════════════════════════════════════

function filterRoutesByTime(maxMinutes) {
    Object.keys(routes).forEach(key => {
        const r = routes[key];
        document.querySelectorAll('.route-card[data-route="' + key + '"]').forEach(card => {
            card.style.display = (maxMinutes && r.duration && r.duration > maxMinutes) ? "none" : "";
        });
    });
}

// ═══════════════════════════════════════════
//  Tab Switching System
// ═══════════════════════════════════════════

function restoreAllMapOverlays() {
    if (!amapInstance || !window.AMap) return;
    activeRouteOnMap = null;
    hideFloatCard();
    clearRouteOverlays();
    addAllRouteOverlays(window.AMap);
    try { amapInstance.setFitView(null, false, 0); } catch(e) {}
    amapInstance.setZoom(13);
    amapInstance.setCenter([118.796, 32.060]);
}

function switchTab(tab) {
    if (tab === currentTab) return;

    // Update nav active state (wheel nav)
    document.querySelectorAll(".wheel-item, .nav-item").forEach(i => i.classList.remove("active"));
    const navItem = document.querySelector(`.wheel-item[data-tab="${tab}"], .nav-item[data-tab="${tab}"]`);
    if (navItem) navItem.classList.add("active");

    resetPetIdleTimer();
    hideFloatCard();

    // Exit map fullscreen if active
    if (amapFullscreen) {
        amapFullscreen = false;
        document.getElementById("main-map-container").classList.remove("amap-fullscreen");
        document.querySelector(".bottom-nav").style.zIndex = "10";
        if (amapInstance) setTimeout(() => amapInstance.resize(), 50);
    }

    const mapStage = document.getElementById("map-stage");
    const mainPage = document.getElementById("main-page");
    const dimOverlay = document.getElementById("map-dim-overlay");

    // Always clean up drawer-open state
    if (mainPage) mainPage.classList.remove("drawer-open");

    // Hide map stage by default (map is no longer a primary tab)
    if (mapStage) mapStage.style.display = "none";
    if (dimOverlay) dimOverlay.style.display = "none";

    if (tab === "home") {
        // Home — map as visual backdrop, snap scroll on top
        if (mapStage) mapStage.style.display = "";
        if (dimOverlay) dimOverlay.style.display = "none";
        const mapContainer = document.getElementById("main-map-container");
        if (mapContainer) {
            mapContainer.style.display = "block";
            mapContainer.classList.remove("amap-fullscreen");
            mapContainer.style.filter = "saturate(0.45) contrast(0.82) brightness(1.14) sepia(0.08)";
            mapContainer.style.pointerEvents = "none";
        }
        const header = document.querySelector(".main-header");
        if (header) { header.style.display = ""; header.style.opacity = "1"; }
        hideAllTabContent();
        const snapScroll = document.getElementById("snap-scroll");
        if (snapScroll) {
            snapScroll.style.display = "";
            snapScroll.scrollTop = 0;
        }
    } else {
        // routes / nearby / pet / profile — hide map stage and all other tabs
        hideAllTabContent();
        const tabEl = document.querySelector(`.main-tab-content[data-tab="${tab}"]`);
        if (tabEl) {
            tabEl.style.display = "block";
            tabEl.classList.add("visible");
            const inner = tabEl.querySelector(".tab-content-inner");
            if (inner) {
                // Routes tab always re-renders (dynamic custom routes + upload hero)
                if (tab === "routes") renderRoutesTab(inner);
                else if (!inner.dataset.rendered) {
                    inner.dataset.rendered = "1";
                    if (tab === "nearby") renderNearbyTab(inner);
                    else if (tab === "pet") renderPetTab(inner);
                    else if (tab === "profile") renderProfileTab(inner);
                }
            }
        }
    }
    currentTab = tab;
}

function hideAllTabContent() {
    document.querySelectorAll("#snap-scroll, .main-tab-content").forEach(el => {
        el.style.display = "none";
    });
}

// ═══════════════════════════════════════════
//  Tab Rendering Functions
// ═══════════════════════════════════════════

const TAB_ROUTE_ICONS = {
    nju: { icon: "🎓", bg: "rgba(111,75,178,0.12)" },
    night: { icon: "🏮", bg: "rgba(216,168,74,0.12)" },
    food: { icon: "🍜", bg: "rgba(255,122,69,0.12)" },
    expo: { icon: "🏛", bg: "rgba(79,195,199,0.12)" },
};

function renderRoutesTab(container) {
    container.innerHTML =
        `<div class="tab-page-header">
            <div class="tab-page-title">全部路线</div>
            <div class="tab-page-subtitle">${Object.keys(routes).length} 条路线，等你出发</div>
        </div>
        <!-- Upload route button -->
        <div class="upload-route-hero" id="upload-route-hero">
            <div class="upload-route-hero-icon">🗺️</div>
            <div class="upload-route-hero-text">
                <span class="upload-route-hero-title">上传我的路线</span>
                <span class="upload-route-hero-sub">在地图上标记起点、途经点和终点，创建你自己的南京路线</span>
            </div>
            <button class="upload-route-hero-btn" id="upload-route-hero-btn">开始标记</button>
        </div>`;

    // Bind upload button
    container.querySelector("#upload-route-hero-btn").addEventListener("click", showMapRouteEditor);
    // Also make the whole card clickable
    container.querySelector("#upload-route-hero").addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") showMapRouteEditor();
    });

    Object.entries(routes).forEach(([key, route]) => {
        const info = TAB_ROUTE_ICONS[key] || { icon: "📍", bg: "rgba(78,126,122,0.12)" };
        const metaHtml = route.meta.map(m => `<span>${m}</span>`).join("");
        const isCustom = key.startsWith("custom_");
        const badge = isCustom ? '<span style="display:inline-block;background:#E07A5F;color:#fff;font-size:10px;padding:1px 6px;border-radius:3px;margin-left:6px;vertical-align:middle;">自定义</span>' : "";
        const div = document.createElement("div");
        div.className = "route-list-item";
        div.innerHTML =
            `<div class="route-list-icon" style="background:${info.bg}">${info.icon}</div>
             <div class="route-list-info">
                 <div class="route-list-name">${route.title}${badge}</div>
                 <div class="route-list-desc">${route.desc}</div>
                 <div class="route-list-meta">${metaHtml}</div>
             </div>
             <span class="route-list-arrow">›</span>`;
        div.addEventListener("click", () => openRoute(key));
        container.appendChild(div);
    });
}

// ── Route coordinates for Meituan API ──
const ROUTE_COORDINATES = {
    nju: { lat: 32.056, lng: 118.779 },
    night: { lat: 32.020, lng: 118.788 },
    food: { lat: 32.045, lng: 118.790 },
    expo: { lat: 32.040, lng: 118.830 }
};

function getCurrentLatLng() {
    if (currentRouteKey && ROUTE_COORDINATES[currentRouteKey]) {
        return ROUTE_COORDINATES[currentRouteKey];
    }
    return { lat: 32.060, lng: 118.796 }; // Nanjing center
}

// ═══════════════════════════════════════
//  🗺️ Map Route Editor — 地图选点路线编辑器
// ═══════════════════════════════════════

let mapEditor = null;          // { overlay, amap, markers, polylines, waypoints, ... }

function showMapRouteEditor() {
    closeSheet();

    // Remove previous editor iframe
    document.querySelector(".map-editor-iframe-overlay")?.remove();
    if (mapEditor) { closeMapEditor(); }

    // ── Create fullscreen iframe overlay for route editor ──
    const overlay = document.createElement("div");
    overlay.className = "map-editor-iframe-overlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:200;background:#fff;";

    const iframe = document.createElement("iframe");
    iframe.src = "./route-editor.html";
    iframe.style.cssText = "width:100%;height:100%;border:none;";
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // ── Listen for messages from the editor iframe ──
    const msgHandler = function(e) {
        if (e.data && e.data.type === "close-editor") {
            closeMapEditor();
        }
        if (e.data && e.data.type === "route-saved") {
            const d = e.data.data;
            showToast("✅ 路线「" + (d.routeName || "自定义") + "」已保存！");
            // Save to localStorage so loadCustomRoutes() can find it
            saveCustomRouteFromEditor(d);
            // Reload custom routes from localStorage
            loadCustomRoutes();
            renderRouteGrid();
            // Also refresh carousel (may pick up new custom routes if added)
            renderCarouselCards();
            const routesTab = document.querySelector("#tab-routes .tab-content-inner");
            if (routesTab) renderRoutesTab(routesTab);
            // Close the map editor
            closeMapEditor();
        }
    };
    window.addEventListener("message", msgHandler);
    overlay._msgHandler = msgHandler;

    mapEditor = { overlay, iframe };
    document.querySelector(".bottom-nav").style.zIndex = "50";
}

function closeMapEditor() {
    if (!mapEditor) return;

    const overlay = mapEditor.overlay;
    if (overlay && overlay._msgHandler) {
        window.removeEventListener("message", overlay._msgHandler);
    }
    try { overlay.remove(); } catch(e) {}
    document.querySelector(".bottom-nav").style.zIndex = "10";
    mapEditor = null;
}

function refreshMapEditorDisplay() {
    if (!mapEditor || !amapInstance) return;

    const { waypoints } = mapEditor;

    // Clear existing overlays
    mapEditor.markers.forEach(m => { try { amapInstance.remove(m); } catch(e) {} });
    mapEditor.markers = [];
    mapEditor.polylines.forEach(p => { try { amapInstance.remove(p); } catch(e) {} });
    mapEditor.polylines = [];

    // Update bottom point list
    const pointsList = document.getElementById("map-editor-points-list");
    const saveBtn = document.getElementById("map-editor-save");
    const undoBtn = document.getElementById("map-editor-undo");
    const clearBtn = document.getElementById("map-editor-clear");
    const hint = document.getElementById("map-editor-hint");

    if (!waypoints.length) {
        pointsList.innerHTML = '<span class="no-points-hint">👆 选择模式，然后点击地图添加标记…</span>';
        saveBtn.disabled = true; undoBtn.disabled = true; clearBtn.disabled = true;
        if (hint) hint.textContent = "先点「添加起点」→ 再添加途经点 → 最后点「添加终点」";
        return;
    }

    const hasStart = waypoints.some(w => w.type === "start");
    const hasEnd = waypoints.some(w => w.type === "end");
    saveBtn.disabled = !(hasStart && hasEnd && waypoints.length >= 2);
    undoBtn.disabled = false;
    clearBtn.disabled = false;

    // Update hint
    if (!hasStart) {
        if (hint) hint.textContent = "请先点击「🏁 添加起点」，再点击地图标记起点";
    } else if (!hasEnd) {
        if (hint) hint.textContent = "请点击「🎯 添加终点」，再点击地图标记终点";
    } else {
        if (hint) hint.textContent = "起点 ✓ · 途经点 ✓ · 终点 ✓ — 点击「💾 保存路线」";
    }

    // Render point chips
    pointsList.innerHTML = waypoints.map((wp, i) => {
        let label, chipColor;
        if (wp.type === "start") { label = "🏁 起点"; chipColor = "#2E8B57"; }
        else if (wp.type === "end") { label = "🎯 终点"; chipColor = "#B64236"; }
        else { label = "📍 途经点"; chipColor = "#E07A5F"; }
        return `<span class="map-editor-point-chip" data-index="${i}" style="border-color:${chipColor}30;background:${chipColor}10;color:${chipColor};">
            ${label}
            <span class="map-editor-point-coord">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</span>
            <button class="map-editor-point-del" data-index="${i}" title="删除此点">✕</button>
        </span>`;
    }).join("");

    // Bind delete buttons & chip clicks
    pointsList.querySelectorAll(".map-editor-point-del").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            if (!isNaN(idx) && mapEditor && mapEditor.waypoints.length > idx) {
                mapEditor.waypoints.splice(idx, 1);
                refreshMapEditorDisplay();
            }
        });
    });
    pointsList.querySelectorAll(".map-editor-point-chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") return;
            const idx = parseInt(chip.dataset.index);
            if (!isNaN(idx) && mapEditor && mapEditor.waypoints[idx]) {
                const wp = mapEditor.waypoints[idx];
                amapInstance.setZoomAndCenter(16, [wp.lng, wp.lat]);
            }
        });
    });

    // Draw polylines connecting all waypoints
    if (waypoints.length >= 2) {
        const path = waypoints.map(wp => [wp.lng, wp.lat]);
        // Segmented: start→waypoint green, waypoint→waypoint orange, waypoint→end red
        const polyline = new AMap.Polyline({
            path,
            strokeColor: "#E07A5F",
            strokeOpacity: 0.85, strokeWeight: 5,
            strokeStyle: "solid", lineJoin: "round", lineCap: "round",
            zIndex: 50,
        });
        amapInstance.add(polyline);
        mapEditor.polylines.push(polyline);

        const glowLine = new AMap.Polyline({
            path,
            strokeColor: "#E07A5F", strokeOpacity: 0.15, strokeWeight: 14,
            strokeStyle: "solid", lineJoin: "round", zIndex: 49,
        });
        amapInstance.add(glowLine);
        mapEditor.polylines.push(glowLine);
    }

    // Draw markers
    waypoints.forEach((wp, i) => {
        const colors = { start: "#2E8B57", end: "#B64236", waypoint: "#E07A5F" };
        const labels = { start: "起", end: "终", waypoint: String(waypoints.filter((w, j) => w.type === "waypoint" && j <= i).length || i) };
        const bgColor = colors[wp.type] || "#E07A5F";
        const label = labels[wp.type] || String(i);

        const contentEl = document.createElement("div");
        contentEl.className = "map-editor-marker";
        contentEl.innerHTML = `<span class="map-editor-marker-dot" style="background:${bgColor}">${label}</span>`;

        const marker = new AMap.Marker({
            position: [wp.lng, wp.lat],
            content: contentEl,
            offset: new AMap.Pixel(-16, -16),
            zIndex: 60 + i,
        });
        amapInstance.add(marker);
        mapEditor.markers.push(marker);
    });
}

function openMapEditorSaveDialog() {
    if (!mapEditor || mapEditor.waypoints.length < 2) return;

    // Remove any existing save dialog
    document.querySelector(".map-editor-save-dialog")?.remove();

    const dialog = document.createElement("div");
    dialog.className = "map-editor-save-dialog";
    dialog.style.cssText = "position:fixed;inset:0;z-index:120;background:rgba(26,28,27,0.40);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;";
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.remove(); });

    dialog.innerHTML = `
        <div class="invite-sheet" style="background:var(--stone);max-width:420px;width:90%;" onclick="event.stopPropagation()">
            <p class="title">💾 保存路线</p>
            <p class="subtitle">共 ${mapEditor.waypoints.length} 个标记点</p>
            <div class="invite-form">
                <label>路线名称 <span style="color:#E07A5F;">*</span></label>
                <input type="text" id="editor-route-title" placeholder="如：我的梧桐漫步路线" />

                <label>路线描述</label>
                <input type="text" id="editor-route-desc" placeholder="一句话描述…" />

                <div class="form-row">
                    <div>
                        <label>预计时长（分钟）</label>
                        <input type="number" id="editor-route-duration" value="120" />
                    </div>
                    <div>
                        <label>预估花费</label>
                        <input type="text" id="editor-route-budget" value="自由预算" />
                    </div>
                </div>

                <label>路线站点名称 <span style="color:#8B939E;font-size:11px;">（每行对应一个标记点，顺序与地图一致）</span></label>
                <textarea id="editor-route-stops" rows="4" style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--rule);background:var(--surface);font-size:13px;font-family:inherit;outline:none;resize:vertical;line-height:1.6;">${mapEditor.waypoints.map((wp, i) => {
                    const label = i === 0 ? "起点" : i === mapEditor.waypoints.length - 1 ? "终点" : `途经点${i}`;
                    return `${label} - 点击选择的位置`;
                }).join("\n")}</textarea>

                <div class="form-actions">
                    <button class="btn-primary" onclick="saveMapRouteFromEditor()">✨ 保存路线</button>
                    <button class="btn-cancel" onclick="this.closest('.map-editor-save-dialog').remove()">取消</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(dialog);
}

function saveMapRouteFromEditor() {
    if (!mapEditor || mapEditor.waypoints.length < 2) return;

    const title = document.getElementById("editor-route-title").value.trim();
    const desc = document.getElementById("editor-route-desc").value.trim();
    const duration = parseInt(document.getElementById("editor-route-duration").value) || 120;
    const budget = document.getElementById("editor-route-budget").value.trim() || "自由预算";
    const stopsRaw = document.getElementById("editor-route-stops").value.trim();

    if (!title) { showToast("请填写路线名称"); return; }

    // Parse stop names
    const stopLines = stopsRaw ? stopsRaw.split("\n").filter(l => l.trim()) : [];
    const stops = mapEditor.waypoints.map((wp, i) => {
        const line = stopLines[i] || "";
        const parts = line.split(/[-–—]/);
        const name = parts.length >= 2 ? parts[0].trim() : (line || `站点${i + 1}`);
        const detail = parts.length >= 2 ? parts.slice(1).join("-").trim() : "";
        return {
            name,
            detail,
            lat: wp.lat,
            lng: wp.lng
        };
    });

    // Calculate approximate distance between waypoints
    let totalDist = 0;
    for (let i = 1; i < mapEditor.waypoints.length; i++) {
        const prev = mapEditor.waypoints[i - 1];
        const curr = mapEditor.waypoints[i];
        totalDist += Math.round(getDistance(prev.lat, prev.lng, curr.lat, curr.lng));
    }

    // Build AMap coordinate strings
    const origin = mapEditor.waypoints[0].lng.toFixed(6) + "," + mapEditor.waypoints[0].lat.toFixed(6);
    const dest = mapEditor.waypoints[mapEditor.waypoints.length - 1].lng.toFixed(6) + "," + mapEditor.waypoints[mapEditor.waypoints.length - 1].lat.toFixed(6);
    const waypointsStr = mapEditor.waypoints.length > 2
        ? mapEditor.waypoints.slice(1, -1).map(wp => wp.lng.toFixed(6) + "," + wp.lat.toFixed(6)).join(";")
        : "";

    // Save to custom routes (localStorage)
    const routeId = ++CUSTOM_ROUTE_COUNTER;
    const key = "custom_" + routeId;
    const now = new Date().toISOString();

    // Add to routes object
    routes[key] = {
        title: title,
        desc: desc || "我的自定义路线",
        meta: [duration + " 分钟", "自由探索", budget],
        duration: duration,
        stops: stops,
        isCustom: true,
        budget: budget,
        hasMapData: true
    };

    // Save map data for route display
    ROUTE_MAP_DATA[key] = {
        coords: mapEditor.waypoints.map(wp => [wp.lat, wp.lng]),
        stops: stops.map(s => s.name)
    };

    // Save to customRoutes
    customRoutes[key] = {
        id: routeId,
        title: title,
        desc: desc || "",
        duration: duration,
        budget: budget,
        stops: stops,
        coords: mapEditor.waypoints.map(wp => [wp.lat, wp.lng]),
        createdAt: now
    };
    saveCustomRoutesToStorage();

    // Also add to saved routes
    try {
        let saved = JSON.parse(localStorage.getItem("nj_saved_routes") || "[]");
        saved.push({ key, title: title + "（自定义）", savedAt: now });
        localStorage.setItem("nj_saved_routes", JSON.stringify(saved));
    } catch(e) {}

    // ── Backend API: persist to server ──
    fetch("/api/custom-route/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            routeName: title,
            origin: origin,
            destination: dest,
            waypoints: waypointsStr,
            transportMode: "walking",
            totalDistance: totalDist,
            totalDuration: duration,
            pointNames: stops.map(s => s.name),
            coords: mapEditor.waypoints.map(wp => [wp.lat, wp.lng])
        })
    }).then(r => r.json()).then(data => {
        if (data.code === 200) {
            console.log("Route saved to server:", data.data);
        }
    }).catch(() => {
        // Backend unavailable — already saved to localStorage
    });

    // Close editor and dialog
    document.querySelector(".map-editor-save-dialog")?.remove();
    closeMapEditor();

    // Show toast
    showToast("✅ 路线「" + title + "」已保存！可在路线列表查看");

    // Unlock achievement
    if (Object.keys(customRoutes).length >= 1) unlockAchievement("collector");

    // Re-render grid & routes tab
    renderRouteGrid();
    const routesTab = document.querySelector("#tab-routes .tab-content-inner");
    if (routesTab && routesTab.dataset.rendered) {
        routesTab.dataset.rendered = "";
        renderRoutesTab(routesTab);
        routesTab.dataset.rendered = "1";
    }
}

// Haversine distance between two lat/lng points (returns meters)
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function closeMapEditor() {
    if (!mapEditor) return;

    // Remove click handler
    if (amapInstance && amapInstance._mapEditorClickHandler) {
        amapInstance.off("click", amapInstance._mapEditorClickHandler);
        amapInstance._mapEditorClickHandler = null;
    }

    // Clear editor overlays
    if (amapInstance) {
        if (mapEditor.markers) mapEditor.markers.forEach(m => { try { amapInstance.remove(m); } catch(e) {} });
        if (mapEditor.polylines) mapEditor.polylines.forEach(p => { try { amapInstance.remove(p); } catch(e) {} });
    }

    // Remove overlay
    try { mapEditor.overlay.remove(); } catch(e) {}

    // Remove save dialog
    document.querySelector(".map-editor-save-dialog")?.remove();

    // Restore cursor & map container (back to home page look)
    const mapContainer = document.getElementById("main-map-container");
    if (mapContainer) {
        mapContainer.style.cursor = "";
        mapContainer.style.filter = "";              // Restore sepia
        mapContainer.style.pointerEvents = "";        // Reset pointer events
        mapContainer.classList.remove("amap-fullscreen");
    }

    // Restore map state
    const snapScroll = document.getElementById("snap-scroll");
    const header = document.querySelector(".main-header");
    if (snapScroll) snapScroll.style.display = "";
    if (header) header.style.display = "";

    document.querySelector(".bottom-nav").style.zIndex = "10";

    mapEditor = null;
    switchTab("home");
}

// ── Meituan POI categories with icons ──
const MEITUAN_CATEGORIES = [
    { key: "food", icon: "🍜", label: "美食", need: "food" },
    { key: "coffee", icon: "☕", label: "咖啡", need: "drink" },
    { key: "hotel", icon: "🏨", label: "休息", need: "hotel" }
];

async function fetchMeituanPois(lat, lng) {
    const allPois = [];
    for (const cat of MEITUAN_CATEGORIES.map(c => c.key)) {
        try {
            const resp = await fetch(`/api/meituan/poi/search?lat=${lat}&lng=${lng}&category=${cat}`);
            if (!resp.ok) throw new Error("Meituan POI API unavailable");
            const data = await resp.json();
            const pois = (data.data || []).map(p => ({ ...p, _category: cat }));
            allPois.push(...pois);
        } catch (e) {
            // Fall back silently
        }
    }
    if (allPois.length) {
        return { source: "api", items: allPois };
    }
    return { source: "local", items: getLocalMeituanPois() };
}

async function fetchMeituanDealsData(lat, lng) {
    try {
        const resp = await fetch(`/api/meituan/deals?lat=${lat}&lng=${lng}`);
        if (!resp.ok) throw new Error("Meituan deals API unavailable");
        const data = await resp.json();
        return data.data || [];
    } catch (e) {
        return getLocalMeituanDeals();
    }
}

function getLocalMeituanPois() {
    if (typeof SUPPLY_DATA === "undefined") return [];
    return SUPPLY_DATA.getAll()
        .filter(i => ["food", "coffee", "hotel"].includes(i.category))
        .sort((a, b) => (a.distance || 9999) - (b.distance || 9999))
        .slice(0, 12)
        .map(i => ({
            storeId: i.id,
            name: i.name,
            address: i.address,
            category: i.category,
            rating: i.rating,
            avgPrice: i.avgPrice,
            imageUrl: i.image,
            distance: i.distance,
            tags: i.tags,
            district: i.district,
            subcategory: i.subcategory,
            reviewCount: i.reviewCount,
            deals: i.deals,
            photos: i.photos,
        }));
}

function getLocalMeituanDeals() {
    if (typeof SUPPLY_DATA === "undefined") return [];
    return SUPPLY_DATA.getCoupons().slice(0, 8).map(c => ({
        dealId: c.id,
        title: c.name,
        storeName: c.shop,
        price: Number(c.price) || 0,
        originalPrice: Number(c.origPrice) || 0,
        soldCount: c.sold,
        category: c.category || "food",
    }));
}

function poiToSupplyItem(poi) {
    const iconMap = { food: "🍜", coffee: "☕", rest: "🏨" };
    return {
        id: poi.storeId || "p" + Math.random(),
        type: poi._category || "food",
        icon: iconMap[poi._category] || "📍",
        name: poi.name || "商家",
        shop: poi.address || "南京",
        distance: poi.distance || Math.floor(Math.random() * 1000 + 100),
        onRoute: (poi.distance || 999) < 500,
        detour: Math.floor((poi.distance || 500) / 100),
        price: poi.avgPrice || 30,
        origPrice: Math.floor((poi.avgPrice || 30) * 1.6),
        stayMin: 20,
        hasCoupon: true,
        couponDiscount: Math.floor((poi.rating || 4.5) * 10 + 10) / 10 + "折",
        rating: poi.rating || 4.5,
        tags: [poi.category || "推荐", poi.openTime || "营业中"],
        fitPersona: ["foodie"],
        storeId: poi.storeId,
        phone: poi.phone,
        openTime: poi.openTime
    };
}

function dealToCoupon(deal) {
    return {
        id: deal.dealId || "d" + Math.random(),
        icon: "🎫",
        name: deal.title || "优惠套餐",
        desc: deal.storeName || "",
        price: deal.price || "39",
        origPrice: deal.originalPrice || "",
        discount: deal.originalPrice ? (Math.round(deal.price / deal.originalPrice * 100) / 10) + "折" : "特价",
        distance: 300,
        shop: deal.storeName || ""
    };
}

// ── POI Detail Overlay ──
function showPoiDetailOverlay(storeId) {
    showPoiDetailOverlayDianping(storeId);
}

function showPoiDetailOverlayDianping(storeId) {
    // Find business in SUPPLY_DATA first
    let biz = (typeof SUPPLY_DATA !== 'undefined')
        ? SUPPLY_DATA.getAll().find(b => b.id === storeId)
        : null;

    const existing = document.querySelector(".poi-detail-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "poi-detail-overlay";
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });

    // Try Meituan API for real detail if storeId starts with 'm'
    if (storeId && storeId.startsWith('m')) {
        fetch(`/api/meituan/poi/detail/${storeId}`)
            .then(r => r.json())
            .then(d => {
                const detail = d.data;
                if (detail) {
                    biz = {
                        id: detail.storeId,
                        name: detail.name,
                        address: detail.address,
                        category: detail.category === 'coffee' ? 'coffee' : detail.category === 'rest' ? 'hotel' : 'food',
                        rating: detail.rating,
                        avgPrice: detail.avgPrice,
                        image: detail.imageUrls && detail.imageUrls.length > 0 ? detail.imageUrls[0] : null,
                        gallery: detail.imageUrls || [],
                        tags: detail.tags || [],
                        desc: detail.description || '',
                        reviewCount: detail.reviewCount || 0,
                        phone: detail.phone || '',
                        hours: detail.openTime || '',
                        district: detail.address ? detail.address.split('市')[1] || detail.address : '',
                        deals: [],
                        photos: (detail.imageUrls || []).length,
                        bookmarkCount: detail.reviewCount ? Math.floor(detail.reviewCount * 0.6) : 0,
                    };
                }
                renderDetailOverlay(overlay, biz);
            })
            .catch(() => renderDetailOverlay(overlay, biz));
    } else {
        renderDetailOverlay(overlay, biz);
    }

    function renderDetailOverlay(overlay, biz) {
    if (!biz) {
        overlay.innerHTML = `<div class="poi-detail-sheet" onclick="event.stopPropagation()">
            <button class="poi-detail-close" onclick="this.closest('.poi-detail-overlay').remove()">✕</button>
            <div class="poi-detail-empty">商家信息暂无</div>
        </div>`;
        document.body.appendChild(overlay);
        return;
    }

    const ratingStars = renderStars(biz.rating);
    const deals = biz.deals || [];
    const dealHtml = deals.length ? deals.map(d =>
        `<div class="poi-deal-item"><span class="poi-deal-desc">${d.desc}</span><span class="poi-deal-price">¥${d.price}<s>¥${d.orig}</s></span><span class="poi-deal-sold">已售${formatReviewCount(d.sold)}</span></div>`
    ).join('') : '';

    const catLabel = {
        food: '美食', coffee: '咖啡茶饮', ticket: '景点门票', hotel: '酒店住宿',
        shopping: '购物', entertainment: '休闲娱乐'
    }[biz.category] || biz.subcategory || '';

    const gallery = biz.gallery || [];
    const allPhotos = [biz.image, ...gallery].filter(Boolean);
    const galleryDots = allPhotos.map((_, gi) => `<i class="gdot${gi===0?' active':''}" data-gi="${gi}"></i>`).join('');
    const highlights = biz.highlights || [];
    const services = biz.services || [];

    overlay.innerHTML = `
    <div class="poi-detail-sheet dianping-detail" onclick="event.stopPropagation()">
        <button class="poi-detail-close" onclick="this.closest('.poi-detail-overlay').remove()">✕</button>
        <div class="dp-detail-header">
            <!-- Photo Gallery -->
            <div class="dp-gallery" id="dp-gallery">
                <div class="dp-gallery-track" id="dp-gallery-track">
                    ${allPhotos.map((ph, gi) => `
                    <div class="dp-gallery-slide">
                        <img class="dp-gallery-img" src="${escapeHtml(ph)}" alt="${escapeHtml(biz.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\"dp-gallery-fallback\" style=\"background:${categoryGradient(biz.category)}\">${categoryIcon(biz.category)}</div>'">
                    </div>`).join('')}
                </div>
                <div class="dp-gallery-dots">${galleryDots}</div>
                <div class="dp-gallery-count">1/${allPhotos.length}</div>
            </div>
            <div class="dp-detail-title-row">
                <h2 class="dp-detail-name">${escapeHtml(biz.name)}</h2>
                <span class="dp-detail-cat">${catLabel}</span>
            </div>
            <div class="dp-detail-rating-row">
                ${ratingStars}
                <span class="dp-detail-rating-num">${biz.rating}</span>
                <span class="dp-detail-reviews">${formatReviewCount(biz.reviewCount)}条评论</span>
                ${biz.avgPrice ? `<span class="dp-detail-avg">人均 ¥${biz.avgPrice}</span>` : ''}
                ${biz.distance ? `<span class="dp-detail-dist">${biz.distance < 1000 ? biz.distance + 'm' : (biz.distance/1000).toFixed(1) + 'km'}</span>` : ''}
            </div>
            ${services.length ? `<div class="dp-detail-services">${services.map(s => `<span class="dp-service-tag">${escapeHtml(s)}</span>`).join('')}</div>` : ''}
        </div>
        <!-- Highlights / Recommended -->
        ${highlights.length ? `
        <div class="dp-detail-section">
            <h4 class="dp-section-title">${biz.category==='food'?'推荐菜品':biz.category==='coffee'?'人气饮品':biz.category==='ticket'?'门票类型':biz.category==='hotel'?'房型选择':'热门推荐'}</h4>
            <div class="dp-highlights">${highlights.map(h => `<span class="dp-highlight-item">${escapeHtml(h)}</span>`).join('')}</div>
        </div>` : ''}
        <!-- Deals -->
        ${dealHtml ? `<div class="dp-detail-section">
            <h4 class="dp-section-title">团购优惠 · 美团券</h4>
            <div class="dp-detail-deals">${dealHtml}</div>
        </div>` : ''}
        <!-- Info -->
        <div class="dp-detail-section">
            <h4 class="dp-section-title">商家信息</h4>
            <div class="dp-detail-info">
                ${biz.address ? `<div class="dp-detail-row"><span class="dp-info-icon">📍</span><div><span>${escapeHtml(biz.address)}</span><span class="dp-info-sub">${biz.district}</span></div></div>` : ''}
                ${biz.phone ? `<div class="dp-detail-row"><span class="dp-info-icon">📞</span><div><span class="dp-info-link">${escapeHtml(biz.phone)}</span><span class="dp-info-sub">联系电话</span></div></div>` : ''}
                ${biz.hours ? `<div class="dp-detail-row"><span class="dp-info-icon">🕐</span><div><span>${escapeHtml(biz.hours)}</span><span class="dp-info-sub">营业时间</span></div></div>` : ''}
                ${biz.stayMin ? `<div class="dp-detail-row"><span class="dp-info-icon">⏱</span><div><span>建议停留 ${biz.stayMin} 分钟</span></div></div>` : ''}
            </div>
        </div>
        <!-- Stats -->
        <div class="dp-detail-stats">
            <div class="dp-detail-stat"><b>${biz.photos || 0}</b><span>照片</span></div>
            <div class="dp-detail-stat"><b>${formatReviewCount(biz.bookmarkCount || 0)}</b><span>收藏</span></div>
            <div class="dp-detail-stat"><b>${formatReviewCount(biz.reviewCount)}</b><span>评论</span></div>
            ${biz.onRoute ? '<div class="dp-detail-stat on-route"><b>顺路</b><span>推荐</span></div>' : ''}
        </div>
        <div class="dp-detail-tags">${(biz.tags || []).map(t => `<span class="poi-detail-tag">${escapeHtml(t)}</span>`).join('')}</div>
        <div class="poi-detail-actions">
            <button class="poi-detail-btn primary" onclick="showToast('已加入路线规划'); this.closest('.poi-detail-overlay').remove();">加入路线</button>
            ${deals.length ? `<button class="poi-detail-btn coupon" onclick="showToast('优惠已复制，即将跳转购买');">立即抢购</button>` : ''}
        </div>
    </div>`;

    // Gallery scroll + dot sync
    if (allPhotos.length > 1) {
        setTimeout(() => {
            const track = overlay.querySelector('#dp-gallery-track');
            const dots = overlay.querySelectorAll('.gdot');
            const counter = overlay.querySelector('.dp-gallery-count');
            if (!track) return;
            track.addEventListener('scroll', () => {
                const idx = Math.round(track.scrollLeft / track.clientWidth);
                dots.forEach(d => d.classList.remove('active'));
                if (dots[idx]) dots[idx].classList.add('active');
                if (counter) counter.textContent = (idx+1)+'/'+allPhotos.length;
            }, {passive:true});
        }, 100);
    }
    document.body.appendChild(overlay);
    } // end renderDetailOverlay
} // end showPoiDetailOverlayDianping

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function renderNearbyTab(container) {
    const allData = (typeof SUPPLY_DATA !== 'undefined') ? SUPPLY_DATA.getAll() : [];
    const coupons = (typeof SUPPLY_DATA !== 'undefined') ? SUPPLY_DATA.getCoupons() : [];

    let html = '';

    // ── Header ──
    html += `<div class="supply-header">
        <div class="supply-header-top">
            <h2 class="supply-title">城市补给站</h2>
            <span class="supply-budget">今日预算 ¥${userBudget || 80}</span>
        </div>
        <p class="supply-subtitle">${allData.length}+ 南京本地商家，让你的城市漫游更从容</p>
    </div>`;

    // ── Route Context Bar ──
    if ((currentRouteKey && routes[currentRouteKey])) {
        const rc = routes[currentRouteKey];
        html += `<div class="supply-route-bar">
            <span class="supply-route-icon">📍</span>
            <span class="supply-route-name">当前路线：${rc.title}</span>
            <span class="supply-route-path">${rc.stops.map(s => s.name).join(' → ')}</span>
        </div>`;
    }

    // ── Stats Dashboard ──
    html += `<div class="supply-radar">
        <div class="radar-label">全城商家实时覆盖</div>
        <div class="radar-stats" id="radar-stats">
            <span class="radar-stat" data-cat="all"><span class="radar-stat-icon">📍</span> 全部 <strong>${allData.length}</strong></span>
            <span class="radar-stat" data-cat="food"><span class="radar-stat-icon">🍜</span> 美食 <strong>${allData.filter(i=>i.category==='food').length}</strong></span>
            <span class="radar-stat" data-cat="coffee"><span class="radar-stat-icon">☕</span> 咖啡 <strong>${allData.filter(i=>i.category==='coffee').length}</strong></span>
            <span class="radar-stat" data-cat="ticket"><span class="radar-stat-icon">🏛</span> 景点 <strong>${allData.filter(i=>i.category==='ticket').length}</strong></span>
            <span class="radar-stat" data-cat="coupon"><span class="radar-stat-icon">🎫</span> 优惠 <strong>${coupons.length}</strong></span>
            <span class="radar-stat" data-cat="hotel"><span class="radar-stat-icon">🏨</span> 住宿 <strong>${allData.filter(i=>i.category==='hotel').length}</strong></span>
        </div>
    </div>`;

    // ── Quick Filter ──
    html += `<div class="supply-needs">
        <span class="needs-label">探索分类（点击查看全部）</span>
        <div class="needs-chips">
            <button class="need-chip active" data-need="all">全部推荐</button>
            <button class="need-chip" data-need="food">美食</button>
            <button class="need-chip" data-need="drink">咖啡茶饮</button>
            <button class="need-chip" data-need="ticket">景点门票</button>
            <button class="need-chip" data-need="hotel">酒店住宿</button>
            <button class="need-chip" data-need="coupon">今日优惠</button>
        </div>
    </div>`;

    // ── Meituan API real-time section ──
    html += `<div class="supply-meituan-section" id="supply-meituan">
        <div class="supply-meituan-header">
            <span class="supply-meituan-title">🔴 美团实时推荐</span>
            <span class="supply-meituan-badge">附近好店</span>
        </div>
        <div class="supply-meituan-content" id="supply-meituan-content">
            <div class="supply-loading">📍 正在获取附近商家...</div>
        </div>
    </div>`;

    // ── Dynamic content ──
    html += `<div class="supply-dynamic" id="supply-dynamic"></div>`;
    container.innerHTML = html;

    // Fetch Meituan API data
    const { lat, lng } = getCurrentLatLng();
    fetchMeituanPois(lat, lng).then(result => {
        const meituanContent = document.getElementById("supply-meituan-content");
        const pois = Array.isArray(result) ? result : result.items || [];
        const source = Array.isArray(result) ? "api" : result.source;
        const badge = document.querySelector(".supply-meituan-badge");
        if (badge) {
            badge.textContent = source === "api" ? "实时在线" : "离线推荐";
            badge.classList.toggle("offline", source !== "api");
        }
        if (meituanContent && pois.length > 0) {
            meituanContent.innerHTML = `<div class="dianping-cards">${pois.slice(0, 8).map(p => {
                const item = {
                    id: p.storeId || p.id || 'api_' + Math.random(),
                    name: p.name,
                    category: p.category === 'coffee' ? 'coffee' : p.category === 'hotel' ? 'hotel' : 'food',
                    rating: p.rating || 4.0,
                    distance: p.distance || 500,
                    avgPrice: p.avgPrice || 30,
                    image: p.imageUrl || null,
                    address: p.address || '',
                    district: p.district || '',
                    subcategory: p.subcategory || '',
                    reviewCount: p.reviewCount || 1200,
                    tags: p.tags || [],
                    deals: p.deals || [],
                    photos: p.photos || 0,
                };
                return renderDianpingCard(item);
            }).join('')}</div>`;
            // Also fetch deals
            fetchMeituanDealsData(lat, lng).then(deals => {
                if (deals.length > 0) {
                    const dealsHtml = `<div class="supply-group" style="margin-top:16px;">
                        <h3 class="supply-group-title">今日优惠套餐 <span class="savings-badge">${deals.length}个套餐</span></h3>
                        <div class="dianping-coupons">${deals.map(dl => renderDianpingCouponCard({
                            icon: dl.category === 'food' ? '🍜' : dl.category === 'coffee' ? '☕' : dl.category === 'ticket' ? '🎫' : '🏨',
                            name: dl.title,
                            desc: dl.storeName || '',
                            shop: dl.storeName || '',
                            distance: 500,
                            price: dl.price,
                            origPrice: dl.originalPrice,
                            discount: dl.originalPrice > 0 ? Math.round((1 - dl.price/dl.originalPrice) * 100) + '%' : '',
                            sold: dl.soldCount || 1000,
                        })).join('')}</div>
                    </div>`;
                    meituanContent.insertAdjacentHTML('beforeend', dealsHtml);
                }
            }).catch(() => {});
        } else if (meituanContent) {
            meituanContent.innerHTML = '<div class="supply-loading">附近实时接口暂不可用，以下已切换本地推荐</div>';
        }
    }).catch(() => {
        const meituanContent = document.getElementById("supply-meituan-content");
        if (meituanContent) meituanContent.innerHTML = '<div class="supply-loading">附近实时接口暂不可用，以下已切换本地推荐</div>';
    });

    const dynamicArea = document.getElementById("supply-dynamic");
    renderSupplyDynamic(dynamicArea, allData, coupons, false);
    bindSupplyEvents(container);
}

// ═══════════════════════
//  Dianping-Style Card Renderers
// ═══════════════════════

function renderStars(rating) {
    rating = Number(rating) || 4.0;
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '<span class="dp-stars">'
        + '★'.repeat(full)
        + (half ? '<span class="dp-star-half">★</span>' : '')
        + '<span class="dp-star-empty">' + '★'.repeat(empty) + '</span>'
        + '</span>';
}

function renderDianpingCard(item) {
    const rating = Number(item.rating) || 4.0;
    const reviewCount = Number(item.reviewCount) || 0;
    const distance = Number(item.distance) || 0;
    const stars = renderStars(rating);
    const deals = item.deals || [];
    const dealHtml = deals.length ? deals.map(d =>
        `<span class="dp-deal-tag">${d.desc} ¥${d.price}<s>¥${d.orig}</s></span>`
    ).join('') : '';

    const tagsHtml = (item.tags || []).slice(0, 3).map(t =>
        `<span class="dp-tag">${escapeHtml(t)}</span>`
    ).join('');

    const distKm = distance >= 1000 ? `${(distance/1000).toFixed(1)}km` : `${distance || 500}m`;

    const catLabel = {
        food: '美食', coffee: '咖啡', ticket: '景点', hotel: '酒店',
        shopping: '购物', entertainment: '休闲'
    }[item.category] || item.subcategory || '';

    // Use real image if available, otherwise gradient placeholder
    const safeName = item.name || "南京本地商家";
    const photoHtml = item.image
        ? `<img class="dp-photo-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(safeName)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'dp-photo-placeholder\\' style=\\'background:${categoryGradient(item.category)}\\'><span>${categoryIcon(item.category)}</span></div>'">`
        : `<div class="dp-photo-placeholder" style="background:${categoryGradient(item.category)};"><span>${categoryIcon(item.category)}</span></div>`;

    return `<div class="dp-card mucha-card" data-supply-id="${item.id}" data-type="${item.category}" data-store-id="${escapeHtml(item.id)}">
        <div class="dp-card-photo">
            ${photoHtml}
            ${item.deals && item.deals.length ? `<span class="dp-photo-badge">惠</span>` : ''}
            ${item.photos ? `<span class="dp-photo-count-tag">${item.photos}图</span>` : ''}
        </div>
        <div class="dp-card-body">
            <div class="dp-card-name">${escapeHtml(safeName)}</div>
            <div class="dp-card-rating">
                ${stars}
                <span class="dp-rating-num">${rating.toFixed(1)}</span>
                <span class="dp-review-count">${reviewCount ? formatReviewCount(reviewCount) + '条评论' : '暂无评论'}</span>
                <span class="dp-dist">${distKm}</span>
            </div>
            <div class="dp-card-meta">
                <span class="dp-cat-label">${catLabel}</span>
                ${item.district ? `<span class="dp-district">${escapeHtml(item.district)}</span>` : ''}
                ${item.avgPrice ? `<span class="dp-avg-price">人均 ¥${item.avgPrice}</span>` : ''}
            </div>
            <div class="dp-card-tags">${tagsHtml}</div>
            ${dealHtml ? `<div class="dp-card-deals">${dealHtml}</div>` : ''}
        </div>
    </div>`;
}

function categoryGradient(cat) {
    const map = {
        food: 'linear-gradient(135deg, #FFF1E0, #FFE0C0)',
        coffee: 'linear-gradient(135deg, #F0EBE3, #E8DCC8)',
        ticket: 'linear-gradient(135deg, #E8F0F8, #D0E0F0)',
        hotel: 'linear-gradient(135deg, #F0E8F5, #E0D0F0)',
        shopping: 'linear-gradient(135deg, #FFF0F5, #FFE0EA)',
        entertainment: 'linear-gradient(135deg, #F5F0E8, #EBE0D0)',
    };
    return map[cat] || 'linear-gradient(135deg, #F5F5F0, #EBEBE0)';
}

function categoryIcon(cat) {
    const map = {
        food: '🍜', coffee: '☕', ticket: '🏛', hotel: '🏨',
        shopping: '🛍', entertainment: '🎭'
    };
    return map[cat] || '📍';
}

function formatReviewCount(n) {
    if (n >= 10000) return (n/10000).toFixed(1) + '万';
    if (n >= 1000) return (n/1000).toFixed(1) + 'k';
    return String(n);
}

function renderDianpingCouponCard(coupon) {
    return `<div class="dp-coupon-card">
        <div class="dp-coupon-left">
            <span class="dp-coupon-icon">${coupon.icon}</span>
            <div class="dp-coupon-info">
                <span class="dp-coupon-name">${escapeHtml(coupon.name)}</span>
                <span class="dp-coupon-desc">${escapeHtml(coupon.desc)} · ${escapeHtml(coupon.shop)}</span>
                <div class="dp-coupon-meta">
                    <span class="dp-coupon-dist">📍 ${coupon.distance}m</span>
                    <span class="dp-coupon-sold">已售${formatReviewCount(coupon.sold)}</span>
                </div>
            </div>
        </div>
        <div class="dp-coupon-right">
            <div class="dp-coupon-price-row">
                <span class="dp-coupon-price">¥${coupon.price}</span>
                <span class="dp-coupon-orig">¥${coupon.origPrice}</span>
            </div>
            <span class="dp-coupon-discount">${coupon.discount}</span>
            <button class="dp-coupon-grab">抢购</button>
        </div>
    </div>`;
}

// Keep old renderers for backward compatibility
function renderSupplyCard(item) {
    return renderDianpingCard(item);
}

function renderCouponCard(coupon) {
    return renderDianpingCouponCard(coupon);
}

// Keep old data functions stubs for backward compatibility
function getSupplyItems(routeCtx) {
    if (typeof SUPPLY_DATA !== 'undefined') return SUPPLY_DATA.getFood().slice(0, 8);
    return [];
}
function getCoupons() {
    if (typeof SUPPLY_DATA !== 'undefined') return SUPPLY_DATA.getCoupons();
    return [];
}
function getPickupItems() { return []; }
function getExhibitionItems() {
    if (typeof SUPPLY_DATA !== 'undefined') return SUPPLY_DATA.getAttractions().slice(0, 4);
    return [];
}
function getRestItems() {
    if (typeof SUPPLY_DATA !== 'undefined') return SUPPLY_DATA.getHotels().slice(0, 4);
    return [];
}

// ═══════════════════════
//  Event Binding
// ═══════════════════════

function bindSupplyEvents(container) {
    // Need chip toggle
    container.querySelectorAll('.need-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            container.querySelectorAll('.need-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const need = chip.dataset.need;
            filterSupplyCards(container, need);
        });
    });

    // Radar stat click
    container.querySelectorAll('.radar-stat').forEach(stat => {
        stat.addEventListener('click', () => {
            const cat = stat.dataset.cat;
            const needMap = { food: 'food', coffee: 'drink', coupon: 'coupon', ticket: 'ticket', hotel: 'hotel' };
            const need = needMap[cat] || 'all';
            container.querySelectorAll('.need-chip').forEach(c => c.classList.remove('active'));
            const targetChip = container.querySelector(`.need-chip[data-need="${need}"]`);
            if (targetChip) targetChip.classList.add('active');
            filterSupplyCards(container, need);
        });
    });

    // "Add to route" and deal buttons
    container.querySelectorAll('.supply-btn-route').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showToast('已加入路线规划');
        });
    });

    // Coupon grab buttons
    container.querySelectorAll('.dp-coupon-grab, .coupon-grab, .supply-btn-coupon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showToast('优惠已复制，即将跳转购买页面');
        });
    });

    // Dianping card click -> show detail
    container.querySelectorAll('.dp-card, .supply-card').forEach(card => {
        card.style.cursor = "pointer";
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const storeId = card.dataset.storeId || card.dataset.supplyId;
            if (storeId) {
                showPoiDetailOverlayDianping(storeId);
            }
        });
    });
}

function filterSupplyCards(container, need) {
    const dynamicArea = document.getElementById("supply-dynamic");
    if (!dynamicArea) return;

    const allData = (typeof SUPPLY_DATA !== 'undefined') ? SUPPLY_DATA.getAll() : [];
    const coupons = (typeof SUPPLY_DATA !== 'undefined') ? SUPPLY_DATA.getCoupons() : [];

    // Map need to data filter
    let title = '';
    let items = [];
    let isCouponView = false;

    if (need === 'all') {
        // Restore original grouped view
        renderSupplyDynamic(dynamicArea, allData, coupons, false);
        return;
    } else if (need === 'food') {
        title = '全部美食 (' + allData.filter(i => i.category === 'food').length + '家)';
        items = allData.filter(i => i.category === 'food').sort((a,b) => b.rating - a.rating);
    } else if (need === 'drink') {
        title = '全部咖啡茶饮 (' + allData.filter(i => i.category === 'coffee').length + '家)';
        items = allData.filter(i => i.category === 'coffee').sort((a,b) => b.rating - a.rating);
    } else if (need === 'ticket') {
        title = '全部景点门票 (' + allData.filter(i => i.category === 'ticket').length + '家)';
        items = allData.filter(i => i.category === 'ticket').sort((a,b) => b.rating - a.rating);
    } else if (need === 'hotel') {
        title = '全部酒店住宿 (' + allData.filter(i => i.category === 'hotel').length + '家)';
        items = allData.filter(i => i.category === 'hotel').sort((a,b) => a.distance - b.distance);
    } else if (need === 'coupon') {
        title = '全部优惠券 (' + coupons.length + '张)';
        isCouponView = true;
    }

    let html = '';
    if (isCouponView) {
        html += `<div class="supply-group">
            <h3 class="supply-group-title">${title}</h3>
            <div class="coupon-scroll dianping-coupons" style="flex-wrap:wrap;overflow-x:visible;">${coupons.map(renderDianpingCouponCard).join('')}</div>
        </div>`;
    } else if (items.length) {
        html += `<div class="supply-group">
            <h3 class="supply-group-title">${title}</h3>
            <div class="supply-cards dianping-cards">${items.map(renderDianpingCard).join('')}</div>
        </div>`;
    } else {
        html += `<div class="supply-loading">暂无匹配商家</div>`;
    }

    dynamicArea.innerHTML = html;
    bindSupplyEvents(container);
}

// Extract dynamic content rendering so it can be reused
function renderSupplyDynamic(dynamicArea, allData, coupons, fullView) {
    let dynamicHtml = '';

    if (!fullView) {
        // Default grouped view: nearby + on-route + hot picks + attractions + coupons + hotels
        const nearby = allData.filter(i => i.distance < 600).sort((a,b) => a.distance - b.distance);
        if (nearby.length) {
            const show = fullView ? nearby : nearby.slice(0, 8);
            dynamicHtml += `<div class="supply-group">
                <h3 class="supply-group-title">步行可达 <span class="group-badge">${nearby.length}家附近好店</span></h3>
                <div class="supply-cards dianping-cards">${show.map(renderDianpingCard).join('')}</div>
            </div>`;
        }

        const onRoute = allData.filter(i => i.onRoute && i.distance >= 600).sort((a,b) => a.distance - b.distance);
        if (onRoute.length) {
            const show = onRoute.slice(0, 6);
            dynamicHtml += `<div class="supply-group">
                <h3 class="supply-group-title">顺路不错过 <span class="group-badge">${onRoute.length}家顺路好店</span></h3>
                <div class="supply-cards dianping-cards">${show.map(renderDianpingCard).join('')}</div>
            </div>`;
        }

        const hot = allData.filter(i => i.distance >= 600).sort((a,b) => b.rating - a.rating);
        if (hot.length) {
            const show = hot.slice(0, 6);
            dynamicHtml += `<div class="supply-group">
                <h3 class="supply-group-title">全城口碑推荐 <span class="group-badge">评分最高</span></h3>
                <div class="supply-cards dianping-cards">${show.map(renderDianpingCard).join('')}</div>
            </div>`;
        }
    }

    const attractions = allData.filter(i => i.category === 'ticket').sort((a,b) => b.rating - a.rating);
    if (attractions.length && !fullView) {
        const show = attractions.slice(0, 6);
        dynamicHtml += `<div class="supply-group">
            <h3 class="supply-group-title">景点门票 <span class="group-badge">${attractions.length}个目的地</span></h3>
            <div class="supply-cards dianping-cards">${show.map(renderDianpingCard).join('')}</div>
        </div>`;
    }

    if (coupons.length) {
        const showCoupons = coupons.slice(0, fullView ? coupons.length : 12);
        dynamicHtml += `<div class="supply-group">
            <h3 class="supply-group-title">今日特惠 <span class="savings-badge">${coupons.length}张可用</span></h3>
            <div class="coupon-scroll dianping-coupons">${showCoupons.map(renderDianpingCouponCard).join('')}</div>
        </div>`;
    }

    const routeContext = (currentRouteKey && routes[currentRouteKey]) ? routes[currentRouteKey] : null;
    if (routeContext && !fullView) {
        const hotels = allData.filter(i => i.category === 'hotel').sort((a,b) => a.distance - b.distance);
        if (hotels.length) {
            const show = hotels.slice(0, 4);
            dynamicHtml += `<div class="supply-group supply-group-rest">
                <h3 class="supply-group-title">路线终点休整</h3>
                <p class="supply-group-hint">走完后，找个舒服的地方休息</p>
                <div class="supply-cards dianping-cards">${show.map(renderDianpingCard).join('')}</div>
            </div>`;
        }
    }

    dynamicArea.innerHTML = dynamicHtml;
}

function showAddToRouteOptions(supplyId, btn) {
    const btnRect = btn.getBoundingClientRect();
    const existing = document.querySelector('.add-route-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.className = 'add-route-popup';
    popup.style.cssText = `position:fixed;top:${btnRect.top - 200}px;left:${btnRect.left}px;z-index:999;`;
    popup.innerHTML = `
        <div class="add-route-popup-inner">
            <p class="popup-title">加入到哪里？</p>
            <button class="popup-opt" data-pos="after-current">📍 当前点后</button>
            <button class="popup-opt" data-pos="before-next">🛤 下一站前</button>
            <button class="popup-opt" data-pos="as-end">🏁 作为终点</button>
            <button class="popup-opt" data-pos="replace">🔄 替换当前餐饮点</button>
            <button class="popup-cancel">取消</button>
        </div>
    `;
    document.body.appendChild(popup);

    popup.querySelectorAll('.popup-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            popup.remove();
            btn.textContent = '✓ 已加入';
            btn.style.background = 'var(--wutong)';
            btn.style.color = '#fff';
            btn.disabled = true;
            showToast('✅ 已加入路线！路线已更新');
        });
    });
    popup.querySelector('.popup-cancel').addEventListener('click', () => popup.remove());
    popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
}

// Budget & savings tracking
let userBudget = 80;
let totalSaved = 18;

// ═══════════════════════
//  Route Detail "沿途补给" Entry
// ═══════════════════════

function addSupplyEntryToRouteSheet(sheetBody, routeKey) {
    const entry = document.createElement('div');
    entry.className = 'route-supply-entry';
    entry.innerHTML = `
        <div class="supply-entry-icon">🧭</div>
        <div class="supply-entry-text">
            <span class="supply-entry-title">沿途补给推荐</span>
            <span class="supply-entry-desc">晚饭 3家 · 咖啡 2家 · 小吃券 6张 · 休息点 2个</span>
        </div>
        <span class="supply-entry-arrow">›</span>
    `;
    entry.addEventListener('click', () => {
        document.querySelector('.route-sheet').classList.remove('open');
        switchTab('nearby');
    });
    sheetBody.appendChild(entry);
}

function addHomeSupplyEntry() {
    if (document.querySelector('.home-supply-entry')) return;
    const guideBlock = document.getElementById('guide-block');
    if (!guideBlock) return;

    const entry = document.createElement('div');
    entry.className = 'home-supply-entry mucha-card';
    entry.innerHTML = `
        <div class="home-supply-icon">🧭</div>
        <div class="home-supply-text">
            <span class="home-supply-label">城市补给站</span>
            <span class="home-supply-title-text">吃饭、咖啡、门票、休息点</span>
            <span class="home-supply-desc">一键加入路线</span>
        </div>
        <span style="font-size:18px;color:var(--faint);">›</span>
    `;
    entry.addEventListener('click', () => switchTab('nearby'));
    guideBlock.before(entry);
}

// ═══════════════════════════════════════════
//  Pet System Homepage · 宠物系统首页
//  绣球花中心视觉 · Hydrangea Flower
// ═══════════════════════════════════════════

function renderPetTab(container) {
    pet77Data = loadPet77Data();

    container.innerHTML = `
        <div class="pet-home">
            <div class="pet77-home-panel">
                <div class="pet77-preview">
                    <div class="pet77-preview-sprite" id="pet77-preview-sprite" aria-label="77 预览"></div>
                    <div class="pet77-preview-shadow"></div>
                </div>
                <div class="pet77-info">
                    <div class="pet77-kicker">常驻桌宠 V2</div>
                    <h2>77</h2>
                    <p>77 是一只安静又黏人的南京小旅伴，会记得你的路线、心情和每一次摸摸。</p>
                    <label class="pet77-toggle-row">
                        <input type="checkbox" id="pet77-visible-toggle" ${pet77Data.visible ? "checked" : ""}>
                        <span>前端常驻显示 77</span>
                    </label>
                </div>
            </div>

            <div class="pet77-growth-card">
                <div class="pet77-meter-row">
                    <div>
                        <span class="pet77-meter-label">亲密度</span>
                        <strong><span id="pet77-intimacy-value">${pet77Data.intimacy}</span>/100</strong>
                    </div>
                    <span class="pet77-pill" id="pet77-stage-title">${getPet77IntimacyTitle()}</span>
                </div>
                <div class="pet77-meter"><i id="pet77-intimacy-bar" style="width:${pet77Data.intimacy}%"></i></div>
                <div class="pet77-meter-row">
                    <div>
                        <span class="pet77-meter-label">开心值</span>
                        <strong><span id="pet77-happiness-value">${pet77Data.happiness}</span>/100</strong>
                    </div>
                    <span class="pet77-pill warm" id="pet77-mood-title">${getPet77MoodTitle()}</span>
                </div>
                <div class="pet77-meter mood"><i id="pet77-happiness-bar" style="width:${pet77Data.happiness}%"></i></div>
                <div class="pet77-daily" id="pet77-daily-actions"></div>
            </div>

            <div class="pet77-actions">
                <button class="pet77-action-btn" onclick="petActionPetting()">
                    <span class="pet-action-icon">♡</span>
                    <span class="pet-action-label">抚摸</span>
                </button>
                <button class="pet77-action-btn" onclick="petActionFeed()">
                    <span class="pet-action-icon">+</span>
                    <span class="pet-action-label">喂食</span>
                </button>
                <button class="pet77-action-btn" onclick="petActionTalk()">
                    <span class="pet-action-icon">…</span>
                    <span class="pet-action-label">聊天</span>
                </button>
                <button class="pet77-action-btn" onclick="petActionSleep()">
                    <span class="pet-action-icon">z</span>
                    <span class="pet-action-label">休息</span>
                </button>
                <button class="pet77-action-btn" onclick="petActionSummon()">
                    <span class="pet-action-icon">↗</span>
                    <span class="pet-action-label">召唤</span>
                </button>
            </div>

            <div class="pet-collection">
                <h3 class="pet-collection-title">旅伴 <span class="pet-count">${PET_DEFS.length} 位</span></h3>
                <div class="pet-collection-grid">
                    ${/* Keep the original companion slots and data hooks for future asset unlocks. */ ""}
                    ${PET_DEFS.map(p => {
                        const unlocked = isPetUnlocked(p.id);
                        return `<div class="pet-collection-item pet-placeholder${unlocked ? '' : ' locked'}"
                            data-pet="${p.id}"
                            onclick="showToast('这个旅伴还没有解锁')">
                            <span class="pet-col-emoji">?</span>
                            <span class="pet-col-name">${p.name}</span>
                            <span class="pet-col-active">待解锁</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>`;

    document.getElementById("pet77-visible-toggle")?.addEventListener("change", (e) => {
        setPet77Visibility(e.target.checked);
    });
    syncPet77Panels();
    const previewSpec = PET77_ANIMATIONS[pet77State] || PET77_ANIMATIONS.idle;
    setPet77Frame(previewSpec.row, clampNumber(pet77FrameIndex || 0, 0, previewSpec.frameCount - 1));
}

// ── Pet action handlers ──
function petActionPetting() {
    pet77ApplyAction("petting");
}
function petActionFeed() {
    showPet77FeedMenu(document.activeElement);
}
function petActionTalk() {
    pet77ApplyAction("talk", { skipToast: true, bubbleMessage: "我在，想聊什么？" });
    openPet77Chat();
}
function petActionExplore() {
    setPet77State("thinking");
    setPetState("guiding");
    showToast("🗺 " + currentPet.name + "想带你出去走走！去首页选一条路线吧~");
    setTimeout(() => switchTab("home"), 800);
}
function petActionSleep() {
    pet77ApplyAction("sleep");
}
function petActionSummon() {
    pet77ApplyAction("summon");
}
function refreshPetStatusCard() {
    syncPet77Panels();
}

function getUserProfile() {
    const defaults = {
        userId: 1,
        name: "旅行者",
        tagline: "南京城市探索中",
        avatarUrl: "",
        loggedIn: true,
        lastLoginAt: new Date().toISOString(),
    };
    try {
        return Object.assign(defaults, JSON.parse(localStorage.getItem(USER_PROFILE_STORAGE_KEY) || "{}"));
    } catch {
        return defaults;
    }
}

function saveUserProfile(profile) {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(Object.assign(getUserProfile(), profile || {})));
}

function renderProfileAvatar(profile, fallbackIcon) {
    if (profile.avatarUrl) {
        return `<img class="profile-avatar-img" src="${escapeHtml(profile.avatarUrl)}" alt="用户头像">`;
    }
    return `<span class="profile-avatar-fallback">${fallbackIcon}</span>`;
}

function bindProfileAvatarUpload(container) {
    const input = container.querySelector("#profile-avatar-input");
    if (!input) return;
    input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast("请选择图片文件");
            return;
        }
        if (file.size > 1024 * 1024 * 2) {
            showToast("头像图片请控制在 2MB 内");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            saveUserProfile({ avatarUrl: reader.result, loggedIn: true, lastLoginAt: new Date().toISOString() });
            renderProfileTab(container);
            showToast("头像已更新");
        };
        reader.readAsDataURL(file);
    });
}

function openSettingsDrawer() {
    let overlay = document.getElementById("settings-drawer-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "settings-drawer-overlay";
        overlay.className = "settings-drawer-overlay";
        overlay.innerHTML = `
            <aside class="settings-drawer" onclick="event.stopPropagation()">
                <div class="settings-drawer-header">
                    <div>
                        <span class="settings-drawer-kicker">Settings</span>
                        <h3>设置</h3>
                    </div>
                    <button class="settings-drawer-close" type="button" aria-label="关闭设置">×</button>
                </div>
                <div class="settings-drawer-list">
                    <button class="settings-item" type="button" data-setting="account"><span>账户管理</span><i>›</i></button>
                    <button class="settings-item" type="button" data-setting="cache"><span>缓存清理</span><i>›</i></button>
                    <button class="settings-item" type="button" data-setting="github"><span>GitHub 仓库地址</span><i>›</i></button>
                    <button class="settings-item" type="button" data-setting="privacy"><span>安全隐私</span><i>›</i></button>
                    <button class="settings-item danger" type="button" data-setting="logout"><span>退出登录</span><i>›</i></button>
                </div>
                <div class="settings-detail" id="settings-detail"></div>
            </aside>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", closeSettingsDrawer);
        overlay.querySelector(".settings-drawer-close").addEventListener("click", closeSettingsDrawer);
        overlay.querySelectorAll(".settings-item").forEach(btn => {
            btn.addEventListener("click", () => showSettingsDetail(btn.dataset.setting));
        });
    }
    overlay.classList.add("open");
    showSettingsDetail("account");
}

function closeSettingsDrawer() {
    document.getElementById("settings-drawer-overlay")?.classList.remove("open");
}

function showSettingsDetail(type) {
    const detail = document.getElementById("settings-detail");
    if (!detail) return;
    const profile = getUserProfile();
    if (type === "account") {
        detail.innerHTML = `
            <div class="settings-detail-card">
                <h4>账户管理</h4>
                <label class="settings-field">
                    <span>昵称</span>
                    <input id="settings-name-input" type="text" value="${escapeHtml(profile.name)}" maxlength="16">
                </label>
                <p>用户 ID：${profile.userId} · ${profile.loggedIn ? "已登录" : "已退出"}</p>
                <button class="settings-primary" type="button" id="settings-save-account">保存账户</button>
            </div>
        `;
        detail.querySelector("#settings-save-account").addEventListener("click", () => {
            const name = detail.querySelector("#settings-name-input").value.trim() || "旅行者";
            saveUserProfile({ name, loggedIn: true, lastLoginAt: new Date().toISOString() });
            const profileTab = document.getElementById("tab-profile-inner");
            if (profileTab) renderProfileTab(profileTab);
            showToast("账户信息已保存");
            showSettingsDetail("account");
        });
        return;
    }
    if (type === "cache") {
        detail.innerHTML = `
            <div class="settings-detail-card">
                <h4>缓存清理</h4>
                <p>将清理临时面板位置、会话缓存和页面临时状态，保留头像、登录资料、路线与宠物成长数据。</p>
                <button class="settings-primary" type="button" id="settings-clear-cache">清理缓存</button>
            </div>
        `;
        detail.querySelector("#settings-clear-cache").addEventListener("click", clearAppCache);
        return;
    }
    if (type === "github") {
        detail.innerHTML = `
            <div class="settings-detail-card">
                <h4>GitHub 仓库地址</h4>
                <p>${APP_GITHUB_URL ? escapeHtml(APP_GITHUB_URL) : "暂未配置仓库地址，可在 APP_GITHUB_URL 中填写。"}</p>
                <button class="settings-primary" type="button" id="settings-open-github">${APP_GITHUB_URL ? "打开仓库" : "复制占位地址"}</button>
            </div>
        `;
        detail.querySelector("#settings-open-github").addEventListener("click", () => {
            if (APP_GITHUB_URL) {
                window.open(APP_GITHUB_URL, "_blank", "noopener");
            } else {
                navigator.clipboard?.writeText("APP_GITHUB_URL").catch(() => {});
                showToast("仓库地址未配置，已复制配置项名称");
            }
        });
        return;
    }
    if (type === "privacy") {
        detail.innerHTML = `
            <div class="settings-detail-card">
                <h4>安全隐私</h4>
                <p>头像和偏好仅保存在当前浏览器本地；AI 聊天只在发送消息时请求内置接口。</p>
                <button class="settings-primary" type="button" id="settings-reset-avatar">移除本地头像</button>
            </div>
        `;
        detail.querySelector("#settings-reset-avatar").addEventListener("click", () => {
            saveUserProfile({ avatarUrl: "" });
            const profileTab = document.getElementById("tab-profile-inner");
            if (profileTab) renderProfileTab(profileTab);
            showToast("本地头像已移除");
        });
        return;
    }
    if (type === "logout") {
        detail.innerHTML = `
            <div class="settings-detail-card danger">
                <h4>退出登录</h4>
                <p>退出后会保留头像、路线、成就和宠物数据，下次进入可在账户管理中恢复登录状态。</p>
                <button class="settings-danger" type="button" id="settings-logout-confirm">确认退出</button>
            </div>
        `;
        detail.querySelector("#settings-logout-confirm").addEventListener("click", () => {
            saveUserProfile({ loggedIn: false, lastLogoutAt: new Date().toISOString() });
            const profileTab = document.getElementById("tab-profile-inner");
            if (profileTab) renderProfileTab(profileTab);
            showToast("已退出登录");
            closeSettingsDrawer();
        });
    }
}

function clearAppCache() {
    sessionStorage.clear();
    localStorage.removeItem(PET77_CHAT_LAYOUT_KEY);
    localStorage.removeItem("nj_temp_route_preview");
    localStorage.removeItem("nj_meituan_cache");
    showToast("缓存已清理，用户资料已保留");
}

function renderProfileTab(container) {
    const persona = personaCards.find(p => p.id === selectedPersonaId);
    const personaName = persona ? persona.title : "未选择";
    const personaIcon = persona ? persona.elements[0].emoji : "👤";
    const profile = getUserProfile();
    const unlockedData = getAchievements();
    const achievements = ACHIEVEMENT_DEFS;
    const unlockedCount = achievements.filter(a => unlockedData[a.id]).length;

    container.innerHTML =
        `<div class="profile-section">
            <div class="profile-card">
                <label class="profile-avatar uploadable" title="上传头像">
                    ${renderProfileAvatar(profile, personaIcon)}
                    <input id="profile-avatar-input" type="file" accept="image/*">
                    <span class="profile-avatar-edit">更换</span>
                </label>
                <div class="profile-info">
                    <div class="profile-name">${escapeHtml(profile.name)}</div>
                    <div class="profile-tag">${escapeHtml(profile.tagline)} · ${profile.loggedIn ? "已登录" : "未登录"}</div>
                    <div class="persona-badge">
                        <span>${personaIcon}</span>
                        <span>${personaName}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="profile-section">
            <button class="profile-menu-item" onclick="showMyRoutes()" style="border-radius:16px;border:1px solid var(--rule);padding:16px;background:var(--surface);margin-bottom:10px;display:flex;align-items:center;gap:12px;width:100%;font-family:inherit;font-size:14px;color:var(--ink);cursor:pointer;">
                <span class="menu-icon" style="font-size:22px;">📋</span>
                <span class="menu-text" style="flex:1;font-weight:500;">我的路线</span>
                <span class="menu-arrow" style="color:var(--faint);">›</span>
            </button>
        </div>

        <div class="profile-section">
            <div class="profile-menu">
                <button class="profile-menu-item" onclick="reSelectPersona()">
                    <span class="menu-icon">🎨</span>
                    <span class="menu-text">重新选择人格</span>
                    <span class="menu-arrow">›</span>
                </button>
                <button class="profile-menu-item" onclick="showToast('📖 版本 1.0 · 2026 EL')">
                    <span class="menu-icon">ℹ️</span>
                    <span class="menu-text">关于应用</span>
                    <span class="menu-arrow">›</span>
                </button>
                <button class="profile-menu-item" onclick="openSettingsDrawer()">
                    <span class="menu-icon">⚙</span>
                    <span class="menu-text">设置</span>
                    <span class="menu-arrow">›</span>
                </button>
            </div>
        </div>

        <div class="profile-section">
            <div class="profile-achievements">
                <div class="profile-section-header">
                    <span class="profile-section-title">🏆 成就</span>
                    <span class="profile-section-count">${unlockedCount}/${achievements.length}</span>
                </div>
                <div class="profile-achievement-grid">
                    ${achievements.map(a => {
                        const isUnlocked = !!unlockedData[a.id];
                        return `<div class="profile-achievement-item${isUnlocked ? '' : ' locked'}">
                            <span class="pa-icon">${a.icon}</span>
                            <span class="pa-name">${a.name}</span>
                            <span class="pa-badge">${isUnlocked ? '✓' : '🔒'}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>`;
    bindProfileAvatarUpload(container);
}

// ═══════════════════════════════════════
//  Re-select Persona
// ═══════════════════════════════════════

function reSelectPersona() {
    // Reset state so showPersonaPage() can be called again
    personaSwiperShown = false;
    mainPageShown = false;
    enteredApp = false;

    // Hide main page
    mainPage.classList.remove("visible");
    mainPage.style.display = "none";

    // Reset swiper container
    swiperContainer.innerHTML = "";
    swiperContainer.removeEventListener("scroll", onSwiperScroll);

    // Swiper UI reset
    const tut = document.getElementById("swiper-tutorial");
    if (tut) { tut.style.display = ""; tut.classList.remove("show"); }

    // Close any open sheets/overlays
    closeSheet();
    document.querySelectorAll(".open").forEach(el => el.classList.remove("open"));

    // Reset AMap for re-init with new persona
    if (amapInstance) {
        amapInstance.destroy();
        amapInstance = null;
    }
    document.getElementById("main-map-container")?.classList.remove("amap-fullscreen");
    amapReady = false;
    amapInitializing = false;
    amapRouteLines = [];
    amapMarkers = [];
    amapFullscreen = false;

    // Hide AI chat
    if (aiChatOpen) toggleAiChat();

    // Show persona page after brief delay
    setTimeout(() => showPersonaPage(), 300);
}

// ═══════════════════════════════════════
//  My Routes — popup showing saved routes
// ═══════════════════════════════════════

function showMyRoutes() {
    // Remove existing overlay
    const existing = document.querySelector(".my-routes-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "my-routes-overlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:300;background:rgba(26,28,27,0.35);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;";
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

    const sheet = document.createElement("div");
    sheet.style.cssText = "width:100%;max-height:85%;background:var(--stone);border-radius:20px 20px 0 0;padding:24px 20px 36px;animation:rise 0.3s ease;overflow-y:auto;";

    // Try to load from API first, fallback to local
    Promise.all([
        fetch("/api/user-routes?userId=1").then(r => r.json()).then(d => d.data || []).catch(() => []),
        Promise.resolve().then(() => { try { return JSON.parse(localStorage.getItem("nj_saved_routes") || "[]"); } catch(e) { return []; } })
    ]).then(([apiRoutes, localRoutes]) => {
        let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
                <div style="font-family:'Noto Serif SC',serif;font-size:20px;font-weight:500;color:var(--ink);">📋 我的路线</div>
                <div style="font-size:12px;color:var(--soft);margin-top:4px;">${apiRoutes.length + localRoutes.length} 条已保存路线</div>
            </div>
            <button onclick="showCreateRouteForm()" style="padding:8px 16px;border-radius:999px;background:var(--nju-purple);color:#fff;font-size:12px;font-weight:600;border:none;cursor:pointer;">+ 新建路线</button>
        </div>`;

        if (apiRoutes.length === 0 && localRoutes.length === 0) {
            html += `<div style="text-align:center;padding:40px 20px;color:var(--faint);font-size:14px;">
                <div style="font-size:48px;margin-bottom:12px;">🗺</div>
                <p>还没有保存的路线</p>
                <p style="font-size:12px;margin-top:4px;">探索路线后点击「存入我的路线」即可保存</p>
            </div>`;
        } else {
            // API routes (from database)
            apiRoutes.forEach(ur => {
                html += renderMyRouteItem(ur.userRouteId, ur.title || "我的路线", ur.description || "", ur.createdAt || "", false);
            });
            // Local routes (from localStorage)
            localRoutes.forEach(lr => {
                html += renderMyRouteItem(null, lr.title || "离线路线", "离线保存", lr.savedAt || "", true);
            });
        }

        html += `<button onclick="this.closest('.my-routes-overlay').remove()" style="display:block;width:100%;padding:10px;margin-top:12px;border-radius:999px;border:1px solid var(--rule);background:transparent;font-size:13px;color:var(--soft);cursor:pointer;font-family:inherit;">关闭</button>`;

        sheet.innerHTML = html;
        overlay.appendChild(sheet);
        document.body.appendChild(overlay);
    });
}

function renderMyRouteItem(routeId, title, desc, date, isLocal) {
    const dateStr = date ? new Date(date).toLocaleDateString("zh-CN") : "";
    const idAttr = routeId ? `data-route-id="${routeId}"` : "";
    const clickAction = routeId
        ? `onclick="event.stopPropagation();fetchCustomRouteDetail(${routeId})"`
        : `onclick="showToast('🗺 离线路线 - 仅本地保存')"`;
    return `<div ${idAttr} ${clickAction} style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:12px;background:var(--surface);border:1px solid var(--rule);margin-bottom:8px;cursor:pointer;">
        <span style="font-size:24px;">${isLocal ? '💾' : '📍'}</span>
        <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(title)}</div>
            <div style="font-size:11px;color:var(--faint);margin-top:2px;">${escapeHtml(desc)}${dateStr ? ' · ' + dateStr : ''}</div>
        </div>
        <span style="color:var(--faint);font-size:16px;">›</span>
    </div>`;
}

async function fetchCustomRouteDetail(routeId) {
    try {
        const resp = await fetch(`/api/user-routes/${routeId}/detail`);
        const data = await resp.json();
        if (data.code === 200) {
            showCustomRouteDetail(data.data);
        } else {
            showToast("❌ 加载失败");
        }
    } catch(e) {
        showToast("❌ 网络错误");
    }
}

function showCustomRouteDetail(detail) {
    // Close the my-routes overlay
    document.querySelector(".my-routes-overlay")?.remove();

    const sheetBody = document.getElementById("sheet-body");
    const sheet = document.getElementById("route-sheet");

    const stops = detail.stops || [];
    const stopsHtml = stops.length > 0
        ? stops.map((s, i) => `
            <div class="stop" style="cursor:default;">
                <span class="stop-num">${String(i + 1).padStart(2, "0")}</span>
                <div class="stop-text">
                    <h4>${escapeHtml(s.name || '站点' + (i+1))}</h4>
                    <p>${escapeHtml(s.detail || '')}${s.latitude ? ' (' + s.latitude.toFixed(4) + ', ' + s.longitude.toFixed(4) + ')' : ''}</p>
                </div>
            </div>
        `).join("")
        : '<div style="text-align:center;color:var(--faint);padding:20px;">暂无站点信息</div>';

    sheetBody.innerHTML = `
        <p class="tag">我的路线</p>
        <h3>${escapeHtml(detail.title || '自定义路线')}</h3>
        <p class="desc">${escapeHtml(detail.description || '')}</p>
        <div class="sheet-meta">
            <span>${stops.length} 站</span>
            <span>${detail.createdAt ? new Date(detail.createdAt).toLocaleDateString("zh-CN") : ''}</span>
        </div>
        <div class="stops">${stopsHtml}</div>
        <div class="route-actions">
            <button class="route-action-btn danger-action" onclick="deleteCustomRoute(${detail.userRouteId})">
                <span class="icon">🗑️</span>
                <span class="label">删除路线</span>
            </button>
        </div>
        <button class="sheet-close">收起</button>
    `;

    sheet.classList.add("open");
}

async function deleteCustomRoute(userRouteId) {
    if (!confirm("确定要删除这条路线吗？此操作不可撤销。")) return;
    try {
        const resp = await fetch(`/api/user-routes/${userRouteId}?userId=1`, { method: "DELETE" });
        const data = await resp.json();
        if (data.code === 200) {
            showToast("🗑️ 路线已删除");
            document.getElementById("route-sheet").classList.remove("open");
        } else {
            showToast("❌ 删除失败");
        }
    } catch(e) {
        showToast("❌ 网络错误");
    }
}

// ═══════════════════════════════════════
//  Create Route Form
// ═══════════════════════════════════════

function showCreateRouteForm() {
    // Close my-routes overlay if open
    const existing = document.querySelector(".my-routes-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "create-route-overlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:310;background:rgba(26,28,27,0.35);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;";
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeCreateRoute(overlay); });

    overlay.innerHTML = `
    <div class="invite-sheet" style="background:var(--stone);" onclick="event.stopPropagation()">
        <p class="title">✏️ 创建自定义路线</p>
        <p class="subtitle">设计你自己的南京探索路线</p>
        <div class="invite-form">
            <label>路线名称</label>
            <input type="text" id="create-route-title" placeholder="如：我的午后漫步" />

            <label>路线描述</label>
            <input type="text" id="create-route-desc" placeholder="一句话描述..." />

            <label>路线时长（分钟）</label>
            <input type="number" id="create-route-duration" placeholder="如：120" />

            <label>基于已有路线（可选）</label>
            <select id="create-route-source" style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--rule);background:var(--surface);font-size:14px;font-family:inherit;outline:none;">
                <option value="">全新路线</option>
                <option value="nju">南大校史线</option>
                <option value="night">秦淮夜游</option>
                <option value="food">午后餐茶</option>
                <option value="expo">博物馆展览</option>
            </select>

            <div class="form-actions">
                <button class="btn-primary" onclick="submitCreateRoute()">✨ 创建路线</button>
                <button class="btn-cancel" onclick="closeCreateRoute(this.closest('.create-route-overlay'))">取消</button>
            </div>
        </div>
    </div>`;
    document.body.appendChild(overlay);
}

function closeCreateRoute(overlay) {
    if (overlay) overlay.remove();
}

function submitCreateRoute() {
    const title = document.getElementById("create-route-title").value.trim();
    const desc = document.getElementById("create-route-desc").value.trim();
    const duration = parseInt(document.getElementById("create-route-duration").value) || 120;
    const sourceKey = document.getElementById("create-route-source").value;
    const sourceRouteId = sourceKey ? (ROUTE_KEY_TO_ID[sourceKey] || 1) : null;

    if (!title) { showToast("请填写路线名称"); return; }

    const body = {
        userId: 1,
        sourceRouteId: sourceRouteId,
        title: title,
        description: desc || "我的自定义路线",
        isPublic: false,
        pointIds: []
    };

    fetch("/api/user-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(r => r.json())
    .then(data => {
        if (data.code === 200) {
            showToast("✅ 路线已创建！前往「我的路线」查看");
            unlockAchievement("collector");
            document.querySelectorAll(".create-route-overlay, .my-routes-overlay").forEach(el => el.remove());
        } else {
            showToast("❌ 创建失败");
        }
    })
    .catch(() => {
        // Offline fallback
        let saved = [];
        try { saved = JSON.parse(localStorage.getItem("nj_saved_routes") || "[]"); } catch(e) {}
        saved.push({ key: "custom_" + Date.now(), title: title + "（自定义）", savedAt: new Date().toISOString() });
        localStorage.setItem("nj_saved_routes", JSON.stringify(saved));
        showToast("✅ 路线已离线创建");
        unlockAchievement("collector");
        document.querySelectorAll(".create-route-overlay, .my-routes-overlay").forEach(el => el.remove());
    });
}

// ═══════════════════════════════════════
//  Custom Route Upload Form (自主上传路线)
// ═══════════════════════════════════════

function showUploadRouteForm() {
    const existing = document.querySelector(".upload-route-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "upload-route-overlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:320;background:rgba(26,28,27,0.35);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;";
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.innerHTML = `
    <div class="invite-sheet" style="background:var(--stone);" onclick="event.stopPropagation()">
        <p class="title">🗺️ 自主上传路线</p>
        <p class="subtitle">创建你自己的南京探索路线，分享给朋友</p>
        <div class="invite-form">
            <label>路线名称 <span style="color:#E07A5F;">*</span></label>
            <input type="text" id="upload-route-title" placeholder="如：我的梧桐漫步路线" />

            <label>路线描述</label>
            <input type="text" id="upload-route-desc" placeholder="一句话描述这条路线..." />

            <div class="form-row">
                <div>
                    <label>预计时长（分钟）</label>
                    <input type="number" id="upload-route-duration" placeholder="如：120" value="120" />
                </div>
                <div>
                    <label>预估花费 (¥)</label>
                    <input type="text" id="upload-route-budget" placeholder="如：50-100" value="自由预算" />
                </div>
            </div>

            <label>路线站点 <span style="color:#8B939E;font-size:11px;">（每行一个站点，格式：站点名 - 简短描述）</span></label>
            <textarea id="upload-route-stops" rows="5" placeholder="街角咖啡馆 - 从一杯手冲开始&#10;独立书店 - 找一个靠窗的位置&#10;梧桐小径 - 阳光穿过树叶&#10;晚餐小馆 - 一顿刚好的晚饭"
                style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--rule);background:var(--surface);font-size:13px;font-family:inherit;outline:none;resize:vertical;line-height:1.6;"></textarea>

            <div class="form-actions">
                <button class="btn-primary" onclick="submitUploadRoute()">✨ 上传路线</button>
                <button class="btn-cancel" onclick="document.querySelector('.upload-route-overlay')?.remove()">取消</button>
            </div>
        </div>
    </div>`;
    document.body.appendChild(overlay);
}

function submitUploadRoute() {
    const title = document.getElementById("upload-route-title").value.trim();
    const desc = document.getElementById("upload-route-desc").value.trim();
    const duration = parseInt(document.getElementById("upload-route-duration").value) || 120;
    const budget = document.getElementById("upload-route-budget").value.trim() || "自由预算";
    const stopsRaw = document.getElementById("upload-route-stops").value.trim();

    if (!title) { showToast("请填写路线名称"); return; }

    // Parse stops: each line → { name, detail }
    const stops = stopsRaw ? stopsRaw.split("\n").filter(line => line.trim()).map(line => {
        const parts = line.split(/[-–—]/);
        if (parts.length >= 2) {
            return { name: parts[0].trim(), detail: parts.slice(1).join("-").trim() };
        }
        return { name: line.trim(), detail: "" };
    }) : [];

    if (stops.length === 0) {
        showToast("请至少填写一个路线站点"); return;
    }

    const routeId = ++CUSTOM_ROUTE_COUNTER;
    const key = "custom_" + routeId;
    const now = new Date().toISOString();

    // Add to routes object
    routes[key] = {
        title: title,
        desc: desc || "我的自定义路线",
        meta: [duration + " 分钟", "自由探索", budget],
        duration: duration,
        stops: stops,
        isCustom: true,
        budget: budget
    };

    // Save to custom routes storage
    customRoutes[key] = {
        id: routeId,
        title: title,
        desc: desc || "",
        duration: duration,
        budget: budget,
        stops: stops,
        createdAt: now
    };
    saveCustomRoutesToStorage();

    // Also save to nj_saved_routes for "我的路线" compatibility
    try {
        let saved = JSON.parse(localStorage.getItem("nj_saved_routes") || "[]");
        saved.push({ key: key, title: title + "（自定义）", savedAt: now });
        localStorage.setItem("nj_saved_routes", JSON.stringify(saved));
    } catch(e) {}

    // Close overlay
    document.querySelectorAll(".upload-route-overlay").forEach(el => el.remove());

    // Re-render grid
    renderRouteGrid();

    // Show toast
    showToast("✅ 路线「" + title + "」已上传！在路线列表中查看");

    // Unlock collector achievement if applicable
    if (Object.keys(customRoutes).length >= 1) {
        unlockAchievement("collector");
    }
}

// ═══════════════════════════════════════
//  Delete Custom Route
// ═══════════════════════════════════════

function handleDeleteCustomRoute(key) {
    if (!customRoutes[key]) return;
    const r = routes[key];
    if (!r) return;

    if (!confirm("确定要删除路线「" + r.title + "」吗？此操作不可撤销。")) return;

    // Remove from routes object
    delete routes[key];

    // Remove from customRoutes
    delete customRoutes[key];
    saveCustomRoutesToStorage();

    // Remove from nj_saved_routes
    try {
        let saved = JSON.parse(localStorage.getItem("nj_saved_routes") || "[]");
        saved = saved.filter(s => s.key !== key);
        localStorage.setItem("nj_saved_routes", JSON.stringify(saved));
    } catch(e) {}

    // Close sheet & re-render
    closeSheet();
    renderRouteGrid();
    showToast("🗑️ 路线已删除");
}

function handleSaveRoute(routeKey) {
    const r = routes[routeKey];
    if (!r) return;
    const routeId = ROUTE_KEY_TO_ID[routeKey] || 1;

    fetch("/api/user-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: 1,
            sourceRouteId: routeId,
            title: r.title + "（已探索）",
            description: "我体验过的路线",
            isPublic: false,
            pointIds: []
        })
    })
    .then(resp => resp.json())
    .then(data => {
        if (data.code === 200) {
            showToast("✅ 路线已存入「我的路线」");
            unlockAchievement("all_routes"); // will be checked
            closeSheet();
        } else {
            showToast("❌ 保存失败");
        }
    })
    .catch(() => {
        // Offline: save locally
        let saved = [];
        try { saved = JSON.parse(localStorage.getItem("nj_saved_routes") || "[]"); } catch(e) {}
        if (!saved.find(s => s.key === routeKey)) {
            saved.push({ key: routeKey, title: r.title, savedAt: new Date().toISOString() });
            localStorage.setItem("nj_saved_routes", JSON.stringify(saved));
        }
        showToast("✅ 路线已离线保存");
        closeSheet();
    });
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

/* ═══════════════════════════════════════
   漫游配方卡交互 · Recipe Card Interaction
   ═══════════════════════════════════════ */

function updateRecipeSelection() {
    const actives = document.querySelectorAll(".ingredient.active");
    const recipeGenBtn = document.getElementById("recipe-generate-btn");
    if (!recipeGenBtn) return;

    if (actives.length === 0) {
        recipeGenBtn.innerHTML = "选几个配方吧";
        recipeGenBtn.style.opacity = "0.5";
        recipeGenBtn.style.pointerEvents = "none";
    } else {
        const parts = [];
        actives.forEach(ing => {
            parts.push(ing.textContent.trim());
        });
        recipeGenBtn.innerHTML = "生成路线";
        recipeGenBtn.style.opacity = "1";
        recipeGenBtn.style.pointerEvents = "auto";
    }
}

function generateRecipeRoute() {
    const timeIng = document.querySelector('.ingredient[data-type="time"].active');
    const moodIng = document.querySelector('.ingredient[data-type="mood"].active');
    const budgetIng = document.querySelector('.ingredient[data-type="budget"].active');

    const timeVal = timeIng ? timeIng.dataset.value : null;
    const moodVal = moodIng ? moodIng.dataset.value : null;
    const budgetVal = budgetIng ? budgetIng.dataset.value : null;

    // Route recommendation logic based on recipe combination
    let routeKey = "food";

    if (moodVal === "night" || (timeVal && parseInt(timeVal) >= 180)) {
        routeKey = "night";
    }
    if (moodVal === "culture" || budgetVal === "high") {
        routeKey = "expo";
    }
    if (moodVal === "campus" || (moodVal === "relax" && timeVal && parseInt(timeVal) <= 120)) {
        routeKey = "nju";
    }
    if (budgetVal === "high" && moodVal === "night") {
        routeKey = "night";
    }

    showToast("配方生成中...");

    // Brief delay for anticipation
    setTimeout(() => {
        openRoute(routeKey);
        animateRouteCard(routeKey);
    }, 600);
}

function animateRouteCard(routeKey) {
    const card = document.querySelector(`.route-card[data-route="${routeKey}"]`);
    if (!card) return;

    card.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease";
    card.style.transform = "scale(1.03)";
    card.style.boxShadow = "0 0 40px rgba(122,92,255,0.25)";

    setTimeout(() => {
        card.style.transform = "scale(1)";
        card.style.boxShadow = "";
    }, 400);

    card.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ═══════════════════════════════════════
   南小鲸向导气泡 · Guide Bubble System
   ═══════════════════════════════════════ */

const GUIDE_MESSAGES = [
    "今天有2小时，要不要走一条轻松路线？",
    "梧桐叶正绿，校园路线很适合今天！",
    "傍晚的秦淮河最温柔了，夜游线考虑一下？",
    "发现一家超棒的街角咖啡，想去吗？",
    "今天阳光正好，去博物馆安静待一会儿吧",
    "据说明城墙边的晚霞特别美，晚上去看看？",
    "有一家藏在巷子里的书店，想让我带你去吗",
    "今天适合不开导航，随便走走也很棒",
];

let guideBubbleTimer = null;

function showGuideBubble(message) {
    const bubble = document.getElementById("guide-bubble");
    const text = document.getElementById("guide-text");
    if (!bubble || !text) return;

    text.textContent = message || GUIDE_MESSAGES[Math.floor(Math.random() * GUIDE_MESSAGES.length)];
    bubble.style.opacity = "1";
    bubble.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    bubble.style.transform = "translateY(0)";
}

function scheduleGuideBubble() {
    if (guideBubbleTimer) clearTimeout(guideBubbleTimer);

    guideBubbleTimer = setTimeout(() => {
        const bubble = document.getElementById("guide-bubble");
        if (!bubble || !mainPageShown) return;

        const msg = GUIDE_MESSAGES[Math.floor(Math.random() * GUIDE_MESSAGES.length)];
        showGuideBubble(msg);

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            if (bubble) {
                bubble.style.opacity = "0";
                bubble.style.transform = "translateY(10px)";
            }
        }, 8000);

        // Schedule next appearance in 25-45 seconds
        scheduleGuideBubble();
    }, 25000 + Math.random() * 20000);
}

/* ═══════════════════════════════════════
   巴斯奎特涂鸦标记 · Graffiti Markers
   ═══════════════════════════════════════ */

const GRAFFITI_STYLES = {
    food: { emoji: "🍜", cls: "graffiti-circle", crown: "♕", label: "美食站" },
    night: { emoji: "🌙", cls: "graffiti-crown", crown: "♛", label: "夜游点" },
    nju: { emoji: "🎓", cls: "graffiti-star", crown: "", label: "校园站" },
    expo: { emoji: "👁", cls: "graffiti-eye", crown: "", label: "展览点" },
};

function renderGraffitiMarkers(routeKey) {
    const layer = document.getElementById("graffiti-markers");
    if (!layer) return;
    layer.innerHTML = "";

    const route = routes[routeKey];
    if (!route || !route.stops) return;

    const style = GRAFFITI_STYLES[routeKey] || GRAFFITI_STYLES.food;
    const stage = document.getElementById("map-stage");
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    const w = stageRect.width;
    const h = stageRect.height;

    route.stops.forEach((stop, i) => {
        const marker = document.createElement("div");
        marker.className = `graffiti-marker ${style.cls}`;

        // Emoji + optional crown inside marker
        marker.innerHTML = style.crown
            ? `<span style="position:absolute;top:-12px;right:-8px;font-size:18px;z-index:2;filter:drop-shadow(2px 2px 0 rgba(32,32,32,0.5));">${style.crown}</span>${style.emoji}`
            : style.emoji;

        marker.title = stop.name;

        // Distribute markers across the map stage
        const topPercent = 25 + (i / Math.max(route.stops.length - 1, 1)) * 50;
        const leftPercent = 15 + (i * 22) % 65;

        marker.style.top = topPercent + "%";
        marker.style.left = leftPercent + "%";

        marker.addEventListener("click", (e) => {
            e.stopPropagation();
            showGraffitiTooltip(stop, marker);
        });

        layer.appendChild(marker);
    });
}

function showGraffitiTooltip(stop, marker) {
    // Remove existing tooltips
    document.querySelectorAll(".graffiti-tooltip").forEach(t => t.remove());

    const tooltip = document.createElement("div");
    tooltip.className = "graffiti-tooltip";
    tooltip.innerHTML = `
        <span class="graffiti-tooltip-name">${stop.name}</span>
        <span class="graffiti-tooltip-detail">${stop.detail}</span>
    `;
    tooltip.style.cssText = `
        position: absolute;
        z-index: 10;
        background: rgba(255,247,232,0.96);
        backdrop-filter: blur(12px);
        border: 1.5px solid var(--gold, #E8C46A);
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 12px;
        color: var(--ink, #202020);
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        max-width: 180px;
        pointer-events: auto;
        animation: graffitiPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    const stage = document.getElementById("map-stage");
    if (!stage) return;

    stage.appendChild(tooltip);

    // Position near marker
    const markerRect = marker.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    tooltip.style.top = (markerRect.top - stageRect.top - 60) + "px";
    tooltip.style.left = Math.max(8, Math.min(stageRect.width - 190, markerRect.left - stageRect.left - 40)) + "px";

    // Auto-dismiss
    setTimeout(() => {
        tooltip.style.opacity = "0";
        tooltip.style.transition = "opacity 0.3s";
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);

    // Click to dismiss
    tooltip.addEventListener("click", () => tooltip.remove());
}

/* ═══════════════════════════════════════
   路线笔触绘制动画 · Route Draw Animation
   ═══════════════════════════════════════ */

function animateRouteDraw(coordsArray) {
    const canvas = document.getElementById("map-route-canvas");
    if (!canvas) return;

    const stage = document.getElementById("map-stage");
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convert geo coords to canvas coords (placeholder: use pixel coords)
    if (!coordsArray || coordsArray.length < 2) return;

    // Calculate canvas points from percentage-based positions
    const points = coordsArray.map(c => ({
        x: c.x !== undefined ? c.x : (c[0] * canvas.width),
        y: c.y !== undefined ? c.y : (c[1] * canvas.height)
    }));

    // Draw Basquiat-style hand-drawn route
    let progress = 0;
    const duration = 1800;
    const startTime = performance.now();

    function draw(timestamp) {
        const elapsed = timestamp - startTime;
        progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ── Layer 1: 粗黑底层线 — Basquiat bold under-line ──
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = "#202020";
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(32,32,32,0.35)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const segProgress = Math.max(0, Math.min(1, (eased * points.length - i + 1)));
            if (segProgress <= 0) break;
            const px = points[i - 1].x + (points[i].x - points[i - 1].x) * segProgress;
            const py = points[i - 1].y + (points[i].y - points[i - 1].y) * segProgress;
            const wobble = (Math.sin(timestamp / 180 + i * 4.5) * 1.8);
            ctx.lineTo(px + wobble, py + wobble * 0.7);
        }
        ctx.stroke();
        ctx.restore();

        // ── Layer 2: 印象派紫色光晕 — Impressionist glow ──
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = "#7A5CFF";
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(122,92,255,0.5)";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const segProgress = Math.max(0, Math.min(1, (eased * points.length - i + 1)));
            if (segProgress <= 0) break;
            const px = points[i - 1].x + (points[i].x - points[i - 1].x) * segProgress;
            const py = points[i - 1].y + (points[i].y - points[i - 1].y) * segProgress;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        // ── Layer 3: 紫色手绘线 — hand-drawn purple line ──
        ctx.save();
        ctx.strokeStyle = "#7A5CFF";
        ctx.lineWidth = 4.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.setLineDash([14, 10]);
        ctx.lineDashOffset = -timestamp / 60;
        ctx.shadowColor = "rgba(32,32,32,0.2)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const segProgress = Math.max(0, Math.min(1, (eased * points.length - i + 1)));
            if (segProgress <= 0) break;
            const px = points[i - 1].x + (points[i].x - points[i - 1].x) * segProgress;
            const py = points[i - 1].y + (points[i].y - points[i - 1].y) * segProgress;
            const wobble = (Math.sin(timestamp / 150 + i * 5) * 1.2);
            ctx.lineTo(px + wobble, py + wobble * 0.6);
        }
        ctx.stroke();
        ctx.restore();

        // ── Layer 4: 金色实线顶层 — thin gold highlight ──
        ctx.save();
        ctx.strokeStyle = "rgba(232,196,106,0.7)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const segProgress = Math.max(0, Math.min(1, (eased * points.length - i + 1)));
            if (segProgress <= 0) break;
            const px = points[i - 1].x + (points[i].x - points[i - 1].x) * segProgress;
            const py = points[i - 1].y + (points[i].y - points[i - 1].y) * segProgress;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        // ── 手写箭头 → at the tip ──
        if (progress > 0.15) {
            const tipIdx = Math.min(points.length - 1, Math.floor(eased * (points.length - 1)) + 1);
            const segStart = points[tipIdx - 1] || points[0];
            const segEnd = points[tipIdx];
            const segFrac = (eased * (points.length - 1)) - (tipIdx - 1);
            const frac = Math.max(0, Math.min(1, segFrac));
            const tipX = segStart.x + (segEnd.x - segStart.x) * frac;
            const tipY = segStart.y + (segEnd.y - segStart.y) * frac;

            const angle = Math.atan2(
                segEnd.y - segStart.y,
                segEnd.x - segStart.x
            );

            // Black arrow
            ctx.save();
            ctx.fillStyle = "#202020";
            ctx.translate(tipX, tipY);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(-6, -8);
            ctx.lineTo(-2, 0);
            ctx.lineTo(-6, 8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Gold dot at tip
            ctx.save();
            ctx.fillStyle = "#E8C46A";
            ctx.shadowColor = "rgba(232,196,106,0.9)";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (progress < 1) {
            requestAnimationFrame(draw);
        } else {
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, 4000);
        }
    }

    requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════
   路线显示增强 · Show Route on Map Enhance
   ═══════════════════════════════════════ */

const _origShowRouteOnMap = showRouteOnMap;
showRouteOnMap = function(routeKey) {
    _origShowRouteOnMap(routeKey);

    // Render graffiti markers for the selected route
    renderGraffitiMarkers(routeKey);

    // Animate route drawing
    const mapData = ROUTE_MAP_DATA[routeKey];
    if (mapData && mapData.coords) {
        const stage = document.getElementById("map-stage");
        if (stage) {
            const rect = stage.getBoundingClientRect();
            const points = mapData.coords.map((_, i) => ({
                x: rect.width * (0.2 + i * 0.2),
                y: rect.height * (0.35 + Math.sin(i * 1.5) * 0.2)
            }));
            setTimeout(() => animateRouteDraw(points), 400);
        }
    }

    // Show guide bubble with route-specific message
    const GUIDE_ROUTE_MSGS = {
        nju: "梧桐树下走走，一天就过去了。这条线藏着南大一百多年的故事。",
        night: "秦淮灯影，金陵夜色。这条线路会带你走进一场旧梦。",
        food: "不赶路，只把下午慢慢花掉。准备好你的胃了吗？",
        expo: "安静地走进一座博物馆，和旧物说说话。记得提前预约哦。",
    };
    showGuideBubble(GUIDE_ROUTE_MSGS[routeKey] || "这条路线看起来不错！");
};

// Start guide bubble scheduling after main page shows
const _origShowMainPage = showMainPage;
showMainPage = function() {
    _origShowMainPage();
    // Start periodic guide bubble
    setTimeout(scheduleGuideBubble, 30000);
    // Add floating AI button
    addAiFloatButton();
    // Load Meituan food deals
    loadMeituanDeals();
    // Add home supply entry card
    addHomeSupplyEntry();
};

/* ═══════════════════════════════════════
   0520 南大剧情游戏 · Game Overlay
   ═══════════════════════════════════════ */

function openGame() {
    const overlay = document.getElementById("game-overlay");
    const iframe = document.getElementById("game-iframe");
    if (!overlay || !iframe) return;

    iframe.src = "./0520-game/index.html";
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";

    // Notify any active audio to pause
    if (typeof VNEngine !== "undefined" && VNEngine.audio) {
        try { VNEngine.audio.pause(); } catch(e) {}
    }
}

function closeGame() {
    const overlay = document.getElementById("game-overlay");
    const iframe = document.getElementById("game-iframe");
    if (!overlay) return;

    overlay.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
        if (iframe) iframe.src = "";
    }, 400);
}

// Hook game close button (DOM already ready since script loads at end of body)
(function bindGameClose() {
    const gameCloseBtn = document.getElementById("game-close-btn");
    if (gameCloseBtn) {
        gameCloseBtn.addEventListener("click", closeGame);
    }
})();

// Handle enter buttons in the opening scene for NJU
document.querySelectorAll(".enter[data-route='nju']").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openGame();
    });
});

// Also hook the route sheet: when NJU route opens, show game button
const _origOpenRoute = openRoute;
openRoute = function(key) {
    _origOpenRoute(key);
    // Re-bind: after sheet renders, add game button for NJU
    if (key === "nju") {
        setTimeout(() => {
            const actions = document.querySelector(".route-actions");
            if (actions) {
                const gameBtn = document.createElement("button");
                gameBtn.className = "route-action-btn";
                gameBtn.style.cssText = "background:linear-gradient(135deg,var(--nju-purple),var(--nju-purple-light));border-color:transparent;";
                gameBtn.innerHTML = '<span class="icon">🎮</span><span class="label" style="color:#fff;">开始剧情游戏</span>';
                gameBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    closeSheet();
                    setTimeout(openGame, 300);
                });
                actions.appendChild(gameBtn);
            }
        }, 100);
    }
};

/* ═══════════════════════════════════════
   AI 助手聊天面板 · AI Chat Panel
   ═══════════════════════════════════════ */

// Final Apple route cards: built-in routes share the upload-route entry pattern.
renderCarouselCards = function() {
    const track = document.getElementById("carousel-track");
    const dots = document.getElementById("carousel-dots");
    if (!track) return;

    track.innerHTML = CAROUSEL_ROUTES
        .map(key => renderRouteLaunchCard(key, routes[key], { carousel: true, compact: true }))
        .join("");

    if (dots) {
        dots.innerHTML = CAROUSEL_ROUTES
            .map((_, i) => `<span class="carousel-dot${i === 0 ? " active" : ""}"></span>`)
            .join("");
    }

    track.querySelectorAll(".route-launch-card").forEach(card => {
        card.addEventListener("click", () => openRoute(card.dataset.route));
    });
    track.querySelectorAll(".route-launch-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const routeKey = btn.closest(".route-launch-card")?.dataset.route;
            if (routeKey) openRoute(routeKey);
        });
    });
};

renderRouteGrid = function() {
    const grid = document.getElementById("route-grid");
    if (!grid) return;

    const builtinKeys = ["night", "nju", "food", "expo"];
    const customKeys = Object.keys(customRoutes);
    const allKeys = [...builtinKeys, ...customKeys];

    grid.innerHTML = allKeys
        .map(key => renderRouteLaunchCard(key, routes[key], { compact: true }))
        .join("") +
        `<div class="route-launch-card route-launch-upload" id="custom-route-upload-btn">
            <div class="route-launch-thumb">
                <span class="route-launch-icon">＋</span>
            </div>
            <div class="route-launch-copy">
                <span class="route-launch-title">上传我的路线</span>
                <span class="route-launch-desc">在地图上标记起点、途经点和终点</span>
            </div>
            <button class="route-launch-btn" type="button">开始标记</button>
        </div>`;

    grid.querySelectorAll(".route-launch-card").forEach(card => {
        card.addEventListener("click", () => {
            const routeKey = card.dataset.route;
            if (!routeKey) showMapRouteEditor();
            else openRoute(routeKey);
        });
    });
    grid.querySelectorAll(".route-launch-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const routeKey = btn.closest(".route-launch-card")?.dataset.route;
            if (!routeKey) showMapRouteEditor();
            else openRoute(routeKey);
        });
    });
};

renderRoutesTab = function(container) {
    container.innerHTML =
        `<div class="tab-page-header">
            <div class="tab-page-title">全部路线</div>
            <div class="tab-page-subtitle">${Object.keys(routes).length} 条路线，等你出发</div>
        </div>
        <div class="upload-route-hero" id="upload-route-hero">
            <div class="upload-route-hero-icon">＋</div>
            <div class="upload-route-hero-text">
                <span class="upload-route-hero-title">上传我的路线</span>
                <span class="upload-route-hero-sub">在地图上标记起点、途经点和终点，创建你自己的南京路线</span>
            </div>
            <button class="upload-route-hero-btn" id="upload-route-hero-btn">开始标记</button>
        </div>`;

    container.querySelector("#upload-route-hero-btn").addEventListener("click", showMapRouteEditor);
    container.querySelector("#upload-route-hero").addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") showMapRouteEditor();
    });

    Object.entries(routes).forEach(([key, route]) => {
        const wrap = document.createElement("div");
        wrap.innerHTML = renderRouteLaunchCard(key, route);
        const card = wrap.firstElementChild;
        card.addEventListener("click", () => openRoute(key));
        card.querySelector(".route-launch-btn")?.addEventListener("click", (e) => {
            e.stopPropagation();
            openRoute(key);
        });
        container.appendChild(card);
    });
};

let aiChatOpen = false;

function addAiFloatButton() {
    if (document.querySelector(".ai-float-btn")) return;
    const btn = document.createElement("button");
    btn.className = "ai-float-btn";
    btn.textContent = "AI";
    btn.title = "AI 助手";
    btn.addEventListener("click", toggleAiChat);
    document.body.appendChild(btn);
}

function toggleAiChat() {
    const panel = document.getElementById("ai-chat-panel");
    if (!panel) return;
    aiChatOpen = !aiChatOpen;
    if (aiChatOpen) {
        panel.classList.add("open");
        document.getElementById("ai-chat-input")?.focus();
    } else {
        panel.classList.remove("open");
    }
}

function sendAiMessage() {
    const input = document.getElementById("ai-chat-input");
    const msgContainer = document.getElementById("ai-chat-messages");
    if (!input || !msgContainer) return;
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    appendChatMsg("user", text);
    input.value = "";

    // Add typing indicator
    const typingEl = document.createElement("div");
    typingEl.className = "ai-msg ai-msg-bot ai-msg-typing";
    typingEl.innerHTML = '<span class="ai-msg-avatar">AI</span><div class="ai-msg-bubble">思考中...</div>';
    msgContainer.appendChild(typingEl);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    setPet77State("thinking", { returnToIdle: false });
    showPet77Bubble("我也在帮你想。");

    // Call AI API
    fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, message: text, sessionId: "web-" + Date.now() }),
    })
    .then(res => res.json())
    .then(data => {
        typingEl.remove();
        const reply = data.data?.content || data.content || data.message || "让我想想...";
        appendChatMsg("bot", reply);
        setPet77State("happy");
    })
    .catch(() => {
        typingEl.remove();
        setPet77State("failed");
        showPet77Bubble("网络没接上，我先给你备用建议。");
        // Fallback responses
        const fallbacks = [
            "南京的梧桐大道很美，推荐你去走走！从南大出发，一路走到中山路，两边都是百年梧桐。",
            "想吃东西吗？老门东的鸭血粉丝汤、夫子庙的秦淮八绝，我都知道哪家最好吃！",
            "今天天气适合去博物馆哦～南京博物院最近有特展，建议提前一天预约。",
            "夜游秦淮河是我的最爱！傍晚出发，先逛夫子庙，再坐船看灯影，完美～",
            "校园路线的话，从三江师范旧址开始，经过北大楼，再到梧桐大道，大约2.5小时。",
        ];
        appendChatMsg("bot", fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    });
}

function appendChatMsg(type, text) {
    const container = document.getElementById("ai-chat-messages");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "ai-msg ai-msg-" + type;
    el.innerHTML = type === "bot"
        ? '<span class="ai-msg-avatar">AI</span><div class="ai-msg-bubble">' + escapeHtml(text) + '</div>'
        : '<span class="ai-msg-avatar">🧑</span><div class="ai-msg-bubble">' + escapeHtml(text) + '</div>';
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// Bind AI chat events (DOM already ready)
(function bindAiChat() {
    const sendBtn = document.getElementById("ai-chat-send");
    const input = document.getElementById("ai-chat-input");
    const closeBtn = document.getElementById("ai-chat-close");

    if (sendBtn) sendBtn.addEventListener("click", sendAiMessage);
    if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendAiMessage(); });
    if (closeBtn) closeBtn.addEventListener("click", toggleAiChat);
})();

/* ═══════════════════════════════════════
   美团 API 美食数据 · Meituan Food Deals
   ═══════════════════════════════════════ */

function loadMeituanDeals() {
    // Insert Meituan section after inspiration section
    const inspSection = document.querySelector(".inspiration-section");
    if (!inspSection) return;

    // Check if already inserted
    if (document.querySelector(".meituan-section")) return;

    const meituanSection = document.createElement("section");
    meituanSection.className = "meituan-section";
    meituanSection.innerHTML = `
        <h2 class="section-title">周边美食</h2>
        <div class="meituan-grid" id="meituan-grid">
            <div class="meituan-loading">正在搜索附近美食...</div>
        </div>
    `;
    inspSection.after(meituanSection);

    // Fetch deals from backend
    fetch("/api/meituan/deals?lat=32.056&lng=118.779&category=food")
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById("meituan-grid");
            if (!grid) return;

            const deals = data.data?.deals || data.data || data.deals || [];
            if (!deals.length) {
                // Show mock data if API returns empty
                renderMockMeituanDeals(grid);
                return;
            }
            renderMeituanDeals(grid, deals);
        })
        .catch(() => {
            const grid = document.getElementById("meituan-grid");
            if (grid) renderMockMeituanDeals(grid);
        });
}

function renderMeituanDeals(grid, deals) {
    grid.innerHTML = deals.slice(0, 6).map(d => `
        <div class="meituan-card">
            <div class="meituan-card-name">${escapeHtml(d.title || d.name || "美食套餐")}</div>
            <div class="meituan-card-info">
                <span>⭐ ${d.rating || "4.5"}</span>
                <span>${escapeHtml(d.distance || d.address || "附近")}</span>
            </div>
            <div class="meituan-card-info">
                <span class="meituan-card-price"><span class="yen">¥</span>${d.price || d.currentPrice || "39"}</span>
                ${d.originalPrice ? '<span class="meituan-card-original">¥' + d.originalPrice + '</span>' : ""}
                ${d.discount ? '<span class="meituan-card-tag">' + d.discount + '折</span>' : ""}
            </div>
        </div>
    `).join("");
}

function renderMockMeituanDeals(grid) {
    const mockDeals = [
        { name: "鸭血粉丝汤双人套餐", rating: "4.8", distance: "夫子庙 · 800m", price: "38", originalPrice: "68", discount: "5.6" },
        { name: "桂花糖芋苗+赤豆元宵", rating: "4.6", distance: "老门东 · 1.2km", price: "18", originalPrice: "32", discount: "5.6" },
        { name: "金陵盐水鸭半只", rating: "4.9", distance: "新街口 · 2.1km", price: "45", originalPrice: "88", discount: "5.1" },
        { name: "秦淮八绝小吃拼盘", rating: "4.7", distance: "夫子庙 · 600m", price: "68", originalPrice: "128", discount: "5.3" },
        { name: "蟹黄汤包一笼", rating: "4.5", distance: "鼓楼 · 1.5km", price: "28", originalPrice: "48", discount: "5.8" },
        { name: "南京烤鸭+薄饼", rating: "4.8", distance: "湖南路 · 1.8km", price: "52", originalPrice: "96", discount: "5.4" },
    ];
    grid.innerHTML = mockDeals.map(d => `
        <div class="meituan-card">
            <div class="meituan-card-name">${d.name}</div>
            <div class="meituan-card-info">
                <span>⭐ ${d.rating}</span>
                <span>${d.distance}</span>
            </div>
            <div class="meituan-card-info">
                <span class="meituan-card-price"><span class="yen">¥</span>${d.price}</span>
                <span class="meituan-card-original">¥${d.originalPrice}</span>
                <span class="meituan-card-tag">${d.discount}折</span>
            </div>
        </div>
    `).join("");
}
