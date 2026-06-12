## 图像定义

# === 角色位置变换 ===
transform sprite_pos:
    yalign 0.88         # 大立绘：角色腳部位置
    xalign 0.36         # 中間偏左
    zoom 0.80           # 縮放適配 2560x1440

transform sprite_pos_sway:
    yalign 0.88         # 大立绘 + 微妙左右浮动（备用）
    xalign 0.36
    zoom 0.80
    ease 2.5 xalign 0.39
    ease 2.5 xalign 0.33
    repeat

transform sprite_pos_road:
    yalign 0.97         # 路面位置：底部，不挡背景文字
    xalign 0.75         # 右侧路面上
    zoom 0.72           # 稍微缩小

transform sprite_small_pos:
    yalign 0.45         # 小立绘：偏上方（上半身）
    xalign 0.70         # 右側
    zoom 0.50           # 較小縮放

# === 核心背景 ===
image bg_beidalou = Transform("北大楼.png", xysize=(2560, 1440))                     # 北大楼前（开头背景）
image bg_beidalou_dusk = Transform("北大楼.png", xysize=(2560, 1440))                # 北大楼前（黄昏）
image bg_beidalou_twilight = Transform("北大楼.png", xysize=(2560, 1440))            # 北大楼前（暮色深浓）

# === 第一幕：1902 ===
image bg_1902_wasteland = Transform("三江师范学堂.png", xysize=(2560, 1440))          # 三江师范学堂（第一幕背景）

# === 第二幕：1960年代 ===
image bg_1960s_lab = Transform("实验室.png", xysize=(2560, 1440))                    # 秘密实验室（第二幕背景）

# === 第三幕：2026 ===
image bg_2026_campus = Transform("仙林校区.png", xysize=(2560, 1440))                # 现代仙林校区全景（第三幕背景）
image bg_2026_lawn = Transform("仙林校区.png", xysize=(2560, 1440))                  # 草坪/学生活动（第三幕背景）

# === 特殊场景图（人物+背景合成，显示时隐藏立绘）===
image bg_eye_open = Transform("睁眼抬头.png", xysize=(2560, 1440))
image bg_point_sanjiang = Transform("指向开始（指向三江师范）.png", xysize=(2560, 1440))
image bg_wutong_lookback = Transform("梧桐回首.png", xysize=(2560, 1440))
image bg_chengkaijia = Transform("程开甲.jpg", xysize=(2560, 1440))

# === 尾声 ===
image bg_wutong_avenue = Transform("仙林校区.png", xysize=(2560, 1440))              # 梧桐大道（CG尾声）

# === 过渡效果 ===
image black = Solid("#000000")
image white = Solid("#FFFFFF")

# === 南小鲸立绘 ===
image xiaojing = "叉腿.png"                          # 默认（站立/叉腿）
image xiaojing shy = "拘谨.png"                      # 沉静/肃穆/拘谨
image xiaojing smile = "大笑.png"                     # 大笑/俏皮
image xiaojing side = "挥手.png"                      # 挥手/打招呼
image xiaojing intro = "介绍.png"                     # 介绍/展示
image xiaojing reach = "拥抱.png"                     # 伸手（拥抱替代）

# === 南小鲸额外表情 ===
image xiaojing point = "介绍.png"                     # 指脸（介绍替代）
image xiaojing peace = "比耶.png"                     # 比耶/活泼
image xiaojing casual = "叉腿.png"                    # 随性/放松
image xiaojing surprise = "惊讶.png"                   # 惊讶
image xiaojing hug = "拥抱.png"                       # 拥抱

# === 南小鲸小立绘（上半身 / 可爱表情）===
image xiaojing cute1 = "可爱1.png"
image xiaojing cute2 = "可爱2.png"
image xiaojing cute3 = "可爱3.png"
image xiaojing cute4 = "可爱4.png"
