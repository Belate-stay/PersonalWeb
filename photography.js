import { photos } from './photos.js';
import { animate, stagger } from './vendor/motion.js';
import { animateSpring } from './motion.js';
import { createPhotoPainter, movePhoto, photoFrame, showPhotoDialog } from './photo-motion.js';
import { icon } from './icons.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const localFile = () => location.protocol === 'file:';
const original = photo => `./Photograph/${encodeURIComponent(photo.file)}`;
const preview = photo => `./PhotoPreviews/${encodeURIComponent(photo.title)}.webp`;
export const photoDetailHref = photo => `#/photography/${encodeURIComponent(photo.title)}`;
const size = photo => `${(photo.bytes / 1e6).toFixed(2)} MB`;
const place = value => value.split(/\s*·\s*/).map(escape).join(' <span class="photo-place-dot" aria-hidden="true">·</span> ');

// 照片故事按标题对应；没有文案的照片保持为空（详情页留白）。文案保留原始换行。
const stories = new Map([
  ['昏夕（1）', `日落昏黄皆秋色，到点该走了。
暑假即将结束，我就要踏上高中的旅程。与最好的朋友再出来一聚，原来已经到太阳落山的点了，确实该走了。`],
  ['斑斓', `初次巡逛大学校园，教学楼边的湖，在阳光的照耀下呈现了五彩斑斓的色彩，不拍一张对不起眼前美景。`],
  ['渐行', `车灯惶惶，行人匆匆。
这段时间的郑州东站配上维多利亚港的《来自天堂的魔鬼》BJM在网上十分火爆，我也是和朋友一起来看美女姐姐。`],
  ['皎月', `春花秋月何时了，往事知多少。`],
  ['里程', `你站的方位，跟我中间隔着泪，街景一直在后退，你的崩溃在窗外零碎~`],
  ['轻息', `乡下的空气不错，云都轻飘飘的呢。`],
  ['国旗', `回初中看看，正好在升旗。`],
  ['原野', `昆虫视角，贴近自然嗅花草树木，绿的恰到好处。`],
  ['放野', `草坪上，小狗在嬉戏，全身上下都宣示着“自由”。`],
  ['栀子', `听说栀子花开花全屋都香？
听说栀子花在北方很难养？
听说栀子花象征永恒的爱？
嗯，确实很香，确实难养。
永恒的爱...我还没感受到。`],
  ['繁雪（1）', `高中的路灯下，我们踏雪并行，很激动，笑得很开心。
第二天放寒假，据说班主任这时已经提前跑路回老家了，所以手机大胆拿出来！`],
  ['繁雪（2）', `与《繁雪（1）》同时拍得，满眼都是当时的回忆。`],
  ['荷珠', `听说拍荷叶特别能体现出一个人的摄影水平？`],
  ['块云', `第一次坐飞机运气不错，挨着窗户。
看见好了多好多棉花糖，应该是软软的，像捏一片尝一尝。`],
  ['沉瑟', `I like this color.
The green but without vivid.`],
  ['工人', `试试我的2亿像素解析力？
共产党万岁！`],
  ['牌匾', `I like this color.
It's very atmospheric.`],
  ['剪影', `拥抱大海，人群中，我一眼就找到了你。`],
  ['珠黄（1）', `或许这叫剪影？
不，这是珠黄，虽然我是色弱...
这是我的妈妈。`],
  ['边山', `他说这山叫“Shan山”`],
  ['皑雪', `学行西路，我猜你没去过。
两年后的雪，多了些孤独。`],
  ['日出（1）', `早晨五点钟，我的上下眼皮在打架，直到看见太阳这一刻——`],
  ['梦境', `文艺复兴了，学长学姐的艺术创作。
嗯，我的摄影也是艺术创作。`],
  ['劳动', `劳动是因为劳动节，钟是学校的钟。
这天在开家长会，心情有点好。`],
  ['惬意', `美好的大学时光，或许我也将收获爱情。
谁说不是呢？`],
]);
const groups = [
  { id: 'cinema', label: '电影宽幅', matches: ratio => ratio > 2.1 },
  { id: 'wide', label: '16:9 宽幅', matches: ratio => ratio >= 1.52 && ratio <= 2.1 },
  { id: 'landscape', label: '4:3 横幅', matches: ratio => ratio >= 1 && ratio < 1.52 },
  { id: 'portrait', label: '竖幅', matches: ratio => ratio < 1 },
].map(group => ({ ...group, items: photos.filter(photo => group.matches(photo.width / photo.height)) }))
  .filter(group => group.items.length);

