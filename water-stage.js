import { projectShowcase, mountShowcases } from './project-showcases.js';
import { mountHeroDepth } from './hero-depth.js';

/** Photography and interactive HTML share one scroll-driven frame. */
const imageRecords = new Map();
function imageRecord(source) {
  if (imageRecords.has(source)) return imageRecords.get(source);
  const image = new Image();
  const ready = new Promise(resolve => {
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
  });
  const record = { image, ready };
  imageRecords.set(source, record); image.src = source;
  return record;
}
export function preloadImages(sources) { return Promise.all(sources.map(source => imageRecord(source).ready)); }
const smooth = (a, b, value) => { const t = Math.max(0, Math.min(1, (value - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

export function mountWaterStage(element, { photo, index = 0, onSwipe, onReady, onFrame } = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const names = ['photography', 'freechat', 'codex-continue', 'wzti'];
  let disposed = false, visible = true, frame = 0, last = 0;
  let current = Math.max(0, Math.min(3, index)), blend = 1;
  let startOpacity = names.map((_, i) => i === current ? 1 : 0);
  let progress = 0, targetProgress = 0, progressSet = false, width = 1, height = 1, down = null;
  let compactAt = 1;
  const compactProgress = value => Math.min(1, value / compactAt);
  const removers = [];
  const preview = document.createElement('div'); preview.className = 'stage-projects';
  const photoRecord = imageRecord(photo);
  const picture = photoRecord.image;
  picture.className = 'stage-project-image'; picture.alt = ''; picture.draggable = false;
  const photography = document.createElement('div');
  photography.className = 'stage-photography'; photography.dataset.stageScene = 'photography';
  photography.append(picture);
  const heroDepth = mountHeroDepth(photography);
  const layers = [photography, ...names.slice(1).map(id => {
    const panel = document.createElement('section');
    panel.className = 'stage-project-panel'; panel.dataset.showcase = id; panel.dataset.stageScene = id;
    panel.setAttribute('aria-label', `${id} 项目与功能展示`);
    panel.innerHTML = projectShowcase(id); return panel;
  })];
  preview.append(...layers); element.replaceChildren(preview);
  const showcases = mountShowcases(element);
  element.dataset.waterRenderer = 'html';
  const listen = (object, type, handler, options) => {
    object.addEventListener(type, handler, options); removers.push(() => object.removeEventListener(type, handler, options));
  };
  function draw() {
    if (disposed) return;
    const portrait = width / height < .8, wide = width / height > 2, shortLandscape = height < 650 && width > height;
    const compact = compactProgress(progress);
    const handoff = compactAt < 1 ? Math.max(0, (targetProgress - compactAt) / (1 - compactAt)) : 0;
    const phase = smooth(0, 1, compact);
    const inset = height * (portrait ? .016 : .052);
    const compactHeight = shortLandscape ? height - 160 : portrait ? Math.max(260, height - (height < 740 ? 232 : 274)) : height * (wide ? .5 : .62) - inset;
    const centerX = mix(width / 2, width * (portrait || shortLandscape ? .5 : .68), phase);
    const centerY = mix(height / 2, shortLandscape ? 74 + compactHeight / 2 : portrait ? height - (height < 740 ? 148 : 164) - compactHeight / 2 : height * (wide ? .455 : .5), phase);
    const boxWidth = mix(width, width * (shortLandscape ? .92 : portrait ? .91 : .55) - inset, phase);
    const boxHeight = mix(height, compactHeight, phase);
    const cornerRadius = Math.min(10, Math.min(boxWidth, boxHeight) * .04) * (1 - (1 - phase) ** 2);
    Object.assign(preview.style, {
      left: `${centerX - boxWidth / 2}px`,
      top: `${centerY - boxHeight / 2}px`,
      width: `${boxWidth}px`,
      height: `${boxHeight}px`,
      borderRadius: `${cornerRadius}px`,
    });
    preview.style.setProperty('--exhibit-open', String(1 - smooth(.12, .85, compact)));
    preview.dataset.compact = String(compact > .55);
    const imageWidth = picture.naturalWidth || boxWidth, imageHeight = picture.naturalHeight || boxHeight;
    const scale = mix(Math.max(boxWidth / imageWidth, boxHeight / imageHeight), Math.min(boxWidth / imageWidth, boxHeight / imageHeight), phase);
    // Give the visible photo its own rounded edge while keeping the same centered crop.
    const photoWidth = Math.min(boxWidth, imageWidth * scale);
    const photoHeight = Math.min(boxHeight, imageHeight * scale);
    const photoRadius = Math.min(cornerRadius, Math.min(photoWidth, photoHeight) * .05);
    const focal = portrait ? mix(.565, .5, phase) : .5;
    Object.assign(picture.style, {
      width: `${photoWidth}px`,
      height: `${photoHeight}px`,
      left: `${(boxWidth - photoWidth) / 2}px`,
      top: `${(boxHeight - photoHeight) / 2}px`,
      borderRadius: `${photoRadius}px`,
      objectPosition: `${focal * 100}% center`,
    });
    const fullPhoto = current === 0 && blend === 1 && targetProgress === 0 && progress === 0;
    element.classList.toggle('is-full-photo', fullPhoto);
    if (fullPhoto) heroDepth.fit(boxWidth, boxHeight, focal);
    heroDepth.setActive(fullPhoto && visible && !document.hidden && !reduced.matches);
    const blendProgress = smooth(0, 1, blend);
    let cumulative = 0;
    layers.forEach((layer, i) => {
      const weight = mix(startOpacity[i], i === current ? 1 : 0, blendProgress);
      cumulative += weight;
      layer.style.opacity = String(cumulative ? weight / cumulative : 0);
      layer.style.visibility = weight > .0001 ? 'visible' : 'hidden';
      layer.style.pointerEvents = i === current ? 'auto' : 'none';
    });
    onFrame?.(compact, mix(startOpacity[0], current === 0 ? 1 : 0, blendProgress), handoff);
  }
  function active() {
    layers.forEach((layer, i) => { layer.inert = i !== current; layer.setAttribute('aria-hidden', String(i !== current)); });
    showcases.setActive(current ? names[current] : null);
  }
  function tick(time) {
    frame = 0;
    if (disposed || !visible || document.hidden || reduced.matches) return;
    const dt = last ? Math.min((time - last) / 1000, .05) : .016; last = time;
    progress += (targetProgress - progress) * (1 - Math.exp(-dt * 11));
    if (Math.abs(targetProgress - progress) < .0001) progress = targetProgress;
    blend = Math.min(1, blend + dt * 2.2); draw();
    if (progress !== targetProgress || blend < 1) frame = requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (disposed) return;
    if (!visible || document.hidden) { heroDepth.setActive(false); return; }
    draw();
    if (!reduced.matches && (progress !== targetProgress || blend < 1)) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = Math.max(1, element.clientWidth); height = Math.max(1, element.clientHeight); draw();
  }
  listen(element, 'pointerdown', event => {
    if (!event.isPrimary || event.button > 0 || event.target.closest('button,a,input,textarea,select,label,[contenteditable]')) return;
    // 桌面全幅照片态不抢拖拽；手机没有 hover，左右滑换场景要能直接用。
    if (current === 0 && targetProgress === 0 && event.pointerType !== 'touch') return;
    down = { x: event.clientX, y: event.clientY, id: event.pointerId };
    element.style.cursor = 'grabbing'; element.setPointerCapture?.(event.pointerId);
  });
  // The header, intro and project tabs sit above the photo and share its mouse coordinates.
  listen(window, 'pointermove', event => {
    if (event.pointerType !== 'mouse' || heroDepth.usesTilt || !heroDepth.active) return;
    const { left, top, width, height, right, bottom } = element.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    if (x < left || x > right || y < top || y > bottom) heroDepth.point(0, 0);
    else heroDepth.point((x - left) / width * 2 - 1, (y - top) / height * 2 - 1);
  }, { passive: true, capture: true });
  listen(document.documentElement, 'pointerleave', event => {
    if (event.pointerType === 'mouse' && !heroDepth.usesTilt && !event.relatedTarget) heroDepth.point(0, 0);
  });
  listen(window, 'blur', () => { if (!heroDepth.usesTilt) heroDepth.point(0, 0); });
  function end(event) {
    if (!down || event.pointerId !== down.id) return;
    const dx = event.clientX - down.x, dy = event.clientY - down.y;
    down = null; element.style.cursor = '';
    if (event.type === 'pointerup' && Math.abs(dx) > Math.max(35, width * .08) && Math.abs(dx) > Math.abs(dy) * 1.3) onSwipe?.(dx < 0 ? 1 : -1);
  }
  listen(element, 'pointerup', end); listen(element, 'pointercancel', end);
  listen(element, 'lostpointercapture', end);
  listen(document, 'visibilitychange', resume);
  listen(reduced, 'change', () => { if (reduced.matches) { progress = targetProgress; blend = 1; } resume(); });
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); }, { rootMargin: '80px' });
  const resizer = new ResizeObserver(resize); observer.observe(element); resizer.observe(element); active(); resize();
  photoRecord.ready.then(() => { if (!disposed) { element.dataset.waterReady = 'true'; draw(); onReady?.(true); } });
  return {
    setProgress(value, compactPoint = 1) {
      if (disposed || !Number.isFinite(value)) return;
      compactAt = compactPoint;
      targetProgress = Math.max(0, Math.min(1, value));
      if (!progressSet || reduced.matches) progress = targetProgress;
      progressSet = true; element.dataset.waterProgress = compactProgress(targetProgress).toFixed(3); resume();
    },
    setIndex(value) {
      if (disposed || !Number.isFinite(value)) return;
      const next = ((Math.trunc(value) % names.length) + names.length) % names.length;
      if (next === current) return;
      startOpacity = startOpacity.map((opacity, i) => mix(opacity, i === current ? 1 : 0, smooth(0, 1, blend)));
      current = next; blend = reduced.matches ? 1 : 0; active(); resume();
    },
    dispose() {
      if (disposed) return; disposed = true; cancelAnimationFrame(frame);
      heroDepth.dispose(); showcases.dispose(); observer.disconnect(); resizer.disconnect(); removers.forEach(remove => remove());
      element.replaceChildren(); element.style.cursor = '';
      element.classList.remove('is-full-photo');
      delete element.dataset.waterReady; delete element.dataset.waterRenderer; delete element.dataset.waterProgress;
    },
  };
}
