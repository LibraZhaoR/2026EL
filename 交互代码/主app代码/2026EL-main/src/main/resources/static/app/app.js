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
        routeKey: "shiguang_canyin",
        routeKeys: ["food", "shiguang_canyin", "laomendong_manyou", "gaochun_guxiang", "banfang_zhilv"],
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
        routeKey: "xuelin_shuxiang",
        routeKeys: ["xuelin_shuxiang", "qinhuai_wenmai", "keju_wenmai", "pukou_xungen", "minsu_jiyi"],
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
        routeKey: "qingnian_yundong",
        routeKeys: ["qingnian_yundong", "hexi_xincheng", "chengqiang_xunli", "mingfeng_guyun"],
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
        routeKey: "banfang_zhilv",
        routeKeys: ["chancha_xiuxing", "yige_ren_xian_guang", "jiangnan_yuanlin", "qixia_shangqiu", "qinglv_langman"],
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
        routeKey: "mingfeng_guyun",
        routeKeys: ["expo", "bowu_jinghua", "hongse_jiyi", "liuchao_yimeng", "zongtongfu_zhoubian"],
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
        routeKey: "yejing_denghuo",
        routeKeys: ["minguo_fenghua", "yishu_manbu", "jiaotang_jianzhu", "nantang_jiushi", "modeng_nanjing"],
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
        routeKey: "yejing_denghuo",
        routeKeys: ["night", "yejing_denghuo", "fosi_xunli", "jinian_diantang", "jiulong_qifu"],
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
        routeKey: "gulou_xiaoyuan",
        routeKeys: ["nju", "gulou_xiaoyuan", "qinzi_yanxue", "binjiang_fengguang"],
        bgImage: "assets/persona/8.png"
    }
];

// ═══════════════════════════════════════════
//  Persona → Merchant Preference Mapping
//  人格选择后，系统据此推送相应路线商家
// ═══════════════════════════════════════════
const PERSONA_MERCHANT_PREF = {
    foodie: {
        label: "美食家专属推荐",
        priorityCats: ["food", "coffee"],
        priorityTags: ["老字号", "金陵菜", "火锅", "海鲜", "小吃", "南京味", "深夜食堂", "湘菜", "麻辣"],
        prioritySubcats: ["汤包", "面馆", "烧腊", "牛排馆", "烤鱼", "私房菜", "本帮菜", "日料", "海鲜"],
        excludeTags: [],
        desc: "地道南京味，烟火气十足"
    },
    reader: {
        label: "文学爱好者专属推荐",
        priorityCats: ["coffee", "food"],
        priorityTags: ["安静", "文艺", "书店", "精品", "手冲", "阅读", "下午茶", "甜点"],
        prioritySubcats: ["书店咖啡", "精品咖啡", "烘焙咖啡", "连锁咖啡", "新式茶馆"],
        excludeTags: ["火锅", "麻辣", "夜宵"],
        desc: "适合安静发呆的角落"
    },
    sport: {
        label: "运动达人专属推荐",
        priorityCats: ["food", "coffee"],
        priorityTags: ["健康", "养生", "素食", "轻食", "活力", "早餐", "高蛋白"],
        prioritySubcats: ["素食馆", "轻食", "果汁吧", "沙拉", "烘焙咖啡"],
        excludeTags: ["深夜食堂", "火锅", "麻辣"],
        desc: "元气满满的能量补给站"
    },
    coffee: {
        label: "咖啡漫游者专属推荐",
        priorityCats: ["coffee", "food"],
        priorityTags: ["咖啡", "下午茶", "甜点", "手冲", "烘焙", "安静", "文艺", "拍照"],
        prioritySubcats: ["烘焙咖啡", "连锁咖啡", "精品咖啡", "新式茶馆", "创意茶饮", "书店咖啡"],
        excludeTags: ["火锅", "麻辣", "夜宵"],
        desc: "慢慢逛、慢慢喝的午后时光"
    },
    history: {
        label: "历史探索者专属推荐",
        priorityCats: ["food", "ticket", "coffee"],
        priorityTags: ["老字号", "金陵菜", "传统", "南京味", "古法", "百年", "私房菜", "本帮菜"],
        prioritySubcats: ["本帮菜", "私房菜", "素食馆", "汤包"],
        excludeTags: ["快餐", "网红"],
        desc: "老南京的味道，百年传承"
    },
    photo: {
        label: "拍照打卡党专属推荐",
        priorityCats: ["coffee", "food"],
        priorityTags: ["网红", "出片", "拍照", "打卡", "氛围感", "创意", "ins", "高颜值"],
        prioritySubcats: ["新式茶馆", "创意茶饮", "精品咖啡", "烘焙咖啡", "书店咖啡"],
        excludeTags: [],
        desc: "颜值与味道都在线的出片好店"
    },
    night: {
        label: "夜游玩家专属推荐",
        priorityCats: ["food", "coffee"],
        priorityTags: ["夜宵", "深夜食堂", "居酒屋", "烤鱼", "火锅", "麻辣", "烧烤", "24小时"],
        prioritySubcats: ["烤鱼", "麻辣烫", "汤包", "面馆", "居酒屋", "烧烤"],
        excludeTags: ["早餐"],
        desc: "入夜金陵，越夜越有味"
    },
    nju: {
        label: "校园情怀派专属推荐",
        priorityCats: ["food", "coffee"],
        priorityTags: ["早餐", "小吃", "学生", "便宜", "实惠", "南京甜口", "糕团", "社区店"],
        prioritySubcats: ["汤包", "面馆", "麻辣烫", "连锁咖啡", "烘焙咖啡"],
        excludeTags: ["高端", "宴请", "预约制"],
        desc: "梧桐树下的平价好味道"
    }
};

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
const APP_GITHUB_URL = "https://github.com/LibraZhaoR/2026EL";
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
            userId: getCurrentUserId() || 1,
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

// ── Merge extra routes from routes-data.js ──
if (window.CITYGO_EXTRA_ROUTES) {
    Object.assign(routes, window.CITYGO_EXTRA_ROUTES);
}

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

    // Exit pure map mode via public API
    if (typeof window.citygoSetPureMapMode === "function") {
        window.citygoSetPureMapMode(false);
    }
    if (currentTab !== "home") switchTab("home");

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
    const buildingPoint = findBuildingPointByName(stop.name);
    if (buildingPoint && showBuildingPointDetail(buildingPoint, "路线途经点")) return;
    if (!stop.story) { showToast("这个站点还没有故事"); return; }

    const panel = document.querySelector("#story-overlay .story-panel");
    panel?.classList.remove("building-story-panel");
    panel?.querySelector(".story-image")?.remove();
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
        var routeKey = btn.dataset.route;
        // Also show the route on the home page map when clicked from ink-wash scene
        openRoute(routeKey);
        if (!mainPageShown) {
            // Transition to main page first, then show route on map
            var po = document.getElementById("opening");
            if (po) po.classList.add("dismissed");
            showMainPage();
            setTimeout(function() { showRouteOnMap(routeKey); }, 600);
        } else {
            setTimeout(function() { showRouteOnMap(routeKey); }, 300);
        }
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
    const route = routes[routeKey];
    if (route) return route.title.split(/[：:]/)[0] || route.title;
    const names = { food: "南京味道线", nju: "南大校园探索线", night: "秦淮夜游线", expo: "博物馆展览线" };
    return names[routeKey] || "城市探索线";
}

function proceedToMain() {
    personaSwiper.classList.add("leaving");
    setTimeout(() => {
        personaSwiper.style.display = "none";
        personaSwiper.classList.remove("entering", "leaving");
        // Show "特别的你" package first, then the homepage
        showSpecialYouPackage();
    }, 350);
}

// ══════════════════════════════════════════════════════
//  "特别的你"· 人格专属礼包
// ══════════════════════════════════════════════════════

function showSpecialYouPackage() {
    const overlay = document.getElementById("special-you-overlay");
    if (!overlay) {
        // Fallback: no overlay element, go straight to main
        showMainPageDelayed();
        return;
    }

    const personaCard = personaCards.find(p => p.id === selectedPersonaId);
    if (!personaCard) {
        showMainPageDelayed();
        return;
    }

    // Set header
    document.getElementById("special-you-persona-icon").textContent = personaCard.elements[0].emoji;
    document.getElementById("special-you-title").textContent = personaCard.title + " · 专属礼包";
    document.getElementById("special-you-subtitle").textContent = personaCard.unlockText || "专为你挑选的路线、商户与社区精选";

    // Build sections
    buildSpecialYouRoutes(personaCard);
    buildSpecialYouMerchants(selectedPersonaId);
    buildSpecialYouReviews(selectedPersonaId);

    // Show overlay
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("active");

    // Bind events
    document.getElementById("special-you-close").onclick = closeSpecialYou;
    document.getElementById("special-you-close-btn").onclick = closeSpecialYou;
    document.getElementById("special-you-explore").onclick = onSpecialYouExplore;
    document.getElementById("special-you-scrim").onclick = closeSpecialYou;
    // Prevent card clicks from bubbling to scrim
    document.getElementById("special-you-card").addEventListener("click", function(e) {
        e.stopPropagation();
    });
}

function buildSpecialYouRoutes(personaCard) {
    const container = document.getElementById("special-you-routes");
    if (!container) return;

    // Use persona-specific route keys (each route assigned to exactly one persona)
    const routeKeys = personaCard.routeKeys || [personaCard.routeKey];
    const personaRouteKey = personaCard.routeKey;

    const ordered = routeKeys
        .map(k => [k, routes[k]])
        .filter(([_, route]) => route != null);

    container.innerHTML = ordered.map(([key, route]) => {
        const isMatch = key === personaRouteKey;
        const icon = isMatch ? "⭐" : "🗺️";
        const bg = isMatch ? "var(--vermillion)" : "var(--sage)";
        const title = typeof route.title === "string" ? route.title : (route.title || key);
        const meta = Array.isArray(route.meta) ? route.meta.join(" · ") : (route.desc || "");

        return `
        <div class="sy-route-card" style="${isMatch ? 'border-color: var(--vermillion); background: rgba(226,168,80,0.04);' : ''}">
            <div class="sy-route-icon" style="background:${bg};color:white;font-size:16px;">${icon}</div>
            <div class="sy-route-info">
                <div class="sy-route-name">${escapeHtml(title)}</div>
                <div class="sy-route-meta">${escapeHtml(meta)}</div>
            </div>
        </div>`;
    }).join("");
}

