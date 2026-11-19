import { animate, stagger, scroll, inView } from './vendor/motion.js';
import { initWheelScroll, shouldDismiss } from './motion.js';
import { readRoute } from './routes.js';
import { renderView } from './views.js';
import { projects, articles, asset } from './content.js';
import { initGlass } from './glass.js';
import { mountHome, prepareHome } from './home.js';
import { preloadImages } from './water-stage.js';
import { initSiteSearch } from './site-search.js';
import { initInteractions, showToast, syncNavigation } from './interactions.js';
import { mountPhotoViewer, photoDetailHref, mountTileEntrance, mountPhotoFilters } from './photography.js';
import { createPhotoPainter, movePhoto, photoBox, photoClip, photoFrame, photoTrack, showPhotoDialog } from './photo-motion.js';
import { mountAbout } from './about.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const main = $('#main');
const siteFooter = $('.site-footer');
const footerContent = siteFooter.innerHTML;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const stopWheelScroll = initWheelScroll(reduced);
const motionOptions = { type: 'spring', stiffness: 330, damping: 34, mass: 1 };
let route;
let home;
let gallery;
let cleanups = [];
let routeAnimations = [];
let filterAnimations = [];
let filterSwapTimer = 0;
let routeGeneration = 0;
let currentKey = '';
let returnFocus = null;
let navigationGeneration = 0;
let morphElements = [];
function clearMorphNames() {
  for (const element of morphElements) element.style.viewTransitionName = '';
  morphElements = [];
}
function visibleSource(element) {
  if (!element) return false;
  const box = element.getBoundingClientRect();
  return box.width > 1 && box.height > 1 && box.bottom > 0 && box.top < innerHeight;
}
function routeMorph(link, next) {
  if (next.type === 'project') {
    if (link?.closest('.case-switch')) return null;
    const source = link
      ? link.querySelector('.app-icon') || link.closest('[data-showcase]')?.querySelector('.sx-identity .app-icon') || link.closest('[data-work-choice]')?.querySelector('.app-icon') || link.closest('.work-console')?.querySelector('.work-panel-heading .app-icon') || link.closest('.next-project')?.querySelector('.app-icon')
      : document.querySelector(`[data-work-choice="${next.id}"] .app-icon`) || document.querySelector(`[data-project-choice="${next.id}"] .app-icon`);
    if (!visibleSource(source)) return null;
    return { source, dest: '.project-titlebar .app-icon', name: 'shared-logo' };
  }
  if (next.type === 'home' && route?.type === 'project' && (next.section === 'works' || !next.section)) {
    const source = document.querySelector('.project-titlebar .app-icon');
    if (!visibleSource(source)) return null;
    return { source, dest: `[data-work-choice="${route.id}"] .app-icon`, name: 'shared-logo' };
  }
  return null;
}
let activeTransition = null;
let pendingRoute = null;
let demoResize = null;
const positions = new Map();
const historyPositions = new Map();
let historyId = history.state?.belateEntry || Date.now();
let nextHistoryId = Math.max(Date.now(), historyId);
if (!history.state?.belateEntry) history.replaceState({ ...history.state, belateEntry: historyId, scrollY: 0 }, '', location.href);
history.scrollRestoration = 'manual';