// 第二根浏览轴：地点 / 机型 / 年份。取值与计数直接从照片元数据算，筛选只隐藏瓦片，不重排 DOM。
const photoFacets = [
  { key: 'place', label: '地点', read: photo => photo.place },
  { key: 'device', label: '机型', read: photo => photo.device },
  { key: 'year', label: '年份', read: photo => photo.capturedAt.slice(0, 4) },
].map(facet => {
  const counts = new Map();
  for (const photo of photos) counts.set(facet.read(photo), (counts.get(facet.read(photo)) ?? 0) + 1);
  return { ...facet, values: [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh')) };
});

function photoImage(photo, loading = 'lazy', src = original(photo)) {
  const source = loading === 'deferred' ? `data-album-source="${src}"` : `src="${src}" loading="${loading}"`;
  return `<img ${source} width="${photo.width}" height="${photo.height}" alt="${escape(photo.title)}" decoding="async" draggable="false">`;
}

const selectPhotos = titles => titles.map(title => photos.find(photo => photo.title === title)).filter(Boolean);
const landscapePhotos = selectPhotos(['牌匾', '边山', '映晕', '皑雪']);
const portraitPhotos = selectPhotos(['曙光', '栀子', '瓶', '碎云']);
const portraitAlbum = () => matchMedia('(max-width: 760px) and (orientation: portrait)');
const wrapAlbumIndex = (index, length) => (index % length + length) % length;
const albumNumber = number => String(number).padStart(2, '0');

function albumSlides(items, current = 0) {
  return items.map((photo, index) => {
    const state = index === current ? 'aria-current="true"' : 'inert';
    // 影集轮播用 PhotoPreviews（1440 宽）的预览图（原图留给照片详情/放大），首屏从 ~22MB 降到 ~0.7MB。
    return `<div class="album-slide" ${state} style="--album-offset:${index - current}">${photoImage(photo, 'deferred', preview(photo))}</div>`;
  }).join('');
}

export function homeAlbumView() {
  const portrait = portraitAlbum().matches;
  const items = portrait ? portraitPhotos : landscapePhotos;
  const arrow = icon('arrow-left', { size: 18 });
  const disabled = items.length < 2 ? ' disabled' : '';
  return `<section id="about-home" class="life-desk" data-album-format="${portrait ? 'portrait' : 'wide'}" aria-labelledby="home-album-title">
    <div class="home-album-stage">
      <div class="life-gallery" role="group" aria-roledescription="轮播" aria-label="影集精选">${albumSlides(items)}</div>
      <div class="home-album-layout wrap">
        <header class="home-album-intro">
          <h2 id="home-album-title">影集<span>留住路上的光。</span></h2>
          <p>抬头时的云，路过时的树影。<br>把想记住的画面，收进一册。</p>
          <a class="uiv-mayfly album-entry" href="#/photography"><span class="uiv-mayfly-circle" aria-hidden="true"><span class="uiv-mayfly-arrow"></span></span><span class="uiv-mayfly-text">浏览完整影集</span></a>
        </header>
      </div>
      <div class="home-album-footer frosted-glass" role="group" aria-label="照片切换">
        <div class="album-label">
          <div class="album-dots" aria-hidden="true">${items.map((_, index) => `<span${index === 0 ? ' aria-current="true"' : ''}></span>`).join('')}</div>
          <p class="album-caption" aria-live="polite" aria-atomic="true">
            <span data-album-caption>${escape(items[0]?.title ?? '')}</span>
            <span class="album-count" aria-hidden="true"><span data-album-index>01</span> / <span data-album-total>${albumNumber(items.length)}</span></span>
          </p>
        </div>
        <div class="album-controls">
          <button type="button" class="album-arrow" data-album-step="-1" aria-label="上一张"${disabled}>${arrow}</button>
          <button type="button" class="album-arrow" data-album-step="1" aria-label="下一张"${disabled}>${arrow}${icon('chevron-right', { size: 29 })}</button>
        </div>
      </div>
    </div>
    <footer class="site-footer album-ending"></footer>
  </section>`;
}

export function mountHomeAlbum(section) {
  const controller = new AbortController();
  const { signal } = controller;
  const gallery = section.querySelector('.life-gallery');
  const stage = gallery.parentElement;
  const portrait = portraitAlbum();
  let items = section.dataset.albumFormat === 'portrait' ? portraitPhotos : landscapePhotos;
  let slides = [...gallery.querySelectorAll('.album-slide')];
  const caption = section.querySelector('[data-album-caption]');
  const number = section.querySelector('[data-album-index]');
  const total = section.querySelector('[data-album-total]');
  const dots = section.querySelector('.album-dots');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let near = false;
  function loadPhotos() {
    for (const image of gallery.querySelectorAll('[data-album-source]')) {
      image.src = image.dataset.albumSource;
      delete image.dataset.albumSource;
    }
  }
  const nearby = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    near = true;
    loadPhotos();
    nearby.disconnect();
  }, { rootMargin: '650px 0px' });
  nearby.observe(gallery);
  let current = Math.max(0, slides.findIndex(slide => slide.getAttribute('aria-current') === 'true'));
  let position = current;
  let motion;
  let captionMotion;
  let drag = null;
  let inView = false;
  let autoplay;

  const indexOf = value => wrapAlbumIndex(value, items.length);

  const canAutoplay = () => inView && !document.hidden && !reduced.matches && !drag &&
    slides.length > 1 && !stage.querySelector(':focus-visible');

  function scheduleAutoplay() {
    clearTimeout(autoplay);
    if (!canAutoplay()) return;
    autoplay = setTimeout(() => {
      if (!canAutoplay()) return;
      const image = slides[indexOf(current + 1)].firstElementChild;
      if (image.complete && image.naturalWidth) show(1, true);
      else scheduleAutoplay();
    }, 3000);
  }

  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.intersectionRatio >= .2;
    scheduleAutoplay();
  }, { threshold: .2 });
  visibility.observe(gallery);
  document.addEventListener('visibilitychange', scheduleAutoplay, { signal });
  stage.addEventListener('focusin', scheduleAutoplay, { signal });
  stage.addEventListener('focusout', () => queueMicrotask(() => {
    if (!signal.aborted) scheduleAutoplay();
  }), { signal });

  function updateCaption(index) {
    caption.textContent = items[index]?.title ?? '';
    number.textContent = albumNumber(index + 1);
    dots.querySelector('[aria-current]')?.removeAttribute('aria-current');
    dots.children[index]?.setAttribute('aria-current', 'true');
  }

  function paint(value) {
    position = value;
    const half = items.length / 2;
    slides.forEach((slide, i) => slide.style.setProperty('--album-offset', indexOf(i - value + half) - half));
  }
  paint(current);

  function settle() {
    motion?.stop();
    if (reduced.matches || Math.abs(position - current) < .0002) {
      paint(current);
      return;
    }
    motion = animateSpring(position, paint, paint, { stiffness: 235, damping: 30 });
    motion.to(current);
  }

  function show(step, automatic = false) {
    if (items.length < 2) return;
    const leaving = slides[indexOf(current)];
    current += step;
    const index = indexOf(current);
    const incoming = slides[index];
    leaving.inert = true;
    leaving.removeAttribute('aria-current');
    incoming.inert = false;
    incoming.setAttribute('aria-current', 'true');
    caption.parentElement.setAttribute('aria-live', automatic ? 'off' : 'polite');
    updateCaption(index);
    captionMotion?.cancel();
    if (!reduced.matches) {
      captionMotion = caption.animate([{ opacity: .4, translate: `${step * 8}px 0` }, { opacity: 1, translate: '0 0' }],
        { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    settle();
    scheduleAutoplay();
  }

  section.addEventListener('click', event => {
    const arrow = event.target.closest('[data-album-step]');
    if (arrow) show(Number(arrow.dataset.albumStep));
  }, { signal });
  section.addEventListener('keydown', event => {
    if (slides.length < 2 || !event.target.closest('[data-album-step]')) return;
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step || event.repeat) return;
    event.preventDefault();
    show(step);
  }, { signal });

  gallery.addEventListener('pointerdown', event => {
    if (slides.length < 2 || !event.isPrimary || event.button !== 0 || !event.target.closest('.album-slide[aria-current=true]')) return;
    drag = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      dx: 0, time: event.timeStamp, velocity: 0,
      width: gallery.clientWidth,
    };
    scheduleAutoplay();
  }, { signal });
  window.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId || (event.pointerType === 'mouse' && !event.buttons)) return;
    const dx = event.clientX - drag.x;
    if (!gallery.hasAttribute('data-dragging')) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(event.clientY - drag.y) * 1.2) return;
      motion?.stop();
      drag.origin = position;
      gallery.setPointerCapture(event.pointerId);
    }
    drag.velocity = (dx - drag.dx) / Math.max(1, event.timeStamp - drag.time);
    drag.dx = dx;
    drag.time = event.timeStamp;
    gallery.dataset.dragging = dx < 0 ? 'next' : 'previous';
    if (!reduced.matches) paint(drag.origin - Math.max(-.95, Math.min(.95, dx / drag.width)));
  }, { signal });
  function endDrag(event) {
    // A touch transfers implicit capture from the photo to the gallery as dragging starts.
    if (event.type === 'lostpointercapture' && event.target !== gallery) return;
    if (!drag || drag.id !== event.pointerId) return;
    const { x, y, width, time, velocity } = drag;
    drag = null;
    if (!gallery.hasAttribute('data-dragging')) { scheduleAutoplay(); return; }
    delete gallery.dataset.dragging;
    const dx = event.clientX - x;
    const distance = Math.abs(dx);
    const horizontal = distance > Math.abs(event.clientY - y) * 1.2;
    const flick = distance > 22 && event.timeStamp - time < 90 && Math.sign(dx) * velocity > .55;
    if (event.type === 'pointerup' && horizontal && (flick || distance >= Math.min(62, width * .17))) show(dx < 0 ? 1 : -1);
    else { settle(); scheduleAutoplay(); }
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    window.addEventListener(type, endDrag, { signal });
  }
  reduced.addEventListener('change', () => {
    if (reduced.matches) captionMotion?.cancel();
    settle();
    scheduleAutoplay();
  }, { signal });
  portrait.addEventListener('change', () => {
    const index = indexOf(current);
    motion?.stop();
    captionMotion?.cancel();
    if (drag && gallery.hasPointerCapture(drag.id)) gallery.releasePointerCapture(drag.id);
    drag = null;
    delete gallery.dataset.dragging;
    items = portrait.matches ? portraitPhotos : landscapePhotos;
    current = Math.min(index, items.length - 1);
    section.dataset.albumFormat = portrait.matches ? 'portrait' : 'wide';
    gallery.innerHTML = albumSlides(items, current);
    slides = [...gallery.querySelectorAll('.album-slide')];
    if (dots.childElementCount !== items.length) dots.replaceChildren(...items.map(() => document.createElement('span')));
    updateCaption(current);
    total.textContent = albumNumber(items.length);
    paint(current);
    if (near) loadPhotos();
    scheduleAutoplay();
  }, { signal });
  return () => {
    controller.abort();
    nearby.disconnect();
    visibility.disconnect();
    clearTimeout(autoplay);
    motion?.stop();
    captionMotion?.cancel();
    if (drag && gallery.hasPointerCapture(drag.id)) gallery.releasePointerCapture(drag.id);
    delete gallery.dataset.dragging;
  };
}

