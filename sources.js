// 第三方地址与开源许可数据：只收文章/站点里实际引用过的平台、工具与产品（分享图片不算），
// 开源许可按项目分组，字体与第三方服务一并列出；商业字体不列入开源许可。

export const sourceGroups = [
  {
    title: '平台与社区',
    items: [
      { name: 'GitHub', url: 'https://github.com/' },
      { name: 'CSDN', url: 'https://www.csdn.net/' },
      { name: 'Telegram', url: 'https://telegram.org/' },
      { name: '微博', url: 'https://weibo.com/' },
      { name: '微信', url: 'https://weixin.qq.com/' },
      { name: '小红书', url: 'https://www.xiaohongshu.com/' },
      { name: '哔哩哔哩', url: 'https://www.bilibili.com/' },
      { name: '抖音', url: 'https://www.douyin.com/' },
    ],
  },
  {
    title: '公司与产品',
    items: [
      { name: 'Google', url: 'https://www.google.com/' },
      { name: 'Xiaomi', url: 'https://www.mi.com/' },
      { name: 'Xiaomi Auto', url: 'https://www.xiaomiauto.com/' },
      { name: 'HyperOS', url: 'https://hyperos.mi.com/' },
      { name: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/' },
    ],
  },
  {
    title: '资料与工具',
    items: [
      { name: '360 百科', url: 'https://baike.so.com/' },
      { name: 'VS Code', url: 'https://code.visualstudio.com/' },
      { name: 'Git', url: 'https://git-scm.com/' },
      { name: '不蒜子', url: 'https://busuanzi.ibruce.info/' },
      { name: 'Simple Icons', url: 'https://simpleicons.org/' },
      { name: 'Uiverse', url: 'https://uiverse.io/' },
    ],
  },
  {
    title: 'AI 与模型',
    items: [
      { name: 'MiniMax', url: 'https://www.minimax.cn/' },
      { name: '智谱GLM', url: 'https://open.bigmodel.cn/' },
      { name: 'Claude', url: 'https://claude.ai/' },
      { name: 'DeepSeek', url: 'https://www.deepseek.com/' },
      { name: 'Pi', url: 'https://pi.dev/' },
      { name: 'Xiaomi MiMo', url: 'https://mimo.xiaomimimo.com/' },
      { name: 'ChatGPT', url: 'https://openai.com/' },
      { name: 'Claude Code', url: 'https://claude.com/product/claude-code' },
      { name: 'Codex', url: 'https://openai.com/codex/' },
      { name: 'DeepSeek Harness', url: 'https://www.deepseek.com/harness/' },
      { name: 'Gemini', url: 'https://gemini.google.com/' },
      { name: 'Grok', url: 'https://grok.com/' },
      { name: 'GitHub Copilot', url: 'https://github.com/features/copilot' },
      { name: 'Cursor', url: 'https://cursor.com/' },
      { name: 'Trae', url: 'https://www.trae.ai/' },
      { name: '通义千问', url: 'https://tongyi.aliyun.com/' },
      { name: '文心一言', url: 'https://yiyan.baidu.com/' },
      { name: '腾讯元宝', url: 'https://yuanbao.tencent.com/' },
      { name: '豆包', url: 'https://www.doubao.com/' },
      { name: 'Kimi', url: 'https://kimi.com/' },
    ],
  },
  {
    title: '角色与对话工具',
    items: [
      { name: '星野', url: 'https://www.xingyeai.com/' },
      { name: '猫箱', url: 'https://maoxiangai.com/' },
      { name: 'TavernSilly', url: 'https://sillytaverncn.com/' },
      { name: 'ChatBox', url: 'https://chatboxai.app/' },
    ],
  },
];

export const licenseGroups = [
  {
    title: '个人网站',
    note: '静态站点、构建脚本与站内交互。站点里的 FreeChat 预览来自 FreeChat Web，其依赖列在下一组。',
    items: [
      { name: 'Node.js', license: 'MIT', url: 'https://github.com/nodejs/node' },
      { name: 'Motion（Framer Motion）', license: 'MIT', url: 'https://github.com/motiondivision/motion' },
      { name: 'esbuild', license: 'MIT', url: 'https://github.com/evanw/esbuild' },
      { name: 'Uiverse.io', license: 'MIT', url: 'https://github.com/uiverse-io/galaxy' },
      { name: '霞鹜文楷 LXGW WenKai', license: 'OFL-1.1', url: 'https://github.com/lxgw/LxgwWenKai' },
      { name: 'Manrope', license: 'OFL-1.1', url: 'https://github.com/sharanda/manrope' },
    ],
  },
  {
    title: 'FreeChat · Android',
    note: '客户端与服务端；服务端为零第三方依赖的 Node.js 实现。',
    items: [
      { name: 'Kotlin', license: 'Apache-2.0', url: 'https://github.com/JetBrains/kotlin' },
      { name: 'Jetpack Compose / AndroidX', license: 'Apache-2.0', url: 'https://github.com/androidx/androidx' },
      { name: 'Material 3', license: 'Apache-2.0', url: 'https://github.com/androidx/androidx' },
      { name: 'Navigation / DataStore / Lifecycle / Activity', license: 'Apache-2.0', url: 'https://github.com/androidx/androidx' },
      { name: 'Kotlin Coroutines', license: 'Apache-2.0', url: 'https://github.com/Kotlin/kotlinx.coroutines' },
      { name: 'OkHttp', license: 'Apache-2.0', url: 'https://github.com/square/okhttp' },
      { name: 'MockWebServer（测试）', license: 'Apache-2.0', url: 'https://github.com/square/okhttp' },
      { name: 'Gson', license: 'Apache-2.0', url: 'https://github.com/google/gson' },
      { name: 'ZXing（二维码）', license: 'Apache-2.0', url: 'https://github.com/zxing/zxing' },
      { name: 'Coil（图片加载）', license: 'Apache-2.0', url: 'https://github.com/coil-kt/coil' },
      { name: 'Haze（毛玻璃）', license: 'Apache-2.0', url: 'https://github.com/chrisbanes/haze' },
      { name: 'JUnit 4（测试）', license: 'EPL-1.0', url: 'https://github.com/junit-team/junit4' },
      { name: 'Noto Sans CJK', license: 'OFL-1.1', url: 'https://github.com/notofonts/noto-cjk' },
    ],
  },
  {
    title: 'FreeChat · Web',
    note: '网页版客户端；站内「FreeChat 临时体验」复用了它的核心模块。',
    items: [
      { name: 'React', license: 'MIT', url: 'https://github.com/facebook/react' },
      { name: 'React DOM', license: 'MIT', url: 'https://github.com/facebook/react' },
      { name: 'Zustand', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
      { name: 'idb-keyval', license: 'Apache-2.0', url: 'https://github.com/jakearchibald/idb-keyval' },
      { name: 'JSZip', license: 'MIT / GPL-3.0', url: 'https://github.com/Stuk/jszip' },
      { name: 'KaTeX', license: 'MIT', url: 'https://github.com/KaTeX/KaTeX' },
      { name: 'qrcode', license: 'MIT', url: 'https://github.com/soldair/node-qrcode' },
      { name: 'Vite', license: 'MIT', url: 'https://github.com/vitejs/vite' },
      { name: 'TypeScript', license: 'Apache-2.0', url: 'https://github.com/microsoft/TypeScript' },
    ],
  },
  {
    title: 'Codex-Continue',
    note: 'WPF 桌面程序，没有 NuGet 第三方依赖。',
    items: [
      { name: '.NET / WPF', license: 'MIT', url: 'https://github.com/dotnet/wpf' },
      { name: 'Octicons', license: 'MIT', url: 'https://github.com/primer/octicons' },
      { name: '思源黑体 Source Han Sans', license: 'OFL-1.1', url: 'https://github.com/adobe-fonts/source-han-sans' },
      { name: 'Noto Sans CJK', license: 'OFL-1.1', url: 'https://github.com/notofonts/noto-cjk' },
    ],
  },
  {
    title: 'WZTI',
    note: '单文件原生 HTML / CSS / JS，没有第三方开源库。',
    items: [],
  },
  {
    title: '个人网站 · 交互组件',
    note: 'Uiverse 社区按钮组件（MIT，保留原作者链接）与 Simple Icons（CC0）。',
    items: [
      { name: 'sharp-frog-56 · SujitAdroja', license: 'MIT', url: 'https://uiverse.io/SujitAdroja/sharp-frog-56' },
      { name: 'wise-shrimp-26 · himanshu9682', license: 'MIT', url: 'https://uiverse.io/himanshu9682/wise-shrimp-26' },
      { name: 'popular-ladybug-27 · WhiteNervosa', license: 'MIT', url: 'https://uiverse.io/WhiteNervosa/popular-ladybug-27' },
      { name: 'massive-mayfly-74 · cssbuttons-io', license: 'MIT', url: 'https://uiverse.io/cssbuttons-io/massive-mayfly-74' },
      { name: 'hungry-parrot-44 · satyamchaudharydev', license: 'MIT', url: 'https://uiverse.io/satyamchaudharydev/hungry-parrot-44' },
      { name: 'Simple Icons', license: 'CC0-1.0', url: 'https://simpleicons.org/' },
    ],
  },
];

