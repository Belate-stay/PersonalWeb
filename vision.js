import { asset } from './content.js';

// 关于页「愿景」：Google 与 Xiaomi 两张公司卡，以及各自的公司介绍页。
// 资料按公开历史节点整理；页面底部保留来源说明，第三方地址页收录对应链接。
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const googleProducts = [
  ['vision-search.svg', 'Google Search', "Organizing the world's information"],
  ['vision-android.svg', 'Android', 'Open mobile OS and AOSP'],
  ['vision-chrome.svg', 'Chrome / Chromium', 'Browser, V8 and the open web'],
  ['vision-gmail.svg', 'Gmail', 'Email since 2004'],
  ['vision-maps.svg', 'Google Maps', 'Maps, navigation and local info'],
  ['vision-youtube.svg', 'YouTube', 'Video and creator ecosystem'],
  ['vision-tensorflow.svg', 'TensorFlow', 'Open-source machine learning'],
  ['vision-cloud.svg', 'Google Cloud', 'Cloud, data and TPUs'],
  ['vision-play.svg', 'Google Play', 'Apps and digital content'],
  ['vision-gemini.svg', 'Gemini', 'Google multimodal AI'],
];

const xiaomiProducts = [
  ['xiaomi-logo.svg', '小米手机', '从 1999 元的小米 1 开始'],
  ['vision-hyperos.png', 'HyperOS', '人车家全生态的统一系统'],
  ['agent-mimo-desktop.webp', 'MiMo', '小米的开源大模型与桌面入口'],
  ['vision-mihome.svg', '智能全屋', '手机 × AIoT 的全屋连接'],
  ['vision-xiaomi-auto.png', '小米汽车', 'SU7 与人车家全生态'],
  ['vision-mi-community.png', '小米社区', '和用户一起打磨产品'],
  ['vision-mi-eco.svg', '生态链', '投资、协作与丰富的智能硬件'],
];

const googleTimeline = [
  ['1998', 'Google 成立', 'Larry Page 与 Sergey Brin 在车库开始做搜索。'],
  ['2004', 'Gmail 上线', '以更大容量和搜索式邮箱体验进入市场。'],
  ['2005', 'Google 地图', '把地图、路线与本地信息搬到浏览器。'],
  ['2006', '收购 YouTube', '视频从网站功能长成全球内容平台。'],
  ['2008', 'Chrome 与 Android 1.0', '浏览器和移动操作系统同时推进开放 Web。'],
  ['2015', 'Google 重组', '把核心互联网业务与长期技术项目分拆管理。'],
  ['2016', 'AlphaGo 战胜李世石', 'DeepMind 让世界重新认识机器学习。'],
  ['2017', 'Transformer 论文', 'Attention Is All You Need 成为大模型时代的地基。'],
  ['2020', 'AlphaFold', '蛋白质结构预测取得里程碑式进展。'],
  ['2023', 'Gemini', 'Google 把多模态大模型推到产品前台。'],
];

const xiaomiTimeline = [
  ['2010', '小米成立', '从手机系统与社区起步，和用户一起打磨产品。'],
  ['2011', '小米手机 1', '1999 元，把旗舰配置拉到大众价格带。'],
  ['2013', 'Redmi', '把入门机也做成可用的智能手机。'],
  ['2018', '港交所上市', '手机、AIoT 与新零售走到更大的舞台。'],
  ['2021', '宣布造车', '手机 × AIoT 之外，增加“人车家”这一环。'],
  ['2023', 'HyperOS 发布', '用一套系统连接手机、汽车与智能家居。'],
  ['2024', '小米 SU7 交付', '汽车成为小米生态的新入口。'],
  ['2025', 'MiMo 开源', '小米把推理大模型和桌面能力开放给开发者。'],
];