function originalLink(photo) {
  const href = localFile() ? `http://127.0.0.1:4173/Photograph/${encodeURIComponent(photo.file)}?download` : original(photo);
  const local = localFile() ? ' target="_blank" rel="noopener" title="下载需启动本地预览"' : '';
  return `<a class="photo-download" href="${href}" download="${escape(photo.file)}"${local}>下载原图 ↓</a>`;
}

// 瓦片 hover 小注：拍摄地 · 机型；缺项只留有的，图片左下角浮出，不占版面。
const tileMeta = photo => {
  const parts = [photo.place, photo.device].filter(Boolean);
  return parts.length ? `<span class="photo-tile-meta" aria-hidden="true">${parts.map(escape).join(' | ')}</span>` : '';
};

export function galleryView() {
  return `<article class="photography-page wrap">
    <header class="photography-header"><h1>摄影集</h1><p class="photography-count">共 <span>${photos.length}</span> 幅</p></header>
    <nav class="photo-format-nav" aria-label="按画幅浏览">${groups.map((group, index) =>
      `<a href="#${group.id}" data-section="${group.id}"${index === 0 ? ' aria-current="location"' : ''}>${group.label}</a>`).join('')}<button type="button" class="photo-filter-toggle" data-photo-filter-toggle aria-expanded="false" aria-controls="photo-filters" aria-label="展开筛选" title="展开筛选"></button></nav>
    <section class="photo-filters" id="photo-filters" data-open="false" aria-label="按地点、机型与年份筛选照片">
      <div class="photo-filters-clip">
        <div class="photo-filters-body">
          ${photoFacets.map(facet => `<div class="photo-filter-row">
            <span class="photo-filter-label">${facet.label}</span>
            <div class="photo-filter-chips" role="group" aria-label="按${facet.label}筛选">${facet.values.map(([value, count]) =>
              `<button type="button" class="photo-chip" data-photo-facet="${facet.key}" data-value="${escape(value)}" aria-pressed="false">${escape(value)}<span class="photo-chip-count" aria-hidden="true">${count}</span></button>`).join('')}</div>
          </div>`).join('')}
          <div class="photo-filter-status" hidden><span class="photo-filter-count" role="status"></span><button type="button" class="photo-filter-clear" data-photo-clear hidden>清除筛选</button></div>
        </div>
      </div>
    </section>
    ${groups.map(group => `<section class="photo-group photo-group--${group.id}" id="${group.id}" aria-labelledby="${group.id}-title">
      <h2 id="${group.id}-title">${group.label}</h2>
      <div class="photo-grid">${group.items.map(photo => `<a class="photo-tile" href="${photoDetailHref(photo)}" data-place="${escape(photo.place)}" data-device="${escape(photo.device)}" data-year="${photo.capturedAt.slice(0, 4)}">
        <figure><div class="photo-tile-frame" style="--photo-ratio:${photo.width / photo.height}">${photoImage(photo, 'lazy', preview(photo))}${tileMeta(photo)}</div><figcaption>${escape(photo.title)}</figcaption></figure>
      </a>`).join('')}</div>
    </section>`).join('')}
  </article>`;
}

