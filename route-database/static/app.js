/**
 * 灵动金陵 · 路线规划器
 * 基于 Leaflet.js 的地图路线查看与编辑工具
 */

const API = '/api';
let map, markersLayer, routeLine;
let allRoutes = [];
let currentRoute = null;
let currentFilter = 'all';
let editingPoints = [];    // 创建模式下的临时点位
let editMarkers = [];      // 创建模式下的地图标记
let isCreating = false;

// ══════════════════════════════════════════════════════
//  地图初始化
// ══════════════════════════════════════════════════════

function initMap() {
  map = L.map('map', {
    center: [32.045, 118.790],   // 南京市中心
    zoom: 13,
    zoomControl: true,
  });

  // OpenStreetMap 底图（免费无需 Key）
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | 灵动金陵',
    maxZoom: 19,
  }).addTo(map);

  // 点位标记层
  markersLayer = L.layerGroup().addTo(map);

  // 路线连线层
  routeLine = L.layerGroup().addTo(map);
}

// ══════════════════════════════════════════════════════
//  标记与路线绘制
// ══════════════════════════════════════════════════════

const POINT_COLORS = {
  start: '#81b29a',     // sage-green
  waypoint: '#e07a5f',  // sunset-orange
  end: '#3d405b',       // deep-sea-blue
};

const POINT_LABELS = {
  start: '起点',
  waypoint: '途经',
  end: '终点',
};