const companies = {
  google: {
    id: 'google',
    kicker: 'Google · 搜索与开源生态',
    name: 'Google',
    tagline: '开源与生态最高的山',
    lead: 'Google 把搜索、Android、Chrome、Gmail、Maps、YouTube、Cloud，以及 Android、Chromium、TensorFlow 这些开源项目连成一片生态。它既是一家搜索公司，也是一家把信息、平台与开发者连接起来的互联网公司。',
    logo: 'google-logo.svg',
    official: 'https://www.google.com/',
    officialLabel: 'Google 官网',
    facts: [
      ['Google 成立', '1998'],
      ['Android 1.0', '2008'],
      ['创始人', 'Larry Page / Sergey Brin'],
      ['总部', 'Mountain View, California'],
      ['核心业务', '搜索 · Android · Chrome · YouTube · Cloud'],
      ['AI 与研究', 'Google Research · DeepMind · Gemini'],
    ],
    products: googleProducts,
    timeline: googleTimeline,
    quote: 'Organize the world’s information and make it universally accessible and useful.',
    quoteNote: 'Google 的使命，从 1998 年沿用至今。',
    sections: [
      {
        id: 'google-mountain',
        title: 'Google：一座山与它的山脉',
        paragraphs: [
          'Google 的产品不是一颗颗孤立的棋子：搜索、广告、Android、Chrome、YouTube、Cloud 和 AI 研究彼此连接，像一座山和它延伸出的山脉。搜索提供入口，Android 与 Chrome 提供设备与 Web 的底座，YouTube 提供内容，Cloud 提供算力，AI 则贯穿其中。',
          '这张卡片和公司页只讲 Google 本身：它的产品、平台、开源项目和开发者生态。点击标志或名称会前往 Google 官网。',
        ],
      },
      {
        id: 'search',
        title: '从搜索开始：组织世界的信息',
        paragraphs: [
          'Google 的起点是 PageRank：用网页之间的链接关系判断重要性。这个想法把互联网从“目录”变成可检索的知识网络，也让搜索广告成为公司最初、最重要的商业引擎。',
          '有了搜索之后，Google 把同一套“把信息变得可用”的方法扩展到 Gmail（2004）、Google 地图（2005）、YouTube（2006）和 Chrome（2008）。这些产品看似分散，底层都在做同一件事：让信息更容易被找到、被使用、被分享。',
        ],
      },
      {
        id: 'android',
        title: 'Android：移动互联网的开放底座',
        paragraphs: [
          'Google 在 2005 年收购 Android，2008 年推出第一台 Android 手机。Android Open Source Project（AOSP）把系统源码开放给手机厂商、芯片厂商和开发者，形成了今天覆盖数十亿设备的移动生态。',
          'Google Play 负责应用与内容分发，Google Mobile Services 提供搜索、地图、邮箱、账号等基础能力。Android 的开放性也带来了碎片化与兼容性挑战，但它确实把智能手机和移动互联网推到了更广阔的人群。',
        ],
      },
      {
        id: 'web',
        title: 'Chrome 与 Chromium：把 Web 变成平台',
        paragraphs: [
          'Chrome 于 2008 年发布，V8 引擎让 JavaScript 跑得更快。Chromium 是 Chrome 的开源上游，众多浏览器、Electron 应用和 WebView 都建立在它之上。',
          'Google 还推动了 Web 标准、性能工具和开放格式的演进。今天大量在线文档、视频会议、协作工具和 AI 应用直接跑在浏览器里，Chrome 与 Chromium 是那条看不见的地基。',
        ],
      },
      {
        id: 'open-source',
        title: '开源：Google 的第二条产品线',
        paragraphs: [
          'Google 的许多关键能力都以开源方式长出来：Android/AOSP、Chromium、TensorFlow、Kubernetes、Go、Protobuf、Flutter、Angular、Material Design、V8，以及 Gemma 等模型。它们不只是一份份代码，更是让外部开发者一起参与、一起扩展生态的接口。',
          'Kubernetes 来自 Google 内部调度经验，后来成为云原生的事实标准；Go 成为基础设施和云工具常用的语言；TensorFlow 把机器学习带进大量工程团队。Google 的“开源成就”很大程度上就是它把内部能力变成公共工具的能力。',
        ],
      },
      {
        id: 'ai',
        title: 'AI：Transformer、AlphaGo 与 AlphaFold',
        paragraphs: [
          '2017 年，Google 的论文《Attention Is All You Need》提出 Transformer 架构，后来成为大语言模型、视觉模型和多模态模型共同的地基。BERT（2018）把预训练语言模型带入工程实践，Gemini（2023）则把多模态能力推到产品前台。',
          'DeepMind 在 2016 年用 AlphaGo 战胜李世石，展示了深度强化学习的力量；2020 年的 AlphaFold 又在蛋白质结构预测上取得里程碑式进展。Google 的 AI 不只停留在论文里：搜索、翻译、地图、相册、广告和 Cloud 都在使用机器学习。',
        ],
      },
      {
        id: 'youtube',
        title: 'YouTube：一个内容与创作者的网络',
        paragraphs: [
          'Google 在 2006 年收购 YouTube。今天 YouTube 不只是一个视频网站：它是创作者经济、音乐、直播、短视频（Shorts）和全球内容分发的综合体。官方公开数据曾披露月登录用户超过 25 亿。',
          'YouTube 与 Google 的搜索、广告、推荐和 Cloud 基础设施彼此连接，是 Google 互联网生态里最接近“公共广场”的部分。',
        ],
      },
      {
        id: 'cloud',
        title: 'Google Cloud 与企业基础设施',
        paragraphs: [
          'Google Cloud 提供计算、存储、数据仓库、AI 平台和企业协作服务；TPU 是 Google 自研的机器学习加速器，Gemini、搜索与内部 AI 训练都依赖自建基础设施。',
          'Workspace（Gmail、Docs、Drive、Meet 等）把 Google 的消费级产品经验带进企业，Cloud 则把同一套基础设施开放给外部开发者。两者一起构成 Google 在“互联网之外”的增长曲线。',
        ],
      },
      {
        id: 'today',
        title: '今天的 Google，为什么是“最高的山”',
        paragraphs: [
          '今天的 Google 同时站在几条主线上：全球搜索与广告、Android 与移动生态、Chrome 与 Web、YouTube 与内容、Google Cloud 与企业服务，以及 Gemini、DeepMind、Waymo 等 AI 与长期技术。它的强项不只是某一个产品，而是这些产品之间互相供给数据、流量、算力和开发者的网络效应。',
          '“开源与生态最高的山”不是一句排名，而是一种结构：很多公司做出一款好产品，Google 则把产品、平台、标准和开源项目叠在一起，让外部的人也能沿着它的地基继续往上建。',
        ],
      },
    ],
    sources: '资料整理自 Google 官方公开信息、Google Research 与 DeepMind 公开资料、Wikimedia Commons 与 Simple Icons；Google 及相关产品名称和标志归 Google LLC 所有，本页仅用于介绍与识别。',
  },
  xiaomi: {
    id: 'xiaomi',
    kicker: 'Xiaomi · 人车家全生态',
    name: 'Xiaomi',
    tagline: '科技不再高高在上，科技必须服务于每一个人',
    lead: '小米从一部 1999 元的手机起步，把移动互联网、智能硬件、生态链、新零售、汽车和大模型连成一张网。它既是一家手机公司，也是一家把“和用户交朋友”写进产品节奏的消费科技公司。',
    logo: 'xiaomi-logo.svg',
    official: 'https://www.mi.com/',
    officialLabel: '小米官网',
    facts: [
      ['成立', '2010 · 北京'],
      ['创始人', '雷军'],
      ['手机起点', '小米手机 1 · 1999 元'],
      ['系统', 'HyperOS · 人车家全生态'],
      ['战略', '手机 × AIoT · 人车家全生态'],
      ['新战场', '小米汽车 · MiMo 大模型'],
    ],
    products: xiaomiProducts,
    timeline: xiaomiTimeline,
    quote: '让全球每个人都能享受科技带来的美好生活。',
    quoteNote: '小米的使命，从创立之初沿用至今。',
    sections: [
      {
        id: 'hyperos',
        title: 'HyperOS：人车家全生态的系统底座',
        paragraphs: [
          '2023 年，小米发布 HyperOS（小米澎湃 OS），用一套系统把手机、平板、电视、汽车和智能家居连接起来。它把 Android 与自研的 Vela 内核放在同一个架构里，让不同设备共享账号、服务与任务。',
          '对小米来说，系统不再只属于手机：车机、家居和穿戴设备都需要同一套体验底座。HyperOS 把“人车家全生态”从产品组合变成一条连续的软件体验，也让设备之间的连接、流转和协同成为系统能力。',
        ],
      },
      {
        id: 'mi-one',
        title: '1999 元：小米手机的起点',
        paragraphs: [
          '2011 年，小米手机 1 以 1999 元的价格发布，把当时旗舰级的处理器、屏幕和内存带到了大众价格带。它用互联网预售、社区传播和线上销售压缩渠道成本，让“高配置 + 低价格”成为一种可复制的产品方法。',
          '此后 Redmi 把入门机做成真正可用的智能手机；小米数字系列则不断向高端探索。性价比不是永远便宜，而是把同样的技术尽可能早、尽可能广地交到更多人手里。',
        ],
      },
      {
        id: 'aiot',
        title: '手机 × AIoT：智能全屋',
        paragraphs: [
          '小米把“手机 × AIoT”作为核心战略：手机是入口，电视、路由器、音箱、扫地机器人、灯具、空气净化器、门锁、传感器等设备围绕手机连接起来。米家 App 和小爱同学把这些设备放进同一个控制面板，形成智能全屋的体验。',
          '生态链公司是这套打法的关键。小米通过投资、产品定义、供应链和渠道协作，让大量中小团队把产品做出来，再接入小米的品牌、用户和线下门店。它不是一家公司做所有硬件，而是一张协作网络做很多硬件。',
        ],
      },
      {
        id: 'retail',
        title: '新零售与全球化',
        paragraphs: [
          '小米之家把线上效率与线下体验放在一起：用户可以到店看手机、电视、家居和生态链产品，也可以在线上完成购买和服务。线下门店既是销售点，也是品牌与用户的接触面。',
          '小米的业务进入印度、东南亚、欧洲、拉美等市场，手机、可穿戴和智能家居共同出海。不同市场的渠道、运营商和本地化需求，也反过来推动产品形态和价格带的变化。',
        ],
      },
      {
        id: 'car',
        title: '小米汽车：人车家全生态',
        paragraphs: [
          '2021 年，小米宣布进入智能电动汽车行业。2024 年，小米 SU7 开始交付。汽车不是一件孤立的硬件：它与手机、家居、账号和云服务连接，补上了“人车家全生态”里移动空间的一环。',
          '从手机到汽车，小米面对的是更长的研发周期、更重的制造与安全要求，以及更复杂的供应链。这是小米从消费电子走向更大规模硬件的关键一跃。',
        ],
      },
      {
        id: 'mimo',
        title: 'MiMo：把大模型带到端侧与桌面',
        paragraphs: [
          '小米在 2025 年开源 MiMo-7B 推理模型，并探索面向桌面与端侧的 MiMo 能力。与只在云端提供 API 的路线不同，MiMo 更强调模型在个人设备、开发工具和真实场景里的可用性。',
          '本站智能体栏目里的 MiMo Desktop 就是这条线的产品化入口：它把模型、桌面操作和用户任务连接起来。对小米来说，大模型不是独立产品，而是手机、汽车、家居和生产力工具共同的智能底座。',
        ],
      },
      {
        id: 'community',
        title: '小米社区：和用户交朋友',
        paragraphs: [
          '小米社区、米粉节和线下活动，是小米产品节奏的一部分。用户在这里反馈问题、投票功能、分享使用经验，也在这里见证系统版本的迭代。',
          '“和用户交朋友”意味着把用户意见放进产品流程，而不是只在营销时使用用户语言。透明的功能投票、问题反馈和参与感，是小米早期最鲜明的差异点之一。',
        ],
      },
      {
        id: 'today',
        title: '今天的 Xiaomi',
        paragraphs: [
          '今天的小米同时做手机、AIoT、智能家居、新零售、汽车和大模型。手机仍是最大的用户入口，AIoT 和生态链提供更宽的产品面，汽车打开新的移动空间，MiMo 则把 AI 能力放进端侧与桌面。',
          '雷军说过，“科技不再高高在上，科技必须服务于每一个人”。这句话解释了小米为什么反复强调价格、普及和用户参与：技术只有真正被更多人用上，才算完成了它的价值。',
        ],
      },
    ],
    sources: '资料整理自 Xiaomi / 小米汽车 / HyperOS 与小米社区公开信息、Wikimedia Commons 与 Simple Icons；Xiaomi、HyperOS、MiMo 及相关产品名称和标志归小米集团所有，本页仅用于介绍与识别。',
  },
};

