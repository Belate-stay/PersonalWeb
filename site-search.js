import { asset, projects, articles, projectLogo } from './content.js';
import { icon } from './icons.js';
import { photos } from './photos.js';
import { photoDetailHref } from './photography.js';

const pages = [
  ...Object.entries(projects).map(([id, p]) => ({ title: p.name, summary: p.summary, category: '作品', href: `#/project/${id}` })),
  ...articles.map(a => ({ title: a.title, summary: a.summary, category: a.category, href: `#/article/${a.id}` })),
  ...photos.map(photo => ({ title: photo.title, filename: photo.file, summary: photo.place, category: '摄影', href: photoDetailHref(photo) })),
  { title: '关于 Belate', summary: '计算机专业学生，AI 协作、作品与日常影像。', category: '关于', href: '#/about' },
  // 关于页的页内区块：href 的 ?focus= 由路由解析，点击后滚到对应位置（折叠图组会自动展开）。
  { title: '杨超越', summary: '个人介绍、早年经历、代表作与微博链接。', category: '爱好', href: '#/about/yang-chaoyue' },
  { title: '收藏图片', summary: '杨超越的收藏照片，可放大查看。', category: '爱好', href: '#/about/yang-chaoyue/photos' },
  { title: '理想型', summary: '爱好卡片与两个入口。', category: '爱好', href: '#/about?focus=hobby-idol' },
  { title: '游戏', summary: '游戏截图图组。', category: '爱好', href: '#/about?focus=hobby-game' },
  { title: '烹饪', summary: '烹饪图组。', category: '爱好', href: '#/about?focus=hobby-cooking' },
  { title: '追剧', summary: '追剧图组。', category: '爱好', href: '#/about?focus=hobby-shows' },
  { title: '其他', summary: '日常记录图组。', category: '爱好', href: '#/about?focus=hobby-other' },
  { title: '愿景', summary: 'Google 与 Xiaomi 两张公司卡。', category: '关于', href: '#/about?focus=hobby-vision' },
  { title: 'Google', summary: '搜索、Android、Chrome、YouTube 与 Transformer。', category: '关于', href: '#/about/google', logo: 'google-logo.svg' },
  { title: 'Xiaomi', summary: '从 1999 元手机到 AIoT、汽车与 MiMo。', category: '关于', href: '#/about/xiaomi', logo: 'xiaomi-logo.svg' },
  { title: '小米', summary: 'HyperOS、智能全屋、小米汽车与小米社区。', category: '关于', href: '#/about/xiaomi', logo: 'xiaomi-logo.svg' },
  { title: '智能体', summary: 'Codex、Claude Code、DeepSeek Harness、Pi 与 MiMo Desktop。', category: '关于', href: '#/about?focus=agents' },
  { title: '社交与微信二维码', summary: '扫码加 Belate 的微信，也欢迎聊聊项目与摄影。', category: '关于', href: '#/about?focus=social' },
];
const normalize = text => String(text).normalize('NFKC').toLowerCase().replaceAll('-', ' ');
const searchTerms = normalized => normalized.trim().split(/\s+/).filter(Boolean);

function summaryExcerpt(summary, terms) {
  const normalized = normalize(summary);
  if (normalized.length !== summary.length) return summary;
  const first = Math.min(...terms.map(term => normalized.indexOf(term)).filter(index => index >= 0));
  return first > 32 && Number.isFinite(first) ? `…${summary.slice(first - 10)}` : summary;
}

function appendMatches(element, value, terms) {
  const normalized = normalize(value);
  if (value.length !== normalized.length) {
    element.textContent = value;
    return;
  }
  const ranges = terms.flatMap(term => {
    const matches = [];
    for (let start = normalized.indexOf(term); start >= 0; start = normalized.indexOf(term, start + term.length)) {
      matches.push([start, start + term.length]);
    }
    return matches;
  }).sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start < cursor) continue;
    element.append(value.slice(cursor, start));
    const match = document.createElement('mark');
    match.textContent = value.slice(start, end);
    element.append(match);
    cursor = end;
  }
  element.append(value.slice(cursor));
}

export function searchPages(query) {
  const text = normalize(query).trim();
  if (!text) return pages.slice(0, 13);
  const terms = searchTerms(text);
  const rank = page => {
    const title = normalize(page.title);
    if (title === text || (page.filename && normalize(page.filename) === text)) return 0;
    if (title.startsWith(text)) return 1;
    return terms.every(term => title.includes(term)) ? 2 : 3;
  };
  return pages.filter(page => terms.every(term => normalize(`${page.title} ${page.filename || ''} ${page.summary} ${page.category}`).includes(term)))
    .sort((a, b) => rank(a) - rank(b)).slice(0, 13);
}

