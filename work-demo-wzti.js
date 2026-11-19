import { asset } from './content.js';
import { result } from './work-demo-wzti-data.js';
import { questions } from './wzti-questions.js';

const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const stamp = (from, to) => 'data-demo-in="' + from + '"' + (to === undefined ? '' : ' data-demo-out="' + to + '"') + (from ? ' hidden' : '');

const axes = [
  ['团队', 'T', 'Team', '倾向团队配合，甘愿牺牲自我资源。'],
  ['大局', 'C', 'Macro', '拥有纵观全局的视野，擅长兵线与团队运营。'],
  ['稳健', 'S', 'Stable', '打法极度克制，注重生存与防御运营。'],
  ['理性', 'R', 'Rational', '如同机器般冷酷，追求极致局势分析。'],
  ['独狼', 'L', 'Lone', '崇尚个人节奏，偏好单吃局内资源。'],
  ['微操', 'M', 'Micro', '具备顶级的反应速度与极限操作能力。'],
  ['激进', 'A', 'Aggressive', '极具攻击性，热衷刀尖舔血寻找机会。'],
  ['情绪', 'E', 'Emotional', '易受局内战况影响，被情绪支配决策。'],
].map(([name, key, fullName, detail]) => ({ name, key, fullName, detail, score: Math.max(0, result.scores[key]) }));
const careers = [['刺客', 'ASSASSIN'], ['法师', 'MAGE'], ['射手', 'MARKSMAN'], ['辅助', 'SUPPORT']];
const maxScore = Math.max(8, Math.max(...axes.map(axis => axis.score)) + 2);
const chartSize = 320;
const center = chartSize / 2;
const radius = 100;

function pointsAt(radii) {
  return radii.map((distance, i) => [
    center + Math.sin(i * Math.PI / 4) * distance,
    center - Math.cos(i * Math.PI / 4) * distance,
  ]);
}
const ring = distance => pointsAt(Array(axes.length).fill(distance));
const plotRadii = axes.map(axis => radius * axis.score / maxScore);
const guideEnds = ring(-60);
const polygon = points => points.map(([x, y]) => x.toFixed(2) + ',' + y.toFixed(2)).join(' ');

function question(index, from, press, to) {
  const current = questions[index];
  return /*html*/ `<div class="demo-quiz-card" ${stamp(from, to)} data-demo-question="${index + 1}">
    <div class="demo-quiz-meta"><span>WZTI 标准版</span><span>${String(index + 1).padStart(2, '0')} / ${questions.length}</span></div>
    <div class="demo-meter" aria-hidden="true"><i style="width:${index / questions.length * 100}%"></i></div>
    <strong class="demo-quiz-title">${escape(current.question)}</strong>
    <ol class="demo-options">
      ${current.options.map(({ text }, i) => `<li${i ? '' : ` data-demo-press="${press}"`}><span>${'ABCD'[i]}</span>${escape(text)}</li>`).join('')}
    </ol>
  </div>`;
}

function analysis(from, to) {
  return /*html*/ `<div class="demo-analysis" data-demo-analysis ${stamp(from, to)}>
    <strong>正在分析对局倾向</strong>
    <div class="demo-meter" aria-hidden="true"><i style="width:0"></i></div>
    <div><span>提取对局行为</span><span class="demo-mono">0%</span></div>
  </div>`;
}

