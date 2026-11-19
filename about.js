import { animate } from './vendor/motion.js';

// 字符场背景——逆向自 mimo.xiaomimimo.com/desktop 的 desktop-ascii 渲染器（其 2b-r4si443a9x.js 的 X()）。
// 机制 1:1 移植：椭圆环半径 d 从焦点向外扫出（5.5s 拨开），之后 ~21.4s 余弦涨落无限循环；
// 环上高斯亮带+环内拖尾辉光+径向/对角双波纹调制，字符按强度取自字符表，四边 smoothstep 淡出。
// 按用户口径调淡（gain）并换浅底墨色；减少动态效果时只画一帧静止环。
// 指针耦合：鼠标在开场区内移动时，亮带焦点以缓动跟随指针（同 hero-depth 的 pointerResponse 曲线），
// 移出后缓慢回到标题焦点；触屏/减少动态效果不启用。
const ASCII_GLYPHS = 'belate.#+*□';
const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / Math.max(1e-4, b - a)));
  return t * t * (3 - 2 * t);
};
const pointerResponse = value => {
  const position = Math.max(-1, Math.min(1, value));
  return position * (1.25 - .25 * position * position);
};

function mountAsciiField(canvas, focusEl, { ink = '96,112,102', gain = .34 } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  let raf = 0, start = -1, visible = true, lastPaint = 0;
  let w = 0, h = 0, cellW = 10, cells = [], sprites = [];
  let fx = 0, fy = 0;                 // 标题焦点（归位点）
  let focusX = 0, focusY = 0;         // 当前亮带中心（缓动后）
  let targetX = 0, targetY = 0;       // 当前目标（指针或归位点）
  let hovering = false, lastFrame = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(hover: none)');
  // 触屏没有指针亮带可跟，整屏留一层很淡的字底，环扫过时才不会大片纯白。
  const base = coarse.matches ? .07 : .0015;
  const surface = canvas.parentElement ?? canvas;
  // 小米 WebView 对「画过内容的 canvas」有合成 bug：元素在、背景/字全不显示。
  // 触屏改画到离屏 canvas，再把帧贴到普通 div 的 background-image 上；div 正常上屏。
  const texture = coarse.matches ? document.createElement('div') : null;
  const ringLayer = coarse.matches ? document.createElement('div') : null;
  if (texture) {
    texture.className = 'about-ascii-paint';
    ringLayer.className = 'about-ascii-ring';
    for (const layer of [texture, ringLayer]) {
      layer.setAttribute('aria-hidden', 'true');
      Object.assign(layer.style, {
        position: 'absolute', inset: '0', zIndex: '0', pointerEvents: 'none',
        backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%',
      });
    }
    canvas.after(texture, ringLayer);
    canvas.style.visibility = 'hidden';
    canvas.style.pointerEvents = 'none';
  }

  // 字形预渲染成位图，逐帧只 drawImage+globalAlpha（fillText 每帧数千次必掉帧）。
  function buildSprites() {
    const gw = Math.ceil(cellW * 1.3) + 4, gh = 20;
    sprites = ASCII_GLYPHS.split('').map(glyph => {
      const sprite = document.createElement('canvas');
      sprite.width = gw;
      sprite.height = gh;
      const g = sprite.getContext('2d');
      g.font = '13px ui-monospace, SFMono-Regular, Menlo, monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = `rgb(${ink})`;
      g.fillText(glyph, gw / 2, gh / 2);
      return { sprite, w: gw, h: gh };
    });
  }

  function layout() {
    // 触屏贴图最终缩回 1x，384×300 的字场足够；桌面保留 1.5x 的清晰度。
    const dpr = coarse.matches ? 1 : Math.min(devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.max(.78, Math.min(1, w / 1440));
    cellW = Math.max(8, Math.round(10.24 * scale));
    const cellH = Math.max(11, Math.round(13.76 * scale));
    const cols = Math.ceil(w / cellW), rows = Math.ceil(h / cellH);
    const fr = (focusEl ?? canvas).getBoundingClientRect();
    const hasFocus = fr.width > 0 && fr.height > 0;
    fx = hasFocus ? fr.left - rect.left + fr.width / 2 : w * .5;
    fy = hasFocus ? fr.top - rect.top + fr.height / 2 : h * .39;
    targetX = fx; targetY = fy;
    if (!hovering) { focusX = fx; focusY = fy; }
    canvas.dataset.asciiFocus = `${Math.round(fx)},${Math.round(fy)}`;
    cells = [];
    for (let row = 0; row < rows; row++) {
      const y = (row + .5) * cellH, ny = y / h;
      for (let col = 0; col < cols; col++) {
        const x = (col + .5) * cellW, nx = x / w;
        cells.push({ x, y, nx, ny, edge: smoothstep(0, .035, Math.min(nx, 1 - nx, ny, 1 - ny)) });
      }
    }
    buildSprites();
  }

  function draw(now) {
    if (start < 0) start = now;
    // 亮带中心缓动跟随指针：进入时跟手（k≈6/s），移出后慢慢回到标题（k≈3.2/s）。
    const dt = Math.min(.05, Math.max(0, (now - (lastFrame || now)) * .001));
    lastFrame = now;
    if (!reduced.matches) {
      const k = 1 - Math.exp(-dt * (hovering ? 6 : 3.2));
      focusX += (targetX - focusX) * k;
      focusY += (targetY - focusY) * k;
    } else { focusX = fx; focusY = fy; }
    const nx = focusX / w, ny = focusY / h;
    const ex = Math.max(.18, Math.max(focusX, w - focusX, 1) / w);
    const ey = Math.max(.16, Math.max(focusY, h - focusY, 1) / h);
    const t = (now - start) * .001;
    const phase = 1.1 * t;
    const intro = smoothstep(0, 1, Math.min(1, t / 5.5));
    const breath = .5 - .5 * Math.cos((1 + ((t - 5.5) * .0935 % 2)) * Math.PI);
    const ring = .02 + 1.05 * (t < 5.5 ? intro : breath);
    const burstFade = 1 - smoothstep(0, 1, Math.min(1, t / 1.8));
    ctx.clearRect(0, 0, w, h);
    // 触屏只生成一张静态字底；亮带由 CSS mask 在合成层上跑，60fps，不再逐帧编码贴图。
    const flat = coarse.matches;
    for (const cell of cells) {
      const wave = .5 + .5 * Math.sin(5.2 * cell.nx - 3.4 * cell.ny - .8 * phase);
      let b, radius = 0;
      if (flat) {
        b = base * 1.5 * (.62 + .38 * wave) * (.68 + .32 * Math.sin(7.3 * cell.nx + 5.1 * cell.ny + 1.7));
        b = Math.max(0, Math.min(1, b));
      } else {
        radius = Math.sqrt(((cell.nx - nx) / ex) ** 2 + ((cell.ny - ny) / ey) ** 2);
        const m = radius - ring;
        if (Math.abs(m) > .5 && (!burstFade || radius > .3)) continue;
        const band = Math.exp(-((m / .095) ** 2));
        const trail = .34 * Math.exp(-(((m + .16) / .25) ** 2));
        const burst = burstFade * .9 * Math.exp(-((radius / .2) ** 2));
        const ripple = .5 + .5 * Math.sin(22 * radius - 2.1 * phase);
        b = Math.max(0, Math.min(1, (base + burst + band + trail + ripple * band * .16) * (.54 + .26 * wave)));
      }
      const alpha = smoothstep(0, .028, b) * cell.edge;
      if (alpha < .05) continue;
      const glyph = Math.max(0, Math.min(sprites.length - 1, Math.floor((.78 * b + .22 * wave) * (sprites.length - 1))));
      const jitter = flat ? 0 : Math.sin(13 * radius - 1.25 * phase) * cellW * .1;
      const sprite = sprites[glyph];
      ctx.globalAlpha = Math.min(1, alpha * (.045 + .62 * b) * gain);
      ctx.drawImage(sprite.sprite, Math.round(cell.x + jitter - sprite.w / 2), Math.round(cell.y - sprite.h / 2));
    }
    ctx.globalAlpha = 1;
    if (texture) {
      const url = `url(${canvas.toDataURL('image/webp', .9)})`;
      texture.style.backgroundImage = url;
      ringLayer.style.backgroundImage = url;
    }
  }

  function frame(now) {
    raf = 0;
    draw(now);
    if (!reduced.matches && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function play() {
    // 触屏/减少动态：只出一帧字底；触屏的呼吸交给 .about-ascii-ring 的 CSS 动画。
    if (coarse.matches || reduced.matches) { start = 0; draw(5500); return; }
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function resize() {
    layout();
    if (coarse.matches || reduced.matches) { start = 0; draw(5500); }
  }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else play();
  }

  // 指针耦合：鼠标在开场区内移动 → 亮带焦点跟过去（带响应曲线，边缘略收）；移出 → 缓缓归位到标题。
  function aim(event) {
    if (reduced.matches || event.pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    hovering = true;
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    targetX = (pointerResponse(2 * x - 1) * .5 + .5) * w;
    targetY = (pointerResponse(2 * y - 1) * .5 + .5) * h;
    canvas.dataset.asciiFocus = `${Math.round(targetX)},${Math.round(targetY)}`;
  }
  function leave() {
    if (!hovering) return;
    hovering = false;
    targetX = fx;
    targetY = fy;
    canvas.dataset.asciiFocus = `${Math.round(fx)},${Math.round(fy)}`;
  }
  surface.addEventListener('pointermove', aim, { passive: true });
  surface.addEventListener('pointerenter', aim, { passive: true });
  surface.addEventListener('pointerleave', leave, { passive: true });

  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  const sizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  sizeObserver?.observe(canvas);
  const inView = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible) play();
    else { cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: .01 }) : null;
  inView?.observe(canvas);
  play();
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visibility);
    surface.removeEventListener('pointermove', aim);
    surface.removeEventListener('pointerenter', aim);
    surface.removeEventListener('pointerleave', leave);
    sizeObserver?.disconnect();
    inView?.disconnect();
    texture?.remove();
    ringLayer?.remove();
    canvas.style.visibility = '';
    canvas.style.pointerEvents = '';
  };
}