export function initSiteSearch() {
  const launch = document.querySelector('[data-open-search]');
  const slot = launch.parentElement;
  launch.innerHTML = icon('search');
  document.querySelector('.site-header .github-link').innerHTML = icon('mark-github');
  const search = document.createElement('div');
  search.id = 'site-search';
  search.inert = true;
  search.innerHTML = `<div class="search-head">${icon('search')}<input type="search" role="combobox" aria-label="搜索全站" aria-autocomplete="list" aria-controls="search-results" aria-expanded="false" placeholder="作品、文章、照片与关于" autocomplete="off"><button type="button" class="search-close" aria-label="关闭搜索">${icon('x')}</button></div><div class="search-dropdown" hidden><p class="search-result-count" role="status"></p><ul class="search-results" id="search-results" role="listbox" aria-label="搜索结果"></ul><p class="search-empty" hidden>没有找到相关内容，换个词试试。</p></div>`;
  slot.append(search);
  const input = search.querySelector('input');
  const list = search.querySelector('.search-results');
  const dropdown = search.querySelector('.search-dropdown');
  const viewport = window.visualViewport;
  let selected = 0;
  const isOpen = () => slot.classList.contains('is-searching');
  function fitResults() {
    if (!isOpen() || dropdown.hidden) return;
    const bottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight;
    search.style.setProperty('--search-available', `${Math.max(0, bottom - dropdown.getBoundingClientRect().top)}px`);
  }
  function select(index, scroll = false) {
    selected = index;
    const links = [...list.querySelectorAll('a')];
    links.forEach((link, i) => link.setAttribute('aria-selected', String(i === selected)));
    if (links[selected]) {
      input.setAttribute('aria-activedescendant', links[selected].id);
      if (scroll) {
        const item = links[selected].getBoundingClientRect();
        const view = list.getBoundingClientRect();
        if (item.top < view.top) list.scrollTop += item.top - view.top;
        else if (item.bottom > view.bottom) list.scrollTop += item.bottom - view.bottom;
      }
    } else input.removeAttribute('aria-activedescendant');
  }
  function update() {
    list.replaceChildren();
    const query = input.value.trim();
    const found = query ? searchPages(query) : [];
    const terms = searchTerms(normalize(query));
    dropdown.hidden = !query;
    input.setAttribute('aria-expanded', String(found.length > 0));
    found.forEach((page, index) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = page.href;
      link.setAttribute('role', 'option');
      link.dataset.searchResult = '';
      link.id = `search-result-${index}`;
      const content = document.createElement('div');
      const title = document.createElement('h3');
      appendMatches(title, page.title, terms);
      const summary = document.createElement('p');
      const filename = page.filename && terms.some(term => normalize(page.filename).includes(term)) ? page.filename : '';
      appendMatches(summary, [page.category, filename, summaryExcerpt(page.summary, terms)].filter(Boolean).join(' · '), terms);
      content.append(title, summary);
      if (page.href.startsWith('#/project/')) link.insertAdjacentHTML('beforeend', projectLogo(page.href.split('/').at(-1)));
      if (page.filename) link.insertAdjacentHTML('beforeend', `<span class="search-photo-icon">${icon('image')}</span>`);
      if (page.logo) link.insertAdjacentHTML('beforeend', `<span class="app-icon search-brand"><img src="${asset(page.logo)}" alt="" loading="lazy" decoding="async"></span>`);
      link.append(content);
      link.insertAdjacentHTML('beforeend', icon('arrow-up-right'));
      li.append(link); list.append(li);
    });
    select(0);
    list.scrollTop = 0;
    search.querySelector('.search-result-count').textContent = `${found.length} 个结果`;
    search.querySelector('.search-empty').hidden = found.length !== 0;
    fitResults();
  }
  function open() {
    if (document.querySelector('dialog[open]') || isOpen()) return;
    slot.classList.add('is-searching');
    launch.setAttribute('aria-expanded', 'true');
    launch.tabIndex = -1;
    search.inert = false;
    input.value = '';
    update();
    input.focus({ preventScroll: true });
  }
  function close(restoreFocus = false) {
    if (!isOpen()) return;
    slot.classList.remove('is-searching');
    launch.setAttribute('aria-expanded', 'false');
    launch.tabIndex = 0;
    search.inert = true;
    if (restoreFocus) launch.focus({ preventScroll: true });
  }
  function selectResult(event) {
    if (event.isComposing || !isOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
    const links = [...list.querySelectorAll('a')];
    if (links.length && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      select((selected + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length, true);
      if (list.contains(document.activeElement)) links[selected].focus({ preventScroll: true });
    }
    if (event.key === 'Enter' && document.activeElement === input && links[selected]) { event.preventDefault(); links[selected].click(); }
  }
  launch.addEventListener('click', open);
  input.addEventListener('input', update);
  function selectLink(event) {
    const link = event.target.closest('a[aria-selected="false"]');
    if (link) select([...list.querySelectorAll('a')].indexOf(link));
  }
  list.addEventListener('focusin', selectLink);
  list.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse') selectLink(event);
  });
  viewport?.addEventListener('resize', fitResults);
  viewport?.addEventListener('scroll', fitResults);
  search.addEventListener('keydown', selectResult);
  search.querySelector('.search-close').addEventListener('click', () => close(true));
  list.addEventListener('click', event => { if (event.target.closest('[data-search-result]')) close(true); });
  slot.addEventListener('focusout', event => { if (event.relatedTarget && !slot.contains(event.relatedTarget)) close(); });
  document.addEventListener('pointerdown', event => { if (!slot.contains(event.target)) close(); });
  document.addEventListener('belate:open-overlay', () => close());
  window.addEventListener('hashchange', () => close());
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k' || event.isComposing) return;
    event.preventDefault();
    if (isOpen()) close(true);
    else open();
  });
}