export function photoView(title) {
  const photo = photos.find(item => item.title === title);
  const story = stories.get(title);
  const details = [
    [
      ['文件名称', photo.file],
      ['文件大小', size(photo)],
      ['拍摄设备', photo.device],
      ['拍摄地点', photo.place, 'place'],
      ['拍摄时间', photo.capturedAt, 'time']
    ],
    [
      ['分辨率', `${photo.width} × ${photo.height}`],
      ['快门', photo.shutter],
      ['光圈', photo.aperture],
      ['ISO', photo.iso],
      ['焦距', photo.focalLength]
    ]
  ];
  // 排版按画幅分形：电影/16:9 图上信息下；4:3 横幅图居左上、右侧名字与按钮、信息在下；竖幅图居左、右侧名字信息按钮。
  const shape = groups.find(group => group.matches(photo.width / photo.height))?.id ?? 'wide';
  const metadata = `<section class="photo-metadata" aria-label="照片信息">
      ${details.map(row => `<dl class="photo-metadata-row">${row.filter(([, value]) => value).map(([label, value, kind]) => `
        <div${kind === 'time' ? ' class="photo-metadata-time"' : ''}><dt>${label}</dt><dd>${kind === 'place' ? place(value) : escape(value)}</dd></div>`
      ).join('')}</dl>`).join('')}
    </section>`;
  const actions = `<div class="photo-detail-actions"><button type="button" data-photo-zoom data-original-src="${original(photo)}">放大查看</button>${originalLink(photo)}</div>`;
  return `<article class="photography-page photo-detail photo-detail--${shape} wrap">
    <div class="photo-detail-top"><a href="#/photography" class="photo-back">← 返回摄影集</a></div>
    <figure class="photo-original photo-original--${shape}" style="--photo-ratio:${photo.width / photo.height}">
      <button class="photo-original-button" type="button" data-photo-zoom data-original-src="${original(photo)}" aria-label="放大查看 ${escape(title)}">
        <span class="photo-original-frame" style="--photo-ratio:${photo.width / photo.height}; --photo-width:${photo.width}px; background-image:url(&quot;${preview(photo)}&quot;)">${photoImage(photo, 'eager', preview(photo))}</span>
      </button>
      <figcaption>
        <h1>${escape(title)}</h1>
        ${shape === 'portrait' ? metadata : ''}
        ${actions}
      </figcaption>
      ${localFile() ? '<p class="photo-download-note">下载原图需启动本地预览，双击同目录的「打开 Belate.cmd」即可。</p>' : ''}
    </figure>
    ${shape === 'portrait' ? '' : metadata}
    <section class="photo-story" ${story ? 'aria-label="照片故事"' : 'aria-hidden="true"'}>${story ? `<p>${escape(story)}</p>` : ''}</section>
    <dialog class="photo-viewer" aria-label="查看 ${escape(title)} 原图">
      <div class="photo-viewer-bar"><span class="photo-viewer-title">${escape(title)}</span><div class="photo-viewer-tools">
        <button type="button" class="photo-viewer-close" data-zoom-close aria-label="关闭大图" autofocus>×</button>
      </div></div>
      <div class="photo-viewer-scroll" tabindex="0" aria-label="大图，双指或滚轮缩放、拖动平移"><div class="photo-viewer-frame"><img width="${photo.width}" height="${photo.height}" alt="${escape(title)}" draggable="false"></div></div>
      <div class="photo-viewer-footer"><div class="photo-viewer-scale"><output aria-label="当前缩放比例"></output><input class="photo-zoom-slider" type="range" min="10" max="400" step="any" aria-label="缩放比例"></div>${originalLink(photo)}</div>
    </dialog>
  </article>`;
}

