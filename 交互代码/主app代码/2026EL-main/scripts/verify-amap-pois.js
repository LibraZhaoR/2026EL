const fs = require("fs");
const https = require("https");
const path = require("path");
const vm = require("vm");

const APP_DIR = path.join(__dirname, "..", "src", "main", "resources", "static", "app");
const OUT_PATH = path.join(APP_DIR, "verified-map-points.js");
const REPORT_PATH = path.join(APP_DIR, "verified-map-points.report.json");
const AMAP_KEY = process.env.AMAP_WEB_KEY || process.env.AMAP_KEY || "acbce3442afa6bf6251bc8014a1594b8";
const CITY = "南京";
const QUERY_DELAY_MS = Number(process.env.AMAP_QUERY_DELAY_MS || 900);
const MAX_REASONABLE_DISTANCE_METERS = Number(process.env.AMAP_MAX_DISTANCE_METERS || 5000);

const MANUAL_KEYWORDS = {
  "台城（解放门段）": ["台城", "南京台城", "明城墙台城段"],
  "玄武湖公园(五洲)": ["玄武湖公园", "玄武湖"],
  "青奥中心(双子塔)": ["南京青奥中心", "南京国际青年文化中心"],
  "牛首山佛顶宫": ["牛首山佛顶宫", "牛首山文化旅游区"],
  "大报恩寺琉璃塔": ["大报恩寺遗址公园", "大报恩寺"],
  "科举博物馆": ["中国科举博物馆", "江南贡院"],
  "南京民俗博物馆": ["甘熙故居", "南京民俗博物馆"],
  "甘熙宅第": ["甘熙故居", "甘熙宅第"],
  "甘熙宅第  甘家大院": ["甘熙故居", "甘熙宅第", "甘家大院"],
  "煦园(总统府内)": ["煦园", "总统府煦园", "南京总统府"],
  "李香君故居": ["李香君故居", "媚香楼"],
  "金陵美术馆": ["金陵美术馆", "金陵美术馆老门东"],
  "颜鲁公祠": ["颜鲁公祠", "颜真卿纪念馆"],
  "下关街道": ["下关历史文化街区", "下关", "中山码头"],
  "南京眼步行桥": ["南京眼步行桥", "南京眼"],
  "明城墙全线": ["南京城墙", "明城墙"],
  "明故宫遗址": ["明故宫遗址公园", "明故宫"],
  "六朝建康城遗址": ["六朝博物馆", "六朝建康都城遗址"],
  "南京图书馆新馆": ["南京图书馆", "南京图书馆新馆"],
  "南京 1912 街区": ["南京1912街区", "南京1912"],
  "夫子庙步行街": ["夫子庙", "夫子庙步行街"],
  "高淳老街明清民居建筑群": ["高淳老街", "高淳老街明清民居建筑群"],
};

MANUAL_KEYWORDS["煦园(总统府内)"] = ["南京总统府煦园", "总统府煦园", "南京总统府", "煦园"];

const MANUAL_VERIFIED_POINTS = {
  "台城（解放门段）": { lng: 118.803085, lat: 32.061269, amapName: "南京城墙台城景区", amapType: "风景名胜;风景名胜;风景名胜" },
  "中山陵": { lng: 118.854097, lat: 32.054508, amapName: "中山陵景区", amapType: "风景名胜;风景名胜;国家级景点" },
  "煦园(总统府内)": { lng: 118.797647, lat: 32.045220, amapName: "国民政府总统府办公楼", amapType: "风景名胜;风景名胜;风景名胜" },
  "玄武湖公园(五洲)": { lng: 118.795000, lat: 32.070000, amapName: "玄武湖公园", amapType: "风景名胜;公园广场;公园" },
  "南京图书馆新馆": { lng: 118.795711, lat: 32.041950, amapName: "南京图书馆", amapType: "科教文化服务;图书馆;图书馆" },
};

