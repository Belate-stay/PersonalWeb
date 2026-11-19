import { questions, heroPool } from './wzti-demo.js';

const profiles = {
  T: { name: '团战协作型', detail: '先考虑队友的位置和资源，把配合接起来。' },
  L: { name: '独行节奏型', detail: '擅长自己找空间，把握边线和个人节奏。' },
  S: { name: '稳健发育型', detail: '先稳住经济和兵线，等胜算更大的时机。' },
  A: { name: '主动破局型', detail: '愿意先出手，给僵持的对局打开突破口。' },
  R: { name: '冷静观察型', detail: '习惯观察信息和风险，再决定怎么接这一步。' },
  E: { name: '气氛感知型', detail: '在意场上的互动，喜欢顺着局势和队友交流。' },
  C: { name: '操作挑战型', detail: '喜欢在技能、走位和时机里寻找操作空间。' },
  M: { name: '全局运营型', detail: '习惯看兵线和地图，用资源交换累积优势。' },
};
const axes = Object.keys(profiles);
const balanced = { name: '均衡应变型', detail: '这三题呈现了多种倾向，你会随场上的情况改变做法。' };

export function drawQuestions(random = Math.random) {
  const bank = [...questions];
  for (let index = 0; index < 3; index++) {
    const pick = index + Math.floor(random() * (bank.length - index));
    [bank[index], bank[pick]] = [bank[pick], bank[index]];
  }
  return bank.slice(0, 3);
}

export function quickPersonality(round, answers) {
  const scores = Object.fromEntries(axes.map(axis => [axis, 0]));
  round.forEach((question, index) => {
    for (const [axis, amount] of Object.entries(question.options[answers[index]].score)) {
      if (Object.hasOwn(scores, axis)) scores[axis] += amount;
    }
  });
  const best = Math.max(...Object.values(scores));
  const strongest = axes.filter(axis => scores[axis] === best);
  return best > 0 && strongest.length === 1 ? profiles[strongest[0]] : balanced;
}

export function drawHero(random = Math.random) {
  return heroPool[Math.floor(random() * heroPool.length)];
}

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function mountWztiQuiz(quiz, signal) {
  let round = drawQuestions();
  let answers = [];
  let index = 0;

  function render(focus = false) {
    if (index === round.length) {
      const personality = quickPersonality(round, answers);
      const hero = drawHero();
      quiz.innerHTML = `<div class="quick-result">
        <div class="quick-progress"><span>三题速测</span><span>3 / 3</span></div>
        <div class="quick-result-grid">
          <section><span>娱乐人格</span><h3 tabindex="-1" data-quick-heading>${personality.name}</h3><p>${personality.detail}</p></section>
          <section class="quick-hero">${hero.image ? `<img src="${hero.image}" alt="" width="54" height="54">` : ''}<div><span>英雄推测 · 随机抽取</span><strong>${escape(hero.name)}</strong></div></section>
        </div>
        <div class="quick-actions"><button type="button" data-quick-action="again">重答这组</button><button type="button" data-quick-action="shuffle">换一组题</button></div>
      </div>`;
    } else {
      const question = round[index];
      quiz.innerHTML = `<div class="quick-question">
        <div class="quick-progress"><span>三题速测</span><span>${index + 1} / ${round.length}</span></div>
        <div class="quick-meter" aria-hidden="true"><span style="width:${(index + 1) / round.length * 100}%"></span></div>
        <h3 tabindex="-1" data-quick-heading>${escape(question.question)}</h3>
        <div class="quick-options">${question.options.map(({ text }, option) => `<button type="button" data-quick-option="${option}" aria-pressed="${option === answers[index]}"><span aria-hidden="true">${'ABCD'[option]}</span>${escape(text)}</button>`).join('')}</div>
        <div class="quick-actions">${index > 0 ? '<button type="button" data-quick-action="back">上一题</button>' : ''}</div>
      </div>`;
    }
    quiz.scrollTop = 0;
    if (focus) quiz.querySelector('[data-quick-heading]').focus({ preventScroll: true });
  }

  quiz.addEventListener('click', event => {
    const button = event.target.closest('[data-quick-option],[data-quick-action]');
    if (!button) return;
    if (button.hasAttribute('data-quick-option')) {
      answers[index] = Number(button.dataset.quickOption);
      index++;
    } else if (button.dataset.quickAction === 'back') {
      index--;
    } else {
      if (button.dataset.quickAction === 'shuffle') round = drawQuestions();
      answers = [];
      index = 0;
    }
    render(true);
  }, { signal });
  render();
}
