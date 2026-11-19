import { asset, projects, articles, projectLogo } from './content.js';
import { homeMarkup as homeView } from './home.js';
import { articleBodies } from './article-bodies.js';
import { personalArticleBodies } from './personal-articles.js';
import { galleryView, photoView } from './photography.js';
import { idolView, idolPhotosView } from './idol.js';
import { idolPhotos } from './idol-photos.js';
import { icon } from './icons.js';
import { sourceGroups, licenseGroups } from './sources.js';
import { parrotButton } from './uiverse-buttons.js';
import { visionView } from './vision.js';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';

// 项目名用各项目自己的字体/字标（与首页作品面板同一套处理）：FreeChat 品牌字体、Codex-Continue 字标图、WZTI 原站标题样式。
function projectTitle(id, name, tag = 'h1') {
  if (id === 'codex-continue') return `<${tag} class="project-title"><span class="work-title-text">${name}</span><img class="work-title-image" src="${asset('codex-continue-wordmark.svg')}" alt="" aria-hidden="true" draggable="false"></${tag}>`;
  return `<${tag} class="project-title project-title--${id}">${escape(name)}</${tag}>`;
}
const external = (url, text) => `<a class="text-link" href="${url}" target="_blank" rel="noopener noreferrer">${text} ↗</a>`;
const parrotWords = {
  'GitHub发布页': ['GitHub', '发布页'],
  'FreeChat官网': ['FreeChat', '官网'],
  'WZTI官网': ['WZTI', '官网'],
  '源码与使用指引': ['源码', '与', '使用指引'],
  '站内体验': ['站内', '体验'],
  '前往下载': ['前往', '下载'],
  '体验作品': ['体验', '作品'],
  '查看源码': ['查看', '源码'],
};
const parrotLink = (href, label, className = '', attrs = '') => parrotButton(href, parrotWords[label] ?? [label], className, label, attrs);
const image = (file, alt, cls = '', eager = false) => `<img src="${asset(file)}" alt="${alt}" class="${cls}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

export function articleRows(items = articles) {
  return items.map(a => `<a href="#/article/${a.id}" class="article-row" data-category="${a.category}">
    <time class="article-date" datetime="${a.date.replaceAll('.', '-')}">${a.date}</time>
    <span class="article-category">${a.category}</span>
    <div class="article-row-copy"><h3>${a.title}</h3><p>${a.summary}</p></div>${arrow}
  </a>`).join('');
}

// 项目版本时间线：只列公开发布节点与一句话总结；详细宣传与更新说明交给官网和发布页。
function projectTimeline(id) {
  const p = projects[id];
  if (!p.timeline?.length) return '';
  const rows = p.timeline.map(([date, version, summary]) => `<li><time class="timeline-date" datetime="${date.replaceAll('.', '-')}">${date}</time><p class="timeline-version">${escape(version)}</p><p class="timeline-summary">${escape(summary)}</p></li>`).join('');
  return `<section id="timeline" class="reading-section"><h2>版本时间线</h2><p>按公开发布记录整理，只列节点与一句话总结；完整更新说明以官网与发布页为准。</p><ol class="project-timeline">${rows}</ol></section>`;
}

// 文章页目录：全站文章索引，当前篇高亮；桌面默认展开两列，手机折叠。
function articleIndex(id) {
  const links = articles.map(a => `<a href="#/article/${a.id}"${a.id === id ? ' aria-current="page"' : ''}><span>${escape(a.title)}</span><time>${a.date}</time></a>`).join('');
  return `<details class="article-index"${globalThis.innerWidth > 760 ? ' open' : ''}><summary>文章目录 <span>${articles.length} 篇</span></summary><nav aria-label="全部文章">${links}</nav></details>`;
}

// 项目详情页的相关记录：featuredArticle 指定的篇目单独成卡排最前，其余按发表时间列成文章行。
function relatedArticles(id) {
  const items = articles.filter(a => a.related === id);
  if (!items.length) return '';
  const feature = items.find(a => a.id === projects[id].featuredArticle);
  const rest = feature ? items.filter(a => a !== feature) : items;
  return `<section id="records" class="reading-section"><h2>相关记录</h2><p>围绕这个项目写下的记录，按发表时间排列。</p>
    ${feature ? `<a class="related-project project-article-feature glass-card tilt-card" href="#/article/${feature.id}"><span>先读这篇</span><h3>${feature.title} ${arrow}</h3><p>${feature.summary}</p></a>` : ''}
    <div class="article-list">${articleRows(rest)}</div></section>`;
}

export { homeView };

function contents(sections, collapsible = false) {
  const links = `<nav aria-label="阅读目录">${sections.map(s => `<a href="#${s.id}" data-section="${s.id}" title="${escape(s.title)}">${escape(s.title)}</a>`).join('')}</nav>`;
  const navigation = collapsible ? `<details class="article-toc"${globalThis.innerWidth <= 760 ? '' : ' open'}><summary>阅读目录 <span>${sections.length} 节</span></summary>${links}</details>` : `<span>本页内容</span>${links}`;
  return `<aside class="reading-aside reading-surface">${navigation}<button class="copy-link">复制本页链接 ↗</button><span class="copy-status" role="status"></span></aside>`;
}

function bodySections(sections) {
  return sections.map(s => `<section id="${s.id}" class="reading-section"><h2>${s.title}</h2>${s.paragraphs.map(p => `<p>${p}</p>`).join('')}${s.bullets ? `<ul>${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}${s.steps ? `<ol class="flow-steps">${s.steps.map(([t, p]) => `<li><strong>${t}</strong><p>${p}</p></li>`).join('')}</ol>` : ''}</section>`).join('');
}
export function projectView(id) {
  const p = projects[id];
  const next = projects[p.next];
  const switchLinks = Object.entries(projects).filter(([pid]) => pid !== id)
    .map(([pid, project]) => parrotButton(`#/project/${pid}`, [project.name], 'case-switch-link')).join('');
  const cover = id === 'freechat'
    ? `<section id="freechat-preview" class="live-demo reading-surface" aria-busy="true" aria-label="FreeChat 临时体验"><div class="demo-toolbar"><div><strong>FreeChat 临时体验</strong><span class="demo-status" role="status">正在打开体验…</span></div><div><button data-demo-expand aria-expanded="false">展开体验 ↗</button><button data-demo-reset>清空重开</button></div></div><div class="demo-loading" aria-hidden="true"><span class="loading-orbit"></span><span>正在打开 FreeChat</span><i></i><i></i><i></i></div><iframe id="freechat-live" title="FreeChat 临时会话" sandbox="allow-scripts allow-forms allow-same-origin" referrerpolicy="no-referrer"></iframe></section>`
    : `<button class="case-cover ${p.theme} reading-surface" data-image="${asset(p.cover)}" data-caption="${p.name} · 真实项目界面" aria-label="放大 ${p.name} 项目界面">${image(p.cover, `${p.name} 真实界面`, 'project-image', true)}<span class="photo-plus" aria-hidden="true">＋</span></button>`;
  const tryProject = id === 'freechat'
    ? parrotButton('#freechat-preview', parrotWords['站内体验'], 'case-opening-link', '站内体验', ' data-section="freechat-preview"')
    : parrotLink(p.url, id === 'codex-continue' ? '前往下载' : '体验作品', 'case-opening-link', ' target="_blank" rel="noopener noreferrer"');
  // freechat：「实际效果演示」= App「新功能推荐！」导览页的实时复刻（feature-rec-demo.js），不留截图墙。
  const screens = id === 'freechat'
    ? '<div class="feature-rec-slot" data-feature-rec></div>'
    : id === 'codex-continue' || id === 'wzti'
      ? `<div class="detail-live-demo" data-project-demo="${id}"></div>`
      : `<div class="screenshot-gallery">${p.gallery.map(([f, t]) => `<figure><button data-image="${asset(f)}" data-caption="${t}" aria-label="放大：${t}">${image(f, t)}<span class="photo-plus" aria-hidden="true">＋</span></button><figcaption>${t}</figcaption></figure>`).join('')}</div>`;
  return `<article class="case-page ${p.theme}" data-project="${id}"><header class="case-header wrap"><div class="case-topline"><a href="#works" class="back-link">← 回到作品</a><nav class="case-switch" aria-label="切换项目"><span>其他项目</span>${switchLinks}</nav></div><p class="case-category">${p.category} · ${p.platform}</p><div class="project-titlebar">${projectLogo(id, true)}${projectTitle(id, p.name)}</div><p class="case-headline">${p.headline}</p><div class="case-opening"><p>${p.intro}</p><div>${tryProject}${parrotLink(p.repo, '查看源码', 'case-opening-link', ' target="_blank" rel="noopener noreferrer"')}</div></div></header>
    ${cover}
    <div class="case-facts wrap">${p.facts.map(([t, v]) => `<div><span>${t}</span><strong>${v}</strong></div>`).join('')}</div>
    <div class="reading-layout wrap">${contents(p.sections)}<div class="reading-body">${bodySections(p.sections)}<section id="screens" class="reading-section"><h2>实际效果演示</h2><p>${p.caption}</p>${screens}</section>${projectTimeline(id)}${relatedArticles(id)}<div class="source-note glass-card tilt-card"><strong>资料与版本</strong><p>${escape(p.verification)}</p><div>${p.sources.map(([t, u]) => parrotLink(u, t, 'source-parrot', ' target="_blank" rel="noopener noreferrer"')).join('')}</div></div></div></div>
    <a class="next-project wrap" href="#/project/${p.next}"><span>接着看另一个项目</span><div><div class="next-project-identity">${projectLogo(p.next)}${projectTitle(p.next, next.name, 'h2')}</div>${arrow}</div><p>${next.headline}</p></a></article>`;
}