function mountAgentStrip(agents, reduced, signal) {
  const strip = agents.querySelector('.about-agent-window');
  const track = strip.querySelector('.about-agent-track');
  const [before, primary] = track.children;
  const links = [...primary.querySelectorAll('a')];
  let cycle = 0;
  let offset = 0;
  let held = false;
  let lastScroll = window.scrollY;
  let frame;
  let drag;
  let suppressClick = false;

  function positionTrack(x) {
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }
  function paint() {
    if (reduced.matches || !cycle || held) return;
    // Side copies have the same size and spacing, including across the loop seam.
    positionTrack(((offset % cycle) + cycle) % cycle - cycle);
  }
  function showFocused(link) {
    if (!link?.matches(':focus-visible') || reduced.matches || !cycle) return;
    held = true;
    const relative = link.getBoundingClientRect().left - primary.getBoundingClientRect().left;
    offset = -Math.min(relative, Math.max(0, cycle - strip.clientWidth));
    // Keep the focused original in view, even when its repeat is visible at the seam.
    positionTrack(offset - cycle);
  }
  function measure() {
    cycle = before.getBoundingClientRect().width;
    if (held) showFocused(document.activeElement);
    else paint();
  }
  const resize = new ResizeObserver(measure);
  resize.observe(before);
  measure();
  window.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const top = window.scrollY;
      const delta = top - lastScroll;
      lastScroll = top;
      if (reduced.matches || drag || held) return;
      const bounds = strip.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      offset += delta * .4;
      paint();
    });
  }, { passive: true, signal });
  reduced.addEventListener('change', () => {
    lastScroll = window.scrollY;
    held = false;
    measure();
    if (primary.contains(document.activeElement)) showFocused(document.activeElement);
  }, { signal });
  links.forEach(link => link.addEventListener('focus', () => showFocused(link), { signal }));
  primary.addEventListener('focusout', event => {
    if (!primary.contains(event.relatedTarget)) held = false;
  }, { signal });

  strip.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (reduced.matches || !event.isPrimary || event.button !== 0) return;
    held = false;
    drag = { id: event.pointerId, type: event.pointerType, x: event.clientX, y: event.clientY, start: offset, active: false };
  }, { signal });
  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || drag?.id !== event.pointerId) return;
    moveDrag(event.clientX, event.clientY);
  }, { passive: true, signal });
  strip.addEventListener('touchmove', event => {
    if (drag?.type !== 'touch' || event.touches.length !== 1 || !event.cancelable) return;
    const point = event.touches[0];
    if (moveDrag(point.clientX, point.clientY)) event.preventDefault();
  }, { passive: false, signal });
  function moveDrag(x, y) {
    const dx = x - drag.x;
    if (!drag.active) {
      if (Math.abs(dx) < Math.max(7, Math.abs(y - drag.y) * 1.2)) return false;
      drag.active = true;
      if (drag.type !== 'touch') strip.setPointerCapture(drag.id);
      strip.setAttribute('data-dragging', '');
    }
    offset = drag.start + dx;
    paint();
    return true;
  }
  function release(event) {
    if (drag?.id !== event.pointerId) return;
    suppressClick = drag.active;
    drag = undefined;
    strip.removeAttribute('data-dragging');
  }
  window.addEventListener('pointerup', release, { signal });
  window.addEventListener('pointercancel', release, { signal });
  strip.addEventListener('lostpointercapture', event => { if (event.target === strip) release(event); }, { signal });
  strip.addEventListener('click', event => {
    if (suppressClick && event.detail) event.preventDefault();
    suppressClick = false;
  }, { capture: true, signal });

  return () => {
    resize.disconnect();
  };
}

