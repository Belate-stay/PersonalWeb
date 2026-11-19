/*! MIT License — 网页复刻 FreeChat Android「新功能推荐！」导览页的演示卡内容（FeatureRecPage.kt, Beta 1.1.31）
    四卡 2×2 的手机竖幅：群聊 / 多角色文本 / 生成当前场景图 / 接入微信。只取卡片本体，不做标题/翻页。
    四卡同进同播；各卡自带「重播」只重播自己；一次刷新只自动播一轮（此后滚动/切页都不再触发）。
    节拍、文案、配色、入场曲线取自安卓源码：
    群聊 beats=[400,800×7]、文本 [400,250,1800,1500,1400,1400,1400,1600]、消息入场 460ms cubic-bezier(.2,.48,.25,1) 上移 22dp、
    正文 50 字/秒逐字、引语着色 readableLinkBlue #0759B5。
    场景图卡取自 SceneImagePrompt / ImageGenerationPlaceholder / ImageRevealPolicy 的实现观感：
    20 列有序点阵呼吸 → 槽位从 1:1 长成图片真实画幅（本项目素材 3:2）→ 圆角揭示 + 掠光；
    文案「场景图仅提供视觉呈现」与「生成当前场景图」均按 AppStrings 原文。
    微信卡按微信聊天界面复刻：导航栏「对方正在输入…」、分条短消息、语音气泡、绿/白气泡与时间戳。
    布局纪律：全部内容（含未打出的字）从第一帧就占好位（visibility/opacity 隐藏），卡片高度恒定不跳。 */

import { animate } from './vendor/motion.js';
import { asset } from './content.js';

const CARD_BEATS = [
  [400, 800, 800, 800, 800, 800, 800, 800],          // 群聊：7 条各占一拍
  [400, 250, 1800, 1500, 1400, 1400, 1400, 1600],    // 文本：思考 1.8s + 逐字 + 尾拍
  [500, 900, 900, 800, 700, 2600, 1200],             // 场景图（剧情补足）：用户 → 思考 → 逐字 → 菜单 → 生成 → 揭示
  [500, 900, 900, 1200, 900, 1400, 1300],            // 微信：逐条接话 + 输入中
];
const CARD_LAST = [8, 8, 7, 7];
const CHARS_PER_SECOND = 50;

const GROUP_SCRIPT = [
  [null, '晚上去吃自助餐吧'],
  [null, '轻奢一把'],
  ['mo', '吃啥？'],
  ['mo', '烤肉？披萨？牛排？'],
  [null, '都行'],
  ['xu', '陪对象呢没空'],
  ['zhou', '去不了，导员非要让我当志愿者'],
];
const MEMBERS = { mo: ['林', '林墨'], xu: ['许', '许舟'], zhou: ['周', '周屿'] };
// 场景卡台词=1.1.31「新功能推荐！」原稿（11-18 从 v1222 baseline APK 的 DEX 与 UI dump 取回）。
const SCENE_USER = '我夹了一块糖醋里脊，放到她的碗中，嘴角轻扬一下：“吃饭还堵不住你的嘴。”眉眼温柔，话语中满是宠溺，像抹了蜜一般。';
const SCENE_REPLY = '她鼓了鼓腮帮子，轻声“哼”了一声，将里脊肉塞进嘴里。吃得急，嘴角沾了些酱料。';
const STORY_INPUT = '深夜的旧钟楼下，三个年轻人在雨里捡到一封没有署名的信。林墨性急，撕开就要念出来；许舟谨慎，抢过来坚持先报警；周屿一言不发，蹲下指着信封上那只湿透的蓝蝴蝶。写一段群像戏：夜色、雨声、争执都要有，结尾把悬念留在蝴蝶上。要有对话，也要有每个人的小动作。';
const STORY_TEXT = '雨水顺着钟楼的檐角往下淌。林墨的手指已经挑开信封一角，被许舟一把按住：“别急——万一是什么证据呢？”他压低声音，眼睛却一直望着街口闪烁的警灯。\n\n周屿蹲下身，把伞倾向那枚蓝蝴蝶。蜡印浸了雨水也不褪色，翅膀的纹路细得像拿针尖画上去的。“你们看，”他轻声说，“和上周展览丢的那枚邮票，一模一样。”\n\n三个人同时安静下来，雨声忽然变得很响。林墨把信封举到路灯下，翻来覆去地看；许舟掏出手机，对着蝴蝶连拍了几张；周屿缓缓回过头——钟楼的门不知何时开了一道缝，门后的黑暗里，似乎也有一双眼睛，正一眨不眨地看着他们。\n\n“谁也别碰。”许舟把外套脱下来罩住信封，声音发紧，“等天亮，一起交给警察。”林墨咽了咽口水，把手缩了回来。';
const SCENE_IMAGE = asset('feature-rec-scene.webp');
const PHASES = ['连接模型…', '理解内容…', '拟草回复…'];

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const PERSON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm0 1.8c-3.6 0-8.4 1.8-8.4 4.2v1.8h16.8v-1.8c0-2.4-4.8-4.2-8.4-4.2Z"/></svg>';