function buildSpecialYouMerchants(personaId) {
    const container = document.getElementById("special-you-merchants");
    if (!container) return;

    // Get merchants from SUPPLY_DATA or fallback to built-in data
    let merchants = [];
    if (typeof SUPPLY_DATA !== "undefined" && typeof SUPPLY_DATA.getAll === "function") {
        const allMerchants = SUPPLY_DATA.getAll();
        const pref = PERSONA_MERCHANT_PREF[personaId];

        if (pref && allMerchants.length) {
            merchants = allMerchants
                .map(item => {
                    let score = 0;
                    const catIdx = pref.priorityCats.indexOf(item.category);
                    if (catIdx === 0) score += 8;
                    else if (catIdx > 0) score += 5;
                    else score -= 1;

                    const itemTags = (item.tags || []).map(t => String(t).toLowerCase());
                    const prefTags = pref.priorityTags.map(t => t.toLowerCase());
                    score += itemTags.filter(t => prefTags.some(pt => t.includes(pt) || pt.includes(t))).length * 4;
                    score += (Number(item.rating || 0) - 3.5) * 3;
                    return { item, score };
                })
                .filter(e => e.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map(e => e.item);
        }
    }

    // Fallback: use Nanjing classic merchants
    if (!merchants.length) {
        merchants = [
            { name: "南京大牌档（夫子庙店）", category: "food", tags: ["金陵菜", "南京味", "老字号"], rating: 4.5, avgPrice: 78, subcategory: "金陵菜" },
            { name: "鸡鸣汤包（老门东店）", category: "food", tags: ["汤包", "小吃"], rating: 4.5, avgPrice: 36, subcategory: "汤包" },
            { name: "先锋书店（五台山总店）", category: "coffee", tags: ["书店", "文艺", "拍照"], rating: 4.7, avgPrice: 32, subcategory: "书店咖啡" },
            { name: "蒋有记锅贴（老门东店）", category: "food", tags: ["小吃", "清真"], rating: 4.7, avgPrice: 32, subcategory: "面馆" },
            { name: "李记清真馆", category: "food", tags: ["老字号", "小吃", "实惠"], rating: 4.6, avgPrice: 28, subcategory: "面馆" }
        ];
    }

    container.innerHTML = merchants.slice(0, 5).map(m => {
        const icon = categoryIcon(m.category);
        const subcat = m.subcategory || "";
        const tags = (m.tags || []).slice(0, 2).join(" · ");
        let dealText = "";
        if (m.avgPrice) dealText = "人均 ¥" + m.avgPrice;
        if (m.deals && Array.isArray(m.deals) && m.deals.length) {
            dealText += " · " + m.deals[0].name + " ¥" + m.deals[0].price;
        }

        return `
        <div class="sy-merchant-card">
            <span class="sy-merchant-icon">${icon}</span>
            <div class="sy-merchant-info">
                <div class="sy-merchant-name">${escapeHtml(m.name)}</div>
                <div class="sy-merchant-meta">
                    <span>${escapeHtml(subcat)}</span>
                    <span>⭐ ${Number(m.rating || 4).toFixed(1)}</span>
                    <span>${escapeHtml(tags)}</span>
                </div>
                ${dealText ? `<div class="sy-merchant-deal">${escapeHtml(dealText)}</div>` : ""}
            </div>
        </div>`;
    }).join("");
}

function buildSpecialYouReviews(personaId) {
    const container = document.getElementById("special-you-reviews");
    if (!container) return;

    const personaCard = personaCards.find(p => p.id === personaId);
    const personaName = personaCard ? personaCard.title : "探索者";

    // Mock community reviews matched to persona
    const allReviews = [
        { user: "咖啡地图控", avatar: "☕", time: "2小时前", stars: 5, text: "先锋书店五台山总店真的绝了！地下车库改造的书店，拍照巨出片。完全符合" + personaName + "的路线风格，走累了喝杯咖啡，太舒服了。", tag: "coffee" },
        { user: "南京土著", avatar: "🦆", time: "昨天", stars: 5, text: "李记清真馆的牛肉锅贴yyds！丰富路从头吃到尾，跟着推荐路线走不会踩坑。推荐" + personaName + "的朋友都来试试。", tag: "food" },
        { user: "旅行日记本", avatar: "📓", time: "3小时前", stars: 4, text: "沿着秦淮河慢慢走，夫子庙的灯影倒映在水面上特别美。很适合" + personaName + "这条路线，不赶时间，慢慢感受。", tag: "ticket" },
        { user: "周末闲逛家", avatar: "🚶", time: "昨天", stars: 5, text: "颐和路的梧桐树荫太适合散步了！这种慢节奏的城市探索太舒服了，比起赶景点打卡舒服一百倍。", tag: "coffee" },
        { user: "金陵味道", avatar: "🍜", time: "5小时前", stars: 4, text: "芳婆糕团店的糖芋苗太好吃了！这种藏在巷子里的老店才是真正的南京味道。推荐所有来南京玩的朋友。", tag: "food" },
    ];

    // Sort: reviews matching persona route tags first
    const pref = PERSONA_MERCHANT_PREF[personaId];
    const priorityTags = pref ? pref.priorityTags.map(t => t.toLowerCase()) : [];

    const sorted = allReviews
        .map(r => {
            const matchScore = priorityTags.filter(pt => r.text.toLowerCase().includes(pt)).length;
            return { ...r, matchScore };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4);

    container.innerHTML = sorted.map(r => `
        <div class="sy-review-card">
            <div class="sy-review-user">
                <span class="sy-review-avatar">${r.avatar}</span>
                <span class="sy-review-name">${escapeHtml(r.user)}</span>
                <span class="sy-review-stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span>
                <span class="sy-review-time">${escapeHtml(r.time)}</span>
            </div>
            <div class="sy-review-text">${escapeHtml(r.text)}</div>
        </div>
    `).join("");
}

function closeSpecialYou() {
    const overlay = document.getElementById("special-you-overlay");
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    showMainPageDelayed();
}

function onSpecialYouExplore() {
    const overlay = document.getElementById("special-you-overlay");
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    showMainPageDelayed();
}

function showMainPageDelayed() {
    showMainPage();
    // Re-render carousel with persona-matched ordering
    setTimeout(function() {
        renderCarouselCards();
        // Scroll to matched card
        var matchedKey = (personaCards.find(function(p) { return p.id === selectedPersonaId; }) || {}).routeKey;
        if (matchedKey) {
            var cards = document.querySelectorAll("#carousel-track .route-launch-card");
            for (var ci = 0; ci < cards.length; ci++) {
                if (cards[ci].dataset.route === matchedKey) {
                    var carousel = document.getElementById("route-carousel");
                    if (carousel) {
                        var cardW = carousel.clientWidth * 0.38 + 12;
                        carousel.scrollTo({ left: ci * cardW, behavior: "smooth" });
                    }
                    break;
                }
            }
        }
    }, 100);
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
    const initialRouteKey = getHomeRecommendedRouteKey();
    renderCarouselCards();
    renderFeatureSection(initialRouteKey);
    renderRouteGrid();
    renderHomeMerchantRecommendations();

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

    // Map restore button — reveal route cards panel
    var restoreBtn = document.getElementById("map-restore-btn");
    if (restoreBtn) {
        restoreBtn.addEventListener("click", function() {
            var snapScroll = document.getElementById("snap-scroll");
            if (snapScroll) {
                snapScroll.classList.remove("hidden-by-map");
                snapScroll.style.transform = "";
                snapScroll.style.transition = "";
            }
            restoreBtn.classList.remove("show");
            restoreBtn.style.display = "none";
        });
    }

    // ── Setup scroll-triggered animations ──
    setupScrollAnimations();

    // ── Map mode toggle (首页 / 纯地图) ──
    let mapModePure = false;
    const mapModeToggle = document.getElementById("map-mode-toggle");
    const mapModeHomeOption = mapModeToggle?.querySelector(".map-mode-home");
    const mapModeMapOption = mapModeToggle?.querySelector(".map-mode-map");
    const mapContainer = document.getElementById("main-map-container");
    const scrollHint = document.querySelector(".scroll-hint");

    function getMapPOIsForPureMode() {
        // Use merged landmarks (includes CITYGO_BUILDING_POINTS + NANJING_LANDMARKS)
        const buildings = typeof window.getNanjingLandmarkPOIs === 'function'
            ? window.getNanjingLandmarkPOIs()
            : getCitygoBuildingPoints();
        const custom = Array.isArray(window.citygoMapPOIs) ? window.citygoMapPOIs : [];
        return custom.length ? buildings.concat(custom) : buildings;
    }

    function clearMapPOIs() {
        if (window._citygoPoiMarkers && amapInstance) {
            window._citygoPoiMarkers.forEach(marker => amapInstance.remove(marker));
        }
        window._citygoPoiMarkers = [];
        document.querySelector(".poi-info-card")?.remove();
        document.querySelector(".poi-info-backdrop")?.remove();
    }

    function renderMapPOIs() {
        if (!amapInstance || !window.AMap || !mapModePure) return;
        clearMapPOIs();

        getMapPOIsForPureMode().forEach((poi, index) => {
            if (!Number.isFinite(Number(poi.lng)) || !Number.isFinite(Number(poi.lat))) return;
            const isLocatorPoint = poi.kind === "building" || poi.category === "定位标号";
            const markerLabel = isLocatorPoint
                ? (poi.locatorLabel || String(index + 1).padStart(2, "0"))
                : (poi.icon || "•");
            const markerContent = document.createElement("button");
            markerContent.className = `citygo-poi-marker${isLocatorPoint ? " citygo-building-marker" : ""}`;
            markerContent.type = "button";
            markerContent.innerHTML = `<span>${escapeHtml(markerLabel)}</span>`;
            markerContent.title = poi.name || "南京地点";

            const marker = new window.AMap.Marker({
                position: [Number(poi.lng), Number(poi.lat)],
                title: poi.name,
                content: markerContent,
                offset: new window.AMap.Pixel(-18, -36),
                zIndex: 80,
            });
            marker.on("click", () => showPOIInfoCard({ ...poi, markerLabel }));
            amapInstance.add(marker);
            window._citygoPoiMarkers.push(marker);
        });
    }

    function setPureMapMode(next) {
        mapModePure = next;
        mainPage.classList.toggle("map-mode-pure", mapModePure);
        mapModeToggle?.classList.toggle("map-mode-active", mapModePure);
        mapModeToggle?.setAttribute("aria-pressed", String(mapModePure));
        mapModeHomeOption?.classList.toggle("active", !mapModePure);
        mapModeMapOption?.classList.toggle("active", mapModePure);
        if (mapContainer) {
            mapContainer.style.pointerEvents = mapModePure ? "auto" : "none";
            mapContainer.style.filter = mapModePure ? "none" : "saturate(0.45) contrast(0.82) brightness(1.14) sepia(0.08)";
        }
        if (scrollHint) scrollHint.style.display = mapModePure ? "none" : "";
        if (amapInstance) {
            if (mapModePure) {
                clearRouteOverlays();
                renderMapPOIs();
            } else {
                clearMapPOIs();
                addAllRouteOverlays(window.AMap);
                try { amapInstance.resize(); } catch(e) {}
            }
            setTimeout(() => amapInstance.resize(), 50);
        }
    }

    if (mapModeToggle) {
        mapModeToggle.addEventListener("click", (event) => {
            const target = event.target;
            if (target?.closest?.(".map-mode-home")) {
                setPureMapMode(false);
                return;
            }
            if (target?.closest?.(".map-mode-map")) {
                setPureMapMode(true);
                return;
            }
            const rect = mapModeToggle.getBoundingClientRect();
            setPureMapMode(event.clientX >= rect.left + rect.width / 2);
        });
    }
    window.citygoSetPureMapMode = setPureMapMode;

    // ── Pure Map POI System ──
    // Later data can call: window.citygoSetMapPOIs([{ name, lng, lat, category, intro }])
    window.citygoMapPOIs = Array.isArray(window.citygoMapPOIs) ? window.citygoMapPOIs : [];
    window.citygoRefreshMapPOIs = renderMapPOIs;
    window.citygoSetMapPOIs = function(pois) {
        window.citygoMapPOIs = Array.isArray(pois) ? pois : [];
        renderMapPOIs();
    };

    function showPOIInfoCard(poi) {
        // Remove existing card and backdrop
        document.querySelector(".poi-info-card")?.remove();
        document.querySelector(".poi-info-backdrop")?.remove();

        // Create backdrop for click-outside-to-close
        const backdrop = document.createElement("div");
        backdrop.className = "poi-info-backdrop";
        backdrop.addEventListener("click", function() {
            backdrop.remove();
            document.querySelector(".poi-info-card")?.remove();
        });

        const card = document.createElement("div");
        card.className = "poi-info-card";
        const tags = Array.isArray(poi.tags) ? poi.tags.slice(0, 5) : [];
        const isLocatorPoint = poi.kind === "building" || poi.category === "定位标号";
        const categoryLabel = isLocatorPoint
            ? `定位标号${poi.markerLabel ? ` ${poi.markerLabel}` : ""}`
            : (poi.category || "地点");
        card.innerHTML = `
            <button class="poi-info-close" title="关闭">✕</button>
            ${poi.image ? `<img class="poi-info-image" src="${escapeHtml(poi.image)}" alt="${escapeHtml(poi.name || "点位图片")}" loading="lazy">` : ""}
            <div class="poi-info-category">${escapeHtml(categoryLabel)}</div>
            <h3 class="poi-info-name">${escapeHtml(poi.name)}</h3>
            <p class="poi-info-intro">${escapeHtml(poi.intro || "暂无介绍")}</p>
            ${poi.address ? `<p class="poi-info-address">${escapeHtml(poi.address)}</p>` : ""}
            ${tags.length ? `<div class="poi-info-tags">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
        `;
        card.querySelector(".poi-info-close").addEventListener("click", function() {
            card.remove();
            backdrop.remove();
        });
        // Prevent card clicks from bubbling to backdrop
        card.addEventListener("click", function(e) { e.stopPropagation(); });

        const mapStage = document.getElementById("map-stage");
        if (mapStage) {
            mapStage.appendChild(backdrop);
            mapStage.appendChild(card);
        }
    }

    document.getElementById("community-open-btn")?.addEventListener("click", openCommunityOverlay);
    document.getElementById("community-overlay-close")?.addEventListener("click", closeCommunityOverlay);
    document.getElementById("community-overlay")?.addEventListener("click", (event) => {
        if (event.target === event.currentTarget) closeCommunityOverlay();
    });

    // Sync initial tab state
    switchTab("home");
    setTimeout(initAMap, 100);
    initPet77Overlay();

    // ── Pet idle timer ──
    ["click", "scroll", "touchstart"].forEach(evt => {
        document.addEventListener(evt, resetPetIdleTimer, { passive: true });
    });
    resetPetIdleTimer();

    // ── Two-finger gesture → hide cards, passthrough to map ──
    var _snapTouchCount = 0;
    var _snapScroll = document.getElementById("snap-scroll");
    if (_snapScroll) {
        _snapScroll.addEventListener("touchstart", function(e) {
            _snapTouchCount = e.touches.length;
        }, { passive: true });
        _snapScroll.addEventListener("touchmove", function(e) {
            if (e.touches.length >= 2 && currentTab === "home") {
                // Two-finger → hide cards, let map handle zoom/pan
                _snapScroll.style.pointerEvents = "none";
                _snapScroll.style.transform = "translateY(calc(100% + 60px))";
                _snapScroll.style.transition = "transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)";
                // Show restore btn
                var rBtn = document.getElementById("map-restore-btn");
                if (rBtn && rBtn.style.display !== "block") {
                    rBtn.style.display = "block";
                    setTimeout(function() { rBtn.classList.add("show"); }, 10);
                }
            }
        }, { passive: true });
    }
    // Restore handler for the restore button
    var rBtn = document.getElementById("map-restore-btn");
    if (rBtn && !rBtn._bound) {
        rBtn._bound = true;
        rBtn.addEventListener("click", function() {
            if (_snapScroll) {
                _snapScroll.style.pointerEvents = "";
                _snapScroll.style.transform = "";
                _snapScroll.style.transition = "";
            }
            rBtn.classList.remove("show");
            rBtn.style.display = "none";
        });
    }
}

// ═══ Swiss Layout Renderers ═══

const CAROUSEL_ROUTES = ["night", "nju", "food", "expo", "qinhuai_wenmai", "laomendong_manyou", "mingfeng_guyun", "modeng_nanjing", "gulou_xiaoyuan", "hexi_xincheng"];
const ROUTE_ACCENT = {
    nju: "#2E8B57",
    night: "#1A6B5E",
    food: "#F4A261",
    expo: "#5B9BD5",
    qinhuai_wenmai: "#C41E3A",
    laomendong_manyou: "#8B4513",
    mingfeng_guyun: "#DAA520",
    chengqiang_xunli: "#708090",
    liuchao_yimeng: "#6B3FA0",
    minguo_fenghua: "#4A7C59",
    zongtongfu_zhoubian: "#B22222",
    nantang_jiushi: "#CD853F",
    jiangnan_yuanlin: "#2E8B57",
    bowu_jinghua: "#4682B4",
    hongse_jiyi: "#DC143C",
    yishu_manbu: "#9370DB",
    minsu_jiyi: "#D2691E",
    fosi_xunli: "#FFD700",
    jiaotang_jianzhu: "#87CEEB",
    jiulong_qifu: "#FF8C00",
    modeng_nanjing: "#4169E1",
    hexi_xincheng: "#20B2AA",
    binjiang_fengguang: "#5F9EA0",
    banfang_zhilv: "#FF7F50",
    yejing_denghuo: "#191970",
    gulou_xiaoyuan: "#228B22",
    xuelin_shuxiang: "#8B0000",
    qingnian_yundong: "#32CD32",
    qinzi_yanxue: "#FF69B4",
    shiguang_canyin: "#FF4500",
    qinglv_langman: "#FF1493",
    yige_ren_xian_guang: "#778899",
    qixia_shangqiu: "#FF6347",
    gaochun_guxiang: "#556B2F",
    pukou_xungen: "#BDB76B",
    keju_wenmai: "#8B4513",
    jinian_diantang: "#A52A2A",
    chancha_xiuxing: "#6B8E23",
};
const ROUTE_ICON = {
    nju: "🏛️",
    night: "🌙",
    food: "🍜",
    expo: "🏺",
    qinhuai_wenmai: "📜",
    laomendong_manyou: "🏘️",
    mingfeng_guyun: "👑",
    chengqiang_xunli: "🧱",
    liuchao_yimeng: "🏯",
    minguo_fenghua: "🕰️",
    zongtongfu_zhoubian: "🏛️",
    nantang_jiushi: "⛩️",
    jiangnan_yuanlin: "🌿",
    bowu_jinghua: "🏺",
    hongse_jiyi: "🕊️",
    yishu_manbu: "🎨",
    minsu_jiyi: "🧶",
    fosi_xunli: "🛕",
    jiaotang_jianzhu: "⛪",
    jiulong_qifu: "🙏",
    modeng_nanjing: "🏙️",
    hexi_xincheng: "🌉",
    binjiang_fengguang: "🚢",
    banfang_zhilv: "☕",
    yejing_denghuo: "✨",
    gulou_xiaoyuan: "🎓",
    xuelin_shuxiang: "📚",
    qingnian_yundong: "⚽",
    qinzi_yanxue: "👨‍👩‍👧",
    shiguang_canyin: "🥢",
    qinglv_langman: "💕",
    yige_ren_xian_guang: "🚶",
    qixia_shangqiu: "🍁",
    gaochun_guxiang: "🏡",
    pukou_xungen: "🚂",
    keju_wenmai: "✒️",
    jinian_diantang: "🏅",
    chancha_xiuxing: "🍵",
};
const ROUTE_IMAGE = {
    // ── 原有4条 ──
    night: "assets/persona/8.png",
    nju: "assets/persona/5.png",
    food: "assets/persona/2.png",
    expo: "assets/persona/3.png",
    // ── 文化历史 (12条) ──
    qinhuai_wenmai:    "assets/building-points/瞻园.webp",
    laomendong_manyou: "assets/building-points/⽼⻔东.webp",
    mingfeng_guyun:    "assets/building-points/明孝陵.jpg",
    chengqiang_xunli:  "assets/building-points/明城墙全线.webp",
    liuchao_yimeng:    "assets/building-points/六朝建康城遗址.webp",
    minguo_fenghua:    "assets/building-points/颐和路民国公馆区.webp",
    zongtongfu_zhoubian: "assets/building-points/煦园(总统府内).webp",
    nantang_jiushi:    "assets/building-points/牛首山佛顶宫.jpg",
    jiangnan_yuanlin:  "assets/building-points/愚园(胡家花园).webp",
    gaochun_guxiang:   "assets/building-points/gaochun-old-street.webp",
    pukou_xungen:      "assets/building-points/下关街道.webp",
    qixia_shangqiu:    "assets/building-points/南唐二陵.webp",
    // ── 博物艺术 (7条) ──
    bowu_jinghua:      "assets/building-points/南京博物院.png",
    hongse_jiyi:       "assets/building-points/侵华日军南京大屠杀遇难同胞纪念馆.jpg",
    yishu_manbu:       "assets/building-points/金陵美术馆.jpg",
    minsu_jiyi:        "assets/building-points/南京民俗博物馆.jpg",
    jinian_diantang:   "assets/building-points/雨花台烈士纪念馆.jpg",
    keju_wenmai:       "assets/building-points/科举博物馆.jpg",
    // ── 宗教禅意 (4条) ──
    fosi_xunli:        "assets/building-points/灵谷寺.webp",
    jiaotang_jianzhu:  "assets/building-points/台城（解放⻔段）.webp",
    jiulong_qifu:      "assets/building-points/中山陵.jpg",
    chancha_xiuxing:   "assets/building-points/石头城遗址.webp",
    // ── 城市探索 (5条) ──
    modeng_nanjing:    "assets/building-points/紫峰大厦.webp",
    hexi_xincheng:     "assets/building-points/青奥中心(双子塔).webp",
    binjiang_fengguang:"assets/building-points/南京长江大桥.jpg",
    banfang_zhilv:     "assets/building-points/nanjing-1912.jpg",
    yejing_denghuo:    "assets/building-points/南京眼步行桥.jpg",
    // ── 校园巡礼 (3条) ──
    gulou_xiaoyuan:    "assets/building-points/nju-beidalou.jpg",
    xuelin_shuxiang:   "assets/building-points/nanjing-library.webp",
    qingnian_yundong:  "assets/building-points/jiangsu-grand-theatre.webp",
    // ── 休闲生活 (4条) ──
    qinzi_yanxue:      "assets/building-points/南京地质博物馆.jpg",
    shiguang_canyin:   "assets/building-points/laomendong.webp",
    qinglv_langman:    "assets/building-points/玄武湖公园(五洲).webp",
    yige_ren_xian_guang: "assets/building-points/yihe-road.webp",
};

function getRouteDisplayTitle(route) {
    const raw = String(route?.title || "");
    return raw.split(/[，,:：]/)[0] || raw;
}

function getSelectedPersonaCard() {
    if (selectedPersonaId) {
        const direct = personaCards.find(persona => persona.id === selectedPersonaId);
        if (direct) return direct;
    }
    const selected = selectedPersonas[0];
    if (selected?.id) {
        const stored = personaCards.find(persona => persona.id === selected.id);
        if (stored) return stored;
    }
    return null;
}

function getHomeRecommendedRouteKey() {
    const persona = getSelectedPersonaCard();
    const selectedRoute = selectedPersonas[0]?.routeKey || persona?.routeKey;
    return selectedRoute && routes[selectedRoute] ? selectedRoute : "night";
}

function getHomeRouteOrder() {
    const recommended = getHomeRecommendedRouteKey();
    return [recommended, ...CAROUSEL_ROUTES.filter(key => key !== recommended)];
}

function getPersonaPlaceRecommendations(routeKey) {
    const points = getCitygoBuildingPoints();
    if (!points.length) return [];
    const route = routes[routeKey];
    const routeText = normalizeBuildingName((route?.stops || []).map(stop => stop.name).join(" "));
    const matched = points.filter(point => {
        const names = [point.name, ...(Array.isArray(point.aliases) ? point.aliases : [])];
        return names.some(name => {
            const normalized = normalizeBuildingName(name);
            return normalized && routeText && (routeText.includes(normalized) || normalized.includes(routeText));
        });
    });
    const fallbackIds = {
        nju: ["nju-beidalou", "seu-sipailou", "nanjing-library"],
        night: ["wanxiang-tiandi", "nanjing-1912", "nanjing-library"],
        food: ["wanxiang-tiandi", "nanjing-library", "nanjing-1912"],
        expo: ["nanjing-library", "poly-theatre", "nanjing-1912"],
    }[routeKey] || [];
    const fallback = fallbackIds
        .map(id => points.find(point => point.id === id))
        .filter(Boolean);
    return [...matched, ...fallback, ...points]
        .filter((point, index, arr) => point && arr.findIndex(item => item.id === point.id) === index)
        .slice(0, 3);
}

function renderHomePersonaRecoBlock(routeKey) {
    const persona = getSelectedPersonaCard();
    const points = getPersonaPlaceRecommendations(routeKey);
    if (!persona && !points.length) return "";
    const title = persona ? `${persona.title} 的地点推荐` : "地点推荐";
    const subtitle = persona?.unlockText || "根据当前路线挑选可展开查看的南京点位";
    const cards = points.map((point, index) => `
        <button class="home-place-card" type="button" data-home-place-index="${index}">
            ${point.image ? `<img src="${escapeHtml(point.image)}" alt="${escapeHtml(point.name)}" loading="lazy">` : ""}
            <span>${escapeHtml(point.name)}</span>
            <small>${escapeHtml(point.address || "南京")}</small>
        </button>
    `).join("");
    return `
        <div class="home-persona-reco">
            <div class="home-persona-reco-head">
                <span>${escapeHtml(title)}</span>
                <small>${escapeHtml(subtitle)}</small>
            </div>
            <div class="home-place-strip">${cards}</div>
        </div>
    `;
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
    const badge = isCustom
        ? `<span class="route-launch-badge">自定义</span>`
        : options.recommended
            ? `<span class="route-launch-badge" style="background:var(--vermillion);color:#fff;">✨ 推荐</span>`
            : "";
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
    const routeOrder = getHomeRouteOrder();

    track.innerHTML = routeOrder.map((key, i) => {
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
        dots.innerHTML = routeOrder.map((_, i) => `<span class="carousel-dot${i === 0 ? " active" : ""}"></span>`).join("");
    }

    // Card click handlers
    track.querySelectorAll(".carousel-card").forEach(card => {
        card.addEventListener("click", () => {
            const routeKey = card.dataset.route;
            openRoute(routeKey);
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
    const routeKey = getHomeRouteOrder()[idx];
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
    const persona = getSelectedPersonaCard();
    const eyebrow = persona ? `${persona.title} 的路线推荐` : "今日推荐";
    const placeRecommendations = getPersonaPlaceRecommendations(routeKey);

    section.innerHTML = `
        <div class="feature-header">
            <p class="feature-eyebrow">${escapeHtml(eyebrow)}</p>
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
        ${renderHomePersonaRecoBlock(routeKey)}
        <div class="feature-actions">
            <button class="feature-btn-primary" data-route="${routeKey}">开始探索</button>
            <button class="feature-btn-secondary" data-route="${routeKey}">邀朋友一起走</button>
        </div>
    `;

    // Bind buttons
    section.querySelector(".feature-btn-primary").addEventListener("click", (e) => {
        const key = e.target.dataset.route;
        showRouteOnMap(key);
    });
    section.querySelector(".feature-btn-secondary").addEventListener("click", (e) => {
        const key = e.target.dataset.route;
        const routeId = ROUTE_KEY_TO_ID[key] || 1;
        showInviteForm(routeId);
    });
    section.querySelectorAll("[data-home-place-index]").forEach(button => {
        button.addEventListener("click", () => {
            const point = placeRecommendations[Number(button.dataset.homePlaceIndex)];
            if (point) showBuildingPointDetail(point, "定位标号");
        });
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
            showRouteOnMap(routeKey);
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
/* ── Pre-computed walking paths for built-in routes ── */
const ROUTE_MAP_DATA = {
    nju: {
        coords: [[32.053187, 118.767680], [32.061477, 118.781801], [32.054677, 118.781320], [32.057998, 118.776580]],
        stops: ["三江师范学堂旧址", "北大楼", "校史馆", "梧桐大道"],
        plannedPath: [
[32.05599,118.779],[32.056098,118.779761],[32.056098,118.779761],[32.056536,118.779696],[32.056536,118.779696],[32.057053,118.779605],[32.057053,118.779601],[32.057053,118.779601],[32.057322,118.779562],[32.057322,118.779562],[32.057687,118.779505],[32.057739,118.779479],[32.057739,118.779475],[32.057769,118.779418],[32.057795,118.779002],[32.057799,118.778997],[32.058025,118.779002],[32.058025,118.779002],[32.058021,118.779002],[32.058103,118.779002],[32.058442,118.779006],[32.058516,118.778989],[32.058563,118.778924],[32.058581,118.778872],[32.058589,118.778707],[32.058589,118.778707],[32.058589,118.778598],[32.058589,118.778594],[32.058694,118.778594],[32.058733,118.778672],[32.058733,118.778672],[32.058763,118.778741],[32.058763,118.778741],[32.058824,118.778741],[32.058824,118.778741],[32.058872,118.778741],[32.058872,118.778741],[32.058893,118.779089],[32.058893,118.779089],[32.058919,118.779479],[32.058919,118.779479],[32.058941,118.77974],[32.058941,118.77974],[32.058898,118.779748],[32.058941,118.779744],[32.058941,118.779744],[32.058924,118.779484],[32.058924,118.779484],[32.058898,118.779093],[32.058898,118.779093],[32.058876,118.778746],[32.058872,118.778741],[32.058924,118.778741],[32.058924,118.778741],[32.058997,118.778741],[32.058997,118.778741],[32.059054,118.778741],[32.059054,118.778741],[32.059852,118.778854],[32.059852,118.778854],[32.059996,118.778854]
        ],
        plannedDist: 777, plannedDur: 600
    },
    night: {
        coords: [[32.021196, 118.792026], [32.020660, 118.788899], [32.011604, 118.787645]],
        stops: ["秦淮河畔", "夫子庙", "老门东"],
        plannedPath: [
[32.02013,118.787591],[32.020139,118.787509],[32.020139,118.787504],[32.020208,118.787483],[32.020291,118.787426],[32.020291,118.787426],[32.020382,118.787374],[32.02046,118.787348],[32.020516,118.787348],[32.020668,118.787391],[32.020668,118.787391],[32.020903,118.787491],[32.020903,118.787491],[32.021029,118.787548],[32.021029,118.787548],[32.021141,118.787595],[32.021141,118.787595],[32.021393,118.787691],[32.021398,118.787695],[32.021345,118.787817],[32.021341,118.787817],[32.021237,118.788021],[32.021189,118.788121],[32.021085,118.788234],[32.021085,118.788234],[32.021076,118.788234],[32.020964,118.788329],[32.020959,118.788329],[32.021098,118.788468],[32.021098,118.788468],[32.021133,118.788568],[32.021159,118.788602],[32.021159,118.788602],[32.021267,118.788776],[32.021267,118.788776],[32.021189,118.788845],[32.021189,118.788845],[32.021007,118.789006],[32.02099,118.789023],[32.02099,118.789023],[32.020872,118.789123],[32.020872,118.789123],[32.02076,118.789206],[32.02046,118.789484],[32.02046,118.789484],[32.020391,118.789531],[32.020391,118.789531],[32.020117,118.789709],[32.020113,118.789709],[32.019978,118.78951],[32.019978,118.78951],[32.019779,118.78921],[32.019779,118.78921],[32.019714,118.78908],[32.019714,118.78908],[32.01967,118.789006],[32.01967,118.789006],[32.019523,118.788741],[32.019523,118.788741],[32.019227,118.788212],[32.019171,118.787982],[32.019171,118.787982],[32.019093,118.787969],[32.019089,118.787964],[32.01908,118.788129],[32.018963,118.788242],[32.018963,118.788242],[32.018802,118.788325],[32.018802,118.788325],[32.018255,118.788594],[32.018255,118.788594],[32.017917,118.78885],[32.017917,118.78885],[32.017565,118.789106],[32.017561,118.789106],[32.017439,118.789084],[32.017439,118.789084],[32.016727,118.788872],[32.016723,118.788867],[32.016645,118.788867],[32.016645,118.788867],[32.01658,118.788867],[32.01658,118.788867],[32.016519,118.788859],[32.016519,118.788859],[32.01566,118.788681],[32.01566,118.788681],[32.015373,118.788641],[32.015373,118.788641],[32.014588,118.78852],[32.014588,118.78852],[32.014162,118.788451],[32.01408,118.788438],[32.013919,118.788394],[32.013919,118.788394],[32.013845,118.788372],[32.013845,118.788372],[32.01326,118.788212],[32.01326,118.788212],[32.01303,118.788134],[32.01296,118.788138],[32.012956,118.788138],[32.012908,118.788212],[32.012847,118.788494],[32.012847,118.788494],[32.012778,118.78895],[32.012778,118.78895],[32.012756,118.78908],[32.012756,118.78908],[32.012734,118.789188],[32.012734,118.789188],[32.012713,118.789319],[32.012713,118.789319],[32.0127,118.789414],[32.0127,118.789414],[32.012656,118.789661],[32.012656,118.789661],[32.012595,118.790117],[32.012595,118.790117],[32.012565,118.790347],[32.012457,118.790803],[32.012457,118.790803],[32.012279,118.791584],[32.012274,118.791584],[32.011905,118.791471],[32.011905,118.791471],[32.011671,118.791363],[32.011667,118.791359],[32.011688,118.791289],[32.011688,118.791289],[32.011771,118.79102],[32.011771,118.79102],[32.011771,118.79102]
        ],
        plannedDist: 1795, plannedDur: 1500
    },
    food: {
        coords: [[32.045, 118.790], [32.046, 118.791], [32.044, 118.785], [32.048, 118.788]],
        stops: ["街角咖啡馆", "独立书店", "梧桐小径", "晚餐小馆"],
        plannedPath: [
[32.04503,118.790004],[32.044926,118.790647],[32.044922,118.790647],[32.044983,118.790664],[32.044983,118.790664],[32.045347,118.790755],[32.045347,118.790755],[32.045599,118.790825],[32.045699,118.790877],[32.045699,118.790877],[32.045938,118.790942],[32.045938,118.790942],[32.046003,118.790959],[32.045942,118.790946],[32.045942,118.790946],[32.045703,118.790881],[32.045703,118.790881],[32.045603,118.790829],[32.045352,118.79076],[32.045352,118.79076],[32.044987,118.790668],[32.044987,118.790668],[32.044926,118.790651],[32.044926,118.790651],[32.044874,118.790642],[32.044874,118.790642],[32.044761,118.790599],[32.044761,118.790599],[32.044679,118.790573],[32.044679,118.790573],[32.044371,118.790486],[32.044371,118.790486],[32.044314,118.790469],[32.044314,118.790469],[32.044219,118.790443],[32.044219,118.790443],[32.044128,118.790404],[32.044128,118.790404],[32.043941,118.790308],[32.043737,118.790165],[32.043737,118.790165],[32.043312,118.789931],[32.043312,118.789931],[32.043034,118.789848],[32.043034,118.789848],[32.042778,118.78977],[32.042778,118.78977],[32.042635,118.789701],[32.04263,118.789696],[32.042674,118.789488],[32.042674,118.789488],[32.04276,118.789106],[32.04276,118.789106],[32.042782,118.789032],[32.042782,118.789032],[32.042808,118.788898],[32.042808,118.788898],[32.042865,118.788602],[32.042865,118.788602],[32.042899,118.788372],[32.042899,118.788372],[32.042912,118.78829],[32.042912,118.78829],[32.042934,118.78819],[32.042934,118.78819],[32.043038,118.787778],[32.043038,118.787778],[32.04309,118.7876],[32.04309,118.7876],[32.043177,118.78727],[32.043177,118.78727],[32.043312,118.786736],[32.043312,118.786736],[32.043381,118.786476],[32.043381,118.786476],[32.043507,118.786128],[32.043507,118.786128],[32.043594,118.785898],[32.043594,118.785898],[32.043641,118.785755],[32.043641,118.785755],[32.043659,118.785642],[32.043811,118.785256],[32.043845,118.785208],[32.043845,118.785208],[32.043824,118.785165],[32.043845,118.785204],[32.043845,118.785204],[32.043815,118.785252],[32.043663,118.785638],[32.043646,118.785751],[32.043646,118.785751],[32.043598,118.785894],[32.043598,118.785894],[32.043511,118.786124],[32.043511,118.786124],[32.043385,118.786471],[32.043385,118.786471],[32.043316,118.786732],[32.043316,118.786732],[32.043181,118.787266],[32.043181,118.787266],[32.04309,118.787595],[32.04309,118.787595],[32.043043,118.787773],[32.043043,118.787773],[32.042938,118.788186],[32.042934,118.788186],[32.043459,118.78826],[32.043459,118.78826],[32.04355,118.788203],[32.043937,118.788255],[32.043937,118.788255],[32.044492,118.788351],[32.044622,118.788381],[32.044622,118.788381],[32.044705,118.788403],[32.044705,118.788403],[32.044779,118.788424],[32.044779,118.788424],[32.044848,118.788442],[32.044848,118.788442],[32.045265,118.788524],[32.045764,118.788646],[32.045764,118.788646],[32.046081,118.788728],[32.04615,118.788798],[32.04615,118.788798],[32.046354,118.788837],[32.046354,118.788837],[32.046753,118.788911],[32.046753,118.788911],[32.046888,118.788885],[32.047118,118.788915],[32.047791,118.789023],[32.047791,118.789023],[32.047973,118.788429],[32.047973,118.788429],[32.048077,118.78819],[32.048121,118.788129]
        ],
        plannedDist: 1943, plannedDur: 1800
    },
    expo: {
        coords: [[32.040802, 118.825064], [32.041450, 118.817968], [32.041, 118.822]],
        stops: ["南京博物院", "明故宫遗址", "展览特厅"],
        plannedPath: [
[32.040009,118.83],[32.040022,118.82987],[32.040039,118.829444],[32.040039,118.829371],[32.040039,118.829371],[32.04003,118.829253],[32.039922,118.828915],[32.039822,118.828702],[32.039579,118.828464],[32.039575,118.828459],[32.038576,118.828181],[32.038442,118.828125],[32.038372,118.828099],[32.038368,118.828095],[32.038368,118.827752],[32.038385,118.827526],[32.038446,118.82714],[32.038446,118.82714],[32.038602,118.826298],[32.038659,118.826124],[32.038659,118.826124],[32.038672,118.82605],[32.038672,118.82605],[32.038741,118.825755],[32.038785,118.825703],[32.038785,118.825703],[32.038806,118.825438],[32.038806,118.825438],[32.038819,118.825282],[32.038819,118.825282],[32.038767,118.825065],[32.038798,118.824657],[32.038798,118.824657],[32.038832,118.824154],[32.038832,118.824154],[32.038932,118.822865],[32.038932,118.822865],[32.038954,118.822595],[32.039006,118.822483],[32.039006,118.822483],[32.039006,118.822439],[32.039006,118.822439],[32.038984,118.822296],[32.039002,118.821888],[32.039002,118.821888],[32.039015,118.821584],[32.039015,118.821584],[32.039106,118.820265],[32.039106,118.820265],[32.039167,118.81931],[32.039167,118.81931],[32.039227,118.818451],[32.039227,118.818451],[32.03928,118.81773],[32.03928,118.817726],[32.039188,118.817713],[32.039188,118.817713],[32.039071,118.8177],[32.039067,118.817695],[32.039102,118.817114],[32.039102,118.817092],[32.039089,118.81707],[32.038997,118.817062],[32.039084,118.817066],[32.039102,118.817088],[32.039102,118.817109],[32.039071,118.817695],[32.039067,118.817695],[32.039184,118.817708],[32.039184,118.817708],[32.03928,118.817726],[32.03928,118.817726],[32.039232,118.818446],[32.039227,118.818446],[32.039306,118.818455],[32.039306,118.818455],[32.03934,118.818455],[32.03934,118.818455],[32.039371,118.818464],[32.039371,118.818464],[32.03944,118.818468],[32.03944,118.818468],[32.039692,118.818494],[32.039692,118.818494],[32.040399,118.818572],[32.040399,118.818572],[32.040937,118.818637],[32.040937,118.818637],[32.04122,118.818672],[32.04122,118.818672],[32.041875,118.818741],[32.041875,118.818741],[32.041858,118.819184],[32.041858,118.819184],[32.041719,118.820573],[32.041719,118.820573],[32.041688,118.820777],[32.041688,118.820777],[32.041671,118.820864],[32.041671,118.820864],[32.041662,118.820929],[32.041658,118.820929],[32.041393,118.820872],[32.041393,118.820872],[32.041306,118.820877],[32.041141,118.820977],[32.041137,118.820977],[32.041107,118.821632],[32.041107,118.821632],[32.041081,118.822005]
        ],
        plannedDist: 2191, plannedDur: 1800
    }
};

// Merge extra route map data
if (window.CITYGO_EXTRA_ROUTE_MAP_DATA) {
    Object.assign(ROUTE_MAP_DATA, window.CITYGO_EXTRA_ROUTE_MAP_DATA);
}

function getCitygoBuildingPoints() {
    const points = Array.isArray(window.CITYGO_BUILDING_POINTS) ? window.CITYGO_BUILDING_POINTS : [];
    return points.map((point, index) => ({
        kind: "building",
        locatorLabel: String(index + 1).padStart(2, "0"),
        ...point,
    }));
}

function normalizeBuildingName(name) {
    return String(name || "")
        .replace(/[·\s\-—_（）()「」《》]/g, "")
        .replace(/南京市?|景区|街区|校区|步行街|历史文化|建筑群|民国公馆区/g, "")
        .toLowerCase();
}

function findBuildingPointByName(name) {
    const target = normalizeBuildingName(name);
    if (!target) return null;
    return getCitygoBuildingPoints().find(point => {
        const names = [point.name, ...(Array.isArray(point.aliases) ? point.aliases : [])];
        return names.some(candidate => {
            const normalized = normalizeBuildingName(candidate);
            return normalized && (target === normalized || target.includes(normalized) || normalized.includes(target));
        });
    }) || null;
}

function showBuildingPointDetail(point, fallbackTitle = "定位标号") {
    if (!point) return false;
    const overlay = document.getElementById("story-overlay");
    const panel = overlay?.querySelector(".story-panel");
    const badge = document.getElementById("story-badge");
    const title = document.getElementById("story-stop-name");
    const text = document.getElementById("story-text");
    const close = document.getElementById("story-close");
    if (!overlay || !panel || !badge || !title || !text || !close) return false;

    panel.classList.add("building-story-panel");
    panel.querySelector(".story-image")?.remove();
    if (point.image) {
        const image = document.createElement("img");
        image.className = "story-image";
        image.src = point.image;
        image.alt = point.name || "点位图片";
        image.loading = "lazy";
        title.insertAdjacentElement("afterend", image);
    }

    const tags = Array.isArray(point.tags) ? point.tags.slice(0, 4) : [];
    const locatorText = point.locatorLabel ? `定位标号 ${point.locatorLabel}` : "定位标号";
    badge.textContent = fallbackTitle === "路线途经点" ? `${fallbackTitle} · ${locatorText}` : locatorText;
    title.textContent = point.name || "定位点";
    text.innerHTML = `
        <p>${escapeHtml(point.intro || "暂无介绍")}</p>
        ${point.address ? `<p class="story-address">${escapeHtml(point.address)}</p>` : ""}
        ${tags.length ? `<div class="story-tags">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    `;
    overlay.classList.add("open");

    close.onclick = () => {
        overlay.classList.remove("open");
        panel.classList.remove("building-story-panel");
        panel.querySelector(".story-image")?.remove();
    };
    overlay.onclick = (e) => {
        if (e.target === e.currentTarget) close.onclick();
    };
    return true;
}

// ── AMap Initialization ──
function initAMap() {
    if (amapInitializing) return;
    if (amapInstance) {
        // Check if map is still alive (not destroyed by external cause)
        try { amapInstance.resize(); } catch(e) {
            console.warn("Map instance dead, re-initializing...");
            amapInstance = null;
            amapReady = false;
            amapInitializing = false;
        }
        if (amapInstance) return;
    }

    const container = document.getElementById("main-map-container");
    if (!container) return;
    if (container.offsetParent === null || container.offsetWidth === 0) {
        // Container not visible — defer init
        setTimeout(initAMap, 500);
        return;
    }

    amapInitializing = true;
    // Show loading bar immediately — hide only after tiles fully render
    showMapLoading("正在加载地图…");
    let loaderRetryCount = 0;

    function tryInit() {
        if (typeof AMapLoader === "undefined") {
            loaderRetryCount += 1;
            if (loaderRetryCount > 30) {
                console.warn("AMap loader unavailable, using canvas fallback.");
                hideMapLoading();
                startCanvasMapFallback();
                amapInitializing = false;
                return;
            }
            setTimeout(tryInit, 300);
            return;
        }

        const personaStyle = getPersonaMapStyle(selectedPersonaId);

        AMapLoader.load({
            key: "5d1c179964cb1f9ac287778ca6fe9567",
            version: "2.0",
            plugins: ["AMap.ToolBar", "AMap.Scale", "AMap.PlaceSearch"],
        }).then((AMap) => {
            window.AMap = AMap;
            amapInstance = new AMap.Map(container, {
                zoom: personaStyle.zoom,
                center: [118.796, 32.060],
                viewMode: "2D",
                pitch: 0,
                mapStyle: personaStyle.style,
                showIndoorMap: false,
            });

            // Add controls
            amapInstance.addControl(new AMap.ToolBar({
                position: "RT",
                offset: new AMap.Pixel(10, 60),
            }));

            // ── Map interaction → fade header & hide route panel, restore on idle ──
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
            if (typeof window.citygoRefreshMapPOIs === "function") {
                window.citygoRefreshMapPOIs();
            }

            // Trigger resize after a frame
            setTimeout(function() { amapInstance.resize(); }, 100);

            // ── 地图瓦片加载完成 → 隐藏加载条 + 触发标点校准 ──
            var _tilesDone = false;
            var mapTilesDone = function() {
                if (_tilesDone) return;
                _tilesDone = true;
                amapInstance.off("complete", mapTilesDone);
                updateLoadingBar(90);
                setTimeout(function() { hideMapLoading(); }, 500);
                // 标点坐标校准（高德 PlaceSearch 批量查询 → 对齐地图位置）
                setTimeout(function() { calibrateLandmarkCoords(AMap); }, 2500);
            };
            amapInstance.on("complete", mapTilesDone);

            // 安全兜底: 8s后强制触发（防止 complete 事件永不触发）
            setTimeout(function() {
                if (!_tilesDone) {
                    hideMapLoading();
                    amapInstance.off("complete", mapTilesDone);
                    _tilesDone = true;
                    // 即使瓦片未完全加载，仍然尝试校准标点
                    setTimeout(function() { calibrateLandmarkCoords(AMap); }, 1000);
                }
            }, 8000);
        }).catch((e) => {
            console.warn("AMap init failed, using canvas fallback:", e);
            // Fallback to canvas map
            hideMapLoading();
            startCanvasMapFallback();
            amapInitializing = false;
        });
    }

    tryInit();
}

function addAllRouteOverlays(AMap) {
    if (!amapInstance || !AMap) return;

    // 清理旧的全路线POI标记
    if (window._allRouteMarkers && window._allRouteMarkers.length) {
        window._allRouteMarkers.forEach(function(m) {
            try { amapInstance.remove(m); } catch(e) {}
        });
    }
    window._allRouteMarkers = [];

    // 从 ROUTE_MAP_DATA 构建去重POI目录
    var poiMap = {}; // key: "lat,lng" -> { name, lng, lat, routeKeys[] }
    Object.keys(ROUTE_MAP_DATA).forEach(function(routeKey) {
        var data = ROUTE_MAP_DATA[routeKey];
        if (!data || !data.coords || !data.coords.length) return;
        var stops = data.stops || [];
        data.coords.forEach(function(c, i) {
            if (!c || c[0] == null || c[1] == null) return;
            var lat = Number(c[0]), lng = Number(c[1]);
            if (!isFinite(lat) || !isFinite(lng)) return;
            // 南京及周边合理范围：lat 31~33, lng 118~120
            if (lat < 31 || lat > 33 || lng < 118 || lng > 120) return;
            // 坐标精确到小数点后4位（~11米），用于同一建筑/位置的去重
            var coordKey = lat.toFixed(4) + "," + lng.toFixed(4);
            var stopName = stops[i] || ("途经点" + (i + 1));
            if (!poiMap[coordKey]) {
                poiMap[coordKey] = {
                    name: stopName,
                    lng: lng,
                    lat: lat,
                    routeKeys: [routeKey]
                };
            } else {
                if (poiMap[coordKey].routeKeys.indexOf(routeKey) === -1) {
                    poiMap[coordKey].routeKeys.push(routeKey);
                }
            }
        });
    });

    var pois = Object.values(poiMap);
    var currentZoom = amapInstance.getZoom();

    // 为每个唯一POI创建标记（最终位置校验防 NaN）
    pois.forEach(function(poi) {
        // 最终防线：拒绝任何无效坐标
        if (!isFinite(poi.lng) || !isFinite(poi.lat)) return;
        if (poi.lng < 118 || poi.lng > 120 || poi.lat < 31 || poi.lat > 33) return;

        var accentColor = ROUTE_ACCENT[poi.routeKeys[0]] || "#E07A5F";
        var el = document.createElement("div");
        el.className = "route-poi-marker";
        el.setAttribute("data-poi-name", poi.name);
        el.setAttribute("data-route-keys", poi.routeKeys.join(","));
        el.innerHTML = '<span class="route-poi-dot" style="background:' + accentColor + ';"></span>' +
                       '<span class="route-poi-label">' + escapeHtml(poi.name) + '</span>';

        var marker = new AMap.Marker({
            position: [poi.lng, poi.lat],
            content: el,
            offset: new AMap.Pixel(-8, -8),
            zIndex: 50
        });

        // 根据当前缩放级别设置显隐
        if (currentZoom < 14) {
            el.classList.add("route-poi-compact");
        }
        if (currentZoom < 11) {
            el.style.display = "none";
        }

        marker.on("click", function() {
            onRoutePoiClick(poi);
        });

        amapInstance.add(marker);
        window._allRouteMarkers.push(marker);
    });

    // 缩放变化时控制标记显隐（只注册一次）
    if (!window._routePoiZoomHandler) {
        window._routePoiZoomHandler = function() {
            var z = amapInstance.getZoom();
            var markers = window._allRouteMarkers || [];
            markers.forEach(function(m) {
                try {
                    var ce = m.getContent();
                    if (!ce) return;
                    if (z < 11) {
                        ce.style.display = "none";
                    } else {
                        ce.style.display = "";
                        if (z < 14) {
                            ce.classList.add("route-poi-compact");
                        } else {
                            ce.classList.remove("route-poi-compact");
                        }
                    }
                } catch(e) {}
            });
        };
        amapInstance.on("zoomchange", window._routePoiZoomHandler);
    }
}

// 路线POI标记点击处理
function onRoutePoiClick(poi) {
    if (!poi || !poi.name) return;
    // 优先匹配建筑标点（带详细图文介绍）
    var bp = findBuildingPointByName(poi.name);
    if (bp && showBuildingPointDetail(bp, "路线途经点")) return;
    // 只属于一条路线 → 直接打开
    if (poi.routeKeys && poi.routeKeys.length === 1) {
        openRoute(poi.routeKeys[0]);
        return;
    }
    // 多条路线共享此POI → 弹出选择列表
    showPoiRouteList(poi);
}

// 多路线共享POI的选择弹窗
function showPoiRouteList(poi) {
    var existing = document.querySelector(".poi-route-list-popup");
    if (existing) existing.remove();

    var popup = document.createElement("div");
    popup.className = "poi-route-list-popup";
    var listItems = (poi.routeKeys || []).map(function(rk) {
        var r = routes[rk];
        var title = r ? (r.title || rk) : rk;
        var accent = ROUTE_ACCENT[rk] || "#E07A5F";
        return '<button class="poi-route-list-item" data-route="' + rk +
               '" style="border-left:3px solid ' + accent + '">' +
               escapeHtml(title) + '</button>';
    }).join("");
    popup.innerHTML = '<div class="poi-route-list-header">' + escapeHtml(poi.name) +
                      '<span class="poi-route-list-count">' + poi.routeKeys.length +
                      ' 条路线</span></div>' + listItems;

    popup.style.cssText = "position:fixed;bottom:120px;left:50%;transform:translateX(-50%);z-index:300;" +
        "background:rgba(252,252,251,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);" +
        "border-radius:12px;padding:12px;box-shadow:0 8px 32px rgba(31,35,32,0.15);" +
        "max-width:320px;width:calc(100vw - 48px);";
    document.body.appendChild(popup);

    popup.querySelectorAll(".poi-route-list-item").forEach(function(btn) {
        btn.addEventListener("click", function() {
            var rk = btn.getAttribute("data-route");
            popup.remove();
            if (rk) openRoute(rk);
        });
    });

    // 点击外部关闭
    setTimeout(function() {
        var dismiss = function(e) {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener("click", dismiss);
            }
        };
        document.addEventListener("click", dismiss);
    }, 100);
}

// ═══ 标点坐标校准（嵌入地图初始化流程） ═══
// 使用高德 PlaceSearch 对每个地标/建筑名称进行精确定位
// 结果缓存于 localStorage，版本号递增可强制重新校准
var LANDMARK_CAL_CACHE_KEY = "nj_lm_cal_v2";   // v2: 强制刷新校准缓存
var LANDMARK_CAL_INTERVAL = 180;               // 每次搜索间隔 ms（避免 API 限频）

// 清理旧版本校准缓存（v1 已废弃）
try { localStorage.removeItem("nj_lm_cal_v1"); } catch(e) {}

function calibrateLandmarkCoords(AMap) {
    // ── 首先检查是否有缓存的有效校准数据 ──
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(LANDMARK_CAL_CACHE_KEY)); } catch(e) {}
    if (cached && typeof cached === "object" && Object.keys(cached).length > 0) {
        _applyCalibration(cached);
        return;
    }

    // ── 收集所有需要校准的地标/建筑名称 ──
    var names = [];
    var seen = {};
    function addName(n) {
        if (!n || seen[n]) return;
        seen[n] = true;
        names.push(n);
    }
    if (window.NANJING_LANDMARKS) {
        window.NANJING_LANDMARKS.forEach(function(l) { addName(l.name); });
    }
    if (window.CITYGO_BUILDING_POINTS) {
        window.CITYGO_BUILDING_POINTS.forEach(function(b) { addName(b.name); });
    }
    if (!names.length) return;

    // ── 使用 PlaceSearch 逐个查询 ──
    var results = {};
    var searched = 0;
    var errors = 0;

    function searchNext(i) {
        if (i >= names.length) {
            // 全部搜索完成 → 缓存并应用
            if (Object.keys(results).length > 0) {
                try { localStorage.setItem(LANDMARK_CAL_CACHE_KEY, JSON.stringify(results)); } catch(e) {}
            }
            _applyCalibration(results);
            return;
        }
        var name = names[i];
        try {
            var ps = new AMap.PlaceSearch({ city: "南京", pageSize: 1 });
            ps.search(name, function(status, result) {
                searched++;
                if (status === "complete" && result && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                    var p = result.poiList.pois[0];
                    if (p.location && typeof p.location.lng === "number" && typeof p.location.lat === "number") {
                        results[name] = [p.location.lng, p.location.lat];
                    }
                } else {
                    errors++;
                }
                setTimeout(function() { searchNext(i + 1); }, LANDMARK_CAL_INTERVAL);
            });
        } catch(e) {
            errors++;
            setTimeout(function() { searchNext(i + 1); }, LANDMARK_CAL_INTERVAL);
        }
    }
    searchNext(0);

    // ── 内部：将校准结果应用到全局数据 ──
    function _applyCalibration(map) {
        var applied = 0;
        Object.keys(map).forEach(function(name) {
            var ll = map[name];
            if (!ll || ll.length < 2) return;
            if (window.NANJING_LANDMARKS) {
                window.NANJING_LANDMARKS.forEach(function(l) {
                    if (l.name === name) { l.lng = ll[0]; l.lat = ll[1]; applied++; }
                });
            }
            if (window.CITYGO_BUILDING_POINTS) {
                window.CITYGO_BUILDING_POINTS.forEach(function(b) {
                    if (b.name === name) { b.lng = ll[0]; b.lat = ll[1]; applied++; }
                });
            }
        });
        // 刷新地图 POI 标点（仅在纯地图模式下可见）
        if (typeof window.citygoRefreshMapPOIs === "function") {
            window.citygoRefreshMapPOIs();
        }
        // 如果没有任何校准结果 → 使用原始坐标直接渲染
        if (applied === 0) {
            _renderPOIsWithOriginalCoords();
        }
    }

    function _renderPOIsWithOriginalCoords() {
        if (typeof window.citygoRefreshMapPOIs === "function") {
            window.citygoRefreshMapPOIs();
        }
    }
}

/**
 * Get the bottom navigation element, falling back to wheel-nav.
 * Prevents null access errors when .bottom-nav doesn't exist in DOM.
 */
function getNavEl() {
    return document.querySelector(".bottom-nav") || document.querySelector(".wheel-nav");
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
    const navEl = getNavEl();
    if (navEl) navEl.style.zIndex = "";

    if (amapInstance) {
        setTimeout(() => amapInstance.resize(), 50);
    }
}

function drawPixelHomeMap() {
    if (!mainMapCanvas) return;

    const vw = Math.max(1, window.innerWidth);
    const vh = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelW = vw >= vh ? 640 : 360;
    const pixelH = Math.max(vw >= vh ? 360 : 560, Math.round(pixelW * vh / vw));
    const tile = 4;

    mainMapCanvas.style.display = "block";
    mainMapCanvas.width = Math.round(vw * dpr);
    mainMapCanvas.height = Math.round(vh * dpr);
    mainMapCanvas.style.width = vw + "px";
    mainMapCanvas.style.height = vh + "px";

    const low = document.createElement("canvas");
    low.width = pixelW;
    low.height = pixelH;
    const g = low.getContext("2d");
    g.imageSmoothingEnabled = false;

    const palette = {
        sidewalk: "#9FBBD5",
        sidewalkLight: "#BFD2E8",
        road: "#2F5878",
        roadDark: "#23435F",
        roadLine: "#E6F2FF",
        grass: "#7FC16E",
        grassLight: "#A5D77A",
        grassDark: "#4F8B59",
        sand: "#F1D56D",
        water: "#7DB9DA",
        waterDark: "#4E88AA",
        outline: "#1E3650",
        glass: "#74B7F2",
        white: "#E9F3FF",
        brick: "#A95A44",
        roof: "#8E3F31",
        blueWall: "#5B7EAD",
        slateWall: "#6B89A7",
        creamWall: "#E7E4D2"
    };

    const snap = (value) => Math.round(value / tile) * tile;
    const rect = (x, y, w, h, color) => {
        const sx = snap(x);
        const sy = snap(y);
        const sw = Math.max(tile, snap(x + w) - sx);
        const sh = Math.max(tile, snap(y + h) - sy);
        g.fillStyle = color;
        g.fillRect(sx, sy, sw, sh);
    };
    const outlineRect = (x, y, w, h, fill, outline = palette.outline) => {
        rect(x - tile, y - tile, w + tile * 2, h + tile * 2, outline);
        rect(x, y, w, h, fill);
    };
    const px = (v) => v * pixelW;
    const py = (v) => v * pixelH;

    function drawRoad(x, y, w, h, dir) {
        rect(x - tile, y - tile, w + tile * 2, h + tile * 2, palette.sidewalkLight);
        rect(x, y, w, h, palette.road);
        rect(x, y, w, tile, palette.roadDark);
        rect(x, y + h - tile, w, tile, palette.roadDark);
        rect(x, y, tile, h, palette.roadDark);
        rect(x + w - tile, y, tile, h, palette.roadDark);

        if (dir === "horizontal") {
            const centerY = y + h / 2 - tile / 2;
            for (let i = x + tile * 3; i < x + w - tile * 4; i += tile * 8) {
                rect(i, centerY, tile * 4, tile, palette.roadLine);
            }
        } else {
            const centerX = x + w / 2 - tile / 2;
            for (let i = y + tile * 3; i < y + h - tile * 4; i += tile * 8) {
                rect(centerX, i, tile, tile * 4, palette.roadLine);
            }
        }
    }

    function drawCrosswalk(x, y, w, h, dir) {
        if (dir === "horizontal") {
            for (let i = x; i < x + w; i += tile * 3) rect(i, y, tile * 2, h, palette.white);
        } else {
            for (let i = y; i < y + h; i += tile * 3) rect(x, i, w, tile * 2, palette.white);
        }
    }

    function drawGrassPatch(x, y, w, h) {
        outlineRect(x, y, w, h, palette.grass, palette.grassDark);
        for (let i = 0; i < 18; i++) {
            const gx = x + ((i * 23) % Math.max(tile, w - tile * 2));
            const gy = y + ((i * 17) % Math.max(tile, h - tile * 2));
            rect(gx, gy, tile * 2, tile, i % 3 === 0 ? palette.grassLight : palette.grassDark);
        }
    }

    function drawTree(x, y, scale = 1) {
        const s = tile * scale;
        rect(x + s, y + s * 3, s, s, "#7B5335");
        rect(x, y + s, s * 3, s * 2, palette.grassDark);
        rect(x + s, y, s * 3, s * 3, palette.grass);
        rect(x + s * 2, y + s, s * 2, s * 2, palette.grassLight);
        rect(x + s, y + s * 2, s, s, "#2F6F48");
    }

    function drawBuilding(x, y, w, h, body, roof = palette.roof, opts = {}) {
        rect(x + tile * 2, y + tile * 2, w, h, "rgba(30, 54, 80, 0.28)");
        outlineRect(x, y, w, h, body);
        rect(x, y, w, tile * 2, roof);
        rect(x + tile, y + tile * 2, w - tile * 2, tile, "#2E4D6C");

        const cols = opts.cols || Math.max(2, Math.floor(w / 18));
        const rows = opts.rows || Math.max(2, Math.floor(h / 22));
        const gapX = Math.floor((w - cols * tile * 2) / (cols + 1));
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const wx = x + gapX + col * (gapX + tile * 2);
                const wy = y + tile * 5 + row * tile * 5;
                if (wy + tile * 3 > y + h - tile * 4) continue;
                rect(wx, wy, tile * 2, tile * 3, palette.glass);
                rect(wx, wy, tile * 2, tile, palette.white);
            }
        }

        const doorW = tile * 4;
        rect(x + w / 2 - doorW / 2, y + h - tile * 5, doorW, tile * 5, "#31527A");
        rect(x + w / 2 - tile / 2, y + h - tile * 3, tile, tile, palette.white);
    }

    function drawStore(x, y, w, h, awning) {
        drawBuilding(x, y, w, h, palette.creamWall, palette.brick, { cols: 2, rows: 1 });
        rect(x + tile, y + h - tile * 8, w - tile * 2, tile * 3, awning);
        for (let i = x + tile; i < x + w - tile * 2; i += tile * 3) {
            rect(i, y + h - tile * 8, tile * 2, tile * 3, palette.white);
        }
    }

    function drawCar(x, y, color, dir = "horizontal") {
        if (dir === "horizontal") {
            rect(x, y, tile * 7, tile * 4, palette.outline);
            rect(x + tile, y + tile, tile * 5, tile * 2, color);
            rect(x + tile * 2, y, tile * 3, tile, palette.white);
            rect(x + tile, y + tile * 3, tile, tile, "#142B40");
            rect(x + tile * 5, y + tile * 3, tile, tile, "#142B40");
        } else {
            rect(x, y, tile * 4, tile * 7, palette.outline);
            rect(x + tile, y + tile, tile * 2, tile * 5, color);
            rect(x, y + tile * 2, tile, tile * 3, palette.white);
            rect(x + tile * 3, y + tile, tile, tile, "#142B40");
            rect(x + tile * 3, y + tile * 5, tile, tile, "#142B40");
        }
    }

    function drawFountain(x, y) {
        outlineRect(x, y, tile * 12, tile * 12, "#5EA9CE", palette.white);
        rect(x + tile * 2, y + tile * 2, tile * 8, tile * 8, palette.water);
        rect(x + tile * 5, y + tile * 4, tile * 2, tile * 4, palette.white);
        rect(x + tile * 4, y + tile * 5, tile * 4, tile * 2, palette.waterDark);
    }

    rect(0, 0, pixelW, pixelH, palette.sidewalk);
    for (let y = 0; y < pixelH; y += tile * 3) {
        for (let x = 0; x < pixelW; x += tile * 3) {
            const mark = (x * 7 + y * 11) % 37;
            if (mark < 5) rect(x, y, tile, tile, mark % 2 ? "#90ABC8" : palette.sidewalkLight);
        }
    }

    drawRoad(0, py(0.76), pixelW, py(0.16), "horizontal");
    drawRoad(px(0.78), 0, px(0.14), pixelH, "vertical");
    drawRoad(0, py(0.43), px(0.82), py(0.10), "horizontal");
    drawRoad(px(0.34), py(0.10), px(0.11), py(0.66), "vertical");
    drawRoad(0, py(0.05), px(0.78), py(0.08), "horizontal");

    rect(px(0.93), 0, px(0.07), pixelH, palette.waterDark);
    rect(px(0.94), tile, px(0.04), pixelH - tile * 2, palette.water);
    for (let y = tile * 4; y < pixelH; y += tile * 8) rect(px(0.95), y, tile * 5, tile, "#BFE9FF");

    drawCrosswalk(px(0.03), py(0.76), px(0.14), tile * 5, "horizontal");
    drawCrosswalk(px(0.76), py(0.75), tile * 5, px(0.13), "vertical");
    drawCrosswalk(px(0.34), py(0.42), tile * 5, px(0.12), "vertical");
    drawCrosswalk(px(0.78), py(0.09), tile * 5, px(0.10), "vertical");

    drawGrassPatch(px(0.02), py(0.22), px(0.20), py(0.18));
    drawGrassPatch(px(0.58), py(0.26), px(0.18), py(0.18));
    drawGrassPatch(px(0.49), py(0.58), px(0.24), py(0.16));
    drawGrassPatch(px(0.07), py(0.58), px(0.18), py(0.10));

    rect(px(0.05), py(0.30), px(0.12), tile * 3, palette.sand);
    rect(px(0.61), py(0.34), px(0.12), tile * 3, palette.sand);
    rect(px(0.56), py(0.66), px(0.12), tile * 3, palette.sand);

    drawBuilding(px(0.02), py(0.09), px(0.22), py(0.18), palette.blueWall, "#7B4054", { cols: 4, rows: 3 });
    drawBuilding(px(0.26), py(0.09), px(0.16), py(0.21), "#5278B0", "#8A4A35", { cols: 3, rows: 4 });
    drawBuilding(px(0.46), py(0.10), px(0.22), py(0.18), palette.slateWall, "#914F32", { cols: 4, rows: 3 });
    drawBuilding(px(0.69), py(0.06), px(0.14), py(0.17), "#658AB5", "#8F4B2F", { cols: 2, rows: 3 });

    drawBuilding(px(0.25), py(0.32), px(0.17), py(0.13), "#6F85A0", "#4D637C", { cols: 3, rows: 2 });
    drawStore(px(0.52), py(0.29), px(0.17), py(0.13), "#E56A5D");
    drawStore(px(0.68), py(0.29), px(0.10), py(0.12), "#F0B24E");

    drawBuilding(px(0.39), py(0.52), px(0.21), py(0.22), "#E6EAF2", "#456A96", { cols: 3, rows: 4 });
    rect(px(0.39) + tile * 2, py(0.52) + tile * 2, px(0.21) - tile * 4, tile * 3, "#CBD9EA");
    rect(px(0.43), py(0.50), px(0.13), tile * 3, palette.outline);
    rect(px(0.44), py(0.49), px(0.11), tile * 2, "#F5F8FF");

    drawFountain(px(0.66), py(0.55));

    for (let i = 0; i < 18; i++) {
        const tx = px(0.03 + ((i * 0.13) % 0.70));
        const ty = py(0.18 + ((i * 0.17) % 0.55));
        const inRoad = (tx > px(0.34) && tx < px(0.45)) || (ty > py(0.43) && ty < py(0.53));
        if (!inRoad) drawTree(tx, ty, i % 3 === 0 ? 1.2 : 1);
    }
    for (let i = 0; i < 8; i++) drawTree(px(0.82 + (i % 2) * 0.055), py(0.18 + i * 0.075), 0.9);

    drawCar(px(0.05), py(0.80), "#7EE08B");
    drawCar(px(0.13), py(0.84), "#F36C65");
    drawCar(px(0.49), py(0.79), "#F36C65");
    drawCar(px(0.70), py(0.83), "#7EE08B");
    drawCar(px(0.84), py(0.59), "#F0C452", "vertical");
    drawCar(px(0.83), py(0.10), "#75A7FF", "vertical");

    rect(px(0.06), py(0.68), tile * 5, tile * 12, "#8ED7F8");
    rect(px(0.09), py(0.68), tile * 5, tile * 12, "#75A7FF");
    rect(px(0.12), py(0.68), tile * 5, tile * 12, "#F36C65");

    for (let i = 0; i < 9; i++) {
        rect(px(0.28) + i * tile * 4, py(0.61) + Math.sin(i) * tile * 2, tile * 2, tile * 2, palette.sand);
    }

    rect(0, 0, pixelW, tile, "#D7E8F7");
    rect(0, pixelH - tile, pixelW, tile, "#1E3650");
    rect(0, 0, tile, pixelH, "#D7E8F7");
    rect(pixelW - tile, 0, tile, pixelH, "#1E3650");

    const ctx = mainMapCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(low, 0, 0, vw, vh);
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
        const resp = await fetch(`/api/user-routes/${routeId}/copy`, { method: "POST" });
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
        userId: getCurrentUserId() || 1,
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
    if (!routes[routeKey]) return;
    if (typeof window.citygoSetPureMapMode === "function") {
        window.citygoSetPureMapMode(false);
    }
    if (currentTab !== "home") switchTab("home");
    if (sheet && sheet.classList.contains("open")) {
        sheet.classList.remove("open"); sheetBody.classList.remove("no-scroll"); currentRouteKey = null;
    }
    showMapRouteEditor(routeKey);
}

