import { asset } from './content.js';
import { icon } from './icons.js';

// The staged scene and its 20-column image slot follow FreeChat Web's SceneRecDemo.
const sceneBeats = [0, 570, 2470, 4070, 4620, 5070, 6770, 8070];
const sceneUser = '我夹了一块糖醋里脊，放到她的碗中，嘴角轻扬一下：“吃饭还堵不住你的嘴。”眉眼温柔，话语中满是宠溺，像抹了蜜一般。';
const sceneReply = '她鼓了鼓腮帮子，轻声“哼”了一声，将里脊肉塞进嘴里。吃得急，嘴角沾了些酱料。';

const orbit = '<i class="demo-orb" aria-hidden="true"></i>';
const message = (stage, text, kind = 'self', name = '') => /*html*/ `
  <div data-demo-in="${stage}" class="demo-message demo-message--${kind}" hidden>
    ${name ? `<i aria-hidden="true">${name[0]}</i>` : ''}
    <div>${name ? `<small>${name}</small>` : ''}<p>${text}</p></div>
  </div>`;
const prose = (stage, className, text = '') =>
  `<p data-demo-in="${stage}" class="demo-prose ${className}" hidden>${text}</p>`;
const thinking = (from, to, content = '') =>
  `<div class="demo-thinking demo-fold" data-demo-in="${from}" data-demo-out="${to}" aria-hidden="true"><div>${orbit}${content}</div></div>`;

const clamp = number => Math.min(Math.max(number, 0), 1);
function smoothStep(from, to, value) {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
}

