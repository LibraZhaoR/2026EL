/* ═══════════════════════════════════════
   人格地图样式配置
   每种人格对应一种高德地图主题风格
   ═══════════════════════════════════════ */

const PERSONA_MAP_STYLES = {
    // 美食家 → 温暖活力（标注突出食物POI）
    foodie: {
        style: 'amap://styles/ff8000',
        label: '暖食地图',
        pitch: 45,
        zoom: 14,
    },
    // 文学爱好者 → 素雅米白
    reader: {
        style: 'amap://styles/f0ebe0',
        label: '素笺地图',
        pitch: 30,
        zoom: 14,
    },
    // 运动达人 → 清新绿意
    sport: {
        style: 'amap://styles/6dba6d',
        label: '活力地图',
        pitch: 50,
        zoom: 13,
    },
    // 咖啡漫游者 → 暖棕复古
    coffee: {
        style: 'amap://styles/8b6b4a',
        label: '漫游地图',
        pitch: 35,
        zoom: 14,
    },
    // 历史探索者 → 古风米黄
    history: {
        style: 'amap://styles/ccc8b8',
        label: '古迹地图',
        pitch: 40,
        zoom: 13,
    },
    // 拍照打卡党 → 明亮鲜艳
    photo: {
        style: 'amap://styles/78c0e0',
        label: '出片地图',
        pitch: 45,
        zoom: 14,
    },
    // 夜游玩家 → 深色夜景
    night: {
        style: 'amap://styles/1a1a2e',
        label: '夜游地图',
        pitch: 55,
        zoom: 13,
    },
    // 校园情怀派 → 清爽明亮
    nju: {
        style: 'amap://styles/e8f0e8',
        label: '校园地图',
        pitch: 30,
        zoom: 14,
    },
};

/* 默认（未选择人格）→ 普通模式 */
const DEFAULT_MAP_STYLE = 'amap://styles/normal';

function getPersonaMapStyle(personaId) {
    if (!personaId || !PERSONA_MAP_STYLES[personaId]) return {
        style: DEFAULT_MAP_STYLE,
        label: '探索地图',
        pitch: 40,
        zoom: 14,
    };
    return PERSONA_MAP_STYLES[personaId];
}