// 瓦片入场：下滑首次进入视野淡入（轻微上移+逐张微错峰），上滑/反复经过不重播——每张只播一次，无出场。
export function mountTileEntrance(root, reduced, selector = '.photo-tile') {
  if (reduced.matches || typeof IntersectionObserver !== 'function') return () => {};
  const items = [...root.querySelectorAll(selector)];
  for (const item of items) item.style.opacity = '0';
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      entry.target.style.opacity = '';
      animate(entry.target, { opacity: [0, 1], y: [16, 0] }, {
        duration: .55,
        delay: Math.min(order++ * .07, .28),
        ease: [.16, 1, .3, 1],
      });
    }
  }, { threshold: .1 });
  for (const item of items) observer.observe(item);
  return () => observer.disconnect();
}

// 摄影集的第二浏览轴：地点 / 机型 / 年份。三个维度各选一个取交集，只隐藏瓦片与空画幅组，
// 画幅导航里对应的项同步收起，状态行播报剩余张数。
export function mountPhotoFilters(root, reduced) {
  const panel = root.querySelector('.photo-filters');
  if (!panel) return () => {};
  const clip = panel.querySelector('.photo-filters-clip');
  const body = panel.querySelector('.photo-filters-body');
  const toggle = root.querySelector('[data-photo-filter-toggle]');
  const chips = [...panel.querySelectorAll('.photo-chip')];
  const clear = panel.querySelector('[data-photo-clear]');
  const count = panel.querySelector('.photo-filter-count');
  const status = panel.querySelector('.photo-filter-status');
  const tiles = [...root.querySelectorAll('.photo-tile')];
  const groupSections = [...root.querySelectorAll('.photo-group')];
  const formatLinks = [...root.querySelectorAll('.photo-format-nav a')];
  // 影集 DOM 在「照片详情 → 返回」间会被保留复用，重新挂载时从 chip 状态恢复筛选，避免状态与列表打架。
  const active = { place: null, device: null, year: null };
  for (const chip of chips) {
    if (chip.getAttribute('aria-pressed') === 'true') active[chip.dataset.photoFacet] = chip.dataset.value;
  }
  let animations = [];
  let heightAnimation = null;
  // 筛选面板默认折叠：小尖头展开/收起，高度过渡先快后慢；收起后内容不可聚焦。
  function setOpen(next, animateNow) {
    // 先量当前高度再改 data-open，否则 CSS 已切到目标态，动画起止点会一样。
    const from = clip ? clip.getBoundingClientRect().height : 0;
    panel.dataset.open = String(next);
    toggle?.setAttribute('aria-expanded', String(next));
    toggle?.setAttribute('aria-label', next ? '收起筛选' : '展开筛选');
    toggle?.setAttribute('title', next ? '收起筛选' : '展开筛选');
    if (clip) clip.inert = !next;
    if (!clip || !body) return;
    heightAnimation?.stop();
    heightAnimation = null;
    if (animateNow && !reduced.matches) {
      const to = next ? body.getBoundingClientRect().height : 0;
      clip.style.height = `${from}px`;
      void clip.offsetHeight;
      heightAnimation = animate(clip, { height: [`${from}px`, `${to}px`] }, { duration: .52, ease: [.16, 1, .3, 1] });
      heightAnimation.finished.then(() => {
        if (panel.dataset.open !== String(next)) return;
        clip.style.height = '';
        document.dispatchEvent(new Event('belate:layout'));
      }).catch(() => {});
      animate(body, { opacity: next ? [0, 1] : [1, 0] }, { duration: .32, ease: [.16, 1, .3, 1] });
    } else {
      clip.style.height = '';
      body.style.opacity = '';
    }
    document.dispatchEvent(new Event('belate:layout'));
  }
  function apply(animateNow) {
    const shown = [];
    for (const tile of tiles) {
      const visible = (!active.place || tile.dataset.place === active.place)
        && (!active.device || tile.dataset.device === active.device)
        && (!active.year || tile.dataset.year === active.year);
      tile.hidden = !visible;
      if (visible) shown.push(tile);
    }
    let firstOpen = true;
    for (const section of groupSections) {
      const open = shown.some(tile => tile.closest('.photo-group') === section);
      section.hidden = !open;
      section.classList.toggle('is-first', open && firstOpen);
      if (open) firstOpen = false;
      const link = formatLinks.find(link => link.dataset.section === section.id);
      if (link) link.hidden = !open;
    }
    const filtering = Boolean(active.place || active.device || active.year);
    clear.hidden = !filtering;
    // 总数已经在页头「摄影集」右侧显示，筛选区只报当前显示多少幅。
    status.hidden = !filtering;
    count.textContent = filtering
      ? (shown.length ? `显示 ${shown.length} 幅` : '没有符合筛选的照片')
      : '';
    if (animateNow) document.dispatchEvent(new Event('belate:layout'));
    animations.forEach(animation => animation.stop());
    animations = [];
    if (animateNow && !reduced.matches && shown.length) {
      animations.push(animate(shown, { opacity: [0, 1], y: [10, 0] }, { duration: .4, delay: stagger(.015), ease: [.16, 1, .3, 1] }));
    }
  }
  function onClick(event) {
    const chip = event.target.closest('.photo-chip');
    if (chip) {
      const key = chip.dataset.photoFacet;
      const on = chip.getAttribute('aria-pressed') !== 'true';
      active[key] = on ? chip.dataset.value : null;
      for (const other of chips) {
        if (other.dataset.photoFacet === key) other.setAttribute('aria-pressed', String(other === chip && on));
      }
      apply(true);
      return;
    }
    if (!event.target.closest('[data-photo-clear]')) return;
    active.place = active.device = active.year = null;
    chips.forEach(other => other.setAttribute('aria-pressed', 'false'));
    apply(true);
  }
  const onToggle = () => setOpen(panel.dataset.open !== 'true', true);
  panel.addEventListener('click', onClick);
  toggle?.addEventListener('click', onToggle);
  setOpen(panel.dataset.open === 'true', false);
  apply(false);
  return () => {
    panel.removeEventListener('click', onClick);
    toggle?.removeEventListener('click', onToggle);
    heightAnimation?.stop();
    animations.forEach(animation => animation.stop());
  };
}

