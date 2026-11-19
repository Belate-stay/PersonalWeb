export const asset = name => './assets/' + name;
export function projectLogo(id, shared = false) {
  const project = projects[id];
  return `<span class="app-icon app-icon--${id}"><img src="${asset(project.logo)}" alt="" data-project-logo="${id}" draggable="false"></span>`;
}

export const projects = {
  freechat: {
    name: 'FreeChat', logo: 'project-freechat-logo.webp', category: 'AI 对话客户端', platform: 'Android / Web',
    headline: '用同一个客户端，展开四种对话。',
    summary: '接入自选模型，用标准模式处理问题，用拟人、群聊和多角色文本组织角色对话与故事。',
    cover: 'freechat-home.webp', theme: 'sage',
    url: 'https://freechater.com/', repo: 'https://github.com/Belate-stay/FreeChat',
    facts: [['Android 核对版本', '1.2.3'], ['Web 核对版本', '1.4.0'], ['新对话入口', '四种对话形态']],
    intro: 'FreeChat 是支持自备模型 API 的 AI 对话客户端。Web 1.4.0 的「新对话」提供标准模式、拟人模式、多角色群聊和多角色文本。角色库与聊天记录分开维护，角色卡可在不同对话中复用。',
    verification: '依据 Android 1.2.3 与 Web 1.4.0 本地源码核对。本站体验连接 FreeChat 内置模型，复用原版流式解析、角色提示词、群聊编排和故事装配。',
    timeline: [
      ['2026.09.04', 'v1.0.01', '首个公开版本：自备模型、基础聊天与角色设定可用。'],
      ['2026.10.06', 'v1.1.0', '大版本更新：微信式表达、剧情记忆与数据同步进入主线。'],
      ['2026.10.14', 'v1.2.0', '版本号统一，官网发布正式版下载。'],
      ['2026.10.20', 'v1.2.1', '语音与安卓端体验完善后发布。'],
      ['2026.10.29', 'v1.2.3', '群聊与文本等测试能力收口，数学公式进入正式版。'],
      ['2026.10.31', 'Web 1.4.0', 'Web 与安卓功能大同步：多角色群聊、多角色文本与角色池上线。'],
    ],
    sections: [
      { id: 'assistant', title: '标准模式：先配置模型，再对话', paragraphs: [
        '设置中的模型列表按语言、生图、识图、语音合成与语音识别分类型配置。添加模型时填写服务地址、模型 ID 和 Key。各类型走各自的接口，一个服务是否支持某项能力取决于所选模型。',
        '标准聊天支持 Markdown 与数学公式，并提供文件附件、深度思考与联网搜索入口。深度思考和搜索按钮按当前语言模型的能力决定能否启用。输入框上的搜索开关和设置里的总开关共同参与控制。',
        '本页体验使用 FreeChat 服务器的内置模型 DeepSeek-V4.1-Flash，打开即可发送消息。站内聊天和角色记忆随体验清空。',
      ] },
      { id: 'characters', title: '拟人模式：角色档案与角色卡', paragraphs: [
        '在「新对话」中选拟人模式会打开角色设定草稿。填写角色名字、人物设定与关系，再选择微信聊天式表达、动作演绎或剧情补足。创建角色对话会使用配置的模型处理设定。',
        '侧栏的「新角色」另走角色库编辑器，保存的是可复用的角色卡。已有拟人对话则在自己的角色档案里编辑设定和记忆。记忆组织包含主线、细节、全局与感知等层次，能为后续对话保留上下文。',
      ] },
      { id: 'group', title: '多角色群聊：选人、建群、发起一轮', paragraphs: [
        '群聊向导从角色库选人，最多加入四名 AI 角色。选完进入群设置，可设置群名和对话模型，也能单独修改群里的成员设定。',
        '发消息、@ 指定角色或拍一拍后，由群聊流程安排本轮发言。角色在同一对话里接话，群成员设定随这条对话保存。',
      ] },
      { id: 'story', title: '多角色文本：把人物放进同一个世界', paragraphs: [
        '故事向导最多选八名角色。选完可填写故事名称、世界背景、规则、用户形象与开篇，并配置语言模型、回复篇幅等选项。',
        '新故事保存角色快照，后续可在故事里单独修改人物。用户输入推动情节，AI 依照当前故事及人物设定补足剧情。',
      ] },
      { id: 'sync', title: '本地使用、账号同步与微信通道', paragraphs: [
        'Android 与 Web 有各自的本地存储。正式应用可选账号同步，图片以内容指纹去重，删除记录参与合并，避免已删对话在另一端重新出现。',
        '拟人模式里的「微信聊天」是表达方式。正式应用的「连接微信」是另一个服务端通道，涉及登录、绑定及服务端能力。',
      ] },
    ],
    gallery: [['freechat-current.webp', 'Web 1.4.0 新对话的四个入口'], ['freechat-home.webp', 'Web 标准聊天的起始界面'], ['freechat-characters.webp', 'Web 角色库（截图中的角色为展示数据）'], ['freechat-phone.webp', 'Android 早期聊天界面'], ['freechat-settings.webp', 'Android 早期模型设置']],
    caption: '四张卡演示 App 里的四件事：群聊怎么接话、故事怎么逐字写出来、场景图怎么生成，以及角色在微信里怎么回消息。播放节奏跟真机一致，点卡片下的「重播」可以再看。',
    featuredArticle: 'freechat-origin',
    sources: [['GitHub发布页', 'https://github.com/Belate-stay/FreeChat/releases'], ['FreeChat官网', 'https://freechater.com/']], next: 'codex-continue',
  },
  'codex-continue': {
    name: 'Codex-Continue', logo: 'project-codex-continue-logo.svg', category: '桌面续跑工具', platform: 'Windows x64',
    headline: '给暂停的 Codex 对话安排下一步。',
    summary: '指定已加载的对话和续跑指令，等待额度恢复或到达设定时刻后提交。',
    cover: 'codex-continue.webp', theme: 'ink',
    url: 'https://github.com/Belate-stay/Codex-Continue/releases', repo: 'https://github.com/Belate-stay/Codex-Continue',
    facts: [['运行平台', 'Windows x64'], ['技术', 'C# / WPF / .NET 9'], ['源码版本', '1.0']],
    intro: 'Codex-Continue 在 Windows 上检测 Codex 窗口和额度状态。使用者选择当前已加载的目标对话、填写下一步指令，然后在自动续跑或手动定时模式运行。',
    verification: '依据本地 WPF 1.0 源码（fee6504）中的额度读取、自动判定、定时器和发送流程核对。网页展台使用示例读数与手动触发事件。',
    timeline: [
      ['2026.11.03', 'Version 1.0', '仓库公开，GitHub Release 同步发布自包含 Windows x64 单文件与 SHA256 校验。'],
    ],
    sections: [
      { id: 'setup', title: '连接并选定对话', paragraphs: [
        '先启动 Codex 桌面端。连接判据是可见或托盘隐藏的实际窗口，读取不到窗口时呈现未知或离线。额度读取可使用 app-server，另结合 rollout 记录与界面上的实时限制提示。',
        '在对话列表明确选择目标，填写多行提示词，例如 /Continue。附件随指令作为本地文件路径写入消息正文，由 Codex 读取。开始运行后，指令区锁定；可以停止后再修改。',
      ] },
      { id: 'flow', title: '自动续跑：从耗尽到恢复', paragraphs: [
        '典型路径是守护期间观察到额度耗尽，再观察到可用，随后提交一次。读数未知时继续监测。源码也处理启动时已恢复但最后一轮因额度错误中断，以及超过预计恢复时间和两分钟缓冲后的兜底尝试。',
        '单次模式确认提交后停止并清空提示词与附件。开启循环发送则保留同一指令，等待新一轮耗尽与恢复。重复的旧限制提示不会被当成新的耗尽周期。',
      ], steps: [['准备指令', '选择加载中的目标对话并填写下一步。'], ['开始守护', '观察额度状态；未知读数保持等待。'], ['提交与确认', '向指定对话入队，按提交结果决定后续状态。']] },
      { id: 'schedule', title: '手动定时：按指定时刻提交一次', paragraphs: [
        '手动模式可输入时刻，或者围绕预计恢复时刻前后五分钟微调。运行时设置独立定时器，到点尝试发送，不必等下一次额度检测。',
        '网页演示用「到达设定时刻」推进这个过程，便于比较它与自动续跑的触发差别。',
      ] },
      { id: 'sending', title: '提交确认、重试与停止', paragraphs: [
        '发送先尝试向指定对话队列提交，队列明确失败才尝试桌面界面输入。若提交结果未知，程序停止守护，避免重复发送。明确失败和受额度阻挡有各自的重试上限。',
        '入队成功表示指令已提交给对话，之后由 Codex 处理。用户随时可以停止守护，停止前发出的异步操作返回时会核对运行批次。',
      ] },
      { id: 'desktop', title: '桌面运行与发布', paragraphs: [
        '工具为 WPF Windows x64 单文件，可在系统托盘运行；托盘菜单提供打开、设置、运行、停止与退出。界面支持浅色、深色及跟随系统，还有中英双语和 DPI 适配。',
        '启动后可在后台检查 GitHub Releases。下载检查文件大小，发布方提供哈希时核验 SHA256，完成后打开文件夹。',
      ] },
    ],
    gallery: [['codex-continue.webp', 'Codex-Continue 桌面端主界面（未连接时的截图）']],
    caption: '可以直接点的流程：选一段对话、填好指令，看它把断掉的续跑接起来。额度恢复、提交和停止都能手动触发。',
    sources: [['GitHub发布页', 'https://github.com/Belate-stay/Codex-Continue/releases'], ['源码与使用指引', 'https://github.com/Belate-stay/Codex-Continue']], next: 'wzti',
  },
  wzti: {
    name: 'WZTI', logo: 'project-wzti-logo.webp', category: '王者荣耀娱乐测试', platform: 'Web',
    headline: '用 36 道对局情境题，生成你的峡谷图鉴。',
    summary: '按原版选项计分，生成八维雷达、玩家人格和英雄匹配。标准版共有 13 种结果，其中 2 种隐藏。',
    cover: 'wzti-cover.webp', theme: 'lavender',
    url: 'https://belate-stay.github.io/WZTI/', repo: 'https://github.com/Belate-stay/WZTI',
    facts: [['标准版', '1.5.0'], ['情境题', '36 题'], ['结果', '13 种人格 · 含 2 种隐藏']],
    intro: 'WZTI「峡谷图鉴」把王者荣耀对局里的操作、资源取舍、沟通和心态写成四选一情境题。完整答卷会生成娱乐人格、八维雷达和一位匹配英雄。',
    verification: '依据公开标准版 index.html（Git blob 8f985bb799e4f62a407d1eb22ebd01de620694ac）。首页速测使用原版题库和选项分数，按三题倾向归类，英雄独立随机抽取。',
    timeline: [
      ['2026.04.15', '首个公开版本', '标准版页面整理为 index.html，仓库公开。'],
      ['2026.05.02', '页面更新', '标准版页面文件更新。'],
      ['2026.09.26', '标准版更新', '页面与资源文件更新，同时补充开源许可。'],
    ],
    sections: [
      { id: 'questions', title: '完整作答与进度', paragraphs: [
        '标准版有 36 道题，每道题四个选项。桌面宽屏将题目排在列表中，提交前可以跳到首道未作答题；手机逐题呈现，支持回上一题修改。',
        '原站将答卷进度、深浅主题和配色存进浏览器。本站首页提供三题速测，可以重答当前题组，也可以换一组题。',
      ] },
      { id: 'scoring', title: '八维分数如何变成人格', paragraphs: [
        '每个选项会增加相应的团队、独狼、稳健、激进、理性、情绪、微操、大局分数，也可能记录发育、对抗沟通或关系倾向等标签。八维分数直接参与雷达图。',
        '人格判定按源码中的条件顺序逐项匹配，命中第一条即确定类型，最后还有兜底结果。原版共 13 种类型，其中「驴德华型」和「峡谷沸羊羊」在图鉴里按隐藏人格处理，命中后可查看自己的类型。',
      ] },
      { id: 'heroes', title: '职业倾向、英雄匹配与结果解读', paragraphs: [
        '刺客、射手、法师和辅助的倾向由选项另外计分。原版取分数最高的职业倾向，再在该人格对应的职业表里匹配英雄。平分时按源码规定的次序选择。',
        '结果页呈现人格描述、英雄解析、雷达与人格图鉴。「理论概率」来自原版页面预设的表。这些标签和结果用于游戏娱乐。',
        '首页下方展示一份预设答卷的结果。要完成 36 题并查看自己的完整图鉴，可以前往 WZTI 官网。',
      ] },
    ],
    gallery: [['wzti-home.webp', 'WZTI 标准版公开首页']],
    caption: '三道题的小测，按原版计分，答完得到一个人格和随机英雄。完整 36 题去 WZTI 官网。',
    sources: [['GitHub发布页', 'https://github.com/Belate-stay/WZTI'], ['WZTI官网', 'https://belate-stay.github.io/WZTI/']], next: 'freechat',
  },
};

export { articles } from './articles.js';