// NarrativeDialogueText.ranges 的移植：成对引号（含未闭合的直播引号）整体着色。
function quoteFlags(text) {
  const flags = Array.from(text, () => false);
  const open = [];
  Array.from(text).forEach((char, index) => {
    if (char === '“' || char === '「') open.push([char, index]);
    else if (char === '”' || char === '」') {
      const expected = char === '”' ? '“' : '「';
      if (open.length && open[open.length - 1][0] === expected) {
        const [, start] = open.pop();
        if (!open.length) for (let i = start; i <= index; i++) flags[i] = true;
      }
    }
  });
  if (open.length) for (let i = open[0][1]; i < flags.length; i++) flags[i] = true;
  return flags;
}

function textMarkup(text) {
  const chars = Array.from(text);
  const flags = quoteFlags(text);
  const paragraphs = [[]];
  chars.forEach((char, i) => {
    if (char === '\n' && chars[i + 1] === '\n') { paragraphs.push([]); return; }
    if (char === '\n') return;
    paragraphs[paragraphs.length - 1].push([char, flags[i]]);
  });
  return paragraphs.map(runs => {
    let html = '', quote = null;
    for (const [char, flag] of runs) {
      if (flag !== quote) {
        if (quote) html += '</span>';
        if (flag) html += '<span class="fr-quote">';
        quote = flag;
      }
      html += `<span class="fr-char">${esc(char)}</span>`;
    }
    return `<p>${html}${quote ? '</span>' : ''}</p>`;
  }).join('');
}

function groupRowMarkup([sender, text], index) {
  const me = sender === null;
  const [letter, name] = me ? [null, '我'] : MEMBERS[sender];
  const avatar = me
    ? `<i class="fr-avatar fr-avatar--me" aria-hidden="true">${PERSON_SVG}</i>`
    : `<i class="fr-avatar" aria-hidden="true">${letter}</i>`;
  const col = `<div class="fr-col"><span class="fr-who">${name}</span><div class="fr-bubble"><p>${esc(text)}</p></div></div>`;
  // GroupMessageFrame：AI 行头像在左，「我」行头像在右。
  return `<div class="fr-row fr-pending${me ? ' fr-row--me' : ''}" data-fr-stage="${index + 1}">
    ${me ? col + avatar : avatar + col}</div>`;
}

const groupRows = () => GROUP_SCRIPT.map(groupRowMarkup).join('');
const storyRows = () => `
  <div class="fr-row fr-row--me fr-pending" data-fr-stage="1">
    <div class="fr-col"><div class="fr-bubble fr-bubble--wide"><p>${esc(STORY_INPUT)}</p></div></div>
  </div>
  <div class="fr-row fr-row--story fr-pending" data-fr-stage="2">
    <div class="fr-story-wrap">
      <div class="fr-chip"><i class="fr-orb"></i><div><span class="fr-phase"></span><time class="fr-timer">0ms</time></div></div>
      <div class="fr-story">${textMarkup(STORY_TEXT)}</div>
    </div>
  </div>`;