// 收藏图库等一页多图的页面：共用影集同款放大器，图片/标题/下载由每个触发按钮的数据提供。
export function photoViewerShell() {
  return `<dialog class="photo-viewer" aria-label="查看原图">
      <div class="photo-viewer-bar"><span class="photo-viewer-title"></span><div class="photo-viewer-tools">
        <button type="button" class="photo-viewer-close" data-zoom-close aria-label="关闭大图" autofocus>×</button>
      </div></div>
      <div class="photo-viewer-scroll" tabindex="0" aria-label="大图，双指或滚轮缩放、拖动平移"><div class="photo-viewer-frame"><img alt="" draggable="false"></div></div>
      <div class="photo-viewer-footer"><div class="photo-viewer-scale"><output aria-label="当前缩放比例"></output><input class="photo-zoom-slider" type="range" min="10" max="400" step="any" aria-label="缩放比例"></div><a class="photo-download" download>下载原图 ↓</a></div>
    </dialog>`;
}

export function mountPhotoViewer(root) {
  const dialog = root.querySelector('.photo-viewer');
  const viewport = dialog.querySelector('.photo-viewer-scroll');
  const frame = viewport.firstElementChild;
  const image = viewport.querySelector('img');
  // 详情页固定一张原图；收藏图库这种一页多图的，由触发按钮的数据每次 open 换源。
  let originImage = root.querySelector('.photo-original img');
  let originFrame = originImage ? originImage.parentElement : null;
  const output = dialog.querySelector('output');
  const slider = dialog.querySelector('.photo-zoom-slider');
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = Number(image.getAttribute('width')) || 1;
  let height = Number(image.getAttribute('height')) || 1;
  let scale = 0;
  let requestedScale = 0;
  let zoomMotion;
  let flightMotion;
  let flight;
  let opener;
  let closing = false;
  let request = 0;
  originImage?.decode().then(() => {
    if (!signal.aborted) originFrame?.toggleAttribute('data-original-ready', true);
  }, () => {});

  function zoom(requested = requestedScale, smooth = false, anchor = null) {
    if (!dialog.open || closing) return;
    if (flight) { requestedScale = requested; return; }
    zoomMotion?.stop();
    const available = viewport.getBoundingClientRect();
    const fit = Math.min(available.width / width, available.height / height, 1);
    // 缩放锚点：给点=以指针下那块像素为轴心缩放，不给=以视野中心为轴心。
    const offX = anchor ? anchor.x - available.left : viewport.clientWidth / 2;
    const offY = anchor ? anchor.y - available.top : viewport.clientHeight / 2;
    const ax = (viewport.scrollLeft + offX) / (viewport.scrollWidth || 1);
    const ay = (viewport.scrollTop + offY) / (viewport.scrollHeight || 1);
    const next = Math.max(fit, Math.min(requested || fit, 4));  // 上限 400%：高清图放大看细节
    requestedScale = requested ? next : 0;
    slider.min = String(fit * 100);
    const paint = value => {
      scale = value;
      image.style.width = `${width * value}px`;
      image.style.height = `${height * value}px`;
      viewport.scrollLeft = ax * viewport.scrollWidth - offX;
      viewport.scrollTop = ay * viewport.scrollHeight - offY;
      output.value = `${(value * 100).toFixed(value < .1 ? 1 : 0)}%`;
      slider.value = String(value * 100);
    };
    if (!smooth || scale === next) { paint(next); return; }
    zoomMotion = animateSpring(scale, paint, paint);
    zoomMotion.to(next);
  }

  function viewerFrame() {
    const { left, top } = viewport.getBoundingClientRect();
    return photoFrame(image, new DOMRect(left, top, viewport.clientWidth, viewport.clientHeight));
  }
  function fadeFrame(value) {
    return { ...value, x: value.x + value.width * .03, y: value.y + value.height * .03,
      width: value.width * .94, height: value.height * .94, opacity: 0, veil: 0 };
  }
  function fly(from, to, complete) {
    flightMotion?.stop();
    if (!flight) {
      dialog.append(image);
      image.classList.add('photo-flight');
    }
    const paint = createPhotoPainter(image, from, to);
    flightMotion = movePhoto(from, to, value => {
      flight = value;
      paint(value);
      image.style.opacity = String(value.opacity);
      dialog.style.setProperty('--photo-veil', String(value.veil));
    }, complete);
  }
  function clearFlight() {
    flightMotion?.stop();
    if (flight) {
      frame.append(image);
      image.classList.remove('photo-flight');
      Object.assign(image.style, { transform: '', clipPath: '', opacity: '' });
      flight = null;
    }
    dialog.style.removeProperty('--photo-veil');
  }
  async function open(button) {
    if (dialog.open) return;
    const generation = ++request;
    const dynamic = button.dataset.viewSrc;
    if (dynamic) {
      originImage = button.querySelector('img');
      originFrame = originImage ? originImage.parentElement : null;
      width = Number(button.dataset.viewWidth) || originImage?.naturalWidth || 1;
      height = Number(button.dataset.viewHeight) || originImage?.naturalHeight || 1;
      image.setAttribute('width', width);
      image.setAttribute('height', height);
      const title = dialog.querySelector('.photo-viewer-title');
      if (title && button.dataset.viewTitle) title.textContent = button.dataset.viewTitle;
      image.alt = button.dataset.viewTitle || '';
      const download = dialog.querySelector('.photo-download');
      if (download) {
        // 游戏截图这类「只看不载」的触发器没有 data-download——藏掉下载链。
        download.hidden = !button.dataset.download;
        if (button.dataset.download) {
          download.href = button.dataset.download;
          download.download = button.dataset.downloadName || '';
        }
      }
    }
    const originalSrc = dynamic ? null : button.dataset.originalSrc;
    // 同一张详情重开查看器时原图已就位，不再退回预览；首次才先给预览。
    const src = dynamic || (originalSrc && image.getAttribute('src') === originalSrc ? originalSrc : originImage?.src);
    if (src && image.getAttribute('src') !== src) image.src = src;
    await image.decode().catch(() => {});
    // 预览缺失时退回原图，别让“放大”直接失效。
    if (!image.naturalWidth && originalSrc) {
      image.src = originalSrc;
      await image.decode().catch(() => {});
    }
    if (signal.aborted || generation !== request || !image.naturalWidth) return;
    opener = button;
    showPhotoDialog(dialog);
    zoom(0);
    // 详情首屏用预览；查看器打开后再后台预载原图，解码完成后无缝替换（位置/缩放不变）。
    if (originalSrc && image.getAttribute('src') !== originalSrc) {
      const preload = new Image();
      preload.src = originalSrc;
      preload.decode?.().then(() => {
        if (signal.aborted || generation !== request || !dialog.open) return;
        if (image.getAttribute('src') !== originalSrc) image.src = originalSrc;
      }).catch(() => {});
    }
    if (reduced.matches) return;
    const destination = viewerFrame();
    if (!destination) return;
    const source = originImage ? photoFrame(originImage) : null;
    if (originFrame) originFrame.style.visibility = 'hidden';
    fly(source ? { ...source, opacity: 1, veil: 0 } : fadeFrame(destination),
      { ...destination, opacity: 1, veil: 1 }, () => { clearFlight(); zoom(requestedScale, true); });
  }
  function close(immediate = false) {
    request++;
    if (!dialog.open || (closing && !immediate)) return;
    closing = true;
    zoomMotion?.stop();
    const finish = () => {
      if (originFrame) originFrame.style.visibility = '';
      dialog.close();
      clearFlight();
      closing = false;
      if (!immediate) opener?.focus({ preventScroll: true });
    };
    if (immediate || reduced.matches) { finish(); return; }
    const current = flight ?? viewerFrame();
    if (!current) { finish(); return; }
    if (originFrame) originFrame.style.visibility = 'hidden';
    // 落点逐帧重取缩略图位置：返回途中页面滚动不落错位。
    fly({ opacity: 1, veil: 1, ...current }, () => {
      const source = originImage ? photoFrame(originImage) : null;
      return source ? { ...source, opacity: 1, veil: 0 } : fadeFrame(current);
    }, finish);
  }

  // 滚轮无极缩放（以指针为轴心）；放大后按住左键拖动平移——平移走原生滚动钳位，图片出不了自己的画幅。
  viewport.addEventListener('wheel', event => {
    if (!dialog.open || closing || flight) return;
    event.preventDefault();
    zoom((requestedScale || scale) * Math.exp(-event.deltaY * .0024), false, { x: event.clientX, y: event.clientY });
  }, { passive: false, signal });
  slider.addEventListener('input', () => {
    zoom(Number(slider.value) / 100);
  }, { signal });
  let pan = null;
  // 双指缩放：两指中点做锚点，捏合比例直接乘当前倍率；一指仍走原生滚动平移。
  const pointers = new Map();
  let pinch = null;
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !dialog.open || closing || flight) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    viewport.setPointerCapture?.(event.pointerId);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale: scale || requestedScale || 1 };
      pan = null;
      viewport.classList.remove('is-panning');
      return;
    }
    if (pointers.size > 2) return;
    pan = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.classList.add('is-panning');
  }, { signal });
  viewport.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      zoom(pinch.scale * dist / pinch.dist, false, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      return;
    }
    if (!pan || pan.id !== event.pointerId) return;
    viewport.scrollLeft = pan.left - (event.clientX - pan.x);
    viewport.scrollTop = pan.top - (event.clientY - pan.y);
  }, { signal });
  const endPan = event => {
    pointers.delete(event.pointerId);
    if (viewport.hasPointerCapture?.(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (pinch) {
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 1) {
        const [id, point] = [...pointers.entries()][0];
        pan = { id, x: point.x, y: point.y, left: viewport.scrollLeft, top: viewport.scrollTop };
        viewport.classList.add('is-panning');
      } else if (!pointers.size) {
        pan = null;
        viewport.classList.remove('is-panning');
      }
      return;
    }
    if (!pan || pan.id !== event.pointerId) return;
    pan = null;
    viewport.classList.remove('is-panning');
  };
  viewport.addEventListener('pointerup', endPan, { signal });
  viewport.addEventListener('pointercancel', endPan, { signal });
  viewport.addEventListener('keydown', event => {
    if (!dialog.open || closing) return;
    const panStep = { ArrowLeft: [-48, 0], ArrowRight: [48, 0], ArrowUp: [0, -48], ArrowDown: [0, 48] }[event.key];
    if (panStep) {
      event.preventDefault();
      viewport.scrollLeft += panStep[0];
      viewport.scrollTop += panStep[1];
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoom((requestedScale || scale) * 1.25, true);
    } else if (event.key === '-') {
      event.preventDefault();
      zoom((requestedScale || scale) / 1.25, true);
    }
  }, { signal });

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-photo-zoom]');
    if (button) open(button);
    else if (event.target.closest('[data-zoom-close]')) close();
  }, { signal });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }, { signal });
  const resize = new ResizeObserver(() => zoom());
  resize.observe(dialog);
  return () => {
    controller.abort();
    resize.disconnect();
    close(true);
  };
}
