import { asset } from './content.js';
import { personalArticles } from './personal-articles.js';
import { idolPhotos } from './idol-photos.js';
import { photoViewerShell } from './photography.js';

// 爱好区·爱豆档案：杨超越。资料按 360 百科词条（与百度百科同源）公开信息整理，数据截至 2026 年。
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const idols = {
  'yang-chaoyue': {
    name: '杨超越',
    tagline: '中国内地女演员、歌手',
    lead: '从盐城大丰的普通女孩，到《创造101》的舞台，再到摄影机前的演员——她把「被看见」这件事，走得又直又久。',
    portrait: 'yang-chaoyue-portrait.webp',
    weibo: 'https://weibo.com/u/5644764907',
    facts: [
      ['出生', '1998 年 7 月 31 日 · 江苏盐城大丰'],
      ['职业', '歌手、演员'],
      ['星座', '狮子座'],
      ['别名', '村花'],
      ['出道', '2018 ·《创造101》第 3 名'],
      ['经纪', '闻澜文化 · 个人工作室（2020）'],
    ],
    works: {
      tv: [
        ['2026', '今天是太阳雨', '郑雨'],
        ['2026', '喜剧之王', '阿珍'],
        ['2024', '墨雨云间', '姜梨'],
        ['2024', '如果奔跑是我的人生', '若华'],
        ['2023', '七时吉祥', '祥云 / 宋祥云 / 沧海'],
        ['2023', '我的人间烟火', '翟淼'],
        ['2023', '微雨燕双飞', '太后'],
        ['2023', '今日宜加油', '吴意美'],
        ['2023', '重紫', '重紫'],
        ['2022', '家有姐妹', '方向'],
        ['2022', '说英雄谁是英雄', '温柔'],
        ['2021', '理想之城', '杜鹃'],
        ['2020', '长安诺', '董若萱'],
        ['2020', '仲夏满天心', '洛天然'],
        ['2020', '且听凤鸣', '凤舞'],
        ['2020', '将夜2', '天女'],
        ['2019', '极限17：羽你同行', '小娜'],
      ],
      film: [
        ['2026', '10间敢死队', '谢谢'],
        ['2026', '无名之辈：意义非凡', '李毛毛'],
        ['2025', '无名之辈：否极泰来', '李毛毛'],
        ['2025', '同学们好', '—'],
        ['2021', '我们的新生活', '陈静羽'],
      ],
      music: [
        ['2019', '《立风》', '火箭少女101 专辑'],
        ['2018', '《撞》', '火箭少女101 首张 EP'],
        ['2018', '卡路里', '电影《西虹市首富》插曲'],
        ['2018', '麻烦少女', '参与词曲创作并演唱'],
        ['2018', '跟着我一起', '首支个人单曲'],
        ['2018', '冲鸭冲鸭', '手游《光明勇士》主题曲'],
        ['2018', '招财进宝', '电影《武林怪兽》贺岁主题歌'],
        ['2018', '毒液前来', '电影《毒液：致命守护者》推广曲'],
        ['2018', '101个愿望', '与傅菁、赖美云合唱'],
        ['2019', 'O.O', '个人单曲'],
        ['2019', '银河系Disco', '电影《疯狂的外星人》主题曲'],
      ],
    },
  },
};

