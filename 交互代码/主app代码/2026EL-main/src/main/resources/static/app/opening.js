/* ═══════════════════════════════════════
   南京水墨游记 — 3D 水墨长卷开篇
   Three.js 分层场景 + Canvas 墨迹 + GSAP 动画
   ═══════════════════════════════════════ */

// ── Config ──
const SCENES = 5;
const SCENE_SPACING = 10;        // world units between scene centers
const CAMERA_Z = 10;
const FRUSTUM_H = 8;
const INTRO_DURATION = 2.0;       // seconds for ink-drop intro
const TRANSITION_DURATION = 0.8;  // seconds for seal→app transition
const SCROLL_SMOOTH = 0.08;       // camera lerp factor
const MAX_PARTICLES = 120;

// ── DOM ──
const openingPage = document.getElementById("opening-page");
const threeCanvas = document.getElementById("three-canvas");
const inkCanvas = document.getElementById("ink-canvas");
const inkCtx = inkCanvas.getContext("2d");
const sceneTexts = document.querySelectorAll(".scene-text");
const sceneDots = document.querySelectorAll(".scene-dots i");
const scrollHint = document.getElementById("scroll-hint");
const sealBtn = document.getElementById("seal-btn");

// ── State ──
let W, H, aspect, frustumW;
let scrollTarget = 0;        // target scroll position (world x)
let scrollCurrent = 0;       // smoothed scroll position
let scrollProgress = 0;      // 0..1 across all scenes
let currentScene = 0;
let introPhase = "waiting";  // "waiting" | "ink-drop" | "ink-spread" | "done"
let introTimer = 0;
let introInkRadius = 0;
let allScenesViewed = false;
let sealShown = false;
let transitioning = false;
let transitionTimer = 0;
let transitionRipple = 0;
let mouseX = 0, mouseY = 0;  // normalized -0.5..0.5
let isDragging = false;
let dragStartX = 0;
let dragStartScroll = 0;

// ── Three.js Setup ──
let scene, camera, renderer;
let groundPlane, mistPlanes = [], inkParticles;
let sceneGroups = [];
let mountainGroup;

function setupThree() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xF4EFE6);
    renderer.shadowMap.enabled = false;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xF4EFE6, 15, 50);

    // Camera — orthographic for scroll-like feel
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(0, 1.5, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0xf8f5f0, 0.7);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xfffaf0, 0.6);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    const hemiLight = new THREE.HemisphereLight(0xf0ebe0, 0xc8c0b0, 0.4);
    scene.add(hemiLight);

    // Build scene elements
    createGround();
    createMountains();
    createSceneGroups();
    createMist();
    createInkParticles();
}

function updateCamera() {
    const h = FRUSTUM_H;
    aspect = W / H;
    frustumW = h * aspect;
    camera.left = -frustumW / 2;
    camera.right = frustumW / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
}

// ── Ground ──
function createGround() {
    const geo = new THREE.PlaneGeometry(100, 40);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xF0EBE0,
        roughness: 0.95,
        metalness: 0
    });
    groundPlane = new THREE.Mesh(geo, mat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -3;
    scene.add(groundPlane);
}

// ── Distant Mountains ──
function createMountains() {
    mountainGroup = new THREE.Group();
    const mountainDefs = [
        { x: -8, y: -1.2, z: -8, w: 14, h: 3.5 },
        { x: 3, y: -1.0, z: -9, w: 18, h: 4.2 },
        { x: 15, y: -1.1, z: -8.5, w: 16, h: 3.8 },
        { x: 28, y: -1.3, z: -9, w: 20, h: 4.5 },
        { x: 40, y: -1.0, z: -8, w: 14, h: 3.2 },
        { x: 52, y: -1.2, z: -9, w: 16, h: 3.8 },
    ];

    mountainDefs.forEach(def => {
        const shape = new THREE.Shape();
        const hw = def.w / 2;
        shape.moveTo(-hw, 0);
        // Create a jagged mountain profile
        const segments = 8;
        for (let i = 1; i < segments; i++) {
            const x = -hw + (def.w * i) / segments;
            const yOff = (i > 1 && i < segments - 1) ? Math.random() * def.h * 0.4 : 0;
            const y = Math.sin((i / segments) * Math.PI) * def.h + yOff;
            shape.lineTo(x, y);
        }
        shape.lineTo(hw, 0);
        shape.closePath();

        const geo = new THREE.ShapeGeometry(shape);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xc8c0b4,
            roughness: 0.9,
            metalness: 0,
            transparent: true,
            opacity: 0.7
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(def.x, def.y, def.z);
        mountainGroup.add(mesh);
    });
    scene.add(mountainGroup);
}