export function journalView() {
  const categories = [...new Set(articles.map(a => a.category))];
  return `<section class="journal-page wrap"><header class="page-title"><h1>文字与记录<span>。</span></h1><div class="journal-intro"><p>收录我在 CSDN 写过的项目记录和工具观察，也有自己的散文，记下日常和当时的心情。</p>${parrotButton('https://blog.csdn.net/weixin_51354748', ['CSDN', '主页'], 'journal-csdn', 'CSDN 主页', ' target="_blank" rel="noopener noreferrer"')}</div></header><div class="filters" role="group" aria-label="按主题筛选文章"><button class="is-active" data-filter="全部" aria-pressed="true">全部 <span>${articles.length}</span></button>${categories.map(c => `<button data-filter="${c}" aria-pressed="false">${c}</button>`).join('')}</div><div class="article-list" aria-live="polite">${articleRows()}</div><p class="journal-footnote">按发表或写作日期排列。保留原文的段落与配图，旧文章中的观点、价格和版本对应当时的语境。</p></section>`;
}

export function articleView(id) {
  const a = articles.find(a => a.id === id);
  const body = articleBodies[id] ?? personalArticleBodies[id];
  const html = body.html.replace(/<p>(?:\s|&nbsp;|\u00a0|<br\s*\/?>)*<\/p>/g, '').replace(/@@asset:([^@]+)@@/g, (_, name) => asset(name)).replace(/<img\b[^>]*>/g, img => {
    const src = img.match(/src="([^"]+)"/)?.[1];
    return `<button class="article-image" data-image="${src}" data-caption="${a.title} · 原文配图" aria-label="放大查看文章配图">${img}<span aria-hidden="true">放大查看 ↗</span></button>`;
  });
  const readingTime = Math.max(1, Math.ceil(body.wordCount / 400));
  const title = `<h1>${a.title}</h1>`;
  const meta = a.url
    ? `<p class="article-meta">${a.date} / ${a.category} / 约 ${readingTime} 分钟阅读</p>${title}<div class="article-original"><span>Belate · CSDN 原文全文 · ${body.imageCount} 张配图</span>${external(a.url, '查看来源')}</div>`
    : `${title}<p class="article-meta"><span class="article-author">Belate</span><span>${a.category}</span><time datetime="${a.date.replaceAll('.', '-')}">${a.date}</time><span>约 ${readingTime} 分钟阅读</span></p>`;
  const controls = `<button class="article-type-toggle" aria-pressed="false">放大正文 Aa</button>`;
  const copy = '<button class="copy-link">复制本页链接 ↗</button><span class="copy-status" role="status"></span>';
  const related = a.related ? `<a class="related-project glass-card tilt-card" href="#/project/${a.related}">${projectLogo(a.related)}<span>与这段探索有关的作品</span><h3>${projects[a.related].name} ${arrow}</h3><p>${projects[a.related].summary}</p></a>` : '';
  return `<article class="article-page article-fulltext${a.url ? '' : ' article-essay'}">
    <header class="article-header wrap"><a href="#/journal" class="back-link">← 回到文字</a>${meta}</header>
    <div class="reading-layout wrap">
      ${body.sections.length ? contents(body.sections, true) : ''}
      <div class="reading-body">
        <div class="article-reading-tools">${body.sections.length ? '<span>正文与配图，直接在这里读。</span>' : copy}${controls}</div>
        ${articleIndex(id)}
        <div class="article-body">${html}</div>
        ${a.url ? `<div class="article-end"><p>写于 ${a.date} · 原文内容本地收录</p><span>保留发表时的语境。原文后续修改，可通过来源核对。</span></div>` : ''}
        ${related}
      </div>
    </div>
  </article>`;
}

