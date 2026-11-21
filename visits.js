// 站点访客计数：Vercount 的公开接口负责跨设备累计，cookie 负责同浏览器去重。
// 页面每次加载都取一次最新值；刷新不增加 UV，换浏览器/设备或清 cookie 才会重新计。
const API = 'https://events.vercount.one/api/v2/log';
const CACHE_KEY = 'belate_visitor_count';
const COOKIE = `vercount_uv_${location.host.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
// 本地预览不碰公共计数：Vercount 按 host 分桶，127.0.0.1:4173 是开发者共用的桶。
const localHost = (() => {
  const host = location.hostname;
  return host === 'localhost' || host === '0.0.0.0' || host === '[::1]' || host === '::1'
    || /^127\./.test(host) || /\.local$/.test(host)
    || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
})();
// 自动化测试用 ?visits-test=1 放行，并通过 Playwright 拦截接口，不写线上数据。
const params = new URLSearchParams(location.search);
const allowLocal = params.has('visits-test');
// 本地默认显示 No.1 占位；?visits-preview=4243 可改假数字。都不请求接口。
const previewParam = params.get('visits-preview');
const preview = localHost
  ? (/^\d+$/.test(previewParam ?? '') ? Number(previewParam) : (allowLocal ? null : 1))
  : null;
const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
};
const hasCookie = () => document.cookie.split(';').some(item => item.trim().startsWith(`${COOKIE}=`));
let count = preview ?? readCache();
let failed = false;
const elements = new Set();

function paint(element) {
  const slot = element.querySelector('.visit-number') ?? element;
  element.toggleAttribute('data-failed', failed && count == null);
  if (count == null) {
    slot.textContent = '';
    element.removeAttribute('data-ready');
    return;
  }
  slot.textContent = `No.${count.toLocaleString('en-US')}`;
  element.setAttribute('data-ready', '');
}

class VisitCount extends HTMLElement {
  connectedCallback() {
    elements.add(this);
    paint(this);
  }
  disconnectedCallback() {
    elements.delete(this);
  }
}
if (!customElements.get('visit-count')) customElements.define('visit-count', VisitCount);

async function load() {
  if (preview != null) {
    failed = false;
    elements.forEach(paint);
    return;
  }
  const pageUrl = location.href.startsWith('http') ? location.href : null;
  if (!pageUrl) {
    failed = count == null;
    elements.forEach(paint);
    return;
  }
  const isNewUv = !hasCookie();
  // 先落 cookie：快速刷新时请求还没回来，也不会重复算一位访客。
  if (isNewUv) document.cookie = `${COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: pageUrl, isNewUv }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    const raw = result?.data?.site_uv ?? result?.site_uv;
    if (raw == null) throw new Error('missing site_uv');
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) throw new Error('bad site_uv');
    count = value;
    failed = false;
    try { localStorage.setItem(CACHE_KEY, String(value)); } catch {}
  } catch {
    // 服务不可用时保留缓存值；没有缓存就让整行收起，不留空白。
    failed = count == null;
  } finally {
    clearTimeout(timer);
    elements.forEach(paint);
  }
}
load();
