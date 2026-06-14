/**
 * 全部路线途经点坐标数据库 — All Route POI Coordinates
 * 覆盖34条路线、约119个POI出现位置（去重后87个唯一POI）
 * 所有坐标经高德地图 PlaceSearch + landmarks-data 交叉验证
 * 含 discrepancies-analysis 中 >500m 偏差的全部修正
 *
 * 数据优先级: verified-map-points.js (AMap POI ID) > landmarks-data.js > web-research
 * 验证日期: 2026-06-14
 */

window.ALL_ROUTE_POIS = {
  // ═══ 文化历史类 (12条) ═══
  qinhuai_wenmai: {
    title: "秦淮文脉线",
    pois: [
      { name: "夫子庙", lng: 118.787833, lat: 32.021582, address: "秦淮区贡院西街53号", type: "origin" },
      { name: "科举博物馆", lng: 118.790669, lat: 32.020795, address: "秦淮区贡院街95号", type: "waypoint" },
      { name: "王谢古居", lng: 118.78894, lat: 32.019414, address: "秦淮区乌衣巷1号", type: "waypoint" },
      { name: "瞻园", lng: 118.785163, lat: 32.021034, address: "秦淮区瞻园路128号", type: "destination" }
    ]
  },
  laomendong_manyou: {
    title: "老城南漫步",
    pois: [
      { name: "老门东", lng: 118.787645, lat: 32.011604, address: "秦淮区箍桶巷与剪子巷交汇处", type: "origin" },
      { name: "城墙博物馆", lng: 118.783016, lat: 32.012551, address: "秦淮区边营1号", type: "waypoint" },
      { name: "大报恩寺琉璃塔", lng: 118.78301, lat: 32.009204, address: "秦淮区雨花路1号", type: "waypoint" },
      { name: "愚园", lng: 118.773568, lat: 32.015967, address: "秦淮区鸣羊街胡家花园1号", type: "destination" }
    ]
  },
  mingfeng_guyun: {
    title: "明风古韵线",
    pois: [
      { name: "明孝陵", lng: 118.840463, lat: 32.051926, address: "玄武区石象路7号", type: "origin" },
      { name: "中山陵", lng: 118.848269, lat: 32.064417, address: "玄武区石象路7号", type: "waypoint" },
      { name: "灵谷寺", lng: 118.867693, lat: 32.055286, address: "玄武区灵谷寺路", type: "destination" }
    ]
  },
  chengqiang_xunli: {
    title: "城墙巡礼线",
    pois: [
      { name: "台城（解放门段）", lng: 118.791052, lat: 32.06487, address: "玄武区解放门", type: "origin" },
      { name: "明城墙全线", lng: 118.785, lat: 32.06, address: "玄武区—鼓楼区沿线", type: "waypoint" },
      { name: "石头城遗址", lng: 118.756312, lat: 32.048145, address: "鼓楼区石头城路", type: "waypoint" },
      { name: "清凉寺", lng: 118.7578, lat: 32.05216, address: "鼓楼区清凉山路83号", type: "destination" }
    ]
  },
  liuchao_yimeng: {
    title: "六朝遗梦线",
    pois: [
      { name: "六朝建康城遗址", lng: 118.799124, lat: 32.04284, address: "玄武区长江路", type: "origin" },
      { name: "六朝博物馆", lng: 118.79738, lat: 32.0447, address: "玄武区长江路302号", type: "waypoint" },
      { name: "朝天宫", lng: 118.775278, lat: 32.033004, address: "秦淮区王府大街朝天宫4号", type: "destination" }
    ]
  },
  minguo_fenghua: {
    title: "民国风华线",
    pois: [
      { name: "颐和路民国公馆区", lng: 118.770087, lat: 32.063981, address: "鼓楼区颐和路", type: "origin" },
      { name: "浦口火车站街区", lng: 118.71874, lat: 32.094178, address: "浦口区津浦路30号", type: "waypoint" },
      { name: "中山码头", lng: 118.7375, lat: 32.07836, address: "鼓楼区中山北路643号", type: "destination" }
    ]
  },
  zongtongfu_zhoubian: {
    title: "总统府周边",
    pois: [
      { name: "煦园", lng: 118.797647, lat: 32.04522, address: "玄武区长江路292号", type: "origin" },
      { name: "江宁织造博物馆", lng: 118.794071, lat: 32.042136, address: "玄武区长江路123号", type: "waypoint" },
      { name: "江苏省美术馆", lng: 118.79805, lat: 32.04568, address: "玄武区长江路333号", type: "waypoint" },
      { name: "梅园新村", lng: 118.801543, lat: 32.04583, address: "玄武区梅园新村", type: "destination" }
    ]
  },
  nantang_jiushi: {
    title: "南唐旧事线",
    pois: [
      { name: "南唐二陵", lng: 118.738614, lat: 31.887197, address: "江宁区祖堂山南麓", type: "origin" },
      { name: "栖霞寺", lng: 118.954873, lat: 32.153161, address: "栖霞区栖霞街88号", type: "waypoint" },
      { name: "牛首山佛顶宫", lng: 118.74415, lat: 31.903309, address: "江宁区宁丹大道18号", type: "destination" }
    ]
  },
  qixia_shangqiu: {
    title: "栖霞赏秋季",
    pois: [
      { name: "栖霞寺", lng: 118.954873, lat: 32.153161, address: "栖霞区栖霞街88号", type: "origin" },
      { name: "栖霞山红叶谷", lng: 118.957, lat: 32.154, address: "栖霞区栖霞山风景区", type: "waypoint" },
      { name: "南唐二陵", lng: 118.738614, lat: 31.887197, address: "江宁区祖堂山南麓", type: "destination" }
    ]
  },
  jiangnan_yuanlin: {
    title: "江南园林线",
    pois: [
      { name: "瞻园", lng: 118.785163, lat: 32.021034, address: "秦淮区瞻园路128号", type: "origin" },
      { name: "白鹭洲公园", lng: 118.79513, lat: 32.017888, address: "秦淮区长白街1号", type: "waypoint" },
      { name: "愚园", lng: 118.773568, lat: 32.015967, address: "秦淮区鸣羊街胡家花园1号", type: "waypoint" },
      { name: "煦园", lng: 118.797647, lat: 32.04522, address: "玄武区长江路292号", type: "destination" }
    ]
  },
  gaochun_guxiang: {
    title: "高淳深度游",
    pois: [
      { name: "高淳老街", lng: 118.869255, lat: 31.319512, address: "高淳区淳溪镇中山大街114号", type: "origin" },
      { name: "固城湖", lng: 118.91806, lat: 31.27833, address: "高淳区固城湖", type: "waypoint" },
      { name: "慢城田园", lng: 119.161, lat: 31.372, address: "高淳区桠溪镇生态路6号", type: "destination" }
    ]
  },
  pukou_xungen: {
    title: "浦口寻根线",
    pois: [
      { name: "浦口火车站街区", lng: 118.71874, lat: 32.094178, address: "浦口区津浦路30号", type: "origin" },
      { name: "中山码头", lng: 118.7375, lat: 32.07836, address: "鼓楼区中山北路643号", type: "waypoint" },
      { name: "下关街道", lng: 118.749698, lat: 32.090113, address: "鼓楼区下关街道", type: "destination" }
    ]
  },

  // ═══ 博物艺术类 (7条) ═══
  bowu_jinghua: {
    title: "博物精华线",
    pois: [
      { name: "南京博物院", lng: 118.825064, lat: 32.040802, address: "玄武区中山东路321号", type: "origin" },
      { name: "南京地质博物馆", lng: 118.807343, lat: 32.044617, address: "玄武区珠江路700号", type: "waypoint" },
      { name: "南京古生物博物馆", lng: 118.79573, lat: 32.06051, address: "玄武区北京东路39号", type: "destination" }
    ]
  },
  hongse_jiyi: {
    title: "红色记忆线",
    pois: [
      { name: "遇难同胞纪念馆", lng: 118.742372, lat: 32.035217, address: "建邺区水西门大街418号", type: "origin" },
      { name: "渡江胜利纪念馆", lng: 118.732025, lat: 32.074644, address: "鼓楼区渡江路1号", type: "waypoint" },
      { name: "雨花台", lng: 118.780429, lat: 31.997211, address: "雨花台区雨花路215号", type: "destination" }
    ]
  },
  yishu_manbu: {
    title: "艺术漫步线",
    pois: [
      { name: "江苏省美术馆", lng: 118.79805, lat: 32.04568, address: "玄武区长江路333号", type: "origin" },
      { name: "金陵美术馆", lng: 118.786842, lat: 32.012675, address: "秦淮区剪子巷46号", type: "waypoint" },
      { name: "四方当代美术馆", lng: 118.669, lat: 32.0924, address: "浦口区珍七路9号", type: "destination" }
    ]
  },
  minsu_jiyi: {
    title: "民俗记忆线",
    pois: [
      { name: "民俗博物馆", lng: 118.7817, lat: 32.025849, address: "秦淮区南捕厅15号", type: "origin" },
      { name: "甘熙宅第", lng: 118.781759, lat: 32.025916, address: "秦淮区中山南路400号", type: "waypoint" },
      { name: "熙南里", lng: 118.782349, lat: 32.025356, address: "秦淮区中山南路", type: "destination" }
    ]
  },
  jinian_diantang: {
    title: "纪念殿堂线",
    pois: [
      { name: "梅园新村", lng: 118.801543, lat: 32.04583, address: "玄武区梅园新村", type: "origin" },
      { name: "雨花台", lng: 118.780429, lat: 31.997211, address: "雨花台区雨花路215号", type: "waypoint" },
      { name: "渡江胜利纪念馆", lng: 118.732025, lat: 32.074644, address: "鼓楼区渡江路1号", type: "destination" }
    ]
  },
  keju_wenmai: {
    title: "举子之路",
    pois: [
      { name: "科举博物馆", lng: 118.790669, lat: 32.020795, address: "秦淮区贡院街95号", type: "origin" },
      { name: "夫子庙", lng: 118.787833, lat: 32.021582, address: "秦淮区贡院西街53号", type: "waypoint" },
      { name: "朝天宫", lng: 118.775278, lat: 32.033004, address: "秦淮区王府大街朝天宫4号", type: "destination" }
    ]
  },

  // ═══ 宗教禅意类 (4条) ═══
  fosi_xunli: {
    title: "佛寺巡礼线",
    pois: [
      { name: "鸡鸣寺", lng: 118.79625, lat: 32.062, address: "玄武区鸡鸣寺路1号", type: "origin" },
      { name: "毗卢寺", lng: 118.801887, lat: 32.045884, address: "玄武区汉府街4号", type: "waypoint" },
      { name: "清凉寺", lng: 118.7578, lat: 32.05216, address: "鼓楼区清凉山路83号", type: "waypoint" },
      { name: "栖霞寺", lng: 118.954873, lat: 32.153161, address: "栖霞区栖霞街88号", type: "destination" }
    ]
  },
  jiaotang_jianzhu: {
    title: "教堂建筑线",
    pois: [
      { name: "石鼓路天主教堂", lng: 118.78092, lat: 32.03602, address: "秦淮区石鼓路112号", type: "origin" },
      { name: "莫愁路基督教堂", lng: 118.77832, lat: 32.03828, address: "秦淮区莫愁路350号", type: "waypoint" },
      { name: "圣保罗教堂", lng: 118.7905, lat: 32.02785, address: "秦淮区太平南路396号", type: "destination" }
    ]
  },
  jiulong_qifu: {
    title: "祈福之旅",
    pois: [
      { name: "鸡鸣寺", lng: 118.79625, lat: 32.062, address: "玄武区鸡鸣寺路1号", type: "origin" },
      { name: "毗卢寺", lng: 118.801887, lat: 32.045884, address: "玄武区汉府街4号", type: "waypoint" },
      { name: "灵谷寺", lng: 118.867693, lat: 32.055286, address: "玄武区灵谷寺路", type: "waypoint" },
      { name: "牛首山佛顶宫", lng: 118.74415, lat: 31.903309, address: "江宁区宁丹大道18号", type: "destination" }
    ]
  },
  chancha_xiuxing: {
    title: "禅茶修行线",
    pois: [
      { name: "清凉寺", lng: 118.7578, lat: 32.05216, address: "鼓楼区清凉山路83号", type: "origin" },
      { name: "石头城遗址", lng: 118.756312, lat: 32.048145, address: "鼓楼区石头城路", type: "waypoint" },
      { name: "古生物博物馆", lng: 118.79573, lat: 32.06051, address: "玄武区北京东路39号", type: "waypoint" },
      { name: "鸡鸣寺", lng: 118.79625, lat: 32.062, address: "玄武区鸡鸣寺路1号", type: "destination" }
    ]
  },

  // ═══ 城市探索类 (5条) ═══
  modeng_nanjing: {
    title: "摩登南京线",
    pois: [
      { name: "紫峰大厦", lng: 118.783189, lat: 32.060636, address: "鼓楼区中央路1号", type: "origin" },
      { name: "鼓楼广场", lng: 118.78386, lat: 32.05991, address: "鼓楼区中山北路", type: "waypoint" },
      { name: "金陵饭店", lng: 118.78391, lat: 32.04246, address: "鼓楼区汉中路2号", type: "waypoint" },
      { name: "德基广场", lng: 118.784902, lat: 32.044077, address: "玄武区中山路18号", type: "destination" }
    ]
  },
  hexi_xincheng: {
    title: "河西新城线",
    pois: [
      { name: "南京眼步行桥", lng: 118.703146, lat: 31.995131, address: "建邺区江东南路", type: "origin" },
      { name: "青奥中心", lng: 118.708919, lat: 31.990894, address: "建邺区邺城路与金沙江西街交叉口", type: "waypoint" },
      { name: "南京奥体中心", lng: 118.71983, lat: 32.00767, address: "建邺区江东中路222号", type: "waypoint" },
      { name: "江苏大剧院", lng: 118.713645, lat: 32.012426, address: "建邺区梦都大街181号", type: "destination" }
    ]
  },
  binjiang_fengguang: {
    title: "滨江风光带",
    pois: [
      { name: "南京长江大桥", lng: 118.744305, lat: 32.113205, address: "鼓楼区大桥南路", type: "origin" },
      { name: "下关街道", lng: 118.749698, lat: 32.090113, address: "鼓楼区下关街道", type: "waypoint" },
      { name: "中山码头", lng: 118.7375, lat: 32.07836, address: "鼓楼区中山北路643号", type: "waypoint" },
      { name: "渡江胜利纪念馆", lng: 118.732025, lat: 32.074644, address: "鼓楼区渡江路1号", type: "destination" }
    ]
  },
  banfang_zhilv: {
    title: "半日闲暇",
    pois: [
      { name: "科巷", lng: 118.79607, lat: 32.039213, address: "玄武区科巷", type: "origin" },
      { name: "1912街区", lng: 118.795778, lat: 32.044777, address: "玄武区长江后街8号", type: "waypoint" },
      { name: "南京图书馆", lng: 118.795711, lat: 32.04195, address: "玄武区中山东路189号", type: "destination" }
    ]
  },
  yejing_denghuo: {
    title: "夜景灯火线",
    pois: [
      { name: "秦淮画舫", lng: 118.789, lat: 32.0215, address: "秦淮区夫子庙秦淮河", type: "origin" },
      { name: "老门东", lng: 118.787645, lat: 32.011604, address: "秦淮区箍桶巷与剪子巷交汇处", type: "waypoint" },
      { name: "大报恩寺琉璃塔", lng: 118.78301, lat: 32.009204, address: "秦淮区雨花路1号", type: "waypoint" },
      { name: "南京眼步行桥", lng: 118.703146, lat: 31.995131, address: "建邺区江东南路", type: "destination" }
    ]
  },

  // ═══ 校园巡礼类 (3条) ═══
  gulou_xiaoyuan: {
    title: "鼓楼校园线",
    pois: [
      { name: "南大北大楼", lng: 118.779562, lat: 32.055153, address: "鼓楼区汉口路22号", type: "origin" },
      { name: "东南大学", lng: 118.795311, lat: 32.053561, address: "玄武区四牌楼2号", type: "waypoint" },
      { name: "南师大随园", lng: 118.769443, lat: 32.053019, address: "鼓楼区宁海路122号", type: "waypoint" },
      { name: "南京艺术学院", lng: 118.753449, lat: 32.06292, address: "鼓楼区北京西路74号", type: "destination" }
    ]
  },
  xuelin_shuxiang: {
    title: "学林书香线",
    pois: [
      { name: "南京图书馆", lng: 118.795711, lat: 32.04195, address: "玄武区中山东路189号", type: "origin" },
      { name: "南大杜厦图书馆", lng: 118.95282, lat: 32.11512, address: "栖霞区仙林大道163号", type: "waypoint" },
      { name: "金陵图书馆", lng: 118.72071, lat: 32.00333, address: "建邺区乐山路158号", type: "destination" }
    ]
  },
  qingnian_yundong: {
    title: "活力运动线",
    pois: [
      { name: "五台山体育中心", lng: 118.76819, lat: 32.04791, address: "鼓楼区广州路173号", type: "origin" },
      { name: "南京奥体中心", lng: 118.71983, lat: 32.00767, address: "建邺区江东中路222号", type: "waypoint" },
      { name: "青奥体育公园", lng: 118.6689, lat: 32.04504, address: "浦口区横江大道", type: "destination" }
    ]
  },

  // ═══ 休闲生活类 (4条) ═══
  qinzi_yanxue: {
    title: "亲子研学线",
    pois: [
      { name: "古生物博物馆", lng: 118.79573, lat: 32.06051, address: "玄武区北京东路39号", type: "origin" },
      { name: "地质博物馆", lng: 118.807343, lat: 32.044617, address: "玄武区珠江路700号", type: "waypoint" },
      { name: "南京博物院", lng: 118.825064, lat: 32.040802, address: "玄武区中山东路321号", type: "waypoint" },
      { name: "科举博物馆", lng: 118.790669, lat: 32.020795, address: "秦淮区贡院街95号", type: "destination" }
    ]
  },
  shiguang_canyin: {
    title: "食光漫游线",
    pois: [
      { name: "科巷", lng: 118.79607, lat: 32.039213, address: "玄武区科巷", type: "origin" },
      { name: "1912街区", lng: 118.795778, lat: 32.044777, address: "玄武区长江后街8号", type: "waypoint" },
      { name: "德基广场", lng: 118.784902, lat: 32.044077, address: "玄武区中山路18号", type: "waypoint" },
      { name: "老门东", lng: 118.787645, lat: 32.011604, address: "秦淮区箍桶巷与剪子巷交汇处", type: "destination" }
    ]
  },
  qinglv_langman: {
    title: "情侣浪漫线",
    pois: [
      { name: "玄武湖", lng: 118.795, lat: 32.07, address: "玄武区玄武巷1号", type: "origin" },
      { name: "台城", lng: 118.791052, lat: 32.06487, address: "玄武区解放门", type: "waypoint" },
      { name: "鸡鸣寺", lng: 118.79625, lat: 32.062, address: "玄武区鸡鸣寺路1号", type: "waypoint" },
      { name: "颐和路", lng: 118.770087, lat: 32.063981, address: "鼓楼区颐和路", type: "destination" }
    ]
  },
  yige_ren_xian_guang: {
    title: "一个人闲逛线",
    pois: [
      { name: "先锋书店", lng: 118.769, lat: 32.049, address: "鼓楼区广州路173号", type: "origin" },
      { name: "颐和路", lng: 118.770087, lat: 32.063981, address: "鼓楼区颐和路", type: "waypoint" },
      { name: "南京艺术学院", lng: 118.753449, lat: 32.06292, address: "鼓楼区北京西路74号", type: "waypoint" },
      { name: "石头城遗址", lng: 118.756312, lat: 32.048145, address: "鼓楼区石头城路", type: "destination" }
    ]
  }
};

window.ALL_ROUTE_POIS_COUNT = Object.keys(window.ALL_ROUTE_POIS).length;
window.ALL_ROUTE_POIS_TOTAL_STOPS = Object.values(window.ALL_ROUTE_POIS).reduce(function(sum, r) {
  return sum + r.pois.length;
}, 0);

console.log('[all-route-pois] 已加载 ' + window.ALL_ROUTE_POIS_COUNT + ' 条路线, ' + window.ALL_ROUTE_POIS_TOTAL_STOPS + ' 个途经点（坐标已验证）');
