/**
 * 游戏配置 —— 《南小鲸·金陵鲸梦》
 *
 * 将原 Ren'Py 图片复制到 assets/ 对应目录，或修改下方路径指向原项目的图片。
 *
 * 原 Ren'Py 项目图片位置：
 *   E:\citygo\交互代码\0520\game\images\
 *
 * 简易做法（不改路径）：
 *   在 assets/backgrounds/ 下放入 .png 背景图
 *   在 assets/characters/xiaojing/ 下放入 .png 立绘图
 */

// ==================== 资源根路径 ====================
// 默认为 assets/ 目录。如需指向原 Ren'Py 项目图片，改为：
// VNEngine.setAssetBase('../0520/game/images/');
VNEngine.setAssetBase('assets/');

// ==================== 背景定义 ====================
VNEngine.backgrounds({
  black:          'backgrounds/black.png',
  white:          'backgrounds/white.png',
  bg_beidalou:    'backgrounds/北大楼.png',
  bg_beidalou_dusk:    'backgrounds/北大楼.png',
  bg_beidalou_twilight:'backgrounds/北大楼.png',
  bg_1902_wasteland:   'backgrounds/三江师范学堂.png',
  bg_1960s_lab:        'backgrounds/实验室.png',
  bg_2026_campus:      'backgrounds/仙林校区.png',
  bg_2026_lawn:        'backgrounds/仙林校区.png',
  bg_wutong_avenue:    'backgrounds/仙林校区.png',

  // 特殊场景图（人物+背景合成，使用前 hide 立绘）
  bg_eye_open:         'backgrounds/睁眼抬头.png',
  bg_point_sanjiang:   'backgrounds/指向开始（指向三江师范）.png',
  bg_wutong_lookback:  'backgrounds/梧桐回首.png',
  bg_chengkaijia:      'backgrounds/程开甲.jpg'
});

// ==================== 角色定义 ====================
VNEngine.characters({

  // 旁白（无名字显示）
  narrator: {
    name: '',
    color: '#cccccc'
  },

  // 玩家
  p: {
    name: '你',
    color: '#66ccff'
  },

  // 南小鲸 — 南京大学的化身
  xiaojing: {
    name: '南小鲸',
    color: '#ffffff',
    directory: 'characters/xiaojing/',
    defaultImage: 'characters/xiaojing/叉腿.png',
    images: {
      default:  'characters/xiaojing/叉腿.png',
      shy:      'characters/xiaojing/拘谨.png',
      smile:    'characters/xiaojing/大笑.png',
      side:     'characters/xiaojing/挥手.png',
      intro:    'characters/xiaojing/介绍.png',
      reach:    'characters/xiaojing/拥抱.png',
      point:    'characters/xiaojing/介绍.png',
      peace:    'characters/xiaojing/比耶.png',
      casual:   'characters/xiaojing/叉腿.png',
      surprise: 'characters/xiaojing/惊讶.png',
      hug:      'characters/xiaojing/拥抱.png',
      cute1:    'characters/xiaojing/可爱1.png',
      cute2:    'characters/xiaojing/可爱2.png',
      cute3:    'characters/xiaojing/可爱3.png',
      cute4:    'characters/xiaojing/可爱4.png'
    }
  }
});
