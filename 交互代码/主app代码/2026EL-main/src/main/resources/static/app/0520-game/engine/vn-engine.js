/**
 * 轻量视觉小说引擎 — 兼容 Monogatari 脚本格式
 * 零依赖，支持：背景切换、立绘显示、对话框、选项菜单、场景跳转、BGM
 *
 * Usage:
 *   1. game/main.js    定义角色、背景路径
 *   2. game/script.js  用 VNEngine.script({...}) 写剧本
 *   3. VNEngine.start('start')  启动
 *
 * 支持的语句类型:
 *   { show: { background: 'bg_id' } }              — 切换背景（默认 fade）
 *   { show: { character: 'char_id', expression: 'expr' } } — 显示/切换立绘
 *   { hide: { character: 'char_id' } }             — 隐藏立绘
 *   { narrator: { text: '...' } }                  — 旁白（无角色名）
 *   { char_id: { text: '...' } }                   — 角色对话
 *   { char_id: { text: '...', expression: 'expr' } } — 角色对话 + 切表情
 *   { choice: { prompt: '...', options: [...] } }  — 选项菜单
 *   { jump: 'label' }                              — 跳转标签
 *   { end: true }                                  — 结束，回到主菜单
 *   { scene: 'label' }                             — 声明场景标签（可选标注）
 *   { wait: 1000 }                                 — 等待毫秒
 *   { music: 'audio/file.ogg' }                    — 播放背景音乐（循环）
 *   { music: { file: 'audio/file.ogg', fadein: 2 } } — 播放 BGM（淡入）
 *   { stop_music: true }                           — 停止 BGM
 *   { stop_music: { fadeout: 2 } }                 — 停止 BGM（淡出）
 */