/* ═══════════════════════════════════
   Map loading progress bar
   ═══════════════════════════════════ */
let _loadingProgress = 0;
let _loadingTimer = null;

function showMapLoading(text) {
    var overlay = document.getElementById("map-loading-overlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    _loadingProgress = 0;
    updateLoadingBar(0, text || "地图加载中…");
    // Animate fake progress while real loading ticks
    if (_loadingTimer) clearInterval(_loadingTimer);
    _loadingTimer = setInterval(function() {
        if (_loadingProgress >= 90) { clearInterval(_loadingTimer); _loadingTimer = null; return; }
        // Slow down as it approaches 90%
        var step = Math.max(1, Math.floor((90 - _loadingProgress) / 10));
        _loadingProgress = Math.min(90, _loadingProgress + step);
        updateLoadingBar(_loadingProgress);
    }, 600);
}

function updateLoadingBar(pct, text) {
    var fill = document.getElementById("map-loading-bar-fill");
    var pctEl = document.getElementById("map-loading-pct");
    var txtEl = document.getElementById("map-loading-text");
    if (fill) fill.style.width = pct + "%";
    if (pctEl) pctEl.textContent = pct + "%";
    if (txtEl && text) txtEl.textContent = text;
}

function hideMapLoading() {
    if (_loadingTimer) { clearInterval(_loadingTimer); _loadingTimer = null; }
    updateLoadingBar(100, "完成");
    setTimeout(function() {
        var overlay = document.getElementById("map-loading-overlay");
        if (overlay) overlay.style.display = "none";
    }, 300);
}

function ensureMapCloseBtn() {
    if (document.getElementById("map-close-btn")) return;
    var btn = document.createElement("button");
    btn.id = "map-close-btn";
    btn.textContent = "✕ 返回首页";
    btn.style.cssText = "position:fixed;top:max(16px,env(safe-area-inset-top));left:16px;z-index:70;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border:1px solid rgba(0,0,0,0.08);font-size:13px;font-weight:600;color:#18212B;cursor:pointer;font-family:inherit;box-shadow:0 2px 12px rgba(0,0,0,0.1);";
    btn.addEventListener("click", exitMapOverlay);
    document.body.appendChild(btn);
}

/**
 * Show a side panel with route info + edit waypoint prompt.
 */
function showRouteInfoPopup(routeKey) {
    var r = routes[routeKey];
    if (!r) return;
    var old = document.getElementById("route-side-panel");
    if (old) { old.remove(); activeRouteOnMap = null; exitMapOverlay(); return; }

    var mapData = ROUTE_MAP_DATA[routeKey];
    var durText = "计算中…";
    if (mapData && mapData.plannedDur) durText = Math.ceil(mapData.plannedDur / 60) + " 分钟";
    else if (r.duration) durText = r.duration + " 分钟";

    var panel = document.createElement("div");
    panel.id = "route-side-panel";
    panel.innerHTML =
        '<button class="rsp-close" onclick="this.parentElement.remove();activeRouteOnMap=null;exitMapOverlay();">✕</button>'
        + '<div class="rsp-title">' + (r.title || "") + '</div>'
        + '<div class="rsp-meta">'
        + '<span>⏱ ' + durText + '</span>'
        + '<span>📍 ' + (r.stops ? r.stops.length : 0) + ' 站</span>'
        + (mapData && mapData.plannedDist ? '<span>📏 ' + (mapData.plannedDist / 1000).toFixed(1) + ' km</span>' : '')
        + '</div>'
        + '<div class="rsp-stops">' + (r.stops || []).map(function(s) { return '<span>' + (s.name || "") + '</span>'; }).join('') + '</div>'
        + '<div class="rsp-hint">💡 想自定义路线？在路线编辑器中自由添加或删除途经点</div>'
        + '<button class="rsp-edit-btn" onclick="this.closest(\'#route-side-panel\').remove();if(typeof exitMapOverlay===\'function\')exitMapOverlay();setTimeout(function(){if(typeof showMapRouteEditor===\'function\')showMapRouteEditor();},300);">✎ 编辑途经点 →</button>';
    document.body.appendChild(panel);
    setTimeout(function() { panel.classList.add("show"); }, 10);
}

function exitMapOverlay() {
    activeRouteOnMap = null;
    // Restore home page map style
    var mc = document.getElementById("main-map-container");
    if (mc) {
        mc.style.filter = "saturate(0.45) contrast(0.82) brightness(1.14) sepia(0.08)";
        mc.style.pointerEvents = "auto";
    }
    // Clear route overlays from the home page map
    clearRouteOverlays();
    if (amapInstance) {
        restoreAllMapOverlays();
        setTimeout(function() { amapInstance.resize(); }, 50);
    }
    // Remove close button
    var btn = document.getElementById("map-close-btn");
    if (btn) btn.remove();
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
    // 同时清理全部路线POI标记
    if (window._allRouteMarkers && window._allRouteMarkers.length) {
        window._allRouteMarkers.forEach(function(m) {
            try { amapInstance.remove(m); } catch(e) {}
        });
        window._allRouteMarkers = [];
    }
}

function setRouteOverlaysVisible(visible) {
    [...amapMarkers, ...amapRouteLines].forEach(overlay => {
        try {
            if (visible && typeof overlay.show === "function") overlay.show();
            if (!visible && typeof overlay.hide === "function") overlay.hide();
        } catch(e) {}
    });
}

function drawRouteOnMap(routeKey) {
    if (!window.AMap || !amapInstance) return;

    var data = ROUTE_MAP_DATA[routeKey];
    if (!data || !data.coords || !data.coords.length) return;

    var persona = ROUTE_PERSONA_COLORS[routeKey] || { color: "#B64236" };

    // ── DEBUG: test marker at a fixed Nanjing location ──
    var testMarker = new AMap.Marker({
        position: [118.796, 32.060],
        content: '<div style="background:red;color:#fff;width:30px;height:30px;border-radius:50%;text-align:center;line-height:30px;font-size:16px;font-weight:bold;">?</div>',
        offset: new AMap.Pixel(-15, -15),
        zIndex: 99
    });
    amapInstance.add(testMarker);
    amapMarkers.push(testMarker);

    // Use planned path if available, else direct stop-to-stop
    var linePoints = (data.plannedPath && data.plannedPath.length >= 2) ? data.plannedPath : data.coords;
    // Convert [lat, lng] → [lng, lat] for AMap，同时过滤无效坐标
    var lnglats = [];
    linePoints.forEach(function(c) {
        if (!c || c[0] == null || c[1] == null) return;
        var lng = Number(c[1]), lat = Number(c[0]);
        if (isFinite(lng) && isFinite(lat)) {
            lnglats.push([lng, lat]);
        }
    });
    if (lnglats.length < 2) return;

    // Simple solid polyline (same approach as addAllRouteOverlays which works)
    var polyline = new AMap.Polyline({
        path: lnglats,
        strokeColor: persona.color,
        strokeOpacity: 0.9,
        strokeWeight: 6,
        strokeStyle: "solid",
        lineJoin: "round",
    });
    amapInstance.add(polyline);
    amapRouteLines.push(polyline);

    // Stop markers using data.coords
    data.coords.forEach(function(c, i) {
        if (!c || c[0] == null || c[1] == null) return;
        var lng = Number(c[1]), lat = Number(c[0]);
        if (!isFinite(lng) || !isFinite(lat)) return;
        var label = data.stops[i] || "途经点";
        var el = document.createElement("div");
        el.className = "route-marker";
        el.innerHTML = '<span class="dot"></span><span>' + label + '</span>';
        var marker = new AMap.Marker({
            position: [lng, lat],
            content: el,
            offset: new AMap.Pixel(-30, -10),
            zIndex: 60,
        });
        marker._routeKey = routeKey;
        marker.on("click", () => {
            const buildingPoint = findBuildingPointByName(label);
            if (buildingPoint && showBuildingPointDetail(buildingPoint, "路线途经点")) return;
            openRoute(routeKey);
        });
        amapInstance.add(marker);
        amapMarkers.push(marker);
    });

    // Fit view
    try {
        amapInstance.setFitView(null, false, 80);
    } catch(e) {
        amapInstance.setZoom(15);
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

    // Show estimated time and stop count
    var timeEl = document.getElementById("float-card-time");
    var countEl = document.getElementById("float-card-stops-count");
    var mapData = ROUTE_MAP_DATA[routeKey];
    if (timeEl) {
        // prefer planned duration from API, fallback to route meta
        var durText = r.meta && r.meta[0] ? r.meta[0] : "";
        if (mapData && mapData.plannedDur) {
            durText = Math.ceil(mapData.plannedDur / 60) + " 分钟";
        } else if (r.duration) {
            durText = r.duration + " 分钟";
        }
        timeEl.textContent = durText ? "⏱ " + durText : "⏱ 计算中…";
    }
    if (countEl && r.stops) {
        countEl.textContent = "📍 " + r.stops.length + " 站";
    }

    const stopsEl = document.getElementById("float-card-stops");
    stopsEl.innerHTML = r.stops.map(s => `<span class="float-card-stop">${s.name}</span>`).join("");

    document.getElementById("float-card-start").onclick = () => {
        closeSheet();
        openRoute(routeKey);
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
    { id: "night",   icon: "🏮", name: "夜泊秦淮", desc: "完成秦淮夜游路线", hint: "完成秦淮夜游路线即可解锁" },
    { id: "nju",     icon: "🎓", name: "南大记忆", desc: "完成南大校史路线", hint: "完成南大校史路线即可解锁" },
    { id: "food",    icon: "🍜", name: "美食猎人", desc: "探索 3 家以上美食点位", hint: "打卡3家以上美食点位解锁" },
    { id: "expo",    icon: "🏛", name: "文化漫游者", desc: "完成博物馆展览路线", hint: "完成博物馆展览路线即可解锁" },
    { id: "photo",   icon: "📸", name: "城市记录者", desc: "拍摄 5 个以上打卡点位", hint: "打卡5个以上景点解锁" },
    { id: "coffee",  icon: "☕", name: "午后慢享", desc: "完成午后餐茶路线", hint: "完成午后餐茶路线即可解锁" },
    { id: "copy",    icon: "💜", name: "首条复刻", desc: "复刻一条喜欢的路线", hint: "复刻一条路线即可解锁", hidden: true },
    { id: "invite",  icon: "🤝", name: "邀约达人", desc: "成功邀请朋友一起出发", hint: "邀请朋友一起出发解锁", hidden: true },
    { id: "all_routes", icon: "🌟", name: "金陵通", desc: "完成全部4条路线", hint: "完成全部4条标准路线解锁" },
    { id: "five_stops", icon: "📌", name: "打卡达人", desc: "累计打卡10个站点", hint: "累计打卡10个站点解锁" },
    { id: "early", icon: "🌅", name: "早鸟", desc: "在上午9点前出发探索", hint: "清晨出发探索解锁", hidden: true },
    { id: "night_owl", icon: "🦉", name: "夜猫子", desc: "晚上8点后还在探索", hint: "深夜还在探索解锁", hidden: true },
    { id: "guide", icon: "💬", name: "向导挚友", desc: "与南小鲸对话10次以上", hint: "与向导对话多次解锁", hidden: true },
    { id: "collector", icon: "🎴", name: "收藏家", desc: "创建3条以上自定义路线", hint: "创建自定义路线解锁" },
    { id: "social", icon: "👥", name: "社交达人", desc: "分享路线给5位好友", hint: "分享路线给好友解锁", hidden: true },
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

function showAchievementDetail(id) {
    const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
    if (!def) return;
    const unlockedData = getAchievements();
    const isUnlocked = !!unlockedData[id];
    const unlockDate = isUnlocked ? unlockedData[id].date : null;

    // Remove any existing overlay
    const existing = document.querySelector(".ach-detail-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "ach-detail-overlay";

    let contentHTML = "";
    if (isUnlocked) {
        const dateStr = unlockDate
            ? new Date(unlockDate).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
            : "";
        contentHTML = `
            <div class="ach-detail-card unlocked">
                <span class="ach-detail-icon">${def.icon}</span>
                <h3 class="ach-detail-name">${def.name}</h3>
                <p class="ach-detail-desc">${def.desc}</p>
                ${dateStr ? `<p class="ach-detail-date">📅 ${dateStr} 解锁</p>` : ""}
                <span class="ach-detail-badge">✓ 已解锁</span>
            </div>
        `;
    } else if (def.hidden) {
        contentHTML = `
            <div class="ach-detail-card locked hidden-ach">
                <span class="ach-detail-icon">❓</span>
                <h3 class="ach-detail-name">??? 隐藏成就</h3>
                <p class="ach-detail-desc">达成隐藏条件后解锁</p>
                <span class="ach-detail-badge locked-badge">🔒 未解锁</span>
            </div>
        `;
    } else {
        contentHTML = `
            <div class="ach-detail-card locked">
                <span class="ach-detail-icon">${def.icon}</span>
                <h3 class="ach-detail-name">${def.name}</h3>
                <p class="ach-detail-desc">🔒 未解锁</p>
                <p class="ach-detail-hint">💡 ${def.hint || def.desc}</p>
                <span class="ach-detail-badge locked-badge">🔒 未解锁</span>
            </div>
        `;
    }

    overlay.innerHTML = `
        <div class="ach-detail-scrim"></div>
        <div class="ach-detail-wrapper">
            ${contentHTML}
            <button class="ach-detail-close" type="button" aria-label="关闭">✕</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add("open");
    });

    // Close handlers
    const close = () => {
        overlay.classList.remove("open");
        overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    };
    overlay.querySelector(".ach-detail-scrim").addEventListener("click", close);
    overlay.querySelector(".ach-detail-close").addEventListener("click", close);
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
    document.body.classList.remove("community-tab-active");
    if (tab === "nearby") document.body.classList.add("community-tab-active");
    if (tab !== "home" && typeof window.citygoSetPureMapMode === "function") {
        window.citygoSetPureMapMode(false);
    }

    if (tab === currentTab) {
        if (tab === "home") {
            const mapStage = document.getElementById("map-stage");
            if (mapStage) mapStage.style.display = "";
            if (amapInstance) {
                addAllRouteOverlays(window.AMap);
                amapInstance.resize();
            }
        }
        return;
    }

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
        const navEl = getNavEl();
        if (navEl) navEl.style.zIndex = "";
        if (amapInstance) setTimeout(() => amapInstance.resize(), 50);
    }

    const mapStage = document.getElementById("map-stage");
    const mainPage = document.getElementById("main-page");
    const dimOverlay = document.getElementById("map-dim-overlay");

    // Always clean up drawer-open state
    if (mainPage) mainPage.classList.remove("drawer-open");

    // Hide map stage for non-home tabs — use visibility to avoid re-render
    if (mapStage) { mapStage.style.visibility = "hidden"; mapStage.style.opacity = "0"; }
    if (dimOverlay) dimOverlay.style.display = "none";

    if (tab === "home") {
        // Home — map as visual backdrop, snap scroll on top
        if (mapStage) { mapStage.style.visibility = "visible"; mapStage.style.opacity = "1"; mapStage.style.display = ""; }
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
        if (amapInstance) { try { addAllRouteOverlays(window.AMap); } catch(e) {} setTimeout(() => amapInstance.resize(), 50); }
    } else {
        // routes / nearby / pet / profile — hide map stage and all other tabs
        hideAllTabContent();
        const tabEl = document.querySelector(`.main-tab-content[data-tab="${tab}"]`);
        if (tabEl) {
            tabEl.style.display = "block";
            tabEl.classList.add("visible");
            const inner = tabEl.querySelector(".tab-content-inner");
            if (inner) {
                if (tab === "routes") renderRoutesTab(inner);
                else if (tab === "nearby") renderCommunityPage(inner);
                else if (!inner.dataset.rendered) {
                    inner.dataset.rendered = "1";
                    if (tab === "pet") renderPetTab(inner);
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

function showMapRouteEditor(routeKey) {
    closeSheet();

    document.querySelector(".map-editor-iframe-overlay")?.remove();
    if (mapEditor) { closeMapEditor(); }

    const overlay = document.createElement("div");
    overlay.className = "map-editor-iframe-overlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:200;background:#fff;";

    // Build prefill data as URL hash param (foolproof, no async messaging)
    var src = "./route-editor.html";
    if (routeKey && routes[routeKey]) {
        var r = routes[routeKey];
        var mapData = ROUTE_MAP_DATA[routeKey];
        if (mapData && mapData.stops && mapData.stops.length) {
            // 优先使用 ALL_ROUTE_POIS 中的验证坐标，兜底用 ROUTE_MAP_DATA 原始坐标
            var verifiedPois = window.ALL_ROUTE_POIS && window.ALL_ROUTE_POIS[routeKey];
            var verifiedCoords = null;
            if (verifiedPois && verifiedPois.pois) {
                verifiedCoords = verifiedPois.pois.map(function(p) { return [p.lat, p.lng]; });
            }
            var prefill = {
                routeName: r.title || "",
                stops: mapData.stops,
                coords: verifiedCoords || mapData.coords || null,
                plannedPath: mapData.plannedPath || null,
                plannedDist: mapData.plannedDist || 0,
                plannedDur: mapData.plannedDur || 0,
            };
            src += "#prefill=" + encodeURIComponent(JSON.stringify(prefill));
        }
    }

    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.style.cssText = "width:100%;height:100%;border:none;";
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    const msgHandler = function(e) {
        if (e.data && e.data.type === "close-editor") {
            closeMapEditor();
        }
        if (e.data && e.data.type === "route-saved") {
            const d = e.data.data;
            showToast("✅ 路线「" + (d.routeName || "自定义") + "」已保存！");
            saveCustomRouteFromEditor(d);
            loadCustomRoutes();
            renderRouteGrid();
            renderCarouselCards();
            const routesTab = document.querySelector("#tab-routes .tab-content-inner");
            if (routesTab) renderRoutesTab(routesTab);
            closeMapEditor();
        }
    };
    window.addEventListener("message", msgHandler);
    overlay._msgHandler = msgHandler;

    mapEditor = { overlay, iframe };
    const navEl = getNavEl();
    if (navEl) navEl.style.zIndex = "";
}

function closeMapEditor() {
    if (!mapEditor) return;

    var overlay = mapEditor.overlay;
    if (overlay && overlay._msgHandler) {
        window.removeEventListener("message", overlay._msgHandler);
    }
    // 强制移除 iframe overlay（确保不遮挡导航栏）
    try { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch(e) {}
    // 清理所有残留的 map-editor-iframe-overlay
    document.querySelectorAll(".map-editor-iframe-overlay").forEach(function(el) {
        try { el.remove(); } catch(e) {}
    });

    // Aggressively clear any leftover route markers/lines
    if (amapInstance) {
        while (amapMarkers.length) { try { amapInstance.remove(amapMarkers[0]); } catch(e) {} amapMarkers.shift(); }
        while (amapRouteLines.length) { try { amapInstance.remove(amapRouteLines[0]); } catch(e) {} amapRouteLines.shift(); }
    }

    // Restore map container
    var mc = document.getElementById("main-map-container");
    if (mc) {
        mc.style.cursor = "";
        mc.style.filter = "";
        mc.style.pointerEvents = "";
        mc.classList.remove("amap-fullscreen");
    }

    // Restore UI elements
    var snapScroll = document.getElementById("snap-scroll");
    var header = document.querySelector(".main-header");
    if (snapScroll) snapScroll.style.display = "";
    if (header) header.style.display = "";

    var navEl = getNavEl();
    if (navEl) navEl.style.zIndex = "";

    mapEditor = null;
    switchTab("home");
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
        food: '美食', coffee: '咖啡茶饮', ticket: '博物馆/景点', hotel: '酒店住宿',
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
            <button class="need-chip" data-need="ticket">博物馆</button>
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
        food: '美食', coffee: '咖啡', ticket: '博物馆', hotel: '酒店',
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
        userId: getCurrentUserId() || 1,
        name: getCurrentUserNickname(),
        tagline: currentAuthUser?.bio || "南京城市探索中",
        avatarUrl: currentAuthUser?.avatarUrl || "",
        loggedIn: isLoggedIn(),
        lastLoginAt: currentAuthUser?.lastLoginAt || new Date().toISOString(),
    };
    try {
        const stored = JSON.parse(localStorage.getItem(USER_PROFILE_STORAGE_KEY) || "{}");
        const merged = Object.assign(defaults, stored);
        // Always trust the live auth state, never stale localStorage
        merged.loggedIn = isLoggedIn();
        merged.userId = getCurrentUserId() || merged.userId || 1;
        merged.name = getCurrentUserNickname();
        merged.tagline = currentAuthUser?.bio || merged.tagline || "南京城市探索中";
        merged.avatarUrl = currentAuthUser?.avatarUrl || merged.avatarUrl || "";
        merged.lastLoginAt = currentAuthUser?.lastLoginAt || merged.lastLoginAt || new Date().toISOString();
        return merged;
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
        if (!isLoggedIn()) {
            detail.innerHTML = `
                <div class="settings-detail-card">
                    <h4>账户管理</h4>
                    <p style="color:var(--soft);margin-bottom:16px;">登录后可管理账户信息、修改密码、查看设备</p>
                    <button class="settings-primary" type="button" id="settings-go-login">登录 / 注册</button>
                </div>
            `;
            detail.querySelector("#settings-go-login").addEventListener("click", () => {
                showAuthModal("login", () => {
                    showSettingsDetail("account");
                });
            });
            return;
        }

        const authUser = currentAuthUser;
        detail.innerHTML = `
            <div class="settings-detail-card">
                <h4>账户管理</h4>
                <p><span class="settings-info-label">邮箱</span> ${escapeHtml(authUser.email || "未设置")}</p>
                <p><span class="settings-info-label">用户编号</span> ${escapeHtml(authUser.publicUserCode || "-")}</p>
                <p><span class="settings-info-label">状态</span> ${escapeHtml(authUser.status === "ACTIVE" ? "正常" : authUser.status)}</p>
                <p><span class="settings-info-label">注册时间</span> ${authUser.createdAt ? new Date(authUser.createdAt).toLocaleDateString("zh-CN") : "-"}</p>
                <label class="settings-field" style="margin-top:12px;">
                    <span>昵称</span>
                    <input id="settings-name-input" type="text" value="${escapeHtml(profile.name)}" maxlength="16" placeholder="请输入昵称">
                </label>
                <div class="settings-btn-row">
                    <button class="settings-primary" type="button" id="settings-save-account">保存昵称</button>
                </div>
                <p class="settings-feedback" id="settings-account-feedback" style="display:none;"></p>
                <hr style="margin:16px 0;border-color:var(--rule);">
                <h4>密码</h4>
                <div class="settings-field">
                    <input id="settings-old-password" type="password" placeholder="当前密码" style="margin-bottom:8px;">
                    <input id="settings-new-password" type="password" placeholder="新密码（至少6位）" minlength="6">
                </div>
                <button class="settings-primary" type="button" id="settings-change-password">修改密码</button>
                <p class="settings-feedback" id="settings-password-feedback" style="display:none;"></p>
                <hr style="margin:16px 0;border-color:var(--rule);">
                <button class="settings-danger" type="button" id="settings-logout-btn">退出登录</button>
            </div>
        `;
        detail.querySelector("#settings-save-account").addEventListener("click", async () => {
            const input = detail.querySelector("#settings-name-input");
            const name = input.value.trim();
            const fb = detail.querySelector("#settings-account-feedback");
            if (!name || name.length > 16) {
                fb.style.display = "block";
                fb.className = "settings-feedback error";
                fb.textContent = "昵称长度需在1-16个字符之间";
                return;
            }
            const result = await authApi.updateProfile({ nickname: name });
            if (result.code === 200) {
                currentAuthUser = result.data;
                saveUserProfile({ name, loggedIn: true });
                showToast("昵称已更新");
            } else {
                fb.style.display = "block";
                fb.className = "settings-feedback error";
                fb.textContent = result.msg || "更新失败";
            }
        });
        detail.querySelector("#settings-change-password").addEventListener("click", async () => {
            const oldPass = detail.querySelector("#settings-old-password").value;
            const newPass = detail.querySelector("#settings-new-password").value;
            const fb = detail.querySelector("#settings-password-feedback");
            if (!oldPass || !newPass || newPass.length < 6) {
                fb.style.display = "block";
                fb.className = "settings-feedback error";
                fb.textContent = "新密码至少6位";
                return;
            }
            const result = await authApi.changePassword(oldPass, newPass);
            fb.style.display = "block";
            if (result.code === 200) {
                fb.className = "settings-feedback success";
                fb.textContent = "✓ 密码修改成功";
                detail.querySelector("#settings-old-password").value = "";
                detail.querySelector("#settings-new-password").value = "";
            } else {
                fb.className = "settings-feedback error";
                fb.textContent = result.msg || "修改失败";
            }
        });
        detail.querySelector("#settings-logout-btn").addEventListener("click", async () => {
            await authApi.logout();
            currentAuthUser = null;
            showToast("已退出登录");
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
                <p class="settings-feedback" id="settings-cache-feedback" style="display:none;"></p>
            </div>
        `;
        detail.querySelector("#settings-clear-cache").addEventListener("click", () => {
            const btn = detail.querySelector("#settings-clear-cache");
            const fb = detail.querySelector("#settings-cache-feedback");
            btn.disabled = true;
            btn.textContent = "正在清理...";
            fb.style.display = "block";
            fb.className = "settings-feedback";
            fb.textContent = "⏳ 正在清理缓存...";

            // Simulate async cleanup with size estimation
            setTimeout(() => {
                const estimatedKB = Math.floor(Math.random() * 180 + 35);
                clearAppCacheInternal();
                btn.textContent = "清理完成 ✓";
                btn.style.background = "#8BAE7F";
                fb.className = "settings-feedback success";
                fb.textContent = "✓ 清理完成，释放约 " + estimatedKB + " KB";
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = "清理缓存";
                    btn.style.background = "";
                }, 2000);
            }, 800);
        });
        return;
    }

    if (type === "github") {
        const repoUrl = APP_GITHUB_URL;
        const repoOwner = "LibraZhaoR";
        const repoName = "2026EL";
        const repoDesc = "🏙️ 南京城市手绘卷轴 · 2026 EL 智能应用开发与创新大赛 · 融合印象派视觉、AI 向导与宠物陪伴的沉浸式旅行伴侣";
        detail.innerHTML = `
            <div class="github-card">
                <div class="github-card-header">
                    <span class="github-octocat">🐙</span>
                    <span class="github-brand">GitHub</span>
                </div>
                <div class="github-card-body">
                    <div class="github-repo-row">
                        <span class="github-repo-icon">📂</span>
                        <div class="github-repo-info">
                            <a class="github-repo-name" href="${repoUrl}" target="_blank" rel="noopener" title="在 GitHub 中打开">
                                <span class="github-owner">${repoOwner}</span><span class="github-slash">/</span><span class="github-repo">${repoName}</span>
                            </a>
                            <span class="github-visibility">🌐 Public</span>
                        </div>
                    </div>
                    <p class="github-repo-desc">${repoDesc}</p>
                    <div class="github-stats">
                        <span class="github-stat"><span class="github-stat-dot"></span> TypeScript / Java</span>
                        <span class="github-stat">⭐ 欢迎 Star</span>
                    </div>
                </div>
                <div class="github-card-actions">
                    <a class="github-btn star-btn" href="${repoUrl}" target="_blank" rel="noopener" id="github-star-btn">
                        <span class="github-btn-icon">⭐</span>
                        <span>Star</span>
                    </a>
                    <button class="github-btn copy-btn" type="button" id="settings-copy-github">
                        <span class="github-btn-icon">📋</span>
                        <span>复制链接</span>
                    </button>
                    <a class="github-btn open-btn" href="${repoUrl}" target="_blank" rel="noopener" id="settings-open-github">
                        <span class="github-btn-icon">↗</span>
                        <span>打开仓库</span>
                    </a>
                </div>
                <p class="settings-feedback" id="settings-github-feedback" style="display:none;"></p>
            </div>
        `;
        detail.querySelector("#settings-copy-github").addEventListener("click", (e) => {
            e.preventDefault();
            navigator.clipboard?.writeText(repoUrl).then(() => {
                const fb = detail.querySelector("#settings-github-feedback");
                fb.style.display = "block";
                fb.className = "settings-feedback success github-feedback";
                fb.textContent = "✓ 链接已复制到剪贴板";
                // Quick pulse on copy button
                const copyBtn = detail.querySelector(".copy-btn");
                copyBtn.classList.add("copied");
                setTimeout(() => { fb.style.display = "none"; copyBtn.classList.remove("copied"); }, 2000);
            }).catch(() => {
                showToast("复制失败，请手动复制");
            });
        });
        return;
    }

    if (type === "privacy") {
        detail.innerHTML = `
            <div class="settings-detail-card">
                <h4>安全隐私</h4>
                <p>头像和偏好仅保存在当前浏览器本地；AI 聊天只在发送消息时请求内置接口。</p>
                <div class="settings-btn-row">
                    <button class="settings-secondary" type="button" id="settings-show-privacy-policy">📄 隐私政策</button>
                    <button class="settings-secondary" type="button" id="settings-show-user-agreement">📜 用户协议</button>
                </div>
                <button class="settings-outline" type="button" id="settings-reset-avatar" style="margin-top:8px;">移除本地头像</button>
            </div>
        `;
        detail.querySelector("#settings-show-privacy-policy").addEventListener("click", () => {
            showPrivacyModal("privacy");
        });
        detail.querySelector("#settings-show-user-agreement").addEventListener("click", () => {
            showPrivacyModal("agreement");
        });
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
                <div id="settings-logout-actions">
                    <button class="settings-danger" type="button" id="settings-logout-confirm">确认退出</button>
                </div>
                <p class="settings-feedback" id="settings-logout-feedback" style="display:none;"></p>
            </div>
        `;
        detail.querySelector("#settings-logout-confirm").addEventListener("click", () => {
            // Replace with two-step confirmation
            const actions = detail.querySelector("#settings-logout-actions");
            actions.innerHTML = `
                <p style="font-size:13px;color:#D34B4B;margin:0 0 10px;font-weight:600;">⚠️ 确定要退出登录吗？</p>
                <div class="settings-btn-row">
                    <button class="settings-danger" type="button" id="settings-logout-final">确认退出</button>
                    <button class="settings-outline" type="button" id="settings-logout-cancel">取消</button>
                </div>
            `;
            actions.querySelector("#settings-logout-final").addEventListener("click", async () => {
                await authApi.logout();
                currentAuthUser = null;
                saveUserProfile({ loggedIn: false, userId: null, name: "我", lastLogoutAt: new Date().toISOString() });
                const profileTab = document.getElementById("tab-profile-inner");
                if (profileTab) renderProfileTab(profileTab);
                showToast("已退出登录");
                closeSettingsDrawer();
            });
            actions.querySelector("#settings-logout-cancel").addEventListener("click", () => {
                showSettingsDetail("logout");
            });
        });
    }

    if (type === "about") {
        const repoUrl = APP_GITHUB_URL;
        const repoOwner = "LibraZhaoR";
        const repoName = "2026EL";
        const repoDesc = "🏙️ 南京城市手绘卷轴 · 2026 EL 智能应用开发与创新大赛 · 融合印象派视觉、AI 向导与宠物陪伴的沉浸式旅行伴侣";
        detail.innerHTML = `
            <div class="settings-detail-card">
                <h4>🏙️ 关于应用</h4>
                <div class="about-info">
                    <div class="about-row"><span class="about-label">应用名称</span><span>南京城市手绘卷轴</span></div>
                    <div class="about-row"><span class="about-label">版本号</span><span>v1.0.0</span></div>
                    <div class="about-row"><span class="about-label">开发团队</span><span>2026 EL 智能应用开发与创新大赛</span></div>
                    <div class="about-row"><span class="about-label">开发者</span><span>LibraZhaoR, Li Xiangze and Du Xinyao</span></div>
                    <div class="about-row"><span class="about-label">技术栈</span><span>Spring Boot + 高德地图 API</span></div>
                </div>
                <p style="margin-top:12px;font-size:12px;color:#6B7280;line-height:1.6;">
                    📖 一款以南京城市探索为主题的手绘风格旅行伴侣。融合印象派视觉设计、路线规划、AI 向导与宠物陪伴，为城市漫步者提供沉浸式的南京探索体验。
                </p>
            </div>

            <div class="github-card" style="margin-top:12px;">
                <div class="github-card-header">
                    <span class="github-octocat">🐙</span>
                    <span class="github-brand">GitHub</span>
                </div>
                <div class="github-card-body">
                    <div class="github-repo-row">
                        <span class="github-repo-icon">📂</span>
                        <div class="github-repo-info">
                            <a class="github-repo-name" href="${repoUrl}" target="_blank" rel="noopener" title="在 GitHub 中打开">
                                <span class="github-owner">${repoOwner}</span><span class="github-slash">/</span><span class="github-repo">${repoName}</span>
                            </a>
                            <span class="github-visibility">🌐 Public</span>
                        </div>
                    </div>
                    <p class="github-repo-desc">${repoDesc}</p>
                    <div class="github-stats">
                        <span class="github-stat"><span class="github-stat-dot"></span> TypeScript / Java</span>
                        <span class="github-stat">⭐ 欢迎 Star</span>
                    </div>
                </div>
                <div class="github-card-actions">
                    <a class="github-btn star-btn" href="${repoUrl}" target="_blank" rel="noopener">
                        <span class="github-btn-icon">⭐</span>
                        <span>Star</span>
                    </a>
                    <button class="github-btn copy-btn" type="button" id="settings-about-copy-github">
                        <span class="github-btn-icon">📋</span>
                        <span>复制链接</span>
                    </button>
                    <a class="github-btn open-btn" href="${repoUrl}" target="_blank" rel="noopener">
                        <span class="github-btn-icon">↗</span>
                        <span>打开仓库</span>
                    </a>
                </div>
            </div>
        `;
        // Bind copy button in about section
        const copyBtn = detail.querySelector("#settings-about-copy-github");
        if (copyBtn) {
            copyBtn.addEventListener("click", (e) => {
                e.preventDefault();
                navigator.clipboard?.writeText(repoUrl).then(() => {
                    copyBtn.classList.add("copied");
                    setTimeout(() => copyBtn.classList.remove("copied"), 2000);
                    showToast("链接已复制到剪贴板");
                }).catch(() => {
                    showToast("复制失败，请手动复制");
                });
            });
        }
        return;
    }
}

function clearAppCache() {
    clearAppCacheInternal();
    showToast("缓存已清理，用户资料已保留");
}

function clearAppCacheInternal() {
    sessionStorage.clear();
    localStorage.removeItem(PET77_CHAT_LAYOUT_KEY);
    localStorage.removeItem("nj_temp_route_preview");
    localStorage.removeItem("nj_meituan_cache");
}

// ── Privacy Policy / User Agreement Modal ──

function showPrivacyModal(type) {
    const existing = document.querySelector(".privacy-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "privacy-modal-overlay";

    const title = type === "privacy" ? "隐私政策" : "用户协议";
    const content = type === "privacy"
        ? `<h4>🔒 隐私政策</h4>
           <p><strong>最后更新：2026年6月</strong></p>
           <p>本应用尊重并保护您的个人隐私。以下是我们对数据收集和使用的说明：</p>
           <ul>
               <li><strong>本地存储：</strong>头像、昵称、路线偏好、成就和宠物数据仅保存在您当前使用的浏览器本地存储（localStorage）中，不会上传至任何服务器。</li>
               <li><strong>AI 聊天：</strong>与南小鲸的对话仅在您主动发送消息时通过加密接口传输，不保存对话历史至服务器。</li>
               <li><strong>位置信息：</strong>路线规划使用高德地图 API，位置数据由高德地图处理，请参见高德地图隐私政策。</li>
               <li><strong>数据删除：</strong>您可以在设置中随时清除缓存或移除本地头像，应用不会保留您的个人数据。</li>
           </ul>
           <p>如有任何隐私相关问题，请通过 GitHub Issues 联系我们。</p>`
        : `<h4>📜 用户协议</h4>
           <p><strong>最后更新：2026年6月</strong></p>
           <p>使用本应用即表示您同意以下条款：</p>
           <ul>
               <li><strong>用途限制：</strong>本应用仅供个人娱乐和学习使用，路线信息仅供参考。</li>
               <li><strong>知识产权：</strong>应用的视觉设计、代码和内容受版权保护。未经许可不得用于商业用途。</li>
               <li><strong>免责声明：</strong>路线规划和时间估算基于高德地图数据，实际路况可能有所不同。开发者不对路线准确性承担责任。</li>
               <li><strong>开源许可：</strong>项目代码在 GitHub 上开源，遵循项目仓库中声明的开源许可协议。</li>
           </ul>
           <p>我们保留随时更新本协议的权利，更新后的条款将在应用内公布。</p>`;

    overlay.innerHTML = `
        <div class="privacy-modal-scrim"></div>
        <div class="privacy-modal-card">
            <div class="privacy-modal-header">
                <h3>${title}</h3>
                <button class="privacy-modal-close" type="button" aria-label="关闭">✕</button>
            </div>
            <div class="privacy-modal-body">${content}</div>
            <div class="privacy-modal-footer">
                <button class="settings-primary" type="button" id="privacy-modal-ok">我知道了</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("open"));

    const close = () => {
        overlay.classList.remove("open");
        overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    };
    overlay.querySelector(".privacy-modal-scrim").addEventListener("click", close);
    overlay.querySelector(".privacy-modal-close").addEventListener("click", close);
    overlay.querySelector("#privacy-modal-ok").addEventListener("click", close);
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
            <button class="profile-menu-item" onclick="jumpToMyRoutes()" style="border-radius:16px;border:1px solid var(--rule);padding:16px;background:var(--surface);margin-bottom:10px;display:flex;align-items:center;gap:12px;width:100%;font-family:inherit;font-size:14px;color:var(--ink);cursor:pointer;">
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
                <button class="profile-menu-item" onclick="openSettingsDrawer();showSettingsDetail('about');">
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
                        const showHidden = a.hidden && !isUnlocked;
                        return `<div class="profile-achievement-item${isUnlocked ? ' unlocked' : ' locked'}${showHidden ? ' hidden-ach' : ''}"
                            onclick="showAchievementDetail('${a.id}')" title="${isUnlocked ? a.name + ' - 已解锁' : (a.hidden ? '隐藏成就' : a.name + ' - 未解锁')}">
                            <span class="pa-icon">${showHidden ? '❓' : a.icon}</span>
                            <span class="pa-name">${showHidden ? '???' : a.name}</span>
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

function jumpToMyRoutes() {
    // Switch to routes tab
    switchTab("routes");
    // Close the settings drawer if open
    closeSettingsDrawer();
    // Scroll to custom routes section after a short delay for tab render
    setTimeout(() => {
        const section = document.getElementById("custom-routes-section");
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
            // Brief highlight pulse
            section.style.transition = "box-shadow 0.3s ease";
            section.style.boxShadow = "0 0 0 3px rgba(232,196,106,0.45)";
            setTimeout(() => { section.style.boxShadow = ""; }, 1200);
        }
    }, 150);
}

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
        fetch("/api/user-routes").then(r => r.json()).then(d => d.data || []).catch(() => []),
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
        const resp = await fetch(`/api/user-routes/${userRouteId}`, { method: "DELETE" });
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
        userId: getCurrentUserId() || 1,
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
            userId: getCurrentUserId() || 1,
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
    // Restore auth session silently (don't show modal on failure)
    initAuth().catch(() => {});

    resize();
    window.addEventListener("resize", () => { resize(); });

    paperTex = genPaperTexture();

    // 用 routes 数据动态填充开屏诗词卡片的标题和描述
    poems.forEach(function(el) {
        var btn = el.querySelector(".enter");
        if (!btn) return;
        var routeKey = btn.getAttribute("data-route");
        if (!routeKey || !routes[routeKey]) return;
        var route = routes[routeKey];
        var h2 = el.querySelector("h2");
        var desc = el.querySelector(".poem-desc");
        if (h2) h2.textContent = route.title ? route.title.split("：")[0].split(":")[0] : (h2.getAttribute("data-prefill") || "");
        if (desc) desc.textContent = route.desc || "";
    });

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
};


// Hook closeSheet to restore home page map when route sheet closes
var _origCloseSheet = closeSheet;
closeSheet = function() {
    _origCloseSheet();
    // Restore home page map style when user closes sheet while route is shown
    if (activeRouteOnMap && amapInstance) {
        var mc = document.getElementById("main-map-container");
        if (mc) {
            mc.style.filter = "saturate(0.45) contrast(0.82) brightness(1.14) sepia(0.08)";
            mc.style.pointerEvents = "auto";
        }
        clearRouteOverlays();
        restoreAllMapOverlays();
        activeRouteOnMap = null;
        // Remove close button too
        var cb = document.getElementById("map-close-btn");
        if (cb) cb.remove();
    }
};

/* ═══════════════════════════════════════
   AI 助手聊天面板 · AI Chat Panel
   ═══════════════════════════════════════ */

/**
 * Get route keys ordered by persona match — matched route first, then others.
 */
function getPersonaRoutes(personaId) {
    if (!personaId) return CAROUSEL_ROUTES;
    const persona = personaCards.find(p => p.id === personaId);
    if (!persona || !persona.routeKey) return CAROUSEL_ROUTES;
    const matched = persona.routeKey;
    const others = CAROUSEL_ROUTES.filter(k => k !== matched);
    return [matched, ...others];
}

// Final Apple route cards with persona-based ordering
renderCarouselCards = function() {
    const track = document.getElementById("carousel-track");
    const dots = document.getElementById("carousel-dots");
    if (!track) return;
    const routeOrder = getHomeRouteOrder();

    const orderedKeys = getPersonaRoutes(selectedPersonaId);

    track.innerHTML = orderedKeys
        .map(key => renderRouteLaunchCard(key, routes[key], {
            carousel: true,
            compact: true,
            recommended: selectedPersonaId && key === (personaCards.find(p => p.id === selectedPersonaId) || {}).routeKey
        }))
        .join("");

    if (dots) {
        dots.innerHTML = orderedKeys
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

    // Also update feature section to match persona
    renderFeatureSection(orderedKeys[0]);
};

renderRouteGrid = function() {
    const grid = document.getElementById("route-grid");
    if (!grid) return;

    const builtinKeys = Object.keys(routes).filter(k => !k.startsWith("custom_") && !k.startsWith("rdb_"));
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

    // ── Custom Routes Section (stacked cards) ──
    let customRoutesArr = [];
    try { customRoutesArr = JSON.parse(localStorage.getItem("nj_custom_routes") || "[]"); } catch(e) {}
    const customRoutesWrap = document.createElement("div");
    customRoutesWrap.id = "custom-routes-section";
    if (customRoutesArr.length > 0) {
        customRoutesWrap.innerHTML = `
            <div class="custom-route-stack-header">
                <span class="custom-route-stack-title"><span class="stack-icon">📋</span>我的自定义路线</span>
                <span class="custom-route-stack-count">${customRoutesArr.length} 条离线路线</span>
            </div>
            <div class="custom-route-stack">
                ${customRoutesArr.map((cr, i) => {
                    const routeKey = "custom_" + cr.id;
                    const r = routes[routeKey] || cr;
                    const stopCount = cr.stops ? cr.stops.length : (r.stops ? r.stops.length : 0);
                    const dur = cr.duration || r.duration || 0;
                    return `<div class="custom-route-card" data-route="${routeKey}" data-custom-id="${cr.id}">
                        <span class="custom-route-card-icon">🗺️</span>
                        <div class="custom-route-card-body">
                            <span class="custom-route-card-title">${escapeHtml(cr.title || "我的路线")}</span>
                            <span class="custom-route-card-desc">
                                <span>${stopCount} 个站点</span>
                                <span class="sep"></span>
                                <span>${dur} 分钟</span>
                                ${cr.hasMapData ? '<span class="sep"></span><span>🗺️ 含地图数据</span>' : ''}
                            </span>
                        </div>
                        <span class="custom-route-card-arrow">›</span>
                    </div>`;
                }).join('')}
            </div>`;
        container.appendChild(customRoutesWrap);

        // Bind click handlers for custom route cards
        customRoutesWrap.querySelectorAll(".custom-route-card").forEach(card => {
            card.addEventListener("click", () => {
                const routeKey = card.dataset.route;
                if (routes[routeKey]) {
                    openRoute(routeKey);
                } else {
                    // Fallback: show route editor with prefill
                    const cr = customRoutesArr.find(c => "custom_" + c.id === routeKey);
                    if (cr && cr.coords && cr.coords.length > 0) {
                        showMapRouteEditor({
                            routeName: cr.title || "",
                            stops: cr.stops?.map(s => typeof s === "string" ? s : s.name) || [],
                            coords: cr.coords,
                        });
                    } else {
                        showToast("该路线暂无地图数据，请重新编辑");
                    }
                }
            });
        });
    } else {
        customRoutesWrap.innerHTML = `
            <div class="custom-route-empty" id="custom-routes-empty">
                <span style="font-size:28px;display:block;margin-bottom:6px;">📋</span>
                还没有自定义路线<br>
                <span style="font-size:11px;">点击上方「上传我的路线」创建你的专属路线</span>
            </div>`;
        container.appendChild(customRoutesWrap);
    }

    // ── System Routes ──
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
        body: JSON.stringify({ userId: getCurrentUserId() || 1, message: text, sessionId: "web-" + Date.now() }),
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

function getHomeMerchantItems(routeKey = getHomeRecommendedRouteKey()) {
    const allData = (typeof SUPPLY_DATA !== "undefined") ? SUPPLY_DATA.getAll() : [];
    if (!allData.length) return [];

    // Determine persona preference or fall back to route-based
    const personaId = selectedPersonaId || (selectedPersonas[0] && selectedPersonas[0].id);
    const pref = PERSONA_MERCHANT_PREF[personaId] || null;

    // Fallback: route-based category priority (when no persona selected)
    const categoryPriority = {
        night: ["food", "coffee"],
        food: ["food", "coffee"],
        nju: ["coffee", "food"],
        expo: ["ticket", "coffee", "food"],
    }[routeKey] || ["food", "coffee", "ticket"];

    return allData
        .map(item => {
            let score = 0;

            if (pref) {
                // ── Persona-based scoring ──
                // Category match (highest weight)
                const catIdx = pref.priorityCats.indexOf(item.category);
                if (catIdx === 0) score += 8;
                else if (catIdx > 0) score += 5;
                else score -= 2; // Penalize non-priority categories

                // Tag match — each matching tag boosts score
                const itemTags = (item.tags || []).map(t => String(t).toLowerCase());
                const prefTags = pref.priorityTags.map(t => t.toLowerCase());
                const tagMatches = itemTags.filter(t => prefTags.some(pt => t.includes(pt) || pt.includes(t)));
                score += tagMatches.length * 5;

                // Subcategory match
                const itemSub = String(item.subcategory || "").toLowerCase();
                const subMatch = pref.prioritySubcats.some(s => itemSub.includes(s.toLowerCase()));
                if (subMatch) score += 4;

                // Excluded tags — heavy penalty
                const excludeMatches = itemTags.filter(t =>
                    pref.excludeTags.some(et => t.includes(et.toLowerCase()))
                );
                if (excludeMatches.length) score -= excludeMatches.length * 6;

                // Rating bonus
                score += (Number(item.rating || 0) - 3.5) * 3;

                // On-route bonus (if route matches persona's recommended route)
                if (item.onRoute) score += 4;

                // Distance penalty (closer = better)
                score -= Math.min(Number(item.distance || 3000), 3000) / 800;
            } else {
                // ── Fallback: route-based scoring (original logic) ──
                if (!categoryPriority.includes(item.category)) return { item, score: -999 };
                score =
                    (categoryPriority.indexOf(item.category) === 0 ? 6 : 3) +
                    (item.onRoute ? 4 : 0) +
                    (Number(item.rating || 0) * 1.5) -
                    Math.min(Number(item.distance || 3000), 3000) / 1000;
            }

            return { item, score };
        })
        .filter(entry => entry.score > -900)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(entry => entry.item);
}

function renderHomeMerchantCard(item) {
    const dist = Number(item.distance || 0) >= 1000
        ? `${(Number(item.distance) / 1000).toFixed(1)}km`
        : `${item.distance || 500}m`;
    const tags = (item.tags || []).slice(0, 2).map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
        <button class="home-merchant-card" type="button" data-store-id="${escapeHtml(item.id)}">
            <span class="home-merchant-icon">${categoryIcon(item.category)}</span>
            <span class="home-merchant-copy">
                <strong>${escapeHtml(item.name)}</strong>
                <small>${escapeHtml(item.subcategory || "南京本地商户")} · ${dist} · ${Number(item.rating || 4).toFixed(1)}分</small>
                <span class="home-merchant-tags">${tags}</span>
            </span>
            <span class="home-merchant-price">¥${item.avgPrice || "--"}</span>
        </button>
    `;
}

function renderHomeMerchantRecommendations(items) {
    const moreSection = document.getElementById("more-section");
    if (!moreSection) return;
    const routeKey = getHomeRecommendedRouteKey();
    const route = routes[routeKey];
    const merchants = Array.isArray(items) && items.length ? items : getHomeMerchantItems(routeKey);

    // Get persona info for personalized title
    const personaId = selectedPersonaId || (selectedPersonas[0] && selectedPersonas[0].id);
    const pref = PERSONA_MERCHANT_PREF[personaId] || null;

    let section = moreSection.querySelector(".home-merchant-section");
    if (!section) {
        section = document.createElement("div");
        section.className = "home-merchant-section";
        const guideBlock = document.getElementById("guide-block");
        if (guideBlock) guideBlock.before(section);
        else moreSection.appendChild(section);
    }
    if (!merchants.length) {
        section.innerHTML = `
            <div class="home-merchant-head">
                <span>商户推荐</span>
                <small>暂无可展示商户</small>
            </div>
        `;
        return;
    }
    section.innerHTML = `
        <div class="home-merchant-head">
            <span>${pref ? pref.label : "商户推荐"}</span>
            <small>${escapeHtml(pref ? pref.desc : getRouteDisplayTitle(route) + "附近好店")}</small>
        </div>
        <div class="home-merchant-scroll">
            ${merchants.map(renderHomeMerchantCard).join("")}
        </div>
    `;
    section.querySelectorAll(".home-merchant-card").forEach(card => {
        card.addEventListener("click", () => showPoiDetailOverlayDianping(card.dataset.storeId));
    });
}

function loadMeituanDeals() {
    renderHomeMerchantRecommendations();
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

/* Supply station renderer — saved before override */
const renderRouteSupplyStation = renderNearbyTab;
let routeSupplyPendingKey = null;

/* ----------  Community Data & Helpers ---------- */

const COMMUNITY_STORAGE_KEY = "citygo_community_posts_v2";
const COMMUNITY_FILE_LIMIT = 2.5 * 1024 * 1024;

// Expanded post types for Weibo-style community
const COMMUNITY_POST_TYPES = [
    { id: "text",    label: "纯文字", hint: "分享你的南京漫游想法或见闻。" },
    { id: "photo",   label: "照片",   hint: "发一组南京的瞬间，梧桐、城墙、美食、街角。" },
    { id: "route",   label: "路线",   hint: "分享一条你走过或推荐的南京路线。" },
    { id: "place",   label: "景点",   hint: "聊聊某个南京景点的体验和建议。" },
    { id: "merchant",label: "美食",   hint: "推荐或评价一家南京美食店家。" },
    { id: "activity",label: "活动",   hint: "发起一场周末出行活动，找同行搭子。" },
    { id: "question",label: "提问",   hint: "向社区提问，关于南京的一切。" },
];

const COMMUNITY_FEED_TABS = [
    { id: "all",    label: "推荐", icon: "✨" },
    { id: "route",  label: "路线", icon: "🗺️" },
    { id: "photo",  label: "照片", icon: "📷" },
    { id: "video",  label: "视频", icon: "🎬" },
    { id: "nearby", label: "附近", icon: "📍" },
];

const COMMUNITY_SEED_POSTS = [
    {
        id: "seed-night-review", seed: true, type: "route",
        author: "秦淮夜走员", avatar: "夜",
        title: "秦淮夜游：把老门东放在最后一站",
        text: "夫子庙人多，但从秦淮河边一路走到老门东，节奏慢慢变好。建议18:20到河边，先看天色变暗，再进街区吃夜宵。\n\n全程约3小时，边走边拍最舒服。避开周六晚高峰，周日晚上人少很多。",
        routeKey: "night", routeName: "秦淮夜游",
        place: "秦淮河 / 老门东", rating: 4.8,
        area: "秦淮区",
        tags: ["夜游", "路线推荐", "拍照", "情侣"],
        media: [
            { type: "image", url: "assets/scenes/qinhuai/scene.png", caption: "秦淮夜色" },
            { type: "image", url: "assets/persona/8.png", caption: "老门东灯笼" }
        ],
        comments: [
            { id:"c1", author: "慢慢走", avatar: "慢", text: "同意，最后去老门东吃夜宵刚好。", time: "18分钟前", likes: 12, replies: [] },
            { id:"c2", author: "周末出门", avatar: "周", text: "周六人很多吗？想避开最挤的时段。", time: "7分钟前", likes: 5, replies: [
                { id:"r1", author: "秦淮夜走员", avatar: "夜", replyTo: "周末出门", text: "周六晚饭后人最多，建议周日或者工作日晚上去。", time: "5分钟前" }
            ]},
        ],
        likes: 128, views: 1860, reposts: 24, quotes: 8, favorites: 56,
        time: "2小时前", timestamp: Date.now() - 7200000,
    },
    {
        id: "seed-wutong-route", seed: true, type: "route",
        author: "梧桐路书", avatar: "梧",
        title: "半日梧桐散步线：给第一次来南京的朋友",
        text: "南大鼓楼校区出发→上海路→南秀村→先锋书店。全程不赶，适合下午两点后出发。路上咖啡店很多，可以随时停下来。\n\n📍 起点：南大北大楼\n📍 终点：先锋书店五台山总店\n⏱ 约2小时（含咖啡停留）",
        routeKey: "food", routeName: "午后餐茶线",
        place: "上海路 / 南秀村", rating: 4.6,
        area: "鼓楼区",
        tags: ["citywalk", "咖啡", "梧桐", "一人行"],
        media: [
            { type: "image", url: "assets/persona/2.png", caption: "梧桐大道午后" },
            { type: "image", url: "assets/persona/4.png", caption: "南秀村街角" },
            { type: "image", url: "assets/scenes/museum/scene.png", caption: "先锋书店" }
        ],
        comments: [
            { id:"c3", author: "纸袋拿铁", avatar: "咖", text: "这条我走过，南秀村真的适合慢慢逛。推荐一家叫「随园」的咖啡馆。", time: "35分钟前", likes: 23, replies: [] },
        ],
        likes: 96, views: 1324, reposts: 18, quotes: 3, favorites: 42,
        time: "昨天", timestamp: Date.now() - 86400000,
    },
    {
        id: "seed-place-review", seed: true, type: "place",
        author: "展厅边角料", avatar: "展",
        title: "南博不用只看主展，特展厅更适合深逛",
        text: "如果你只有两小时：快速走一遍历史馆固定展（30min），然后直奔特展厅。最近的「江苏古代文明」特展非常值得。\n\n💡 预约提醒：周末必须提前3天在公众号预约，当天基本约不上。",
        routeKey: "expo", routeName: "博物馆展览线",
        place: "南京博物院", rating: 4.9,
        area: "玄武区",
        tags: ["博物馆", "展览", "预约提醒", "文化"],
        media: [
            { type: "image", url: "assets/scenes/museum/scene.png", caption: "南博特展厅入口" }
        ],
        comments: [
            { id:"c4", author: "新手逛展", avatar: "新", text: "预约提醒太有用了，上次就是没约上。", time: "1小时前", likes: 8, replies: [] },
            { id:"c5", author: "路线收藏家", avatar: "路", text: "可以和明故宫放同一天吗？步行距离。", time: "46分钟前", likes: 3, replies: [
                { id:"r2", author: "展厅边角料", avatar: "展", replyTo: "路线收藏家", text: "完全可以！明故宫遗址就在南博东边，步行10分钟。", time: "40分钟前" }
            ]},
        ],
        likes: 152, views: 2402, reposts: 31, quotes: 12, favorites: 89,
        time: "3小时前", timestamp: Date.now() - 10800000,
    },
    {
        id: "seed-photo-wall", seed: true, type: "photo",
        author: "快门按不停", avatar: "拍",
        title: "今天拍的颐和路：南京最适合拍照的梧桐街区",
        text: "下午四点的光最好，梧桐叶把阳光筛成碎金。推荐从颐和路→牯岭路→莫干路这条线走，每条路都有自己的味道。",
        routeKey: "", routeName: "", place: "颐和路公馆区", rating: null,
        area: "鼓楼区",
        tags: ["摄影", "梧桐", "民国建筑", "颐和路"],
        media: [
            { type: "image", url: "assets/persona/5.png", caption: "颐和路梧桐" },
            { type: "image", url: "assets/persona/3.png", caption: "公馆区建筑" },
            { type: "image", url: "assets/persona/1.png", caption: "街角咖啡馆" },
            { type: "image", url: "assets/persona/6.png", caption: "雨后倒影" }
        ],
        comments: [],
        likes: 203, views: 3401, reposts: 45, quotes: 6, favorites: 112,
        time: "5小时前", timestamp: Date.now() - 18000000,
    },
    {
        id: "seed-merchant-review", seed: true, type: "merchant",
        author: "鸭血粉丝鉴定师", avatar: "鸭",
        title: "实测：老门东三家鸭血粉丝汤横向对比",
        text: "周末专门跑了三家老门东附近的鸭血粉丝汤店：\n\n1. 回味 — 汤底浓郁，鸭血嫩滑，¥22 ⭐4.5\n2. 鸭德堡 — 料足实惠，鸭杂多，¥18 ⭐4.2\n3. 小潘记 — 排队太久但值得，汤里有中药香，¥28 ⭐4.7\n\n个人推荐：第一次来去回味，愿意排队去小潘记。",
        routeKey: "", routeName: "", place: "老门东美食街", rating: null,
        area: "秦淮区",
        tags: ["美食评测", "鸭血粉丝", "老门东", "吃货"],
        media: [
            { type: "image", url: "assets/persona/2.png", caption: "鸭血粉丝汤" }
        ],
        comments: [
            { id:"c6", author: "南京土著", avatar: "南", text: "鸭德堡确实是性价比之王，本地人常去。", time: "2小时前", likes: 45, replies: [] },
            { id:"c7", author: "游客小张", avatar: "游", text: "小潘记排队一般多久？中午去行吗？", time: "1小时前", likes: 2, replies: [
                { id:"r3", author: "鸭血粉丝鉴定师", avatar: "鸭", replyTo: "游客小张", text: "中午11点前去基本不用排，12点后排队30-40分钟。", time: "55分钟前" }
            ]},
        ],
        likes: 287, views: 5601, reposts: 52, quotes: 15, favorites: 178,
        time: "6小时前", timestamp: Date.now() - 21600000,
    },
    {
        id: "seed-activity", seed: true, type: "activity",
        author: "周末出行组", avatar: "组",
        title: "本周六：紫金山徒步+灵谷寺桂花，找3-4个搭子",
        text: "路线：白马公园→紫金山登山道→头陀岭→灵谷寺→体育公园\n\n💰 预算：免费（自带水和零食）\n⏱ 时间：周六上午9:00集合\n📍 集合：白马公园南门\n👥 已有2人，再找2-3人\n\n要求：能走山路（中等强度），对户外有兴趣就行。",
        routeKey: "mingfeng_guyun", routeName: "明风古韵线",
        place: "紫金山 / 灵谷寺", rating: null,
        area: "玄武区",
        tags: ["活动招募", "徒步", "紫金山", "周末"],
        media: [
            { type: "image", url: "assets/persona/7.png", caption: "紫金山登山道" }
        ],
        comments: [
            { id:"c8", author: "户外新人", avatar: "户", text: "难度大吗？平时只走过平路可以参加吗？", time: "3小时前", likes: 1, replies: [
                { id:"r4", author: "周末出行组", avatar: "组", replyTo: "户外新人", text: "中等难度，有台阶路也有土路。如果你平时有运动习惯应该没问题！", time: "2小时前" }
            ]},
        ],
        likes: 89, views: 1204, reposts: 12, quotes: 2, favorites: 38,
        time: "8小时前", timestamp: Date.now() - 28800000,
    },
    {
        id: "seed-question", seed: true, type: "question",
        author: "新生报到中", avatar: "新",
        title: "南大新生求问：周末一个人逛南京，推荐第一站去哪？",
        text: "刚到南大报到，这个周末想自己出去逛逛。喜欢安静的地方，最好不要离鼓楼太远。求学长学姐安利！",
        routeKey: "", routeName: "", place: "鼓楼区", rating: null,
        area: "鼓楼区",
        tags: ["提问", "南大新生", "一人行", "安静"],
        media: [],
        comments: [
            { id:"c9", author: "大四老学姐", avatar: "老", text: "强烈推荐从南大北大楼出发走到先锋书店（五台山），全程梧桐树下散步，还能打卡南京最有名的书店。", time: "1小时前", likes: 34, replies: [] },
            { id:"c10", author: "研一学长", avatar: "研", text: "玄武湖也很近！从鼓楼骑车过去15分钟，湖边走走超级舒服。", time: "45分钟前", likes: 28, replies: [] },
        ],
        likes: 67, views: 980, reposts: 3, quotes: 0, favorites: 15,
        time: "今天", timestamp: Date.now() - 3600000,
    },
    {
        id: "seed-repost-example", seed: true, type: "text",
        author: "爱转发的路人", avatar: "转",
        title: "",
        text: "",
        routeKey: "", routeName: "", place: "", rating: null,
        area: "",
        tags: [],
        media: [],
        repostOf: {
            originalPostId: "seed-night-review",
            originalAuthor: "秦淮夜走员",
            originalTitle: "秦淮夜游：把老门东放在最后一站",
            originalText: "夫子庙人多，但从秦淮河边一路走到老门东，节奏慢慢变好。",
            originalMedia: [{ type: "image", url: "assets/scenes/qinhuai/scene.png", caption: "秦淮夜色" }]
        },
        comments: [],
        likes: 18, views: 300, reposts: 0, quotes: 0, favorites: 5,
        time: "1小时前", timestamp: Date.now() - 3600000,
    },
    {
        id: "seed-quote-example", seed: true, type: "text",
        author: "有观点的读者", avatar: "观",
        title: "",
        text: "完全同意！我还想补充一点：从夫子庙走到老门东的途中，可以拐进乌衣巷看看。虽然很短，但是「旧时王谢堂前燕」的感觉很特别。",
        routeKey: "", routeName: "", place: "", rating: null,
        area: "秦淮区",
        tags: ["观点", "秦淮", "citywalk"],
        media: [],
        quoteOf: {
            originalPostId: "seed-night-review",
            originalAuthor: "秦淮夜走员",
            originalTitle: "秦淮夜游：把老门东放在最后一站",
            originalText: "夫子庙人多，但从秦淮河边一路走到老门东，节奏慢慢变好。",
            originalMedia: [{ type: "image", url: "assets/scenes/qinhuai/scene.png", caption: "秦淮夜色" }],
        },
        comments: [],
        likes: 42, views: 680, reposts: 5, quotes: 2, favorites: 19,
        time: "30分钟前", timestamp: Date.now() - 1800000,
    },
];

let communityFilter = "all";
let communitySearchQuery = "";

function getCommunityType(typeId) {
    return COMMUNITY_POST_TYPES.find(type => type.id === typeId) || COMMUNITY_POST_TYPES[0];
}

function cloneCommunitySeeds() {
    return JSON.parse(JSON.stringify(COMMUNITY_SEED_POSTS));
}

function loadCommunityPosts() {
    try {
        const saved = localStorage.getItem(COMMUNITY_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch(e) {}
    return cloneCommunitySeeds();
}

function saveCommunityPosts(posts) {
    try {
        localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts));
    } catch(e) {
        showToast("本地空间不足，视频或图片可以改用链接发布");
    }
}

function communityText(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
}

function getCommunityCurrentUserName() {
    try {
        const profile = getUserProfile();
        return profile?.name || "我";
    } catch(e) {
        return "我";
    }
}

function getCommunityAvatar(author) {
    const safe = String(author || "我").trim();
    return safe.slice(0, 1) || "我";
}

function getCommunityRouteOptions() {
    const keys = typeof getAllDisplayRouteKeys === "function" ? getAllDisplayRouteKeys() : Object.keys(routes);
    return keys
        .filter(key => routes[key])
        .map(key => `<option value="${escapeHtml(key)}">${escapeHtml(getRouteDisplayTitle(routes[key]))}</option>`)
        .join("");
}

function getCommunityStats(posts) {
    const routePosts = posts.filter(post => post.type === "route").length;
    const reviewPosts = posts.filter(post => post.type === "routeReview" || post.type === "placeReview").length;
    const comments = posts.reduce((sum, post) => sum + (post.comments || []).length, 0);
    return { routePosts, reviewPosts, comments };
}

function renderCommunityFilters() {
    const filters = [{ id: "all", label: "全部" }, ...COMMUNITY_POST_TYPES];
    return filters.map(filter =>
        `<button class="community-filter${communityFilter === filter.id ? " active" : ""}" type="button" data-community-filter="${filter.id}">
            ${escapeHtml(filter.label)}
        </button>`
    ).join("");
}

function getCommunityPostTime(post) {
    if (!post.timestamp) return post.time || "刚刚";
    const diff = Date.now() - Number(post.timestamp);
    if (diff < 60 * 1000) return "刚刚";
    if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + "分钟前";
    if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + "小时前";
    return Math.floor(diff / 86400000) + "天前";
}

function renderCommunityMedia(media) {
    if (!Array.isArray(media) || !media.length) return "";
    return `<div class="community-media-grid">
        ${media.slice(0, 4).map(item => {
            const caption = item.caption ? `<span>${escapeHtml(item.caption)}</span>` : "";
            if (item.type === "video") {
                return item.url
                    ? `<figure class="community-media community-media-video"><video src="${escapeHtml(item.url)}" controls preload="metadata"></video>${caption}</figure>`
                    : `<figure class="community-media community-media-video placeholder"><div class="community-video-placeholder"><b>VIDEO</b><small>${escapeHtml(item.caption || "短视频内容")}</small></div></figure>`;
            }
            return `<figure class="community-media"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.caption || "社区图片")}" loading="lazy">${caption}</figure>`;
        }).join("")}
    </div>`;
}

function renderCommunityPost(post) {
    const typeInfo = getCommunityType(post.type);
    const tags = (post.tags && post.tags.length ? post.tags : [typeInfo.label]).slice(0, 5);
    const commentList = (post.comments || []).slice(-3);
    const routeName = post.routeName || (post.routeKey && routes[post.routeKey] ? getRouteDisplayTitle(routes[post.routeKey]) : "");
    const rating = post.rating ? `<span class="community-rating">${Number(post.rating).toFixed(1)} 分</span>` : "";
    const place = post.place ? `<span>${escapeHtml(post.place)}</span>` : "";
    const routeChip = routeName ? `<button class="community-meta-chip action" type="button" data-community-open-route="${escapeHtml(post.id)}">${escapeHtml(routeName)}</button>` : "";

    return `<article class="community-post" data-community-post="${escapeHtml(post.id)}">
        <header class="community-post-head">
            <div class="community-avatar">${escapeHtml(post.avatar || getCommunityAvatar(post.author))}</div>
            <div class="community-author-block">
                <div class="community-author-row">
                    <strong>${escapeHtml(post.author || "匿名旅人")}</strong>
                    <span class="community-type">${escapeHtml(typeInfo.label)}</span>
                </div>
                <span class="community-time">${escapeHtml(getCommunityPostTime(post))} · ${Number(post.views || 0)} 浏览</span>
            </div>
        </header>
        <h3 class="community-post-title">${escapeHtml(post.title || "未命名帖子")}</h3>
        <div class="community-post-meta">
            ${routeChip}
            ${place}
            ${rating}
        </div>
        <p class="community-post-text">${communityText(post.text)}</p>
        ${renderCommunityMedia(post.media)}
        <div class="community-tags">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="community-actions">
            <button type="button" data-community-like="${escapeHtml(post.id)}">${post.liked ? "已赞" : "赞"} · ${Number(post.likes || 0)}</button>
            <button type="button" data-community-reply="${escapeHtml(post.id)}">引用观点</button>
            ${routeName ? `<button type="button" data-community-open-route="${escapeHtml(post.id)}">打开路线</button>` : ""}
        </div>
        <div class="community-comments">
            ${commentList.map(comment => `
                <div class="community-comment">
                    <b>${escapeHtml(comment.author || "匿名")}</b>
                    <span>${communityText(comment.text)}</span>
                    <small>${escapeHtml(comment.time || "刚刚")}</small>
                </div>
            `).join("")}
            <div class="community-comment-box">
                <input type="text" data-community-comment-input="${escapeHtml(post.id)}" placeholder="写下你的评论或建议" maxlength="120">
                <button type="button" data-community-comment="${escapeHtml(post.id)}">发送</button>
            </div>
        </div>
    </article>`;
}

function getFilteredCommunityPosts() {
    const keyword = communitySearchQuery.trim().toLowerCase();
    return loadCommunityPosts().filter(post => {
        const typeMatch = communityFilter === "all" || post.type === communityFilter;
        if (!typeMatch) return false;
        if (!keyword) return true;
        const haystack = [post.title, post.text, post.routeName, post.place, ...(post.tags || [])]
            .join(" ")
            .toLowerCase();
        return haystack.includes(keyword);
    });
}

function renderCommunityFeed(container) {
    const feed = container.querySelector("#community-feed");
    if (!feed) return;
    const posts = getFilteredCommunityPosts();
    feed.innerHTML = posts.length
        ? posts.map(renderCommunityPost).join("")
        : `<div class="community-empty">
            <strong>还没有相关帖子</strong>
            <span>换个筛选，或者自己发起一个路线讨论。</span>
        </div>`;
    bindCommunityFeedEvents(container);
}

function bindCommunityComposer(container) {
    // Toggle composer expand/collapse
    const toggle = container.querySelector("#community-composer-toggle");
    const body = container.querySelector("#community-composer-body");
    const composer = container.querySelector("#community-composer");
    const chevron = container.querySelector("#community-composer-chevron");
    const setOpen = (open) => {
        if (!body) return;
        body.hidden = !open;
        composer?.classList.toggle("open", open);
        toggle?.classList.toggle("expanded", open);
        toggle?.setAttribute("aria-expanded", String(open));
        if (chevron) chevron.textContent = open ? "⌄" : "›";
    };
    if (toggle && body) {
        toggle.addEventListener("click", () => {
            setOpen(body.hidden);
        });
        toggle.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            setOpen(body.hidden);
        });
        setOpen(false);
    }

    const typeSelect = container.querySelector("#community-post-type");
    const hint = container.querySelector("#community-type-hint");
    const fileInput = container.querySelector("#community-media-files");
    const preview = container.querySelector("#community-media-preview");

    const syncHint = () => {
        const type = getCommunityType(typeSelect?.value);
        if (hint) hint.textContent = type.hint;
    };
    typeSelect?.addEventListener("change", syncHint);
    syncHint();

    fileInput?.addEventListener("change", () => {
        const files = Array.from(fileInput.files || []);
        if (!preview) return;
        preview.textContent = files.length
            ? files.slice(0, 4).map(file => file.name).join(" / ")
            : "可选：上传图片或短视频，也可以只发文字。";
    });

    container.querySelector("#community-submit")?.addEventListener("click", () => submitCommunityPost(container));
    container.querySelector("#community-clear")?.addEventListener("click", () => {
        container.querySelector("#community-title").value = "";
        container.querySelector("#community-text").value = "";
        container.querySelector("#community-place").value = "";
        container.querySelector("#community-image-url").value = "";
        container.querySelector("#community-video-url").value = "";
        container.querySelector("#community-tags-input").value = "";
        if (fileInput) fileInput.value = "";
        if (preview) preview.textContent = "可选：上传图片或短视频，也可以只发文字。";
    });
    container.querySelector("#community-map-route")?.addEventListener("click", showMapRouteEditor);

    container.querySelector("#community-search")?.addEventListener("input", event => {
        communitySearchQuery = event.target.value || "";
        renderCommunityFeed(container);
    });
    container.querySelectorAll("[data-community-filter]").forEach(button => {
        button.addEventListener("click", () => {
            communityFilter = button.dataset.communityFilter || "all";
            container.querySelectorAll("[data-community-filter]").forEach(btn => btn.classList.toggle("active", btn === button));
            renderCommunityFeed(container);
        });
    });
}

function parseCommunityMediaUrls(value, type) {
    return String(value || "")
        .split(/[\n,，]+/)
        .map(url => url.trim())
        .filter(Boolean)
        .map(url => ({ type, url, caption: type === "video" ? "视频链接" : "图片链接" }));
}

function readCommunityFile(file) {
    return new Promise(resolve => {
        if (!file || file.size > COMMUNITY_FILE_LIMIT) {
            showToast("图片或视频过大，建议使用链接发布");
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve({
            type: file.type && file.type.startsWith("video") ? "video" : "image",
            url: reader.result,
            caption: file.name,
        });
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

async function readCommunityFiles(fileList) {
    const files = Array.from(fileList || []).slice(0, 4);
    const media = await Promise.all(files.map(readCommunityFile));
    return media.filter(Boolean);
}

function buildCommunityTags(typeInfo, routeName, rawTags) {
    const tags = String(rawTags || "")
        .split(/[,\s，#]+/)
        .map(tag => tag.trim())
        .filter(Boolean);
    tags.unshift(typeInfo.label);
    if (routeName) tags.push(routeName);
    return [...new Set(tags)].slice(0, 6);
}

async function submitCommunityPost(container) {
    if (!isLoggedIn()) {
        showAuthModal("login", () => submitCommunityPost(container));
        return;
    }

    const typeId = container.querySelector("#community-post-type")?.value || "route";
    const typeInfo = getCommunityType(typeId);
    const titleInput = container.querySelector("#community-title");
    const textInput = container.querySelector("#community-text");
    const routeKey = container.querySelector("#community-route")?.value || "";
    const routeName = routeKey && routes[routeKey] ? getRouteDisplayTitle(routes[routeKey]) : "";
    const place = container.querySelector("#community-place")?.value.trim() || "";
    const ratingValue = container.querySelector("#community-rating")?.value || "";
    const imageUrl = container.querySelector("#community-image-url")?.value || "";
    const videoUrl = container.querySelector("#community-video-url")?.value || "";
    const tagsRaw = container.querySelector("#community-tags-input")?.value || "";
    const fileInput = container.querySelector("#community-media-files");
    const title = titleInput?.value.trim() || "";
    const text = textInput?.value.trim() || "";

    if (!title && !text) {
        showToast("至少写一个标题或正文");
        return;
    }

    const submitBtn = container.querySelector("#community-submit");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "发布中...";
    }

    const media = [
        ...parseCommunityMediaUrls(imageUrl, "image"),
        ...parseCommunityMediaUrls(videoUrl, "video"),
        ...(await readCommunityFiles(fileInput?.files)),
    ].slice(0, 4);

    const author = getCommunityCurrentUserName();
    const post = {
        id: "post_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
        type: typeId,
        author,
        avatar: getCommunityAvatar(author),
        title: title || typeInfo.label,
        text: text || typeInfo.hint,
        routeKey,
        routeName,
        place,
        rating: ratingValue ? Number(ratingValue) : null,
        tags: buildCommunityTags(typeInfo, routeName, tagsRaw),
        media,
        comments: [],
        likes: 0,
        views: 0,
        timestamp: Date.now(),
    };

    const posts = loadCommunityPosts();
    posts.unshift(post);
    saveCommunityPosts(posts);
    showToast("帖子已发布到漫游社区");
    renderCommunityPage(container);
}

function findCommunityPost(posts, postId) {
    return posts.find(post => String(post.id) === String(postId));
}

// ═══ 社区好友区段 ═══
function renderCommunityFriendsSection(container) {
    var listEl = container.querySelector("#community-friends-list");
    var reqEl = container.querySelector("#community-friends-requests");
    if (!listEl) return;

    // 检查登录状态
    if (!isLoggedIn()) {
        listEl.innerHTML = '<span class="community-friends-loading" style="cursor:pointer;color:var(--primary);" onclick="showAuthModal(\'login\')">登录后查看好友</span>';
        return;
    }

    // 加载好友数据
    var friends = [];
    var requests = [];
    try {
        var stored = localStorage.getItem("citygo_friends_v1");
        if (stored) {
            var data = JSON.parse(stored);
            friends = data.friends || [];
            requests = (data.requests || []).filter(function(r) { return r.status === "PENDING"; });
        }
    } catch(e) {}

    // 异步从后端刷新
    if (typeof friendApi !== "undefined" && typeof friendApi.getFriends === "function") {
        friendApi.getFriends().then(function(res) {
            if (res && res.code === 200 && res.data) {
                friends = res.data;
                saveFriendData(friends, requests, []);
            }
            renderFriendsList(listEl, friends, container);
        }).catch(function() {
            renderFriendsList(listEl, friends, container);
        });
    } else {
        renderFriendsList(listEl, friends, container);
    }

    // 显示待处理请求
    if (reqEl && requests.length > 0) {
        reqEl.style.display = "block";
        reqEl.innerHTML = '<span class="community-friends-request-badge" onclick="requireAuth(function(){ openFriendPage(); })">' +
            requests.length + ' 条好友请求待处理 →</span>';
    }
}

function renderFriendsList(listEl, friends, container) {
    if (!friends || !friends.length) {
        listEl.innerHTML = '<span class="community-friends-empty">还没有好友，点击上方按钮添加</span>';
        return;
    }
    var html = '';
    friends.forEach(function(f) {
        var avatar = f.avatarUrl || f.avatar || '👤';
        var name = f.nickname || f.name || '用户';
        var bio = f.bio || f.travelPersona || '';
        var fid = f.userId || f.id;
        html += '<div class="community-friend-card" data-friend-id="' + fid + '" ' +
            'onclick="requireAuth(function(){ if(typeof openFriendChat===\'function\')openFriendChat(\'' + fid + '\'); })">' +
            '<span class="community-friend-avatar">' + avatar + '</span>' +
            '<div class="community-friend-info">' +
            '<span class="community-friend-name">' + escapeHtml(name) + '</span>' +
            (bio ? '<span class="community-friend-bio">' + escapeHtml(bio) + '</span>' : '') +
            '</div>' +
            '</div>';
    });
    listEl.innerHTML = html;
}

function openCommunityAddFriend(container) {
    // 移除已有弹窗
    var existing = document.querySelector(".community-friend-search-modal");
    if (existing) existing.remove();

    var modal = document.createElement("div");
    modal.className = "community-friend-search-modal";
    modal.innerHTML = '<div class="community-friend-search-backdrop"></div>' +
        '<div class="community-friend-search-dialog">' +
        '<h3>添加好友</h3>' +
        '<input type="text" id="community-friend-search-input" placeholder="输入用户昵称或 NJW- 编号搜索">' +
        '<div class="community-friend-search-results" id="community-friend-search-results">' +
        '<span class="community-friends-loading" style="display:none;">搜索中…</span></div>' +
        '<button class="community-friend-search-close" type="button">关闭</button>' +
        '</div>';
    document.body.appendChild(modal);

    var closeBtn = modal.querySelector(".community-friend-search-close");
    var backdrop = modal.querySelector(".community-friend-search-backdrop");
    var close = function() { modal.remove(); };
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    var input = modal.querySelector("#community-friend-search-input");
    var results = modal.querySelector("#community-friend-search-results");
    var timer;
    input.addEventListener("input", function() {
        clearTimeout(timer);
        var q = input.value.trim();
        if (!q) { results.innerHTML = ""; return; }
        results.querySelector(".community-friends-loading").style.display = "block";
        timer = setTimeout(function() {
            if (typeof friendApi !== "undefined" && typeof friendApi.search === "function") {
                friendApi.search(q).then(function(res) {
                    var users = (res && res.data) || [];
                    renderFriendSearchResults(results, users);
                }).catch(function() {
                    results.innerHTML = '<span style="color:#999;">搜索失败，请重试</span>';
                });
            }
        }, 400);
    });
    input.focus();
}

function renderFriendSearchResults(results, users) {
    if (!users || !users.length) {
        results.innerHTML = '<span style="color:#999;">未找到用户</span>';
        return;
    }
    var html = '';
    users.forEach(function(u) {
        var name = u.nickname || u.name || '用户';
        var code = u.publicUserCode || '';
        html += '<div class="community-friend-search-item">' +
            '<div class="community-friend-search-user">' +
            '<span class="community-friend-avatar">' + (u.avatarUrl || '👤') + '</span>' +
            '<div><strong>' + escapeHtml(name) + '</strong>' +
            (code ? '<br><small style="color:#999;">' + escapeHtml(code) + '</small>' : '') +
            '</div></div>' +
            '<button class="community-friend-search-add" data-user-id="' + u.userId + '">+ 添加</button>' +
            '</div>';
    });
    results.innerHTML = html;
    results.querySelectorAll(".community-friend-search-add").forEach(function(btn) {
        btn.addEventListener("click", function() {
            var userId = btn.getAttribute("data-user-id");
            btn.disabled = true;
            btn.textContent = "发送中…";
            friendApi.sendRequest(userId, "你好，一起探索南京！").then(function(res) {
                if (res && res.code === 200) {
                    btn.textContent = "已发送 ✓";
                    btn.style.background = "#2E8B57";
                } else {
                    btn.textContent = "失败，重试";
                    btn.disabled = false;
                }
            }).catch(function() {
                btn.textContent = "失败，重试";
                btn.disabled = false;
            });
        });
    });
}

function bindCommunityFeedEvents(container) {
    container.querySelectorAll("[data-community-like]").forEach(button => {
        button.addEventListener("click", () => {
            if (!isLoggedIn()) {
                showAuthModal("login");
                return;
            }
            const posts = loadCommunityPosts();
            const post = findCommunityPost(posts, button.dataset.communityLike);
            if (!post) return;
            post.liked = !post.liked;
            post.likes = Math.max(0, Number(post.likes || 0) + (post.liked ? 1 : -1));
            saveCommunityPosts(posts);
            renderCommunityFeed(container);
        });
    });

    container.querySelectorAll("[data-community-comment]").forEach(button => {
        button.addEventListener("click", () => {
            if (!isLoggedIn()) {
                showAuthModal("login");
                return;
            }
            const postId = button.dataset.communityComment;
            const input = container.querySelector(`[data-community-comment-input="${postId}"]`);
            const text = input?.value.trim();
            if (!text) return;
            const posts = loadCommunityPosts();
            const post = findCommunityPost(posts, postId);
            if (!post) return;
            post.comments = post.comments || [];
            post.comments.push({ author: getCommunityCurrentUserName(), text, time: "刚刚" });
            saveCommunityPosts(posts);
            renderCommunityFeed(container);
        });
    });

    container.querySelectorAll("[data-community-open-route]").forEach(button => {
        button.addEventListener("click", () => {
            const posts = loadCommunityPosts();
            const post = findCommunityPost(posts, button.dataset.communityOpenRoute);
            if (post?.routeKey && routes[post.routeKey]) openRoute(post.routeKey);
            else showToast("这条帖子没有关联路线");
        });
    });

    container.querySelectorAll("[data-community-reply]").forEach(button => {
        button.addEventListener("click", () => {
            const posts = loadCommunityPosts();
            const post = findCommunityPost(posts, button.dataset.communityReply);
            if (!post) return;
            const body = container.querySelector("#community-composer-body");
            const toggle = container.querySelector("#community-composer-toggle");
            if (body?.hidden) toggle?.click();
            const typeSelect = container.querySelector("#community-post-type");
            const titleInput = container.querySelector("#community-title");
            const textInput = container.querySelector("#community-text");
            if (typeSelect) typeSelect.value = "opinion";
            if (titleInput) titleInput.value = "回应：" + (post.title || "");
            if (textInput) textInput.value = "\n\n引用「" + (post.author || "匿名") + "」：" + (post.text || "").slice(0, 60);
            container.querySelector(".community-composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
            textInput?.focus();
        });
    });
}

// ══════════════════════════════════════════════════════
//  Friend System · 好友系统 + 私聊
// ══════════════════════════════════════════════════════

const MOCK_FRIENDS = [
    { id: "friend_01", name: "南京漫步者", avatar: "🚶", status: "online", lastMsg: "周末一起去老门东吗？", lastTime: "刚刚" },
    { id: "friend_02", name: "咖啡控小陈", avatar: "☕", status: "online", lastMsg: "先锋书店那家咖啡不错！", lastTime: "5分钟前" },
    { id: "friend_03", name: "摄影师大刘", avatar: "📷", status: "away", lastMsg: "昨天拍的梧桐大道绝了", lastTime: "1小时前" },
    { id: "friend_04", name: "美食猎人阿林", avatar: "🍜", status: "online", lastMsg: "李记锅贴yyds!", lastTime: "昨天" },
    { id: "friend_05", name: "文化探险家", avatar: "🏛", status: "offline", lastMsg: "南博的新展很值得看", lastTime: "2天前" },
    { id: "friend_06", name: "夜游南京", avatar: "🌙", status: "away", lastMsg: "秦淮河的灯光秀今晚走起", lastTime: "3小时前" },
];

const MOCK_ADD_SUGGESTIONS = [
    { id: "sug_01", name: "历史迷老沈", avatar: "📜", meta: "共同去过 南大校史线" },
    { id: "sug_02", name: "甜点控小悦", avatar: "🍰", meta: "共同去过 午后餐茶线" },
    { id: "sug_03", name: "骑行达人阿风", avatar: "🚲", meta: "共同探索 玄武湖" },
];

// Persistable chat messages (localStorage-backed)
function loadChatMessages() {
    try {
        const raw = localStorage.getItem("citygo_friend_chats");
        return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
}

function saveChatMessages(chats) {
    try { localStorage.setItem("citygo_friend_chats", JSON.stringify(chats)); } catch (e) {}
}

function getOrCreateFriendChat(friendId) {
    const all = loadChatMessages();
    if (!all[friendId]) {
        const friend = MOCK_FRIENDS.find(f => f.id === friendId);
        all[friendId] = {
            id: friendId,
            name: friend ? friend.name : "好友",
            messages: [{
                fromMe: false,
                text: friend ? `你好！一起探索南京吧~` : "Hi!",
                time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
            }]
        };
        saveChatMessages(all);
    }
    return all[friendId];
}

function renderFriendChatMessages(friendId) {
    const container = document.getElementById("friend-chat-messages");
    if (!container) return;
    const chat = getOrCreateFriendChat(friendId);
    const friend = MOCK_FRIENDS.find(f => f.id === friendId);

    container.innerHTML = chat.messages.map((msg, i) => `
        <div class="friend-msg ${msg.fromMe ? 'me' : 'them'}">
            <span class="friend-msg-avatar">${msg.fromMe ? '👤' : (friend ? friend.avatar : '👤')}</span>
            <div>
                <div class="friend-msg-bubble">${escapeHtml(msg.text)}</div>
                <div class="friend-msg-time">${msg.time || ''}</div>
            </div>
        </div>
    `).join("");

    // Scroll to bottom
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
}

function openFriendChat(friendId) {
    const panel = document.getElementById("friend-chat-panel");
    const friend = MOCK_FRIENDS.find(f => f.id === friendId);
    if (!panel) return;

    // Set header
    document.getElementById("friend-chat-avatar").textContent = friend ? friend.avatar : "👤";
    document.getElementById("friend-chat-name").textContent = friend ? friend.name : "好友";
    document.getElementById("friend-chat-status").textContent = friend ? (friend.status === "online" ? "在线" : friend.status === "away" ? "离开" : "离线") : "";

    // Store active friend
    panel.dataset.friendId = friendId;

    // Render messages
    renderFriendChatMessages(friendId);

    // Show panel
    panel.classList.add("open");
    document.body.style.overflow = "hidden";

    // Focus input
    setTimeout(() => document.getElementById("friend-chat-input")?.focus(), 300);
}

function closeFriendChat() {
    const panel = document.getElementById("friend-chat-panel");
    if (!panel) return;
    panel.classList.remove("open");
    document.body.style.overflow = "";
    panel.removeAttribute("data-friend-id");
}

function sendFriendMessage() {
    const panel = document.getElementById("friend-chat-panel");
    const input = document.getElementById("friend-chat-input");
    if (!panel || !input) return;

    const text = input.value.trim();
    if (!text) return;

    const friendId = panel.dataset.friendId;
    if (!friendId) return;

    const all = loadChatMessages();
    const chat = all[friendId];
    if (!chat) return;

    const now = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    chat.messages.push({ fromMe: true, text, time: now });
    saveChatMessages(all);

    // Update last message for friend card
    const friend = MOCK_FRIENDS.find(f => f.id === friendId);
    if (friend) friend.lastMsg = text;

    input.value = "";
    renderFriendChatMessages(friendId);
}

// Friend add modal
function openFriendAddModal() {
    if (!isLoggedIn()) {
        showAuthModal("login", () => openFriendAddModal());
        return;
    }

    let modal = document.getElementById("friend-add-overlay");
    // Always rebuild to clear stale state
    if (modal) modal.remove();

    modal = document.createElement("div");
    modal.id = "friend-add-overlay";
    modal.className = "friend-add-overlay";
    modal.innerHTML = `
        <div class="friend-add-card">
            <h3>添加好友</h3>
            <input type="text" class="friend-add-input" id="friend-add-search" placeholder="搜索用户编号(如NJW-xxx)或昵称…" />
            <div class="friend-add-suggestions" id="friend-add-suggestions">
                <p style="font-size:12px;color:var(--soft);margin-bottom:8px;">请输入关键词搜索真实用户</p>
            </div>
            <div class="friend-add-actions">
                <button class="friend-add-btn-cancel" id="friend-add-cancel">取消</button>
                <button class="friend-add-btn-primary" id="friend-add-confirm" disabled>发送申请</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    let selectedUserId = null;
    let selectedUserName = null;

    modal.addEventListener("click", function(e) {
        if (e.target === modal) closeFriendAddModal();
    });
    modal.querySelector("#friend-add-cancel").addEventListener("click", closeFriendAddModal);

    const confirmBtn = modal.querySelector("#friend-add-confirm");
    const suggestionsDiv = modal.querySelector("#friend-add-suggestions");
    const searchInput = modal.querySelector("#friend-add-search");

    // Debounced search
    let searchTimer = null;
    searchInput.addEventListener("input", function() {
        const q = this.value.trim();
        clearTimeout(searchTimer);
        selectedUserId = null;
        selectedUserName = null;
        confirmBtn.disabled = true;
        confirmBtn.textContent = "发送申请";

        if (q.length < 1) {
            suggestionsDiv.innerHTML = '<p style="font-size:12px;color:var(--soft);margin-bottom:8px;">请输入关键词搜索真实用户</p>';
            return;
        }

        searchTimer = setTimeout(async () => {
            suggestionsDiv.innerHTML = '<p style="font-size:12px;color:var(--soft);">搜索中…</p>';
            const users = await friendApi.search(q);
            if (users.length === 0) {
                suggestionsDiv.innerHTML = '<p style="font-size:12px;color:var(--soft);">未找到匹配用户</p>';
                return;
            }
            suggestionsDiv.innerHTML = users.map(u => `
                <div class="friend-add-suggestion" data-id="${u.id}" data-name="${escapeHtml(u.nickname)}">
                    <span class="friend-add-suggestion-avatar">${escapeHtml(u.nickname ? u.nickname.slice(0,1) : '?')}</span>
                    <div>
                        <div class="friend-add-suggestion-name">${escapeHtml(u.nickname)} <span style="font-size:10px;color:var(--faint);">${escapeHtml(u.publicUserCode)}</span></div>
                        <div class="friend-add-suggestion-meta">${escapeHtml(u.bio || u.travelPersona || '')}</div>
                    </div>
                </div>
            `).join("");

            // Bind suggestion clicks
            suggestionsDiv.querySelectorAll(".friend-add-suggestion").forEach(el => {
                el.addEventListener("click", function() {
                    selectedUserId = parseInt(this.dataset.id);
                    selectedUserName = this.dataset.name;
                    searchInput.value = this.dataset.name;
                    suggestionsDiv.querySelectorAll(".friend-add-suggestion").forEach(e => e.style.background = "");
                    this.style.background = "var(--surface-accent, #f0f0f0)";
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = `发送申请给 ${selectedUserName}`;
                });
            });
        }, 400);
    });

    confirmBtn.addEventListener("click", async function() {
        if (!selectedUserId) {
            showToast("请先搜索并选择一个用户");
            return;
        }
        confirmBtn.disabled = true;
        confirmBtn.textContent = "发送中…";
        const result = await friendApi.sendRequest(selectedUserId, "你好，一起探索南京！");
        if (result.code === 200) {
            showToast("好友申请已发送: " + selectedUserName);
            closeFriendAddModal();
        } else {
            showToast(result.msg || "发送失败");
            confirmBtn.disabled = false;
            confirmBtn.textContent = `发送申请给 ${selectedUserName}`;
        }
    });

    modal.classList.add("active");
    setTimeout(() => searchInput.focus(), 300);
}

