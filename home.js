import { asset, projects, articles, projectLogo } from './content.js';
import { animate, stagger, scroll, motionValue } from './vendor/motion.js';
import { mountWaterStage, preloadImages } from './water-stage.js';
import { icon } from './icons.js';
import { mountWorkDemonstration, workDemonstration } from './work-demonstrations.js';
import { homeAlbumView, mountHomeAlbum } from './photography.js';
import { swipeButton, wiseButton } from './uiverse-buttons.js';

const ids = ['freechat', 'codex-continue', 'wzti'];
const scenes = ['photography', ...ids];
const photoAsset = 'photo-bicycle-2200.webp';
function homeIcon() { return `<span class="choice-home">${icon('home', { size: 26 })}</span>`; }
export function prepareHome() {
  return preloadImages([asset('photo-bicycle-2200.webp'), asset('photo-bicycle-960.webp'), ...ids.map(id => asset(projects[id].logo))]);
}
const features = {
  freechat: [
    ['标准模式', '回答逐字显示，代码可以复制，指南按步骤展开。'],
    ['拟人模式', '可调用角色库或新建角色，体验场景图、群聊和文本。'],
    ['角色记忆', '从对话里提取重要细节，在后续回复中用上。'],
  ],
  'codex-continue': [
    ['从连接到续跑', '核对五小时额度后，选定对话并发送续跑指令。'],
  ],
  wzti: [
    ['对局情境题', '全卷 36 道四选一。桌面可定位漏答，手机可返回上一题。'],
    ['八维与人格', '按八维分数和标签判定人格，共 13 种，含两种隐藏类型。'],
    ['英雄与图鉴', '用人格和得分最高的职业倾向匹配英雄，查看解析。'],
  ],
};
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function featureContent(id, index, closed) {
  const demoTitle = features[id].length === 1 ? features[id][index][0] : undefined;
  return workDemonstration(id, index, demoTitle, closed);
}

function workTitle(id, name) {
  if (id !== 'codex-continue') return name;
  return `<span class="work-title-text">${name}</span><img class="work-title-image" src="${asset('codex-continue-wordmark.svg')}" alt="" aria-hidden="true" draggable="false">`;
}

function workPanel(id, feature = 0, closed = false) {
  const p = projects[id];
  const hasTabs = features[id].length > 1;
  const tabs = hasTabs ? `<div class="feature-tabs" role="tablist" aria-label="${p.name} 的具体功能">${features[id].map(([title], i) => `<button type="button" id="feature-${i}" role="tab" data-feature="${i}" aria-selected="${i === feature}" tabindex="${i === feature ? 0 : -1}" aria-controls="feature-panel">${title}</button>`).join('')}</div>` : '';
  const panelRole = hasTabs ? `role="tabpanel" aria-labelledby="feature-${feature}" tabindex="0"` : '';
  return `<div class="work-panel-heading" data-work-brand="${id}">
    ${projectLogo(id)}
    <h3>${workTitle(id, p.name)}</h3>
    <p>${p.category} · ${p.platform}</p>
  </div>${tabs}
  <div id="feature-panel" class="feature-panel" ${panelRole}>
    ${featureContent(id, feature, closed)}
    <div class="work-panel-bottom">
      <p class="feature-description">${features[id][feature][1]}</p>
      <a class="uiv-swipe work-entry" href="#/project/${id}">阅读完整项目</a>
    </div>
  </div>`;
}

const previewCopy = {
  freechat: ['先聊几句。也可以从一个角色开始。', '用内置 DeepSeek-V4.1-Flash 开始标准对话，或切到拟人模式，设定角色后继续聊。'],
  wzti: ['答三题，看看你的峡谷打法。', '题目从原版题库抽取。人格按答案归类，英雄从英雄池随机抽取。'],
};

function studioCopyScene(id) {
  const project = projects[id];
  const [headline, summary] = previewCopy[id] ?? [project?.headline, project?.summary];
  const title = project ? escape(headline) : '想法，<br>正在发生。';
  const description = project ? escape(summary) : '我借助 AI，把自己的需要做成应用。<br>也把观察、尝试和修改留在这里。';
  const href = `#/project/${id}`;
  const action = `走进 ${project?.name ?? ''}`;
  return `<div class="studio-copy-scene" data-copy-scene="${id}" aria-hidden="${Boolean(project)}"${project ? ' inert' : ''}><h2>${title}</h2><p class="studio-description">${description}</p>${project ? swipeButton(href, action, 'hero-entry') : ''}</div>`;
}