const VNEngine = (() => {
  // ==================== DOM 引用 ====================
  const stage     = document.getElementById('vn-stage');
  const bgLayer   = document.getElementById('vn-background');
  const spriteLayer = document.getElementById('vn-sprites');
  const speakerName  = document.getElementById('vn-speaker-name');
  const dialogText   = document.getElementById('vn-dialog-text');
  const clickHint    = document.getElementById('vn-click-hint');
  const choicesBox   = document.getElementById('vn-choices');
  const startScreen  = document.getElementById('vn-start-screen');

  // ==================== 状态 ====================
  let labels = {};
  let currentLabel = null;
  let lineIndex = 0;
  let isWaiting = false;
  let isAnimating = false;
  let currentChar = null;
  let charConfig = {};
  let bgConfig = {};
  let bgPosition = {};
  let assetBase = 'assets/';
  let audioUnlocked = false;     // 用户交互后解锁音频
  let pendingMusic = null;       // 等待解锁的 BGM 请求

  // ==================== 音频 ====================
  let bgmElement = null;
  let bgmFadeTimer = null;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    console.log('[VNEngine] 音频已解锁');

    // 播放排队中的 BGM
    if (pendingMusic) {
      const m = pendingMusic;
      pendingMusic = null;
      playMusicNow(m.file, m.fadein);
    }
  }

  function playMusicNow(file, fadein = 0) {
    // 停止当前 BGM
    if (bgmElement) {
      bgmElement.pause();
      bgmElement.src = '';
      bgmElement = null;
    }
    if (bgmFadeTimer) {
      clearInterval(bgmFadeTimer);
      bgmFadeTimer = null;
    }

    if (!file) return;

    bgmElement = new Audio(file);
    bgmElement.loop = true;
    bgmElement.volume = 0;

    if (fadein > 0) {
      bgmElement.play()
        .then(() => console.log('[VNEngine] BGM 播放中:', file))
        .catch(e => console.warn('[VNEngine] BGM 播放失败:', file, e.message));
      const step = 0.05;
      const interval = (fadein * 1000) / (1 / step);
      bgmFadeTimer = setInterval(() => {
        if (!bgmElement) { clearInterval(bgmFadeTimer); bgmFadeTimer = null; return; }
        const newVol = Math.min(1, bgmElement.volume + step);
        bgmElement.volume = newVol;
        if (newVol >= 1) { clearInterval(bgmFadeTimer); bgmFadeTimer = null; }
      }, interval);
    } else {
      bgmElement.volume = 0.6;
      bgmElement.play()
        .then(() => console.log('[VNEngine] BGM 播放中:', file))
        .catch(e => console.warn('[VNEngine] BGM 播放失败:', file, e.message));
    }
  }

  function playMusic(file, fadein = 0) {
    if (!audioUnlocked) {
      // 浏览器还没解锁音频，排队等待首次点击后播放
      pendingMusic = { file, fadein };
      console.log('[VNEngine] BGM 排队等待音频解锁:', file);
      return;
    }
    playMusicNow(file, fadein);
  }

  function stopMusic(fadeout = 0) {
    pendingMusic = null;
    if (!bgmElement) return;
    if (bgmFadeTimer) { clearInterval(bgmFadeTimer); bgmFadeTimer = null; }

    if (fadeout > 0) {
      const step = 0.05;
      const interval = (fadeout * 1000) / (1 / step);
      bgmFadeTimer = setInterval(() => {
        if (!bgmElement) { clearInterval(bgmFadeTimer); bgmFadeTimer = null; return; }
        const newVol = Math.max(0, bgmElement.volume - step);
        bgmElement.volume = newVol;
        if (newVol <= 0) {
          clearInterval(bgmFadeTimer); bgmFadeTimer = null;
          bgmElement.pause(); bgmElement.src = ''; bgmElement = null;
        }
      }, interval);
    } else {
      bgmElement.pause(); bgmElement.src = ''; bgmElement = null;
    }
  }

  // ==================== DOM 操作 ====================
  function setBackground(bgId) {
    if (bgId === 'black') {
      bgLayer.style.backgroundImage = '';
      bgLayer.style.backgroundColor = '#000000';
      bgLayer.classList.add('visible');
      return;
    }
    if (bgId === 'white') {
      bgLayer.style.backgroundImage = '';
      bgLayer.style.backgroundColor = '#ffffff';
      bgLayer.classList.add('visible');
      return;
    }

    const rawPath = bgConfig[bgId] || bgId;
    const path = rawPath.startsWith('http') || rawPath.startsWith('data:')
      ? rawPath : assetBase + rawPath;
    bgLayer.style.backgroundColor = '';
    const img = new Image();
    img.onload = () => {
      bgLayer.style.backgroundImage = `url('${encodeURI(path)}')`;
      bgLayer.style.backgroundPosition = bgPosition[bgId] || 'center center';
      bgLayer.classList.add('visible');
    };
    img.onerror = () => {
      console.warn('[VNEngine] 背景图片加载失败:', path);
      bgLayer.style.backgroundColor = '#1a1a2e';
      bgLayer.classList.add('visible');
    };
    img.src = path;
  }

  function showSprite(charId, expression, size, position) {
    const cfg = charConfig[charId];
    if (!cfg) return;

    let rawPath;
    if (expression && cfg.images && cfg.images[expression]) {
      rawPath = cfg.images[expression];
    } else if (cfg.defaultImage) {
      rawPath = cfg.defaultImage;
    } else {
      return;
    }
    const imgPath = rawPath.startsWith('http') || rawPath.startsWith('data:')
      ? rawPath : assetBase + rawPath;

    spriteLayer.innerHTML = '';
    const img = document.createElement('img');
    img.src = imgPath;
    let cls = 'sprite-img';
    if (size === 'small') cls += ' sprite-small';
    if (position === 'road') cls += ' sprite-road';
    img.className = cls;
    img.alt = cfg.name || charId;
    img.onload = () => img.classList.add('visible');
    img.onerror = () => console.warn('[VNEngine] 立绘加载失败:', imgPath);
    spriteLayer.appendChild(img);
    currentChar = charId;
  }

  function hideSprite() {
    spriteLayer.innerHTML = '';
    currentChar = null;
  }

  function setDialog(name, text) {
    speakerName.textContent = name || '';
    speakerName.style.display = name ? 'block' : 'none';
    dialogText.textContent = text;
    clickHint.style.display = 'block';
    choicesBox.style.display = 'none';
    choicesBox.innerHTML = '';
    isWaiting = true;
  }

  function showChoices(prompt, options) {
    speakerName.textContent = '';
    speakerName.style.display = 'none';
    dialogText.textContent = prompt || '请选择：';
    clickHint.style.display = 'none';

    choicesBox.innerHTML = '';
    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        choicesBox.style.display = 'none';
        choicesBox.innerHTML = '';
        if (opt.do) {
          if (opt.do.startsWith('jump '))  jumpTo(opt.do.slice(5));
          else if (opt.do.startsWith('label ')) jumpTo(opt.do.slice(6));
        }
      });
      choicesBox.appendChild(btn);
    });
    choicesBox.style.display = 'flex';
    isWaiting = false;
  }

  // ==================== 脚本执行 ====================
  function jumpTo(label) {
    if (!labels[label]) {
      console.warn(`[VNEngine] 标签 "${label}" 不存在`);
      setDialog('', '【感谢游玩】');
      clickHint.style.display = 'none';
      isWaiting = false;
      return;
    }
    currentLabel = label;
    lineIndex = 0;
    isWaiting = false;
    isAnimating = false;
    executeNext();
  }

  function executeNext() {
    if (isWaiting || isAnimating) return;

    const lines = labels[currentLabel];
    if (!lines || lineIndex >= lines.length) {
      setDialog('', '【本章结束】');
      clickHint.style.display = 'none';
      isWaiting = false;
      return;
    }

    const line = lines[lineIndex];
    lineIndex++;

    const key = Object.keys(line)[0];
    const val = line[key];

    switch (key) {
      case 'show':
        handleShow(val); break;
      case 'hide':
        handleHide(val); break;
      case 'narrator':
        setDialog('', val.text); break;
      case 'jump':
        jumpTo(val); break;
      case 'choice':
        showChoices(val.prompt, val.options); break;
      case 'end':
        setDialog('', '【感谢游玩】');
        clickHint.style.display = 'none';
        isWaiting = false;
        break;
      case 'wait':
        isAnimating = true;
        setTimeout(() => { isAnimating = false; executeNext(); }, val);
        break;
      case 'music':
        if (typeof val === 'string') playMusic(val, 0);
        else playMusic(val.file, val.fadein || 0);
        executeNext();
        break;
      case 'stop_music':
        if (typeof val === 'object' && val.fadeout) stopMusic(val.fadeout);
        else stopMusic(0);
        executeNext();
        break;
      case 'scene':
        break;
      default:
        // 角色对话
        const charCfg = charConfig[key] || {};
        const charName = charCfg.name || key;
        speakerName.style.color = charCfg.color || '#ffffff';

        if (val.expression) showSprite(key, val.expression, val.size, val.position);

        if (!val.text || val.text.trim() === '') {
          setTimeout(() => executeNext(), 10);
          break;
        }

        setDialog(charName, val.text);
        break;
    }
  }

  function handleShow(target) {
    if (target.background) {
      setBackground(target.background);
      isAnimating = true;
      setTimeout(() => { isAnimating = false; executeNext(); }, 500);
    }
    if (target.character) showSprite(target.character, target.expression, target.size, target.position);
    if (!target.background) executeNext();
  }

  function handleHide(target) {
    if (target.character) hideSprite();
    executeNext();
  }

  // ==================== 用户交互 ====================
  function onUserInteract() {
    unlockAudio();
  }

  stage.addEventListener('click', (e) => {
    onUserInteract();
    if (e.target.closest('.choice-btn')) return;
    if (choicesBox.style.display === 'flex') return;
    if (isWaiting) { isWaiting = false; executeNext(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      onUserInteract();
      e.preventDefault();
      if (choicesBox.style.display === 'flex') return;
      if (isWaiting) { isWaiting = false; executeNext(); }
    }
  });

  // ==================== 启动画面 ====================
  if (startScreen) {
    startScreen.addEventListener('click', () => {
      unlockAudio();
      startScreen.classList.add('hidden');
    });
  }

  // ==================== API ====================
  return {
    characters(config)    { Object.assign(charConfig, config); },
    backgrounds(config)   { Object.assign(bgConfig, config); },
    backgroundPositions(config) { Object.assign(bgPosition, config); },
    setAssetBase(base)    { assetBase = base; },
    script(script)        { Object.assign(labels, script); },
    start(startLabel) {
      console.log('[VNEngine] 启动游戏:', startLabel);
      // 如果启动画面存在，等用户点击后自动 jump
      // 否则直接 jump（start screen 的 click handler 也会触发 jump）
      if (!startScreen || startScreen.classList.contains('hidden')) {
        jumpTo(startLabel);
      }
    }
  };
})();
