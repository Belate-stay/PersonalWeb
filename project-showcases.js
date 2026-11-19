import { projects, projectLogo } from './content.js';
import { wiseButton } from './uiverse-buttons.js';
import { animate } from './vendor/motion.js';

const threads = { site: '个人网页 · 调整首页', review: '项目代码 · 修复测试' };

const externals = {
  freechat: ['https://freechater.com/chat/', '前往 FreeChat 官网'],
  'codex-continue': [projects['codex-continue'].url, '下载 Codex-Continue'],
  wzti: [projects.wzti.url, '前往 WZTI 官网'],
};

function actions(id) {
  const [url, label] = externals[id];
  return `<div class="sx-actions">${wiseButton(`#/project/${id}`, '项目详情', 'sx-project-link', `了解 ${projects[id].name} 项目详情`)}${wiseButton(url, label, 'sx-external-link', label, ' target="_blank" rel="noopener noreferrer"')}</div>`;
}

function header(id, subtitle) {
  const project = projects[id];
  const opening = id === 'codex-continue' ? `<div class="sx-opening"><h2>${project.headline}</h2><p>${project.summary}</p></div>` : '';
  return `<header class="sx-heading"><div class="sx-identity">${projectLogo(id)}<div><strong>${project.name}</strong><span>${project.platform} <i>／</i> ${subtitle}</span></div></div>${opening}${actions(id)}</header>`;
}

function footer(description = '') {
  return description ? `<footer class="sx-footer"><p>${description}</p></footer>` : '';
}

function freechat() {
  return `${header('freechat', '临时对话')}
    <section class="sx-chat-host" data-showcase-chat-host aria-label="FreeChat 临时对话" aria-busy="true"><p role="status">正在载入临时对话…</p></section>`;
}

const flowSteps = [
  ['waiting', '等待触发', '根据所选模式等待恢复或到时'],
  ['submitted', '向对话入队', '目标对话已明确选定'],
  ['done', '确认提交结果', '成功后停止或等待下一轮'],
];

export function continuationMarkup() {
  return `<div class="sx-continue-layout">
      <form class="sx-continue-form" data-showcase-continue-form>
        <div class="sx-continue-config">
          <select data-continue-mode aria-label="续跑模式"><option value="auto">自动续跑</option><option value="manual">手动定时</option></select>
          <label class="sx-loop"><input type="checkbox" data-continue-loop> 循环发送</label>
          <input type="time" value="21:05" data-continue-time aria-label="发送时间" hidden>
        </div>
        <label class="sx-field"><span>目标对话</span><select data-showcase-thread aria-label="选择示例对话"><option value="">选择示例对话</option>${Object.entries(threads).map(([id, name]) => `<option value="${id}">${name}</option>`).join('')}</select></label>
        <label class="sx-field sx-prompt-field"><span>续跑指令</span><textarea data-showcase-prompt rows="2" maxlength="300" aria-label="续跑指令">/Continue</textarea></label>
        <div class="sx-continue-actions">
          <button class="sx-primary" type="button" data-showcase-action="continue-start" disabled><span>运行</span></button>
          <button class="sx-text-button" type="button" data-showcase-action="continue-stop" disabled>停止</button>
          <button class="sx-text-button" type="button" data-showcase-action="continue-reset">重置</button>
        </div>
      </form>
      <div class="sx-flow" data-showcase-flow data-phase="idle">
        <div class="sx-flow-top"><span class="sx-status-dot"></span><span>桌面流程演示</span><span class="sx-flow-counter" data-showcase-counter>0 / 1</span></div>
        <ol class="sx-flow-steps">${flowSteps.map(([phase, title, description], i) => `<li data-showcase-step="${phase}"><span class="sx-step-number">0${i + 1}</span><div><strong>${title}</strong><small>${description}</small></div><span class="sx-step-check" aria-hidden="true">✓</span></li>`).join('')}</ol>
        <div class="sx-flow-status" role="status" aria-live="polite" data-showcase-flow-status>选择示例对话，填写指令后点击运行。</div>
        <div class="sx-flow-events">
          <button type="button" data-showcase-action="continue-unknown" hidden>读数未知</button>
          <button type="button" data-showcase-action="continue-recover" hidden>额度恢复</button>
          <button type="button" data-showcase-action="continue-deadline" hidden>到达设定时刻</button>
          <button type="button" data-showcase-action="continue-sent" hidden>提交成功</button>
          <button type="button" data-showcase-action="continue-unconfirmed" hidden>结果未确认</button>
          <button type="button" data-showcase-action="continue-exhausted" hidden>再次耗尽</button>
        </div>
      </div>
    </div>`;
}