function drawSceneDots(canvas, width, height, time, phaseFloor, morph, imageOpacity) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const corner = width * .14 * (1 - morph) + 12 * morph;
  const feather = width * .08 * (1 - morph) + .8 * morph;
  const halfHeight = width * .5 * (1 - morph / 3);
  const cell = width / 20;
  const rows = Math.max(1, Math.round(height / cell));
  const originY = (height - rows * cell) / 2;
  const ramp = smoothStep(0, 1.8, time);
  const sheen = .5 + .65 * Math.sin(time * .16 - 1.2);
  const waves = [
    [.24 + .25 * Math.sin(time * .16), .32 + .22 * Math.sin(time * .18 + .4), .55 + .4 * Math.sin(time * .65), .40],
    [.66 + .21 * Math.sin(time * .13 + 1.8), .67 + .2 * Math.sin(time * .15 + 3.1), .55 + .4 * Math.sin(time * .55 + 2.2), .44],
    [.48 + .24 * Math.sin(time * .12 + 3.9), .45 + .23 * Math.sin(time * .17 + 5.1), .55 + .4 * Math.sin(time * .49 + 4.5), .38],
  ];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < 20; column++) {
      const x = (column + .5) * cell;
      const y = (row + .5) * cell + originY;
      const qx = Math.abs(x - width / 2) - width / 2 + corner;
      const qy = Math.abs(y - height / 2) - halfHeight + corner;
      const edge = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - corner;
      const opacity = smoothStep(0, feather, -edge);
      if (!opacity) continue;
      let complement = 1;
      for (const [wx, wy, weight, radius] of waves) {
        complement *= 1 - (1 - smoothStep(0, radius, Math.hypot(x / width - wx, y / height - wy))) * ramp * weight;
      }
      const strength = 1 - (1 - phaseFloor) * complement;
      const gleam = ramp * (1 - smoothStep(0, .23, Math.abs(.72 * x / width + .28 * y / height - sheen)));
      const tint = .28 * strength + .42 * gleam;
      const radius = .065 + .175 * strength;
      ctx.globalAlpha = (.59 + .3 * tint) * opacity * (1 - imageOpacity);
      ctx.fillStyle = `rgb(${Math.round(74 - 35 * tint)} ${Math.round(137 - 42 * tint)} ${Math.round(114 - 40 * tint)})`;
      ctx.beginPath();
      ctx.arc(x, y, cell * (radius + (.74 - radius) * morph), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function stream(node, text, { reserve = false, dialogue = false, write = value => { node.textContent = value; } } = {}) {
  const characters = Array.from(text);
  const spans = reserve ? characters.map(character => {
    const span = document.createElement('span');
    span.textContent = character;
    span.setAttribute('aria-hidden', 'true');
    return span;
  }) : null;
  if (spans) {
    node.setAttribute('aria-label', text);
    node.replaceChildren(...spans);
  }
  let shown = 0;
  return elapsed => {
    const next = Math.min(characters.length, Math.max(0, Math.floor(elapsed / 20)));
    if (next === shown) return;
    if (spans) {
      for (let i = shown; i < next; i++) spans[i].setAttribute('data-typed', '');
    } else {
      const written = characters.slice(0, next).join('');
      if (dialogue) {
        const parts = written.split(/(“[^”]*(?:”|$))/u);
        node.replaceChildren(...parts.map((part, i) => {
          if (i % 2 === 0) return part;
          const emphasis = document.createElement('strong');
          emphasis.textContent = part;
          return emphasis;
        }));
      } else {
        write(written);
      }
    }
    shown = next;
  };
}

const scene = {
  title: '生成场景图',
  theme: 'chat',
  beats: sceneBeats,
  markup: () => `
    <div class="demo-chat">
      ${message(1, sceneUser)}
      ${thinking(2, 3)}
      ${prose(3, 'demo-scene-reply')}
      <div class="demo-scene-menu demo-fold" data-demo-in="4" data-demo-out="6" aria-hidden="true">
        <div>${icon('image', { size: 15 })} 生成当前场景图</div>
      </div>
      <div class="demo-scene-visual" data-demo-in="6" hidden>
        <div class="demo-scene-note">场景图仅提供视觉呈现</div>
        <div class="demo-scene-slot">
          <img src="${asset('freechat-feature-rec-scene.webp')}" width="1080" height="720" alt="餐厅里夹起糖醋里脊的生成场景图" draggable="false" aria-hidden="true">
          <canvas aria-hidden="true"></canvas>
        </div>
        <div class="demo-scene-status" data-demo-in="6" data-demo-out="8" hidden></div>
        <div class="demo-scene-actions" data-demo-in="8" hidden aria-label="成图操作"><span>删除</span><span>重新生成</span></div>
        <div class="demo-scene-attribution"><span>ChatGPT-Image-2.5</span><time>0ms</time></div>
      </div>
    </div>`,
  prepare(view) {
    const write = stream(view.querySelector('.demo-scene-reply'), sceneReply, { reserve: true });
    const slot = view.querySelector('.demo-scene-slot');
    const canvas = slot.querySelector('canvas');
    const image = slot.querySelector('img');
    const phase = view.querySelector('.demo-scene-status');
    const timer = view.querySelector('time');
    const phases = ['理解场景…', '准备角色参考图…', '连接生图模型…', '模型生成中…', '接收图片…'];
    let previousPhase = -1;
    let previousTime = -1;
    let finished = false;
    return (elapsed, stage, instant) => {
      if (stage >= 3) write(instant ? Infinity : elapsed - sceneBeats[2]);
      if (stage < 6) return;
      const age = elapsed - sceneBeats[5];
      const currentPhase = Math.min(4, Math.floor(age / 280));
      if (currentPhase !== previousPhase) phase.textContent = phases[currentPhase];
      previousPhase = currentPhase;
      const time = instant ? 2920 : Math.floor(Math.min(age, 3000) / 100) * 100;
      if (time !== previousTime) timer.textContent = time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(1)}s`;
      previousTime = time;
      if (finished) return;
      const progress = instant ? 1 : clamp((elapsed - sceneBeats[6]) / 950);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      const morph = smoothStep(.02, .82, eased);
      const opacity = smoothStep(.14, .94, eased);
      image.style.opacity = String(opacity);
      if (progress === 1) {
        finished = true;
        slot.style.aspectRatio = '3 / 2';
        image.removeAttribute('aria-hidden');
        canvas.hidden = true;
        return;
      }
      slot.style.aspectRatio = String(1 + .5 * morph);
      let floor = 0;
      for (const [at, target] of [[560, .04], [840, .12], [1120, .62]]) {
        floor += (target - floor) * (1 - (1 - clamp((age - at) / 320)) ** 3);
      }
      const width = slot.clientWidth;
      if (width) drawSceneDots(canvas, width, width / (1 + .5 * morph), age / 1000, floor, morph, opacity);
    };
  },
};

// FeatureRecPage currently contains two recommendations. They keep their position when switched.
const group = {
  title: '多角色群聊',
  theme: 'chat',
  retain: true,
  beats: [0, 1200, 2000, 2800, 3600, 4400, 5200, 6000],
  markup: () => `<div class="demo-chat demo-group">
    ${message(1, '晚上去吃自助餐吧', 'self', '我')}
    ${message(2, '轻奢一把', 'self', '我')}
    ${message(3, '吃啥？', 'mo', '林墨')}
    ${message(4, '烤肉？披萨？牛排？', 'mo', '林墨')}
    ${message(5, '都行', 'self', '我')}
    ${message(6, '陪对象呢没空', 'xu', '许舟')}
    ${message(7, '去不了，导员非要让我当志愿者', 'zhou', '周屿')}
  </div>`,
};

const storyInput = '深夜的旧钟楼下，三个年轻人在雨里捡到一封没有署名的信。林墨性急，撕开就要念出来；许舟谨慎，抢过来坚持先报警；周屿一言不发，蹲下指着信封上那只湿透的蓝蝴蝶。写一段群像戏：夜色、雨声、争执都要有，结尾把悬念留在蝴蝶上。要有对话，也要有每个人的小动作。';
const storyText = '雨水顺着钟楼的檐角往下淌。林墨的手指已经挑开信封一角，被许舟一把按住：“别急——万一是什么证据呢？”他压低声音，眼睛却一直望着街口闪烁的警灯。\n\n周屿蹲下身，把伞倾向那枚蓝蝴蝶。蜡印浸了雨水也不褪色，翅膀的纹路细得像拿针尖画上去的。“你们看，”他轻声说，“和上周展览丢的那枚邮票，一模一样。”\n\n三个人同时安静下来，雨声忽然变得很响。林墨把信封举到路灯下，翻来覆去地看；许舟掏出手机，对着蝴蝶连拍了几张；周屿缓缓回过头——钟楼的门不知何时开了一道缝，门后的黑暗里，似乎也有一双眼睛，正一眨不眨地看着他们。\n\n“谁也别碰。”许舟把外套脱下来罩住信封，声音发紧，“等天亮，一起交给警察。”林墨咽了咽口水，把手缩了回来。';
const storyBeats = [0, 650, 2450, 3950, 5350, 6750, 8150, 9750];

const story = {
  title: '多角色文本',
  theme: 'chat',
  retain: true,
  beats: storyBeats,
  markup: () => `<div class="demo-chat">
    ${message(1, storyInput)}
    ${thinking(2, 3, '<span>连接模型…</span><time>0ms</time>')}
    ${prose(3, 'demo-story-reply')}
  </div>`,
  prepare(view) {
    const write = stream(view.querySelector('.demo-story-reply'), storyText, { dialogue: true });
    const label = view.querySelector('.demo-thinking span');
    const timer = view.querySelector('.demo-thinking time');
    const phases = ['连接模型…', '理解内容…', '拟草回复…'];
    let previous = 0;
    let lastTime = -1;
    return (elapsed, stage, instant) => {
      if (stage === 2) {
        const age = elapsed - storyBeats[1];
        const phase = Math.min(2, Math.floor(age / 450));
        if (phase !== previous) label.textContent = phases[phase];
        previous = phase;
        const time = Math.floor(age / 100) * 100;
        if (time !== lastTime) timer.textContent = time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(1)}s`;
        lastTime = time;
      }
      if (stage >= 3) write(instant ? Infinity : elapsed - storyBeats[2]);
    };
  },
};