// ── Helper: Create a simple tree ──
function createTree(x, y, z, scale) {
    const group = new THREE.Group();
    const s = scale || 1;

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.08 * s, 0.1 * s, 1.2 * s, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a38, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.6 * s;
    group.add(trunk);

    // Canopy layers
    for (let i = 0; i < 3; i++) {
        const r = (0.5 - i * 0.1) * s;
        const h = (0.7 - i * 0.05) * s;
        const canopyGeo = new THREE.ConeGeometry(r, h, 8);
        const canopyMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.22 + i * 0.03, 0.3, 0.25 + i * 0.08),
            roughness: 0.85
        });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.y = 1.1 * s + i * 0.4 * s;
        group.add(canopy);
    }

    group.position.set(x, y, z);
    return group;
}

// ── Helper: Create building with traditional roof ──
function createBuilding(x, y, z, w, h, d, roofColor, wallColor) {
    const group = new THREE.Group();

    // Walls
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor || 0x3a3632, roughness: 0.85 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = h / 2;
    group.add(wall);

    // Roof — flared traditional shape
    const roofH = h * 0.45;
    const roofOverhang = w * 0.12;
    const roofW = w + roofOverhang * 2;
    const roofD = d + roofOverhang * 2;

    const roofShape = new THREE.Shape();
    roofShape.moveTo(-roofW / 2, 0);
    // Curved roof profile
    const pts = 6;
    for (let i = 1; i < pts; i++) {
        const px = -roofW / 2 + (roofW * i) / pts;
        const t = i / pts;
        const curve = Math.sin(t * Math.PI) * roofH;
        const sag = t < 0.5 ? -0.15 * roofH * (1 - t * 2) : -0.15 * roofH * ((t - 0.5) * 2);
        roofShape.lineTo(px, curve + sag);
    }
    roofShape.lineTo(roofW / 2, 0);
    roofShape.closePath();

    const extrudeSettings = { steps: 1, depth: roofD, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 };
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    roofGeo.translate(0, 0, -roofD / 2);
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor || 0x3a322a, roughness: 0.8, metalness: 0.05 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h;
    group.add(roof);

    group.position.set(x, y, z);
    return group;
}

// ── Helper: Lantern ──
function createLantern(x, y, z, s) {
    const group = new THREE.Group();
    const scale = s || 1;

    const bodyGeo = new THREE.SphereGeometry(0.18 * scale, 8, 6);
    bodyGeo.scale(1, 1.3, 1);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xc84030,
        roughness: 0.5,
        emissive: 0x401010,
        emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Wire/pole
    const wireGeo = new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 0.8 * scale, 4);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x5a4a38, roughness: 0.9 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.y = 0.5 * scale;
    group.add(wire);

    group.position.set(x, y, z);
    return group;
}