function continuation() {
  return `${header('codex-continue', '自动续跑与手动定时')}
    ${continuationMarkup()}
    ${footer('使用示例对话和手动触发的状态演示桌面流程。')}`;
}

// 可交互的续跑流程：首页展台与项目详情页共用同一套表单 + 状态机。
export function mountContinuation(root, { signal, enabled = () => true } = {}) {
  const form = root.querySelector('[data-showcase-continue-form]');
  const modeSelect = form.querySelector('[data-continue-mode]');
  const time = form.querySelector('[data-continue-time]');
  const loop = form.querySelector('[data-continue-loop]');
  const thread = form.querySelector('[data-showcase-thread]');
  const prompt = form.querySelector('[data-showcase-prompt]');
  const flow = root.querySelector('[data-showcase-flow]');
  const status = flow.querySelector('[data-showcase-flow-status]');
  const action = id => root.querySelector(`[data-showcase-action="${id}"]`);
  let phase = 'idle';
  let sent = 0;

  function running() {
    return ['waiting', 'submitted', 'next-cycle'].includes(phase);
  }

  function syncRunButton() {
    action('continue-start').disabled = running() || !thread.value || !prompt.value.trim() || (modeSelect.value === 'manual' && !time.value);
  }

  function paintFlow(next, message) {
    phase = next;
    const manual = modeSelect.value === 'manual';
    const looping = !manual && loop.checked;
    const steps = ['waiting', 'submitted', 'done'];
    const position = steps.indexOf(next);
    flow.dataset.phase = next;
    flow.querySelectorAll('[data-showcase-step]').forEach((step, i) => {
      step.classList.toggle('is-current', position === i);
      step.classList.toggle('is-complete', position > i || next === 'next-cycle');
    });
    flow.querySelector('[data-showcase-counter]').textContent = looping ? `${sent} 轮` : `${sent} / 1`;
    status.textContent = message;
    status.title = message;
    for (const input of form.querySelectorAll('input, select, textarea')) input.disabled = running();
    syncRunButton();
    action('continue-stop').disabled = !running();
    action('continue-unknown').hidden = next !== 'waiting' || manual;
    action('continue-recover').hidden = next !== 'waiting' || manual;
    action('continue-deadline').hidden = next !== 'waiting' || !manual;
    action('continue-sent').hidden = next !== 'submitted';
    action('continue-unconfirmed').hidden = next !== 'submitted';
    action('continue-exhausted').hidden = next !== 'next-cycle';
  }

  function configureMode() {
    const manual = modeSelect.value === 'manual';
    time.hidden = !manual;
    loop.closest('label').hidden = manual;
    paintFlow('idle', '选择示例对话，填写指令后点击运行。');
  }

  function stopRun() {
    if (running()) paintFlow('stopped', '已停止本次演示。');
  }

  function onClick(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled || !enabled() || !root.contains(button)) return;
    switch (button.dataset.showcaseAction) {
      case 'continue-start':
        sent = 0;
        paintFlow('waiting', modeSelect.value === 'manual'
          ? `已设为 ${time.value}，到时向「${threads[thread.value]}」提交一次。`
          : '示例读数：额度已用尽。守护已启动，等待恢复。');
        break;
      case 'continue-unknown':
        paintFlow('waiting', '读数未知，继续监测，尚未提交指令。');
        break;
      case 'continue-recover':
      case 'continue-deadline':
        paintFlow('submitted', `向「${threads[thread.value]}」提交：${prompt.value.trim()}`);
        break;
      case 'continue-sent':
        sent++;
        if (modeSelect.value === 'auto' && loop.checked) {
          paintFlow('next-cycle', '已入队，继续监测下一次耗尽与恢复。');
        } else {
          prompt.value = '';
          paintFlow('done', '已入队。本次守护停止，指令已清空。');
        }
        break;
      case 'continue-unconfirmed':
        paintFlow('stopped', '提交结果未确认，守护停止，保留当前指令。');
        break;
      case 'continue-exhausted':
        paintFlow('waiting', '检测到新的耗尽周期，等待下一次恢复。');
        break;
      case 'continue-stop': stopRun(); break;
      case 'continue-reset':
        form.reset();
        sent = 0;
        configureMode();
        break;
    }
  }

  root.addEventListener('click', onClick, { signal });
  form.addEventListener('submit', event => event.preventDefault(), { signal });
  form.addEventListener('input', syncRunButton, { signal });
  modeSelect.addEventListener('change', () => { sent = 0; configureMode(); }, { signal });
  loop.addEventListener('change', () => { sent = 0; configureMode(); }, { signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopRun(); }, { signal });
  return { stopRun };
}