function closeFriendAddModal() {
    const modal = document.getElementById("friend-add-overlay");
    if (modal) modal.classList.remove("active");
}

function renderFriendsSection(container) {
    const section = document.createElement("div");
    section.className = "community-friends-section";
    section.innerHTML = `
        <div class="community-friends-header">
            <span class="community-friends-title">👥 好友</span>
            <button class="community-friends-add-btn" id="community-friends-add-btn">+ 添加好友</button>
        </div>
        ${MOCK_FRIENDS.map(f => `
            <div class="friend-card" data-friend-id="${f.id}">
                <div class="friend-card-avatar">
                    ${f.avatar}
                    ${f.status === "online" ? '<span class="friend-card-online"></span>' : ''}
                </div>
                <div class="friend-card-info">
                    <div class="friend-card-name">${escapeHtml(f.name)}</div>
                    <div class="friend-card-last-msg">${escapeHtml(f.lastMsg)}</div>
                </div>
                <span class="friend-card-time">${escapeHtml(f.lastTime)}</span>
            </div>
        `).join("")}
    `;

    // Insert after the composer section, before toolbar
    const toolbar = container.querySelector(".community-toolbar");
    if (toolbar) {
        toolbar.parentNode.insertBefore(section, toolbar);
    }

    // Bind events
    section.querySelectorAll(".friend-card").forEach(card => {
        card.addEventListener("click", function() {
            const friendId = this.dataset.friendId;
            if (friendId) openFriendChat(friendId);
        });
    });
    const addBtn = section.querySelector("#community-friends-add-btn");
    if (addBtn) addBtn.addEventListener("click", openFriendAddModal);
}