// ── Build Scene Groups (one per scene) ──
function createSceneGroups() {
    for (let i = 0; i < SCENES; i++) {
        const group = new THREE.Group();
        group.position.x = i * SCENE_SPACING;
        scene.add(group);
        sceneGroups.push(group);
    }

    // Scene 0: 梧桐大道 — rows of trees
    const g0 = sceneGroups[0];
    for (let row = -1; row <= 1; row += 2) {
        for (let t = -3; t <= 3; t++) {
            const tx = t * 1.2 + (Math.random() - 0.5) * 0.4;
            const tz = row * 2.5 + (Math.random() - 0.5) * 0.6;
            const s = 0.7 + Math.random() * 1.0;
            g0.add(createTree(tx, -0.5, tz, s));
        }
    }
    // Path suggestion
    const pathGeo = new THREE.PlaneGeometry(7, 1.2);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.9 });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.01;
    g0.add(path);

    // Scene 1: 南大北大楼
    const g1 = sceneGroups[1];
    const bldg = createBuilding(0, 0, 0, 3.2, 2.8, 2.0, 0x3a3228, 0x4a4238);
    bldg.position.y = -0.3;
    g1.add(bldg);
    // Columns
    for (let c = -1; c <= 1; c += 2) {
        const colGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.2, 8);
        const colMat = new THREE.MeshStandardMaterial({ color: 0x5a5248, roughness: 0.85 });
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(c * 0.9, 1.0, 1.05);
        g1.add(col);
    }
    // Framing trees
    g1.add(createTree(-3, -0.5, 1.5, 1.1));
    g1.add(createTree(3.2, -0.5, 1.3, 0.9));
    g1.add(createTree(-2.5, -0.5, -2, 0.8));

    // Scene 2: 秦淮河
    const g2 = sceneGroups[2];
    // River
    const riverGeo = new THREE.PlaneGeometry(8, 2.5);
    const riverMat = new THREE.MeshStandardMaterial({
        color: 0x5a6878,
        roughness: 0.4,
        metalness: 0.2,
        transparent: true,
        opacity: 0.6
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, 0.02, 1.5);
    g2.add(river);
    // Bridge arch
    const bridgeGeo = new THREE.TorusGeometry(1.6, 0.15, 8, 12, Math.PI);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x5a5040, roughness: 0.8 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(0, 1.1, 0.8);
    bridge.rotation.y = Math.PI / 2;
    bridge.rotation.z = 0;
    g2.add(bridge);
    // Buildings on far side
    const b2a = createBuilding(-2.5, 0.2, -1.5, 1.8, 1.8, 1.4, 0x3a3028, 0x4a4038);
    g2.add(b2a);
    const b2b = createBuilding(2.8, 0.2, -1.3, 2.0, 2.2, 1.6, 0x3a3028, 0x484038);
    g2.add(b2b);
    // Lanterns
    g2.add(createLantern(-1.2, 2.2, 0.6, 1));
    g2.add(createLantern(1.3, 2.2, 0.6, 1));
    g2.add(createLantern(-2.2, 1.8, -0.2, 0.8));
    g2.add(createLantern(2.4, 2.0, -0.1, 0.9));

    // Scene 3: 老门东 — shop houses along a street
    const g3 = sceneGroups[3];
    for (let side = -1; side <= 1; side += 2) {
        for (let s = 0; s < 4; s++) {
            const sx = -2.5 + s * 1.6 + (Math.random() - 0.5) * 0.3;
            const sz = side * (1.8 + Math.random() * 0.8);
            const sw = 1.2 + Math.random() * 0.6;
            const sh = 1.6 + Math.random() * 1.2;
            const sd = 1.0 + Math.random() * 0.5;
            const shop = createBuilding(sx, -0.2, sz, sw, sh, sd, 0x3a3028, 0x524838);
            g3.add(shop);
        }
    }
    // Street lanterns
    for (let l = -2; l <= 2; l++) {
        g3.add(createLantern(l * 1.5, 1.8, 0, 0.9));
    }
    // Street surface
    const streetGeo = new THREE.PlaneGeometry(7, 3);
    const streetMat = new THREE.MeshStandardMaterial({ color: 0xddd5c8, roughness: 0.9 });
    const street = new THREE.Mesh(streetGeo, streetMat);
    street.rotation.x = -Math.PI / 2;
    street.position.y = 0.01;
    g3.add(street);

    // Scene 4: 南京博物院 — grand wide building
    const g4 = sceneGroups[4];
    const museum = createBuilding(0, 0, 0, 5.5, 2.4, 2.8, 0x3a3228, 0x4a4238);
    museum.position.y = -0.3;
    g4.add(museum);
    // Plaza
    const plazaGeo = new THREE.PlaneGeometry(6, 3);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.85 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.01, 2);
    g4.add(plaza);
    // Columns
    for (let c = -2; c <= 2; c++) {
        const colGeo = new THREE.CylinderGeometry(0.1, 0.12, 2.0, 8);
        const colMat = new THREE.MeshStandardMaterial({ color: 0x5a5248, roughness: 0.85 });
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(c * 0.9, 0.9, 1.45);
        g4.add(col);
    }
    // Side trees
    g4.add(createTree(-4, -0.5, 1, 0.9));
    g4.add(createTree(4.2, -0.5, 0.8, 1.0));
}