function socialSection() {
  const qr = asset('belate-wechat.png');
  return `<h2 class="wrap about-social-title" id="social-title">社交</h2>
    <div class="about-social-zone wrap" id="social">
    <section class="about-social frosted-glass" aria-labelledby="social-title">
      <div><p>FreeChat/Codex-Continue/WZTI 用户？<br>摄影爱好者？<br>Vibe Coding工程师？<br>程序员大佬？<br>村村月芽？<br>王者/端瓦玩家？<br>或者是纯交友？<br>都欢迎加我的微信！</p></div>
      <figure>
        <button class="about-qr" type="button" aria-label="放大微信二维码" aria-haspopup="dialog" aria-expanded="false" aria-controls="image-dialog" data-image="${qr}" data-caption="微信扫一扫" data-qr-preview>
          <img src="${qr}" alt="Belate 的微信二维码" width="1280" height="1280" loading="lazy" decoding="async">
          <span class="about-qr-label">微信扫一扫 ${icon('arrow-up-right', { size: 13 })}</span>
        </button>
      </figure>
    </section>
    <p class="social-hint">点我试试</p>
  </div>`;
}

const aboutAgents = [
  ['codex', 'Codex', 'https://openai.com/codex/'],
  ['claude-code', 'Claude Code', 'https://claude.com/product/claude-code'],
  ['deepseek-harness', 'DeepSeek Harness', 'https://www.deepseek.com/harness/'],
  ['pi', 'Pi', 'https://pi.dev/'],
  ['mimo-desktop', 'MiMo Desktop', 'https://mimo.xiaomimimo.com/desktop/'],
];