function loadData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(APP_DIR, "building-points.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(APP_DIR, "landmarks-data.js"), "utf8"), context);
  return {
    buildings: Array.isArray(context.window.CITYGO_BUILDING_POINTS) ? context.window.CITYGO_BUILDING_POINTS : [],
    landmarks: Array.isArray(context.window.NANJING_LANDMARKS) ? context.window.NANJING_LANDMARKS : [],
  };
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[（(].*?[）)]/g, "")
    .replace(/南京市|南京/g, "")
    .replace(/[·\s\-—_「」《》]/g, "")
    .toLowerCase()
    .trim();
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function keywordsFor(point) {
  const name = String(point.name || "").trim();
  const noParen = normalizeName(name);
  const aliases = Array.isArray(point.aliases) ? point.aliases : [];
  return unique([
    ...(MANUAL_KEYWORDS[name] || []),
    name,
    noParen,
    `南京${noParen || name}`,
    ...aliases,
  ]);
}

function dedupePoints(buildings, landmarks) {
  const merged = [];
  const seen = new Set();
  buildings.concat(landmarks).forEach((point) => {
    const key = normalizeName(point.name || point.id);
    const lng = Number(point.lng);
    const lat = Number(point.lat);
    const fallbackKey = Number.isFinite(lng) && Number.isFinite(lat) ? `${lng.toFixed(5)},${lat.toFixed(5)}` : "";
    const dedupeKey = key || fallbackKey;
    if (!dedupeKey || seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    merged.push({
      ...point,
      lng,
      lat,
      dataSource: buildings.includes(point) ? "building-points" : "landmarks",
    });
  });
  return merged;
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Invalid JSON from AMap: ${body.slice(0, 160)}`));
          }
        });
      })
      .on("error", reject);
  });
}

function distanceMeters(aLng, aLat, bLng, bLat) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

async function searchKeyword(keyword) {
  const params = new URLSearchParams({
    key: AMAP_KEY,
    keywords: keyword,
    city: CITY,
    citylimit: "true",
    offset: "10",
    page: "1",
    extensions: "base",
  });
  const url = `https://restapi.amap.com/v3/place/text?${params.toString()}`;
  const json = await requestJson(url);
  if (json.infocode === "10021") {
    await new Promise((resolve) => setTimeout(resolve, QUERY_DELAY_MS * 3));
    return searchKeyword(keyword);
  }
  if (json.status !== "1") {
    throw new Error(`AMap error ${json.infocode || ""}: ${json.info || "unknown"}`);
  }
  return Array.isArray(json.pois) ? json.pois : [];
}

function scorePoi(point, poi, keyword) {
  const poiName = String(poi.name || "");
  const poiCity = String(poi.cityname || "");
  const poiType = String(poi.type || "");
  const poiAddress = String(poi.address || "");
  const [lng, lat] = String(poi.location || "").split(",").map(Number);
  const target = normalizeName(point.name);
  const candidate = normalizeName(poiName);
  let score = 0;

  if (/公交|地铁|停车场|出入口|售票处|公共厕所/.test(poiName + poiType + poiAddress)) return -10000;
  if (poiName === point.name) score += 120;
  if (candidate && target && candidate === target) score += 100;
  if (candidate && target && candidate.includes(target)) score += 45;
  if (candidate && target && target.includes(candidate)) score += 25;
  if (normalizeName(keyword) === candidate) score += 35;
  if (poiCity.includes(CITY)) score += 25;
  if (/风景名胜|博物馆|科教文化|商务住宅|购物服务|体育休闲|地名地址/.test(poiType)) score += 8;
  if (String(poi.location || "").includes(",")) score += 20;
  if (Number.isFinite(point.lng) && Number.isFinite(point.lat) && Number.isFinite(lng) && Number.isFinite(lat)) {
    const dist = distanceMeters(point.lng, point.lat, lng, lat);
    if (dist <= 800) score += 30;
    else if (dist <= 2500) score += 12;
    else if (dist > MAX_REASONABLE_DISTANCE_METERS) score -= 120;
  }

  return score;
}

async function verifyPoint(point) {
  const manual = MANUAL_VERIFIED_POINTS[point.name];
  if (manual) {
    return {
      point: {
        ...point,
        lng: manual.lng,
        lat: manual.lat,
        amapName: manual.amapName,
        amapPoiId: manual.amapPoiId || "",
        amapType: manual.amapType || "",
        amapAddress: manual.amapAddress || "",
        amapKeyword: "manual-verified",
        source: "amap",
        verified: true,
        verificationMode: "manual-candidate",
      },
      report: {
        name: point.name,
        status: "verified",
        amapName: manual.amapName,
        location: `${manual.lng},${manual.lat}`,
        keyword: "manual-verified",
        score: 999,
        attempts: [],
      },
    };
  }

  let best = null;
  const attempts = [];

  for (const keyword of keywordsFor(point)) {
    const pois = await searchKeyword(keyword);
    const scored = pois
      .filter((poi) => String(poi.location || "").includes(","))
      .map((poi) => ({
        poi,
        keyword,
        score: scorePoi(point, poi, keyword),
      }))
      .sort((a, b) => b.score - a.score);

    attempts.push({
      keyword,
      count: pois.length,
      top: scored[0]
        ? { name: scored[0].poi.name, location: scored[0].poi.location, type: scored[0].poi.type, score: scored[0].score }
        : null,
    });

    if (scored[0] && (!best || scored[0].score > best.score)) {
      best = scored[0];
    }
    if (best && best.score >= 120) break;
    await new Promise((resolve) => setTimeout(resolve, QUERY_DELAY_MS));
  }

  if (!best) {
    return {
      point: { ...point, verified: false, source: point.dataSource || "local" },
      report: { name: point.name, status: "not-found", attempts },
    };
  }

  const [lng, lat] = String(best.poi.location).split(",").map(Number);
  const verified = {
    ...point,
    lng,
    lat,
    amapName: best.poi.name,
    amapPoiId: best.poi.id || "",
    amapType: best.poi.type || "",
    amapAddress: best.poi.address || "",
    amapKeyword: best.keyword,
    source: "amap",
    verified: true,
  };
  return {
    point: verified,
    report: {
      name: point.name,
      status: "verified",
      amapName: best.poi.name,
      location: best.poi.location,
      keyword: best.keyword,
      score: best.score,
      attempts,
    },
  };
}

function writeOutput(points, report) {
  if (report.verified === 0) {
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
    throw new Error("No points were verified. Check that AMAP_WEB_KEY is a Web Service key, not a JS API key.");
  }

  const content = `// Verified map points generated by scripts/verify-amap-pois.js\n` +
    `// Coordinate convention: { lng, lat } -> AMap Marker position [lng, lat].\n` +
    `window.CITYGO_VERIFIED_MAP_POINTS = ${JSON.stringify(points, null, 2)};\n`;
  fs.writeFileSync(OUT_PATH, content, "utf8");
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
}

async function main() {
  const { buildings, landmarks } = loadData();
  const points = dedupePoints(buildings, landmarks);
  const verified = [];
  const report = {
    generatedAt: new Date().toISOString(),
    total: points.length,
    verified: 0,
    notFound: 0,
    items: [],
  };

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    process.stdout.write(`[${i + 1}/${points.length}] ${point.name} ... `);
    try {
      const result = await verifyPoint(point);
      verified.push(result.point);
      report.items.push(result.report);
      if (result.report.status === "verified") {
        report.verified += 1;
        process.stdout.write(`OK -> ${result.report.amapName} ${result.report.location}\n`);
      } else {
        report.notFound += 1;
        process.stdout.write("not found, kept local coordinate\n");
      }
    } catch (error) {
      verified.push({ ...point, verified: false, source: point.dataSource || "local", verifyError: error.message });
      report.notFound += 1;
      report.items.push({ name: point.name, status: "error", error: error.message });
      process.stdout.write(`ERROR ${error.message}\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, QUERY_DELAY_MS));
  }

  writeOutput(verified, report);
  console.log(`Wrote ${verified.length} points to ${OUT_PATH}`);
  console.log(`Verified ${report.verified}/${report.total}; unresolved ${report.notFound}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