const productTile = ([icon, name, note, mark]) => `<div class="vision-product" role="listitem">${icon ? `<img src="${asset(icon)}" alt="" width="28" height="28" loading="lazy" decoding="async">` : `<span class="vision-mark" aria-hidden="true">${escape(mark || name.slice(0, 2))}</span>`}<div><strong>${escape(name)}</strong><span>${escape(note)}</span></div></div>`;

const timelineList = rows => `<ol class="vision-timeline">${rows.map(([date, title, note]) => `<li><time>${escape(date)}</time><strong>${escape(title)}</strong><span>${escape(note)}</span></li>`).join('')}</ol>`;

export function visionView(id) {
  const company = companies[id];
  if (!company) return '';
  const products = `<div class="vision-products" role="list">${company.products.map(productTile).join('')}</div>`;
  const extra = `<section id="products" class="reading-section"><h2>主要产品与生态</h2><p>把产品放在一起看，比单看一个功能更容易理解这家公司如何把用户、开发者与硬件连接起来。</p>${products}</section>`;
  const aside = `<aside class="reading-aside reading-surface"><span>本页内容</span><nav aria-label="阅读目录">${company.sections.map(section => `<a href="#${section.id}" data-section="${section.id}" title="${escape(section.title)}">${escape(section.title)}</a>`).join('')}<a href="#products" data-section="products" title="主要产品与生态">主要产品与生态</a><a href="#timeline" data-section="timeline" title="时间线">时间线</a></nav><button class="copy-link">复制本页链接 ↗</button><span class="copy-status" role="status"></span></aside>`;
  const body = company.sections.map(section => `<section id="${section.id}" class="reading-section"><h2>${escape(section.title)}</h2>${section.paragraphs.map(p => `<p>${p}</p>`).join('')}</section>`).join('');
  return `<article class="article-page article-fulltext vision-page vision-page--${id}">
    <header class="article-header wrap vision-header">
      <a href="#/about" class="back-link">← 回到关于</a>
      <div class="vision-hero">
        <a class="vision-emblem" href="${company.official}" target="_blank" rel="noopener noreferrer" aria-label="${escape(company.officialLabel)}"><img src="${asset(company.logo)}" alt="${escape(company.name)} 标志" width="120" height="120" decoding="async"></a>
        <div>
          <p class="article-meta">${escape(company.kicker)}</p>
          ${id === 'xiaomi' ? `<h1 class="vision-wordmark"><img src="${asset('xiaomi-wordmark.svg')}" alt="Xiaomi" width="280" height="47" decoding="async"></h1>` : `<h1 class="vision-wordmark vision-wordmark--google"><img src="${asset('google-wordmark.svg')}" alt="Google" width="74" height="24" decoding="async"></h1>`}
          <p class="vision-tagline">${escape(company.tagline)}</p>
          <p class="article-lead">${escape(company.lead)}</p>
        </div>
      </div>
    </header>
    <div class="case-facts wrap vision-facts">${company.facts.map(([label, value]) => `<div><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
    <div class="reading-layout wrap">
      ${aside}
      <div class="reading-body">
        <div class="vision-quote"><p>${escape(company.quote)}</p><span>${escape(company.quoteNote)}</span></div>
        ${body}
        ${extra}
        <section id="timeline" class="reading-section"><h2>时间线</h2>${timelineList(company.timeline)}</section>
        <p class="vision-sources">${escape(company.sources)}</p>
      </div>
    </div>
  </article>`;
}

export const visionNames = { google: 'Google', xiaomi: 'Xiaomi' };