// FreeChat Web's 01 mode showcase uses a streaming Python answer and a staged Markdown guide.
const standardReply = '可以，最经典的写法——外层每轮把最大的数“冒”到末尾。';
const standardCode = 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nprint(bubble_sort([5, 2, 9, 1, 7]))';
const codeWrap = ['- i):\n', 'arr[j + 1]:\n', 'arr[j + 1], arr[j]\n', '9, 1, 7]))']
  .map(fragment => standardCode.indexOf(fragment));
const replyAt = 2200;
const codeAt = replyAt + standardReply.length * 20 + 500;
const standardBeats = [0, 730, replyAt, codeAt, codeAt + standardCode.length * 20];

async function copyCode(text, button) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Direct file and local previews may need the selection-based copy command.
  }
  if (!button.isConnected) return false;
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  Object.assign(field.style, { position: 'fixed', inset: '0 auto auto 0', opacity: '0', pointerEvents: 'none' });
  document.body.append(field);
  try {
    field.select();
    field.setSelectionRange(0, field.value.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    button.focus({ preventScroll: true });
  }
}

const standard = {
  title: 'Python 代码生成',
  theme: 'chat',
  beats: standardBeats,
  markup: () => `<div class="demo-chat">
    ${message(1, '帮我用 Python 生成一个冒泡排序代码。')}
    ${thinking(2, 3, '<span>准备回复…</span>')}
    ${prose(3, 'demo-standard-reply')}
    <div class="demo-code demo-standard-code" data-demo-in="4" hidden>
      <div class="demo-code-head">
        <span>Python</span>
        <button type="button" data-demo-copy aria-label="复制代码">复制</button>
        <span class="demo-copy-status" role="status"></span>
      </div>
      <pre><code></code></pre>
    </div>
  </div>`,
  prepare(view, signal) {
    const writeReply = stream(view.querySelector('.demo-standard-reply'), standardReply, { reserve: true });
    const code = view.querySelector('code');
    const breaks = codeWrap.map(() => document.createElement('wbr'));
    const lines = Array.from({ length: codeWrap.length + 1 }, () => document.createTextNode(''));
    code.append(...lines.flatMap((line, i) => breaks[i] ? [line, breaks[i]] : [line]));
    const writeCode = stream(code, standardCode, { write(written) {
      lines.forEach((line, i) => { line.data = written.slice(codeWrap[i - 1] ?? 0, codeWrap[i]); });
    } });
    const button = view.querySelector('[data-demo-copy]');
    const status = view.querySelector('.demo-copy-status');
    let reset;
    button.addEventListener('click', async () => {
      const copied = await copyCode(standardCode, button);
      if (signal?.aborted || !button.isConnected) return;
      button.textContent = copied ? '已复制' : '复制失败';
      button.dataset.copyState = copied ? 'done' : 'error';
      status.textContent = copied ? '代码已复制到剪贴板' : '复制失败，可以选择代码文本并手动复制';
      clearTimeout(reset);
      reset = setTimeout(() => {
        button.textContent = '复制';
        delete button.dataset.copyState;
        status.textContent = '';
      }, 2000);
    }, { signal });
    signal?.addEventListener('abort', () => clearTimeout(reset), { once: true });
    return (elapsed, stage, instant) => {
      if (stage >= 3) writeReply(instant ? Infinity : elapsed - replyAt);
      if (stage >= 4) writeCode(instant ? Infinity : elapsed - codeAt);
    };
  },
};