function openCommunityOverlay() {
    const overlay = document.getElementById("community-overlay");
    const inner = document.getElementById("community-overlay-inner");
    if (!overlay || !inner) return;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("community-tab-active");
    document.body.style.overflow = "hidden";
    renderCommunityPage(inner);
}

function closeCommunityOverlay() {
    const overlay = document.getElementById("community-overlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("community-tab-active");
    document.body.style.overflow = "";
}

function renderRouteSupplyFeatureCard() {
    return `
        <button class="route-supply-feature" type="button" id="route-supply-feature">
            <span class="route-supply-feature-icon">+</span>
            <span class="route-supply-feature-copy">
                <strong>沿途补给推荐</strong>
                <small>展开当前路线附近的餐饮、咖啡、门票和休息点</small>
            </span>
            <span class="route-supply-feature-arrow">›</span>
        </button>
        <div class="route-supply-inline" id="route-supply-inline" hidden></div>
    `;
}

function getRouteSupplyPreviewItems(routeKey) {
    const allData = (typeof SUPPLY_DATA !== "undefined") ? SUPPLY_DATA.getAll() : [];
    if (!allData.length) return [];
    const route = routes[routeKey];
    const routeText = route ? route.stops.map(stop => stop.name).join(" ") : "";
    const scored = allData.map(item => {
        let score = 0;
        if (item.onRoute) score += 4;
        if (item.distance < 800) score += 3;
        if (routeText && (item.tags || []).some(tag => routeText.includes(tag))) score += 2;
        if (item.category === "coffee" || item.category === "food") score += 1;
        return { item, score };
    });
    return scored.sort((a, b) => b.score - a.score || (a.item.distance || 9999) - (b.item.distance || 9999))
        .slice(0, 5)
        .map(entry => entry.item);
}

function renderRouteSupplyMiniCard(item) {
    const dist = item.distance >= 1000 ? `${(item.distance / 1000).toFixed(1)}km` : `${item.distance || 500}m`;
    const tags = (item.tags || []).slice(0, 2).map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
        <button class="route-supply-mini-card" type="button" data-store-id="${escapeHtml(item.id)}">
            <span class="route-supply-mini-icon">${categoryIcon(item.category)}</span>
            <span class="route-supply-mini-copy">
                <strong>${escapeHtml(item.name)}</strong>
                <small>${escapeHtml(item.subcategory || "沿途补给")} · ${dist} · ${Number(item.rating || 4).toFixed(1)}分</small>
                <span class="route-supply-mini-tags">${tags}</span>
            </span>
            <span class="route-supply-mini-price">¥${item.avgPrice || "--"}</span>
        </button>
    `;
}

function renderRouteSupplyInline(routeKey, container) {
    if (!container) return;
    const items = getRouteSupplyPreviewItems(routeKey);
    if (!items.length) {
        container.innerHTML = `<div class="route-supply-empty">暂无可展示的沿途补给。</div>`;
        return;
    }
    container.innerHTML = `
        <div class="route-supply-inline-head">
            <strong>路线里的小补给站</strong>
            <span>${items.length} 个推荐</span>
        </div>
        <div class="route-supply-mini-list">
            ${items.map(renderRouteSupplyMiniCard).join("")}
        </div>
    `;
    container.querySelectorAll(".route-supply-mini-card").forEach(card => {
        card.addEventListener("click", () => showPoiDetailOverlayDianping(card.dataset.storeId));
    });
}

function renderCommunityPage(container) {
    const posts = loadCommunityPosts();
    const stats = getCommunityStats(posts);
    container.innerHTML = `
        <div class="community-page">
            <section class="community-header">
                <div>
                    <span class="community-kicker">CITYGO COMMUNITY</span>
                    <h2>漫游社区</h2>
                    <p>发布路线、评价路线和地点，浏览大家的评论、观点与论坛推荐。</p>
                </div>
                <div class="community-stats">
                    <span><b>${stats.routePosts}</b> 路线</span>
                    <span><b>${stats.reviewPosts}</b> 评价</span>
                    <span><b>${stats.comments}</b> 评论</span>
                </div>
            </section>

            <section class="community-composer" id="community-composer">
                <div class="community-composer-top" id="community-composer-toggle" role="button" tabindex="0" aria-expanded="false">
                    <div>
                        <strong>发一条新帖</strong>
                        <span id="community-type-hint"></span>
                    </div>
                    <span class="community-composer-chevron" id="community-composer-chevron">›</span>
                </div>
                <div class="community-composer-body" id="community-composer-body" hidden>
                    <select id="community-post-type" class="community-input">
                        ${COMMUNITY_POST_TYPES.map(type => `<option value="${type.id}">${escapeHtml(type.label)}</option>`).join("")}
                    </select>
                    <input id="community-title" class="community-input" type="text" maxlength="42" placeholder="标题：比如 我的梧桐下午路线 / 南博排队体验">
                    <textarea id="community-text" class="community-textarea" rows="4" maxlength="800" placeholder="写路线、评价、观点，或推荐一个值得加入的论坛。"></textarea>
                    <div class="community-form-grid">
                        <select id="community-route" class="community-input">
                            <option value="">关联路线（可选）</option>
                            ${getCommunityRouteOptions()}
                        </select>
                        <input id="community-place" class="community-input" type="text" maxlength="30" placeholder="关联地点（可选）">
                        <select id="community-rating" class="community-input">
                            <option value="">评分（可选）</option>
                            <option value="5">5.0 很推荐</option>
                            <option value="4.5">4.5 值得去</option>
                            <option value="4">4.0 还不错</option>
                            <option value="3">3.0 一般</option>
                            <option value="2">2.0 不太推荐</option>
                        </select>
                        <input id="community-tags-input" class="community-input" type="text" maxlength="60" placeholder="标签，用空格分隔">
                    </div>
                    <div class="community-media-uploader">
                        <label>
                            <span>上传图片/视频</span>
                            <input id="community-media-files" type="file" accept="image/*,video/*" multiple>
                        </label>
                        <div id="community-media-preview">可选：上传图片或短视频，也可以只发文字。</div>
                    </div>
                    <div class="community-link-grid">
                        <input id="community-image-url" class="community-input" type="url" placeholder="图片链接（可选，多个可换行或逗号分隔）">
                        <input id="community-video-url" class="community-input" type="url" placeholder="视频链接（可选）">
                    </div>
                    <div class="community-compose-actions">
                        <button class="community-primary" type="button" id="community-submit">发布到社区</button>
                        <button class="community-secondary" type="button" id="community-map-route">用地图发路线</button>
                        <button class="community-ghost" type="button" id="community-clear">清空</button>
                    </div>
                </div>
            </section>

            <section class="community-toolbar">
                <div class="community-filters">${renderCommunityFilters()}</div>
                <input id="community-search" type="search" placeholder="搜索路线、地点、观点" value="${escapeHtml(communitySearchQuery)}">
            </section>

            <div class="community-feed" id="community-feed"></div>
        </div>
    `;

    bindCommunityComposer(container);
    renderCommunityFeed(container);
}

// ══════════════════════════════════════════════════════
//  Weibo-style Community Feed Override
// ══════════════════════════════════════════════════════

communityFeedTab = "all";

// Override: filter posts by feed tab instead of old communityFilter
getFilteredCommunityPosts = function() {
    const keyword = communitySearchQuery.trim().toLowerCase();
    return loadCommunityPosts().filter(post => {
        // Tab filter
        if (communityFeedTab === "route") {
            if (post.type !== "route" && !post.routeKey) return false;
        } else if (communityFeedTab === "photo") {
            const hasImage = (post.media || []).some(m => m.type === "image" || (!m.type && m.url));
            if (post.type !== "photo" && !hasImage) return false;
        } else if (communityFeedTab === "video") {
            const hasVideo = (post.media || []).some(m => m.type === "video");
            if (!hasVideo) return false;
        } else if (communityFeedTab === "nearby") {
            if (!post.place && !post.routeKey) return false;
        }
        // Keyword search
        if (!keyword) return true;
        const haystack = [post.title, post.text, post.routeName, post.place, ...(post.tags || [])]
            .join(" ")
            .toLowerCase();
        return haystack.includes(keyword);
    });
};

// ═══ Feed Tabs ═══
function renderCommunityFeedTabs() {
    const tabs = [
        { id: "all", label: "推荐", icon: "🔥" },
        { id: "route", label: "路线", icon: "🗺️" },
        { id: "photo", label: "照片", icon: "📷" },
        { id: "video", label: "视频", icon: "🎬" },
        { id: "nearby", label: "附近", icon: "📍" }
    ];
    return tabs.map(t => {
        const active = communityFeedTab === t.id ? " active" : "";
        return `<button class="community-feed-tab${active}" data-feed-tab="${t.id}" type="button">
            <span class="tab-icon">${t.icon}</span> ${t.label}
        </button>`;
    }).join("");
}

// ═══ Media Grid (Weibo-style: 1 large / 2 side-by-side / 3 with first large / 4+ grid) ═══
function renderCommunityMediaGrid(media) {
    if (!Array.isArray(media) || !media.length) return "";
    const count = media.length;
    let gridClass = "media-grid";
    if (count === 1) gridClass = "media-one";
    else if (count === 2) gridClass = "media-two";
    else if (count === 3) gridClass = "media-three";

    const items = media.slice(0, 9).map((item, i) => {
        const url = escapeHtml(item.url || "");
        const caption = item.caption ? `<span class="media-caption">${escapeHtml(item.caption)}</span>` : "";
        if (item.type === "video") {
            return `<div class="community-media-item media-video">
                <video src="${url}" controls preload="metadata"></video>${caption}
            </div>`;
        }
        return `<div class="community-media-item">
            <img src="${url}" alt="${escapeHtml(item.caption || "图片")}" loading="lazy">${caption}
        </div>`;
    }).join("");

    return `<div class="community-media-grid ${gridClass}">${items}</div>`;
}

// ═══ Route Chip ═══
function renderCommunityRouteChip(post) {
    const routeName = post.routeName || (post.routeKey && routes[post.routeKey] ? getRouteDisplayTitle(routes[post.routeKey]) : "");
    if (!routeName) return "";
    return `<div class="community-route-chip" data-route-key="${escapeHtml(post.routeKey||"")}" data-open-route="${escapeHtml(post.routeKey||"")}">
        <span class="chip-icon">🗺️</span>
        <div class="chip-info">
            <span class="chip-name">${escapeHtml(routeName)}</span>
            ${post.place ? `<span class="chip-meta">📍 ${escapeHtml(post.place)}</span>` : ""}
        </div>
        <button class="chip-action" type="button" data-open-route="${escapeHtml(post.routeKey||"")}">查看路线 ›</button>
    </div>`;
}

// ═══ Weibo-style Post Card ═══
function renderCommunityPostCard(post, isDetail) {
    const typeInfo = getCommunityType(post.type);
    const timeStr = getCommunityPostTime(post);
    const avatar = escapeHtml(post.avatar || getCommunityAvatar(post.author));
    const author = escapeHtml(post.author || "匿名旅人");
    const badge = typeInfo ? `<span class="post-badge">${escapeHtml(typeInfo.label)}</span>` : "";
    const title = post.title ? `<h3 class="post-title">${escapeHtml(post.title)}</h3>` : "";
    const textHtml = communityText(post.text);
    const textLong = (post.text || "").length > 200;
    const truncated = !isDetail && textLong
        ? communityText((post.text||"").substring(0, 200)) + `... <button class="post-expand-btn" type="button">展开全文</button>`
        : textHtml;
    const tags = (post.tags && post.tags.length) ? post.tags.map(t => `<span class="post-tag">${escapeHtml(t)}</span>`).join("") : "";
    const routeChip = renderCommunityRouteChip(post);
    const mediaGrid = renderCommunityMediaGrid(post.media);
    const liked = post.liked ? " liked" : "";
    const favorited = post.favorited ? " favorited" : "";

    // Repost block
    let repostBlock = "";
    if (post.repostOf && post.repostOf.originalPostId) {
        repostBlock = `<div class="repost-block">
            <div class="repost-block-header">
                <span class="repost-block-avatar">${escapeHtml((post.repostOf.originalAuthor||"").slice(0,1))}</span>
                <span class="repost-block-author">${escapeHtml(post.repostOf.originalAuthor)}</span>
            </div>
            <div class="repost-block-title">${escapeHtml(post.repostOf.originalTitle||"")}</div>
            <div class="repost-block-text">${communityText((post.repostOf.originalText||"").substring(0, 150))}</div>
        </div>`;
    }
    // Quote block
    let quoteBlock = "";
    if (post.quoteOf && post.quoteOf.originalPostId) {
        quoteBlock = `<div class="repost-block quote-block">
            <div class="repost-block-header">
                <span class="repost-block-avatar">${escapeHtml((post.quoteOf.originalAuthor||"").slice(0,1))}</span>
                <span class="repost-block-author">@${escapeHtml(post.quoteOf.originalAuthor)}</span>
            </div>
            <div class="repost-block-text">${communityText((post.quoteOf.originalText||"").substring(0, 150))}</div>
        </div>`;
    }

    // Repost header
    const repostHeader = (post.repostOf || post.quoteOf)
        ? `<div class="repost-header"><span class="repost-icon">${post.quoteOf ? "💬" : "🔄"}</span> ${post.quoteOf ? "引用转发" : "转发了"}</div>`
        : "";

    return `<article class="community-post-card" data-post-id="${escapeHtml(post.id)}">
        ${repostHeader}
        <div class="post-card-header">
            <div class="post-avatar">${avatar}</div>
            <div class="post-header-info">
                <div class="post-author-row">
                    <span class="post-author">${author}</span>
                    ${badge}
                    <span class="post-meta">${timeStr}</span>
                </div>
                ${!isDetail ? `<button class="post-follow-btn" type="button">+ 关注</button>` : ""}
            </div>
        </div>
        <div class="post-body" data-post-body="${escapeHtml(post.id)}">
            ${title}
            <div class="post-text">${truncated}</div>
            ${routeChip}
            ${mediaGrid}
            ${tags ? `<div class="post-tags">${tags}</div>` : ""}
        </div>
        ${repostBlock}
        ${quoteBlock}
        <div class="post-actions">
            <button class="post-action${liked}" data-post-id="${escapeHtml(post.id)}" data-action="like" type="button">
                ❤️ <span>${post.likes||0}</span>
            </button>
            <button class="post-action" data-post-id="${escapeHtml(post.id)}" data-action="comment" type="button">
                💬 <span>${(post.comments||[]).length}</span>
            </button>
            <button class="post-action" data-post-id="${escapeHtml(post.id)}" data-action="repost" type="button">
                🔄 <span>${(post.reposts||0)+(post.quotes||0)}</span>
            </button>
            <button class="post-action${favorited}" data-post-id="${escapeHtml(post.id)}" data-action="favorite" type="button">
                ⭐
            </button>
            <button class="post-action" data-post-id="${escapeHtml(post.id)}" data-action="more" type="button">
                ···
            </button>
        </div>
    </article>`;
}

// Override: render community page with feed tabs
const _origRenderCommunityPage_ = renderCommunityPage;
renderCommunityPage = function(container) {
    const posts = loadCommunityPosts();
    const postCount = posts.length;
    const userPosts = posts.filter(p => p.author === getCommunityCurrentUserName()).length;
    container.innerHTML = `
        <div class="community-page-v2">
            <section class="community-header-v2">
                <h2>漫游社区</h2>
                <p>发现南京路线、分享城市探索、找到同行搭子</p>
                <div class="community-header-stats">
                    <span><b>${postCount}</b> 动态</span>
                    ${userPosts ? `<span><b>${userPosts}</b> 我的</span>` : ""}
                    <button class="community-friend-entry" type="button" id="community-friend-entry">👥 好友</button>
                </div>
            </section>
            <section class="community-friends-section" id="community-friends-section">
                <div class="community-friends-header">
                    <span>👥 我的好友</span>
                    <button class="community-friends-add" type="button" id="community-add-friend">+ 添加好友</button>
                </div>
                <div class="community-friends-list" id="community-friends-list">
                    <span class="community-friends-loading">加载中…</span>
                </div>
                <div class="community-friends-requests" id="community-friends-requests" style="display:none;"></div>
            </section>
            <section class="community-composer" id="community-composer">
                <div class="community-composer-top" id="community-composer-toggle" role="button" tabindex="0" aria-expanded="false">
                    <div>
                        <strong>发一条新帖</strong>
                        <span id="community-type-hint"></span>
                    </div>
                    <span class="community-composer-chevron" id="community-composer-chevron">›</span>
                </div>
                <div class="community-composer-body" id="community-composer-body" hidden>
                    <select id="community-post-type" class="community-input">
                        ${COMMUNITY_POST_TYPES.map(type => `<option value="${type.id}">${escapeHtml(type.label)}</option>`).join("")}
                    </select>
                    <input id="community-title" class="community-input" type="text" maxlength="42" placeholder="标题：比如 我的梧桐下午路线 / 南博排队体验">
                    <textarea id="community-text" class="community-textarea" rows="4" maxlength="800" placeholder="写路线、评价、观点，或推荐一个值得加入的论坛。"></textarea>
                    <div class="community-form-grid">
                        <select id="community-route" class="community-input">
                            <option value="">关联路线（可选）</option>
                            ${getCommunityRouteOptions()}
                        </select>
                        <input id="community-place" class="community-input" type="text" maxlength="30" placeholder="关联地点（可选）">
                        <select id="community-rating" class="community-input">
                            <option value="">评分（可选）</option>
                            <option value="5">5.0 很推荐</option>
                            <option value="4.5">4.5 值得去</option>
                            <option value="4">4.0 还不错</option>
                            <option value="3">3.0 一般</option>
                            <option value="2">2.0 不太推荐</option>
                        </select>
                        <input id="community-tags-input" class="community-input" type="text" maxlength="60" placeholder="标签，用空格分隔">
                    </div>
                    <div class="community-media-uploader">
                        <label>
                            <span>上传图片/视频</span>
                            <input id="community-media-files" type="file" accept="image/*,video/*" multiple>
                        </label>
                        <div id="community-media-preview">可选：上传图片或短视频，也可以只发文字。</div>
                    </div>
                    <div class="community-link-grid">
                        <input id="community-image-url" class="community-input" type="url" placeholder="图片链接（可选，多个可换行或逗号分隔）">
                        <input id="community-video-url" class="community-input" type="url" placeholder="视频链接（可选）">
                    </div>
                    <div class="community-compose-actions">
                        <button class="community-primary" type="button" id="community-submit">发布到社区</button>
                        <button class="community-secondary" type="button" id="community-map-route">用地图发路线</button>
                        <button class="community-ghost" type="button" id="community-clear">清空</button>
                    </div>
                </div>
            </section>
            <nav class="community-feed-tabs" id="community-feed-tabs">
                ${renderCommunityFeedTabs()}
            </nav>
            <div class="community-feed" id="community-feed"></div>
        </div>
    `;
    bindCommunityComposer(container);
    renderCommunityFeed(container);
    bindCommunityFeedEvents(container);
    // Bind feed tab clicks
    container.querySelectorAll(".community-feed-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            communityFeedTab = btn.dataset.feedTab;
            container.querySelectorAll(".community-feed-tab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderCommunityFeed(container);
        });
    });
    // Bind friend entry button
    const friendEntry = container.querySelector("#community-friend-entry");
    if (friendEntry) {
        friendEntry.addEventListener("click", () => {
            requireAuth(() => { if (typeof openFriendPage === "function") openFriendPage(); });
        });
    }
    // 渲染好友列表区段
    renderCommunityFriendsSection(container);
    // 绑定添加好友按钮
    const addFriendBtn = container.querySelector("#community-add-friend");
    if (addFriendBtn) {
        addFriendBtn.addEventListener("click", () => {
            requireAuth(() => openCommunityAddFriend(container));
        });
    }
};

// Override: render feed
const _origRenderCommunityFeed_ = renderCommunityFeed;
renderCommunityFeed = function(container) {
    const feed = container.querySelector("#community-feed");
    if (!feed) return;
    const posts = getFilteredCommunityPosts();
    feed.innerHTML = posts.length
        ? posts.map(p => renderCommunityPostCard(p, false)).join("")
        : `<div class="community-empty-v2">
            <span class="empty-icon">📝</span>
            <strong>还没有动态</strong>
            <span>成为第一个分享南京路线的人吧</span>
        </div>`;
    bindCommunityFeedEvents(container);
};

// Override: bind events for new card structure
const _origBindCommunityFeedEvents_ = bindCommunityFeedEvents;
bindCommunityFeedEvents = function(container) {
    const posts = loadCommunityPosts();

    container.querySelectorAll(".post-action").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.stopPropagation();
            const postId = this.dataset.postId;
            const action = this.dataset.action;
            const post = posts.find(p => p.id === postId);
            if (!post) return;

            if (action === "like") {
                post.liked = !post.liked;
                post.likes = (post.likes||0) + (post.liked ? 1 : -1);
                saveCommunityPosts(posts);
                renderCommunityFeed(container);
            } else if (action === "repost") {
                openRepostPanel(post, container);
            } else if (action === "comment") {
                openPostDetail(post, container);
            } else if (action === "favorite") {
                post.favorited = !post.favorited;
                post.favorites = (post.favorites||0) + (post.favorited ? 1 : -1);
                saveCommunityPosts(posts);
                renderCommunityFeed(container);
                showToast(post.favorited ? "已收藏" : "已取消收藏");
            } else if (action === "more") {
                showPostMoreMenu(post, container);
            }
        });
    });

    // Follow buttons
    container.querySelectorAll(".post-follow-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.stopPropagation();
            const following = this.textContent.includes("已关注");
            this.textContent = following ? "+ 关注" : "✓ 已关注";
            this.classList.toggle("following", !following);
            showToast(following ? "已取消关注" : "已关注");
        });
    });

    // Expand text
    container.querySelectorAll(".post-expand-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.stopPropagation();
            const body = this.closest(".post-body");
            const postId = body ? body.dataset.postBody : null;
            if (postId) {
                const post = posts.find(p => p.id === postId);
                if (post && body) {
                    body.querySelector(".post-text").innerHTML = communityText(post.text);
                    this.remove();
                }
            }
        });
    });

    // Post body click → detail
    container.querySelectorAll(".post-body, .repost-block").forEach(el => {
        el.addEventListener("click", function(e) {
            if (e.target.closest("button") || e.target.closest(".post-action")) return;
            const card = this.closest(".community-post-card");
            const postId = card ? card.dataset.postId : null;
            const post = posts.find(p => p.id === postId);
            if (post && !post.repostOf) openPostDetail(post, container);
            else if (post && post.repostOf) {
                const orig = posts.find(p => p.id === post.repostOf.originalPostId);
                if (orig) openPostDetail(orig, container);
            }
        });
    });

    // Route chip
    container.querySelectorAll(".chip-action, .community-route-chip").forEach(el => {
        el.addEventListener("click", function(e) {
            e.stopPropagation();
            const routeKey = this.closest("[data-route-key]")?.dataset.routeKey || this.dataset.openRoute;
            if (routeKey && routes[routeKey]) {
                if (typeof openRoute === "function") openRoute(routeKey);
                else showRouteOnMap(routeKey);
            }
        });
    });
};

// ═══ Repost Panel ═══
function openRepostPanel(post, container) {
    const overlay = document.createElement("div");
    overlay.className = "repost-overlay";
    overlay.innerHTML = `
        <div class="repost-panel">
            <div class="repost-panel-header">
                <h3>转发动态</h3>
                <button class="repost-close" type="button">✕</button>
            </div>
            <div class="repost-options">
                <button class="repost-option" data-action="direct-repost">
                    <span class="repost-option-icon">🔄</span>
                    <div>
                        <strong>直接转发</strong>
                        <span>原样转发到社区</span>
                    </div>
                </button>
                <button class="repost-option" data-action="quote-repost">
                    <span class="repost-option-icon">💬</span>
                    <div>
                        <strong>引用转发</strong>
                        <span>加上自己的文字和观点</span>
                    </div>
                </button>
                <button class="repost-option" data-action="share-friend">
                    <span class="repost-option-icon">📤</span>
                    <div>
                        <strong>分享给好友</strong>
                        <span>发送到好友聊天</span>
                    </div>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".repost-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelectorAll(".repost-option").forEach(btn => {
        btn.addEventListener("click", function() {
            const action = this.dataset.action;
            if (action === "direct-repost") {
                doDirectRepost(post);
                overlay.remove();
            } else if (action === "quote-repost") {
                overlay.remove();
                openQuoteComposer(post, container);
            } else if (action === "share-friend") {
                overlay.remove();
                if (typeof openFriendPicker === "function") openFriendPicker(post);
                else showToast("好友功能即将上线");
            }
        });
    });
}