// ── Mist Planes ──
function createMist() {
    for (let i = 0; i < 5; i++) {
        const geo = new THREE.PlaneGeometry(20, 6);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xF4EFE6,
            transparent: true,
            opacity: 0.15 + i * 0.04,
            depthWrite: false
        });
        const plane = new THREE.Mesh(geo, mat);
        plane.position.set(i * 8 - 6, 2.5 - i * 0.8, 2 + i * 0.5);
        plane.renderOrder = 1;
        scene.add(plane);
        mistPlanes.push(plane);
    }
}

// ── Floating Ink Particles ──
function createInkParticles() {
    const count = MAX_PARTICLES;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.3) * SCENE_SPACING * SCENES;
        positions[i * 3 + 1] = Math.random() * 7 - 1;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        sizes[i] = 0.03 + Math.random() * 0.08;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
        color: 0x2a2620,
        size: 0.06,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    inkParticles = new THREE.Points(geo, mat);
    inkParticles.renderOrder = 2;
    scene.add(inkParticles);
}

// ── Canvas: Paper Texture ──
let paperPattern = null;
function createPaperTexture() {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = "#F4EFE6";
    g.fillRect(0, 0, 256, 256);

    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 8;
        img.data[i] = 244 + n;
        img.data[i + 1] = 239 + n;
        img.data[i + 2] = 230 + n;
        img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);

    g.strokeStyle = "rgba(180,170,155,0.03)";
    g.lineWidth = 0.5;
    for (let y = 0; y < 256; y += 8) {
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x < 256; x += 14) g.lineTo(x, y + (Math.random() - 0.5) * 1.2);
        g.stroke();
    }
    return c;
}

// ── Canvas: Ink-spread mask for intro ──
function drawInkMask(radius) {
    inkCtx.clearRect(0, 0, W, H);

    // The ink mask: paper white outside the ink circle, transparent inside
    // We draw the paper color everywhere, then clear the ink-spread area
    inkCtx.fillStyle = "#F4EFE6";
    inkCtx.fillRect(0, 0, W, H);

    // Cut out the ink-spread area with irregular edge
    inkCtx.save();
    inkCtx.globalCompositeOperation = "destination-out";

    const cx = W / 2, cy = H / 2;
    const segments = 80;
    inkCtx.beginPath();
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const noise = Math.sin(angle * 9) * radius * 0.08 + Math.sin(angle * 17) * radius * 0.05 + Math.sin(angle * 3) * radius * 0.12;
        const r = radius + noise * (1 - Math.min(1, radius / Math.max(W, H)));
        const sx = cx + Math.cos(angle) * r;
        const sy = cy + Math.sin(angle) * r;
        if (i === 0) inkCtx.moveTo(sx, sy);
        else inkCtx.lineTo(sx, sy);
    }
    inkCtx.closePath();
    inkCtx.fill();
    inkCtx.restore();

    // Ink-dark rim at the edge
    if (radius > 5 && radius < Math.max(W, H) * 0.9) {
        inkCtx.save();
        inkCtx.globalCompositeOperation = "source-over";
        inkCtx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const noise = Math.sin(angle * 9) * radius * 0.08 + Math.sin(angle * 17) * radius * 0.05 + Math.sin(angle * 3) * radius * 0.12;
            const r = radius + noise * (1 - Math.min(1, radius / Math.max(W, H)));
            const sx = cx + Math.cos(angle) * r;
            const sy = cy + Math.sin(angle) * r;
            if (i === 0) inkCtx.moveTo(sx, sy);
            else inkCtx.lineTo(sx, sy);
        }
        inkCtx.closePath();
        inkCtx.strokeStyle = "rgba(26,24,20,0.2)";
        inkCtx.lineWidth = 3;
        inkCtx.stroke();
        inkCtx.strokeStyle = "rgba(26,24,20,0.08)";
        inkCtx.lineWidth = 8;
        inkCtx.stroke();
        inkCtx.restore();
    }
}