function agentsSection() {
  const links = repeat => aboutAgents.map(([id, name, url]) => `<li class="about-agent about-agent--${id}">
    <a href="${url}"${repeat ? ' tabindex="-1"' : ''} target="_blank" rel="noopener noreferrer" draggable="false">
      <span class="about-agent-logo"><img src="${asset(`agent-${id}.webp`)}" width="256" height="256" alt="" decoding="async" draggable="false"></span><span>${name}</span>
    </a>
  </li>`).join('');
  return `<section class="about-agents" id="agents" aria-labelledby="about-agents-title">
    <h2 class="wrap" id="about-agents-title">智能体</h2>
    <div class="about-agent-window">
      <div class="about-agent-track">
        <ul class="about-agent-set" aria-hidden="true">${links(true)}</ul>
        <ul class="about-agent-set" role="list">${links(false)}</ul>
        <ul class="about-agent-set" aria-hidden="true">${links(true)}</ul>
      </div>
    </div>
  </section>`;
}

export function aboutView() {
  return `<article class="about-page">
    <div class="about-intro">
      <canvas class="about-ascii" aria-hidden="true"></canvas>
      <button class="about-field-switch" type="button" role="switch" aria-checked="true"><span>动态背景</span><span class="about-field-track" aria-hidden="true"></span></button>
      <header class="page-title wrap"><h1 class="about-type-title"><span class="about-type-text">Hello, I'm Belate</span><span class="about-title-dot">.</span><span class="about-caret" aria-hidden="true"></span></h1><p class="about-lead"><span class="about-lead-line"><span class="about-lead-ghost" aria-hidden="true">一个计算机专业学生。</span><span class="about-lead-typed"><span class="about-lead-text">一个计算机专业学生。</span><span class="about-caret" aria-hidden="true"></span></span></span><span class="about-lead-line"><span class="about-lead-ghost" aria-hidden="true">在代码与日常之间，保留一点自己的观察。</span><span class="about-lead-typed"><span class="about-lead-text">在代码与日常之间，保留一点自己的观察。</span><span class="about-caret" aria-hidden="true"></span></span></span></p></header>
    </div>
    <div class="about-continuation">
      <div class="about-panorama">${image('photo-seaside-1600.webp', '《剪影》，日落时分的海边浅水与人群', '', true)}</div>
      <div class="about-reading wrap">
        <div class="about-reading-title"><h2>从“我需要”，<br>到“我来做一个”。</h2></div>
        <div>
          <p>我对 AI 和产品体验保持好奇。很多尝试，都来自自己使用工具时遇到的小问题：能不能更自由地选择模型？角色的记忆和对话能不能更连贯？任务因为额度停下来之后，能不能自己接着走？</p>
          <p>FreeChat、Codex-Continue 和 WZTI，是这些不同问题留下的作品。它们有各自的体量与完成程度，也都还在变化。</p>
          <h3>AI 协作，是我的制作方式。</h3>
          <p>这些项目通过 Vibe Coding 与 AI 协作完成。我提出需求、选择方向、比较体验、检查结果，再回到细节里继续修改。我不想把这个过程包装成已经掌握一切的履历；能把问题说清楚，把结果验证清楚，本身就是学习。</p>
          <h3>也想给日常，留一点位置。</h3>
          <p>这个网站里的照片由我拍摄。喜欢看光怎样落下来，空间里的东西怎样彼此呼应。影像不必单独变成一份兴趣清单，它也可以成为这个空间的气质。</p>
          <h3>把过程写下来。</h3>
          <p>在 CSDN，我记录接触 AI 的经历、工具使用的想法，也写项目为何开始、遇到什么困难。文章和配图可以在这里直接阅读，文字保留当时的判断，作品则继续往前走。希望这里能把它们放在一起，让你看到一个人做事和成长的过程。</p>
          <div class="about-links">${parrotLink('https://github.com/Belate-stay/', 'GitHub', 'about-link', ' target="_blank" rel="noopener noreferrer"')}${parrotLink('https://blog.csdn.net/weixin_51354748', 'CSDN', 'about-link', ' target="_blank" rel="noopener noreferrer"')}${parrotButton('#works', ['我的', '作品'], 'about-link', '我的作品')}</div>
        </div>
      </div>
      <section class="about-hobbies" id="hobbies" aria-labelledby="about-hobbies-title">
        <h2 class="wrap" id="about-hobbies-title">爱好</h2>
        <div class="hobby-feed wrap">
          <section class="hobby-block" id="hobby-idol">
            <p class="hobby-tag">理想型<span class="hobby-fold-arrow" aria-hidden="true">›</span></p>
            <article class="hobby-post frosted-glass">
              <header class="hobby-head">
                <img class="hobby-avatar" src="${asset('yang-chaoyue-avatar.jpg')}" alt="杨超越的微博头像" width="482" height="483" loading="lazy" decoding="async">
                <h3 class="hobby-title"><a href="https://weibo.com/u/5644764907" target="_blank" rel="noopener noreferrer">杨超越<span class="hobby-title-hint">微博 ↗</span></a></h3>
              </header>
              <nav class="hobby-links" aria-label="杨超越相关页面">
                <a href="#/about/yang-chaoyue"><span class="hobby-link-title">个人介绍</span><span class="hobby-link-sub">早年经历 · 演艺经历 · 主要作品</span><span class="hobby-link-arrow" aria-hidden="true">→</span></a>
                <a href="#/about/yang-chaoyue/photos"><span class="hobby-link-title">收藏图片</span><span class="hobby-link-sub">${idolPhotos.length} 张收藏</span><span class="hobby-link-arrow" aria-hidden="true">→</span></a>
              </nav>
            </article>
          </section>
          <section class="hobby-block" id="hobby-vision">
            <p class="hobby-tag">愿景<span class="hobby-fold-arrow" aria-hidden="true">›</span></p>
            <article class="hobby-post frosted-glass vision-card">
              <div class="vision-head">
                <a class="vision-logo" href="https://www.google.com/" target="_blank" rel="noopener noreferrer" aria-label="前往 Google 官网"><img src="${asset('google-logo.svg')}" alt="Google 标志" width="48" height="48" loading="lazy" decoding="async"></a>
                <div class="vision-copy">
                  <h3 class="vision-name"><a class="vision-name-mark-link" href="https://www.google.com/" target="_blank" rel="noopener noreferrer"><img class="vision-name-mark vision-name-mark--google" src="${asset('google-wordmark.svg')}" alt="Google" width="74" height="24" loading="lazy" decoding="async"></a></h3>
                  <p class="vision-tagline">开源与生态最高的山</p>
                </div>
              </div>
              <a class="vision-entry" href="#/about/google"><span class="vision-entry-title">公司介绍</span><span class="vision-entry-sub">从搜索到 Android、Chrome 与 Transformer</span><span class="vision-entry-arrow" aria-hidden="true">→</span></a>
            </article>
            <article class="hobby-post frosted-glass vision-card">
              <div class="vision-head">
                <a class="vision-logo" href="https://www.mi.com/" target="_blank" rel="noopener noreferrer" aria-label="前往小米官网"><img src="${asset('xiaomi-logo.svg')}" alt="小米标志" width="48" height="48" loading="lazy" decoding="async"></a>
                <div class="vision-copy">
                  <h3 class="vision-name"><a class="vision-name-mark-link" href="https://www.mi.com/" target="_blank" rel="noopener noreferrer"><img class="vision-name-mark" src="${asset('xiaomi-wordmark.svg')}" alt="Xiaomi" width="280" height="47" loading="lazy" decoding="async"></a></h3>
                  <p class="vision-tagline">科技不再高高在上，科技必须服务于每一个人</p>
                </div>
              </div>
              <a class="vision-entry" href="#/about/xiaomi"><span class="vision-entry-title">公司介绍</span><span class="vision-entry-sub">从 1999 元手机到 AIoT、汽车与 MiMo</span><span class="vision-entry-arrow" aria-hidden="true">→</span></a>
            </article>
          </section>
          <details class="hobby-fold" id="hobby-game">
            <summary class="hobby-fold-title">游戏<span class="hobby-fold-arrow" aria-hidden="true">›</span></summary>
            <div class="hobby-shots">${[
              ['game-01.webp', 1400, 630], ['game-02.webp', 1400, 630], ['game-03.webp', 1400, 630],
              ['game-04.webp', 1400, 1050], ['game-05.webp', 1400, 1050], ['game-06.webp', 1400, 1050], ['game-07.webp', 1400, 1050],
            ].map(([file, w, h]) => `<img src="${asset(file)}" alt="游戏截图" width="${w}" height="${h}" loading="lazy" decoding="async">`).join('')}</div>
          </details>
          <details class="hobby-fold" id="hobby-cooking">
            <summary class="hobby-fold-title">烹饪<span class="hobby-fold-arrow" aria-hidden="true">›</span></summary>
            <div class="hobby-shots">${[
              ['cooking-01.webp', 1400, 1050], ['cooking-02.webp', 1400, 1050], ['cooking-03.webp', 1324, 1400],
              ['cooking-04.webp', 1324, 1400], ['cooking-05.webp', 1324, 1400], ['cooking-06.webp', 1324, 1400],
              ['cooking-07.webp', 1200, 1200], ['cooking-08.webp', 1400, 1400], ['cooking-09.webp', 1400, 1400],
              ['cooking-10.webp', 1008, 1400], ['cooking-11.webp', 1324, 1400], ['cooking-12.webp', 1400, 1400],
              ['cooking-13.webp', 1400, 1400],
            ].map(([file, w, h]) => `<img src="${asset(file)}" alt="烹饪记录" width="${w}" height="${h}" loading="lazy" decoding="async">`).join('')}</div>
          </details>
          <details class="hobby-fold" id="hobby-shows">
            <summary class="hobby-fold-title">追剧<span class="hobby-fold-arrow" aria-hidden="true">›</span></summary>
            <div class="hobby-shots">${[
              ['show-01.webp', 1400, 1050, '《书卷一梦》'], ['show-02.webp', 1400, 1050, '《今天是太阳雨》'],
              ['show-03.webp', 1400, 1050, '《你好，旧时光》'], ['show-04.webp', 1400, 1050, '《偷偷藏不住》'],
              ['show-05.webp', 1400, 1050, '《入青云》'], ['show-06.webp', 1400, 1050, '《北上》'],
              ['show-07.webp', 1400, 1050, '《周生如故》'], ['show-08.webp', 1400, 1050, '《微微一笑很倾城》'],
              ['show-09.webp', 1400, 1050, '《长月烬明》'], ['show-10.webp', 1400, 1050, '《许我耀眼》'],
            ].map(([file, w, h, title]) => `<figure class="hobby-shot"><img src="${asset(file)}" alt="${escape(title)}" width="${w}" height="${h}" loading="lazy" decoding="async"><figcaption class="hobby-shot-name" title="${escape(title)}">${escape(title)}</figcaption></figure>`).join('')}</div>
          </details>
          <details class="hobby-fold" id="hobby-other">
            <summary class="hobby-fold-title">其他<span class="hobby-fold-arrow" aria-hidden="true">›</span></summary>
            <div class="hobby-shots">${[
              ['other-01.webp', 1024, 1024], ['other-02.webp', 1000, 563], ['other-03.webp', 1400, 1054],
              ['other-04.webp', 1400, 1867], ['other-05.webp', 1400, 1859], ['other-06.webp', 1400, 1050],
              ['other-07.webp', 1400, 1050],
            ].map(([file, w, h]) => `<img src="${asset(file)}" alt="其他记录" width="${w}" height="${h}" loading="lazy" decoding="async">`).join('')}</div>
          </details>
        </div>
      </section>
      ${agentsSection()}
      ${socialSection()}
    </div>
  </article>`;
}