function noteRows() {
  return articles.map(a => `<details class="home-note" data-note-category="${a.category}" data-note-search="${escape(`${a.title} ${a.summary} ${a.category}`.toLowerCase())}"><summary><span class="note-meta">${a.date} · ${a.category}</span><h3>${a.title}</h3><span class="note-plus" aria-hidden="true">＋</span></summary><div class="note-expansion"><p>${a.summary}</p>${a.sections?.[0] ? `<p class="note-context">${a.sections[0].paragraphs[0]}</p>` : ''}${wiseButton(`#/article/${a.id}`, '展开阅读', 'note-wise', `展开阅读：${escape(a.title)}`)}</div></details>`).join('');
}

export function homeMarkup() {
  return `<div class="interactive-home">
    <div class="studio-scroll"><div class="studio-pin"><section class="studio-hero wrap" aria-labelledby="studio-title">
      <div class="studio-copy"><p class="studio-intro">你好，一个正在探索的计算机学生。</p><visit-count class="studio-visit"><span class="visit-copy">欢迎，你是</span><span class="visit-number"></span><span class="visit-copy">位访客</span></visit-count><h1 id="studio-title">Belate</h1><div class="studio-copy-scenes">${scenes.map(studioCopyScene).join('')}</div></div>
      <div class="studio-space">
        <div id="studio-preview" class="water-scene" role="tabpanel" aria-labelledby="project-choice-photography"><img class="water-fallback" src="${asset('photo-bicycle-2200.webp')}" alt="展厅里的自行车与纸页" draggable="false"><div class="water-canvas"></div></div>
        <div class="project-switch" role="tablist" aria-label="切换首屏画面">
          <div class="project-switch-group project-switch-home frosted-glass">
            <button role="tab" class="project-choice" id="project-choice-photography" data-project-choice="photography" aria-label="首页" tabindex="0" aria-selected="true" aria-controls="studio-preview">${homeIcon()}<span><strong><span class="choice-long">首页</span><span class="choice-short">首页</span></strong><small>我的摄影</small></span></button>
          </div>
          <div class="project-switch-group project-switch-projects frosted-glass">${ids.map(id => `<button role="tab" class="project-choice" id="project-choice-${id}" data-project-choice="${id}" aria-label="${projects[id].name}" tabindex="-1" aria-selected="false" aria-controls="studio-preview">${projectLogo(id, true)}<span><strong><span class="choice-long">${projects[id].name}</span><span class="choice-short">${id === 'codex-continue' ? 'Codex' : projects[id].name}</span></strong><small>${projects[id].platform}</small></span></button>`).join('')}</div>
        </div>
      </div>
    </section></div></div>
    <div class="home-reading">
    <div class="home-part-track">
      <section id="works" class="home-part home-part--works" aria-labelledby="explorer-title">
        <div class="work-explorer wrap"><div class="explorer-intro"><h2 id="explorer-title">从需要出发。<br><span>在使用中，继续生长。</span></h2><p>有时想换一种聊天方式，有时只是想少守着一次倒计时。每个作品，都有一个具体的开始。</p><div class="work-selector" role="tablist" aria-label="浏览项目细节">${ids.map((id, i) => `<button role="tab" id="work-choice-${id}" data-work-choice="${id}" tabindex="${i === 0 ? 0 : -1}" aria-selected="${i === 0}" aria-controls="work-panel">${projectLogo(id)}<span>${projects[id].name}</span>${icon('arrow-up-right')}</button>`).join('')}</div></div><div class="work-console reading-surface"><div id="work-panel" aria-labelledby="work-choice-freechat" role="tabpanel" tabindex="0">${workPanel('freechat')}</div></div></div>
      </section>
    </div>
    <div class="home-part-track">
      <section id="notes" class="home-part home-part--notes" aria-labelledby="writing-title">
        <div class="writing-desk wrap"><div class="writing-intro"><h2 id="writing-title">文字，<br>是另一条线索。</h2><p>项目为何开始，遇到了什么困难，<br>以及那些还没想明白的事。</p><a class="uiv-swipe" href="#/journal">进入文字档案</a></div><div class="writing-content"><label class="writing-search">${icon('search')}<input type="search" placeholder="找一篇文字，或一个想法" aria-label="搜索首页文章"><span data-note-count>${articles.length} 篇</span></label><div class="note-filters" role="group" aria-label="筛选首页文章">${['全部', ...new Set(articles.map(a => a.category))].map((c, i) => `<button data-note-filter="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}</div><div class="home-note-list">${noteRows()}</div><p class="note-empty" hidden role="status">暂时没有找到，试试“FreeChat”或“AI”。</p></div></div>
      </section>
    </div>
    ${homeAlbumView()}
    </div>
  </div>`;
}

export function mountHome(root, { enter = true } = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let feature = Number(root.querySelector('[data-feature][aria-selected="true"]')?.dataset.feature) || 0;
  const previousFeature = feature;
  let animation;
  let introAnimation;
  let featureAnimation;
  let dockAnimation;
  let noteAnimation;
  let sceneIndex = Math.max(0, scenes.indexOf(root.dataset.activeScene));
  const canvas = root.querySelector('.water-canvas');
  canvas.style.transition = enter ? '' : 'none';
  const scene = root.querySelector('.water-scene');
  const dock = root.querySelector('.project-switch');
  const projectsDock = dock.querySelector('.project-switch-projects');
  const sled = document.createElement('span');
  sled.className = 'project-sled frosted-glass'; sled.setAttribute('aria-hidden', 'true'); projectsDock.append(sled);
  const dockX = motionValue(0);
  const stopDockValue = dockX.on('change', value => { sled.style.transform = `translateX(${value}px)`; });
  function moveDock(instant = false) {
    const button = dock.querySelector('[aria-selected="true"]');
    if (!button) return;
    sled.style.width = `${button.offsetWidth}px`; sled.style.height = `${button.offsetHeight}px`;
    if (!button.closest('.project-switch-projects')) { sled.style.visibility = 'hidden'; return; }
    const wasHidden = sled.style.visibility === 'hidden';
    sled.style.visibility = '';
    if (instant || reduced.matches || wasHidden) dockX.jump(button.offsetLeft);
    else dockAnimation = animate(dockX, button.offsetLeft, { type: 'spring', stiffness: 420, damping: 32 });
  }
  const dockResize = new ResizeObserver(() => moveDock(true)); dockResize.observe(dock);
  moveDock(true);
  let stopStory = () => {};
  const storyTrack = root.querySelector('.studio-scroll');
  const hero = storyTrack.querySelector('.studio-hero');
  const reading = root.querySelector('.home-reading');
  // 手机不做「缩小视窗」的滚动故事：宽画幅缩成小窗后上下留白、左侧文案又不见，
  // 视觉上像空了一屏。竖屏直接把首屏当普通全屏段落滚过去。
  const flatStory = matchMedia('(max-width: 760px)');
  function measureTimeline() {
    const travel = Math.max(1, storyTrack.offsetHeight - document.documentElement.clientHeight);
    const collapseDistance = reading.offsetTop - storyTrack.offsetTop - hero.offsetHeight;
    return { travel, compactAt: Math.max(.01, Math.min(.99, collapseDistance / travel)) };
  }
  let timeline = measureTimeline();
  const initialProgress = Math.max(0, Math.min(1, -storyTrack.getBoundingClientRect().top / timeline.travel));
  const previous = ids.indexOf(root.dataset.activeProject);
  const copy = root.querySelector('.studio-copy');
  const copyScenes = [...copy.querySelectorAll('[data-copy-scene]')];
  const workPreview = root.querySelector('#work-panel');
  let disposeDemonstration;
  function attachDemonstration() {
    disposeDemonstration?.();
    disposeDemonstration = mountWorkDemonstration(workPreview.querySelector('.work-demonstration'), reduced);
  }
  attachDemonstration();

  function appearance(progress, photoMix, handoff) {
    const depth = handoff * handoff * (3 - 2 * handoff);
    const handoffTravel = timeline.travel * (1 - timeline.compactAt);
    storyTrack.style.setProperty('--story-progress', String(progress));
    storyTrack.style.setProperty('--studio-depth', String(depth));
    const copyHandoff = Math.min(1, Math.max(0, (handoff - .42) / .40));
    storyTrack.style.setProperty('--studio-copy-exit', String(copyHandoff * copyHandoff * (3 - 2 * copyHandoff)));
    // Let the reading section travel farther than the receding hero.
    storyTrack.style.setProperty('--studio-rise', `${-.24 * handoffTravel * depth}px`);
    hero.inert = depth > .10;
    const dockTravel = Math.min(1, progress / .9);
    const lift = 1 - dockTravel * dockTravel * (3 - 2 * dockTravel);
    dock.style.setProperty('--dock-lift', String(lift));
    const shortPortrait = innerWidth / innerHeight < .8 && innerHeight < 740;
    const amount = Math.max(0, Math.min(1, (progress - (shortPortrait ? .48 : .14)) / (shortPortrait ? .5 : .7)));
    const portrait = innerWidth / innerHeight < .8 || (innerHeight < 650 && innerWidth > innerHeight);
    const eased = amount * amount * (3 - 2 * amount);
    const visibility = portrait ? photoMix * (1 - eased) : photoMix + (1 - photoMix) * eased;
    const target = portrait ? (sceneIndex === 0 ? 1 - eased : 0) : (sceneIndex === 0 ? 1 : eased);
    copy.style.setProperty('--copy-position', String(reduced.matches ? Number(target >= .1) : visibility));
    copy.toggleAttribute('data-hidden', reduced.matches ? target < .1 : visibility === 0);
    copy.inert = target < .1 || visibility < .1;
    copy.setAttribute('aria-hidden', String(copy.inert));
    storyTrack.classList.toggle('is-compact', progress > .7);
  }
  const stage = mountWaterStage(canvas, {
    index: sceneIndex,
    photo: asset(photoAsset),
    onSwipe: direction => selectScene((sceneIndex + (direction > 0 ? 1 : -1) + scenes.length) % scenes.length),
    onFrame: appearance,
    onReady: supported => { scene.classList.toggle('water-ready', supported === true); },
  });
  stage.setProgress(flatStory.matches ? 0 : initialProgress, timeline.compactAt);
  const storyResize = new ResizeObserver(() => {
    timeline = measureTimeline();
    stage.setProgress(flatStory.matches ? 0 : -storyTrack.getBoundingClientRect().top / timeline.travel, timeline.compactAt);
  });
  storyResize.observe(storyTrack);
  root.dataset.activeProject = ids[0];
  function selectScene(index, instant = false) {
    sceneIndex = index;
    const id = scenes[index];
    root.dataset.activeScene = id;
    storyTrack.classList.toggle('is-photo', index === 0);
    storyTrack.classList.toggle('is-project-phase', index > 0);
    root.querySelector('#studio-preview').setAttribute('aria-labelledby', `project-choice-${id}`);
    root.querySelectorAll('[data-project-choice]').forEach(button => {
      const active = button.dataset.projectChoice === id;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
    });
    root.querySelectorAll('.sx-project-link').forEach(link => link.classList.toggle('stage-entry', link.closest('[data-showcase]').dataset.showcase === id));
    moveDock(instant);
    for (const panel of copyScenes) {
      const active = panel.dataset.copyScene === id;
      panel.inert = !active;
      panel.setAttribute('aria-hidden', String(!active));
    }
    root.querySelector('.water-fallback').hidden = index > 0;
    stage.setIndex(index);
  }
  function selectWork(index) {
    if (index === current) return;
    const offset = index > current ? 8 : -8;
    current = index;
    const id = ids[current];
    feature = 0;
    root.dataset.activeProject = id;
    root.querySelectorAll('[data-work-choice]').forEach(button => {
      const active = button.dataset.workChoice === id;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
    });
    const panel = workPreview;
    panel.setAttribute('aria-labelledby', `work-choice-${id}`);
    animation?.stop();
    featureAnimation?.stop();
    panel.innerHTML = workPanel(id, feature, panel.querySelector('[data-demo-closed]') !== null);
    panel.style.opacity = ''; panel.style.transform = '';
    if (!reduced.matches) animation = animate(panel, { opacity: [.83, 1], y: [offset, 0] }, { duration: .34, ease: [.16, 1, .3, 1] });
    attachDemonstration();
  }
  function click(event) {
    const sceneChoice = event.target.closest('[data-project-choice]');
    if (sceneChoice) selectScene(scenes.indexOf(sceneChoice.dataset.projectChoice));
    const workChoice = event.target.closest('[data-work-choice]');
    if (workChoice) selectWork(ids.indexOf(workChoice.dataset.workChoice));
    const featureButton = event.target.closest('[data-feature]');
    if (featureButton && Number(featureButton.dataset.feature) !== feature) {
      const next = Number(featureButton.dataset.feature);
      const offset = next > feature ? 6 : -6;
      feature = next;
      root.querySelectorAll('[data-feature]').forEach(button => {
        button.setAttribute('aria-selected', String(button === featureButton));
        button.tabIndex = button === featureButton ? 0 : -1;
      });
      const panel = root.querySelector('#feature-panel');
      panel.setAttribute('aria-labelledby', featureButton.id);
      featureAnimation?.stop();
      const demo = panel.querySelector('.work-demonstration');
      demo.outerHTML = featureContent(ids[current], feature, demo.hasAttribute('data-demo-closed'));
      const description = panel.querySelector('.feature-description');
      description.textContent = features[ids[current]][feature][1];
      if (!reduced.matches) featureAnimation = animate([panel.querySelector('.work-demonstration'), description],
        { opacity: [.84, 1], x: [offset, 0] }, { duration: .3, ease: [.16, 1, .3, 1] });
      attachDemonstration();
    }
    const filter = event.target.closest('[data-note-filter]');
    if (filter) {
      root.querySelectorAll('[data-note-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
      filterNotes();
    }
  }
  function keys(event) {
    const featureButton = event.target.closest('[data-feature]');
    if (featureButton && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (feature + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      const button = root.querySelector(`[data-feature="${next}"]`);
      button.click(); button.focus({ preventScroll: true }); return;
    }
    const choice = event.target.closest('[data-project-choice],[data-work-choice]');
    if (!choice) return;
    const options = choice.dataset.workChoice ? ids : scenes;
    const selected = options.indexOf(choice.dataset.workChoice || choice.dataset.projectChoice);
    let index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') index = (selected + 1) % options.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') index = (selected + options.length - 1) % options.length;
    if (event.key === 'Home') index = 0;
    if (event.key === 'End') index = options.length - 1;
    if (index === undefined) return;
    event.preventDefault();
    if (choice.dataset.workChoice) selectWork(index);
    else selectScene(index);
    const name = choice.dataset.workChoice ? 'data-work-choice' : 'data-project-choice';
    root.querySelector(`[${name}="${options[index]}"]`).focus({ preventScroll: true });
  }

  function filterNotes() {
    const query = root.querySelector('.writing-search input').value.trim().normalize('NFKC').toLowerCase();
    const category = root.querySelector('[data-note-filter][aria-pressed="true"]').dataset.noteFilter;
    const visible = [];
    root.querySelectorAll('.home-note').forEach(note => {
      const matches = (category === '全部' || note.dataset.noteCategory === category) && note.dataset.noteSearch.normalize('NFKC').includes(query);
      note.hidden = !matches;
      if (matches) visible.push(note);
    });
    root.querySelector('[data-note-count]').textContent = `${visible.length} 篇`;
    root.querySelector('.note-empty').hidden = visible.length !== 0;
    noteAnimation?.stop();
    if (!reduced.matches && visible.length) noteAnimation = animate(visible, { opacity: [0, 1], y: [6, 0] }, { duration: .28, delay: stagger(.018), ease: [.16, 1, .3, 1] });
  }
  function summaryClick(event) {
    const summary = event.target.closest('.home-note > summary');
    if (!summary || reduced.matches) return;
    event.preventDefault();
    const detail = summary.parentElement;
    const start = detail.getBoundingClientRect().height;
    const opening = !(detail.dataset.expanding === 'true' || (!detail.dataset.expanding && detail.open));
    detail.dataset.expanding = String(opening);
    detail._motion?.stop();
    detail.open = true;
    detail.style.height = '';
    const target = opening ? detail.scrollHeight : summary.getBoundingClientRect().height;
    detail.style.overflow = 'hidden';
    detail._motion = animate(detail, { height: [start, target] }, { type: 'spring', stiffness: 320, damping: 34, onComplete: () => {
      detail.open = opening;
      detail.style.height = '';
      detail.style.overflow = '';
      delete detail.dataset.expanding;
    } });
  }
  const input = root.querySelector('.writing-search input');
  const album = root.querySelector('#about-home');
  const disposeAlbum = mountHomeAlbum(album);
  const parts = [...root.querySelectorAll('.home-part')];
  const header = document.querySelector('.site-header');
  let headerHeight = header.offsetHeight;
  const syncSize = part => part.style.setProperty('--part-height', `${part.offsetHeight}px`);
  const partResize = new ResizeObserver(entries => {
    for (const { target } of entries) {
      if (target === header) headerHeight = header.offsetHeight;
      else syncSize(target);
    }
  });
  partResize.observe(header);
  parts.forEach(part => { syncSize(part); partResize.observe(part); });
  const stops = parts.map((part, index) => {
    const next = parts[index + 1]?.parentElement ?? album;
    return scroll((fraction, { y }) => {
      const depth = fraction * fraction * (3 - 2 * fraction);
      if (reduced.matches) return;
      part.style.setProperty('--part-depth', depth);
      const edge = y.offset[0] + .92 * y.containerLength - y.current;
      const uncovered = edge - headerHeight;
      const exit = 1 - Math.min(1, Math.max(0, (uncovered - 20) / 96));
      part.style.setProperty('--part-edge', `${edge}px`);
      part.style.setProperty('--part-copy-exit', String(exit * exit * (3 - 2 * exit)));
    }, { target: next, offset: ['start 92%', 'start 12%'] });
  });
  function revealFocusedControl(event) {
    const part = event.target.closest('.home-part');
    if (!part || reduced.matches || !event.target.matches(':focus-visible')) return;
    const next = part.parentElement.nextElementSibling;
    const rect = event.target.getBoundingClientRect();
    const edge = next.getBoundingClientRect().top;
    if (rect.bottom > edge - 14) {
      const trackBottom = part.parentElement.getBoundingClientRect().bottom - part.parentElement.offsetHeight + part.offsetHeight;
      window.scrollBy({ top: trackBottom - innerHeight + 12, behavior: 'instant' });
    }
  }
  root.addEventListener('click', click);
  root.addEventListener('click', summaryClick);
  root.addEventListener('keydown', keys);
  root.addEventListener('focusin', revealFocusedControl);
  input.addEventListener('input', filterNotes);
  if (enter && !reduced.matches && sceneIndex === 0 && initialProgress < .01) {
    const offset = copy.offsetLeft + copy.offsetWidth + 16;
    introAnimation = animate(copy, { x: [-offset, 0] }, { duration: .65, ease: [.22, 1, .36, 1] });
  }
  if (previous > 0) {
    selectWork(previous);
    if (previousFeature > 0) root.querySelector(`[data-feature="${previousFeature}"]`)?.click();
  }
  selectScene(sceneIndex, true);
  stopStory = scroll(progress => { stage.setProgress(flatStory.matches ? 0 : progress, timeline.compactAt); }, { target: storyTrack, offset: ['start start', 'end end'] });
  const dispose = () => {
    stage?.dispose();
    disposeDemonstration?.(); storyResize.disconnect();
    dockAnimation?.stop(); stopDockValue(); dockX.destroy(); dockResize.disconnect(); sled.remove(); stopStory(); scene.style.transform = '';
    animation?.stop(); introAnimation?.stop(); featureAnimation?.stop(); noteAnimation?.stop();
    copy.style.transform = '';
    root.querySelectorAll('#work-panel,#feature-panel > *,.home-note').forEach(element => { element.style.opacity = ''; element.style.transform = ''; });
    root.querySelectorAll('.home-note').forEach(note => {
      note._motion?.stop();
      if (note.dataset.expanding) note.open = note.dataset.expanding === 'true';
      note.style.height = ''; note.style.overflow = ''; delete note.dataset.expanding;
    });
    root.removeEventListener('click', click); root.removeEventListener('click', summaryClick); root.removeEventListener('keydown', keys); input.removeEventListener('input', filterNotes);
    root.removeEventListener('focusin', revealFocusedControl);
    partResize.disconnect();
    stops.forEach(stop => stop());
    disposeAlbum();
  };
  return { dispose, showPhotography: () => { if (sceneIndex !== 0) selectScene(0); } };
}