// 开场逐行打字：标题 "Hello, I'm Belate."（含大小写打错回删的桥段），回车换行后两行导语
// 一行一行输入；汉字走输入法节奏——先出拼音字母、停顿后上屏成字。
// 每行的完整文本也在 DOM 里（导语第二份是隐藏 ghost 负责占位），不跑动画时直接全显。
const TITLE_FULL = "Hello, I'm Belate";
const LEAD_FULL = ['一个计算机专业学生。', '在代码与日常之间，保留一点自己的观察。'];
// 按“词组”上屏（输入法习惯）：整组拼音打完、停一拍后一次提交整组，不是逐字上屏。
const LEAD_WORDS = [
  [['yigejisuanjizhuanye', '一个计算机专业'], ['xuesheng', '学生'], [null, '。']],
  [['zai', '在'], ['daimayurichang', '代码与日常'], ['zhijian', '之间'], [null, '，'], ['baoliuyidian', '保留一点'], ['zijideguancha', '自己的观察'], [null, '。']],
];
const JITTER = [0, 16, 34, 8, 26, 12, 40, 4, 22, 30];

function buildTitlePlan(state) {
  const plan = [];
  const add = (wait, op, value) => plan.push({ wait, op, value, target: state });
  const waits = [160, 72, 56, 64, 82, 96, 215, 96, 56, 72, 205];
  [..."Hello, I'm "].forEach((ch, i) => add(waits[i] ?? 80, 'char', ch));
  // 大小写没切回来：先打出小写 be，停顿一下发现不对，删掉重打 B。
  add(90, 'char', 'b');
  add(108, 'char', 'e');
  add(560, 'wait');
  add(145, 'back');
  add(175, 'back');
  add(285, 'wait');
  add(118, 'char', 'B');
  [...'elate'].forEach((ch, i) => add([70, 56, 80, 72, 92][i], 'char', ch));
  return plan;
}