function key(value) { return `${value.type}/${value.id || ''}`; }
// 搜索跳到页内区块：折叠的爱好图组先展开，再滚到它面前。
function scrollToFocus(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (target.tagName === 'DETAILS' && !target.open) target.open = true;
  target.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
}
function galleryImage(title) {
  return gallery?.querySelector(`.photo-tile[href="${CSS.escape(photoDetailHref({ title }))}"] img`);
}
function flyBetweenPhotos(source, from, target) {
  let to = photoFrame(target);
  if (!to || !source?.naturalWidth) return;
  const image = new Image();
  image.src = source.currentSrc || source.src;
  image.classList.add('photo-flight');
  image.setAttribute('aria-hidden', 'true');
  document.body.append(image);
  const destination = target.closest('.photo-original-frame') ?? target;
  destination.style.visibility = 'hidden';
  const paint = createPhotoPainter(image, from, to);
  // 目标框逐帧重取：飞行途中页面滚动或历史恢复滚动，落点实时跟随缩略图，不落错位；与滚动并行不冲突。
  let motion;
  motion = movePhoto(from, () => { to = photoTrack(target) ?? to; return to; }, paint, finish, { ease: [.22, .8, .25, 1], duration: .56 });
  function finish() {
    if (!image.isConnected) return;
    image.remove();
    motion?.stop();
    destination.style.visibility = '';
    document.removeEventListener('belate:open-overlay', finish);
  }
  document.addEventListener('belate:open-overlay', finish, { once: true });
  cleanups.push(finish);
}
function stopRouteEffects() {
  cleanups.forEach(cleanup => cleanup());
  cleanups = [];
  home = null;
  routeAnimations.forEach(animation => animation.stop());
  routeAnimations = [];
  filterAnimations.forEach(animation => animation.stop());
  filterAnimations = [];
  clearTimeout(filterSwapTimer);
  pageBarContent = 0;
  $$('.fly-image,.reading-progress').forEach(element => element.remove());
  $$('.case-cover img').forEach(element => element.style.opacity = '');
}
function pageTitle(next) {
  if (next.type === 'project') return `${projects[next.id].name} · Belate`;
  if (next.type === 'article') return `${articles.find(a => a.id === next.id).title} · Belate`;
  if (next.type === 'journal') return '文字与记录 · Belate';
  if (next.type === 'about') return '关于我 · Belate';
  if (next.type === 'photography') return '摄影集 · Belate';
  if (next.type === 'photo') return `${next.id} · 摄影集 · Belate`;
  if (next.type === 'idol') return `${next.id === 'yang-chaoyue' ? '杨超越' : next.id} · Belate`;
  if (next.type === 'idol-photos') return `收藏图片 · Belate`;
  if (next.type === 'vision') return `${next.id === 'google' ? 'Google' : 'Xiaomi'} · Belate`;
  if (next.type === 'third-party') return '第三方地址 · Belate';
  return 'Belate — 把好奇，做成日常';
}
function pageEffects(enter = true) {
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  if (route.type !== 'home') {
    document.body.append(progress);
    cleanups.push(scroll(animate(progress, { scaleX: [0, 1] }, { ease: 'linear' })));
  }
  if (!reduced.matches) {
    const hero = $('.hero');
    if (hero) cleanups.push(scroll(animate($('.hero-photo img'), { y: [0, 100], scale: [1.04, 1] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] }));
    const seaside = $('.seaside-photo');
    if (seaside) cleanups.push(scroll(animate($('img', seaside), { y: [-28, 28], scale: [1.1, 1.1] }, { ease: 'linear' }), { target: seaside, offset: ['start end', 'end start'] }));
  }
  const sectionLinks = $$('[data-section]', main);
  if (route.type === 'photography') {
    const nav = $('.photo-format-nav', main);
    const groups = sectionLinks.map(link => document.getElementById(link.dataset.section));
    const header = $('.site-header');
    let current = -1;
    function showCurrentFormat() {
      const boundary = header.offsetHeight + nav.offsetHeight + 22;
      // 筛选会收起部分画幅组：只在可见组里判断当前位置；全部收起时不标记。
      let active = -1;
      groups.forEach((group, index) => {
        if (!group.hidden && group.getBoundingClientRect().top <= boundary) active = index;
      });
      if (active === -1) active = groups.findIndex(group => !group.hidden);
      if (active === current) return;
      current = active;
      sectionLinks.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    const resize = new ResizeObserver(() => {
      nav.parentElement.style.setProperty('--photo-nav-height', `${nav.offsetHeight}px`);
      showCurrentFormat();
    });
    resize.observe(nav);
    showCurrentFormat();
    cleanups.push(scroll(showCurrentFormat), () => resize.disconnect());
  } else if (sectionLinks.length) cleanups.push(inView('.reading-section', element => {
    sectionLinks.forEach(link => {
      if (link.dataset.section === element.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { margin: '-8% 0px -65% 0px' }));
  if (route.type === 'home') {
    home = mountHome(main, { enter });
    cleanups.push(home.dispose);
  }
  if (route.type === 'photo' || route.type === 'idol-photos') cleanups.push(mountPhotoViewer(main));
  if (route.type === 'photography' || route.type === 'idol-photos') cleanups.push(mountTileEntrance(main, reduced));
  // 文集与影集同一套入场：文章行首见视口时逐条淡入上浮，只播一次。
  if (route.type === 'journal') cleanups.push(mountTileEntrance(main, reduced, '.article-row'));
  if (route.type === 'photography') cleanups.push(mountPhotoFilters(main, reduced));
  if (route.type === 'about') cleanups.push(mountAbout($('.about-page'), reduced));
}

function renderRoute(next, { restore = false, source = null, initial = false, targetY, spatial = false, fromHeader = false, resetHome = false } = {}) {
  stopWheelScroll();
  if (route && key(next) === currentKey) {
    if (restore) window.scrollTo({ top: targetY ?? positions.get(currentKey) ?? 0, behavior: 'instant' });
    else if (next.section) document.getElementById(next.section)?.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    else if (next.focus) scrollToFocus(next.focus);
    else {
      if (resetHome) home?.showPhotography();
      window.scrollTo({ top: 0, behavior: reduced.matches || resetHome ? 'instant' : 'smooth' });
    }
    return;
  }
  const generation = ++routeGeneration;
  if (route) positions.set(currentKey, window.scrollY);
  const sourceImage = source?.querySelector('.project-image');
  const sourceRect = sourceImage?.getBoundingClientRect();
  const flyer = !spatial && !reduced.matches && sourceImage?.complete && sourceRect.width ? sourceImage.cloneNode() : null;
  const leavingGallery = route?.type === 'photography';
  if (leavingGallery) gallery = main.firstElementChild;
  const previousPhoto = route?.type === 'photo' && next.type === 'photography' ? route.id : null;
  const leavingPhoto = previousPhoto ? $('.photo-original img') :
    leavingGallery && next.type === 'photo' ? galleryImage(next.id) : null;
  const photoOrigin = !reduced.matches && leavingPhoto ? photoFrame(leavingPhoto) : null;
  stopRouteEffects();
  hideImage(true);
  route = next;
  currentKey = key(next);
  document.body.classList.toggle('home', next.type === 'home');
  document.body.classList.remove('demo-expanded');
  if (resetHome) delete main.dataset.activeScene;
  if (leavingGallery) {
    // Keep decoded gallery images connected while another route is displayed.
    gallery.hidden = true;
    document.body.append(gallery);
  }
  if (next.type === 'photography' && gallery) {
    main.replaceChildren(gallery);
    gallery.hidden = false;
  } else main.innerHTML = renderView(next);
  if (next.type === 'home') $('.album-ending', main).innerHTML = footerContent;
  siteFooter.hidden = next.type === 'home';
  footerTypingSync();
  document.title = pageTitle(next);
  $$('.main-nav a').forEach(link => {
    const active = next.type === 'home' || next.type === 'project' ? 'works' : next.type === 'article' ? 'journal' : next.type === 'photo' ? 'photography' : next.type.startsWith('idol') || next.type === 'vision' ? 'about' : next.type;
    if (link.dataset.nav === active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  // 导航滑片始终补间；页面转场不应让它瞬移。
  syncNavigation(false);
  const restoringJournal = restore && next.type === 'journal';
  if (restoringJournal && history.state?.journalCategory) {
    const filter = $(`[data-filter="${CSS.escape(history.state.journalCategory)}"]`, main);
    if (filter) filterArticles(filter, { instant: true });
  }
  window.scrollTo({ top: restore ? targetY ?? positions.get(currentKey) ?? 0 : 0, behavior: 'instant' });
  if (restore) requestAnimationFrame(() => {
    // 浏览器在历史返回后会把离开前聚焦的元素自行滚入视野（发生在本函数之后且不受 preventScroll 约束），
    // 下一帧把恢复位置重新落实一遍，盖过这次浏览器自发滚动。
    if (generation === routeGeneration) window.scrollTo({ top: targetY ?? positions.get(currentKey) ?? 0, behavior: 'instant' });
  });
  if (next.section && (!restore || initial)) document.getElementById(next.section)?.scrollIntoView({ behavior: 'instant' });
  if (!initial) main.focus({ preventScroll: true });
  if (!initial && restoringJournal && history.state?.journalArticle) {
    const entry = $(`.article-row[href="#/article/${CSS.escape(history.state.journalArticle)}"]:not([hidden])`, main);
    entry?.focus({ preventScroll: true });
  }
  if (restore && returnFocus && next.type === 'home') {
    $(`[data-project-choice="${returnFocus}"]`)?.focus({ preventScroll: true });
  }
  const targetImage = $('.case-cover img');
  const returnTile = previousPhoto && galleryImage(previousPhoto);
  if (photoOrigin) {
    const thumbnail = previousPhoto ? returnTile : leavingPhoto;
    flyBetweenPhotos(thumbnail, photoOrigin, returnTile || $('.photo-original img'));
  }
  if (returnTile && photoFrame(returnTile)) returnTile.closest('a').focus({ preventScroll: true });
  if (flyer && targetImage) {
    const destination = targetImage.getBoundingClientRect();
    Object.assign(flyer.style, { left: `${sourceRect.left}px`, top: `${sourceRect.top}px`, width: `${sourceRect.width}px`, height: `${sourceRect.height}px`, maxWidth: 'none', borderRadius: '7px' });
    flyer.className = 'fly-image';
    document.body.append(flyer);
    targetImage.style.opacity = '0';
    routeAnimations.push(animate(flyer, { x: destination.left - sourceRect.left, y: destination.top - sourceRect.top, scaleX: destination.width / sourceRect.width, scaleY: destination.height / sourceRect.height }, { ...motionOptions, onComplete: () => {
      if (generation !== routeGeneration) return;
      targetImage.style.opacity = '';
      flyer.remove();
    } }));
  }
  if (!spatial && !reduced.matches && fromHeader) {
    // The header stays fixed while the new content settles into place.
    const content = next.type === 'home' ? $('.studio-copy', main) : main.firstElementChild;
    const entrance = content.animate(
      [{ opacity: .55, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' },
    );
    cleanups.push(() => entrance.cancel());
  } else if (!spatial && !reduced.matches && next.type !== 'home' && next.type !== 'about' && (initial || !restore)) {
    // 关于页的开场交给打字动画（about.js mountIntroTyping），不再叠加逐条淡入。
    const entrance = $$('.case-header > :not(.back-link),.page-title > *,.article-header > :not(.back-link)');
    if (entrance.length) routeAnimations.push(animate(entrance, { opacity: [0, 1], y: [24, 0] },
      { duration: .7, delay: stagger(.06), ease: [.16, 1, .3, 1] }));
  }
  pageEffects(!spatial && !fromHeader);
  if (next.type === 'project' && next.id === 'freechat') { mountFreeChat(generation); mountFeatureRec(generation); }
  if (next.type === 'project' && (next.id === 'codex-continue' || next.id === 'wzti')) mountProjectDemo(generation);
  if (next.focus && !restore) requestAnimationFrame(() => { if (generation === routeGeneration) scrollToFocus(next.focus); });
  if (spatial) document.documentElement.style.setProperty('--transition-top', `${Math.max(0, $('.site-header').getBoundingClientRect().bottom + 10 - main.getBoundingClientRect().top)}px`);
}

function changeRoute(next, options = {}) {
  const target = `${key(next)}/${next.section || ''}`;
  if (route && key(next) === currentKey) {
    // 同页锚点/回到当前页也要取消尚未落地的异步跳转，否则旧跳转会在稍后把页面换走。
    navigationGeneration++;
    activeTransition?.skipTransition(); activeTransition = null;
    pendingRoute = null; delete document.documentElement.dataset.navigation;
    return renderRoute(next, options);
  }
  if (pendingRoute === target && !options.fromHeader) return;
  // 连续点击时不再叠第二个 View Transition：直接落地，保证输入永远跟手。
  const interrupting = Boolean(activeTransition || pendingRoute);
  const generation = ++navigationGeneration;
  activeTransition?.skipTransition(); activeTransition = null;
  // 照片详情有自己的飞行转场；其余站内跳转统一走 View Transition。
  const photoFlow = route?.type === 'photo' || next.type === 'photo';
  if (options.fromHeader || reduced.matches || photoFlow || interrupting || !document.startViewTransition) {
    pendingRoute = null; delete document.documentElement.dataset.navigation;
    clearMorphNames();
    return renderRoute(next, options);
  }
  pendingRoute = target;
  const origin = options.origin || { x: main.clientWidth / 2, y: Math.min(main.clientHeight * .35, 320) };
  document.documentElement.style.setProperty('--vt-x', `${origin.x}px`);
  document.documentElement.style.setProperty('--vt-y', `${origin.y}px`);
  const visuals = next.type === 'home' ? prepareHome() : next.type === 'project' ? preloadImages([asset(projects[next.id].cover), asset(projects[next.id].logo)]) : Promise.resolve();
  // Decode outside the browser's snapshot freeze so navigation remains interactive.
  Promise.all([visuals, document.fonts.ready]).then(() => {
    if (generation !== navigationGeneration) return;
    if ($('dialog[open]')) { pendingRoute = null; renderRoute(next, options); return; }
    document.documentElement.dataset.navigation = options.restore ? 'back' : 'forward';
    clearMorphNames();
    const morph = routeMorph(options.link, next);
    if (morph) {
      morph.source.style.viewTransitionName = morph.name;
      morphElements.push(morph.source);
    }
    const update = () => {
      // Skipping an interrupted transition does not cancel its pending DOM update.
      if (generation !== navigationGeneration) return;
      renderRoute(next, { ...options, spatial: true });
      if (morph) {
        const destination = document.querySelector(morph.dest);
        if (destination) {
          destination.style.viewTransitionName = morph.name;
          morphElements.push(destination);
        }
      }
    };
    const transition = document.startViewTransition(update);
    activeTransition = transition;
    transition.ready.catch(() => {});
    transition.finished.catch(() => {}).then(() => {
      clearMorphNames();
      if (generation !== navigationGeneration) return;
      activeTransition = null; pendingRoute = null; delete document.documentElement.dataset.navigation;
    });
  });
}
document.addEventListener('belate:open-overlay', () => activeTransition?.skipTransition());

async function mountFreeChat(generation) {
  const status = $('.demo-status');
  try {
    const { demoHtml } = await import('./freechat-demo.js');
    if (generation !== routeGeneration) return;
    const frame = $('#freechat-live');
    frame.addEventListener('load', () => {
      if (status?.isConnected) { status.textContent = ''; status.closest('.live-demo').setAttribute('aria-busy', 'false'); }
    }, { once: true });
    frame.srcdoc = demoHtml;
  } catch {
    if (status?.isConnected) { status.textContent = '体验暂未载入，请重新打开本页。'; status.closest('.live-demo').setAttribute('aria-busy', 'false'); }
  }
}

async function mountFeatureRec(generation) {
  const slot = $('[data-feature-rec]');
  if (!slot) return;
  try {
    const { mountFeatureRecDemo } = await import('./feature-rec-demo.js');
    if (generation !== routeGeneration || !slot.isConnected) return;
    cleanups.push(mountFeatureRecDemo(slot, { reduced }));
  } catch {
    if (slot.isConnected) slot.textContent = '演示暂未载入，请重新打开本页。';
  }
}

async function mountProjectDemo(generation) {
  const slot = $('[data-project-demo]');
  if (!slot) return;
  try {
    const { mountProjectLiveDemo } = await import('./project-live-demos.js');
    if (generation !== routeGeneration || !slot.isConnected) return;
    cleanups.push(mountProjectLiveDemo(slot));
  } catch {
    if (slot.isConnected) slot.textContent = '演示暂未载入，请重新打开本页。';
  }
}

function navigate(link) {
  const url = new URL(link.href, location.href);
  url.searchParams.delete('project');
  const next = readRoute(url.href);
  if (route?.type === 'article' && next.type === 'journal' && link.matches('.back-link') && history.state?.returnToJournal) {
    history.back();
    return;
  }
  if (route?.type === 'home' && next.type === 'project') returnFocus = next.id;
  if (url.href !== location.href) {
    const fromJournal = route?.type === 'journal';
    const journalArticle = fromJournal && link.matches('.article-row') ? next.id : null;
    historyPositions.set(historyId, window.scrollY);
    history.replaceState({ ...history.state, scrollY: window.scrollY, ...(fromJournal ? { journalArticle } : {}) }, '', location.href);
    historyId = ++nextHistoryId;
    history.pushState({ belateEntry: historyId, scrollY: 0, ...(journalArticle ? { returnToJournal: true } : {}) }, '', url);
  }
  const linkBox = link.getBoundingClientRect();
  const mainBox = main.getBoundingClientRect();
  const origin = {
    x: Math.max(0, Math.min(mainBox.width, linkBox.left + linkBox.width / 2 - mainBox.left)),
    y: Math.max(0, Math.min(mainBox.height, linkBox.top + linkBox.height / 2 - mainBox.top)),
  };
  changeRoute(next, {
    source: link.matches('[data-project-art]') ? link : link.querySelector('[data-project-art]'),
    fromHeader: Boolean(link.closest('.site-header')),
    resetHome: next.type === 'home' && !next.section,
    restore: route?.type === 'photo' && next.type === 'photography',
    origin,
    link,
  });
}
document.addEventListener('click', event => {
  const typeToggle = event.target.closest('.article-type-toggle');
  if (typeToggle) {
    const large = $('.article-page').classList.toggle('large-type');
    typeToggle.setAttribute('aria-pressed', String(large));
    typeToggle.textContent = large ? '恢复字号 Aa' : '放大正文 Aa';
    return;
  }
  if (event.target.closest('[data-demo-reset]')) {
    const frame = $('#freechat-live');
    if (frame?.srcdoc) frame.srcdoc = frame.srcdoc;
    return;
  }
  if (event.target.closest('[data-demo-expand]')) {
    const panel = $('.live-demo');
    const origin = panel.getBoundingClientRect(); demoResize?.cancel();
    const expanded = panel.classList.toggle('is-expanded');
    event.target.closest('button').setAttribute('aria-expanded', String(expanded));
    event.target.closest('button').textContent = expanded ? '收起体验 ↙' : '展开体验 ↗';
    document.body.classList.toggle('demo-expanded', expanded);
    if (!reduced.matches) {
      const destination = panel.getBoundingClientRect();
      panel.dataset.resizing = '';
      const animation = panel.animate([{ transform: `translate(${origin.x - destination.x}px,${origin.y - destination.y}px) scale(${origin.width / destination.width},${origin.height / destination.height})` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
      demoResize = animation;
      const finish = () => { if (demoResize === animation) delete panel.dataset.resizing; };
      animation.finished.then(finish).catch(finish);
    }
    return;
  }
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: 'instant' });
    return;
  }
  const section = event.target.closest('[data-section]');
  if (section) {
    event.preventDefault();
    document.getElementById(section.dataset.section)?.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
    return;
  }
  const opener = event.target.closest('[data-image]');
  if (opener) { showImage(opener); return; }
  const filter = event.target.closest('[data-filter]');
  if (filter) { filterArticles(filter); return; }
  const copy = event.target.closest('.copy-link');
  if (copy) { copyPageLink(copy); return; }
  if (event.target.closest('.back-top')) { window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' }); return; }
  const link = event.target.closest('a[href]');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || !link.getAttribute('href').startsWith('#')) return;
  event.preventDefault();
  navigate(link);
});
window.addEventListener('popstate', () => {
  historyPositions.set(historyId, window.scrollY);
  if (!history.state?.belateEntry) {
    historyId = ++nextHistoryId;
    history.replaceState({ belateEntry: historyId, scrollY: 0 }, '', location.href);
    changeRoute(readRoute(location.href));
    return;
  }
  historyId = history.state.belateEntry;
  changeRoute(readRoute(location.href), { restore: true, targetY: historyPositions.get(historyId) ?? history.state?.scrollY });
});
window.addEventListener('hashchange', () => {
  const next = readRoute(location.href);
  if (key(next) !== currentKey) changeRoute(next, { restore: true });
});
function filterArticles(button, { instant = false } = {}) {
  if (button.getAttribute('aria-pressed') === 'true') return;
  filterAnimations.forEach(animation => animation.stop());
  filterAnimations = [];
  const name = button.dataset.filter;
  if (!instant) history.replaceState({ ...history.state, journalCategory: name, journalArticle: null }, '', location.href);
  $$('[data-filter]').forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('is-active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  const rows = $$('.article-row');
  const show = rows.filter(row => name === '全部' || row.dataset.category === name);
  // 两段式过渡：旧列先淡出收场再换行入场，避免「瞬间蒸发 + 淡入」的断裂感。
  const swap = () => {
    rows.forEach(row => {
      row.hidden = !show.includes(row);
      row.style.opacity = '';
      row.style.transform = '';
    });
    pageBarContent = 0;
    if (!instant && !reduced.matches) filterAnimations.push(animate(show, { opacity: [0, 1], y: [12, 0] }, { duration: .42, delay: stagger(.03), ease: [.16, 1, .3, 1] }));
  };
  const outgoing = rows.filter(row => !row.hidden && !show.includes(row));
  if (!instant && !reduced.matches && outgoing.length) {
    filterAnimations.push(animate(outgoing, { opacity: [1, 0], y: [0, -6] }, { duration: .14, ease: [.4, 0, 1, 1] }));
    filterSwapTimer = setTimeout(swap, 135);
  } else swap();
}
async function copyPageLink(button) {
  const status = $('.copy-status');
  try {
    await navigator.clipboard.writeText(location.href);
    if (button.isConnected) { status.textContent = '链接已复制'; showToast('链接已复制'); }
  } catch {
    if (button.isConnected) { status.textContent = '请复制浏览器地址栏中的链接'; showToast('请复制地址栏中的链接'); }
  }
}

const imageDialog = $('#image-dialog');
const previewImage = $('#preview-image');
let imageOpener;
let imageSource;
let imageMotion;
let imageGeneration = 0;
let drag = null;
let dragDistance = 0;
let imageClosing = false;
const imageOpen = { x: 0, y: 0, scale: 1, scaleY: 1, radius: 0, opacity: 1, veil: 1, cropTop: 0, cropRight: 0, cropBottom: 0, cropLeft: 0 };
let imageValue = imageOpen;
function paintImage(value) {
  imageValue = value;
  previewImage.style.transform = `translate(${value.x}px,${value.y}px) scale(${value.scale},${value.scaleY})`;
  previewImage.style.opacity = String(value.opacity);
  previewImage.style.clipPath = photoClip(value, value.radius);
  imageDialog.style.setProperty('--photo-veil', String(value.veil));
}
function moveImage(to, complete) {
  imageMotion?.stop();
  imageMotion = movePhoto(imageValue, to, paintImage, complete);
}
function previewOrigin() {
  const source = photoFrame(imageSource);
  const qr = imageDialog.hasAttribute('data-qr-preview');
  if (!source) return { ...imageOpen, scale: .94, scaleY: .94, opacity: 0, veil: 0 };
  const { x, y, width, height, ...crop } = source;
  const destination = photoBox(previewImage);
  const horizontal = imageValue.scale * width / destination.width;
  const vertical = imageValue.scaleY * height / destination.height;
  const scale = qr ? horizontal : Math.min(horizontal, vertical);
  const scaleY = qr ? vertical : scale;
  return {
    ...crop,
    x: imageValue.x + x + (width - destination.width) / 2 - destination.x,
    y: imageValue.y + y + (height - destination.height) / 2 - destination.y,
    scale, scaleY,
    radius: qr ? (parseFloat(getComputedStyle(imageSource).borderRadius) || 0) / scaleY : 0,
    opacity: 1,
    veil: 0,
  };
}
async function showImage(button) {
  if (imageDialog.open) return;
  const generation = ++imageGeneration;
  const source = button.dataset.image;
  previewImage.src = source;
  await previewImage.decode().catch(() => {});
  if (generation !== imageGeneration || !button.isConnected || button.dataset.image !== source || !previewImage.naturalWidth) return;
  imageOpener = button;
  imageSource = $('img', button);
  const qr = button.hasAttribute('data-qr-preview');
  imageDialog.toggleAttribute('data-qr-preview', qr);
  if (qr) button.setAttribute('aria-expanded', 'true');
  imageDialog.setAttribute('aria-label', qr ? '微信二维码' : '图片预览');
  previewImage.alt = qr ? (imageSource.alt || button.dataset.caption) : (button.dataset.caption || '');
  $('.preview-caption').textContent = button.dataset.caption || '';
  const download = $('.preview-download');
  download.hidden = !button.dataset.download;
  if (button.dataset.download) {
    download.href = button.dataset.download;
    download.download = button.dataset.downloadName || '';
  }
  paintImage({ ...imageOpen, opacity: 0, veil: 0 });
  showPhotoDialog(imageDialog);
  paintImage(previewOrigin());
  if (imageSource) imageSource.style.visibility = 'hidden';
  moveImage(qr ? { ...imageOpen, radius: 4 } : imageOpen);
}
function hideImage(immediate = false) {
  imageGeneration++;
  if (!imageDialog.open || (imageClosing && !immediate)) return;
  imageClosing = true;
  drag = null;
  const finish = () => {
    imageMotion?.stop();
    imageMotion = null;
    if (imageSource) imageSource.style.visibility = '';
    imageSource = null;
    imageDialog.close();
    imageDialog.removeAttribute('data-qr-preview');
    imageDialog.setAttribute('aria-label', '图片预览');
    if (imageOpener?.hasAttribute('data-qr-preview')) imageOpener.setAttribute('aria-expanded', 'false');
    imageClosing = false;
    if (!immediate) imageOpener?.focus({ preventScroll: true });
  };
  if (immediate) finish();
  else moveImage(previewOrigin(), finish);
}
$('#close-image').addEventListener('click', () => hideImage());
imageDialog.addEventListener('cancel', event => { event.preventDefault(); hideImage(); });
imageDialog.addEventListener('click', event => { if (event.target === imageDialog || event.target.matches('.image-stage')) hideImage(); });
previewImage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button > 0 || imageClosing || imageDialog.hasAttribute('data-qr-preview')) return;
  event.preventDefault();
  const base = imageValue;
  imageMotion?.stop();
  imageMotion = null;
  drag = { start: event.clientY, time: event.timeStamp, velocity: 0, base };
  dragDistance = 0;
  previewImage.setPointerCapture(event.pointerId);
});
previewImage.addEventListener('pointermove', event => {
  if (!drag) return;
  const distance = Math.max(0, event.clientY - drag.start);
  drag.velocity = (distance - dragDistance) / Math.max(event.timeStamp - drag.time, 1) * 1000;
  drag.time = event.timeStamp;
  dragDistance = distance;
  const factor = 1 - Math.min(distance / innerHeight * .25, .2);
  paintImage({ ...drag.base, y: drag.base.y + distance, scale: drag.base.scale * factor, scaleY: drag.base.scaleY * factor });
});
function releaseImage(event, cancelled = false) {
  if (!drag) return;
  if (!cancelled && shouldDismiss(dragDistance, drag.velocity, event.timeStamp - drag.time)) hideImage();
  else moveImage(imageOpen);
  drag = null;
}
previewImage.addEventListener('pointerup', event => releaseImage(event));
previewImage.addEventListener('pointercancel', event => releaseImage(event, true));
reduced.addEventListener('change', () => {
  navigationGeneration++; activeTransition?.skipTransition(); activeTransition = null; pendingRoute = null; delete document.documentElement.dataset.navigation;
  const requested = readRoute(location.href);
  if (key(requested) !== currentKey) { renderRoute(requested, { restore: true, targetY: historyPositions.get(historyId) ?? history.state?.scrollY }); return; }
  stopRouteEffects();
  $$('.hero-copy > *,.case-header > *,.page-title > *,.article-header > *,.hero-photo img,.seaside-photo img').forEach(element => {
    element.style.opacity = '';
    element.style.transform = '';
  });
  pageEffects();
});
initGlass();
initInteractions();
initSiteSearch();

// 页首名字：Belate. ⇄ 胡勃阳.，立方体翻面；不再作为回首页链接（首页由导航“摘要”负责）。
function initWordmarkFlip() {
  const mark = document.querySelector('.site-header .wordmark');
  if (!mark) return;
  mark.addEventListener('click', () => {
    const cn = mark.classList.toggle('is-cn');
    mark.setAttribute('aria-label', cn ? '当前名字胡勃阳，点击切换为 Belate' : '当前名字 Belate，点击切换为胡勃阳');
  });
}
initWordmarkFlip();

// 页尾 Belate：只在滚到页面最底部、页尾出现时按关于页标题的节拍直接打出（无 be→be 回删）。
// 首页可见页尾是 .album-ending 里的副本，所以按“当前可见的 .site-footer”统一处理。
let footerTypingSync = () => {};
function mountFooterTyping() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const word = 'Belate';
  // 与关于页标题的 Belate 同一节拍，页尾再放慢 1.35×（总时长约 0.66s）。
  const waits = [118, 70, 56, 80, 72, 92].map(wait => Math.round(wait * 1.35));
  let active = null;
  let timer = 0;
  let started = false;
  let ticking = false;
  const visibleName = () => {
    const footer = [...document.querySelectorAll('.site-footer')].find(item => !item.hidden && item.getClientRects().length);
    return footer?.querySelector('.footer-name') ?? null;
  };
  const textOf = name => name?.querySelector('.footer-name-text') ?? null;
  const reset = name => {
    clearTimeout(timer);
    started = false;
    active = name;
    const text = textOf(name);
    if (text) text.textContent = '';
    name.classList.remove('is-typing', 'is-done');
  };
  const finish = name => {
    clearTimeout(timer);
    started = true;
    const text = textOf(name);
    if (text) text.textContent = word;
    name.classList.remove('is-typing');
    name.classList.add('is-done');
  };
  const start = name => {
    const text = textOf(name);
    if (!text || started) return;
    started = true;
    clearTimeout(timer);
    text.textContent = '';
    name.classList.remove('is-done');
    name.classList.add('is-typing');
    let index = 0;
    const step = () => {
      if (index >= word.length) { name.classList.replace('is-typing', 'is-done'); return; }
      text.textContent += word[index];
      timer = setTimeout(step, waits[index] ?? 80);
      index += 1;
    };
    step();
  };
  const atBottom = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 24;
  const maybeStart = () => {
    if (reduced.matches) return;
    const name = visibleName();
    if (!name) return;
    if (name !== active) reset(name);
    if (!atBottom()) return;
    const box = name.getBoundingClientRect();
    if (box.top < innerHeight && box.bottom > 0) start(name);
  };
  footerTypingSync = () => {
    if (reduced.matches) return;
    const name = visibleName();
    if (!name) return;
    reset(name);
    requestAnimationFrame(maybeStart);
  };
  addEventListener('scroll', () => {
    if (started || ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; maybeStart(); });
  }, { passive: true });
  addEventListener('resize', maybeStart);
  addEventListener('load', maybeStart);
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    const name = visibleName();
    if (name) finish(name);
  });
}
mountFooterTyping();

// 悬浮滚动条：滚动即显、闲置缓隐；指针贴近右缘时常驻显形。进度条长度=视口/全文，位置=滚动进度。
const pageBar = $('.page-scrollbar');
const pageBarThumb = pageBar.firstElementChild;
let pageBarHide = 0;
let pageBarNear = false;
let pageBarContent = 0;
function refreshPageBar() {
  const track = innerHeight;
  // scrollHeight 读取会强制布局，滚动事件里逐帧读太贵——缓存之，内容高度变了才作废重算。
  const content = pageBarContent || (pageBarContent = document.documentElement.scrollHeight);
  if (content <= track + 2) { pageBar.hidden = true; return; }
  pageBar.hidden = false;
  const thumb = Math.max(36, track * track / content);
  pageBarThumb.style.setProperty('--bar-h', `${thumb}px`);
  pageBarThumb.style.setProperty('--bar-y', `${scrollY / (content - track) * (track - thumb)}px`);
}
let pageBarDragging = false;
let pageBarDragY = 0;
let pageBarDragScroll = 0;
function flashPageBar() {
  refreshPageBar();
  pageBar.classList.add('is-on');
  clearTimeout(pageBarHide);
  if (!pageBarNear && !pageBarDragging) pageBarHide = setTimeout(() => pageBar.classList.remove('is-on'), 900);
}
function pageBarMetrics() {
  const track = innerHeight;
  const content = pageBarContent || (pageBarContent = document.documentElement.scrollHeight);
  const thumb = Math.max(36, track * track / content);
  return { content, track, thumb, maxScroll: Math.max(0, content - track), travel: Math.max(1, track - thumb) };
}
function pageBarScrollTo(value) {
  const { maxScroll } = pageBarMetrics();
  scrollTo(0, Math.max(0, Math.min(value, maxScroll)));
}
function startPageBarDrag(event, centerThumb) {
  if (pageBarDragging || event.button !== 0 || event.pointerType !== 'mouse' || pageBar.hidden) return;
  const metrics = pageBarMetrics();
  let start = scrollY;
  if (centerThumb) {
    const thumbHeight = pageBarThumb.getBoundingClientRect().height;
    const y = Math.max(0, Math.min(event.clientY - thumbHeight / 2, metrics.travel));
    start = y / metrics.travel * metrics.maxScroll;
    scrollTo(0, start);
  }
  pageBarDragging = true;
  pageBarDragY = event.clientY;
  pageBarDragScroll = start;
  clearTimeout(pageBarHide);
  pageBar.classList.add('is-on', 'is-dragging');
  document.body.classList.add('is-bar-dragging');
  try { pageBar.setPointerCapture(event.pointerId); } catch {}
  event.preventDefault();
}
function endPageBarDrag(event) {
  if (!pageBarDragging) return;
  pageBarDragging = false;
  pageBar.classList.remove('is-dragging');
  document.body.classList.remove('is-bar-dragging');
  try { pageBar.releasePointerCapture(event.pointerId); } catch {}
  pageBarNear = event.clientX > innerWidth - 56;
  if (pageBarNear) flashPageBar();
  else pageBarHide = setTimeout(() => pageBar.classList.remove('is-on'), 450);
}
pageBar.addEventListener('pointerdown', event => startPageBarDrag(event, !event.target.closest('i')));
pageBar.addEventListener('pointermove', event => {
  if (!pageBarDragging) return;
  const { maxScroll, travel } = pageBarMetrics();
  pageBarScrollTo(pageBarDragScroll + (event.clientY - pageBarDragY) * maxScroll / travel);
});
pageBar.addEventListener('pointerup', endPageBarDrag);
pageBar.addEventListener('pointercancel', endPageBarDrag);
addEventListener('scroll', flashPageBar, { passive: true });
addEventListener('resize', () => { pageBarContent = 0; flashPageBar(); });
addEventListener('load', () => { pageBarContent = 0; }, true);
// 影集筛选等模块会改变页面高度：通知滚动条重算长度。
document.addEventListener('belate:layout', () => { pageBarContent = 0; flashPageBar(); });
addEventListener('mousemove', event => {
  if (pageBarDragging) return;
  const near = event.clientX > innerWidth - 56;
  if (near === pageBarNear) return;
  pageBarNear = near;
  clearTimeout(pageBarHide);
  if (near) flashPageBar();
  else pageBarHide = setTimeout(() => pageBar.classList.remove('is-on'), 450);
}, { passive: true });
refreshPageBar();
const initialRoute = readRoute(location.href);
if (initialRoute.type === 'home' && initialRoute.section) {
  const homeURL = new URL(location.href);
  homeURL.searchParams.delete('project');
  homeURL.hash = '/';
  history.replaceState({ ...history.state, scrollY: 0 }, '', homeURL);
  delete initialRoute.section;
}
renderRoute(initialRoute, { initial: true, restore: initialRoute.type === 'journal', targetY: history.state?.scrollY });
