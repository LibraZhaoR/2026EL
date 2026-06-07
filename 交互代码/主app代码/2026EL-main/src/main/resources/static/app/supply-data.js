const SUPPLY_DATA = (function() {
  const IMAGES = {
    food: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=420&fit=crop",
    noodles: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&h=420&fit=crop",
    coffee: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=420&fit=crop",
    museum: "https://images.unsplash.com/photo-1548013146-72479768bada?w=500&h=420&fit=crop",
    hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=420&fit=crop",
    shopping: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&h=420&fit=crop",
    entertainment: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=420&fit=crop",
  };

  function deal(desc, price, orig, sold) {
    return { desc, price, orig, sold };
  }

  function gallery(key) {
    const image = IMAGES[key] || IMAGES.food;
    return [0, 1, 2].map(i => image + "&sig=" + key + i);
  }

  function shop(data) {
    return {
      phone: "",
      hours: data.category === "hotel" ? "全天营业" : "09:00-21:30",
      photos: Math.max(18, Math.round((data.reviewCount || 1000) / 120)),
      bookmarkCount: Math.round((data.reviewCount || 1000) * 1.7),
      detour: 0,
      stayMin: data.category === "hotel" ? 720 : data.category === "ticket" ? 120 : 45,
      gallery: gallery(data.imageKey || data.category),
      image: IMAGES[data.imageKey] || IMAGES[data.category] || IMAGES.food,
      ...data,
    };
  }

  const allBusinesses = [
    shop({
      id: "food001", name: "鸭得堡老鸭粉丝汤（丰富路店）", category: "food", subcategory: "鸭血粉丝汤",
      district: "秦淮区", address: "丰富路134号", distance: 280, rating: 4.6, reviewCount: 15203, avgPrice: 35,
      tags: ["老字号", "鸭血粉丝", "早餐"], deals: [deal("鸭血粉丝汤单人餐", 28, 38, 5200)], onRoute: true,
      highlights: ["鸭血粉丝汤", "鸭油烧饼", "锅巴"], services: ["可堂食", "近地铁"], imageKey: "noodles",
    }),
    shop({
      id: "food002", name: "李记清真馆（评事街店）", category: "food", subcategory: "牛肉锅贴",
      district: "秦淮区", address: "评事街打钉巷1号", distance: 420, rating: 4.8, reviewCount: 28450, avgPrice: 25,
      tags: ["清真", "锅贴", "排队王"], deals: [deal("牛肉锅贴12只+牛肉汤", 22, 30, 15600)], onRoute: true,
      highlights: ["牛肉锅贴", "牛肉汤", "小笼包"], services: ["可打包", "老字号"], imageKey: "food",
    }),
    shop({
      id: "food003", name: "蒋有记锅贴（老门东店）", category: "food", subcategory: "南京小吃",
      district: "秦淮区", address: "老门东三条营49号", distance: 520, rating: 4.7, reviewCount: 19600, avgPrice: 24,
      tags: ["老门东", "锅贴", "小吃"], deals: [deal("锅贴双人小食", 36, 52, 8600)], onRoute: true,
      highlights: ["牛肉锅贴", "馄饨", "赤豆元宵"], services: ["景区周边"], imageKey: "food",
    }),
    shop({
      id: "food004", name: "南京大牌档（德基广场店）", category: "food", subcategory: "金陵菜",
      district: "玄武区", address: "中山路18号德基广场7层", distance: 610, rating: 4.5, reviewCount: 36200, avgPrice: 78,
      tags: ["金陵菜", "家庭聚餐", "南京味"], deals: [deal("金陵双人餐", 168, 238, 12400)], onRoute: false,
      highlights: ["盐水鸭", "美龄粥", "糖芋苗"], services: ["适合聚餐", "商场内"], imageKey: "food",
    }),
    shop({
      id: "food005", name: "芳婆糕团店（王府大街店）", category: "food", subcategory: "糕团甜品",
      district: "秦淮区", address: "王府大街50号", distance: 360, rating: 4.5, reviewCount: 9800, avgPrice: 16,
      tags: ["糕团", "早餐", "南京甜口"], deals: [deal("糕团甜品组合", 18, 28, 7800)], onRoute: true,
      highlights: ["糖芋苗", "赤豆元宵", "桂花糕"], services: ["早市热门"], imageKey: "food",
    }),
    shop({
      id: "food006", name: "章云板鸭（升州路店）", category: "food", subcategory: "盐水鸭",
      district: "秦淮区", address: "升州路236号", distance: 700, rating: 4.6, reviewCount: 11300, avgPrice: 46,
      tags: ["盐水鸭", "伴手礼", "本地口味"], deals: [deal("盐水鸭半只", 45, 68, 8900)], onRoute: false,
      highlights: ["盐水鸭", "烤鸭", "鸭四件"], services: ["可外带"], imageKey: "food",
    }),
    shop({
      id: "coffee001", name: "先锋书店（五台山店）", category: "coffee", subcategory: "书店咖啡",
      district: "鼓楼区", address: "广州路173号", distance: 380, rating: 4.8, reviewCount: 51200, avgPrice: 42,
      tags: ["最美书店", "咖啡", "文创"], deals: [deal("手冲咖啡+甜点", 35, 52, 8600)], onRoute: true,
      highlights: ["手冲咖啡", "文创明信片", "阅读区"], services: ["可久坐", "适合拍照"], imageKey: "coffee",
    }),
    shop({
      id: "coffee002", name: "Seesaw Coffee（德基广场店）", category: "coffee", subcategory: "精品咖啡",
      district: "玄武区", address: "中山路18号德基广场B1", distance: 300, rating: 4.3, reviewCount: 4500, avgPrice: 42,
      tags: ["精品咖啡", "商场", "轻食"], deals: [deal("拿铁+可颂", 32, 45, 4500)], onRoute: false,
      highlights: ["热拿铁", "冷萃", "可颂"], services: ["近地铁"], imageKey: "coffee",
    }),
    shop({
      id: "coffee003", name: "UNiUNi（凯瑟琳广场店）", category: "coffee", subcategory: "咖啡茶饮",
      district: "玄武区", address: "北京东路1号凯瑟琳广场", distance: 460, rating: 4.5, reviewCount: 3200, avgPrice: 39,
      tags: ["露台", "手冲", "午后休息"], deals: [deal("手冲体验", 48, 68, 3200)], onRoute: true,
      highlights: ["手冲", "气泡咖啡", "小蛋糕"], services: ["可休息"], imageKey: "coffee",
    }),
    shop({
      id: "ticket001", name: "南京博物院", category: "ticket", subcategory: "博物馆",
      district: "玄武区", address: "中山东路321号", distance: 1200, rating: 4.7, reviewCount: 128000, avgPrice: 0,
      tags: ["免费预约", "国宝级", "雨天友好"], deals: [], onRoute: true,
      highlights: ["历史馆", "民国馆", "特展馆"], services: ["需预约", "亲子友好"], imageKey: "museum",
    }),
    shop({
      id: "ticket002", name: "夫子庙秦淮河画舫", category: "ticket", subcategory: "夜游船票",
      district: "秦淮区", address: "夫子庙秦淮河畔", distance: 650, rating: 4.5, reviewCount: 25600, avgPrice: 80,
      tags: ["夜游", "灯影", "秦淮"], deals: [deal("秦淮河画舫夜游", 68, 100, 25600)], onRoute: true,
      highlights: ["夜游船票", "茶点套票", "讲解"], services: ["夜间开放"], imageKey: "museum",
    }),
    shop({
      id: "ticket003", name: "总统府", category: "ticket", subcategory: "历史建筑",
      district: "玄武区", address: "长江路292号", distance: 980, rating: 4.4, reviewCount: 43200, avgPrice: 40,
      tags: ["民国建筑", "历史", "市中心"], deals: [deal("总统府+六朝博物馆", 55, 80, 9500)], onRoute: false,
      highlights: ["煦园", "子超楼", "文物展"], services: ["需购票"], imageKey: "museum",
    }),
    shop({
      id: "hotel001", name: "金陵饭店", category: "hotel", subcategory: "五星酒店",
      district: "鼓楼区", address: "汉中路2号", distance: 320, rating: 4.5, reviewCount: 9800, avgPrice: 680,
      tags: ["地标", "新街口", "经典"], deals: [deal("豪华大床房含早", 598, 880, 3200)], onRoute: false,
      highlights: ["大床房", "双早", "城市景观"], services: ["可停车", "近地铁"], imageKey: "hotel",
    }),
    shop({
      id: "hotel002", name: "全季酒店（南京夫子庙店）", category: "hotel", subcategory: "舒适住宿",
      district: "秦淮区", address: "建康路169号", distance: 480, rating: 4.6, reviewCount: 5600, avgPrice: 260,
      tags: ["夫子庙", "安静", "性价比"], deals: [deal("商务标间1晚", 228, 328, 5600)], onRoute: true,
      highlights: ["大床房", "洗衣房", "早餐"], services: ["24小时前台"], imageKey: "hotel",
    }),
    shop({
      id: "shopping001", name: "南京博物院文创商店", category: "shopping", subcategory: "文创纪念",
      district: "玄武区", address: "南京博物院馆内", distance: 1200, rating: 4.6, reviewCount: 6800, avgPrice: 58,
      tags: ["文创", "伴手礼", "南博限定"], deals: [], onRoute: true,
      highlights: ["冰箱贴", "明信片", "文物周边"], services: ["馆内购买"], imageKey: "shopping",
    }),
    shop({
      id: "ent001", name: "大华大戏院", category: "entertainment", subcategory: "影院演出",
      district: "秦淮区", address: "中山南路67号", distance: 520, rating: 4.5, reviewCount: 7800, avgPrice: 48,
      tags: ["民国建筑", "电影", "市中心"], deals: [deal("双人观影", 68, 120, 5600)], onRoute: false,
      highlights: ["电影票", "老建筑打卡", "爆米花"], services: ["可预约"], imageKey: "entertainment",
    }),
  ];

  const allCoupons = [
    { id: "cp001", category: "food", icon: "🍜", name: "鸭血粉丝汤双人套餐", desc: "老鸭汤底，含锅巴", price: "38", origPrice: "68", discount: "5.6折", distance: 280, shop: "鸭得堡老鸭粉丝汤", sold: 5200 },
    { id: "cp002", category: "food", icon: "🥟", name: "牛肉锅贴12只+牛肉汤", desc: "清真老店招牌", price: "22", origPrice: "30", discount: "7.3折", distance: 420, shop: "李记清真馆", sold: 15600 },
    { id: "cp003", category: "coffee", icon: "☕", name: "手冲咖啡+当日甜点", desc: "书店午后休息", price: "35", origPrice: "52", discount: "6.7折", distance: 380, shop: "先锋书店咖啡", sold: 8600 },
    { id: "cp004", category: "ticket", icon: "🎫", name: "秦淮河画舫夜游", desc: "含基础讲解", price: "68", origPrice: "100", discount: "6.8折", distance: 650, shop: "夫子庙秦淮河画舫", sold: 25600 },
    { id: "cp005", category: "hotel", icon: "🏨", name: "全季酒店商务标间", desc: "夫子庙附近休整", price: "228", origPrice: "328", discount: "7.0折", distance: 480, shop: "全季酒店南京夫子庙店", sold: 5600 },
  ];

  return {
    all: allBusinesses,
    coupons: allCoupons,
    totalCount: allBusinesses.length,
    getAll: function() { return allBusinesses; },
    getByCategory: function(cat) { return allBusinesses.filter(b => b.category === cat); },
    getFood: function() { return allBusinesses.filter(b => b.category === "food"); },
    getCoffee: function() { return allBusinesses.filter(b => b.category === "coffee"); },
    getAttractions: function() { return allBusinesses.filter(b => b.category === "ticket"); },
    getHotels: function() { return allBusinesses.filter(b => b.category === "hotel"); },
    getShopping: function() { return allBusinesses.filter(b => b.category === "shopping"); },
    getEntertainment: function() { return allBusinesses.filter(b => b.category === "entertainment"); },
    getCoupons: function() { return allCoupons; },
    getTotalCount: function() { return allBusinesses.length; },
  };
})();