// 卡 3：剧情补足（不是聊天模式）—— 用户投喂一段情境，AI 回复是文字流不加气泡框、逐字出现；
// 再由「+」菜单「生成当前场景图」→ 点阵生成 → 圆角揭示成 3:2 场景图。
const sceneCard = () => `
  <div class="fr-body fr-body--scene">
    <div class="fr-scene-chat">
      <div class="fr-row fr-row--me fr-pending" data-fr-stage="1">
        <div class="fr-col"><div class="fr-bubble fr-bubble--wide"><p>${esc(SCENE_USER)}</p></div></div>
      </div>
      <div class="fr-row fr-row--story fr-pending" data-fr-stage="2">
        <div class="fr-story-wrap">
          <div class="fr-chip" data-fr-scene-chip><i class="fr-orb"></i><div><span class="fr-phase"></span><time class="fr-timer">0ms</time></div></div>
          <div class="fr-story fr-scene-story">${textMarkup(SCENE_REPLY)}</div>
        </div>
      </div>
      <div class="fr-row fr-row--scene fr-pending fr-await" data-fr-stage="5">
        <div class="fr-col fr-scene-col">
          <span class="fr-scene-note">场景图仅提供视觉呈现</span>
          <div class="fr-scene-slot" data-fr-scene-slot>
            <canvas class="fr-dots" aria-hidden="true"></canvas>
            <img class="fr-scene-img" src="${SCENE_IMAGE}" alt="生成的场景图：烛光晚餐" decoding="async">
            <i class="fr-scene-glint" aria-hidden="true"></i>
          </div>
          <div class="fr-scene-tools" data-fr-scene-tools>
            <span class="fr-scene-meta"><span data-fr-scene-status>生成中…</span><time data-fr-scene-time>0ms</time></span>
            <span class="fr-scene-acts" aria-hidden="true"><i class="fr-act fr-act--trash"></i><i class="fr-act fr-act--refresh"></i></span>
          </div>
        </div>
      </div>
    </div>
    <div class="fr-scene-dock" data-fr-dock>
      <div class="fr-scene-menu" role="menu" aria-hidden="true">
        <button class="fr-scene-menu-row" type="button" tabindex="-1" disabled><i class="fr-menu-ico" aria-hidden="true">▧</i>上传图片</button>
        <button class="fr-scene-menu-row fr-scene-menu-row--primary" type="button" tabindex="-1" data-fr-scene-item><i class="fr-menu-ico" aria-hidden="true">✦</i>生成当前场景图</button>
      </div>
      <div class="fr-composer">
        <i class="fr-composer-plus" aria-hidden="true">+</i>
        <span class="fr-composer-input">和朋友聊天…</span>
        <i class="fr-composer-send" aria-hidden="true">↑</i>
      </div>
    </div>
  </div>`;

// 卡 4：微信聊天界面 —— 分条短消息、对方正在输入。外部微信通道只发文本（ilink text_item），不画语音气泡。
const WX_MESSAGE = (stage, text) => `
  <div class="fr-wx-row fr-pending" data-fr-stage="${stage}">
    <i class="fr-wx-avatar" aria-hidden="true">林</i>
    <div class="fr-wx-bubble">${text}</div>
  </div>`;

const wechatCard = () => `
  <div class="fr-wx">
    <div class="fr-wx-status" aria-hidden="true"><span>22:47</span><span class="fr-wx-status-icons"><i></i><i></i><i></i></span></div>
    <div class="fr-wx-nav">
      <i class="fr-wx-back" aria-hidden="true"></i>
      <div class="fr-wx-title"><strong>林墨</strong><span class="fr-wx-typing">对方正在输入…</span></div>
      <i class="fr-wx-more" aria-hidden="true">···</i>
    </div>
    <div class="fr-wx-chat">
      <p class="fr-wx-stamp fr-pending" data-fr-stage="1">昨天 23:12</p>
      ${WX_MESSAGE(1, '到家跟我说一声。')}
      <p class="fr-wx-stamp fr-pending" data-fr-stage="2">22:47</p>
      ${WX_MESSAGE(2, '到家了吗？')}
      ${WX_MESSAGE(3, '今晚那家店，甜点比主菜好吃。')}
      <div class="fr-wx-row fr-wx-row--me fr-pending" data-fr-stage="4">
        <div class="fr-wx-bubble">刚到家。你还在路上？</div>
        <i class="fr-wx-avatar fr-wx-avatar--me" aria-hidden="true">${PERSON_SVG}</i>
      </div>
      ${WX_MESSAGE(5, '还在路上')}
      ${WX_MESSAGE(6, '刚拐过钟楼，路灯下全是梧桐的影子。')}
      ${WX_MESSAGE(7, '有点像你会写的那种句子。')}
    </div>
    <div class="fr-wx-composer" aria-hidden="true">
      <i class="fr-wx-icon fr-wx-icon--voice"></i>
      <span class="fr-wx-input"></span>
      <i class="fr-wx-icon fr-wx-icon--smile"></i>
      <i class="fr-wx-icon fr-wx-icon--plus">+</i>
    </div>
  </div>`;

