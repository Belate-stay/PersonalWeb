import { articles } from './articles.js';
import { photos } from './photos.js';
const projects = new Set(['freechat', 'codex-continue', 'wzti']);
const articleIds = new Set(articles.map(article => article.id));
const photoTitles = new Set(photos.map(photo => photo.title));
const visionIds = new Set(['google', 'xiaomi']);

export function readRoute(href) {
  const url = new URL(href);
  // hash 内允许 `?focus=`：搜索跳到关于页的某个区块（爱好/智能体/社交）时用。
  const [path, query = ''] = url.hash.replace(/^#\/?/, '').split('?');
  const parts = path.split('/');
  const focus = new URLSearchParams(query).get('focus') || undefined;
  if (parts[0] === 'project' && projects.has(parts[1])) return { type: 'project', id: parts[1] };
  if (parts[0] === 'article' && articleIds.has(parts[1])) return { type: 'article', id: parts[1] };
  if (parts[0] === 'photography') {
    try {
      const title = decodeURIComponent(parts[1] || '');
      if (parts.length === 2 && photoTitles.has(title)) return { type: 'photo', id: title };
    } catch { /* A malformed link falls back to the gallery. */ }
    return { type: 'photography' };
  }
  if (parts[0] === 'about' && visionIds.has(parts[1]) && parts.length === 2) return { type: 'vision', id: parts[1] };
  if (parts[0] === 'about' && parts[1] === 'yang-chaoyue') {
    if (parts.length === 2) return { type: 'idol', id: parts[1] };
    if (parts.length === 3 && parts[2] === 'photos') return { type: 'idol-photos', id: parts[1] };
  }
  if (parts[0] === 'third-party') return { type: 'third-party' };
  if (['journal', 'about'].includes(parts[0])) return { type: parts[0], ...(parts[0] === 'about' && focus ? { focus } : {}) };
  if (!url.hash && projects.has(url.searchParams.get('project'))) return { type: 'project', id: url.searchParams.get('project') };
  if (['works', 'notes', 'about-home', 'main'].includes(parts[0])) return { type: 'home', section: parts[0] };
  return { type: 'home' };
}