// 导语两行整体提速 2.5×：基础节拍保持不变，统一除以 LINE_RATE。
const LINE_RATE = 2.5;

function buildLinePlan(state, words) {
  const plan = [];
  const add = (wait, op, value) => plan.push({ wait: Math.max(16, Math.round(wait / LINE_RATE)), op, value, target: state });
  words.forEach(([pinyin, text], index) => {
    if (pinyin) {
      [...pinyin].forEach((letter, k) => add(58 + JITTER[(index + k) % JITTER.length], 'compose', letter));
      add(145 + JITTER[index % JITTER.length] * 2, 'commit', text);
    } else {
      add(120, 'commit', text);
      add(text === '。' ? 480 : 260, 'wait');
    }
  });
  return plan;
}

function mountIntroTyping(root, reduced, signal) {
  const title = root.querySelector('.about-type-title');
  const titleText = root.querySelector('.about-type-text');
  const dot = root.querySelector('.about-title-dot');
  const lines = [...root.querySelectorAll('.about-lead-line')].map(line => ({
    typed: line.querySelector('.about-lead-typed'),
    text: line.querySelector('.about-lead-text'),
  }));
  if (!title || !titleText || !dot || lines.length < 2 || !lines.every(line => line.typed && line.text) || reduced.matches) return () => {};
  const states = [
    { committed: '', composing: '', el: titleText },
    { committed: '', composing: '', el: lines[0].text },
    { committed: '', composing: '', el: lines[1].text },
  ];
  const paint = state => { state.el.textContent = state.committed + state.composing; };
  let stopped = false;
  let timer = 0;
  const plan = [
    { wait: 430, op: 'wait' },
    ...buildTitlePlan(states[0]),
    { wait: 230, op: 'dot' },
    { wait: 680, op: 'title-done' },
    { wait: 180, op: 'begin', value: 0 },
    ...buildLinePlan(states[1], LEAD_WORDS[0]),
    { wait: 168, op: 'line-done', value: 0 },
    { wait: 80, op: 'begin', value: 1 },
    ...buildLinePlan(states[2], LEAD_WORDS[1]),
    // 收尾不收光标：最后一行保持 is-typing，光标在「自己的观察。」末尾持续闪烁。
  ];
  function settle() {
    stopped = true;
    clearTimeout(timer);
    titleText.textContent = TITLE_FULL;
    dot.hidden = false;
    title.classList.remove('is-typing');
    title.classList.add('is-done');
    lines.forEach((line, i) => {
      line.text.textContent = LEAD_FULL[i];
      line.typed.classList.remove('is-typing');
      line.typed.classList.add('is-done');
    });
  }
  function apply(item) {
    const state = item.target;
    switch (item.op) {
      case 'char': state.committed += item.value; paint(state); break;
      case 'compose': state.composing += item.value; paint(state); break;
      case 'commit': state.committed += item.value; state.composing = ''; paint(state); break;
      case 'back': state.committed = state.committed.slice(0, -1); paint(state); break;
      case 'dot': dot.hidden = false; break;
      case 'title-done': title.classList.replace('is-typing', 'is-done'); break;
      case 'begin': lines[item.value].typed.classList.add('is-typing'); break;
      case 'line-done': lines[item.value].typed.classList.replace('is-typing', 'is-done'); break;
      default: break;  // wait：纯停顿
    }
  }
  let index = 0;
  function step() {
    if (stopped) return;
    if (index >= plan.length) return;
    const item = plan[index++];
    timer = setTimeout(() => {
      if (stopped) return;
      apply(item);
      step();
    }, item.wait);
  }
  dot.hidden = true;
  title.classList.add('is-typing');
  titleText.textContent = '';
  lines.forEach(line => { line.text.textContent = ''; });
  step();
  reduced.addEventListener('change', () => { if (reduced.matches) settle(); }, { signal });
  return () => { stopped = true; clearTimeout(timer); };
}