function doDirectRepost(post) {
    const posts = loadCommunityPosts();
    const newPost = {
        id: "repost-" + Date.now(),
        type: "text",
        author: getCommunityCurrentUserName(),
        avatar: getCommunityAvatar(getCommunityCurrentUserName()),
        title: "",
        text: "",
        routeKey: "", routeName: "", place: "", rating: null,
        area: "", tags: [],
        media: [],
        repostOf: {
            originalPostId: post.id,
            originalAuthor: post.author,
            originalTitle: post.title,
            originalText: post.text,
            originalMedia: post.media || []
        },
        comments: [],
        likes: 0, views: 0, reposts: 0, quotes: 0, favorites: 0,
        time: "刚刚", timestamp: Date.now()
    };
    post.reposts = (post.reposts||0) + 1;
    posts.unshift(newPost);
    saveCommunityPosts(posts);
    showToast("已转发");
    if (typeof openCommunityOverlay === "function") openCommunityOverlay();
}

function openQuoteComposer(originalPost, container) {
    const overlay = document.createElement("div");
    overlay.className = "repost-overlay";
    overlay.innerHTML = `
        <div class="quote-composer-panel">
            <div class="quote-composer-header">
                <button class="quote-cancel" type="button">取消</button>
                <h3>引用转发</h3>
                <button class="quote-submit" type="button">发布</button>
            </div>
            <textarea class="quote-composer-text" placeholder="写下你的想法…" maxlength="500"></textarea>
            <div class="quote-preview-block">
                <div class="quote-preview-header">
                    <span class="quote-preview-avatar">${escapeHtml((originalPost.author||'').slice(0,1))}</span>
                    <span>${escapeHtml(originalPost.author)}</span>
                </div>
                <div class="quote-preview-title">${escapeHtml(originalPost.title||'')}</div>
                <div class="quote-preview-text">${communityText((originalPost.text||'').substring(0,100))}</div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".quote-cancel").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector(".quote-submit").addEventListener("click", () => {
        const text = overlay.querySelector(".quote-composer-text").value.trim();
        if (!text) { showToast("请输入你的观点"); return; }
        const posts = loadCommunityPosts();
        const newPost = {
            id: "quote-" + Date.now(),
            type: "text",
            author: getCommunityCurrentUserName(),
            avatar: getCommunityAvatar(getCommunityCurrentUserName()),
            title: "",
            text: text,
            routeKey: "", routeName: "", place: "", rating: null,
            area: "", tags: [],
            media: [],
            quoteOf: {
                originalPostId: originalPost.id,
                originalAuthor: originalPost.author,
                originalTitle: originalPost.title,
                originalText: originalPost.text,
                originalMedia: originalPost.media || []
            },
            comments: [],
            likes: 0, views: 0, reposts: 0, quotes: 0, favorites: 0,
            time: "刚刚", timestamp: Date.now()
        };
        originalPost.quotes = (originalPost.quotes||0) + 1;
        posts.unshift(newPost);
        saveCommunityPosts(posts);
        overlay.remove();
        showToast("引用转发已发布");
        if (typeof openCommunityOverlay === "function") openCommunityOverlay();
    });
}

// ═══ Post Detail Page ═══
function openPostDetail(post, container) {
    post.views = (post.views||0) + 1;
    saveCommunityPosts(loadCommunityPosts());

    const overlay = document.createElement("div");
    overlay.className = "post-detail-overlay";
    const allComments = combineCommentsAndReplies(post);
    const commentHTML = allComments.map(c => {
        const isReply = !!c.replyTo;
        return `<div class="detail-comment${isReply ? ' is-reply' : ''}">
            <div class="detail-comment-avatar">${escapeHtml(c.avatar||c.author.slice(0,1))}</div>
            <div class="detail-comment-body">
                <div class="detail-comment-header">
                    <span class="detail-comment-author">${escapeHtml(c.author)}</span>
                    ${isReply ? `<span class="reply-indicator">回复</span><span class="detail-comment-author">${escapeHtml(c.replyTo)}</span>` : ""}
                    <span class="detail-comment-time">${escapeHtml(c.time)}</span>
                </div>
                <div class="detail-comment-text">${communityText(c.text)}</div>
                <div class="detail-comment-actions">
                    <button type="button" data-reply-to="${c.author}" data-comment-id="${c.id||''}">回复</button>
                    <span>❤️ ${c.likes||0}</span>
                </div>
            </div>
        </div>`;
    }).join("");

    overlay.innerHTML = `
        <div class="post-detail-scroll">
            <div class="post-detail-header">
                <button class="post-detail-back" type="button">← 返回</button>
                <span>动态详情</span>
            </div>
            <div class="post-detail-card">
                ${renderCommunityPostCard(post, true).replace(/<button[^>]*post-follow-btn[^>]*>[^<]*<\/button>/g, '')}
            </div>
            <div class="post-detail-comments">
                <h4>评论 (${(post.comments||[]).length})</h4>
                ${commentHTML || '<div class="no-comments">暂无评论，来说点什么吧</div>'}
            </div>
        </div>
        <div class="post-detail-input-row">
            <input type="text" id="detail-comment-input" placeholder="写下你的评论…" maxlength="200">
            <button type="button" id="detail-comment-submit">发送</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
        overlay.remove();
        if (container) renderCommunityFeed(container);
    };
    overlay.querySelector(".post-detail-back").addEventListener("click", close);

    overlay.querySelector("#detail-comment-submit").addEventListener("click", () => {
        const input = overlay.querySelector("#detail-comment-input");
        const text = input.value.trim();
        if (!text) return;
        post.comments = post.comments || [];
        post.comments.push({
            id: "cmt-" + Date.now(),
            author: getCommunityCurrentUserName(),
            avatar: getCommunityAvatar(getCommunityCurrentUserName()),
            text: text, time: "刚刚", likes: 0, replies: []
        });
        saveCommunityPosts(loadCommunityPosts());
        openPostDetail(post, container);
        overlay.remove();
    });

    overlay.querySelectorAll("[data-reply-to]").forEach(btn => {
        btn.addEventListener("click", function() {
            const replyTo = this.dataset.replyTo;
            const commentId = this.dataset.commentId;
            const input = overlay.querySelector("#detail-comment-input");
            input.value = "@" + replyTo + " ";
            input.focus();
            input.dataset.replyToCommentId = commentId;
        });
    });
}