export function sourcesView() {
  const rows = items => items.length ? `<ul class="source-list">${items.map(item => `<li><a class="source-row" href="${item.url}" target="_blank" rel="noopener noreferrer"><span class="source-name">${escape(item.name)}${item.license ? `<span class="source-license">${escape(item.license)}</span>` : ''}</span><span class="source-target"><span class="source-url">${escape(item.url)}</span><span class="source-arrow" aria-hidden="true">↗</span></span></a></li>`).join('')}</ul>` : '';
  return `<article class="sources-page wrap">
    <header class="sources-header">
      <a class="back-link" href="#/">← 回到首页</a>
      <h1 class="sources-title">第三方地址<span>。</span></h1>
      <p class="sources-lead">这里放的是我在文章和站点里引用、提到过的第三方服务与工具，以及这个网站和几个项目用到的开源项目。地址按记录时整理，点击直达。</p>
    </header>
    <section class="sources-block" aria-labelledby="third-party-sources">
      <h2 id="third-party-sources">本站所提及的第三方信息源</h2>
      <p class="sources-note">只收实际引用过的平台、工具与产品；同一个地址只出现一次。</p>
      ${sourceGroups.map(group => `<div class="source-group">
        <h3 class="source-group-title">${escape(group.title)}</h3>
        ${rows(group.items)}
      </div>`).join('')}
    </section>
    <section class="sources-block" aria-labelledby="open-source-licenses">
      <h2 id="open-source-licenses">开源许可</h2>
      <p class="sources-note">FreeChat、Codex-Continue、WZTI 和这个网站用到的开源项目。谢谢这些作者愿意把代码和字体公开。</p>
      ${licenseGroups.map(group => `<div class="source-group">
        <h3 class="source-group-title">${escape(group.title)}</h3>
        ${group.note ? `<p class="source-group-note">${escape(group.note)}</p>` : ''}
        ${rows(group.items)}
      </div>`).join('')}
    </section>
  </article>`;
}

export function renderView(route) {
  if (route.type === 'project') return projectView(route.id);
  if (route.type === 'article') return articleView(route.id);
  if (route.type === 'journal') return journalView();
  if (route.type === 'about') return aboutView();
  if (route.type === 'photography') return galleryView();
  if (route.type === 'photo') return photoView(route.id);
  if (route.type === 'idol') return idolView(route.id);
  if (route.type === 'idol-photos') return idolPhotosView(route.id);
  if (route.type === 'vision') return visionView(route.id);
  if (route.type === 'third-party') return sourcesView();
  return homeView();
}