// ── Canvas: Water ripple on seal click ──
function drawWaterRipple(cx, cy, radius, progress) {
    inkCtx.clearRect(0, 0, W, H);

    // White fill inside the ripple
    inkCtx.fillStyle = `rgba(244,239,230,${progress})`;
    inkCtx.beginPath();
    inkCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    inkCtx.fill();

    // Soft edge
    const grad = inkCtx.createRadialGradient(cx, cy, Math.max(0, radius - 40), cx, cy, radius);
    grad.addColorStop(0, "rgba(244,239,230,0)");
    grad.addColorStop(1, `rgba(244,239,230,${0.7 * progress})`);
    inkCtx.fillStyle = grad;
    inkCtx.beginPath();
    inkCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    inkCtx.fill();
}

// ── Input: Mouse Wheel ──
function onWheel(e) {
    if (introPhase !== "done") return;
    if (transitioning) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    scrollTarget += delta * 1.8;
    scrollTarget = Math.max(0, Math.min(scrollTarget, (SCENES - 1) * SCENE_SPACING));
    hideScrollHint();
}

// ── Input: Touch ──
function onTouchStart(e) {
    if (introPhase !== "done") return;
    if (transitioning) return;
    if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartScroll = scrollTarget;
        openingPage.classList.add("dragging");
        hideScrollHint();
    }
}

function onTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const dx = dragStartX - e.touches[0].clientX;
    const worldDx = (dx / W) * frustumW;
    scrollTarget = dragStartScroll + worldDx;
    scrollTarget = Math.max(0, Math.min(scrollTarget, (SCENES - 1) * SCENE_SPACING));
}

function onTouchEnd() {
    isDragging = false;
    openingPage.classList.remove("dragging");
}

// ── Input: Keyboard ──
function onKeyDown(e) {
    if (introPhase !== "done") return;
    if (transitioning) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        scrollTarget += 1.8;
        scrollTarget = Math.min(scrollTarget, (SCENES - 1) * SCENE_SPACING);
        hideScrollHint();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        scrollTarget -= 1.8;
        scrollTarget = Math.max(0, scrollTarget);
        hideScrollHint();
    }
}

// ── Scroll Hint ──
function hideScrollHint() {
    if (scrollHint.classList.contains("visible")) {
        scrollHint.classList.remove("visible");
    }
}

// ── GSAP: Intro Animation ──
function playIntro() {
    introPhase = "ink-drop";
    introTimer = 0;
    introInkRadius = 0;

    // After intro, show scroll hint
    gsap.to(scrollHint, {
        opacity: 0.7,
        duration: 0.6,
        delay: INTRO_DURATION + 0.5,
        onStart: () => scrollHint.classList.add("visible")
    });
}

// ── Update Scene Texts & Dots ──
function updateSceneUI() {
    const idx = Math.round(scrollProgress * (SCENES - 1));
    const clamped = Math.max(0, Math.min(SCENES - 1, idx));

    if (clamped !== currentScene) {
        currentScene = clamped;
        sceneTexts.forEach((el, i) => {
            if (i === currentScene) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });
        sceneDots.forEach((el, i) => {
            el.classList.toggle("active", i === currentScene);
        });
    }

    // Check if all scenes viewed
    if (scrollProgress > 0.85 && !sealShown) {
        showSealButton();
    }
}

