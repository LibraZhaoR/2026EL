"""
灵动金陵 - 路线数据库服务
独立的路线存储与管理 API，后续可集成到 Spring Boot 主项目中。

启动: python server.py
API 文档: http://localhost:8800/docs
"""

import sqlite3
import json
import os
from datetime import datetime
from contextlib import contextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List
import uvicorn

# ── 配置 ──────────────────────────────────────────────

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "data" / "routes.db"
STATIC_DIR = BASE_DIR / "static"

# ── FastAPI 应用 ──────────────────────────────────────

app = FastAPI(
    title="灵动金陵 · 路线数据库 API",
    description="存储官方路线与用户自定义路线，提供 CRUD 接口。后续可集成到 Spring Boot 主应用中。",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 数据库 ────────────────────────────────────────────

os.makedirs(BASE_DIR / "data", exist_ok=True)


@contextmanager
def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """初始化数据库表结构"""
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS routes (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                title           TEXT    NOT NULL,
                description     TEXT    DEFAULT '',
                category        TEXT    DEFAULT '自定义',   -- 文化 | 生活 | 美食 | 自定义
                duration_min    INTEGER DEFAULT 0,          -- 预估时长（分钟）
                budget_min      REAL    DEFAULT 0,
                budget_max      REAL    DEFAULT 0,
                crowd_tags      TEXT    DEFAULT '[]',       -- JSON 数组
                interest_tags   TEXT    DEFAULT '[]',       -- JSON 数组
                is_official     INTEGER DEFAULT 0,
                user_id         TEXT    DEFAULT NULL,
                is_public       INTEGER DEFAULT 0,
                copy_count      INTEGER DEFAULT 0,
                cover_url       TEXT    DEFAULT '',
                created_at      TEXT    DEFAULT (datetime('now','localtime')),
                updated_at      TEXT    DEFAULT (datetime('now','localtime'))
            );

            CREATE TABLE IF NOT EXISTS route_points (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                route_id        INTEGER NOT NULL,
                name            TEXT    NOT NULL,
                address         TEXT    DEFAULT '',
                latitude        REAL    NOT NULL,
                longitude       REAL    NOT NULL,
                sort_order      INTEGER NOT NULL DEFAULT 0,
                point_type      TEXT    DEFAULT 'waypoint',  -- start | waypoint | end
                description     TEXT    DEFAULT '',
                stay_minutes    INTEGER DEFAULT 30,
                image_url       TEXT    DEFAULT '',
                FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_route_points_route
                ON route_points(route_id, sort_order);
        """)


def seed_official_routes():
    """导入 4 条官方路线种子数据（仅在数据库为空时执行）"""
    with get_db() as conn:
        count = conn.execute("SELECT COUNT(*) FROM routes").fetchone()[0]
        if count > 0:
            return  # 已有数据，跳过

        routes_data = [
            {
                "title": "南大新生校史线：从三江师范到今天",
                "description": "从三江师范学堂到今日南大，校园承载百年学术记忆。适合新生报到、校友返校、访校同学。",
                "category": "文化",
                "duration_min": 150,
                "budget_min": 0,
                "budget_max": 50,
                "crowd_tags": json.dumps(["南大新生", "访校同学", "校友"], ensure_ascii=False),
                "interest_tags": json.dumps(["学校教育", "校史", "二次元向导"], ensure_ascii=False),
                "is_official": 1,
                "is_public": 1,
                "points": [
                    {"name": "南京大学鼓楼校区", "address": "南京市鼓楼区汉口路22号", "lat": 32.056, "lng": 118.779,
                     "sort": 0, "type": "start", "desc": "南大历史体验起点", "stay": 30},
                    {"name": "北大楼", "address": "南京大学鼓楼校区内", "lat": 32.057, "lng": 118.779,
                     "sort": 1, "type": "waypoint", "desc": "校史标志建筑，1919年建成", "stay": 20},
                    {"name": "校史博物馆", "address": "南京大学鼓楼校区内", "lat": 32.055, "lng": 118.778,
                     "sort": 2, "type": "end", "desc": "了解从三江师范到今天的完整校史", "stay": 40},
                ],
            },
            {
                "title": "金陵夜游线：秦淮河→夫子庙→老门东",
                "description": "夜泊秦淮近酒家。从秦淮河画舫到夫子庙灯影，再漫步老门东巷弄，感受金陵夜色的千年繁华。",
                "category": "文化",
                "duration_min": 210,
                "budget_min": 80,
                "budget_max": 200,
                "crowd_tags": json.dumps(["第一次来南京", "情侣", "朋友聚会"], ensure_ascii=False),
                "interest_tags": json.dumps(["景点", "夜游", "剧情任务"], ensure_ascii=False),
                "is_official": 1,
                "is_public": 1,
                "points": [
                    {"name": "秦淮河画舫码头", "address": "南京市秦淮区夫子庙秦淮河畔", "lat": 32.020, "lng": 118.788,
                     "sort": 0, "type": "start", "desc": "乘画舫夜游秦淮，灯影桨声", "stay": 40},
                    {"name": "夫子庙", "address": "南京市秦淮区贡院街", "lat": 32.021, "lng": 118.789,
                     "sort": 1, "type": "waypoint", "desc": "夜游核心点位，大成殿与学宫", "stay": 60},
                    {"name": "老门东", "address": "南京市秦淮区剪子巷", "lat": 32.012, "lng": 118.791,
                     "sort": 2, "type": "end", "desc": "老城南街区，美食与文创收尾", "stay": 60},
                ],
            },
            {
                "title": "午后餐茶线：小吃→咖啡→书店→散步",
                "description": "把下午慢慢花掉：从小吃街的热闹出发，钻进咖啡馆发呆，再走进书店和梧桐小径。",
                "category": "生活",
                "duration_min": 120,
                "budget_min": 50,
                "budget_max": 150,
                "crowd_tags": json.dumps(["一个人闲逛", "朋友聊天", "轻松约会"], ensure_ascii=False),
                "interest_tags": json.dumps(["美食", "咖啡", "书店"], ensure_ascii=False),
                "is_official": 1,
                "is_public": 1,
                "points": [
                    {"name": "丰富路小吃街", "address": "南京市秦淮区丰富路", "lat": 32.036, "lng": 118.782,
                     "sort": 0, "type": "start", "desc": "鸭血粉丝汤、锅贴，从味蕾开始午后", "stay": 30},
                    {"name": "先锋书店（五台山）", "address": "南京市鼓楼区广州路173号", "lat": 32.048, "lng": 118.776,
                     "sort": 1, "type": "waypoint", "desc": "地下车库改造的最美书店", "stay": 45},
                    {"name": "颐和路梧桐小径", "address": "南京市鼓楼区颐和路", "lat": 32.051, "lng": 118.773,
                     "sort": 2, "type": "end", "desc": "梧桐树影下散步收尾", "stay": 30},
                ],
            },
            {
                "title": "博物馆展览线：南博→明故宫遗址",
                "description": "安静地和旧物对话。从南京博物院的历史馆出发，再到明故宫遗址，补足半日文化路线。",
                "category": "文化",
                "duration_min": 240,
                "budget_min": 30,
                "budget_max": 120,
                "crowd_tags": json.dumps(["展览爱好者", "南大新生", "周末出行"], ensure_ascii=False),
                "interest_tags": json.dumps(["博物馆展览", "科技馆", "预约提醒"], ensure_ascii=False),
                "is_official": 1,
                "is_public": 1,
                "points": [
                    {"name": "南京博物院", "address": "南京市玄武区中山东路321号", "lat": 32.040, "lng": 118.830,
                     "sort": 0, "type": "start", "desc": "历史馆→民国馆→特展馆，建议提前预约", "stay": 120},
                    {"name": "明故宫遗址公园", "address": "南京市玄武区中山东路", "lat": 32.039, "lng": 118.817,
                     "sort": 1, "type": "end", "desc": "午门遗址与遗址展示，安静收尾", "stay": 60},
                ],
            },
        ]

        for r in routes_data:
            points = r.pop("points")
            cur = conn.execute(
                """INSERT INTO routes (title, description, category, duration_min, budget_min, budget_max,
                   crowd_tags, interest_tags, is_official, is_public)
                   VALUES (:title, :description, :category, :duration_min, :budget_min, :budget_max,
                   :crowd_tags, :interest_tags, :is_official, :is_public)""",
                r,
            )
            route_id = cur.lastrowid
            for p in points:
                conn.execute(
                    """INSERT INTO route_points (route_id, name, address, latitude, longitude, sort_order,
                       point_type, description, stay_minutes)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    [route_id, p["name"], p["address"], p["lat"], p["lng"],
                     p["sort"], p["type"], p["desc"], p["stay"]],
                )


# ── Pydantic 模型 ─────────────────────────────────────

class RoutePointBase(BaseModel):
    name: str = Field(..., description="点位名称")
    address: str = Field("", description="地址")
    latitude: float = Field(..., ge=-90, le=90, description="纬度")
    longitude: float = Field(..., ge=-180, le=180, description="经度")
    sort_order: int = Field(0, description="排序序号")
    point_type: str = Field("waypoint", description="点位类型: start / waypoint / end")
    description: str = Field("", description="点位描述")
    stay_minutes: int = Field(30, ge=0, description="建议停留时长(分钟)")
    image_url: str = Field("", description="图片URL")


class RoutePointOut(RoutePointBase):
    id: int


class RouteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="路线标题")
    description: str = Field("", description="路线描述")
    category: str = Field("自定义", description="分类")
    duration_min: int = Field(0, ge=0, description="预估时长(分钟)")
    budget_min: float = Field(0, ge=0, description="最低预算")
    budget_max: float = Field(0, ge=0, description="最高预算")
    crowd_tags: List[str] = Field(default_factory=list, description="适合人群标签")
    interest_tags: List[str] = Field(default_factory=list, description="兴趣标签")
    user_id: Optional[str] = Field(None, description="创建者ID")
    is_public: bool = Field(False, description="是否公开")
    cover_url: str = Field("", description="封面图URL")
    points: List[RoutePointBase] = Field(default_factory=list, description="路线点位列表")


class RouteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    duration_min: Optional[int] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    crowd_tags: Optional[List[str]] = None
    interest_tags: Optional[List[str]] = None
    is_public: Optional[bool] = None
    cover_url: Optional[str] = None


class RouteOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    duration_min: int
    budget_min: float
    budget_max: float
    crowd_tags: List[str]
    interest_tags: List[str]
    is_official: bool
    user_id: Optional[str]
    is_public: bool
    copy_count: int
    cover_url: str
    point_count: int
    created_at: str
    updated_at: str


class RouteDetailOut(RouteOut):
    points: List[RoutePointOut]


class RouteListOut(BaseModel):
    total: int
    items: List[RouteOut]


class ApiResult(BaseModel):
    success: bool = True
    message: str = "ok"
    data: Optional[dict] = None


# ── 辅助函数 ─────────────────────────────────────────

def row_to_route(row, point_count: int = 0) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "category": row["category"],
        "duration_min": row["duration_min"],
        "budget_min": row["budget_min"],
        "budget_max": row["budget_max"],
        "crowd_tags": json.loads(row["crowd_tags"] or "[]"),
        "interest_tags": json.loads(row["interest_tags"] or "[]"),
        "is_official": bool(row["is_official"]),
        "user_id": row["user_id"],
        "is_public": bool(row["is_public"]),
        "copy_count": row["copy_count"],
        "cover_url": row["cover_url"],
        "point_count": point_count,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def row_to_point(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "address": row["address"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "sort_order": row["sort_order"],
        "point_type": row["point_type"],
        "description": row["description"],
        "stay_minutes": row["stay_minutes"],
        "image_url": row["image_url"],
    }


# ══════════════════════════════════════════════════════
#  API 路由
# ══════════════════════════════════════════════════════

# ── 路线列表 ──────────────────────────────────────────

@app.get("/api/routes", response_model=RouteListOut, tags=["路线"])
def list_routes(
    category: Optional[str] = Query(None, description="分类筛选"),
    is_official: Optional[int] = Query(None, description="是否官方: 1=官方, 0=用户"),
    user_id: Optional[str] = Query(None, description="按用户ID筛选"),
    keyword: Optional[str] = Query(None, description="标题搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
):
    """获取路线列表，支持分类、官方/用户、关键词筛选"""
    conditions = []
    params = []

    if category:
        conditions.append("category = ?")
        params.append(category)
    if is_official is not None:
        conditions.append("is_official = ?")
        params.append(is_official)
    if user_id:
        conditions.append("user_id = ?")
        params.append(user_id)
    if keyword:
        conditions.append("title LIKE ?")
        params.append(f"%{keyword}%")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    with get_db() as conn:
        total = conn.execute(
            f"SELECT COUNT(*) FROM routes {where}", params
        ).fetchone()[0]

        rows = conn.execute(
            f"""SELECT r.*, (SELECT COUNT(*) FROM route_points WHERE route_id = r.id) AS pc
                FROM routes r {where}
                ORDER BY r.is_official DESC, r.created_at DESC
                LIMIT ? OFFSET ?""",
            params + [size, (page - 1) * size],
        ).fetchall()

        items = [row_to_route(r, r["pc"]) for r in rows]

    return {"total": total, "items": items}


# ── 官方路线 ──────────────────────────────────────────

@app.get("/api/routes/official", response_model=List[RouteDetailOut], tags=["路线"])
def list_official_routes():
    """获取全部官方路线（含点位详情），用于首页展示"""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT r.*, (SELECT COUNT(*) FROM route_points WHERE route_id = r.id) AS pc
               FROM routes r WHERE r.is_official = 1
               ORDER BY r.id""",
        ).fetchall()

        result = []
        for r in rows:
            route = row_to_route(r, r["pc"])
            pts = conn.execute(
                "SELECT * FROM route_points WHERE route_id = ? ORDER BY sort_order",
                [r["id"]],
            ).fetchall()
            route["points"] = [row_to_point(p) for p in pts]
            result.append(route)

    return result


# ── 路线详情 ──────────────────────────────────────────

@app.get("/api/routes/{route_id}", response_model=RouteDetailOut, tags=["路线"])
def get_route(route_id: int):
    """获取单条路线详情（含全部点位）"""
    with get_db() as conn:
        r = conn.execute("SELECT * FROM routes WHERE id = ?", [route_id]).fetchone()
        if not r:
            raise HTTPException(404, "路线不存在")

        pts = conn.execute(
            "SELECT * FROM route_points WHERE route_id = ? ORDER BY sort_order",
            [route_id],
        ).fetchall()

        point_count = len(pts)
        route = row_to_route(r, point_count)
        route["points"] = [row_to_point(p) for p in pts]

    return route


# ── 创建路线 ──────────────────────────────────────────

@app.post("/api/routes", response_model=RouteDetailOut, status_code=201, tags=["路线"])
def create_route(body: RouteCreate):
    """创建新路线（含点位）。用户上传路线用此接口。"""
    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO routes (title, description, category, duration_min, budget_min, budget_max,
               crowd_tags, interest_tags, is_official, user_id, is_public, cover_url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)""",
            [
                body.title, body.description, body.category,
                body.duration_min, body.budget_min, body.budget_max,
                json.dumps(body.crowd_tags, ensure_ascii=False),
                json.dumps(body.interest_tags, ensure_ascii=False),
                body.user_id, int(body.is_public), body.cover_url,
            ],
        )
        route_id = cur.lastrowid

        points_out = []
        for p in body.points:
            cur2 = conn.execute(
                """INSERT INTO route_points (route_id, name, address, latitude, longitude,
                   sort_order, point_type, description, stay_minutes, image_url)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                [route_id, p.name, p.address, p.latitude, p.longitude,
                 p.sort_order, p.point_type, p.description, p.stay_minutes, p.image_url],
            )
            points_out.append(RoutePointOut(
                id=cur2.lastrowid, **p.model_dump(),
            ))

    return get_route(route_id)


# ── 更新路线 ──────────────────────────────────────────

@app.put("/api/routes/{route_id}", response_model=RouteDetailOut, tags=["路线"])
def update_route(route_id: int, body: RouteUpdate):
    """更新路线基本信息（不含点位）"""
    updates = {}
    if body.title is not None:
        updates["title"] = body.title
    if body.description is not None:
        updates["description"] = body.description
    if body.category is not None:
        updates["category"] = body.category
    if body.duration_min is not None:
        updates["duration_min"] = body.duration_min
    if body.budget_min is not None:
        updates["budget_min"] = body.budget_min
    if body.budget_max is not None:
        updates["budget_max"] = body.budget_max
    if body.crowd_tags is not None:
        updates["crowd_tags"] = json.dumps(body.crowd_tags, ensure_ascii=False)
    if body.interest_tags is not None:
        updates["interest_tags"] = json.dumps(body.interest_tags, ensure_ascii=False)
    if body.is_public is not None:
        updates["is_public"] = int(body.is_public)
    if body.cover_url is not None:
        updates["cover_url"] = body.cover_url

    if not updates:
        raise HTTPException(400, "没有需要更新的字段")

    updates["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with get_db() as conn:
        r = conn.execute("SELECT * FROM routes WHERE id = ?", [route_id]).fetchone()
        if not r:
            raise HTTPException(404, "路线不存在")

        set_clause = ", ".join(f"{k} = :{k}" for k in updates)
        conn.execute(
            f"UPDATE routes SET {set_clause} WHERE id = :id",
            {**updates, "id": route_id},
        )

    return get_route(route_id)


# ── 删除路线 ──────────────────────────────────────────

@app.delete("/api/routes/{route_id}", tags=["路线"])
def delete_route(route_id: int):
    """删除路线（级联删除所有点位）"""
    with get_db() as conn:
        r = conn.execute("SELECT * FROM routes WHERE id = ?", [route_id]).fetchone()
        if not r:
            raise HTTPException(404, "路线不存在")
        conn.execute("DELETE FROM routes WHERE id = ?", [route_id])
    return {"success": True, "message": f"路线「{r['title']}」已删除"}


# ── 复刻路线 ──────────────────────────────────────────

@app.post("/api/routes/{route_id}/copy", response_model=RouteDetailOut, status_code=201, tags=["路线"])
def copy_route(route_id: int, user_id: Optional[str] = Query(None)):
    """复刻一条路线为「我的版本」"""
    with get_db() as conn:
        src = conn.execute("SELECT * FROM routes WHERE id = ?", [route_id]).fetchone()
        if not src:
            raise HTTPException(404, "原路线不存在")

        # 复制路线
        cur = conn.execute(
            """INSERT INTO routes (title, description, category, duration_min, budget_min, budget_max,
               crowd_tags, interest_tags, is_official, user_id, is_public, copy_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, 0)""",
            [
                f"{src['title']}（我的复刻版）",
                f"基于「{src['title']}」复刻\n{src['description']}",
                src["category"], src["duration_min"], src["budget_min"], src["budget_max"],
                src["crowd_tags"], src["interest_tags"], user_id,
            ],
        )
        new_id = cur.lastrowid

        # 复制点位
        pts = conn.execute(
            "SELECT * FROM route_points WHERE route_id = ? ORDER BY sort_order",
            [route_id],
        ).fetchall()
        for p in pts:
            conn.execute(
                """INSERT INTO route_points (route_id, name, address, latitude, longitude,
                   sort_order, point_type, description, stay_minutes, image_url)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                [new_id, p["name"], p["address"], p["latitude"], p["longitude"],
                 p["sort_order"], p["point_type"], p["description"], p["stay_minutes"], p["image_url"]],
            )

        # 更新原路线的复刻计数
        conn.execute("UPDATE routes SET copy_count = copy_count + 1 WHERE id = ?", [route_id])

    return get_route(new_id)


# ── 点位管理 ──────────────────────────────────────────

@app.post("/api/routes/{route_id}/points", response_model=RouteDetailOut, tags=["点位"])
def add_point(route_id: int, body: RoutePointBase):
    """向路线添加一个点位"""
    with get_db() as conn:
        r = conn.execute("SELECT id FROM routes WHERE id = ?", [route_id]).fetchone()
        if not r:
            raise HTTPException(404, "路线不存在")

        conn.execute(
            """INSERT INTO route_points (route_id, name, address, latitude, longitude,
               sort_order, point_type, description, stay_minutes, image_url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            [route_id, body.name, body.address, body.latitude, body.longitude,
             body.sort_order, body.point_type, body.description, body.stay_minutes, body.image_url],
        )
        conn.execute(
            "UPDATE routes SET updated_at = ? WHERE id = ?",
            [datetime.now().strftime("%Y-%m-%d %H:%M:%S"), route_id],
        )

    return get_route(route_id)


class ReorderRequest(BaseModel):
    point_ids: List[int] = Field(..., description="按新顺序排列的点位ID列表")

@app.put("/api/routes/{route_id}/points/reorder", response_model=RouteDetailOut, tags=["点位"])
def reorder_points(route_id: int, body: ReorderRequest):
    """重新排序路线点位"""
    with get_db() as conn:
        r = conn.execute("SELECT id FROM routes WHERE id = ?", [route_id]).fetchone()
        if not r:
            raise HTTPException(404, "路线不存在")

        for idx, pid in enumerate(body.point_ids):
            conn.execute(
                "UPDATE route_points SET sort_order = ? WHERE id = ? AND route_id = ?",
                [idx, pid, route_id],
            )
        conn.execute(
            "UPDATE routes SET updated_at = ? WHERE id = ?",
            [datetime.now().strftime("%Y-%m-%d %H:%M:%S"), route_id],
        )

    return get_route(route_id)


@app.delete("/api/routes/{route_id}/points/{point_id}", response_model=RouteDetailOut, tags=["点位"])
def delete_point(route_id: int, point_id: int):
    """删除路线中的一个点位"""
    with get_db() as conn:
        p = conn.execute(
            "SELECT * FROM route_points WHERE id = ? AND route_id = ?",
            [point_id, route_id],
        ).fetchone()
        if not p:
            raise HTTPException(404, "点位不存在")

        conn.execute("DELETE FROM route_points WHERE id = ?", [point_id])
        conn.execute(
            "UPDATE routes SET updated_at = ? WHERE id = ?",
            [datetime.now().strftime("%Y-%m-%d %H:%M:%S"), route_id],
        )

    return get_route(route_id)


# ── 健康检查 ──────────────────────────────────────────

@app.get("/api/health", tags=["系统"])
def health():
    with get_db() as conn:
        route_count = conn.execute("SELECT COUNT(*) FROM routes").fetchone()[0]
        point_count = conn.execute("SELECT COUNT(*) FROM route_points").fetchone()[0]
    return {
        "status": "ok",
        "version": "1.0.0",
        "route_count": route_count,
        "point_count": point_count,
    }


# ── 静态文件 & 首页 ───────────────────────────────────

@app.get("/", tags=["页面"])
def index():
    """跳转到地图页面"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse("/static/index.html")


# 必须在最后挂载静态文件
app.mount("/static", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")


# ══════════════════════════════════════════════════════
#  启动入口
# ══════════════════════════════════════════════════════

if __name__ == "__main__":
    init_db()
    seed_official_routes()
    print("\n  == Lingdong Jinling · Route DB ==")
    print("  API Docs: http://localhost:8800/docs")
    print("  Map Page: http://localhost:8800/\n")
    uvicorn.run(app, host="0.0.0.0", port=8800, log_level="info")