function radarMarkup() {
  return /*html*/ `<section class="demo-radar" aria-labelledby="wzti-radar-title">
    <div class="demo-radar-heading"><h5 id="wzti-radar-title">八维对局倾向</h5><span>点选维度或圆点</span></div>
    <div class="demo-radar-diagram">
      <div class="demo-radar-chart">
        <svg class="demo-radar-svg" viewBox="0 0 ${chartSize} ${chartSize}" aria-hidden="true">
          <defs><linearGradient id="wzti-radar-guide" gradientUnits="userSpaceOnUse">
            <stop stop-color="#d81b60" stop-opacity=".8"/><stop offset="1" stop-color="#8e24aa" stop-opacity=".05"/>
          </linearGradient></defs>
          <g class="demo-radar-grid">
            ${[1, 2, 3, 4, 5].map(level => `<polygon points="${polygon(ring(radius * level / 5))}"/>`).join('')}
            ${ring(radius).map(([x, y]) => `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}"/>`).join('')}
          </g>
          <polygon class="demo-radar-outline" points="${polygon(ring(0))}"/>
          <line class="demo-radar-guide" stroke="url(#wzti-radar-guide)"/>
          ${axes.map((_, i) => `<g data-demo-radar-point="${i}" transform="translate(${center} ${center})">
            <circle class="demo-radar-halo" r="14"/><circle class="demo-radar-dot" r="4"/>
          </g>`).join('')}
        </svg>
        ${ring(radius + 25).map(([x, y], i) => `<button type="button" data-demo-axis="${i}" aria-pressed="false"
          aria-label="${axes[i].name} ${axes[i].score} 分" aria-controls="wzti-axis-${i}"
          style="--axis-x:${x / chartSize * 100}%;--axis-y:${(center + (y - center) * 1.14) / chartSize * 100}%">${axes[i].name}(${axes[i].key})</button>`).join('')}
      </div>
      <div class="demo-axis-details" role="status">
        ${axes.map((axis, i) => `<div id="wzti-axis-${i}" class="demo-axis-detail" data-demo-axis-detail aria-hidden="true">
          <strong data-demo-axis-name>${axis.name}(${axis.fullName})</strong>
          <div class="demo-axis-value"><b data-demo-axis-score>${axis.score}</b> 分</div>
          <p>${axis.detail}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
}

function profileHeader() {
  return /*html*/ `<header class="demo-result-head">
    <img class="demo-result-portrait" src="${asset('wzti-result-profile.webp')}" width="96" height="96" alt="">
    <div>
      <div class="demo-quiz-meta">示例答卷 · 36 题全部选择 A</div>
      <h5 class="demo-personality">${escape(result.name)}</h5>
      <p class="demo-result-slogan">“${escape(result.slogan)}”</p>
      <p class="demo-result-probability">原版理论概率约 ${escape(result.probability)}</p>
    </div>
  </header>`;
}

function profileDetails() {
  return /*html*/ `<section class="demo-type-description" aria-label="人格解析">
    <h5>人格解析</h5>
    <dl>
      ${result.descriptions.map(({ label, text }) => `<div><dt>${escape(label)}</dt><dd>${escape(text)}</dd></div>`).join('')}
    </dl>
  </section>`;
}

function heroDetails(from = 0) {
  return /*html*/ `<section class="demo-result-hero" ${stamp(from)} aria-label="英雄匹配">
    <h5>系统推测的本命英雄</h5>
    <div class="demo-hero-match">
      <img src="${asset('wzti-sample-hero.webp')}" width="48" height="48" alt="">
      <div><strong>${escape(result.hero.name)}</strong><span>${careers.find(([, key]) => key === result.career)[0]}倾向 · ${result.scores['VAL_' + result.career]} 分</span></div>
    </div>
    <p>${escape(result.hero.text)}</p>
  </section>`;
}

function careerScores(from = 0) {
  const max = Math.max(1, ...careers.map(([, key]) => result.scores['VAL_' + key]));
  return /*html*/ `<section class="demo-career-scores" ${stamp(from)} aria-label="职业倾向">
    <h5>职业倾向</h5>
    <dl>
      ${careers.map(([label, key]) => {
        const value = result.scores['VAL_' + key];
        return `<div class="${key === result.career ? 'demo-career-active' : ''}"><dt>${label}</dt><dd>
          <span class="demo-meter" aria-hidden="true"><i style="width:${value / max * 100}%"></i></span>
          <strong>${value} 分</strong>
        </dd></div>`;
      }).join('')}
    </dl>
  </section>`;
}

function collection(from = 0) {
  return /*html*/ `<section class="demo-collection" ${stamp(from)} aria-label="人格图鉴">
    <div><h5>人格图鉴</h5><span>${result.profiles.length} 种公开类型 · ${result.hiddenCount} 种隐藏类型</span></div>
    <ul>${result.profiles.map(name => `<li${name === result.name ? ' aria-current="true"' : ''}>${escape(name)}</li>`).join('')}</ul>
  </section>`;
}

function resultMarkup(from) {
  return /*html*/ `<div class="demo-result" ${stamp(from)}>
    ${profileHeader()}
    <div class="demo-result-body">
      ${radarMarkup()}
      ${profileDetails()}
    </div>
    ${heroDetails()}
    ${collection()}
  </div>`;
}

function prepareWzti(view, signal, beats, analysisStage, resultStage) {
  const loader = view.querySelector('[data-demo-analysis]');
  const fill = loader.querySelector('i');
  const [phase, percent] = loader.querySelectorAll(':scope > div:last-child > span');
  const chart = view.querySelector('.demo-radar');
  const svg = chart.querySelector('.demo-radar-svg');
  const outline = svg.querySelector('.demo-radar-outline');
  const guide = svg.querySelector('.demo-radar-guide');
  const gradient = svg.querySelector('linearGradient');
  const labels = [...chart.querySelectorAll('[data-demo-axis]')];
  const dots = [...svg.querySelectorAll('[data-demo-radar-point]')];
  const details = [...chart.querySelectorAll('[data-demo-axis-detail]')];
  const startAnalysis = beats[analysisStage - 1];
  const startResult = beats[resultStage - 1];
  let plotted = ring(0);
  let selected = -1;
  let previousPercent;
  let previousProgress;

  function drawGuide() {
    if (selected < 0) return;
    const [x1, y1] = plotted[selected];
    const [x2, y2] = guideEnds[selected];
    for (const line of [guide, gradient]) {
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
    }
  }

  function select(index, reveal = false) {
    if (index !== selected) {
      selected = index;
      chart.toggleAttribute('data-axis-focused', index >= 0);
      labels.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      dots.forEach((point, i) => point.toggleAttribute('data-axis-active', i === index));
      details.forEach((detail, i) => detail.setAttribute('aria-hidden', String(i !== index)));
      drawGuide();
    }
    if (index >= 0 && reveal) {
      const bounds = view.getBoundingClientRect();
      const bottom = details[index].getBoundingClientRect().bottom;
      const overflow = bottom - bounds.bottom + 12;
      if (overflow > 0) view.scrollBy({ top: overflow, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }

  function selectPoint(event) {
    const bounds = svg.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * chartSize / bounds.width;
    const y = (event.clientY - bounds.top) * chartSize / bounds.height;
    let nearest = -1;
    let distance = 35;
    plotted.forEach(([px, py], index) => {
      const offset = Math.hypot(px - x, py - y);
      if (offset >= distance) return;
      distance = offset;
      nearest = index;
    });
    select(nearest, event.type === 'click');
  }

  svg.addEventListener('click', selectPoint, { signal });
  svg.addEventListener('pointermove', event => {
    if (event.buttons === 1) selectPoint(event);
  }, { signal });
  chart.addEventListener('click', event => {
    const control = event.target.closest('[data-demo-axis]');
    if (!control) return;
    const index = Number(control.dataset.demoAxis);
    select(index === selected ? -1 : index, true);
  }, { signal });
  chart.addEventListener('keydown', event => {
    if (!event.target.matches('[data-demo-axis]')) return;
    if (event.key === 'Escape') {
      select(-1);
      return;
    }
    const index = Number(event.target.dataset.demoAxis);
    const last = axes.length - 1;
    const next = {
      ArrowLeft: (index + last) % axes.length,
      ArrowUp: (index + last) % axes.length,
      ArrowRight: (index + 1) % axes.length,
      ArrowDown: (index + 1) % axes.length,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
    labels[next].focus({ preventScroll: true });
  }, { signal });

  return (elapsed, stage, instant) => {
    if (stage === analysisStage) {
      const age = Math.min(1, (elapsed - startAnalysis) / (startResult - startAnalysis - 240));
      const progress = age < .3 ? age / .3 * 60 : age < .8 ? 60 + (age - .3) / .5 * 25 : 85 + (age - .8) / .2 * 15;
      const rounded = Math.round(progress);
      if (rounded === previousPercent) return;
      previousPercent = rounded;
      phase.textContent = age < .3 ? '提取对局行为' : age < .8 ? '汇总八维分数' : '判定人格与英雄';
      percent.textContent = rounded + '%';
      fill.style.width = progress + '%';
    } else if (stage >= resultStage) {
      const amount = instant ? 1 : Math.max(0, Math.min(1, (elapsed - startResult) / 420));
      if (amount === previousProgress) return;
      previousProgress = amount;
      plotted = pointsAt(plotRadii.map(distance => distance * amount));
      outline.setAttribute('points', polygon(plotted));
      dots.forEach((point, i) => point.setAttribute('transform', `translate(${plotted[i].join(' ')})`));
      drawGuide();
    }
  };
}

const quizBeats = [350, 2010, 2360, 3940, 4290, 5210, 6710, 7060, 9320];
const quiz = {
  title: '原版逐题作答',
  theme: 'wzti',
  retain: true,
  follow: false,
  beats: quizBeats,
  markup: () => /*html*/ `
    ${question(0, 1, 2, 3)}
    ${question(1, 3, 4, 5)}
    <div class="demo-analysis demo-fast-forward" ${stamp(5, 6)}>
      <strong>示例答卷快进</strong><div class="demo-meter"><i style="width:5.56%"></i></div>
      <span>第 3–35 题 · 全部选择 A</span>
    </div>
    ${question(questions.length - 1, 6, 7, 8)}
    ${analysis(8, 9)}
    ${resultMarkup(9)}`,
  prepare: (view, signal) => prepareWzti(view, signal, quizBeats, 8, 9),
};

const radarBeats = [360, 1740, 2090, 4440];
const radar = {
  title: '示例答卷 · 全部选 A',
  theme: 'wzti',
  retain: true,
  follow: false,
  beats: radarBeats,
  markup: () => /*html*/ `
    ${question(questions.length - 1, 1, 2, 3)}
    ${analysis(3, 4)}
    ${resultMarkup(4)}`,
  prepare: (view, signal) => prepareWzti(view, signal, radarBeats, 3, 4),
};

const hero = {
  title: '以「永远发育型」为例',
  theme: 'wzti',
  retain: true,
  follow: false,
  beats: [300, 1100, 2000, 3150],
  markup: () => /*html*/ `
    <div class="demo-result demo-hero-result">
      <div ${stamp(1)}>${profileHeader()}</div>
      ${careerScores(2)}
      ${heroDetails(3)}
      ${collection(4)}
    </div>`,
};

export const wztiDemos = [[quiz], [radar], [hero]];