// ── Seal Button ──
function showSealButton() {
    sealShown = true;
    gsap.to(sealBtn, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        onStart: () => {
            sealBtn.classList.add("visible");
        }
    });
}

sealBtn.addEventListener("click", (e) => {
    if (transitioning) return;
    e.stopPropagation();
    startTransition();
});

function startTransition() {
    transitioning = true;
    transitionTimer = 0;
    transitionRipple = 0;

    const btnRect = sealBtn.getBoundingClientRect();
    const cx = btnRect.left + btnRect.width / 2;
    const cy = btnRect.top + btnRect.height / 2;

    // Save for canvas rendering
    inkCanvas._rippleCx = cx;
    inkCanvas._rippleCy = cy;

    // Fade out UI
    gsap.to([".scene-texts", ".scene-dots", sealBtn], {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
    });
}

// ── Complete transition to main app ──
function finishTransition() {
    // Call main app init
    if (typeof window.startMainApp === "function") {
        window.startMainApp();
    }

    // Hide opening page
    gsap.to(openingPage, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            openingPage.style.display = "none";
        }
    });
}

// ── Parallax from mouse ──
function onMouseMove(e) {
    mouseX = (e.clientX / W) - 0.5;
    mouseY = (e.clientY / H) - 0.5;
}
function onMouseLeave() {
    mouseX = 0;
    mouseY = 0;
}

// ── Resize ──
function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setSize(W, H);
    inkCanvas.width = W;
    inkCanvas.height = H;
    inkCanvas.style.width = W + "px";
    inkCanvas.style.height = H + "px";
    updateCamera();
    // Recreate paper texture at new size
    paperPattern = createPaperTexture();
}

// ── Main Loop ──
let lastTime = performance.now();