function wzti() {
  return `${header('wzti', '峡谷图鉴')}
    <section class="quick-quiz" data-quick-quiz aria-label="WZTI 三题速测" aria-busy="true"><p role="status">正在抽题…</p></section>`;
}

export function projectShowcase(id) {
  const render = { freechat, 'codex-continue': continuation, wzti }[id];
  return render ? `<div class="project-showcase project-showcase--${id}">${render()}</div>` : '';
}

export function mountShowcases(root) {
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const panel = id => root.querySelector(`.stage-project-panel[data-showcase="${id}"]`);
  const continuationPanel = panel('codex-continue');
  const chatHost = panel('freechat').querySelector('[data-showcase-chat-host]');
  const quiz = panel('wzti').querySelector('[data-quick-quiz]');
  let active = null;
  let entrance = null;
  let quizMounted = false;
  const continuation = mountContinuation(continuationPanel, { signal, enabled: () => active === 'codex-continue' });

  function reveal(element) {
    entrance?.stop();
    if (element && !reduced.matches) entrance = animate(element, { opacity: [0.4, 1], y: [9, 0] }, { type: 'spring', stiffness: 330, damping: 32 });
  }

  async function mountChat() {
    if (chatHost.querySelector('iframe')) return;
    chatHost.setAttribute('aria-busy', 'true');
    try {
      const { demoHtml } = await import('./freechat-demo.js');
      if (signal.aborted || active !== 'freechat' || chatHost.querySelector('iframe')) return;
      const frame = document.createElement('iframe');
      frame.id = 'showcase-freechat-session';
      frame.title = 'FreeChat 临时对话';
      frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
      frame.referrerPolicy = 'no-referrer';
      frame.addEventListener('load', () => {
        chatHost.setAttribute('aria-busy', 'false');
      }, { once: true, signal });
      frame.srcdoc = demoHtml.replace('<html ', '<html data-inline ');
      chatHost.replaceChildren(frame);
    } catch {
      if (signal.aborted) return;
      chatHost.setAttribute('aria-busy', 'false');
      const message = chatHost.querySelector('[role=status]');
      if (message) message.textContent = '暂时未能载入临时对话，切换回来后可重试。';
    }
  }

  async function mountQuiz() {
    if (quizMounted) return;
    quiz.setAttribute('aria-busy', 'true');
    try {
      const { mountWztiQuiz } = await import('./wzti-quiz.js');
      if (signal.aborted || active !== 'wzti' || quizMounted) return;
      mountWztiQuiz(quiz, signal);
      quizMounted = true;
      quiz.setAttribute('aria-busy', 'false');
    } catch {
      if (signal.aborted) return;
      quiz.setAttribute('aria-busy', 'false');
      const message = quiz.querySelector('[role=status]');
      if (message) message.textContent = '暂时未能载入题目，切换回来后可重试。';
    }
  }

  return {
    setActive(id) {
      if (id === active) return;
      continuation.stopRun();
      active = id;
      if (id === 'freechat') mountChat();
      if (id === 'wzti') mountQuiz();
      reveal(panel(id)?.querySelector('.sx-chat-host, .sx-flow, .quick-quiz'));
    },
    dispose() {
      entrance?.stop();
      controller.abort();
    },
  };
}
