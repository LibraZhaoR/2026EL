const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const sourceImageDir = path.join(rootDir, "景点");
const appDir = path.join(rootDir, "2026EL", "交互代码", "主app代码", "2026EL-main", "src", "main", "resources", "static", "app");
const outPath = path.join(appDir, "landmarks-data.js");

const ASSET_PREFIX = "./assets/landmarks/";

const LANDMARKS = [
  { id: "taicheng", name: "台城（解放门段）", category: "历史古迹", lng: 118.7880, lat: 32.0620 },
  { id: "laomendong", name: "老门东", category: "历史古迹", lng: 118.7823, lat: 32.0135 },
  { id: "xiaguan", name: "下关街道", category: "历史古迹", lng: 118.7450, lat: 32.0880 },
  { id: "sun-yat-sen", name: "中山陵", category: "历史古迹", lng: 118.8500, lat: 32.0620 },
  { id: "massacre-memorial", name: "侵华日军南京大屠杀遇难同胞纪念馆", category: "博物馆", lng: 118.7430, lat: 32.0350 },
  { id: "jiankang-city", name: "六朝建康城遗址", category: "历史古迹", lng: 118.7980, lat: 32.0430 },
  { id: "nanjing-museum", name: "南京博物院", category: "博物馆", lng: 118.8200, lat: 32.0425 },
  { id: "geology-museum", name: "南京地质博物馆", category: "博物馆", lng: 118.7900, lat: 32.0470 },
  { id: "citywall-museum", name: "南京城墙博物馆", category: "博物馆", lng: 118.7830, lat: 32.0120 },
  { id: "folk-museum", name: "南京民俗博物馆", category: "博物馆", lng: 118.7806, lat: 32.0269 },
  { id: "nanjing-eye", name: "南京眼步行桥", category: "地标建筑", lng: 118.7150, lat: 32.0060 },
  { id: "yangtze-bridge", name: "南京长江大桥", category: "地标建筑", lng: 118.7420, lat: 32.1080 },
  { id: "nantang-tombs", name: "南唐二陵", category: "历史古迹", lng: 118.7420, lat: 31.8950 },
  { id: "baoensi-pagoda", name: "大报恩寺琉璃塔", category: "地标建筑", lng: 118.7835, lat: 32.0080 },
  { id: "fuzimiao", name: "夫子庙", category: "历史古迹", lng: 118.7891, lat: 32.0204 },
  { id: "yuyuan", name: "愚园(胡家花园)", category: "历史古迹", lng: 118.7755, lat: 32.0090 },
  { id: "ming-city-wall", name: "明城墙全线", category: "历史古迹", lng: 118.7800, lat: 32.0600 },
  { id: "ming-xiaoling", name: "明孝陵", category: "历史古迹", lng: 118.8450, lat: 32.0550 },
  { id: "ming-palace", name: "明故宫遗址", category: "历史古迹", lng: 118.8170, lat: 32.0410 },
  { id: "chaotian-palace", name: "朝天宫", category: "博物馆", lng: 118.7755, lat: 32.0325 },
  { id: "lixiangjun", name: "李香君故居", category: "历史古迹", lng: 118.7880, lat: 32.0188 },
  { id: "jiangning-textile", name: "江宁织造博物馆", category: "博物馆", lng: 118.7965, lat: 32.0445 },
  { id: "jiangsu-theatre", name: "江苏大剧院", category: "地标建筑", lng: 118.7215, lat: 32.0128 },
  { id: "linggu-temple", name: "灵谷寺", category: "宗教建筑", lng: 118.8680, lat: 32.0580 },
  { id: "xuyuan", name: "煦园(总统府内)", category: "历史古迹", lng: 118.7965, lat: 32.0455 },
  { id: "xinanli", name: "熙南里", category: "历史古迹", lng: 118.7800, lat: 32.0235 },
  { id: "niushou-palace", name: "牛首山佛顶宫", category: "地标建筑", lng: 118.7450, lat: 31.8850 },
  { id: "xuanwu-lake", name: "玄武湖公园(五洲)", category: "公共服务", lng: 118.7950, lat: 32.0700 },
  { id: "ganxi-house", name: "甘熙宅第", category: "历史古迹", lng: 118.7806, lat: 32.0269 },
  { id: "bailuzhou", name: "白鹭洲公园", category: "公共服务", lng: 118.7950, lat: 32.0165 },
  { id: "zhanyuan", name: "瞻园", category: "历史古迹", lng: 118.7850, lat: 32.0185 },
  { id: "stone-city", name: "石头城遗址", category: "历史古迹", lng: 118.7580, lat: 32.0505 },
  { id: "exam-museum", name: "科举博物馆", category: "博物馆", lng: 118.7890, lat: 32.0190 },
  { id: "zifeng-tower", name: "紫峰大厦", category: "地标建筑", lng: 118.7840, lat: 32.0625 },
  { id: "jinling-art-museum", name: "金陵美术馆", category: "博物馆", lng: 118.7830, lat: 32.0130 },
  { id: "yuhuatai-memorial", name: "雨花台烈士纪念馆", category: "博物馆", lng: 118.7770, lat: 32.0010 },
  { id: "youth-olympic-towers", name: "青奥中心(双子塔)", category: "地标建筑", lng: 118.7150, lat: 32.0060 },
  { id: "yihe-road", name: "颐和路民国公馆区", category: "历史古迹", lng: 118.7696, lat: 32.0615 },
  { id: "yanlugong", name: "颜鲁公祠", category: "历史古迹", lng: 118.7695, lat: 32.0495 },
  { id: "gaochun-old-street", name: "高淳老街", category: "历史古迹", lng: 118.8754, lat: 31.3277 },
];

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[⻔門]/g, "门")
    .replace(/⽼/g, "老")
    .replace(/⾹/g, "香")
    .replace(/\.[^.]+$/, "")
    .replace(/南京/g, "")
    .replace(/[()\[\]（）【】、，,.\s\-0-9]/g, "")
    .toLowerCase();
}

function findImages(name, imageFiles) {
  const target = normalizeName(name);
  const matches = imageFiles.filter((file) => {
    const candidate = normalizeName(file);
    return candidate === target || candidate.includes(target) || target.includes(candidate);
  });
  return matches.map((file) => ASSET_PREFIX + file);
}

const imageFiles = fs
  .readdirSync(sourceImageDir)
  .filter((file) => /\.(webp|jpg|jpeg|png)$/i.test(file))
  .filter((file) => !/^OIP/i.test(file) && !/^ChatGPT/i.test(file))
  .sort((a, b) => a.localeCompare(b, "zh-CN"));

const landmarks = LANDMARKS.map((landmark) => {
  const images = findImages(landmark.name, imageFiles);
  return {
    ...landmark,
    address: "",
    intro: `${landmark.name}，南京${landmark.category}类景点。`,
    image: images[0] || "",
    images,
    tags: [landmark.category, "南京", "景点"],
    kind: "building",
  };
});

const content = `// Nanjing landmarks generated from the local 景点 folder.\n` +
  `// Coordinate convention: POI points use { lng, lat }; AMap marker position is [lng, lat].\n` +
  `window.NANJING_LANDMARKS = ${JSON.stringify(landmarks, null, 2)};\n`;

fs.writeFileSync(outPath, content, "utf8");

const withImage = landmarks.filter((item) => item.image).length;
console.log(`Generated ${landmarks.length} landmarks.`);
console.log(`Matched images: ${withImage}/${landmarks.length}.`);
console.log(outPath);