const guide = {
  title: 'FreeChat 使用指南',
  theme: 'chat',
  follow: false,
  beats: [0, 730, 2200, 2460, 3000, 3260, 3540, 3820, 4100, 4380, 4660, 5140],
  markup: () => `<div class="demo-chat">
    ${message(1, '如何将 FreeChat 角色接入微信？')}
    ${thinking(2, 3, '<span>整理接入步骤…</span>')}
    <div class="demo-guide" data-demo-in="3" hidden>
      <h5>前提条件</h5>
      <ol data-demo-in="4" hidden>
        <li>使用拟人模式下的<strong>「微信聊天」</strong>对话。</li>
        <li>先<strong>注册并登录</strong> FreeChat，绑定时需要识别你的账号。</li>
      </ol>
      <h5 data-demo-in="5" hidden>操作步骤</h5>
      <ol data-demo-in="6" hidden>
        <li>新建对话，选择「拟人模式」。</li>
        <li data-demo-in="7" hidden>将对话模式设为<strong>「微信聊天」</strong>，创建角色对话。</li>
        <li data-demo-in="8" hidden>打开对话，点击标题栏绿色的<strong class="demo-guide-term">「连接微信」</strong>图标。</li>
        <li data-demo-in="9" hidden>按提示保存弹出的二维码。</li>
        <li data-demo-in="10" hidden>用微信「扫一扫」识别二维码。</li>
        <li data-demo-in="11" hidden>按微信提示完成<strong>授权确认</strong>。</li>
      </ol>
      <p data-demo-in="12" hidden>绑定后，微信好友发来的消息可以由云端的角色自动回复。</p>
    </div>
  </div>`,
};

const memory = {
  title: '记忆如何回到下一轮',
  theme: 'chat',
  beats: [0, 1280, 2280, 3150, 4370, 5400],
  markup: () => `<div class="demo-chat">
    ${message(1, '周六在老图书馆门口见，记得提醒我带相机。')}
    <div class="demo-memory" data-demo-in="2" hidden><span>角色记忆 · 阿岚</span><strong>周六 · 老图书馆门口 · 带相机</strong></div>
    ${message(3, '周末在哪里碰面来着？')}
    ${thinking(4, 5, '<span>带入相关记忆</span>')}
    ${message(5, '周六我在老图书馆门口等你，别忘了带相机。', 'mo', '阿岚')}
  </div>`,
};

export const freeChatDemos = [[standard, guide], [scene, group, story], [memory]];