export function featureRecDemoHtml() {
  return `<div class="fr-stage">
    <div class="fr-world">
      <div class="fr-demo">
        <figure class="fr-cell"><div class="fr-card"><div class="fr-body">${groupRows()}</div></div><figcaption><span class="fr-cap">多角色群聊 · 微信式逐条接话</span><button class="fr-replay" type="button" data-fr-card="0" aria-label="重播：多角色群聊">重播 ↻</button></figcaption></figure>
        <figure class="fr-cell"><div class="fr-card"><div class="fr-body">${storyRows()}</div></div><figcaption><span class="fr-cap">多角色文本 · 逐字生成故事</span><button class="fr-replay" type="button" data-fr-card="1" aria-label="重播：多角色文本">重播 ↻</button></figcaption></figure>
        <figure class="fr-cell"><div class="fr-card fr-card--scene">${sceneCard()}</div><figcaption><span class="fr-cap">生成当前场景图 · 把这一刻画下来</span><button class="fr-replay" type="button" data-fr-card="2" aria-label="重播：生成当前场景图">重播 ↻</button></figcaption></figure>
        <figure class="fr-cell"><div class="fr-card fr-card--wx">${wechatCard()}</div><figcaption><span class="fr-cap">接入微信 · 在微信里继续聊</span><button class="fr-replay" type="button" data-fr-card="3" aria-label="重播：接入微信">重播 ↻</button></figcaption></figure>
      </div>
    </div>
    <span class="fr-cursor" aria-hidden="true"><svg viewBox="0 0 20 24"><path d="M2 2l14 10-6.2 1.4L13 20l-3.4 1.6-3.2-6.6L2 19z" fill="#fff" stroke="#1c2a21" stroke-width="1.4" stroke-linejoin="round"/></svg></span>
  </div>`;
}