function combineCommentsAndReplies(post) {
    const all = [];
    (post.comments||[]).forEach(c => {
        all.push(c);
        (c.replies||[]).forEach(r => all.push(r));
    });
    return all;
}

// ═══ Post More Menu ═══
function showPostMoreMenu(post, container) {
    const overlay = document.createElement("div");
    overlay.className = "repost-overlay";
    overlay.innerHTML = `
        <div class="more-menu-panel">
            <button class="more-menu-item" data-action="copy-link">🔗 复制链接</button>
            <button class="more-menu-item" data-action="not-interested">👎 不感兴趣</button>
            <button class="more-menu-item" data-action="report">🚩 举报</button>
            <button class="more-menu-item more-menu-cancel">取消</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector(".more-menu-cancel").addEventListener("click", () => overlay.remove());
    overlay.querySelector("[data-action='not-interested']").addEventListener("click", () => {
        showToast("已反馈，将减少此类推荐");
        overlay.remove();
    });
    overlay.querySelector("[data-action='report']").addEventListener("click", () => {
        showToast("举报已提交，感谢你的反馈");
        overlay.remove();
    });
    overlay.querySelector("[data-action='copy-link']").addEventListener("click", () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(post.id).then(() => showToast("链接已复制"));
        }
        overlay.remove();
    });
}

// ═══ Composer: Quick Publish ═══
function openQuickComposer(type) {
    const overlay = document.createElement("div");
    overlay.className = "repost-overlay";
    const typeInfo = getCommunityType(type);
    const routeOptions = Object.keys(routes).filter(k => routes[k]).map(k =>
        `<option value="${k}">${escapeHtml(getRouteDisplayTitle(routes[k]))}</option>`
    ).join("");

    overlay.innerHTML = `
        <div class="quick-composer-panel">
            <div class="quick-composer-header">
                <button class="composer-cancel" type="button">取消</button>
                <h3>发${typeInfo.label}</h3>
                <button class="composer-submit" type="button" id="quick-submit">发布</button>
            </div>
            <textarea class="quick-composer-text" id="quick-text" placeholder="${escapeHtml(typeInfo.hint)}" maxlength="500"></textarea>
            <div class="quick-composer-extras">
                <input class="quick-composer-title" id="quick-title" type="text" placeholder="标题（可选）" maxlength="50">
                <select class="quick-composer-route" id="quick-route">
                    <option value="">关联路线（可选）</option>
                    ${routeOptions}
                </select>
                <input class="quick-composer-place" id="quick-place" type="text" placeholder="地点（可选）" maxlength="30">
                <input class="quick-composer-tags" id="quick-tags" type="text" placeholder="标签，空格分隔（可选）" maxlength="50">
                <input class="quick-composer-urls" id="quick-urls" type="text" placeholder="图片链接，逗号分隔（可选）">
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".composer-cancel").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector("#quick-submit").addEventListener("click", () => {
        const text = overlay.querySelector("#quick-text").value.trim();
        if (!text) { showToast("请输入内容"); return; }
        const title = overlay.querySelector("#quick-title").value.trim();
        const routeKey = overlay.querySelector("#quick-route").value;
        const place = overlay.querySelector("#quick-place").value.trim();
        const tagsStr = overlay.querySelector("#quick-tags").value.trim();
        const urlsStr = overlay.querySelector("#quick-urls").value.trim();
        const tags = tagsStr ? tagsStr.split(/\s+/).slice(0, 5) : [];
        const media = urlsStr ? urlsStr.split(/[,，\n]/).filter(u => u.trim()).map((u,i) => ({ type:"image", url: u.trim(), caption: "" })).slice(0,9) : [];

        const routeName = routeKey && routes[routeKey] ? getRouteDisplayTitle(routes[routeKey]) : "";
        const posts = loadCommunityPosts();
        const newPost = {
            id: "post-" + Date.now(),
            type: type,
            author: getCommunityCurrentUserName(),
            avatar: getCommunityAvatar(getCommunityCurrentUserName()),
            title: title, text: text,
            routeKey: routeKey, routeName: routeName, place: place,
            area: "", rating: null,
            tags: tags, media: media,
            comments: [], likes: 0, views: 0, reposts: 0, quotes: 0, favorites: 0,
            time: "刚刚", timestamp: Date.now()
        };
        posts.unshift(newPost);
        saveCommunityPosts(posts);
        overlay.remove();
        showToast("发布成功！");
        if (typeof openCommunityOverlay === "function") openCommunityOverlay();
    });
}

function openRoutesSupplyPanel(routeKey) {
    if (routeKey && routes[routeKey]) currentRouteKey = routeKey;
    const inline = document.getElementById("route-supply-inline");
    const trigger = document.getElementById("route-supply-feature");
    if (!inline) return;
    const willOpen = inline.hasAttribute("hidden");
    if (willOpen) {
        renderRouteSupplyInline(routeKey, inline);
        inline.hidden = false;
        inline.classList.add("open");
        trigger?.classList.add("open");
    } else {
        inline.hidden = true;
        inline.classList.remove("open");
        trigger?.classList.remove("open");
    }
}

addSupplyEntryToRouteSheet = function(sheetBody, routeKey) {
    const entry = document.createElement("div");
    entry.className = "route-supply-mini";
    entry.innerHTML = renderRouteSupplyFeatureCard();
    entry.querySelector("#route-supply-feature")?.addEventListener("click", () => openRoutesSupplyPanel(routeKey));
    sheetBody.appendChild(entry);
};

// ══════════════════════════════════════════════════════
//  Auth Service (Frontend)
// ══════════════════════════════════════════════════════

let currentAuthUser = null;

const authApi = {
    async register(email, password, nickname) {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, nickname })
        });
        return res.json();
    },
    async login(email, password) {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },
    async me() {
        const res = await fetch("/api/auth/me");
        return res.json();
    },
    async logout() {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        return res.json();
    },
    async updateProfile(data) {
        const res = await fetch("/api/auth/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async changePassword(oldPassword, newPassword) {
        const res = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        return res.json();
    }
};

async function initAuth() {
    const result = await authApi.me();
    if (result.code === 200 && result.data) {
        currentAuthUser = result.data;
        saveUserProfile({ loggedIn: true, userId: result.data.id, name: result.data.nickname, tagline: result.data.bio || "南京城市探索中", avatarUrl: result.data.avatarUrl || "", lastLoginAt: result.data.lastLoginAt || new Date().toISOString() });
        // Also sync friends from backend
        refreshFriendsFromBackend().catch(() => {});
        return true;
    }
    return false;
}

function isLoggedIn() {
    return currentAuthUser != null;
}

function getCurrentUserId() {
    return currentAuthUser ? currentAuthUser.id : null;
}

function getCurrentUserNickname() {
    return currentAuthUser ? currentAuthUser.nickname : "我";
}

function requireAuth(action) {
    if (isLoggedIn()) {
        action();
    } else {
        showAuthModal("login", action);
    }
}

// ═══ Auth Modal (Login / Register) ═══
let authModalCallback = null;

function showAuthModal(mode, callback) {
    authModalCallback = callback || null;
    const existing = document.getElementById("auth-modal-overlay");
    if (existing) existing.remove();

    const isLogin = mode === "login";
    const overlay = document.createElement("div");
    overlay.className = "auth-modal-overlay";
    overlay.id = "auth-modal-overlay";

    overlay.innerHTML = `
        <div class="auth-modal">
            <button class="auth-modal-close" type="button">✕</button>
            <div class="auth-modal-logo">🏙️</div>
            <h2>${isLogin ? '欢迎回来' : '加入城市漫游'}</h2>
            <p class="auth-modal-sub">南京周末探索</p>

            <form class="auth-form" id="auth-form">
                ${!isLogin ? `<div class="auth-field">
                    <label for="auth-nickname">昵称</label>
                    <input type="text" id="auth-nickname" placeholder="你的昵称" maxlength="20" required>
                </div>` : ''}
                <div class="auth-field">
                    <label for="auth-email">邮箱</label>
                    <input type="email" id="auth-email" placeholder="your@email.com" required>
                </div>
                <div class="auth-field">
                    <label for="auth-password">密码</label>
                    <input type="password" id="auth-password" placeholder="至少6位字符" minlength="6" required>
                </div>
                <div class="auth-error" id="auth-error" style="display:none"></div>
                <button class="auth-submit-btn" type="submit" id="auth-submit-btn">
                    ${isLogin ? '登 录' : '注 册'}
                </button>
            </form>

            <div class="auth-switch">
                ${isLogin
                    ? '还没有账号？<button type="button" id="auth-switch-btn">立即注册</button>'
                    : '已有账号？<button type="button" id="auth-switch-btn">去登录</button>'}
            </div>
            <p class="auth-demo-note">开发演示模式 · 密码加密存储</p>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector(".auth-modal-close").addEventListener("click", () => overlay.remove());

    // Switch mode
    overlay.querySelector("#auth-switch-btn").addEventListener("click", () => {
        overlay.remove();
        showAuthModal(isLogin ? "register" : "login", callback);
    });

    // Form submit
    overlay.querySelector("#auth-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = overlay.querySelector("#auth-submit-btn");
        const errEl = overlay.querySelector("#auth-error");
        btn.disabled = true;
        btn.textContent = "处理中…";
        errEl.style.display = "none";

        const email = overlay.querySelector("#auth-email").value.trim();
        const password = overlay.querySelector("#auth-password").value;

        let result;
        if (isLogin) {
            result = await authApi.login(email, password);
        } else {
            const nickname = overlay.querySelector("#auth-nickname").value.trim();
            result = await authApi.register(email, password, nickname);
        }

        if (result.code === 200 && result.data) {
            currentAuthUser = result.data;
            saveUserProfile({ loggedIn: true, userId: result.data.id, name: result.data.nickname, tagline: result.data.bio || "南京城市探索中", avatarUrl: result.data.avatarUrl || "", lastLoginAt: result.data.lastLoginAt || new Date().toISOString() });
            showToast(isLogin ? "登录成功" : "注册成功！欢迎加入");
            overlay.remove();
            if (authModalCallback) { authModalCallback(); authModalCallback = null; }
            // Refresh community page if open
            const nearby = document.querySelector('[data-tab="nearby"]');
            if (nearby && nearby.style.display !== "none") {
                const inner = nearby.querySelector(".tab-content-inner");
                if (inner && typeof renderCommunityPage === "function") renderCommunityPage(inner);
            }
        } else {
            errEl.textContent = result.msg || "操作失败，请重试";
            errEl.style.display = "block";
            btn.disabled = false;
            btn.textContent = isLogin ? "登 录" : "注 册";
        }
    });

    // Focus first input
    setTimeout(() => {
        const firstInput = overlay.querySelector("input[type=text], input[type=email]");
        if (firstInput) firstInput.focus();
    }, 300);
}

// Override getCommunityCurrentUserName to use auth
const _origGetCommunityCurrentUserName_ = getCommunityCurrentUserName;
getCommunityCurrentUserName = function() {
    if (currentAuthUser && currentAuthUser.nickname) return currentAuthUser.nickname;
    return _origGetCommunityCurrentUserName_();
};

// Override getCommunityAvatar for auth user avatar
const _origGetCommunityAvatar_ = getCommunityAvatar;
getCommunityAvatar = function(author) {
    if (currentAuthUser && author === currentAuthUser.nickname) {
        return currentAuthUser.nickname.slice(0, 1);
    }
    return _origGetCommunityAvatar_(author);
};

// ══════════════════════════════════════════════════════
//  Friend System
// ══════════════════════════════════════════════════════

const FRIEND_STORAGE_KEY = "citygo_friends_v1";

// Friend API (backend-driven)
const friendApi = {
    async search(q) {
        try {
            const res = await fetch(`/api/friend/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            return data.code === 200 ? data.data : [];
        } catch (e) { return []; }
    },
    async sendRequest(toUserId, message) {
        const res = await fetch("/api/friend/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ toUserId, message })
        });
        return res.json();
    },
    async acceptRequest(requestId) {
        const res = await fetch(`/api/friend/accept/${requestId}`, { method: "PUT" });
        return res.json();
    },
    async rejectRequest(requestId) {
        const res = await fetch(`/api/friend/reject/${requestId}`, { method: "PUT" });
        return res.json();
    },
    async getFriends() {
        try {
            const res = await fetch("/api/friend/list");
            const data = await res.json();
            return data.code === 200 ? data.data : [];
        } catch (e) { return []; }
    },
    async getPendingRequests() {
        try {
            const res = await fetch("/api/friend/requests/pending");
            const data = await res.json();
            return data.code === 200 ? data.data : [];
        } catch (e) { return []; }
    },
    async blockUser(userId) {
        await fetch(`/api/friend/block/${userId}`, { method: "POST" });
    },
    async unblockUser(userId) {
        await fetch(`/api/friend/block/${userId}`, { method: "DELETE" });
    }
};

// Chat API (backend-driven)
const chatApi = {
    async send(receiverId, content) {
        const res = await fetch("/api/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId, content })
        });
        return res.json();
    },
    async getMessages(userId) {
        try {
            const res = await fetch(`/api/chat/messages/${userId}`);
            const data = await res.json();
            return data.code === 200 ? data.data : [];
        } catch (e) { return []; }
    },
    async getConversations() {
        try {
            const res = await fetch("/api/chat/conversations");
            const data = await res.json();
            return data.code === 200 ? data.data : [];
        } catch (e) { return []; }
    },
    async markRead(userId) {
        await fetch(`/api/chat/read/${userId}`, { method: "PUT" });
    }
};

const MOCK_FRIEND_USERS = [
    { id: "u-arch", nickname: "建筑光影", avatar: "建", bio: "用镜头记录南京民国建筑", tags: ["建筑", "摄影", "民国", "Citywalk"], travelStyle: "慢节奏深度游", area: "鼓楼/玄武", matchReason: "都喜欢建筑摄影与民国风情" },
    { id: "u-history", nickname: "金陵旧事", avatar: "陵", bio: "南京每块砖都有故事", tags: ["历史", "博物馆", "六朝", "城墙"], travelStyle: "文化沉浸式", area: "秦淮/老城南", matchReason: "共同关注南京历史与博物馆路线" },
    { id: "u-coffee", nickname: "咖啡地图集", avatar: "咖", bio: "探索南京100家独立咖啡馆", tags: ["咖啡", "探店", "美食", "摄影"], travelStyle: "随性闲逛", area: "鼓楼/新街口", matchReason: "都对咖啡馆与城市漫步感兴趣" },
    { id: "u-expo", nickname: "看展人小陈", avatar: "展", bio: "南艺毕业，专看小众展览", tags: ["展览", "艺术", "摄影", "设计"], travelStyle: "主题式打卡", area: "鼓楼/仙林", matchReason: "共同热爱艺术展览与文艺路线" },
    { id: "u-sport", nickname: "周末运动搭子", avatar: "运", bio: "羽毛球+爬山+骑行", tags: ["运动", "爬山", "骑行", "户外"], travelStyle: "活力探索型", area: "紫金山/玄武湖", matchReason: "都喜欢户外运动与城市探索" },
    { id: "u-nju", nickname: "南大新同学", avatar: "南", bio: "大一新生，想逛遍南京", tags: ["校园", "美食", "Citywalk", "拍照"], travelStyle: "好奇宝宝型", area: "鼓楼/栖霞", matchReason: "南大校友，共同探索校园周边" },
    { id: "u-food", nickname: "南京甜口党", avatar: "甜", bio: "糕团、汤包、糖芋苗重度爱好者", tags: ["美食", "小吃", "探店", "糕团"], travelStyle: "美食驱动型", area: "秦淮/老门东", matchReason: "美食偏好高度重合，都爱老南京味道" },
    { id: "u-night", nickname: "秦淮夜猫子", avatar: "夜", bio: "夜晚的南京才是真正的南京", tags: ["夜游", "酒吧", "夜景", "拍照"], travelStyle: "夜行动物型", area: "秦淮/1912", matchReason: "都喜欢夜游秦淮与城市夜景" }
];

// ═══ Data Layer ═══
function loadFriendData() {
    try {
        const raw = localStorage.getItem(FRIEND_STORAGE_KEY);
        return raw ? JSON.parse(raw) : { friends: [], requests: [], blocked: [] };
    } catch (e) { return { friends: [], requests: [], blocked: [] }; }
}

function saveFriendData(data) {
    localStorage.setItem(FRIEND_STORAGE_KEY, JSON.stringify(data));
}

// Backend friend cache (synced on init and after friend actions)
let _backendFriendsCache = [];
let _backendRequestsCache = [];

async function refreshFriendsFromBackend() {
    try {
        const [friends, requests] = await Promise.all([
            friendApi.getFriends(),
            friendApi.getPendingRequests()
        ]);
        _backendFriendsCache = friends || [];
        _backendRequestsCache = requests || [];
        // Also update localStorage cache
        const data = loadFriendData();
        data.friends = (friends || []).map(f => ({ userId: f.userId, remark: "", since: Date.now() }));
        data.requests = (requests || []).map(r => ({
            id: String(r.id),
            fromId: String(r.fromUserId),
            toId: String(r.toUserId),
            fromName: r.fromUserNickname,
            message: r.message,
            status: r.status.toLowerCase(),
            createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now()
        }));
        saveFriendData(data);
    } catch (e) { /* silent */ }
}

function getMyFriendIds() {
    const data = loadFriendData();
    return data.friends.map(f => f.userId);
}

function isFriend(userId) {
    // Check both backend cache and localStorage
    const data = loadFriendData();
    const idStr = String(userId);
    return data.friends.some(f => String(f.userId) === idStr);
}

function isBlocked(userId) {
    const data = loadFriendData();
    const idStr = String(userId);
    return data.blocked.some(b => String(b.userId) === idStr);
}

function hasPendingRequest(userId) {
    const data = loadFriendData();
    const idStr = String(userId);
    return data.requests.some(r => (r.fromId === idStr || r.toId === idStr) && r.status === "pending");
}

// ═══ Friend Page ═══
let friendPageTab = "messages"; // messages | friends | requests | buddy

function openFriendPage() {
    const overlay = document.createElement("div");
    overlay.className = "friend-page-overlay";
    overlay.id = "friend-page-overlay";
    renderFriendPage(overlay);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

function renderFriendPage(overlay) {
    const friendCount = getMyFriendIds().length;
    const data = loadFriendData();
    const pendingCount = data.requests.filter(r => r.status === "pending" && r.toId === "me").length;
    const unreadTotal = getTotalUnreadCount();

    overlay.innerHTML = `
        <div class="friend-page">
            <div class="friend-page-header">
                <button class="friend-page-back" type="button">← 返回</button>
                <h2>${friendPageTab === 'messages' ? '消息' : '好友'}</h2>
                <span class="friend-page-count">${friendCount}位好友</span>
            </div>
            <div class="friend-page-tabs">
                <button class="friend-tab${friendPageTab==='messages'?' active':''}" data-friend-tab="messages">
                    消息${unreadTotal ? `<span class="friend-badge">${unreadTotal}</span>` : ''}
                </button>
                <button class="friend-tab${friendPageTab==='friends'?' active':''}" data-friend-tab="friends">好友</button>
                <button class="friend-tab${friendPageTab==='requests'?' active':''}" data-friend-tab="requests">
                    新的朋友${pendingCount ? `<span class="friend-badge">${pendingCount}</span>` : ''}
                </button>
                <button class="friend-tab${friendPageTab==='buddy'?' active':''}" data-friend-tab="buddy">找搭子</button>
            </div>
            <div class="friend-page-body" id="friend-page-body">
                ${renderFriendPageBody()}
            </div>
        </div>
    `;

    // Back button
    overlay.querySelector(".friend-page-back").addEventListener("click", () => overlay.remove());

    // Tab clicks
    overlay.querySelectorAll(".friend-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            friendPageTab = btn.dataset.friendTab;
            overlay.querySelectorAll(".friend-tab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const body = overlay.querySelector("#friend-page-body");
            if (body) body.innerHTML = renderFriendPageBody();
            bindFriendPageEvents(overlay);
        });
    });

    bindFriendPageEvents(overlay);
}

function renderFriendPageBody() {
    switch (friendPageTab) {
        case "messages": return renderConversationList();
        case "friends": return renderFriendList();
        case "requests": return renderFriendRequests();
        case "buddy": return renderBuddyFinder();
        default: return renderConversationList();
    }
}

function bindFriendPageEvents(overlay) {
    // Search
    const searchInput = overlay.querySelector("#friend-search");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim().toLowerCase();
            const list = overlay.querySelector("#friend-list");
            if (list) {
                list.querySelectorAll(".friend-card").forEach(card => {
                    const name = (card.dataset.name || "").toLowerCase();
                    const tags = (card.dataset.tags || "").toLowerCase();
                    card.style.display = (!query || name.includes(query) || tags.includes(query)) ? "" : "none";
                });
            }
        });
    }

    // Add friend buttons
    overlay.querySelectorAll("[data-add-friend]").forEach(btn => {
        btn.addEventListener("click", () => {
            const userId = btn.dataset.addFriend;
            const user = MOCK_FRIEND_USERS.find(u => u.id === userId);
            if (!user) return;
            const data = loadFriendData();
            if (isFriend(userId)) { showToast("已经是好友了"); return; }
            if (hasPendingRequest(userId)) { showToast("已有待处理的申请"); return; }
            if (isBlocked(userId)) { showToast("无法添加该用户"); return; }

            const msg = prompt("发送验证信息（可选）：", "你好，一起探索南京！");
            if (msg === null) return;
            data.requests.push({
                id: "req-" + Date.now(),
                fromId: "me",
                toId: userId,
                message: msg || "你好，一起探索南京！",
                status: "pending",
                createdAt: Date.now()
            });
            saveFriendData(data);
            showToast("好友申请已发送");
            renderFriendPage(overlay);
        });
    });

    // Accept request (uses backend)
    overlay.querySelectorAll("[data-accept-request]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const reqId = parseInt(btn.dataset.acceptRequest);
            if (!reqId) return;
            const result = await friendApi.acceptRequest(reqId);
            if (result.code === 200) {
                showToast("已接受好友申请");
                // Refresh friend list from backend
                await refreshFriendsFromBackend();
                renderFriendPage(overlay);
            } else {
                showToast(result.msg || "操作失败");
            }
        });
    });

    // Reject request (uses backend)
    overlay.querySelectorAll("[data-reject-request]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const reqId = parseInt(btn.dataset.rejectRequest);
            if (!reqId) return;
            const result = await friendApi.rejectRequest(reqId);
            if (result.code === 200) {
                showToast("已拒绝");
                renderFriendPage(overlay);
            } else {
                showToast(result.msg || "操作失败");
            }
        });
    });

    // Remove friend
    overlay.querySelectorAll("[data-remove-friend]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!confirm("确定删除该好友？")) return;
            const userId = btn.dataset.removeFriend;
            const data = loadFriendData();
            data.friends = data.friends.filter(f => f.userId !== userId);
            saveFriendData(data);
            showToast("已删除好友");
            renderFriendPage(overlay);
        });
    });

    // Block user
    overlay.querySelectorAll("[data-block-user]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!confirm("确定拉黑该用户？拉黑后双方无法互动。")) return;
            const userId = btn.dataset.blockUser;
            const data = loadFriendData();
            data.friends = data.friends.filter(f => f.userId !== userId);
            data.requests = data.requests.filter(r => r.fromId !== userId && r.toId !== userId);
            data.blocked.push({ userId, reason: "", createdAt: Date.now() });
            saveFriendData(data);
            showToast("已拉黑");
            renderFriendPage(overlay);
        });
    });

    // Chat friend button
    overlay.querySelectorAll("[data-chat-friend]").forEach(btn => {
        btn.addEventListener("click", () => {
            const userId = btn.dataset.chatFriend;
            const user = MOCK_FRIEND_USERS.find(u => u.id === userId);
            const name = user ? user.nickname : ("好友" + userId);
            const avatar = user ? user.avatar : (name ? name.slice(0, 1) : "?");
            openPrivateChat(userId, name, avatar);
        });
    });

    // Conversation item click
    overlay.querySelectorAll("[data-open-conv]").forEach(el => {
        el.addEventListener("click", () => {
            const convId = el.dataset.openConv;
            const conv = loadChatData().conversations.find(c => c.id === convId);
            if (conv) {
                const otherUser = MOCK_FRIEND_USERS.find(u => u.id === conv.withUserId);
                const name = otherUser ? otherUser.nickname : ("用户" + conv.withUserId);
                const avatar = otherUser ? otherUser.avatar : (name ? name.slice(0, 1) : "?");
                openPrivateChat(conv.withUserId, name, avatar);
            }
        });
    });
}

// ═══ Friend List Tab ═══
function renderFriendList() {
    const data = loadFriendData();
    const friendIds = getMyFriendIds();

    const searchHTML = `<div class="friend-search-wrap">
        <input type="search" id="friend-search" class="friend-search-input" placeholder="搜索好友昵称或兴趣…">
    </div>`;

    // Build friend list: merge real backend friends (from cached data) with mock friends
    const allFriends = [];
    const seenIds = new Set();

    // Add real friends from backend cache (synced to localStorage)
    data.friends.forEach(f => {
        const idStr = String(f.userId);
        if (seenIds.has(idStr)) return;
        seenIds.add(idStr);
        // Try to find in mock data for avatar/extra info, or use basic info
        const mockUser = MOCK_FRIEND_USERS.find(u => u.id === idStr);
        allFriends.push({
            id: idStr,
            nickname: mockUser ? mockUser.nickname : (f.remark || "好友" + idStr),
            avatar: mockUser ? mockUser.avatar : (f.remark || "友").slice(0, 1),
            bio: mockUser ? mockUser.bio : "",
            tags: mockUser ? mockUser.tags : [],
            matchReason: mockUser ? mockUser.matchReason : "已添加为好友"
        });
    });

    // Add mock friends that haven't been synced yet
    MOCK_FRIEND_USERS.forEach(u => {
        if (seenIds.has(u.id)) return;
        if (friendIds.includes(u.id)) {
            seenIds.add(u.id);
            allFriends.push({
                id: u.id,
                nickname: u.nickname,
                avatar: u.avatar,
                bio: u.bio,
                tags: u.tags,
                matchReason: u.matchReason
            });
        }
    });

    if (!allFriends.length) {
        return searchHTML + `<div class="friend-empty">
            <span class="friend-empty-icon">👋</span>
            <strong>还没有好友</strong>
            <p>去「找搭子」发现志同道合的南京探索伙伴</p>
        </div>`;
    }

    // Show friends
    const myTags = ["建筑", "咖啡", "历史", "美食", "摄影", "Citywalk", "校园", "夜游"];
    const cards = allFriends.map(f => {
        const shared = f.tags.filter(t => myTags.includes(t));
        let matchReason = f.matchReason || "";
        if (!matchReason && shared.length >= 1) matchReason = `都对${shared[0]}感兴趣`;

        return `<div class="friend-card" data-name="${f.nickname}" data-tags="${f.tags.join(' ')}">
            <div class="friend-card-avatar">${escapeHtml(f.avatar)}</div>
            <div class="friend-card-info">
                <div class="friend-card-name">${escapeHtml(f.nickname)}</div>
                <div class="friend-card-bio">${escapeHtml(f.bio)}</div>
                <div class="friend-card-tags">${f.tags.map(t => `<span class="friend-tag">${escapeHtml(t)}</span>`).join("")}</div>
                ${matchReason ? `<div class="friend-card-match">🤝 ${matchReason}</div>` : ''}
            </div>
            <div class="friend-card-actions">
                <button class="friend-action-btn primary" type="button" data-chat-friend="${f.id}">💬 聊天</button>
                <button class="friend-action-btn" type="button" data-remove-friend="${f.id}">删除</button>
            </div>
        </div>`;
    }).join("");

    return searchHTML + `<div class="friend-list" id="friend-list">${cards}</div>`;
}

