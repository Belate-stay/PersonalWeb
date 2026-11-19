const command = '/continue';
const thread = '个人网页 · 调整首页';
const steps = [['连接'], ['检测', '额度'], ['输入', '指令'], ['选择', '对话'], ['确认', '续跑']];
const frames = [
  ['正在连接 Codex', 0],
  ['已连接 Codex', 0],
  ['正在检测额度', 1],
  ['额度已恢复', 1],
  ['输入续跑指令', 2],
  ['选择续跑对话', 3],
  ['确认续跑', 4],
  ['正在续跑', steps.length],
];
const beats = [820, 1630, 2580, 3560, 4640, 5960, 7300];
const done = frames.length - 1;

const resume = {
  title: '自动续跑',
  theme: 'codex',
  beats,
  follow: false,
  markup: () => `
    <div class="demo-continue" data-step="0">
      <ol class="demo-continue-steps" aria-label="续跑步骤">${steps.map((words, index) =>
        `<li${index === 0 ? ' aria-current="step"' : ''}><i aria-hidden="true"></i><span>${words.join('<wbr>')}</span></li>`).join('')}</ol>
      <div class="demo-continue-status">
        <strong data-demo-continue-status>${frames[0][0]}</strong>
        <span>演示数据</span>
      </div>
      <div class="demo-continue-fields">
        <div class="demo-continue-quota" data-demo-continue-row>
          <span>五小时窗口额度</span><strong data-demo-quota>—</strong>
          <div class="demo-meter" aria-hidden="true"><i data-demo-quota-fill style="width:0%"></i></div>
        </div>
        <div class="demo-continue-field" data-demo-continue-row>
          <span>续跑指令</span><code data-demo-continue-command>待输入</code>
        </div>
        <div class="demo-continue-field" data-demo-continue-row>
          <span>目标对话</span><strong data-demo-continue-thread>待选择</strong>
        </div>
      </div>
      <div class="demo-continue-footer">
        <span data-demo-continue-note></span>
        <span data-demo-continue-run>运行</span>
      </div>
    </div>`,
  prepare(view) {
    const scene = view.querySelector('.demo-continue');
    const status = scene.querySelector('[data-demo-continue-status]');
    const quota = scene.querySelector('[data-demo-quota]');
    const meter = scene.querySelector('[data-demo-quota-fill]');
    const prompt = scene.querySelector('[data-demo-continue-command]');
    const target = scene.querySelector('[data-demo-continue-thread]');
    const note = scene.querySelector('[data-demo-continue-note]');
    const run = scene.querySelector('[data-demo-continue-run]');
    const track = [...scene.querySelectorAll('li')];
    const rows = [...scene.querySelectorAll('[data-demo-continue-row]')];
    let previous = -1;
    return (elapsed, stage, instant) => {
      const [label, step] = frames[stage];
      if (stage !== previous) {
        previous = stage;
        scene.dataset.step = String(step);
        status.textContent = label;
        track.forEach((item, i) => {
          if (i === step) item.setAttribute('aria-current', 'step');
          else item.removeAttribute('aria-current');
          item.toggleAttribute('data-done', i < step);
        });
        rows.forEach((row, i) => row.toggleAttribute('data-active', i + 1 === step));
        target.textContent = stage < 5 ? '待选择' : thread;
        run.textContent = stage === done ? '续跑中' : '运行';
        if (stage >= 6) note.textContent = stage === done ? '续跑指令已提交' : '向选定对话发送指令';
        if (!instant) status.animate([{ opacity: .4, translate: '0 4px' }, { opacity: 1, translate: 'none' }],
                                    { duration: 280, easing: 'cubic-bezier(.2,.65,.25,1)' });
      }
      const fill = Math.min(1, Math.max(0, (elapsed - beats[2]) / 620));
      const value = `${Math.round(100 * (1 - (1 - fill) ** 3))}%`;
      if (stage >= 3 && quota.textContent !== value) {
        quota.textContent = value;
        meter.style.width = value;
      }
      if (stage >= 4) {
        const typed = instant ? command : command.slice(0, Math.max(1, Math.floor((elapsed - beats[3]) / 86)));
        if (prompt.textContent !== typed) prompt.textContent = typed;
      }
    };
  },
};

export const codexDemos = [[resume]];