function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    // ── Intro animation ──
    if (introPhase === "ink-drop" || introPhase === "ink-spread") {
        introTimer += dt;
        if (introTimer < 0.3) {
            // Ink drop appears (small)
            introInkRadius = Math.max(0, (introTimer / 0.3) * 20);
            introPhase = "ink-drop";
        } else {
            // Ink spreads outward
            introPhase = "ink-spread";
            const spreadT = (introTimer - 0.3) / (INTRO_DURATION - 0.3);
            const eased = 1 - Math.pow(1 - Math.min(1, spreadT), 3); // ease-out
            const maxR = Math.sqrt(W * W + H * H) * 0.7;
            introInkRadius = 20 + eased * (maxR - 20);
        }

        if (introTimer >= INTRO_DURATION) {
            introPhase = "done";
            introInkRadius = 0;
        }
    }

    // ── Scroll smoothing ──
    if (introPhase === "done" && !isDragging) {
        scrollCurrent += (scrollTarget - scrollCurrent) * SCROLL_SMOOTH;
        if (Math.abs(scrollTarget - scrollCurrent) < 0.001) {
            scrollCurrent = scrollTarget;
        }
        scrollProgress = scrollCurrent / ((SCENES - 1) * SCENE_SPACING);
    } else if (!isDragging && introPhase !== "done") {
        // During intro, stay at scene 0
        scrollProgress = 0;
        scrollCurrent = 0;
        scrollTarget = 0;
    }

    // ── Update camera ──
    const targetX = scrollCurrent;
    const px = mouseX * 0.8;  // subtle parallax
    const py = mouseY * 0.5;
    camera.position.x = targetX + px;
    camera.position.y = 1.5 + py;
    camera.lookAt(targetX, 0, 0);

    // ── Update mist ──
    mistPlanes.forEach((plane, i) => {
        plane.position.x += dt * (0.1 + i * 0.05);
        if (plane.position.x > SCENE_SPACING * SCENES + 10) {
            plane.position.x -= SCENE_SPACING * SCENES + 20;
        }
    });

    // ── Update ink particles ──
    if (inkParticles && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const pos = inkParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i + 1] += dt * (0.05 + Math.sin(time / 2000 + i) * 0.03);  // float up
            pos[i] += dt * Math.sin(time / 3000 + i) * 0.08;                // drift
            if (pos[i + 1] > 6) pos[i + 1] = -1;
            if (pos[i] < -5) pos[i] = SCENE_SPACING * SCENES + 5;
            if (pos[i] > SCENE_SPACING * SCENES + 5) pos[i] = -5;
        }
        inkParticles.geometry.attributes.position.needsUpdate = true;
    }

    // ── Render Three.js ──
    renderer.render(scene, camera);

    // ── Canvas overlay ──
    if (introPhase === "ink-drop" || introPhase === "ink-spread") {
        drawInkMask(introInkRadius);
    } else if (transitioning) {
        // Water ripple transition
        transitionTimer += dt;
        const tProgress = Math.min(1, transitionTimer / TRANSITION_DURATION);
        const eased = 1 - Math.pow(1 - tProgress, 2); // ease-out quad
        const maxR = Math.sqrt(W * W + H * H) * 1.3;
        transitionRipple = eased * maxR;

        const cx = inkCanvas._rippleCx || W / 2;
        const cy = inkCanvas._rippleCy || H / 2;
        drawWaterRipple(cx, cy, transitionRipple, eased);

        if (tProgress >= 1) {
            transitioning = false;
            inkCtx.clearRect(0, 0, W, H);
            finishTransition();
        }
    } else if (introPhase === "done") {
        // Subtle paper grain overlay
        inkCtx.clearRect(0, 0, W, H);
        if (paperPattern) {
            inkCtx.globalAlpha = 0.03;
            inkCtx.fillStyle = inkCtx.createPattern(paperPattern, "repeat");
            inkCtx.fillRect(0, 0, W, H);
            inkCtx.globalAlpha = 1;
        }
    }

    // ── Update UI ──
    if (introPhase === "done") {
        updateSceneUI();
    }

    requestAnimationFrame(loop);
}

// ── Fallback: show text even if Three.js fails ──
function fallbackMode() {
    document.getElementById("opening-page").style.background = "#F4EFE6";
    sceneTexts[0].classList.add("active");
    sceneDots[0].classList.add("active");
    scrollHint.classList.add("visible");
    inkCtx.fillStyle = "#F4EFE6";
    inkCtx.fillRect(0, 0, W, H);
    // Ink spot decoration in center
    const cx = W/2, cy = H/2;
    const grad = inkCtx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    grad.addColorStop(0, "rgba(29,27,24,0.15)");
    grad.addColorStop(0.5, "rgba(29,27,24,0.05)");
    grad.addColorStop(1, "rgba(244,239,230,0)");
    inkCtx.fillStyle = grad;
    inkCtx.beginPath();
    inkCtx.arc(cx, cy, 60, 0, Math.PI*2);
    inkCtx.fill();
}

// ── Init ──
function init() {
    resize();

    try {
        if (typeof THREE === "undefined") throw new Error("Three.js not loaded");
        setupThree();
    } catch (e) {
        console.warn("Three.js unavailable, using fallback:", e.message);
        fallbackMode();
        return;
    }

    createPaperTexture();

    // Event listeners
    window.addEventListener("resize", resize);
    threeCanvas.addEventListener("wheel", onWheel, { passive: false });
    threeCanvas.addEventListener("touchstart", onTouchStart, { passive: false });
    threeCanvas.addEventListener("touchmove", onTouchMove, { passive: false });
    threeCanvas.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    // Show first scene text immediately
    sceneTexts[0].classList.add("active");
    sceneDots[0].classList.add("active");

    // Play intro after a short delay
    setTimeout(playIntro, 400);

    // Start loop
    requestAnimationFrame(loop);
}

init();