export function mountAbout(root, reduced) {
  const listeners = new AbortController();
  const { signal } = listeners;
  const ascii = root.querySelector('.about-ascii');
  const fieldSwitch = root.querySelector('.about-field-switch');
  // 字符场开关：关闭=隐藏画布并停帧，再打开重新起场；偏好存本地，刷新与切页都记住。
  let stopAscii = () => {};
  function setField(on) {
    if (ascii) ascii.hidden = !on;
    fieldSwitch?.setAttribute('aria-checked', String(on));
    if (on && ascii) stopAscii = mountAsciiField(ascii, root.querySelector('.about-intro h1'), { gain: matchMedia('(hover: none)').matches ? .8 : .34 });
    else { stopAscii(); stopAscii = () => {}; }
  }
  let fieldOff = false;
  try { fieldOff = localStorage.getItem('belate:about-field-off') === '1'; } catch { /* 存储不可用时按默认开启处理 */ }
  setField(!fieldOff);
  fieldSwitch?.addEventListener('click', () => {
    const on = fieldSwitch.getAttribute('aria-checked') !== 'true';
    try { localStorage.setItem('belate:about-field-off', on ? '0' : '1'); } catch { /* 同上 */ }
    setField(on);
  }, { signal });
  const agents = root.querySelector('.about-agents');
  const stopTyping = mountIntroTyping(root, reduced, signal);
  const stopStrip = mountAgentStrip(agents, reduced, signal);
  const zone = root.querySelector('.about-social-zone');
  const card = zone.querySelector('.about-social');
  const qr = card.querySelector('.about-qr');

  // 压感倾斜：指针在表面内移动 → 卡片跟着转出微角度 + 高光跟随。社交卡与爱好卡共用一套参数。
  function mountTilt(surface, target, blocked = () => false) {
    let tiltFrame;
    const settle = () => {
      cancelAnimationFrame(tiltFrame);
      for (const name of ['--social-rotate-x', '--social-rotate-y', '--social-light-x', '--social-light-y']) target.style.removeProperty(name);
    };
    surface.addEventListener('pointermove', event => {
      if (reduced.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(tiltFrame);
      tiltFrame = requestAnimationFrame(() => {
        if (blocked()) return;
        const box = surface.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, 2 * (event.clientX - box.left) / box.width - 1));
        const y = Math.max(-1, Math.min(1, 2 * (event.clientY - box.top) / box.height - 1));
        target.style.setProperty('--social-rotate-x', `${y * -5.5}deg`);
        target.style.setProperty('--social-rotate-y', `${x * 5}deg`);
        target.style.setProperty('--social-light-x', `${50 + x * 43}%`);
        target.style.setProperty('--social-light-y', `${40 + y * 35}%`);
      });
    }, { passive: true, signal });
    surface.addEventListener('pointerleave', () => { if (!blocked()) settle(); }, { signal });
    return settle;
  }
  const settleCard = mountTilt(zone, card, () => qr.getAttribute('aria-expanded') === 'true');
  document.getElementById('image-dialog').addEventListener('close', () => {
    if (!zone.matches(':hover')) settleCard();
  }, { signal });
  reduced.addEventListener('change', settleCard, { signal });

  // 社交卡彩蛋：点击在指针处冒一个随机“属性+1”，连点 20 次挂出“好运+999”，
  // 同点放一小簇烟花并让全页卡片震一下。烟花画在 360px 的局部画布上，不铺全屏。
  const SOCIAL_WORDS = ['魅力', '颜值', '才华', '勇敢', '果断', '余额', '自由'];
  const FIREWORK_COLORS = ['#0b5c43', '#c4542a', '#b8860b', '#2f6f80', '#9c3f38', '#fff1cf'];
  const quakeCards = [...root.querySelectorAll('.about-social, .hobby-post, .glass-card')];
  const floats = document.createElement('div');
  floats.className = 'social-float-layer';
  floats.setAttribute('aria-hidden', 'true');
  document.body.append(floats);
  let clicks = 0;
  let clickTimer = 0;

  function floatWord(x, y, text, jackpot) {
    const span = document.createElement('span');
    span.className = `social-plus${jackpot ? ' social-plus--jackpot' : ''}`;
    span.textContent = text;
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    floats.append(span);
    const drift = Math.random() * 26 - 13;
    const rise = jackpot ? 86 : 48;
    const duration = jackpot ? 2600 : 920;
    // 位移与透明度分开走：位移吃缓出曲线，透明度走线性，免得整段缓动把“完全可见”的区间压到开头几十毫秒。
    const fade = span.animate(
      [{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .72 }, { opacity: 0 }],
      { duration, easing: 'linear' },
    );
    const done = [fade.finished];
    if (!reduced.matches) {
      const motion = span.animate([
        { transform: 'translate(-50%, -50%) scale(.72)' },
        { transform: `translate(calc(-50% + ${drift * .35}px), calc(-50% - ${rise * .35}px)) scale(1.04)`, offset: .22 },
        { transform: `translate(calc(-50% + ${drift * .7}px), calc(-50% - ${rise * .7}px)) scale(1)`, offset: .68 },
        { transform: `translate(calc(-50% + ${drift}px), calc(-50% - ${rise}px)) scale(.98)` },
      ], { duration, easing: 'cubic-bezier(.16,1,.3,1)' });
      done.push(motion.finished);
    }
    Promise.all(done).then(() => span.remove(), () => span.remove());
  }

  function firework(x, y) {
    if (reduced.matches) return;
    const size = Math.min(680, Math.max(400, Math.round(Math.min(innerWidth, innerHeight) * .85)));
    const scale = size / 360;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const canvas = document.createElement('canvas');
    canvas.className = 'social-fireworks';
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px`;
    floats.append(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }
    ctx.scale(dpr, dpr);
    const bursts = [
      { start: 0, ox: 0, oy: -38 * scale, count: 68, power: 3.2 * scale, color: '#c99a2e' },
      { start: 140, ox: -62 * scale, oy: 8 * scale, count: 50, power: 2.6 * scale, color: '#c4542a' },
      { start: 290, ox: 58 * scale, oy: -6 * scale, count: 54, power: 2.8 * scale, color: '#2f6f80' },
      { start: 430, ox: -6 * scale, oy: 16 * scale, count: 38, power: 2.3 * scale, color: '#9c3f38' },
    ];
    const sparks = [];
    const started = performance.now();
    let last = started;
    let next = 0;
    function spawn(burst) {
      for (let i = 0; i < burst.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = burst.power * (.45 + Math.random() * .75);
        sparks.push({
          x: size / 2 + burst.ox, y: size / 2 + burst.oy,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 0, max: 900 + Math.random() * 560,
          color: FIREWORK_COLORS[(Math.random() * FIREWORK_COLORS.length) | 0],
          width: (1.5 + Math.random() * 1.5) * Math.sqrt(scale),
        });
      }
    }
    function frame(now) {
      if (!canvas.isConnected) return;
      const dt = Math.min(34, now - last);
      last = now;
      const step = dt / 16.67;
      const elapsed = now - started;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.14)';
      ctx.fillRect(0, 0, size, size);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round';
      while (next < bursts.length && elapsed >= bursts[next].start) spawn(bursts[next++]);
      for (const burst of bursts) {
        const age = elapsed - burst.start;
        if (age >= 0 && age < 260) {
          const k = 1 - age / 260;
          ctx.globalAlpha = k * .45;
          ctx.fillStyle = '#fff2c9';
          ctx.beginPath();
          ctx.arc(size / 2 + burst.ox, size / 2 + burst.oy, (7 + 26 * (1 - k)) * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = k * .4;
          ctx.strokeStyle = burst.color;
          ctx.lineWidth = 1.4 * Math.sqrt(scale);
          ctx.beginPath();
          ctx.arc(size / 2 + burst.ox, size / 2 + burst.oy, (18 + 72 * (1 - k)) * scale, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      for (const spark of sparks) {
        if (spark.life >= spark.max) continue;
        const px = spark.x;
        const py = spark.y;
        spark.x += spark.vx * step;
        spark.y += spark.vy * step;
        spark.vx *= .985 ** step;
        spark.vy = spark.vy * .985 ** step + .055 * scale * step;
        spark.life += dt;
        const alpha = Math.max(0, 1 - spark.life / spark.max);
        ctx.strokeStyle = spark.color;
        ctx.globalAlpha = alpha * .2;
        ctx.lineWidth = spark.width * alpha * 3.2 + 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(spark.x, spark.y);
        ctx.stroke();
        ctx.globalAlpha = alpha * .95;
        ctx.lineWidth = spark.width * alpha + .5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(spark.x, spark.y);
        ctx.stroke();
        ctx.fillStyle = spark.color;
        ctx.globalAlpha = alpha * .85;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, Math.max(.6, spark.width * .85 * alpha), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (elapsed < 2600) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  function quake() {
    if (reduced.matches) return;
    for (const target of quakeCards) {
      target.classList.remove('card-quake');
      void target.offsetWidth;
      target.classList.add('card-quake');
      const animation = target.getAnimations().find(item => item.animationName === 'card-quake');
      animation?.finished.then(() => target.classList.remove('card-quake'), () => {});
    }
  }

  card.addEventListener('click', event => {
    if (event.target.closest('a, button')) return;
    const x = event.clientX;
    const y = event.clientY;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clicks = 0; }, 1600);
    if (++clicks >= 20) {
      clicks = 0;
      clearTimeout(clickTimer);
      floatWord(x, y, '好运+999', true);
      firework(x, y - 34);
      quake();
      return;
    }
    floatWord(x, y, `${SOCIAL_WORDS[(Math.random() * SOCIAL_WORDS.length) | 0]}+1`, false);
  }, { signal });

  for (const post of root.querySelectorAll('.hobby-post')) {
    const settle = mountTilt(post, post);
    reduced.addEventListener('change', settle, { signal });
  }

  // 爱好图组：原比例两端对齐——逐行定高、行内宽=比例×行高（横图行自然少放几张），间隙 8px 配平。
  // 项=裸 img（游戏/烹饪）或 figure（追剧等带名图块），宽都落在项上。
  function layoutShots(panel) {
    const width = panel.clientWidth;
    if (!width) return;
    const gap = 8;
    const target = width < 520 ? 116 : 168;
    let row = [];
    let ratioSum = 0;
    const rows = [];
    for (const item of panel.children) {
      const img = item.matches('img') ? item : item.querySelector('img');
      if (!img) continue;
      const ratio = Number(img.getAttribute('width')) / Number(img.getAttribute('height')) || 1;
      row.push({ item, img, ratio });
      ratioSum += ratio;
      if (ratioSum * target + gap * (row.length - 1) >= width) {
        rows.push({ items: row, ratio: ratioSum });
        row = [];
        ratioSum = 0;
      }
    }
    if (row.length) rows.push({ items: row, ratio: ratioSum });
    rows.forEach((r, index) => {
      const last = index === rows.length - 1;
      const h = last
        ? Math.min(target, (width - gap * (r.items.length - 1)) / r.ratio)
        : (width - gap * (r.items.length - 1)) / r.ratio;
      for (const { item, img, ratio } of r.items) {
        const w = Math.max(1, ratio * h - .3);
        item.style.width = `${w.toFixed(2)}px`;
        if (item === img) img.style.height = `${h.toFixed(2)}px`;
      }
    });
  }

  // 折叠/展开：洗牌式交错——展开自上而下逐张亮起，收起自下而上原路收回（柔和、非线性）。
  const foldAnimations = new WeakMap();
  function playFold(details, open) {
    const panel = details.querySelector('.hobby-shots');
    const items = [...panel.children];
    for (const animation of foldAnimations.get(details) ?? []) animation.stop();
    const animations = [];
    foldAnimations.set(details, animations);
    if (reduced.matches) {
      details.open = open;
      panel.style.height = '';
      if (open) layoutShots(panel);
      for (const el of items) { el.style.opacity = ''; el.style.transform = ''; }
      return;
    }
    if (open) {
      details.open = true;
      layoutShots(panel);
      const h = panel.scrollHeight;
      animations.push(animate(panel, { height: [0, h] }, { duration: .5, ease: [.16, 1, .3, 1] }));
      items.forEach((el, i) => animations.push(animate(el,
        { opacity: [0, 1], y: [16, 0], scale: [.97, 1] },
        { duration: .42, delay: .08 + i * .045, ease: [.16, 1, .3, 1] })));
      animations[0].finished.then(() => { if (details.open) panel.style.height = ''; }).catch(() => {});
    } else {
      const h = panel.scrollHeight;
      panel.style.height = `${h}px`;
      [...items].reverse().forEach((el, i) => animations.push(animate(el,
        { opacity: [1, 0], y: [0, -10] },
        { duration: .3, delay: i * .035, ease: [.4, 0, 1, 1] })));
      const close = animate(panel, { height: [h, 0] }, { duration: .38, delay: .12, ease: [.4, 0, .6, 1] });
      animations.push(close);
      close.finished.then(() => {
        details.open = false;
        panel.style.height = '';
        for (const el of items) { el.style.opacity = ''; el.style.transform = ''; }
      }).catch(() => {});
    }
  }
  for (const details of root.querySelectorAll('.hobby-fold')) {
    details.querySelector('summary').addEventListener('click', event => {
      event.preventDefault();
      playFold(details, !details.open);
    }, { signal });
    details.addEventListener('toggle', () => { if (details.open) layoutShots(details.querySelector('.hobby-shots')); }, { signal });
  }
  window.addEventListener('resize', () => {
    for (const details of root.querySelectorAll('.hobby-fold')) {
      if (details.open) layoutShots(details.querySelector('.hobby-shots'));
    }
  }, { passive: true, signal });

  return () => {
    listeners.abort();
    stopStrip();
    stopAscii();
    stopTyping();
    clearTimeout(clickTimer);
    floats.remove();
  };
}