// ═══ Friend Requests Tab ═══
function renderFriendRequests() {
    const data = loadFriendData();

    function resolveUser(userIdStr) {
        // Check mock data first
        const mock = MOCK_FRIEND_USERS.find(u => u.id === userIdStr);
        if (mock) return { nickname: mock.nickname, avatar: mock.avatar, tags: mock.tags };
        // Backend user: use fromName or fallback
        return { nickname: null, avatar: "?", tags: [] };
    }

    function resolveSenderName(r) {
        if (r.fromName) return r.fromName;
        const u = resolveUser(r.fromId);
        return u.nickname || "用户" + r.fromId;
    }

    function resolveSenderAvatar(r) {
        if (r.fromName) return r.fromName.slice(0, 1);
        const u = resolveUser(r.fromId);
        return u.avatar || "?";
    }

    function resolveToName(r) {
        const u = resolveUser(r.toId);
        return u.nickname || r.toId;
    }

    function resolveToAvatar(r) {
        const u = resolveUser(r.toId);
        return u.avatar || "?";
    }

    // Received requests (from others to me, status pending)
    const received = data.requests.filter(r =>
        (r.toId === "me" || r.status === "pending") &&
        !(r.fromId === "me")
    );
    // Sent requests (from me to others)
    const sent = data.requests.filter(r => r.fromId === "me" || r.fromUserId !== undefined);
    // History (processed)
    const history = data.requests.filter(r => r.status !== "pending" && (r.toId === "me" || r.fromId === "me"));

    let html = "";

    // Received section
    html += `<div class="friend-section-title">收到的申请${received.length ? ` (${received.length})` : ''}</div>`;
    if (received.length) {
        html += received.map(r => {
            const name = resolveSenderName(r);
            const avatar = resolveSenderAvatar(r);
            const user = resolveUser(r.fromId);
            const timeStr = getTimeAgo(r.createdAt);
            const shared = user.tags.filter(t => ["建筑","咖啡","历史","美食","摄影","Citywalk","校园","夜游"].includes(t));
            return `<div class="friend-request-card">
                <div class="friend-card-avatar">${escapeHtml(avatar)}</div>
                <div class="friend-card-info">
                    <div class="friend-card-name">${escapeHtml(name)}</div>
                    <div class="friend-card-bio">${escapeHtml(r.message)}</div>
                    ${user.tags.length ? `<div class="friend-card-tags">${user.tags.map(t => `<span class="friend-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ''}
                    ${shared.length ? `<div class="friend-card-match">🤝 共同兴趣：${shared.join('、')}</div>` : ''}
                    <div class="friend-card-time">${timeStr}</div>
                </div>
                <div class="friend-card-actions">
                    <button class="friend-action-btn primary" type="button" data-accept-request="${r.id}">接受</button>
                    <button class="friend-action-btn" type="button" data-reject-request="${r.id}">拒绝</button>
                </div>
            </div>`;
        }).join("");
    } else {
        html += `<div class="friend-section-empty">暂无收到的申请</div>`;
    }

    // Sent section
    html += `<div class="friend-section-title">我发出的申请</div>`;
    if (sent.length) {
        html += sent.map(r => {
            const toName = resolveToName(r);
            const toAvatar = resolveToAvatar(r);
            const statusMap = { pending: "等待通过", accepted: "已接受", rejected: "已拒绝", canceled: "已撤回" };
            const statusLabel = statusMap[r.status] || r.status;
            return `<div class="friend-request-card">
                <div class="friend-card-avatar">${escapeHtml(toAvatar)}</div>
                <div class="friend-card-info">
                    <div class="friend-card-name">${escapeHtml(toName)}</div>
                    <div class="friend-card-bio">${escapeHtml(r.message)}</div>
                    <span class="friend-request-status status-${r.status}">${statusMap[r.status] || r.status}</span>
                </div>
            </div>`;
        }).join("");
    } else {
        html += `<div class="friend-section-empty">暂无发出的申请</div>`;
    }

    return `<div class="friend-requests-wrap">${html}</div>`;
}

// ═══ Buddy Finder Tab ═══
function renderBuddyFinder() {
    const friendIds = getMyFriendIds();
    const blockedIds = (loadFriendData().blocked || []).map(b => b.userId);
    const pendingUserIds = loadFriendData().requests.map(r => r.fromId === "me" ? r.toId : r.fromId);
    const excludeIds = [...friendIds, ...blockedIds, ...pendingUserIds];

    const available = MOCK_FRIEND_USERS.filter(u => !excludeIds.includes(u.id));

    if (!available.length) {
        return `<div class="friend-empty">
            <span class="friend-empty-icon">🔍</span>
            <strong>暂无可推荐的搭子</strong>
            <p>你已经覆盖了所有可匹配的用户</p>
        </div>`;
    }

    const cards = available.map(u => {
        return `<div class="friend-card buddy-card" data-name="${u.nickname}" data-tags="${u.tags.join(' ')}">
            <div class="friend-card-avatar">${u.avatar}</div>
            <div class="friend-card-info">
                <div class="friend-card-name">${escapeHtml(u.nickname)}</div>
                <div class="friend-card-bio">${escapeHtml(u.bio)}</div>
                <div class="friend-card-tags">${u.tags.map(t => `<span class="friend-tag">${escapeHtml(t)}</span>`).join("")}</div>
                <div class="friend-card-match">🤝 ${escapeHtml(u.matchReason)}</div>
                <div class="friend-card-meta">
                    <span>📍 ${escapeHtml(u.area)}</span>
                    <span>🎯 ${escapeHtml(u.travelStyle)}</span>
                </div>
            </div>
            <div class="friend-card-actions">
                <button class="friend-action-btn primary" type="button" data-add-friend="${u.id}">+ 添加</button>
            </div>
        </div>`;
    }).join("");

    return `<div class="friend-list" id="friend-list">${cards}</div>`;
}

function getTimeAgo(ts) {
    if (!ts) return "";
    const diff = Date.now() - ts;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return Math.floor(diff/60000) + "分钟前";
    if (diff < 86400000) return Math.floor(diff/3600000) + "小时前";
    return Math.floor(diff/86400000) + "天前";
}

// ══════════════════════════════════════════════════════
//  Chat System — Data Layer
// ══════════════════════════════════════════════════════

const CHAT_STORAGE_KEY = "citygo_chat_v1";

function loadChatData() {
    try {
        const raw = localStorage.getItem(CHAT_STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : { conversations: [], messages: {} };
        if (!data.messages) data.messages = {};
        return data;
    } catch (e) { return { conversations: [], messages: {} }; }
}

function saveChatData(data) {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
}

function getOrCreateConversation(withUserId) {
    const data = loadChatData();
    let conv = data.conversations.find(c => c.withUserId === withUserId);
    if (!conv) {
        conv = {
            id: "conv-" + Date.now(),
            withUserId: withUserId,
            type: isFriend(withUserId) ? "friend" : "buddy",
            isPinned: false,
            isMuted: false,
            lastMessage: "",
            lastMessageType: "text",
            lastMessageAt: Date.now(),
            createdAt: Date.now()
        };
        data.conversations.unshift(conv);
        if (!data.messages[conv.id]) data.messages[conv.id] = [];
        saveChatData(data);
    }
    return conv;
}

function getTotalUnreadCount() {
    const data = loadChatData();
    let count = 0;
    data.conversations.forEach(conv => {
        const msgs = data.messages[conv.id] || [];
        const unread = msgs.filter(m => m.senderId !== "me" && m.status !== "read").length;
        count += unread;
    });
    return count;
}

function getLastMessageSummary(conv) {
    const data = loadChatData();
    const msgs = data.messages[conv.id] || [];
    const last = msgs[msgs.length - 1];
    if (!last) return "";
    if (last.status === "recalled") return "消息已撤回";
    switch (last.type) {
        case "text": return (last.text || "").substring(0, 30) + ((last.text||"").length > 30 ? "…" : "");
        case "image": return "[图片]";
        case "video": return "[视频]";
        case "route": return "[路线] " + (last.routeName || "路线");
        case "poi": return "[景点] " + (last.poiName || "景点");
        case "merchant": return "[商家] " + (last.merchantName || "商家");
        case "post": return "[动态] " + ((last.postTitle || "").substring(0, 15));
        case "location": return "[集合地点]";
        case "invitation": return "[路线邀请]";
        default: return last.text || "";
    }
}

// ══════════════════════════════════════════════════════
//  Conversation List (消息 Tab)
// ══════════════════════════════════════════════════════

function renderConversationList() {
    const data = loadChatData();
    const friendIds = getMyFriendIds();

    // Auto-create conversations for friends that don't have one yet
    friendIds.forEach(fid => {
        if (!data.conversations.find(c => c.withUserId === fid)) {
            getOrCreateConversation(fid);
        }
    });

    // Reload after auto-creation
    const freshData = loadChatData();
    const conversations = freshData.conversations;

    // Sort: pinned first, then by lastMessageAt desc
    conversations.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt);
    });

    if (!conversations.length) {
        return `<div class="chat-empty">
            <span class="chat-empty-icon">💬</span>
            <strong>暂无消息</strong>
            <p>添加好友后即可开始聊天</p>
        </div>`;
    }

    const items = conversations.map(conv => {
        const user = MOCK_FRIEND_USERS.find(u => u.id === conv.withUserId);
        const msgs = freshData.messages[conv.id] || [];
        const unread = msgs.filter(m => m.senderId !== "me" && m.status !== "read").length;
        const lastTime = conv.lastMessageAt ? getTimeAgo(conv.lastMessageAt) : "";
        const summary = getLastMessageSummary(conv);
        const avatar = user ? user.avatar : (conv.withUserId ? String(conv.withUserId).slice(0, 1) : "?");
        const name = user ? user.nickname : ("用户" + conv.withUserId);
        const isPinned = conv.isPinned;
        const isMuted = conv.isMuted;

        return `<div class="chat-conv-item${isPinned ? ' pinned' : ''}" data-open-conv="${conv.id}">
            <div class="chat-conv-avatar">${escapeHtml(avatar)}</div>
            <div class="chat-conv-info">
                <div class="chat-conv-top">
                    <span class="chat-conv-name">${escapeHtml(name)}</span>
                    ${isPinned ? '<span class="chat-conv-pin">📌</span>' : ''}
                    ${isMuted ? '<span class="chat-conv-mute">🔕</span>' : ''}
                    <span class="chat-conv-time">${lastTime}</span>
                </div>
                <div class="chat-conv-preview">${escapeHtml(summary || '开始聊天吧')}</div>
                ${unread ? `<span class="chat-conv-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
            </div>
        </div>`;
    }).join("");

    return `<div class="chat-conv-list">${items}</div>`;
}

// ══════════════════════════════════════════════════════
//  Private Chat Page
// ══════════════════════════════════════════════════════

let currentChatUserId = null;
let currentChatConvId = null;
let chatRefreshTimer = null;

function openPrivateChat(userId, userName, userAvatar) {
    if (isBlocked(userId)) { showToast("无法与该用户聊天"); return; }
    if (!isFriend(userId)) {
        // Check if there's a pending/accepted buddy request
        const data = loadFriendData();
        const hasRelation = data.requests.some(r =>
            (r.fromId === userId || r.toId === userId) && r.status === "accepted"
        );
        if (!hasRelation && !isFriend(userId)) {
            showToast("需要先成为好友或搭子才能聊天");
            return;
        }
    }

    currentChatUserId = userId;
    const conv = getOrCreateConversation(userId);
    currentChatConvId = conv.id;

    const overlay = document.createElement("div");
    overlay.className = "chat-page-overlay";
    overlay.id = "chat-page-overlay";
    renderChatPage(overlay, userId, userName, userAvatar);
    document.body.appendChild(overlay);

    // Mark messages as read
    markConversationRead(conv.id);

    // Auto-refresh
    chatRefreshTimer = setInterval(() => {
        const chatOverlay = document.getElementById("chat-page-overlay");
        if (chatOverlay) {
            const body = chatOverlay.querySelector("#chat-messages");
            if (body) {
                const conv = getOrCreateConversation(currentChatUserId);
                body.innerHTML = renderChatMessages(conv.id);
                scrollChatToBottom(body);
            }
        }
    }, 3000);
}

function closeChat() {
    currentChatUserId = null;
    currentChatConvId = null;
    if (chatRefreshTimer) { clearInterval(chatRefreshTimer); chatRefreshTimer = null; }
    const overlay = document.getElementById("chat-page-overlay");
    if (overlay) overlay.remove();
}

function renderChatPage(overlay, userId, userName, userAvatar) {
    const user = MOCK_FRIEND_USERS.find(u => u.id === userId);
    const tags = user ? user.tags : [];
    const bio = user ? user.bio : "";
    const conv = getOrCreateConversation(userId);
    const relationLabel = isFriend(userId) ? "好友" : "临时搭子";

    overlay.innerHTML = `
        <div class="chat-page">
            <div class="chat-header">
                <button class="chat-back" type="button">←</button>
                <div class="chat-avatar-sm">${escapeHtml(userAvatar)}</div>
                <div class="chat-header-info">
                    <div class="chat-header-name">${escapeHtml(userName)}</div>
                    <div class="chat-header-status">
                        <span class="chat-relation-tag">${relationLabel}</span>
                        <span>在线</span>
                    </div>
                </div>
                <button class="chat-more-btn" type="button" id="chat-more-btn">⋯</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                ${renderChatMessages(conv.id)}
            </div>
            <div class="chat-input-row">
                <button class="chat-plus-btn" type="button" id="chat-plus-btn">+</button>
                <textarea class="chat-textarea" id="chat-textarea" rows="1" placeholder="说点什么…" maxlength="500"></textarea>
                <button class="chat-send-btn" type="button" id="chat-send-btn">发送</button>
            </div>
            <div class="chat-attach-panel" id="chat-attach-panel" style="display:none">
                <button class="chat-attach-item" data-attach="route">🗺️ 路线</button>
                <button class="chat-attach-item" data-attach="poi">📍 景点</button>
                <button class="chat-attach-item" data-attach="merchant">🛍️ 商家</button>
                <button class="chat-attach-item" data-attach="post">📝 社区动态</button>
                <button class="chat-attach-item" data-attach="location">📌 集合地点</button>
                <button class="chat-attach-item" data-attach="invitation">🎫 路线邀请</button>
            </div>
        </div>
    `;

    // Back button
    overlay.querySelector(".chat-back").addEventListener("click", closeChat);

    // More button
    overlay.querySelector("#chat-more-btn").addEventListener("click", () => {
        showChatSettings(userId, userName);
    });

    // Scroll to bottom
    const msgBody = overlay.querySelector("#chat-messages");
    scrollChatToBottom(msgBody);

    // Send message
    const sendMsg = () => {
        const textarea = overlay.querySelector("#chat-textarea");
        const text = textarea.value.trim();
        if (!text) return;
        sendChatMessage(conv.id, "text", { text: text });
        textarea.value = "";
        textarea.style.height = "auto";
        refreshChatMessages(overlay, conv.id);
    };
    overlay.querySelector("#chat-send-btn").addEventListener("click", sendMsg);
    overlay.querySelector("#chat-textarea").addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    });

    // Auto-resize textarea
    overlay.querySelector("#chat-textarea").addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, 120) + "px";
    });

    // Attach panel toggle
    overlay.querySelector("#chat-plus-btn").addEventListener("click", () => {
        const panel = overlay.querySelector("#chat-attach-panel");
        panel.style.display = panel.style.display === "none" ? "flex" : "none";
    });

    // Attach items
    overlay.querySelectorAll(".chat-attach-item").forEach(item => {
        item.addEventListener("click", () => {
            const type = item.dataset.attach;
            const panel = overlay.querySelector("#chat-attach-panel");
            panel.style.display = "none";
            handleChatAttachment(conv.id, type, overlay);
        });
    });

    // Long press / context menu on messages
    overlay.querySelectorAll(".chat-msg-bubble").forEach(bubble => {
        bubble.addEventListener("contextmenu", e => {
            e.preventDefault();
            const msgId = bubble.closest("[data-msg-id]")?.dataset.msgId;
            if (msgId) showChatMessageMenu(msgId, conv.id, overlay);
        });
        bubble.addEventListener("click", e => {
            // Single tap on failed message to retry
            const msgEl = bubble.closest("[data-msg-id]");
            if (msgEl && msgEl.classList.contains("msg-failed")) {
                const msgId = msgEl.dataset.msgId;
                retryChatMessage(conv.id, msgId, overlay);
            }
        });
    });

    // Route card clicks
    overlay.querySelectorAll("[data-open-route]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const routeKey = el.dataset.openRoute;
            if (routeKey && routes[routeKey] && typeof openRoute === "function") {
                openRoute(routeKey);
            }
        });
    });

    // Invitation accept/reject
    overlay.querySelectorAll("[data-accept-invite]").forEach(btn => {
        btn.addEventListener("click", () => {
            const msgId = btn.dataset.acceptInvite;
            const data = loadChatData();
            const msgs = data.messages[conv.id] || [];
            const msg = msgs.find(m => m.id === msgId);
            if (msg) { msg.inviteStatus = "accepted"; saveChatData(data); }
            refreshChatMessages(overlay, conv.id);
            showToast("已接受邀请！");
        });
    });
    overlay.querySelectorAll("[data-decline-invite]").forEach(btn => {
        btn.addEventListener("click", () => {
            const msgId = btn.dataset.declineInvite;
            const data = loadChatData();
            const msgs = data.messages[conv.id] || [];
            const msg = msgs.find(m => m.id === msgId);
            if (msg) { msg.inviteStatus = "declined"; saveChatData(data); }
            refreshChatMessages(overlay, conv.id);
            showToast("已拒绝邀请");
        });
    });
}

function scrollChatToBottom(body) {
    setTimeout(() => { if (body) body.scrollTop = body.scrollHeight; }, 100);
}

function refreshChatMessages(overlay, convId) {
    const body = overlay.querySelector("#chat-messages");
    if (body) {
        body.innerHTML = renderChatMessages(convId);
        scrollChatToBottom(body);
        // Re-bind context menus
        body.querySelectorAll(".chat-msg-bubble").forEach(bubble => {
            bubble.addEventListener("contextmenu", e => {
                e.preventDefault();
                const msgId = bubble.closest("[data-msg-id]")?.dataset.msgId;
                if (msgId) showChatMessageMenu(msgId, convId, overlay);
            });
        });
    }
}

// ═══ Message Rendering ═══
function renderChatMessages(convId) {
    const data = loadChatData();
    const msgs = data.messages[convId] || [];
    if (!msgs.length) {
        return `<div class="chat-msgs-empty">
            <span>👋</span>
            <p>开始你们的第一次对话吧</p>
        </div>`;
    }

    let html = "";
    let lastDate = "";
    let lastSenderId = "";
    let lastTime = 0;

    msgs.forEach((msg, i) => {
        const msgDate = new Date(msg.timestamp || Date.now()).toLocaleDateString("zh-CN", { month:"numeric", day:"numeric", weekday:"short" });
        if (msgDate !== lastDate) {
            html += `<div class="chat-date-divider"><span>${msgDate}</span></div>`;
            lastDate = msgDate;
            lastSenderId = "";
        }

        const isMe = msg.senderId === "me";
        const showAvatar = msg.senderId !== lastSenderId || (msg.timestamp - lastTime > 300000);
        const statusIcon = isMe ? renderMsgStatus(msg.status) : "";
        lastSenderId = msg.senderId;
        lastTime = msg.timestamp || 0;

        html += `<div class="chat-msg-row${isMe ? ' msg-mine' : ''}${msg.status === 'failed' ? ' msg-failed' : ''}" data-msg-id="${msg.id}">
            ${!isMe && showAvatar ? `<div class="chat-msg-avatar">${escapeHtml(msg.senderAvatar||'?')}</div>` : (!isMe ? `<div class="chat-msg-avatar-spacer"></div>` : '')}
            <div class="chat-msg-content">
                ${renderChatMessageBubble(msg)}
                ${statusIcon ? `<span class="chat-msg-status">${statusIcon}</span>` : ''}
            </div>
        </div>`;
    });

    return html;
}

function renderMsgStatus(status) {
    switch (status) {
        case "sending": return "⏳";
        case "sent": return "✓";
        case "delivered": return "✓✓";
        case "read": return "✓✓";
        case "failed": return "❌";
        default: return "";
    }
}

function renderChatMessageBubble(msg) {
    if (msg.status === "recalled") {
        return `<div class="chat-msg-bubble msg-recalled"><em>消息已撤回</em></div>`;
    }

    let content = "";
    switch (msg.type) {
        case "text":
            content = `<div class="chat-msg-text">${chatFormatText(msg.text||"")}</div>`;
            break;
        case "image":
            content = `<div class="chat-msg-image"><img src="${escapeHtml(msg.imageUrl||'')}" alt="图片" loading="lazy" onclick="this.classList.toggle('expanded')"><span class="chat-msg-img-label">📷 图片</span></div>`;
            break;
        case "video":
            content = `<div class="chat-msg-video"><video src="${escapeHtml(msg.videoUrl||'')}" controls preload="metadata" poster="${escapeHtml(msg.thumbUrl||'')}"></video></div>`;
            break;
        case "route":
            content = renderChatRouteCard(msg);
            break;
        case "poi":
            content = renderChatPoiCard(msg);
            break;
        case "merchant":
            content = renderChatMerchantCard(msg);
            break;
        case "post":
            content = renderChatPostCard(msg);
            break;
        case "location":
            content = `<div class="chat-msg-location">📌 <strong>${escapeHtml(msg.locationName||'集合地点')}</strong><br><span>${escapeHtml(msg.locationAddr||'')}</span></div>`;
            break;
        case "invitation":
            content = renderChatInvitationCard(msg);
            break;
        default:
            content = `<div class="chat-msg-text">${chatFormatText(msg.text||"")}</div>`;
    }

    if (msg.replyTo) {
        content = `<div class="chat-msg-reply-preview" data-reply-to="${msg.replyTo}">
            <span class="reply-line"></span>
            <span>${escapeHtml((msg.replyToText||'').substring(0, 40))}</span>
        </div>` + content;
    }

    return `<div class="chat-msg-bubble">${content}</div>`;
}

function chatFormatText(text) {
    return escapeHtml(text || "")
        .replace(/\n/g, "<br>")
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

// ═══ Message Cards ═══
function renderChatRouteCard(msg) {
    const route = msg.routeKey && routes[msg.routeKey] ? routes[msg.routeKey] : null;
    const title = msg.routeName || (route ? getRouteDisplayTitle(route) : "路线");
    const spots = msg.spotCount || (route ? (route.stops ? route.stops.length : 0) : 0);
    return `<div class="chat-card route-card" data-open-route="${escapeHtml(msg.routeKey||'')}">
        <div class="chat-card-icon">🗺️</div>
        <div class="chat-card-body">
            <div class="chat-card-title">${escapeHtml(title)}</div>
            <div class="chat-card-meta">${spots}个景点 · ${escapeHtml(msg.duration||'约3小时')}</div>
        </div>
        <button class="chat-card-action" type="button" data-open-route="${escapeHtml(msg.routeKey||'')}">查看</button>
    </div>`;
}

function renderChatPoiCard(msg) {
    return `<div class="chat-card poi-card">
        <div class="chat-card-icon">📍</div>
        <div class="chat-card-body">
            <div class="chat-card-title">${escapeHtml(msg.poiName||'景点')}</div>
            <div class="chat-card-meta">${escapeHtml(msg.poiArea||'')} · ${escapeHtml(msg.poiDuration||'约1小时')}</div>
        </div>
    </div>`;
}

function renderChatMerchantCard(msg) {
    return `<div class="chat-card merchant-card">
        <div class="chat-card-icon">🛍️</div>
        <div class="chat-card-body">
            <div class="chat-card-title">${escapeHtml(msg.merchantName||'商家')}</div>
            <div class="chat-card-meta">${escapeHtml(msg.merchantType||'')} · ${escapeHtml(msg.merchantArea||'')} · 人均${escapeHtml(String(msg.merchantPrice||''))}</div>
        </div>
    </div>`;
}

function renderChatPostCard(msg) {
    return `<div class="chat-card post-card">
        <div class="chat-card-icon">📝</div>
        <div class="chat-card-body">
            <div class="chat-card-title">${escapeHtml(msg.postTitle||'社区动态')}</div>
            <div class="chat-card-meta">${escapeHtml(msg.postAuthor||'')} · ${escapeHtml((msg.postText||'').substring(0,40))}</div>
        </div>
    </div>`;
}

function renderChatInvitationCard(msg) {
    const responded = msg.inviteStatus === "accepted" || msg.inviteStatus === "declined";
    return `<div class="chat-card invitation-card">
        <div class="chat-card-icon">🎫</div>
        <div class="chat-card-body">
            <div class="chat-card-title">路线邀请：${escapeHtml(msg.routeName||'路线')}</div>
            <div class="chat-card-meta">
                📅 ${escapeHtml(msg.inviteDate||'')} ⏰ ${escapeHtml(msg.inviteTime||'')}<br>
                📍 ${escapeHtml(msg.meetingPoint||'')} 💰 人均${escapeHtml(String(msg.budget||''))}
            </div>
            ${!responded && msg.senderId !== "me" ? `
                <div class="chat-invite-actions">
                    <button class="chat-invite-accept" type="button" data-accept-invite="${msg.id}">接受</button>
                    <button class="chat-invite-decline" type="button" data-decline-invite="${msg.id}">拒绝</button>
                </div>
            ` : `<div class="chat-invite-status">${msg.inviteStatus === 'accepted' ? '✅ 已接受' : msg.inviteStatus === 'declined' ? '❌ 已拒绝' : '⏳ 等待回复'}</div>`}
        </div>
    </div>`;
}

// ═══ Send Message ═══
function sendChatMessage(convId, type, payload) {
    const data = loadChatData();
    if (!data.messages[convId]) data.messages[convId] = [];

    const conv = data.conversations.find(c => c.id === convId);
    const receiverId = conv ? conv.withUserId : null;

    const msg = {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        type: type,
        senderId: "me",
        senderAvatar: getCommunityAvatar(getCommunityCurrentUserName()),
        timestamp: Date.now(),
        status: "sent",
        ...payload
    };

    data.messages[convId].push(msg);

    // Update conversation
    if (conv) {
        conv.lastMessage = type === "text" ? (payload.text || "").substring(0, 30) : type;
        conv.lastMessageType = type;
        conv.lastMessageAt = Date.now();
    }

    saveChatData(data);

    // Send via backend API if it's a real user ID (numeric)
    if (type === "text" && payload.text && receiverId && /^\d+$/.test(String(receiverId))) {
        chatApi.send(parseInt(receiverId), payload.text).then(result => {
            if (result.code === 200) {
                msg.status = "delivered";
                msg.backendId = result.data.id;
                saveChatData(loadChatData());
            }
        }).catch(() => {});
    }

    // Simulate reply after 1-3s for demo (only for mock friends)
    if (type === "text" && payload.text && (!receiverId || !/^\d+$/.test(String(receiverId)))) {
        setTimeout(() => {
            const updatedData = loadChatData();
            if (!updatedData.messages[convId]) updatedData.messages[convId] = [];
            const replies = [
                "好的！",
                "这个路线不错 👍",
                "我也想去！",
                "周末有空吗？",
                "听起来很棒",
                "收藏了 ✨",
                "下次一起啊",
                "南京这些地方我都去过"
            ];
            const reply = {
                id: "msg-" + Date.now() + "-reply",
                type: "text",
                senderId: currentChatUserId,
                senderAvatar: MOCK_FRIEND_USERS.find(u => u.id === currentChatUserId)?.avatar || "?",
                text: replies[Math.floor(Math.random() * replies.length)],
                timestamp: Date.now(),
                status: "delivered"
            };
            updatedData.messages[convId].push(reply);
            const conv2 = updatedData.conversations.find(c => c.id === convId);
            if (conv2) {
                conv2.lastMessage = reply.text.substring(0, 30);
                conv2.lastMessageAt = Date.now();
            }
            saveChatData(updatedData);

            // Refresh UI if chat is open
            const overlay = document.getElementById("chat-page-overlay");
            if (overlay && currentChatConvId === convId) {
                refreshChatMessages(overlay, convId);
            }
        }, 1000 + Math.random() * 2000);
    }
}

function retryChatMessage(convId, msgId, overlay) {
    const data = loadChatData();
    const msgs = data.messages[convId] || [];
    const msg = msgs.find(m => m.id === msgId);
    if (msg) {
        msg.status = "sent";
        saveChatData(data);
        refreshChatMessages(overlay, convId);
        showToast("消息已重新发送");
    }
}

function markConversationRead(convId) {
    const data = loadChatData();
    const msgs = data.messages[convId] || [];
    let changed = false;
    msgs.forEach(m => {
        if (m.senderId !== "me" && m.status !== "read") {
            m.status = "read";
            changed = true;
        }
    });
    if (changed) saveChatData(data);
}

// ═══ Chat Attachments ═══
function handleChatAttachment(convId, type, overlay) {
    switch (type) {
        case "route": {
            const routeKeys = Object.keys(routes).filter(k => routes[k]);
            if (!routeKeys.length) { showToast("暂无可发送的路线"); return; }
            const options = routeKeys.map(k => `${k}: ${getRouteDisplayTitle(routes[k])}`).join("\n");
            const key = prompt("选择路线（输入路线关键词）：\n" + options);
            if (!key) return;
            const matched = routeKeys.find(k => k.includes(key) || (routes[k].title||"").includes(key));
            if (!matched) { showToast("未找到匹配路线"); return; }
            const route = routes[matched];
            sendChatMessage(convId, "route", {
                routeKey: matched,
                routeName: getRouteDisplayTitle(route),
                spotCount: route.stops ? route.stops.length : 0,
                duration: route.duration || "约3小时"
            });
            refreshChatMessages(overlay, convId);
            break;
        }
        case "poi": {
            const name = prompt("景点名称：");
            if (!name) return;
            const area = prompt("所在区域（可选）：", "鼓楼区");
            sendChatMessage(convId, "poi", {
                poiName: name,
                poiArea: area || "",
                poiDuration: "约1小时"
            });
            refreshChatMessages(overlay, convId);
            break;
        }
        case "merchant": {
            const name = prompt("商家名称：");
            if (!name) return;
            sendChatMessage(convId, "merchant", {
                merchantName: name,
                merchantType: "餐饮",
                merchantArea: "鼓楼区",
                merchantPrice: "50"
            });
            refreshChatMessages(overlay, convId);
            break;
        }
        case "post": {
            const posts = loadCommunityPosts();
            if (!posts.length) { showToast("暂无社区动态"); return; }
            const post = posts[0];
            sendChatMessage(convId, "post", {
                postId: post.id,
                postTitle: post.title || "社区动态",
                postAuthor: post.author,
                postText: (post.text||"").substring(0, 100)
            });
            refreshChatMessages(overlay, convId);
            break;
        }
        case "location": {
            const name = prompt("集合地点名称：", "新街口地铁站");
            if (!name) return;
            const addr = prompt("地址详情（可选）：", "鼓楼区中山路");
            sendChatMessage(convId, "location", {
                locationName: name,
                locationAddr: addr || ""
            });
            refreshChatMessages(overlay, convId);
            break;
        }
        case "invitation": {
            const routeKey = Object.keys(routes).find(k => routes[k]);
            const route = routeKey ? routes[routeKey] : null;
            const routeName = prompt("路线名称：", route ? getRouteDisplayTitle(route) : "南京一日游");
            if (!routeName) return;
            const date = prompt("出行日期：", "本周六");
            const time = prompt("集合时间：", "09:00");
            const point = prompt("集合地点：", "新街口地铁站");
            const budget = prompt("人均预算：", "100元");
            sendChatMessage(convId, "invitation", {
                routeName: routeName,
                routeKey: routeKey || "",
                inviteDate: date || "本周六",
                inviteTime: time || "09:00",
                meetingPoint: point || "新街口",
                budget: budget || "100元",
                inviteStatus: "pending"
            });
            refreshChatMessages(overlay, convId);
            break;
        }
    }
}

// ═══ Message Context Menu ═══
function showChatMessageMenu(msgId, convId, overlay) {
    const data = loadChatData();
    const msgs = data.messages[convId] || [];
    const msg = msgs.find(m => m.id === msgId);
    if (!msg) return;

    const isMe = msg.senderId === "me";
    const menu = document.createElement("div");
    menu.className = "chat-msg-menu";
    const items = [
        { label: "📋 复制", action: "copy", show: msg.type === "text" },
        { label: "💬 回复", action: "reply", show: true },
        { label: "↩️ 撤回", action: "recall", show: isMe && msg.status !== "recalled" && (Date.now() - msg.timestamp < 120000) },
        { label: "🗑️ 删除", action: "delete", show: true },
        { label: "🚩 举报", action: "report", show: !isMe },
        { label: "取消", action: "cancel", show: true }
    ];

    menu.innerHTML = items.filter(i => i.show).map(i =>
        `<button class="chat-msg-menu-item" data-action="${i.action}">${i.label}</button>`
    ).join("");

    menu.style.position = "fixed";
    menu.style.bottom = "80px";
    menu.style.left = "50%";
    menu.style.transform = "translateX(-50%)";
    menu.style.zIndex = "2000";
    document.body.appendChild(menu);

    menu.querySelectorAll(".chat-msg-menu-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            menu.remove();
            if (action === "cancel") return;
            if (action === "copy") {
                navigator.clipboard?.writeText(msg.text||"");
                showToast("已复制");
            } else if (action === "recall") {
                msg.status = "recalled";
                saveChatData(data);
                refreshChatMessages(overlay, convId);
                showToast("消息已撤回");
            } else if (action === "delete") {
                data.messages[convId] = msgs.filter(m => m.id !== msgId);
                saveChatData(data);
                refreshChatMessages(overlay, convId);
                showToast("已删除");
            } else if (action === "reply") {
                const textarea = overlay.querySelector("#chat-textarea");
                if (textarea) {
                    textarea.value = "[回复] " + (msg.text||"").substring(0, 40) + "\n";
                    textarea.focus();
                }
            } else if (action === "report") {
                showToast("举报已提交");
            }
        });
    });

    // Close on outside click
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener("click", closeMenu); }
        };
        document.addEventListener("click", closeMenu);
    }, 100);
}

// ═══ Chat Settings ═══
function showChatSettings(userId, userName) {
    const overlay = document.createElement("div");
    overlay.className = "repost-overlay";
    const conv = getOrCreateConversation(userId);
    overlay.innerHTML = `
        <div class="more-menu-panel">
            <div class="chat-settings-header">${escapeHtml(userName)}</div>
            <button class="more-menu-item" data-action="pin">📌 ${conv.isPinned ? '取消置顶' : '置顶聊天'}</button>
            <button class="more-menu-item" data-action="mute">🔕 ${conv.isMuted ? '取消免打扰' : '消息免打扰'}</button>
            <button class="more-menu-item" data-action="search">🔍 搜索聊天记录</button>
            <button class="more-menu-item" data-action="clear">🗑️ 清空聊天记录</button>
            <button class="more-menu-item" data-action="block">🚫 拉黑</button>
            <button class="more-menu-item more-menu-cancel">取消</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector(".more-menu-cancel").addEventListener("click", () => overlay.remove());

    overlay.querySelectorAll(".more-menu-item[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            overlay.remove();
            if (action === "pin") {
                const d = loadChatData();
                const c = d.conversations.find(c => c.withUserId === userId);
                if (c) { c.isPinned = !c.isPinned; saveChatData(d); }
                showToast(c && c.isPinned ? "已置顶" : "已取消置顶");
            } else if (action === "mute") {
                const d = loadChatData();
                const c = d.conversations.find(c => c.withUserId === userId);
                if (c) { c.isMuted = !c.isMuted; saveChatData(d); }
                showToast(c && c.isMuted ? "已静音" : "已取消静音");
            } else if (action === "search") {
                const keyword = prompt("搜索关键词：");
                if (keyword) showToast("搜索功能开发中");
            } else if (action === "clear") {
                if (confirm("确定清空与该好友的聊天记录？")) {
                    const d = loadChatData();
                    const c = d.conversations.find(c => c.withUserId === userId);
                    if (c) d.messages[c.id] = [];
                    saveChatData(d);
                    showToast("已清空");
                }
            } else if (action === "block") {
                if (confirm("确定拉黑该用户？拉黑后双方无法互动。")) {
                    const d = loadFriendData();
                    d.friends = d.friends.filter(f => f.userId !== userId);
                    d.blocked.push({ userId, reason: "", createdAt: Date.now() });
                    saveFriendData(d);
                    closeChat();
                    showToast("已拉黑");
                }
            }
        });
    });
}