const formatThinkingTime = ms => ms < 1000 ? `${ms}ms` : ms < 60_000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.floor(ms / 60_000)}m${Math.floor(ms % 60_000 / 1000)}s`;

// —— 场景图点阵（ImageDotMotion / ImageRevealPolicy 的网页移植）——
const DOT_COLUMNS = 20;
const smoothStep = (from, to, value) => {
  const x = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return x * x * (3 - 2 * x);
};
const bump = (x, y, radius) => 1 - smoothStep(0, radius, Math.hypot(x, y));
const edgeOpacity = (x, y) => {
  const qx = Math.abs(x - .5) - (.5 - .14);
  const qy = Math.abs(y - .5) - (.5 - .14);
  const distance = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - .14;
  return smoothStep(0, .08, -distance);
};
function dotFrame(t) {
  const ramp = smoothStep(0, 1.8, t);
  return {
    ax: .24 + .25 * Math.sin(t * .16), ay: .32 + .22 * Math.sin(t * .18 + .4),
    aw: ramp * (.55 + .40 * Math.sin(t * .65)),
    bx: .66 + .21 * Math.sin(t * .13 + 1.8), by: .67 + .20 * Math.sin(t * .15 + 3.1),
    bw: ramp * (.55 + .40 * Math.sin(t * .55 + 2.2)),
    cx: .48 + .24 * Math.sin(t * .12 + 3.9), cy: .45 + .23 * Math.sin(t * .17 + 5.1),
    cw: ramp * (.55 + .40 * Math.sin(t * .49 + 4.5)),
    sheenCenter: .50 + .65 * Math.sin(t * .16 - 1.2), ramp,
    growth: .04 + .58 * smoothStep(0, 2.2, t),
  };
}
function mountDots(canvas) {
  const ctx = canvas.getContext('2d');
  let raf = 0, started = 0, running = false, observer = null;
  const fit = () => {
    const box = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(box.width * dpr));
    canvas.height = Math.max(1, Math.round(box.height * dpr));
  };
  function draw(now) {
    if (!running) return;
    const t = (now - started) / 1000;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const f = dotFrame(t);
    const cell = w / DOT_COLUMNS;
    const rows = Math.max(1, Math.round(h / cell));
    const originY = (h - rows * cell) / 2;
    for (let row = 0; row < rows; row++) for (let column = 0; column < DOT_COLUMNS; column++) {
      const x = (column + .5) * cell / w;
      const y = ((row + .5) * cell + originY) / h;
      const edge = edgeOpacity(x, y);
      if (edge <= 0) continue;
      const strength = f.growth + (1 - f.growth) * (1 - (1 - bump(x - f.ax, y - f.ay, .40) * f.aw)
        * (1 - bump(x - f.bx, y - f.by, .44) * f.bw) * (1 - bump(x - f.cx, y - f.cy, .38) * f.cw));
      const sheen = f.ramp * (1 - smoothStep(0, .23, Math.abs(.72 * x + .28 * y - f.sheenCenter)));
      const mix = .28 * strength + .42 * sheen;
      const radius = cell * (0.065 + (0.24 - 0.065) * Math.min(1, Math.max(0, strength)));
      ctx.beginPath();
      ctx.arc((column + .5) * cell, (row + .5) * cell + originY, Math.max(.4, radius), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(119, ${Math.round(96 - 4 * mix)}, ${Math.round(68 - 7 * mix)}, ${(.26 + .10 * mix) * edge})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  return {
    start() {
      if (running) return;
      running = true;
      started = performance.now();
      fit();
      observer = new ResizeObserver(fit);
      observer.observe(canvas.parentElement);
      raf = requestAnimationFrame(draw);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      observer = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}

// 一次刷新只自动演一轮：闩锁挂在模块上（同一次页面加载里反复进出/滚动都只演一次），手动重播不受限。
let autoPlayed = false;

export function mountFeatureRecDemo(root, { reduced } = {}) {
  if (!root || root.dataset.frMounted) return () => {};
  root.dataset.frMounted = '';
  root.innerHTML = featureRecDemoHtml();
  const stage = root.querySelector('.fr-stage');
  const world = root.querySelector('.fr-world');
  const cursor = root.querySelector('.fr-cursor');
  const demo = root.querySelector('.fr-demo');
  const cells = [...demo.querySelectorAll('.fr-cell')];
  const quiet = () => reduced?.matches ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
  const states = CARD_LAST.map(() => ({ stage: 0, elapsed: 0, typed: 0, delay: 0 }));
  const chars = [...cells[1].querySelectorAll('.fr-char')];
  const chip = cells[1].querySelector('.fr-chip');
  const phaseEl = cells[1].querySelector('.fr-phase');
  const timerEl = cells[1].querySelector('.fr-timer');
  const storyStart = { at: 0 };
  const sceneSlot = cells[2].querySelector('[data-fr-scene-slot]');
  const sceneImg = cells[2].querySelector('.fr-scene-img');
  const sceneDock = cells[2].querySelector('[data-fr-dock]');
  const sceneMenu = cells[2].querySelector('.fr-scene-menu');
  const sceneItem = cells[2].querySelector('[data-fr-scene-item]');
  const sceneTools = cells[2].querySelector('[data-fr-scene-tools]');
  const sceneStatus = cells[2].querySelector('[data-fr-scene-status]');
  const sceneTime = cells[2].querySelector('[data-fr-scene-time]');
  const sceneChars = [...cells[2].querySelectorAll('.fr-scene-story .fr-char')];
  const sceneChip = cells[2].querySelector('[data-fr-scene-chip]');
  const scenePhase = cells[2].querySelector('[data-fr-scene-chip] .fr-phase');
  const sceneTimer = cells[2].querySelector('[data-fr-scene-chip] .fr-timer');
  const dots = mountDots(cells[2].querySelector('.fr-dots'));
  const wxTyping = cells[3].querySelector('.fr-wx-typing');
  const scenePress = { timer: 0 };
  const sceneGen = { at: 0 };
  const sceneThink = { at: 0 };
  const sceneType = { at: 0 };
  let revealTimer = 0;
  let running = false, lastFrame = 0;

  // —— 代码运镜：自动推拉镜头 + 合成光标点击，像一段静音的应用录屏 ——
  let cameraToken = 0;
  let cameraClicking = false;
  let cameraAnimations = [];

  function stopCamera() {
    cameraToken++;
    // 用户取回控制权：微信卡别再等运镜的时刻表
    if (states[3]) states[3].delay = 0;
    cameraAnimations.forEach(animation => animation.stop());
    cameraAnimations = [];
    if (world) world.style.transform = '';
    if (cursor) { cursor.style.opacity = ''; cursor.style.transform = ''; }
    stage?.querySelectorAll('.fr-ripple').forEach(ripple => ripple.remove());
    demo.querySelectorAll('.fr-replay.is-pressed').forEach(button => button.classList.remove('is-pressed'));
  }

  function cameraWait(ms, token) {
    return new Promise(resolve => setTimeout(() => resolve(token === cameraToken), ms));
  }

  function cameraPlay(element, keyframes, options, token) {
    const animation = animate(element, keyframes, options);
    cameraAnimations.push(animation);
    return animation.finished.then(() => token === cameraToken).catch(() => false);
  }

  async function clickAt(element, point, token) {
    cameraClicking = true;
    element.classList.add('is-pressed');
    const ripple = document.createElement('i');
    ripple.className = 'fr-ripple';
    ripple.style.left = `${point.x}px`;
    ripple.style.top = `${point.y}px`;
    stage.append(ripple);
    setTimeout(() => element.classList.remove('is-pressed'), 170);
    setTimeout(() => ripple.remove(), 640);
    cameraClicking = false;
    return cameraWait(200, token);
  }

  // 单列布局不做跨卡运镜（画面要跨越四张竖卡，推拉会失焦）。
  const cameraEligible = () => !quiet() && stage && world && cursor
    && getComputedStyle(demo).gridTemplateColumns.trim().split(/\s+/).length >= 2;

  function runCamera() {
    if (!cameraEligible()) return;
    const token = ++cameraToken;
    const buttons = [...demo.querySelectorAll('.fr-replay')];
    if (buttons.length < 4) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const worldBox = world.getBoundingClientRect();
    const pointOf = element => {
      const box = element.getBoundingClientRect();
      return { x: box.left - worldBox.left + box.width / 2, y: box.top - worldBox.top + box.height / 2 };
    };
    const plus = cells[2].querySelector('.fr-composer-plus');
    const sceneView = cells[2].querySelector('.fr-scene-slot');
    const wxView = cells[3].querySelector('.fr-wx-chat');
    const sceneReplay = buttons[2];
    const camera = (scale, point) => ({ scale, x: width / 2 - point.x * scale, y: height / 2 - point.y * scale });
    const screenPoint = (point, cam) => ({ x: cam.x + point.x * cam.scale, y: cam.y + point.y * cam.scale });
    // 根据内容缩放：让目标卡占到舞台约 62% 宽，随实际卡宽换算。
    const frameOf = (element, ratio = .62) => {
      const box = element.getBoundingClientRect();
      const scale = Math.min(1.46, Math.max(1.14, width * ratio / box.width));
      return camera(scale, pointOf(element));
    };
    const ease = [.16, 1, .3, 1];
    const at = point => screenPoint(point, { scale: 1, x: 0, y: 0 });
    const cursorAt = point => point; // 箭头尖对齐点击点，涟漪与指针不打架
    // 所有锚点必须在世界变换开始前量好（pointOf 依赖未缩放的 worldBox）。
    const sceneFocus = pointOf(sceneView);
    const wxFocus = pointOf(wxView);
    const slotWidth = sceneView.getBoundingClientRect().width;
    const sceneFocusAfter = { x: sceneFocus.x, y: sceneFocus.y - slotWidth / 6 }; // 1:1→3:2 后槽位中心上移
    const sceneCam = frameOf(cells[2].querySelector('.fr-card'));
    const wxCam = frameOf(cells[3].querySelector('.fr-card'), .6);
    const startPoint = at(pointOf(sceneReplay));
    cursor.style.transform = `translate(${startPoint.x + 92}px, ${startPoint.y + 64}px)`;
    cursor.style.opacity = '0';
    (async () => {
      if (!(await cameraPlay(cursor, { opacity: 1 }, { duration: .3, ease: 'linear' }, token))) return;
      // 1) 点「重播」：场景图卡开演
      if (!(await cameraPlay(cursor, { x: startPoint.x, y: startPoint.y }, { duration: .55, ease }, token))) return;
      if (!(await clickAt(sceneReplay, startPoint, token))) return;
      // 剧情补足的台词先走完（思考 + 逐字），光标在「+」旁等菜单开启的那一拍
      if (!(await cameraWait(1600, token))) return;
      const plusPoint = at(pointOf(plus));
      if (!(await cameraPlay(cursor, cursorAt(plusPoint), { duration: .35, ease }, token))) return;
      if (!(await cameraWait(30, token))) return;
      clickAt(plus, plusPoint, token);
      // 3) 光标移到「生成当前场景图」，与菜单项按下的同一拍点击
      const itemPoint = at(pointOf(sceneItem));
      if (!(await cameraPlay(cursor, cursorAt(itemPoint), { duration: .42, ease }, token))) return;
      if (!(await cameraWait(80, token))) return;
      clickAt(sceneItem, itemPoint, token);
      // 4) 镜头推到生成槽位，看点阵 → 揭示
      if (!(await cameraWait(150, token))) return;
      const cursorScene = screenPoint(sceneFocus, sceneCam);
      cameraPlay(world, sceneCam, { duration: 1, ease }, token);
      cameraPlay(cursor, { x: cursorScene.x + 26, y: cursorScene.y + 20 }, { duration: .9, ease }, token);
      if (!(await cameraWait(2350, token))) return;
      // 揭示时刻轻推近：按揭示后的槽位中心（3:2）收
      const push = { ...sceneCam, scale: sceneCam.scale * 1.05 };
      push.x = width / 2 - sceneFocusAfter.x * push.scale;
      push.y = height / 2 - sceneFocusAfter.y * push.scale;
      cameraPlay(world, push, { duration: .9, ease }, token);
      if (!(await cameraWait(1600, token))) return;
      // 5) 摇到微信卡，到达即开演
      cameraPlay(world, wxCam, { duration: 1.05, ease }, token);
      const cursorWx = screenPoint(wxFocus, wxCam);
      cameraPlay(cursor, { x: cursorWx.x + 30, y: cursorWx.y - 8 }, { duration: .95, ease }, token);
      if (!(await cameraWait(1050, token))) return;
      if (!(await cameraWait(5600, token))) return;
      cameraPlay(world, { x: 0, y: 0, scale: 1 }, { duration: .95, ease }, token);
      cameraPlay(cursor, { opacity: 0 }, { duration: .4, ease: 'linear' }, token);
      await cameraWait(1000, token);
    })().finally(() => { cameraClicking = false; });
  }

  function show(index, stage) {
    cells[index].querySelectorAll('[data-fr-stage]').forEach(el => {
      const on = stage >= Number(el.dataset.frStage);
      if (on && el.classList.contains('fr-pending')) {
        el.classList.remove('fr-pending', 'fr-await');
        if (!quiet()) el.classList.add('fr-arrive');
      }
    });
  }

  function sceneStage(stage) {
    const menuOpen = stage >= 4 && stage < 5;
    sceneDock.classList.toggle('is-menu-open', menuOpen);
    sceneMenu.setAttribute('aria-hidden', String(!menuOpen));
    if (stage === 5) {
      cells[2].classList.remove('is-arming');
      sceneItem.classList.add('is-pressed');
      clearTimeout(scenePress.timer);
      scenePress.timer = setTimeout(() => sceneItem.classList.remove('is-pressed'), 260);
      dots.start();
    }
    if (stage >= 6) revealScene();
  }

  function revealScene() {
    sceneSlot.classList.add('is-revealed');
    sceneImg.decode?.().catch(() => {});
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => dots.stop(), 420);
  }

  function sceneToolsReady(elapsedMs) {
    sceneStatus.textContent = '内置生图模型';
    sceneTime.textContent = formatThinkingTime(Math.max(0, Math.round(elapsedMs)));
    sceneTools.classList.add('is-ready');
  }

  function sceneToolsReset() {
    sceneStatus.textContent = '生成中…';
    sceneTime.textContent = '0ms';
    sceneTools.classList.remove('is-ready');
  }

  const storyDone = () => states[1].typed >= chars.length;
  const sceneDone = () => states[2].typed >= sceneChars.length;
  const cardDone = index => states[index].stage >= CARD_LAST[index]
    && (index !== 1 || storyDone()) && (index !== 2 || sceneDone());

  function ensureRunning() {
    if (quiet() || running || states.every((_, index) => cardDone(index))) return;
    running = true; lastFrame = 0;
    requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running) return;
    const delta = Math.min(100, now - (lastFrame || now));
    lastFrame = now;
    states.forEach((s, index) => {
      if (s.stage >= CARD_LAST[index]) return;
      const step = Math.max(0, delta - s.delay);
      s.delay = Math.max(0, s.delay - delta);
      s.elapsed += step;
      while (s.stage < CARD_LAST[index] && s.elapsed >= CARD_BEATS[index][s.stage]) {
        s.elapsed -= CARD_BEATS[index][s.stage];
        s.stage += 1;
        if (index === 1 && s.stage === 3) storyStart.at = now;
        show(index, s.stage);
        if (index === 2) {
          sceneStage(s.stage);
          if (s.stage === 2) sceneThink.at = now;
          if (s.stage === 3) { sceneType.at = now; sceneChip.classList.add('is-done'); }
          if (s.stage === 5) sceneGen.at = now;
          if (s.stage === 6) sceneToolsReady(now - sceneGen.at);
        }
        if (index === 3) {
          // 微信通道把整批分段发完才撤「正在输入」，不是第一条就撤。
          if (s.stage === 4) wxTyping.classList.add('is-on');
          if (s.stage >= 7) wxTyping.classList.remove('is-on');
        }
      }
    });
    if (states[2].stage === 5 && sceneGen.at) {
      const label = formatThinkingTime(Math.max(0, Math.round(now - sceneGen.at)));
      if (sceneTime.textContent !== label) sceneTime.textContent = label;
    }
    if (states[2].stage === 2 && sceneThink.at) {
      const ms = Math.max(0, Math.floor(now - sceneThink.at));
      const phase = PHASES[ms < 450 ? 0 : ms < 900 ? 1 : 2];
      if (scenePhase.textContent !== phase) scenePhase.textContent = phase;
      const label = formatThinkingTime(ms);
      if (sceneTimer.textContent !== label) sceneTimer.textContent = label;
    }
    if (states[2].stage === 3 && states[2].typed < sceneChars.length) {
      const target = Math.min(sceneChars.length, Math.floor((now - sceneType.at) / (1000 / CHARS_PER_SECOND)));
      for (let i = states[2].typed; i < target; i++) sceneChars[i].dataset.typed = '';
      states[2].typed = target;
    }
    if (chip && !chip.classList.contains('is-done')) {
      const ms = Math.max(0, Math.floor(states[1].stage === 2 ? states[1].elapsed : (now - storyStart.at)));
      const phase = PHASES[ms < 450 ? 0 : ms < 900 ? 1 : 2];
      if (phaseEl.textContent !== phase) phaseEl.textContent = phase;
      const label = formatThinkingTime(ms);
      if (timerEl.textContent !== label) timerEl.textContent = label;
    }
    if (states[1].stage >= 3 && !storyDone()) {
      const target = Math.min(chars.length, Math.floor((now - storyStart.at) / (1000 / CHARS_PER_SECOND)));
      for (let i = states[1].typed; i < target; i++) chars[i].dataset.typed = '';
      states[1].typed = target;
      if (chip && !chip.classList.contains('is-done')) chip.classList.add('is-done');
    }
    if (states.every((_, index) => cardDone(index))) running = false;
    else requestAnimationFrame(tick);
  }

  function jumpCard(index) {
    const s = states[index];
    s.stage = CARD_LAST[index]; s.elapsed = 0; s.delay = 0;
    show(index, CARD_LAST[index]);
    cells[index].classList.add('is-jump');
    if (index === 1) {
      chars.forEach(span => span.dataset.typed = '');
      s.typed = chars.length;
      if (chip) chip.classList.add('is-done');
    }
    if (index === 2) {
      clearTimeout(scenePress.timer);
      sceneItem.classList.remove('is-pressed');
      sceneChars.forEach(span => span.dataset.typed = '');
      s.typed = sceneChars.length;
      sceneChip.classList.add('is-done');
      revealScene();
      sceneToolsReady(2600);
    }
    if (index === 3) wxTyping.classList.remove('is-on');
  }

  function jumpFinal() { CARD_LAST.forEach((_, index) => jumpCard(index)); }

  // 单卡重播：只重置并重演这一张卡，其余卡保持原样、不受牵连。
  function resetCard(index) {
    const s = states[index];
    s.stage = 0; s.elapsed = 0; s.typed = 0; s.delay = 0;
    cells[index].classList.remove('is-jump');
    if (index === 1) {
      chars.forEach(span => delete span.dataset.typed);
      storyStart.at = 0;
      if (chip) { chip.classList.remove('is-done'); phaseEl.textContent = ''; timerEl.textContent = '0ms'; }
    }
    if (index === 2) {
      clearTimeout(scenePress.timer);
      clearTimeout(revealTimer);
      dots.stop();
      sceneDock.classList.remove('is-menu-open');
      sceneItem.classList.remove('is-pressed');
      sceneSlot.classList.remove('is-revealed');
      sceneToolsReset();
      sceneChars.forEach(span => delete span.dataset.typed);
      sceneChip.classList.remove('is-done');
      scenePhase.textContent = '';
      sceneTimer.textContent = '0ms';
      sceneGen.at = 0;
      sceneThink.at = 0;
      sceneType.at = 0;
      cells[2].classList.add('is-arming');
    }
    if (index === 3) wxTyping.classList.remove('is-on');
    cells[index].querySelectorAll('[data-fr-stage]').forEach(el => {
      el.classList.add('fr-pending');
      el.classList.remove('fr-arrive');
    });
    if (index === 2) cells[2].querySelector('.fr-row--scene').classList.add('fr-await');
    if (quiet()) jumpCard(index);
    else ensureRunning();
  }

  demo.querySelectorAll('.fr-replay').forEach(button => {
    button.addEventListener('click', () => {
      resetCard(Number(button.dataset.frCard));
      if (!cameraClicking) stopCamera();
    });
  });

  // 一次刷新只自动演一轮：首见视口时四卡同拍开演；此后滚动/往返路由都不再自动重播（重播走各卡按钮）。
  let observer = null;
  if (autoPlayed) {
    jumpFinal();
  } else {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect(); observer = null;
        autoPlayed = true;
        if (quiet()) jumpFinal();
        else {
          // 微信卡与镜头同步：运镜约 9s 后到达它，起播推迟到镜头落地前 0.6s，避免二次重播闪跳。
          if (cameraEligible()) states[3].delay = 7600;
          ensureRunning(); runCamera();
        }
      }
    }, { threshold: 0, rootMargin: '-18% 0px -18% 0px' });
    observer.observe(demo);
  }

  return () => {
    running = false;
    observer?.disconnect();
    // 运行中切到「减少动态效果」会被整页卸载重挂：先把卡面定到终态，别停在半场。
    if (quiet() && demo.isConnected) jumpFinal();
    clearTimeout(scenePress.timer);
    clearTimeout(revealTimer);
    dots.stop();
    stopCamera();
  };
}