function table(rows, labels) {
  return `<table class="idol-table"><thead><tr>${labels.map(l => `<th>${l}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function bioSections(idol) {
  return [
    {
      id: 'early', title: '早年经历',
      paragraphs: [
        '杨超越出生在江苏省盐城市大丰区的一个农民家庭。父母离异后，她念完初中便进入社会，做过缝纫厂女工、餐厅服务员等最普通的工作。',
        '2016 年 11 月，一次偶然的机会，她参加了闻澜文化举办的女团选拔，成为旗下练习生，与另外七位女生以「球球宝贝」为临时名，在中樱桃接受舞蹈、音乐等方面的训练。',
      ],
    },
    {
      id: 'debut', title: '从 CH2 到《创造101》',
      paragraphs: [
        '2017 年，她与胡婉莹、范悦、杨美琪等正式组成女子演唱组合 CH2，担任手游《球球大作战》年度高校巡回赛表演嘉宾，同年推出《启航》《快乐迪斯科》《听雪恋歌》等单曲。',
        '2018 年，她参加腾讯视频女团青春成长节目《创造101》。唱跳基础不算上位圈，她却以真实性格和肉眼可见的进步被记住：58 进 36 淘汰赛取得第 2 名，参与演唱节目同名主题曲，并与刘人语、许诗茵等共同创作演唱《麻烦少女》。6 月 23 日总决赛，她获得第 3 名，与孟美岐、吴宣仪、段奥娟、Yamy、赖美云、张紫宁、杨芸晴、李紫婷、傅菁、徐梦洁组成火箭少女101，正式出道。',
      ],
    },
    {
      id: 'rocket', title: '火箭少女101 时期',
      paragraphs: [
        '成团后的两年，她随组合推出 EP《撞》（2018）与专辑《立风》（2019）；为电影《西虹市首富》演唱的插曲《卡路里》传唱大街小巷。个人方面，她先后推出《跟着我一起》《冲鸭冲鸭》《招财进宝》等单曲，并连续两年作为 Miu Miu 唯一官方受邀的中国艺人出席巴黎时装周。',
        '综艺里，她是《心动的信号》两季的「心动侦探」，是《哈哈农夫》的常驻嘉宾，也在《超新星全运会》拿下女子射箭亚军、团体拔河冠军与女子接力跑冠军三枚奖牌。2018 年 12 月，她获得「影响中国」年度演艺人物奖，登上《中国新闻周刊》封面；2019 年首次入选福布斯中国名人榜，位列第 58 名。',
        '2020 年 6 月 23 日，火箭少女101 举行告别典礼正式解散。次日，她成立个人工作室，开始独立发展。',
      ],
    },
    {
      id: 'acting', title: '演员这条线',
      paragraphs: [
        '表演是她出道后持续最长的一条线。从《极限17：羽你同行》里羽毛球馆打工的小娜，到《将夜2》里兼具光明与黑暗的天女、《仲夏满天心》里五音不全却梦想作曲的洛天然、《且听凤鸣》里身怀凤凰神血的凤舞，她在古装玄幻与都市轻喜剧之间来回尝试。',
        '之后的角色跨度越来越大：《理想之城》的杜鹃、《说英雄谁是英雄》的温柔、《重紫》的重紫、《七时吉祥》的祥云，到《如果奔跑是我的人生》的若华、《墨雨云间》的姜梨——从仙侠落到现实题材。电影方面，她在饶晓志执导的《无名之辈：否极泰来》（2025）与《无名之辈：意义非凡》（2026）中饰演李毛毛，并参演陈思诚监制的《10间敢死队》。2026 年，她还有《今天是太阳雨》《喜剧之王》两部剧集与观众见面。',
      ],
    },
    {
      id: 'works', title: '主要作品',
      paragraphs: ['按公开资料整理，截至 2026 年。'],
      // 三类作品各自成块：小标题 + 数量 + 表格，块间留白分段，避免三张表糊成一片。
      html: [['电视剧', '部', idol.works.tv], ['电影', '部', idol.works.film], ['音乐', '条', idol.works.music]]
        .map(([name, unit, rows]) => `<div class="idol-works-part"><h3 class="idol-works-title">${name}<span class="idol-works-count">${rows.length} ${unit}</span></h3>${table(rows, ['年份', '作品', name === '音乐' ? '说明' : '饰演角色'])}</div>`)
        .join(''),
    },
    {
      id: 'honor', title: '荣誉与公共参与',
      bullets: [
        '2018「影响中国」年度人物荣誉盛典 年度演艺人物奖，登《中国新闻周刊》封面',
        '2018 腾讯视频星光盛典 年度新锐之星；2019 LikeTCCAsia 中国区最美 100 张面孔第 1 位、亚太区第 3 位',
        '2019 福布斯中国名人榜第 58 位、福布斯 30 岁以下精英榜',
        '第 26 届东方风云榜音乐盛典十大金曲（《卡路里》）',
        '公益星设计明星大使、国际篮联篮球世界杯助力大使、地球一小时 WWF 明星志愿者',
      ],
    },
    {
      id: 'voice', title: '她被这样记着',
      paragraphs: [
        '「杨超越有着秀丽的外形和乐观的性格，在《创造101》里，她的歌唱、跳舞或创作都不算上位圈，但长得好看、性格真实的她让人看到了进步。」——人民网等媒体当年这样评价她；她的逆袭，被称作一种长期被忽视的草根力量。',
        '对喜欢她的人来说，这份喜欢大概不复杂：一个在缝纫厂和餐厅里待过的普通女孩，站上舞台后没有变得圆滑，只是把每一步都走得认真了一点。',
      ],
    },
  ];
}

export function idolView(id) {
  const idol = idols[id];
  if (!idol) return '';
  const sections = bioSections(idol);
  const aside = `<aside class="reading-aside reading-surface"><span>本页内容</span><nav aria-label="阅读目录">${sections.map(s => `<a href="#${s.id}" data-section="${s.id}" title="${escape(s.title)}">${escape(s.title)}</a>`).join('')}</nav><button class="copy-link">复制本页链接 ↗</button><span class="copy-status" role="status"></span></aside>`;
  const body = sections.map(s => `<section id="${s.id}" class="reading-section"><h2>${s.title}</h2>${(s.paragraphs ?? []).map(p => `<p>${p}</p>`).join('')}${s.bullets ? `<ul>${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}${s.html ?? ''}</section>`).join('');
  const growth = personalArticles.find(article => article.id === 'about-growth');
  return `<article class="article-page article-fulltext idol-page">
    <header class="article-header wrap idol-header">
      <a href="#/about" class="back-link">← 回到关于</a>
      <div class="idol-hero">
        <img class="idol-portrait" src="${asset(idol.portrait)}" alt="${escape(idol.name)}的照片" width="1298" height="960" decoding="async">
        <div>
          <p class="article-meta">${escape(idol.tagline)}</p>
          <h1>${escape(idol.name)}<span class="idol-dot">。</span></h1>
          <p class="article-lead">${escape(idol.lead)}</p>
          <div class="idol-links"><a class="text-link" href="${idol.weibo}" target="_blank" rel="noopener noreferrer">微博主页 ↗</a><a class="text-link" href="#/about/${id}/photos">收藏图片 →</a></div>
        </div>
      </div>
    </header>
    <div class="case-facts wrap idol-facts">${idol.facts.map(([t, v]) => `<div><span>${t}</span><strong>${v}</strong></div>`).join('')}</div>
    <div class="reading-layout wrap">
      ${aside}
      <div class="reading-body">${body}
        ${growth ? `<a class="source-note glass-card tilt-card idol-related-card" href="#/article/${growth.id}">
          <span class="related-kicker">相关文章</span>
          <h3 class="related-article-title">${escape(growth.title)} <span class="related-arrow" aria-hidden="true">↗</span></h3>
          <p class="related-excerpt">${escape(growth.summary)} 文章从“为什么会喜欢杨超越”写起，也把成长与初心并排放在一起。</p>
        </a>` : ''}
      </div>
    </div>
  </article>`;
}

export function idolPhotosView(id) {
  const idol = idols[id];
  if (!idol) return '';
  // 收藏图片页：影集同款瓦片网格，不细分画幅、按画幅比先宽后窄排；放大走影集同款查看器（原图），下载给真原件。
  const download = photo => `./杨超越/${encodeURIComponent(photo.source)}?download`;
  return `<article class="photography-page idol-photos wrap">
    <div class="photo-detail-top"><a href="#/about/${id}" class="photo-back">← 返回个人介绍</a></div>
    <header class="photography-header"><h1>收藏图片</h1><p>${escape(idol.name)} · ${idolPhotos.length} 张收藏</p></header>
    <div class="photo-grid idol-grid">${idolPhotos.map(photo => `
      <button class="photo-tile idol-tile" type="button" data-photo-zoom data-view-src="${photo.zoom}" data-view-width="${photo.width}" data-view-height="${photo.height}" data-view-title="${photo.download.replace(/\.\w+$/, '')}" data-download="${download(photo)}" data-download-name="${photo.download}" aria-label="放大查看">
        <figure><div class="photo-tile-frame" style="--photo-ratio:${photo.width / photo.height}"><img src="./IdolPhotos/${photo.file}" width="${photo.width}" height="${photo.height}" alt="${escape(idol.name)}" loading="lazy" decoding="async"></div></figure>
      </button>`).join('')}</div>
    ${photoViewerShell()}
  </article>`;
}