function createMarkerIcon(type, index) {
  const color = POINT_COLORS[type] || POINT_COLORS.waypoint;
  const label = type === 'start' ? '起' : type === 'end' ? '终' : String(index);

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function drawRouteOnMap(points, fitBounds = true) {
  markersLayer.clearLayers();
  routeLine.clearLayers();

  if (!points || points.length === 0) return;

  const latlngs = points.map(p => [p.latitude, p.longitude]);

  // 画连线
  if (latlngs.length >= 2) {
    const polyline = L.polyline(latlngs, {
      color: '#9a442d',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 6',
    }).addTo(routeLine);
  }

  // 画标记
  points.forEach((p, i) => {
    const type = p.point_type || 'waypoint';
    const marker = L.marker([p.latitude, p.longitude], {
      icon: createMarkerIcon(type, i),
    }).addTo(markersLayer);

    const stayInfo = p.stay_minutes ? `<br>⏱ 建议停留: ${p.stay_minutes}分钟` : '';
    marker.bindPopup(`
      <strong>${type === 'start' ? '🚩 起点: ' : type === 'end' ? '🏁 终点: ' : '📍 途经: '}${p.name}</strong><br>
      ${p.address || ''}<br>
      <small>${p.description || ''}</small>${stayInfo}
    `);
  });

  if (fitBounds && latlngs.length > 0) {
    map.fitBounds(latlngs, { padding: [50, 50], maxZoom: 15 });
  }
}

// ══════════════════════════════════════════════════════
//  路线列表
// ══════════════════════════════════════════════════════

async function loadRoutes(keyword = '', category = '') {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (category) params.set('category', category);
  if (currentFilter === 'official') params.set('is_official', '1');
  if (currentFilter === 'user') params.set('is_official', '0');
  params.set('size', '50');

  const res = await fetch(`${API}/routes?${params}`);
  const data = await res.json();

  allRoutes = data.items;
  renderRouteList(data.items);
}

function renderRouteList(routes) {
  const container = document.getElementById('route-list');

  if (routes.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#88726d;">暂无路线</div>';
    return;
  }

  container.innerHTML = routes.map(r => `
    <div class="route-card${currentRoute && currentRoute.id === r.id ? ' selected' : ''}"
         onclick="selectRoute(${r.id})">
      <span class="badge ${r.is_official ? 'badge-official' : 'badge-user'}">${r.is_official ? '官方' : '用户'}</span>
      <div class="title">${r.title}</div>
      <div class="meta">
        <span>⏱ ${r.duration_min}分钟</span>
        <span>💰 ¥${r.budget_min}~¥${r.budget_max}</span>
        <span>📍 ${r.point_count}个点位</span>
        <span>📋 ${r.category}</span>
      </div>
    </div>
  `).join('');
}

async function selectRoute(id) {
  const res = await fetch(`${API}/routes/${id}`);
  if (!res.ok) return;
  currentRoute = await res.json();

  // 绘制地图
  drawRouteOnMap(currentRoute.points);

  // 显示详情面板
  showPanel('detail');
  document.getElementById('tab-detail').style.display = '';
  document.getElementById('tab-detail').classList.add('active');
  document.querySelectorAll('.tab').forEach(t => {
    if (t.dataset.tab !== 'detail') t.classList.remove('active');
  });
  document.getElementById('tab-detail').classList.add('active');

  renderDetail();
  renderRouteList(allRoutes);  // 刷新高亮
}

function renderDetail() {
  if (!currentRoute) return;
  const r = currentRoute;
  const container = document.getElementById('detail-content');

  container.innerHTML = `
    <span class="badge ${r.is_official ? 'badge-official' : 'badge-user'}">${r.is_official ? '官方路线' : '用户路线'}</span>
    <h3>${r.title}</h3>
    <p class="desc">${r.description}</p>
    <div class="stats">
      <span class="stat">⏱ ${r.duration_min} 分钟</span>
      <span class="stat">💰 ¥${r.budget_min} ~ ¥${r.budget_max}</span>
      <span class="stat">📋 ${r.category}</span>
      <span class="stat">📍 ${r.point_count} 个点位</span>
      ${r.crowd_tags.length ? `<span class="stat">👥 ${r.crowd_tags.join(', ')}</span>` : ''}
    </div>
    ${r.interest_tags.length ? `<div class="stats">${r.interest_tags.map(t => `<span class="stat">#${t}</span>`).join(' ')}</div>` : ''}
    <p class="points-title">🗺️ 路线点位（${r.points.length}）</p>
    ${r.points.map((p, i) => `
      <div class="detail-point">
        <div class="dot ${p.point_type || 'waypoint'}"></div>
        <div class="info">
          <div class="pname">${i + 1}. ${p.name} <small>— ${POINT_LABELS[p.point_type] || '途经'}</small></div>
          <div class="paddr">📍 ${p.address}</div>
          ${p.description ? `<div class="pdesc">${p.description}</div>` : ''}
          <div class="pstay">⏱ 建议停留 ${p.stay_minutes} 分钟</div>
        </div>
      </div>
    `).join('')}
    <div class="btn-row">
      <button class="btn-secondary" onclick="copyCurrentRoute()">📋 复刻此路线</button>
      ${!r.is_official ? `<button class="btn-danger" onclick="deleteCurrentRoute()">🗑 删除路线</button>` : ''}
    </div>
  `;

  // 渲染美团商户区域
  renderMeituanSection();
}

// ══════════════════════════════════════════════════════
//  美团商户模块
// ══════════════════════════════════════════════════════

function findNearbyMerchants(routePoints) {
  // 根据路线的点位名称匹配附近商户
  const pointNames = routePoints.map(p => p.name);
  const pointAreas = routePoints.map(p => {
    // 提取区域关键词
    const keywords = ['夫子庙', '秦淮河', '老门东', '南大', '鼓楼', '先锋书店',
      '丰富路', '颐和路', '明故宫', '博物院', '新街口', '玄武湖'];
    for (const kw of keywords) {
      if (p.name.includes(kw) || p.address.includes(kw)) return kw;
    }
    return null;
  }).filter(Boolean);

  // 匹配商户
  const matched = [];
  const seen = new Set();
  for (const m of MEITUAN_MERCHANTS) {
    if (seen.has(m.id)) continue;
    const isNearPoint = pointNames.some(n => m.near_point && m.near_point.includes(n));
    const isInArea = pointAreas.some(a => m.area.includes(a) || m.near_point.includes(a));
    if (isNearPoint || isInArea) {
      matched.push(m);
      seen.add(m.id);
    }
  }

  // 如果匹配太少，按区域补充
  const areaSet = new Set(pointAreas);
  for (const m of MEITUAN_MERCHANTS) {
    if (matched.length >= 7) break;
    if (seen.has(m.id)) continue;
    if (areaSet.has(m.area)) {
      matched.push(m);
      seen.add(m.id);
    }
  }

  return matched.slice(0, 10);
}

function renderMeituanSection() {
  if (!currentRoute || !currentRoute.points) return;
  const body = document.getElementById('meituan-body');
  const merchants = findNearbyMerchants(currentRoute.points);

  if (merchants.length === 0) {
    document.getElementById('meituan-section').style.display = 'none';
    return;
  }

  document.getElementById('meituan-section').style.display = '';
  body.innerHTML = merchants.map(m => `
    <div class="merchant-card">
      <div class="merchant-top">
        <span class="merchant-name">${m.name}</span>
        <span class="merchant-rating">⭐ ${m.rating}</span>
      </div>
      <div class="merchant-cat">${m.category}</div>
      <div class="merchant-info-row">
        <span class="merchant-phone">📞 ${m.phone}</span>
        <span class="merchant-hours">🕐 ${m.hours}</span>
      </div>
      <div class="merchant-addr">📍 ${m.address}</div>
      <div class="merchant-packages">
        ${m.packages.map(p => `
          <div class="pkg-item">
            <div class="pkg-header">
              <span class="pkg-name">${p.name}</span>
              <span class="pkg-price">¥${p.price}</span>
            </div>
            <div class="pkg-desc">${p.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // 默认收起
  body.style.display = 'none';
  document.querySelector('.meituan-arrow').textContent = '▸';
}

// Meituan toggle handler (added in DOMContentLoaded)

async function copyCurrentRoute() {
  if (!currentRoute) return;
  const res = await fetch(`${API}/routes/${currentRoute.id}/copy?user_id=local-user`, { method: 'POST' });
  if (res.ok) {
    const copy = await res.json();
    alert(`已复刻为: ${copy.title}`);
    await loadRoutes();
    selectRoute(copy.id);
  }
}

async function deleteCurrentRoute() {
  if (!currentRoute || !confirm(`确定删除「${currentRoute.title}」？`)) return;
  const res = await fetch(`${API}/routes/${currentRoute.id}`, { method: 'DELETE' });
  if (res.ok) {
    currentRoute = null;
    markersLayer.clearLayers();
    routeLine.clearLayers();
    showPanel('list');
    document.getElementById('tab-detail').style.display = 'none';
    await loadRoutes();
  }
}

// ══════════════════════════════════════════════════════
//  创建路线
// ══════════════════════════════════════════════════════

function enterCreateMode() {
  isCreating = true;
  editingPoints = [];
  editMarkers = [];
  markersLayer.clearLayers();
  routeLine.clearLayers();
  currentRoute = null;

  document.getElementById('mode-indicator').style.display = 'flex';
  document.getElementById('mode-text').textContent = '🗺️ 在地图上点击添加点位（自动排序：起点→途经→终点）';

  document.getElementById('create-form').reset();
  document.getElementById('create-category').value = '自定义';
  document.getElementById('create-duration').value = '120';
  document.getElementById('create-budget-min').value = '0';
  document.getElementById('create-budget-max').value = '200';
  renderPointList();

  // 监听地图点击
  map.on('click', onMapClick);
  map.getContainer().style.cursor = 'crosshair';
}

function exitCreateMode() {
  isCreating = false;
  editingPoints = [];
  editMarkers.forEach(m => markersLayer.removeLayer(m));
  editMarkers = [];
  map.off('click', onMapClick);
  map.getContainer().style.cursor = '';
  document.getElementById('mode-indicator').style.display = 'none';
}

function onMapClick(e) {
  if (!isCreating) return;

  const { lat, lng } = e.latlng;
  const index = editingPoints.length;
  const type = index === 0 ? 'start' : 'waypoint';

  const point = {
    name: `点位 ${index + 1}`,
    address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    latitude: lat,
    longitude: lng,
    sort_order: index,
    point_type: type,
    description: '',
    stay_minutes: 30,
    image_url: '',
  };

  editingPoints.push(point);

  // 在地图上添加临时标记
  const marker = L.marker([lat, lng], {
    icon: createMarkerIcon(type, index),
    draggable: true,
  }).addTo(markersLayer);

  marker.bindPopup(`<strong>${type === 'start' ? '起点' : `途经点 ${index}`}</strong><br>${lat.toFixed(4)}, ${lng.toFixed(4)}<br><small>可拖拽调整位置，右键删除</small>`);

  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    point.latitude = pos.lat;
    point.longitude = pos.lng;
    point.address = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
    redrawTempLine();
    renderPointList();
  });

  marker.on('contextmenu', (ev) => {
    const idx = editMarkers.indexOf(marker);
    if (idx >= 0) {
      editingPoints.splice(idx, 1);
      editMarkers[idx].remove();
      editMarkers.splice(idx, 1);
      markersLayer.removeLayer(ev.target);
      updatePointTypes();
      redrawTempLine();
      renderPointList();
    }
  });

  editMarkers.push(marker);

  // 更新终点标记
  if (editingPoints.length >= 2) {
    editingPoints[editingPoints.length - 1].point_type = 'end';
    // 把之前的终点改为途经点
    for (let i = 1; i < editingPoints.length - 1; i++) {
      editingPoints[i].point_type = 'waypoint';
    }
  }

  updateAllMarkerIcons();
  redrawTempLine();
  renderPointList();
}

function updatePointTypes() {
  if (editingPoints.length === 0) return;
  editingPoints.forEach((p, i) => {
    if (i === 0) p.point_type = 'start';
    else if (i === editingPoints.length - 1) p.point_type = 'end';
    else p.point_type = 'waypoint';
    p.sort_order = i;
  });
}

function updateAllMarkerIcons() {
  editMarkers.forEach((m, i) => {
    const type = editingPoints[i].point_type;
    m.setIcon(createMarkerIcon(type, i));
  });
}

function redrawTempLine() {
  routeLine.clearLayers();
  if (editingPoints.length >= 2) {
    const latlngs = editingPoints.map(p => [p.latitude, p.longitude]);
    L.polyline(latlngs, {
      color: '#9a442d',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 6',
    }).addTo(routeLine);
  }
}

function renderPointList() {
  const container = document.getElementById('point-list');
  if (editingPoints.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:#88726d;margin-top:8px;">尚未添加点位，在地图上点击开始添加</p>';
    return;
  }
  container.innerHTML = editingPoints.map((p, i) => `
    <div class="point-item">
      <div class="order ${p.point_type}">${i + 1}</div>
      <div class="info">
        <div class="name">${p.name} <small>— ${POINT_LABELS[p.point_type]}</small></div>
        <div class="coords">${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>
      </div>
      <div class="remove" onclick="removeEditPoint(${i})" title="移除">✕</div>
    </div>
  `).join('');
}

function removeEditPoint(index) {
  editingPoints.splice(index, 1);
  if (editMarkers[index]) {
    markersLayer.removeLayer(editMarkers[index]);
    editMarkers.splice(index, 1);
  }
  updatePointTypes();
  updateAllMarkerIcons();
  redrawTempLine();
  renderPointList();
}

async function submitCreateForm(e) {
  e.preventDefault();

  if (editingPoints.length < 2) {
    alert('请在地图上至少添加起点和终点两个点位');
    return;
  }

  const title = document.getElementById('create-title').value.trim();
  if (!title) { alert('请输入路线名称'); return; }

  const body = {
    title,
    description: document.getElementById('create-desc').value.trim(),
    category: document.getElementById('create-category').value,
    duration_min: parseInt(document.getElementById('create-duration').value) || 0,
    budget_min: parseFloat(document.getElementById('create-budget-min').value) || 0,
    budget_max: parseFloat(document.getElementById('create-budget-max').value) || 0,
    crowd_tags: document.getElementById('create-crowd').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    interest_tags: document.getElementById('create-tags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    is_public: document.getElementById('create-public').checked,
    user_id: 'local-user',
    points: editingPoints,
  };

  const res = await fetch(`${API}/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    alert('创建失败: ' + (err.detail || '未知错误'));
    return;
  }

  const created = await res.json();
  exitCreateMode();
  await loadRoutes();
  selectRoute(created.id);
  showPanel('list');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="list"]').classList.add('active');
  document.getElementById('tab-detail').style.display = 'none';
}

// ══════════════════════════════════════════════════════
//  面板切换
// ══════════════════════════════════════════════════════

function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.style.display = '';

  if (name === 'list') {
    document.getElementById('tab-detail').style.display = 'none';
  }
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => {
    if (t.dataset.tab === 'detail' && name !== 'detail') {
      t.style.display = 'none';
    }
    t.classList.remove('active');
  });

  if (name === 'detail') {
    document.getElementById('tab-detail').style.display = '';
    document.getElementById('tab-detail').classList.add('active');
  } else {
    const tab = document.querySelector(`[data-tab="${name}"]`);
    if (tab) tab.classList.add('active');
  }

  showPanel(name);

  if (name === 'create') {
    enterCreateMode();
  } else if (isCreating) {
    exitCreateMode();
  }

  if (name === 'list') {
    loadRoutes();
  }
}

// ══════════════════════════════════════════════════════
//  事件绑定
// ══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initMap();

  // 标签页切换
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // 筛选按钮
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      const keyword = document.getElementById('search-input').value;
      const category = document.getElementById('filter-category').value;
      loadRoutes(keyword, category);
    });
  });

  // 搜索
  document.getElementById('search-input').addEventListener('input', () => {
    const keyword = document.getElementById('search-input').value;
    const category = document.getElementById('filter-category').value;
    loadRoutes(keyword, category);
  });

  // 分类筛选
  document.getElementById('filter-category').addEventListener('change', () => {
    const keyword = document.getElementById('search-input').value;
    const category = document.getElementById('filter-category').value;
    loadRoutes(keyword, category);
  });

  // 创建表单提交
  document.getElementById('create-form').addEventListener('submit', submitCreateForm);

  // 取消按钮
  document.getElementById('mode-cancel').addEventListener('click', () => {
    exitCreateMode();
    showPanel('list');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="list"]').classList.add('active');
    document.getElementById('tab-detail').style.display = 'none';
    loadRoutes();
  });

  // 初始加载
  loadRoutes();

  // 美团商户区域展开/收起
  document.getElementById('meituan-header').addEventListener('click', () => {
    const body = document.getElementById('meituan-body');
    const arrow = document.querySelector('.meituan-arrow');
    if (body.style.display === 'none') {
      body.style.display = '';
      arrow.textContent = '▾';
    } else {
      body.style.display = 'none';
      arrow.textContent = '▸';
    }
  });
});
