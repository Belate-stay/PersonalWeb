// Complete original article bodies imported by scripts/import-csdn.py.
export const articleBodies = {
  "freechat-v110": {
    "html": "<p></p>\n<p></p>\n<h3 class=\"reading-section\" id=\"freechat-v110-189dc17728\"><a></a>写在前面</h3>\n<p>先自报家门：软件工程在读，还在上学，写代码主要靠 vibe coding —— 一边翻文档一边和 AI 对着改，不是什么科班老手。FreeChat 是我从零做的 AI 对话客户端，安卓端加网页端，MIT 开源、无广告。</p>\n<p>之前那篇把整体功能和设计取舍摊开讲过了，这篇不重复 —— <strong>专门聊刚发的 1.1.0</strong>：角色连上了微信，图片全量上了云，场景图、时间感知这些也一口气长了出来。<strong>功能大多是「够用」级别的</strong>，哪里做得不对、实现得不合理，非常欢迎评论区指正。</p>\n<figure><img alt=\"FreeChat_连接微信页面\" decoding=\"async\" height=\"867\" loading=\"lazy\" src=\"@@asset:csdn-880a2c4c3e8f0cde5d65.webp@@\" width=\"1422\"/></figure>\n<h3 class=\"reading-section\" id=\"freechat-v110-398a60edf3\"><a></a>一、这次 1.1.0 更新了什么</h3>\n<table><thead><tr><th>方向</th><th>更新</th></tr></thead><tbody><tr><td>拟人</td><td>连接微信（Beta）、主动智能（Beta）、生成当前场景图、原文学习、时间感知、回复缓冲、深度推演上微信</td></tr><tr><td>数据</td><td>图片全量云同步、附件进上下文、在线网页分享、建议与反馈</td></tr><tr><td>搜索</td><td>搜索源可自定义 + 免费 AnySearch，引用来源进「信息源」折叠框</td></tr><tr><td>界面</td><td>图生成占位动效、自定义色彩、图标切换、问候语按时段、快速定位</td></tr><tr><td>稳定</td><td>冲突副本套娃、同步覆盖、角色作息反常等一批修复</td></tr></tbody></table>\n<p>下面挑重点说。</p>\n<h3 class=\"reading-section\" id=\"freechat-v110-c500134b45\"><a></a>二、角色连上微信了（Beta）</h3>\n<p>这次最大的一件事：<strong>拟人模式的角色可以直接加进你的微信</strong>。扫码绑定（走微信官方 ClawBot 通道）之后，打开微信就能和角色聊天 —— 分条发送、正在输入，回复机制全在云端跑，不用把 FreeChat 挂在后台。</p>\n<p>配套做了两个我觉得挺关键的机制：</p>\n<ul><li><strong>回复缓冲</strong>：你连发几条，角色会攒一攒、等你说完一次想清楚再回 —— 把「消息」从个变成「次」，少了一条对一条的问答机感。1-6 秒窗口可调、可关。</li><li><strong>打断重理解</strong>：生成到一半你又发了新消息？旧回复作废，新旧消息合在一起重新理解 —— 真人聊天本来就不会按批回。</li></ul>\n<p>顺带把微信链路的速度也提了一档（收发解耦、轮询节奏修正），首条回复明显变快。<strong>主动智能（Beta）</strong>：角色会在合适的时间自己找你说话，该不该开口由 AI 判断。此两项功能都为 Beta测试阶段，可能欠缺稳定或存在 bug。</p>\n<figure><img alt=\"FreeChat_连接微信后对话效果预览\" decoding=\"async\" height=\"2291\" loading=\"lazy\" src=\"@@asset:csdn-97e5056f7e73e229de19.webp@@\" width=\"1436\"/></figure>\n<h3 class=\"reading-section\" id=\"freechat-v110-368075187c\"><a></a>三、把剧情画出来</h3>\n<p>拟人侧这次长了三个「让角色更像人」的东西：</p>\n<ul><li><strong>生成当前场景图</strong>：把当前上下文、人设、记忆一起交给生图模型，把正在发生的剧情画出来（动作演绎 / 剧情补足档）。文字具象化，视觉冲击力确实不一样。</li><li><strong>原文学习</strong>：导入小说原文当高权重文风参考，角色的文笔贴着原作走 —— 写同人、续写的应该会喜欢。</li><li><strong>时间感知</strong>：角色与现实时间对应，有自己独立的生活与作息 —— 睡觉时段真的不回消息，醒来还会自然解释漏掉的话；历史消息带时间标注，叙事档有自己的世界历法。</li></ul>\n<p>底层的记忆也升级成<strong>四层结构</strong>（主线剧情 / 细节 / 全局 / 感知），删掉的消息会连带失效相关记忆，不会「记得没发生过的事」。<strong>深度推演</strong>（先想清楚再开口）现在微信端也在跑。</p>\n<figure><img alt=\"FreeChat_生成当前场景图效果预览\" decoding=\"async\" height=\"2248\" loading=\"lazy\" src=\"@@asset:csdn-75c9f8af18fceb8ea000.webp@@\" width=\"1280\"/></figure>\n<h3 class=\"reading-section\" id=\"freechat-v110-5b61073a30\"><a></a>四、数据上云，分享出圈</h3>\n<ul><li><strong>图片全量云同步</strong>：用户上传的、AI 生成的、场景图、头像，全部自动上云（内容寻址去重，128MB），换设备不丢图。</li><li><strong>在线网页分享</strong>：对话一键生成网页链接，对方不用装 FreeChat 就能看；「我的分享」里随时撤销。</li><li><strong>建议与反馈</strong>接通了后端，不登录也能提交，能查「我的反馈」历史。</li><li><strong>附件进上下文</strong>：txt / md / json 等文档直接读给模型，长对话也能随时调取资料。</li><li><strong>搜索源</strong>：可自行添加搜索源 API（内置免费 AnySearch），引用来源收进「信息源」折叠框，正文保持干净。</li></ul>\n<h3 class=\"reading-section\" id=\"freechat-v110-2490b165fe\"><a></a>五、看得见的变化</h3>\n<ul><li>图片生成的<strong>占位动效</strong>重做：渐变流动色带、粒子柔光、文字淡化，生成中的等待也好看</li><li><strong>流光炫彩</strong>换了渲染方式，功耗和发热降了一截；色彩主题支持<strong>自定义色彩</strong></li><li><strong>启动器图标</strong>可切换，内置多款新图标；首页问候语按时段细分；长对话可按时间线<strong>快速定位</strong></li><li>首启使用须知改成了 Chat 主页悬浮排版；「关于作者」新增**「作者的话」**，建项初衷和开发历程全文都在里面</li></ul>\n<figure><img alt=\"FreeChat_内置图标预览\" decoding=\"async\" height=\"2334\" loading=\"lazy\" src=\"@@asset:csdn-524b4bfda2c2e3e24254.webp@@\" width=\"1280\"/></figure>\n<h3 class=\"reading-section\" id=\"freechat-v110-355b8f9bd0\"><a></a>六、稳定性</h3>\n<p>修复了一批藏得比较深的问题：登录后不断生成「冲突副本」套娃、老账号云端内容缺失、角色作息反常、同步数据被覆盖、图片引用失效、编辑人设时模拟设置被误回滚等。</p>\n<h3 class=\"reading-section\" id=\"freechat-v110-cc052d11a8\"><a></a>七、链接</h3>\n<ul><li>官网 / 网页版（ICP正在备案中，IP直连）：<br/> <a href=\"https://freechater.com\" rel=\"noopener noreferrer\" target=\"_blank\">FreeChat官方网页</a></li><li>源码 / 发布页（MIT）：<br/> <a href=\"https://github.com/Belate-stay/FreeChat\" rel=\"noopener noreferrer\" target=\"_blank\">GitHub仓库主页</a></li></ul>\n<p>安卓需要 8.0 及以上；iOS 用户可以先用网页版。内置了作者自用的模型可以直接体验，<strong>但不保证一直有额度</strong>，长期用建议自己配 key。</p>\n<h4 class=\"reading-section\" id=\"freechat-v110-445905122e\"><a></a>最后</h4>\n<p>1.1.0 之后手上还有几件想做的事，慢慢来。项目还很年轻，做得不好的地方肯定不少 —— 尤其是微信这块 Beta 功能，如果你愿意试、又恰好踩到了坑，评论区骂两句也行，刚开始写东西的人最需要这个。</p>\n<p>————————————<br/> 官网：https://freechater.com/<br/> 源码：https://github.com/Belate-stay/FreeChat/<br/> ————————————</p>",
    "sections": [
      {
        "id": "freechat-v110-189dc17728",
        "title": "写在前面"
      },
      {
        "id": "freechat-v110-398a60edf3",
        "title": "一、这次 1.1.0 更新了什么"
      },
      {
        "id": "freechat-v110-c500134b45",
        "title": "二、角色连上微信了（Beta）"
      },
      {
        "id": "freechat-v110-368075187c",
        "title": "三、把剧情画出来"
      },
      {
        "id": "freechat-v110-5b61073a30",
        "title": "四、数据上云，分享出圈"
      },
      {
        "id": "freechat-v110-2490b165fe",
        "title": "五、看得见的变化"
      },
      {
        "id": "freechat-v110-355b8f9bd0",
        "title": "六、稳定性"
      },
      {
        "id": "freechat-v110-cc052d11a8",
        "title": "七、链接"
      },
      {
        "id": "freechat-v110-445905122e",
        "title": "最后"
      }
    ],
    "wordCount": 1869,
    "imageCount": 4,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/167210312",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  },
  "freechat-origin": {
    "html": "<p>本文纯手搓，不含任何AI智能体介入。我认为这点很重要。</p>\n<hr/>\n<p></p>\n<p>关于AI文游，我第一次接触应该是在2025年初，记得很清楚，因为在高三最后一学期的开学前一夜这个时间节点上。经过一个寒假的疯狂游玩，开学前一夜注定是一个不平凡的的夜，我准备好所有作业势必在今夜一决胜负。可人到深夜，总是难免注意力不集中，不知不觉刷起了Telegram。一个“角色卡预览”的频道凭空出现在我的列表中，我大致浏览后知道这相当于是在已有的各种设定下，与AI共同书写故事发展。新用户送500积分，我挑了一个感觉还不错的角色卡随机聊了起来，可以说，当时有些颠覆了我对AI理解与创作能力的认知。并且由于Telegram独特的属性，这里的AI并没有政治、尺度等限制，比其他地方更新奇。于是我聊了一晚上，积分不够用甚至充了一百多块钱，作业也是一点都没写。</p>\n<p>但问题很明显，<strong>AI的逻辑推理能力和记忆力随聊天内容的增长而直线下降，到后面几乎每条回复都会与前文冲突</strong>。我闭上眼睛养神，大多是对作业未完成的担心。</p>\n<p></p>\n<p>后来，为了寻求更真实更高级的AI创作或AI文游，我了解到<strong>ChatBox</strong>和<strong>TavernSilly</strong>，一个是模拟对话一个是内容创作，其中TavernSilly的上限可以说是所有AI文游当中最高的，但依赖Nods.js与本地终端部署，圈内好评的同时也造成了进圈的极高门槛。每个角色卡、世界书和正则都需要大量时间去书写，每个选项和调试都可能影响回复效果，可以说自定义程度极高，也有不小的学习成本。我将其用户称为极致的极客，再看最大众的豆包智能体也形成了庞大的社区体系，大家制作的角色卡可以一键上传分享。有能教英语的教师、有温柔贤淑的知心姐姐、有肖奈大神教你计算机...但豆包在于多却实在算不上精，甚至效果比Telegram还要差一大截，角色卡可输入项与设置项少的可怜，并且存在严重的OOC（角色人设崩坏），还原效果微乎其微。</p>\n<p></p>\n<p><strong>所以我不断寻求位于TavernSilly与豆包智能体中间的市场。一个既能保留大多数设置项，又能保证角色还原效果的同时，门槛还比较低、比较方便便携、随时能聊的AI软件。</strong></p>\n<p></p>\n<p>但我从来没有了解过现有商业AI拟人陪伴类产品（如猫箱、星野等），即使我决定去做FreeChat甚至现在FreeChat即将发布第四个版本更新，我都没去了解。因为路不同，不为竞争对手，它们不是我想要的产品，我也永远不会成为它们的用户。我用某个AI类产品，首个问题可能就是“接的什么模型？”，商业产品唯一的盈利方式就是积分制从用户的Token消耗中赚取中间差价，模型不公布，实际上也不会用什么好模型（我推测可能MiniMax或者GLM概率大些，没准是某家中转站掺水的也有可能）。<span><strong>而FreeChat所走的，更像是简化的TavernSilly或ChatBox，用户自行接入API Key客户端本地直连大模型。我始终认为所有类似产品均为前端套壳与系统提示词优化，其根本决定回复效果的还是大模型的能力，所以用户大模型可控则代表着成本透明、隐私安全的同时拟人效果可控。</strong></span>当然，FreeChat对比现有安装即用的商业AI拟人陪伴类产品依然有门槛，用户需要自己去申请API Key并且本质是需要为服务付费的（即使聊个天可能只是几分几毛钱，但是似乎大众用户依然不愿意支付）。</p>\n<p></p>\n<hr/>\n<p></p>\n<p>FreeChat的制作有不小的开销，而支撑我一个普通大学生省吃俭用买Token持续Vibe Coding的原因有三：</p>\n<p>1、我自身需要一个AI拟人聊天类app，可以说FreeChat是为我个人打造的、UI符合我的审美的、所有功能都是我想要的一个产品。它开源免费，故而不需要产品经理分析市场与用户需求，因为没人用拉倒。雷总说过：悄悄做，没做成就当没做过。不鸣则已，一鸣惊人。</p>\n<p>2、作为计算机系大学生，能在大二时期做出一个项目可能会对我未来求职就业有所帮助，即使它是Vibe Coding，更何况现在还有几个传统程序员不用AI，坚持纯手搓代码的呢？</p>\n<p>3、同第二点，灵活运用AI辅助完成开发、调试、运维等，是我认为是未来程序员的重要技能。即使花销不俗也是实践学习的一种方式，我向来讨厌极具功利性的行为和思想。</p>\n<p>甚至到现在，为了降低用户使用门槛推广使用，我在FreeChat安卓客户端内部还内置了我自己的模型API，用户安装后无需配置即可使用。我当然知道Java（Kotlin）是最容易反编译的语言，若有人通过反编译工具反编译apk即可轻易的获取我自己的API Key，然后疯狂使用导致我的额度被刷爆，但我还是选择承担这种风险给用户提供。当然，即使一切顺利我也会担心未来用户数量若多了起来我总不能一直自费提供Token，而当我不再免费提供内置API Key则是否会造成用户的流失呢？这很难说，我没有信心，因为对比于自信，我更相信客观规律。</p>\n<p>所以我想大家若想体验不错的AI聊天服务，则需要花些时间稍微了解一下API的配置，它不复杂不需要多久。同时能看得清消费点和费用消耗力度。至少商业产品都能挣钱，我不盈利所有开销都是为用户自身提供AI服务，这应该更为便宜才对。</p>\n<hr/>\n<p></p>\n<p>FreeChat项目有很多难点：</p>\n<h4 class=\"reading-section\" id=\"freechat-origin-ef2b31250a\">1）Android版本发布后，iOS用户怎么用？</h4>\n<p>iOS APP的开发依赖MacOS环境，我从开发端暂时难以满足。所以我做了Web在线网页，而网页直接调用API与AI对话必定需要服务器，因为网页无法保存用户数据（聊天记录、角色提示词、图片、记忆文件等），这些需要存到云端与网页实时连接读取文件，我租了服务器，并为FreeChat的网页购买了域名（当然ICP到现在依然没有过审，个人开发者非个体工商户的产品介绍类网页很难过审，这也是一个难点）<span><em>[2026-10-16编，很幸运ICP已经过审，https://freechater.com以上线]</em></span>。并且做了账号系统去存储并保护所有用户的数据，通过服务器实现不同设备、不同端间的同步。</p>\n<p>网页版对比客户端依然有功能方面的阉割，并且依赖服务器和账号。即使用户的API Key不会上传至服务器但相对客户端依然有风险，但这已经是我目前能想到的最好的解决方案了。</p>\n<p>实际上应该也没那个有技术的黑客闲着没事攻击我这没几个用户的服务器窃取信息吧？这大概是个很愚蠢的行为吧。</p>\n<p></p>\n<h4 class=\"reading-section\" id=\"freechat-origin-24a771bcdf\">2）仅依赖模型内置数据，AI的信息严重落后，时事无法跟进获取，“联网搜索”如何做？</h4>\n<p>要么手搓爬虫脚本，面对极高的成本、法律风险和大概率搜到一堆垃圾；要么就用模型内置的联网搜索，可能会不统一因为这并非所有模型的标配内容，还可能存在接口、配置差异而调用失败，因为我不知道用户会接什么模型；第三个方案，就是当前采用的，API接口调用已有的现成资源库。一开始是SerpAPI，但它对国内访问并不友好导致开启联网搜索后AI回复基本都要几分钟，后来有试过Bing、AnySearch等，有免费额度但本质还是付费使用的。现在，做成模型<strong>内置搜索+公开网页基本检索+自定义API信息源三者结合，搜索速度、信息质量、信息全面性、信息时效性都在可接受范围内了。</strong></p>\n<p></p>\n<h4 class=\"reading-section\" id=\"freechat-origin-858b342a7c\">3）拟人模式下的角色还原、真人感等挑战？</h4>\n<p>我渴望得到比豆包强的AI拟人质量，至少在内容理解、回复逻辑、长期记忆、角色还原这四个方面做到能接受的范围，即使仅是一个前端套壳无法大幅度提升模型能力，但FreeChat还是做了不少优化：</p>\n<ul><li>\n<p>引入<span><strong>“回复缓冲”</strong></span>机制避免了在“微信聊天”模式下，AI针对用户每条信息都相应回复的一问一答的人机感，开启后设定缓冲区将用户的信息先缓存在缓冲区内，等待几秒（具体市场用户可自行修改）后一并发送给模型，既减少了API调用和Token消耗，又能使AI统一、融合思考给出更拟人化的回复。</p>\n</li><li>\n<p>引入<span><strong>“时间感知”</strong></span>，开启后角色与现实时间完全对应，并且拥有自己独立的生活与作息，更像是活生生的人。</p>\n</li><li>\n<p>引入<span><strong>“增强检索”</strong></span>和<span><strong>“深度推演”</strong></span>，前者调用模型最大上下文窗口，原文提交模型思考学习；后者将Agent工作流搬来在回复前系统性的检查逻辑与记忆是否有误。</p>\n</li><li>\n<p>引入<span><strong>“主动智能”</strong></span>，通过后台计时功能定时向模型发送上下文与请求，模型自行决定是否主动发消息、消息内容是什么。当然，后台计时并不理想，很可能因为安卓后台管理机制而被杀导致功能失效，此功能目前仅用于测试体验。在未来版本，我将寻求更“智能”的解决方案，比如云端实时推送等。</p>\n</li><li>\n<p>引入<span><strong>“连接微信”</strong></span>，将“微信聊天”模式做到极致，通过微信官方OpenClaw插件接入微信，所有机制在云端运行回复，不依赖本地。</p>\n</li><li>\n<p>引入<span><strong><span>“生成当前场景图”</span></strong></span>，将当前上下文、人物设定、角色记忆一并交给生图模型，根据当前场景生图。将文字具象化，提升视觉冲击力。</p>\n</li></ul>\n<p></p>\n<p>当然，拟人模式的优化除此之外还有记忆存储、时间轴感知、AI创造力可控等基础优化，都在后台悄无声息的运行以保障角色还原与真人感。</p>\n<p></p>\n<h4 class=\"reading-section\" id=\"freechat-origin-4feb0202eb\">4）UI页面的渲染与排版优化？</h4>\n<p>Vibe Coding我认为这点是最为痛苦的。前期我用的AI Agent是DeepSeek+Claude Code，如果让其添加某项功能那倒没什么太大问题，初版基本就能使用只需要做微调。而如果让它做UI渲染（比如卡片的哑光玻璃效果、页面间的切换动画、极具美学的视觉呈现等）它就会不知所措（尤其是我最初用的deepseek-v4-pro模型，没有视觉能力，只能根据代码盲猜），经过长期的Skill、插件和MCP的探索，并且将Agent换成Codex+gpt-6/6.1-sol之后才有明显的提升。安卓虚拟机、ADB调试反复测试UI渲染和动画效果，多次返工和修改，走来实在不易。</p>\n<hr/>\n<p></p>\n<h3 class=\"reading-section\" id=\"freechat-origin-47be18f108\">FreeChat的优势在哪儿？</h3>\n<p>其实我上文已经说了，定位于门槛低于TavernSilly、ChatBox和现阶段商用产品之间。</p>\n<p>我主要说对比现阶段商用产品吧，因为极客仍然是少数，即使有了FreeChat，我依然会使用TavernSilly和ChatBox，这并不冲突。</p>\n<ul><li>\n<p>FreeChat拥有标准模式，可以视作普通AI进行信息搜索、科普问答、数学计算、文档生成与图像生成等。</p>\n</li><li>\n<p>FreeChat的模型由用户自行配置，模型可控意味着成本透明、AI性能可控、本地模式下用户数据安全。</p>\n</li><li>\n<p>还有一条最容易被忽视，也是我认为最重要的一条：<span><strong>FreeChat作为免费开源项目，不商用不盈利无广告，所有出发点均是打造更好的体验而非赚取更多的利润，这是FreeChat与市面商用产品的本质差别。当然作为开源软件我也希望能有更多共创者、提出建议者，无团队仅一人可以直接和我沟通交友。</strong></span></p>\n</li></ul>\n<p></p>\n<hr/>\n<p></p>\n<p>至此，我与AI文游的认识与熟悉、FreeChat整个建项原因和制作过程都已分享。开源项目并不求多少Star（当然还是越多越好），也不在多少用户，本质还是为我个人深度定制的app。若能因此交友、获取成就，都是额外收获。</p>\n<h3 class=\"reading-section\" id=\"freechat-origin-0dbb37de2d\">人所经历均有意，抛开明确的目的，感受生活的每个角角落落，即使是花钱打水漂、打游戏、刷视频。永远相信美好的事情即将发生！</h3>",
    "sections": [
      {
        "id": "freechat-origin-ef2b31250a",
        "title": "1）Android版本发布后，iOS用户怎么用？"
      },
      {
        "id": "freechat-origin-24a771bcdf",
        "title": "2）仅依赖模型内置数据，AI的信息严重落后，时事无法跟进获取，“联网搜索”如何做？"
      },
      {
        "id": "freechat-origin-858b342a7c",
        "title": "3）拟人模式下的角色还原、真人感等挑战？"
      },
      {
        "id": "freechat-origin-4feb0202eb",
        "title": "4）UI页面的渲染与排版优化？"
      },
      {
        "id": "freechat-origin-47be18f108",
        "title": "FreeChat的优势在哪儿？"
      },
      {
        "id": "freechat-origin-0dbb37de2d",
        "title": "人所经历均有意，抛开明确的目的，感受生活的每个角角落落，即使是花钱打水漂、打游戏、刷视频。永远相信美好的事情即将发生！"
      }
    ],
    "wordCount": 4364,
    "imageCount": 0,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/167206437",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  },
  "freechat-open-source": {
    "html": "<p>本文主要介绍了一款由软件工程在读学生独立开发的开源 AI 对话客户端项目——<strong>FreeChat</strong>。该项目旨在提供一个无广告、跨平台（安卓与网页）且高度可定制的本地化 AI 交互工具，其核心设计理念在于通过“双模式”架构，满足用户在不同场景下对大语言模型（LLM）的差异化需求：既可作为高效的生产力工具，亦可作为具备情感记忆的虚拟伴侣 。</p>\n<h4 class=\"reading-section\" id=\"freechat-open-source-6a9a22087c\">项目架构与技术栈概况</h4>\n<p>FreeChat 采用了前后端分离的轻量化架构，强调数据的本地主权与服务的可自建性。在客户端层面，安卓端基于 <strong>Kotlin + Jetpack Compose</strong> 构建，确保了原生性能与丰富的 UI 交互体验；网页端则采用 <strong>Vite + React + Zustand</strong> 技术栈，利用 IndexedDB 实现浏览器端的离线数据存储，无需安装即可运行。服务端设计极为精简，仅使用 <strong>Node.js</strong>（零第三方依赖）配合 <strong>SQLite</strong> 数据库，专注于账号管理与文本同步，不支持复杂的业务逻辑下沉，从而降低了部署门槛并保障了用户隐私。这种架构选型体现了开发者在资源受限条件下对“够用”原则的精准把控，即在不牺牲核心功能的前提下，最大化系统的可维护性与透明度 。</p>\n<h4 class=\"reading-section\" id=\"freechat-open-source-262afa8357\">核心功能：双模式引擎设计</h4>\n<p>项目的创新点集中体现在其独特的“双模式”交互引擎上，分别对应工具理性与情感拟人两种范式：</p>\n<table><thead><tr><th>模式类型</th><th>核心定位</th><th>关键特性</th><th>应用场景</th></tr></thead><tbody><tr><td><strong>标准模式</strong></td><td>把模型当工具</td><td>支持流式输出、深度思考、多模态（识图/生图）；原生生成可编辑的 OOXML 文档（docx/xlsx/pptx）。</td><td>代码辅助、文档撰写、数据分析、图像生成等生产力任务。</td></tr><tr><td><strong>拟人模式</strong></td><td>把模型当人处</td><td>基于角色卡（MBTI、性格、关系）；支持三种对话形态（微信聊天、动作演绎、剧情补足）；具备动态记忆与关系演进机制。</td><td>角色扮演（RP）、情感陪伴、互动小说创作、心理模拟实验。</td></tr></tbody></table>\n<p>在标准模式下，系统不仅支持自定义 API 端点与参数微调（如温度、系统提示词），更实现了真正的文档生成能力。不同于常见的将文档渲染为图片的做法，FreeChat 直接操作 OOXML 协议，生成的文件包含真实的文字、表格与形状对象，可直接在 Office 软件中二次编辑，极大地提升了工作流的连贯性 。</p>\n<p>而在拟人模式中，系统摒弃了传统的数值化好感度体系（如 0-100 的进度条），转而采用<strong>上下文驱动的关系演化机制</strong>。开发者认为，真实的人际关系并非线性数值的累加，而是基于语境与互动的动态判断。因此，该模式通过让模型结合人设与历史对话自行推断亲疏关系，避免了因数值阈值导致的交互僵化。此外，记忆系统分为“主线长期注入”与“细节滚动淘汰”两层，并可选配“增强检索”或“深度推演”功能，前者通过 RAG 技术注入相关原文，后者则在回复前增加一轮模型自我反思过程，虽增加了 API 调用成本，但显著提升了角色扮演的逻辑自洽性与沉浸感 。</p>\n<h4 class=\"reading-section\" id=\"freechat-open-source-ec002d445b\">设计取舍与隐私策略</h4>\n<p>在项目演进过程中，开发者做出了一系列具有工程哲学意味的取舍。例如，在实现\"AI 主动性”（即 AI 主动发起对话）功能时，并未采用高成本的服务端推送方案，而是设计了“服务器计算 + 本地唤醒”的协同机制。手机作为闹钟触发请求，服务端负责决策内容，这种设计虽然受限于操作系统的省电策略可能导致时间偏差，但有效规避了推送通道的复杂性与隐私泄露风险。</p>\n<p>数据隐私方面，FreeChat 坚持<strong>默认本地存储</strong>原则。用户无需登录即可完整使用所有功能，数据仅留存于设备本地（网页端为 IndexedDB）。登录同步功能仅作为多设备续聊的补充手段，且明确约定<strong>API Key 不参与云端同步</strong>，彻底杜绝了密钥泄露的隐患。这种“去中心化”的数据管理策略，契合了当前用户对 AI 应用隐私安全的深层焦虑，也为高级用户自建服务端提供了充分的灵活性 。</p>\n<p>综上所述，FreeChat 不仅是一个功能完备的 AI 客户端原型，更是一次关于“人机关系”的技术实验。它通过精细化的模式划分与克制的技术选型，探索了在移动端实现高质量、高隐私、高自由度 AI 交互的可行路径。</p>\n<hr/>\n<h3 class=\"reading-section\" id=\"freechat-open-source-1e938d9640\">参考来源</h3>\n<ul><li><a href=\"https://blog.csdn.net/weixin_51354748/article/details/166001635\" rel=\"noopener noreferrer\" target=\"_blank\">一个学生做的AI聊天客户端：FreeChat的双模式设计</a></li></ul>\n<p> </p>",
    "sections": [
      {
        "id": "freechat-open-source-6a9a22087c",
        "title": "项目架构与技术栈概况"
      },
      {
        "id": "freechat-open-source-262afa8357",
        "title": "核心功能：双模式引擎设计"
      },
      {
        "id": "freechat-open-source-ec002d445b",
        "title": "设计取舍与隐私策略"
      },
      {
        "id": "freechat-open-source-1e938d9640",
        "title": "参考来源"
      }
    ],
    "wordCount": 1618,
    "imageCount": 0,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/166138976",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  },
  "freechat-dual-mode": {
    "html": "<p></p>\n<p></p>\n<h3 class=\"reading-section\" id=\"freechat-dual-mode-189dc17728\"><a></a>写在前面</h3>\n<p>先自报家门：软件工程在读，还在上学，写代码主要靠 vibe coding —— 一边翻文档一边和 AI 对着改，不是什么科班老手。FreeChat 是我从零做的一个 AI 对话客户端，安卓端加网页端，MIT 开源、无广告。</p>\n<p>这篇文章主要是把功能和几个设计取舍摊开讲讲，也算给自己这段时间做个记录。<strong>功能大多是「够用」级别的，跟成熟产品没法比</strong>，哪里做得不对、实现得不合理，非常欢迎评论区指正。</p>\n<div><figure><img alt=\"FreeChat官方网页首页\" decoding=\"async\" height=\"918\" loading=\"lazy\" src=\"@@asset:csdn-dac702946e7397fadc5f.webp@@\" width=\"1600\"/></figure><br/> <figure><img alt=\"FreeChat官方网页聊天页\" decoding=\"async\" height=\"917\" loading=\"lazy\" src=\"@@asset:csdn-009d383f3638cc52b791.webp@@\" width=\"1600\"/></figure></div>\n<figure><img alt=\"FreeChat客户端主页面\" decoding=\"async\" height=\"2732\" loading=\"lazy\" src=\"@@asset:csdn-7e0f5a79c5684f557cc2.webp@@\" width=\"1280\"/></figure>\n<h3 class=\"reading-section\" id=\"freechat-dual-mode-b0bcae1c98\"><a></a>一、项目概况</h3>\n<table><thead><tr><th>端</th><th>技术栈</th><th>说明</th></tr></thead><tbody><tr><td>安卓客户端</td><td>Kotlin + Jetpack Compose</td><td>主要入口，功能最全</td></tr><tr><td>网页版</td><td>Vite + React + zustand + IndexedDB</td><td>免安装，手机浏览器也能用</td></tr><tr><td>服务端</td><td>Node.js（零第三方依赖）+ SQLite</td><td>只负责账号与文字同步，可以自建</td></tr></tbody></table>\n<p>当前版本：安卓 <strong>1.0.64</strong> / 网页 <strong>1.1.7</strong>，MIT 协议。</p>\n<p>一句话定位：<strong>标准模式把模型当工具用，拟人模式把模型当人处</strong>。</p>\n<h3 class=\"reading-section\" id=\"freechat-dual-mode-1a49cd14f1\"><a></a>二、两种模式，两套引擎</h3>\n<h4 class=\"reading-section\" id=\"freechat-dual-mode-c94bbc6139\"><a></a>标准模式：把模型当工具</h4>\n<p>接任意 OpenAI 兼容端点，流式输出、深度思考、识图、生图、一句话生成 docx / xlsx / pptx，系统提示词 / 温度 / 长度都可以自己调。</p>\n<p>其中文档生成是原生 OOXML 拼出来的 —— <strong>产出的是真文字、真表格、真形状，不是图片拼合</strong>，下载下来可以直接编辑。</p>\n<div><figure><img alt=\"FreeChat标准模式下的代码生成\" decoding=\"async\" height=\"654\" loading=\"lazy\" src=\"@@asset:csdn-962929b47661a2e67b37.webp@@\" width=\"1064\"/></figure><br/> <figure><img alt=\"FreeChat标准模式下的图片生成\" decoding=\"async\" height=\"702\" loading=\"lazy\" src=\"@@asset:csdn-e08c82895462e5ff6185.webp@@\" width=\"1287\"/></figure><br/> <figure><img alt=\"FreeChat标准模式下的功能预览\" decoding=\"async\" height=\"1020\" loading=\"lazy\" src=\"@@asset:csdn-b54d09c2662f2b1cad09.webp@@\" width=\"1104\"/></figure></div>\n<h4 class=\"reading-section\" id=\"freechat-dual-mode-0ed0863625\"><a></a>拟人模式：把模型当人处</h4>\n<p>给角色一张卡：MBTI、性格、外观、关系、开场白。聊起来之后它自己写记忆，关系随剧情演进。</p>\n<p>对话形态分三档（在发出第一条消息前选定）：</p>\n<table><thead><tr><th>形态</th><th>说话方式</th></tr></thead><tbody><tr><td>微信聊天</td><td>一问一答、逐条回复，像在发消息</td></tr><tr><td>动作演绎</td><td>语言 + 动作 + 神态 + 心理，不写旁白</td></tr><tr><td>剧情补足</td><td>完整的小说正文，环境、旁白、记叙都写全</td></tr></tbody></table>\n<p>角色设定上还扩了三项：<strong>配角</strong>（这个世界还有谁）、<strong>规则</strong>（等级、门派、势力之类的硬设定）、<strong>用户形象</strong>（你自己是谁）。填一个知名角色的名字当参考原型，它会联网检索再补人设。</p>\n<blockquote>\n<figure><img alt=\"FreeChat拟人模式下的微信聊天\" decoding=\"async\" height=\"2537\" loading=\"lazy\" src=\"@@asset:csdn-bd7684b1b467e931029b.webp@@\" width=\"1280\"/></figure>\n</blockquote>\n<blockquote>\n<figure><img alt=\"FreeChat拟人模式下的剧情补足\" decoding=\"async\" height=\"2222\" loading=\"lazy\" src=\"@@asset:csdn-d53cc7ea4018ad12b5e5.webp@@\" width=\"1280\"/></figure>\n</blockquote>\n<h3 class=\"reading-section\" id=\"freechat-dual-mode-32b118b4a1\"><a></a>三、几个我比较在意的取舍</h3>\n<p>这部分可能比功能列表更值得聊。</p>\n<p><strong>① 关系不写数值。</strong> 一开始我也做了亲密度：0–100，按等级映射到不同的关系模板。后来发现这套东西挺别扭 —— 真实的人不会因为你说了十句话就从「陌生人」跳到「朋友」，而且等级一卡死，模型反而不敢自由发挥。现在改成<strong>不给数值、只给上下文</strong>，亲疏交给模型结合人设和剧情自己判断。可能不完美，但比数字拟真。</p>\n<p><strong>② 主动性不靠服务端推送。</strong> 「让 AI 主动找你说话」最直接的做法是服务端定时推送，但成本高，还要把消息内容交给推送通道。这里的做法是<strong>服务器当大脑、手机当闹钟</strong>：到点由手机本地唤醒，该不该说话、说什么由服务端算。代价是受系统省电策略影响，不保证分秒不差 —— 这个取舍我认，先记在这。</p>\n<p><strong>③ 记忆分两层。</strong> 对话后自动摘要，剧情主线长期注入、细节滚动淘汰。想更准可以开<strong>增强检索</strong>（把相关原文注入进去）；再上一档是<strong>深度推演</strong> —— 先让模型以角色身份想一遍再落笔，代价是每轮多一次 API 调用。</p>\n<p><strong>④ 数据默认留在本地。</strong> 不登录也能完整使用，数据只落在设备上（网页端是 IndexedDB）。登录只是为了多一个去处 —— 换设备能接着聊；同步的只有文字，<strong>API Key 不参与同步</strong>。服务端也是自己写的，可以自己搭一套。</p>\n<h3 class=\"reading-section\" id=\"freechat-dual-mode-5f97ff9813\"><a></a>四、其他细节</h3>\n<ul><li><strong>界面</strong>：流光炫彩动态光晕、拟态卡片、磨砂玻璃材质；多套配色 + 多款字体 + 三语切换</li><li><strong>模型</strong>：语言 / 生图 / 识图 / 语音合成 / 语音识别五类分别选，支持自定义 API 地址，也允许来自不同厂商</li><li><strong>账号</strong>：可以看到并管理当前登录中的设备</li><li><strong>主动性</strong>：除主动智能外，还有作息模拟、回复缓冲（你连发几条，等你说完再一起回）</li></ul>\n<blockquote>\n<div><figure><img alt=\"FreeChat的UI渲染效果及设置项\" decoding=\"async\" height=\"2706\" loading=\"lazy\" src=\"@@asset:csdn-a727d727ea2b51176114.webp@@\" width=\"1280\"/></figure><br/> <figure><img alt=\"FreeChat拟人模式下的角色设置项\" decoding=\"async\" height=\"2687\" loading=\"lazy\" src=\"@@asset:csdn-2902d297b70124c07373.webp@@\" width=\"1280\"/></figure><br/> <figure><img alt=\"FreeChat拟人模式下的角色设置项\" decoding=\"async\" height=\"2706\" loading=\"lazy\" src=\"@@asset:csdn-5853f0e280ef2c2e9a53.webp@@\" width=\"1280\"/></figure><br/> <figure><img alt=\"FreeChat拟人模式下的角色设置项\" decoding=\"async\" height=\"2697\" loading=\"lazy\" src=\"@@asset:csdn-cbdd1a2c12b2ab07e6d7.webp@@\" width=\"1280\"/></figure><br/> <figure><img alt=\"FreeChat拟人模式下的角色设置项\" decoding=\"async\" height=\"2694\" loading=\"lazy\" src=\"@@asset:csdn-e8ece3c3c4daaeb7f488.webp@@\" width=\"1280\"/></figure></div>\n</blockquote>\n<h3 class=\"reading-section\" id=\"freechat-dual-mode-63147e251f\"><a></a>五、链接</h3>\n<ul><li>官网 / 网页版（IP 直连，域名还在ICP备案中）：<br/> <a href=\"https://118.178.227.178/\" rel=\"noopener noreferrer\" target=\"_blank\">FreeChat官方网站</a></li><li>源码 / 发布页（MIT）：<br/> <a href=\"https://github.com/Belate-stay/FreeChat\" rel=\"noopener noreferrer\" target=\"_blank\">GitHub仓库</a></li></ul>\n<p>安卓需要 8.0 及以上；iOS 用户可以先用网页版。内置了作者自用的模型可以直接体验，<strong>但不保证一直有额度</strong>，长期用建议自己配 key。</p>\n<h3 class=\"reading-section\" id=\"freechat-dual-mode-445905122e\"><a></a>最后</h3>\n<p>项目还很年轻，做得不好的地方肯定不少。如果它对你有点用，或者你在里面看到什么「明明可以做得更好」的地方，欢迎评论区聊 —— 尤其是批评，刚开始写东西的人最需要这个。</p>\n<p>============================================</p>\n<p>官网：https://118.178.227.178/<br/> 源码：https://github.com/Belate-stay/FreeChat/</p>\n<p>============================================</p>",
    "sections": [
      {
        "id": "freechat-dual-mode-189dc17728",
        "title": "写在前面"
      },
      {
        "id": "freechat-dual-mode-b0bcae1c98",
        "title": "一、项目概况"
      },
      {
        "id": "freechat-dual-mode-1a49cd14f1",
        "title": "二、两种模式，两套引擎"
      },
      {
        "id": "freechat-dual-mode-c94bbc6139",
        "title": "标准模式：把模型当工具"
      },
      {
        "id": "freechat-dual-mode-0ed0863625",
        "title": "拟人模式：把模型当人处"
      },
      {
        "id": "freechat-dual-mode-32b118b4a1",
        "title": "三、几个我比较在意的取舍"
      },
      {
        "id": "freechat-dual-mode-5f97ff9813",
        "title": "四、其他细节"
      },
      {
        "id": "freechat-dual-mode-63147e251f",
        "title": "五、链接"
      },
      {
        "id": "freechat-dual-mode-445905122e",
        "title": "最后"
      }
    ],
    "wordCount": 1758,
    "imageCount": 13,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/166001635",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  },
  "freechat-launch": {
    "html": "<p>计算机专业大二学生利用AI做项目：</p>\n<h4 class=\"reading-section\" id=\"freechat-launch-cbca257c40\"><strong>FreeChat 【目前仅支持安卓(Android)环境】</strong></h4>\n<p> </p>\n<p>「两种模式」——一个当<strong>全能 AI 助手</strong>，一个当你的<strong>专属 AI 陪伴</strong>，一个顶俩，真的太上头了👇</p>\n<p> </p>\n<hr/>\n<h4 class=\"reading-section\" id=\"freechat-launch-e3ebf6c49a\">💕 <strong>拟人陪伴模式（我的最爱）</strong></h4>\n<p>不是冷冰冰的机器人，是能「活过来」的角色：</p>\n<p>· <strong>自己捏人设</strong>：头像、名字、性别、年龄、MBTI 十六型、性格全都自己定</p>\n<p>· <strong>它有记忆</strong>：你随口说过的事它都记得，聊得越久越懂你</p>\n<p>· <strong>它有情绪</strong>：会开心、会生气、会吃醋，连回复节奏都跟着心情走</p>\n<p>·<strong> 关系会进展</strong>：亲密度随聊天涨跌，从朋友一路聊成恋人都有可能</p>\n<p>· <strong>剧情模式</strong>：小说式陪你演，霸道总裁、温柔学长随你设定</p>\n<p>· <strong>会睡觉会醒</strong>：有作息模拟，醒来还会解释昨晚为啥没回你</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2537\" loading=\"lazy\" src=\"@@asset:csdn-deb07d765749d10184bf.webp@@\" width=\"1280\"/></figure>\n<p> </p>\n<hr/>\n<h4 class=\"reading-section\" id=\"freechat-launch-5cfe78d67a\">🤖<strong> 标准模式（工作学习全能手）</strong></h4>\n<p>联网搜索、AI 生图、识图、一句话生成 Word/PPT/Excel、语音聊天……日常刚需它基本全包了。</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"1514\" loading=\"lazy\" src=\"@@asset:csdn-7cc3649b9434eaee1ead.webp@@\" width=\"1107\"/></figure>\n<p> </p>\n<hr/>\n<p>🔌 <strong>模型自己掌控</strong></p>\n<p>语言 / 生图 / 识图 / TTS / ASR 五类模型全都能接自己的 API Key，自带几个作者自用模型可以白嫖体验。聊天数据全存本地、不上传，隐私这块很安心。</p>\n<p> </p>\n<hr/>\n<p>🎨 <strong>颜值也在线</strong></p>\n<p>磨砂玻璃质感、多套主题配色、多款字体、简中 / 繁中 / 英文三语切换，用起来是真舒服。</p>\n<p> </p>\n<hr/>\n<h3 class=\"reading-section\" id=\"freechat-launch-43cc7be556\">📍 <strong>下载方式</strong></h3>\n<p>见下方链接 或 GitHub 搜「Belate-stay / FreeChat」</p>\n<p><strong>【目前仅支持安卓(Android)环境】</strong></p>\n<p> </p>\n<p><strong>下载链接：</strong></p>\n<p><u>https://github.com/Belate-stay/FreeChat/releases</u></p>\n<p><a href=\"https://github.com/Belate-stay/FreeChat/releases\" rel=\"noopener noreferrer\" target=\"_blank\">下载链接<br/> </a><br/> <br/>  </p>\n<p><strong>仓库主页：</strong></p>\n<p><u>https://github.com/Belate-stay/FreeChat</u></p>\n<p><a href=\"https://github.com/Belate-stay/FreeChat\" rel=\"noopener noreferrer\" target=\"_blank\">仓库主页<br/> </a><br/> <br/>  </p>\n<p><strong>作者主页：</strong></p>\n<p><u>https://github.com/Belate-stay</u></p>\n<p><a href=\"https://github.com/Belate-stay/\" rel=\"noopener noreferrer\" target=\"_blank\">作者主页<br/> </a><br/> <br/>  </p>\n<p><strong>CSDN主页资源中也有安装包，可直接下载</strong>（但后续更新可能会有滞后，建议优先选择从Github获取）。</p>\n<hr/>\n<p> </p>\n<p><strong>完全免费开源，无广告无病毒不商用不盈利</strong>，安卓手机感兴趣的可以下载试试，后续会持续更新修补完善功能与细节，欢迎给出优化建议与bug反馈。我Vibe Coding做的第一个软件。</p>\n<p> </p>",
    "sections": [
      {
        "id": "freechat-launch-cbca257c40",
        "title": "FreeChat 【目前仅支持安卓(Android)环境】"
      },
      {
        "id": "freechat-launch-e3ebf6c49a",
        "title": "💕 拟人陪伴模式（我的最爱）"
      },
      {
        "id": "freechat-launch-5cfe78d67a",
        "title": "🤖 标准模式（工作学习全能手）"
      },
      {
        "id": "freechat-launch-43cc7be556",
        "title": "📍 下载方式"
      }
    ],
    "wordCount": 819,
    "imageCount": 2,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/164450074",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  },
  "ai-road": {
    "html": "<p>本文纯手搓，不含任何AI智能体介入。我认为这点很重要。</p>\n<hr/>\n<p>2025年可以说是国内AI大模型元年，或许腾讯元宝在此之前就已经推出自研大模型，但真正大规模传播的还是DeepSeek R1。自2025年6月份高考之后，豆包成为我日常使用最多的软件之一。我可以问它天文地理、人文科学甚至培养情感，有那么一瞬我觉得AI真的能共情人的情感，因其极致的表达能力总能一语命中我难以诉说的心灵感觉。</p>\n<p></p>\n<p>半年之后，去年年底，豆包的智力直线下降，频繁出现遗忘、口胡、重复性字眼等问题，使我迫切的学习相关知识并寻找其替代产品。至今，我手机上装有豆包、DeepSeek、Grok、Gemini、Claude、ChatGPT这六大AI软件，说哪个绝对牛逼全方位领先显然是不客观的，他们有各自的应用场景和独特优势，要根据不同问题针对性的提问解决：</p>\n<p>豆包的拍照解题功能比较方便，在应付大学作业时也不会特别在意正确率；</p>\n<p>DeepSeek的逻辑推理能力和信息检索的准确性都不错，且省去了科学上网的步骤，使我在应对绝大多数问题时都会优先考虑DeepSeek；</p>\n<p>Grok及其松懈的防护墙使我可以询问一些政治敏感或者成人取向的问题，当然Grok背后有X的信息作为支撑，了解整理国际新闻也是首屈一指的存在；</p>\n<p>Gemini我认为是综合最为好用的AI，尽管网络上越来越多人吐槽其“降智”、“美国豆包”，但依托于Alphabet强大的生态链，其在安卓手机、Youtube、Chrome、Gmail等软件中能建立起无缝衔接的工作流，并且全生态模型，在绘图和前端设计等方面依然是独一档的存在。</p>\n<p>自从ChatGPT Image 2.0发布后，ChatGPT则承包了我所有的生图任务，客观的说，在光影渲染、人物刻画以及字体形状的全方位超越了Nano banana Pro，AI生图以假乱真的时代真的来了。</p>\n<p>Claude的回复风格使我最喜欢的，但是其极高的使用门槛、封号概率和极其高昂的费用迫使我却步，只能偶尔用一下免费的Sonnet模型。</p>\n<p></p>\n<h4 class=\"reading-section\" id=\"ai-road-937f3b97a0\"><strong>至此，我对AI的认知有了一个大的进步——API是通往自由的AI世界的钥匙</strong></h4>\n<hr/>\n<p>我不了解老师说的Coze是什么，我捣鼓着我认为最好的Agent——Claude Code和Codex。</p>\n<p>Claude Code + DeepSeek V4 Pro + VS Code，这一套组合拳下来基本上奠定了我Vibe Coding的基础，我分别用了channel和cc-connect让Claude Code接入微信的ClawBot，但实际上效果都不太理想。Channel用于聊天效果还不错，其可以提供非常拟人化的聊天式的回复，幽默、会玩梗、有情绪，但对于未登录用户Channel掉线的概率相当于我期末高数挂科的概率，终端一关就再也连不上了。而cc-connect简直是一坨屎，全方位拉完了。接入ClawBot显然是难以想OpenClaw一样远程指挥Claude Code生产的，所以我认为还是电脑舒服，嗯。</p>\n<p></p>\n<p>我用这套组合拳写了一个网页，加入了不少Github上流行的Skills，大多是前端设计美化页面的，网页整体我觉得也还说得过去。可以说，Vibe Coding对前端冲击力自然是不小的，至少能让无代码者或低代码者实际参与到开发工作中去，用自然语言表达想法，AI去落地实现。当时SBTI突奇爆火，于是作为王者荣耀玩家与MBTI感冒者，我结合两者并以SBTI这种抽象搞怪的风格创作了“WZTI-王者荣耀人格测试”，本质上只是一个HTML文件，一千多行代码，但整体的算法优化还是有参与的。我学着将它部署到Github上，实际上在此之前我并不知道何为“代码托管”一次，然后在小红书等平台发布。实话讲，效果一般。用户太少并且前期存在着大量问题，甚至引发了“性别对立”的问题，我连夜修改出新版本，从题目、选项、属性、人格、判定条件等等全方面革新，新版本还算稳定。</p>\n<p></p>\n<p>当然，这东西初衷就是为了抽象和搞怪，并且丰富我Vibe Coding的经验，我想并不能要求它在精准度上与MBTI一样能精准判断。</p>\n<p></p>\n<p>项目期间呢，某次Xiaomi Mimo V2.5 Pro大降价，作为米粉自然要体验下粗粮厂自研的大模型到底什么水平，是否达到了其发布会雷军展示的Artificial Analysis榜单中全球第5名的智能指数。当机立断，我给Mimo充了50元钱的API，并与以往一样接入Claude Code完成我的Vibe Coding。多智能我倒是没体验出来与DeepSeek V4 Pro的差别，倒是他妈的一天就花了47块钱，要知道同样的工作流原来的DeepSeek日均不过5块钱。总而言之，Mimo的tokens不知道都用在哪儿了，同一个Agent同一个工作流词元消耗速度是DeepSeek的几十倍，特别是命中缓存。气的我又去网上痛骂雷军，这万恶的资本家！</p>\n<p></p>\n<p>当然，API还有还有更多接发，比如ChatBox以及我之前非常感冒的SillyTavern酒馆，我想这个对于文游行业都算是比较权威的。当然还能接入飞书、钉钉、Telegram等破解更为有趣的玩法。</p>\n<hr/>\n<p><strong>当然我想说的是AI时代要注意隐私保护和法律风险。</strong>去年听说有类似于酒馆的AI文游平台对DeepSeek R1进行破甲涉黄被捕；OpenClaw的权利过大问题也引发了网友的广泛讨论。API调用难免引发种种问题，先进模型定价较高也引发了众多中转站的诞生，我从某个中转站看到了离谱的Opus 4.7模型输出仅¥6/1Mtokens，而输入与缓存整体才几毛钱，对比Anthropic原价便宜了几百倍。我想着其中必有猫腻，难免少不了偷调模型、额外tokens消耗、隐私泄露等种种问题。总而言之，时代的风控必有新兴产业，也总会有人在规模到来之前法律到来之前狠狠捞一笔，还是要注意防范。</p>",
    "sections": [
      {
        "id": "ai-road-937f3b97a0",
        "title": "至此，我对AI的认知有了一个大的进步——API是通往自由的AI世界的钥匙"
      }
    ],
    "wordCount": 2337,
    "imageCount": 0,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/162245377",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  },
  "doubao-analysis": {
    "html": "<p>该文档核心议题在于对豆包 AI 智能体会员服务定价（¥68/月）与其实际模型性能表现之间的性价比关系展开深度技术审计与市场对比分析。文章通过多维度的数据采样与主观体验测试，论证了当前定价策略与模型智能水平之间存在显著的不匹配现象，并提供了替代方案的技术选型建议 。</p>\n<p>在技术选型与成本效益分析方面，文本构建了详细的竞品对比矩阵。通过整合各大主流 AI 模型的接入方式、费用结构及服务能力，形成了以下对比数据，直观展示了豆包在价格定位上的相对劣势：</p>\n<table><thead><tr><th>模型名称</th><th>接入方式</th><th>费用结构</th><th>核心能力备注</th></tr></thead><tbody><tr><td><strong>豆包 (Seed 2.0 Pro)</strong></td><td>网页版/APP</td><td>¥68/月 (会员)</td><td>全模态输出，但逻辑与代码能力较弱</td></tr><tr><td><strong>DeepSeek</strong></td><td>网页版/API</td><td>免费 (V4-Flash/Pro)</td><td>文本输出为主，性价比高</td></tr><tr><td><strong>MiMo</strong></td><td>小爱/网页版</td><td>免费 (V2.5/Pro)</td><td>免费调用，具备 Pro 版本能力</td></tr><tr><td><strong>Kimi</strong></td><td>网页版/APP</td><td>额度限制免费/会员</td><td>具备额度限制的免费调用服务</td></tr><tr><td><strong>Gemini</strong></td><td>网页版/APP</td><td>约¥58/月 (会员)</td><td>价格低于豆包，性能指数更高</td></tr></tbody></table>\n<p><em>（数据源自文本中提供的官网及 APP 截图信息）</em></p>\n<p>关于文章客观性的评估，该文本采用了“客观数据 + 主观实测”的双重验证范式。在客观层面，引用了第三方测评机构（如 Artificial Analysis）的性能排名数据，指出豆包未上榜且综合智能指数低于竞品的事实依据。在主观层面，作者通过具体的对话日志截图，列举了模型在逻辑推理自洽性、上下文检索稳定性、信息收集准确性以及表达方式专业性四个维度的具体缺陷案例。这种基于实证截图的论证方式，在一定程度上增强了观点的可信度，避免了纯粹的情绪化宣泄。然而，文中也明确标注了主观测试均开启“深度思考功能”且无刻意引导，试图控制变量以保证测试的有效性 。</p>\n<p>就文章质量而言，该文本具备较高的结构完整性与逻辑闭环能力。文章并未单方面否定目标产品，而是辩证地分析了豆包在本土化文化理解、情绪价值供给、生态整合（抖音体系）以及多模态生成能力上的独特优势。这种 SWOT 分析式的结构（优势、劣势、机会、威胁）使得结论更具参考价值。文章最终给出了明确的用户分层建议：普通用户免费版即可满足需求，专业开发或研究用户建议转向其他模型，而内容创作者或情感交互需求者可考虑会员服务。这种基于场景化的技术建议提升了文档的可操作性 。</p>\n<p>综上所述，该文章是一篇具备较高参考价值的技术评测文档。其优势在于数据源透明（附带截图）、对比维度全面（价格、性能、场景）以及结论的辩证性。虽然在主观体验部分存在个体差异的局限性，但通过大量实例佐证与竞品横向对比，有效支撑了核心论点。对于正在评估 AI 工具选型的技术人员或普通用户而言，该文档提供了清晰的决策依据与成本预警，符合高质量技术博客的撰写规范 。</p>\n<hr/>\n<h3 class=\"reading-section\" id=\"doubao-analysis-1e938d9640\">参考来源</h3>\n<ul><li><a href=\"https://blog.csdn.net/weixin_51354748/article/details/161083733\" rel=\"noopener noreferrer\" target=\"_blank\">豆包收费¥68/月的性价比？</a></li></ul>",
    "sections": [
      {
        "id": "doubao-analysis-1e938d9640",
        "title": "参考来源"
      }
    ],
    "wordCount": 1134,
    "imageCount": 0,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/161086131",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  },
  "doubao": {
    "html": "<h2 class=\"reading-section\" id=\"doubao-7d62401996\"><strong>观点总结：</strong></h2>\n<h4 class=\"reading-section\" id=\"doubao-de0598696f\"><strong>算力和服务器本身需要成本，但¥68/月的价格与其模型能提供的智能水平完全不匹配。对比之下，我为什么不降点预算买个更好用的？</strong></h4>\n<p> </p>\n<p>豆包模型（Seed 2.0 Pro）的能力。抛开所有测评机构的分数排名不谈，主观使用上也是所有模型中最差最垫底的一档。代码编写能力近乎为0，逻辑推理能力近乎为0，上下文能力所有AI中最差，失忆与口胡也是最严重概率最高的。当然豆包是全模态的AI，不仅能文本输出，还能识图生图、PPTX或PDF的输出，即使水平很多时候还达不到能专业或生产的程度，但对比DeepSeek这种仅能文本输出的LLM还是有优势的。</p>\n<p> </p>\n<hr/>\n<h2 class=\"reading-section\" id=\"doubao-d51997fff1\"><strong>各个模型价格对比：</strong></h2>\n<ul><li>\n<h3 class=\"reading-section\" id=\"doubao-945fb0d875\"><strong>DeepSeek：</strong></h3>\n</li></ul>\n<p><em><strong>网页版/APP：</strong></em></p>\n<p>        可直接免费调用DeepSeek-V4-Flash和DeepSeek-V4-Pro。</p>\n<p><em><strong>API：</strong></em></p>\n<figure><img alt=\"\" decoding=\"async\" height=\"1729\" loading=\"lazy\" src=\"@@asset:csdn-e475b1d6b8cf213143d4.webp@@\" width=\"1426\"/></figure>\n<ul><li>\n<h2 class=\"reading-section\" id=\"doubao-e4f2bc09db\"><strong>MiMo：</strong></h2>\n</li></ul>\n<p><strong><em>小爱同学/网页版：</em></strong></p>\n<p>        可直接免费调用MiMo-V2.5和MiMo-V2.5-Pro。</p>\n<p><em><strong>API：</strong></em></p>\n<figure><img alt=\"\" decoding=\"async\" height=\"596\" loading=\"lazy\" src=\"@@asset:csdn-e563f1a9cc169acd17b7.webp@@\" width=\"1600\"/></figure>\n<p> </p>\n<ul><li>\n<h2 class=\"reading-section\" id=\"doubao-3b5199f688\"><strong>Kimi：</strong></h2>\n</li></ul>\n<p><strong><em>网页版/APP：</em></strong></p>\n<p>        有额度限制的免费调用Kimi K2.6。</p>\n<p><em><strong>会员服务：</strong></em></p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2442\" loading=\"lazy\" src=\"@@asset:csdn-6bcffab348165a174ca9.webp@@\" width=\"1420\"/></figure>\n<figure><img alt=\"\" decoding=\"async\" height=\"2454\" loading=\"lazy\" src=\"@@asset:csdn-b8271583a34a23a4e0e7.webp@@\" width=\"1419\"/></figure>\n<p> <em><strong>API：</strong></em></p>\n<figure><img alt=\"\" decoding=\"async\" height=\"1388\" loading=\"lazy\" src=\"@@asset:csdn-daed6d12b0126b143bca.webp@@\" width=\"1422\"/></figure>\n<p> </p>\n<ul><li>\n<h2 class=\"reading-section\" id=\"doubao-b4e29990a2\"><strong>Gemini：</strong></h2>\n</li></ul>\n<p><strong><em>网页版/APP：</em></strong></p>\n<p>        有额度限制的免费调用Gemini 3.1 Pro/Gemini 3 Flash</p>\n<p><strong><em>会员服务：</em></strong></p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2963\" loading=\"lazy\" src=\"@@asset:csdn-1bea3816e5748bf69c0e.webp@@\" width=\"1440\"/></figure>\n<p> <em>（折合人民币大约¥58/月）</em></p>\n<p> </p>\n<h4 class=\"reading-section\" id=\"doubao-3f6219e15b\"><strong>可见豆包68¥/月的定价是要大于大多数AI智能体的，在国内众多AI的价格可以说是遥遥领先了。</strong></h4>\n<p><em>（数据来源均从官网/官方APP截取）</em></p>\n<p> </p>\n<hr/>\n<h2 class=\"reading-section\" id=\"doubao-7a207275d3\"><strong>各个模型性能对比：</strong></h2>\n<p> </p>\n<h3 class=\"reading-section\" id=\"doubao-4dbb04239f\"><strong>客观：</strong></h3>\n<figure><img alt=\"\" decoding=\"async\" height=\"880\" loading=\"lazy\" src=\"@@asset:csdn-448bc133d64593bb0174.webp@@\" width=\"1600\"/></figure>\n<p> <em>（数据来源：Artificial Analysis官网）</em></p>\n<p> </p>\n<h4 class=\"reading-section\" id=\"doubao-1a7227c596\"><strong>可见豆包并未上榜，其综合性能、智能指数远不如以上列举的更为便宜的Gemini、DeepSeek、MiMo、Kimi，而更贵的Claude和ChatGPT则可提供更为强大的模型算力用于专业创作、学术研究或复杂工作，我并不认为豆包在这些方面具备任何优势能打动用户花为豆包花更多的钱。</strong></h4>\n<p> </p>\n<p> </p>\n<h3 class=\"reading-section\" id=\"doubao-40d38e9103\"><strong>主观</strong>：</h3>\n<p>根据我对不同AI的使用能明显感觉到：对比其他大模型，<u><strong>豆包在逻辑推理、上下文检索、信息/数据收集和表达方式这四方面大幅落后或有明显缺陷</strong></u>。既是使用后的主观感受，那我就不过多地举出实例和对比了。</p>\n<p> </p>\n<ul><li>\n<h4 class=\"reading-section\" id=\"doubao-ee7ec02df8\"><strong>逻辑推理：</strong></h4>\n</li></ul>\n<p>在很多时候会出现逻辑不自洽、相互矛盾等情况。</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2833\" loading=\"lazy\" src=\"@@asset:csdn-57215119257a7bd40744.webp@@\" width=\"1440\"/></figure>\n<p><em>（所有例举出的对话均已开启深度思考功能。无刻意引导，都是真实、有效的用户体验。）</em></p>\n<p> </p>\n<ul><li>\n<h4 class=\"reading-section\" id=\"doubao-00e574526b\"><strong>上下文检索：</strong></h4>\n</li></ul>\n<p>上文与下文毫无关系甚至相互矛盾、经常失忆。</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2033\" loading=\"lazy\" src=\"@@asset:csdn-cd47590df70261dd6447.webp@@\" width=\"1422\"/></figure>\n<p>我在新对话建立之初就会给它下定义，告诉他我的一些基本信息、性格偏向，规定它的输出风格并告诉他该对话主要干什么。但他总记不住这些内容，一再强调后他还是会按照模型原有的方式输出。</p>\n<p> </p>\n<ul><li>\n<h4 class=\"reading-section\" id=\"doubao-552148ce5d\"><strong>信息/数据收集：</strong></h4>\n</li></ul>\n<p><strong>信息收集不够准确，且十分容易受用户反面情绪引导或干扰，当你反问/质疑他的信息时，很可能就改变答案了。数据容易错误不说而且还制造前后逻辑链让你觉得有迹可循有理可依的样子。</strong></p>\n<figure><img alt=\"\" decoding=\"async\" height=\"1942\" loading=\"lazy\" src=\"@@asset:csdn-bb841c8c175963ee539c.webp@@\" width=\"1438\"/></figure>\n<figure><img alt=\"\" decoding=\"async\" height=\"4329\" loading=\"lazy\" src=\"@@asset:csdn-6231f702a1f45e8a2265.webp@@\" width=\"1440\"/></figure>\n<p> <em>（所有例举出的对话均已开启深度思考功能。无刻意引导，都是真实、有效的用户体验。）</em></p>\n<p> </p>\n<ul><li>\n<h4 class=\"reading-section\" id=\"doubao-16c16718df\"><strong>表达方式：</strong></h4>\n</li></ul>\n<p>这一点已经被大众广泛讨论了。对于错误数据能认错是好事，可认<strong>错后依旧胡扯，再给你来一堆没用的废话。过于迎合用户甚至将用户情绪定为高于客观事实</strong>，属实是给人哄成胚胎了。属实是难以用于专业和生产。</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2100\" loading=\"lazy\" src=\"@@asset:csdn-3b194caa8512bb6dd976.webp@@\" width=\"1433\"/></figure>\n<figure><img alt=\"\" decoding=\"async\" height=\"7552\" loading=\"lazy\" src=\"@@asset:csdn-e55f678587070d4411ef.webp@@\" width=\"1440\"/></figure>\n<p>有研究表明AI会主动肯定用户的观点、行为和情绪，并给予积极反馈。但实际体验下来豆包此类现象尤为严重，甚至在输出内容上尤为明显。</p>\n<p> </p>\n<p><em>（所有例举出的对话均已开启深度思考功能。无刻意引导，都是真实、有效的用户体验。）</em></p>\n<p> </p>\n<hr/>\n<h2 class=\"reading-section\" id=\"doubao-c6b5e30240\"><strong>那豆包就全是缺陷，没优势吗？</strong></h2>\n<p> </p>\n<h3 class=\"reading-section\" id=\"doubao-03424c9c54\"><strong>当然不是！</strong></h3>\n<p> </p>\n<p>    1、豆包是<strong>国内知名度最高、用户量最多、普适度最广</strong>的AI智能体，用户年龄上到六七十岁下到十几岁。融入国内最大的视频平台—抖音，有强大的生态和稳定的客流。</p>\n<p>    2、过于迎合用户在专业领域是缺点，但在<strong>日常生活、情感等方面的交流时则更能凸显出其共情能力和情绪价值供给</strong>。</p>\n<p>    3、豆包作为中国本土的LLM并拥有庞大数据训练，使得豆包在<strong>中国本土文化、中国社会价值以及中文输出</strong>方面形成独特的优势。</p>\n<p>    4、智能体自定义训练和分享。简化了训练AI的难度，使得普通用户也能轻松设定个性化的AI智能体，并快捷分享。</p>\n<p>    5、基于字节跳动的基础设施建设和算力布局，豆包<strong>服务器稳定（某公司请反思这点）且使用门槛极低</strong>，随时随地基本都可以展开畅聊。</p>\n<p><strong>当然，对比某些AI，多模态也是一项优势，并且起到决定性作用。</strong></p>\n<p> </p>\n<h4 class=\"reading-section\" id=\"doubao-4fd5ac2312\"><strong>所以我认为以大多数普通用户对豆包的使用，其免费版即可满足使用需求。而对于更为专业，需要依赖AI提供开发思路、提高工作效率、完成研究报告的用户豆包或许不是一个好的选择。</strong></h4>\n<p> </p>\n<hr/>\n<h2 class=\"reading-section\" id=\"doubao-4ce45bffbc\"><strong>豆包的会员服务适合哪些人？</strong></h2>\n<p> </p>\n<ul><li>\n<h4 class=\"reading-section\" id=\"doubao-5a59e326bc\"><strong>国内视频平台视频创作者</strong></h4>\n</li></ul>\n<p>抖音主播或B站up主，可以<strong>和豆包讨论视频创作的内容、风格、话题、形式</strong>等等，也可以利用豆包全模态能力<strong>生成音频、图片或视频</strong>。可以通过豆包做<strong>简单快捷的修图、P图、剪辑等</strong>。</p>\n<p> </p>\n<ul><li>\n<h4 class=\"reading-section\" id=\"doubao-d78115d142\"><strong>偏爱豆包输出风格的重度Chat用户</strong></h4>\n</li></ul>\n<p>如果你就喜欢豆包的输出风格不需要客观回复、深度分析和专业生产，或者已经和豆包日久生情、私定终身。毕竟充个会员还是要比交友、恋爱省钱的多。</p>\n<p> </p>\n<ul><li>\n<h4 class=\"reading-section\" id=\"doubao-d1ba148e88\"><strong>钱多的不知道干点啥的人</strong></h4>\n</li></ul>\n<p>有钱任性，不多解释。</p>\n<p> </p>\n<hr/>\n<h4 class=\"reading-section\" id=\"doubao-b3c73229de\">最后，看看其他各大AI智能体对豆包基础会员收费¥68/月的看法（仅供娱乐）：</h4>\n<p> </p>\n<p>ChatGPT</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2516\" loading=\"lazy\" src=\"@@asset:csdn-7dbe1456c9c7fabec905.webp@@\" width=\"1440\"/></figure>\n<p> </p>\n<p>Claude：</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"3273\" loading=\"lazy\" src=\"@@asset:csdn-e08945ec83fee39b787d.webp@@\" width=\"1440\"/></figure>\n<p> </p>\n<p>Gemini：</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2349\" loading=\"lazy\" src=\"@@asset:csdn-1d96dce8ced82c8363f5.webp@@\" width=\"1440\"/></figure>\n<p> </p>\n<p>Grok：</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2326\" loading=\"lazy\" src=\"@@asset:csdn-53dc53b806fbcf4d5d80.webp@@\" width=\"1428\"/></figure>\n<p> </p>\n<p>Kimi：</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"3473\" loading=\"lazy\" src=\"@@asset:csdn-eb4dfd6e381ecb0ad996.webp@@\" width=\"1440\"/></figure>\n<p> </p>\n<p>DeepSeek：</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2961\" loading=\"lazy\" src=\"@@asset:csdn-f4627a5d6c49315259ea.webp@@\" width=\"1440\"/></figure>\n<p> </p>\n<p>MiMo：</p>\n<figure><img alt=\"\" decoding=\"async\" height=\"2749\" loading=\"lazy\" src=\"@@asset:csdn-f65ec3403e23c07a0377.webp@@\" width=\"1440\"/></figure>\n<hr/>\n<p> </p>\n<p> <em>（以上内容均只代表个人观点，理性讨论。）</em></p>\n<p> </p>",
    "sections": [
      {
        "id": "doubao-7d62401996",
        "title": "观点总结："
      },
      {
        "id": "doubao-de0598696f",
        "title": "算力和服务器本身需要成本，但¥68/月的价格与其模型能提供的智能水平完全不匹配。对比之下，我为什么不降点预算买个更好用的？"
      },
      {
        "id": "doubao-d51997fff1",
        "title": "各个模型价格对比："
      },
      {
        "id": "doubao-945fb0d875",
        "title": "DeepSeek："
      },
      {
        "id": "doubao-e4f2bc09db",
        "title": "MiMo："
      },
      {
        "id": "doubao-3b5199f688",
        "title": "Kimi："
      },
      {
        "id": "doubao-b4e29990a2",
        "title": "Gemini："
      },
      {
        "id": "doubao-3f6219e15b",
        "title": "可见豆包68¥/月的定价是要大于大多数AI智能体的，在国内众多AI的价格可以说是遥遥领先了。"
      },
      {
        "id": "doubao-7a207275d3",
        "title": "各个模型性能对比："
      },
      {
        "id": "doubao-4dbb04239f",
        "title": "客观："
      },
      {
        "id": "doubao-1a7227c596",
        "title": "可见豆包并未上榜，其综合性能、智能指数远不如以上列举的更为便宜的Gemini、DeepSeek、MiMo、Kimi，而更贵的Claude和ChatGPT则可提供更为强大的模型算力用于专业创作、学术研究或复杂工作，我并不认为豆包在这些方面具备任何优势能打动用户花为豆包花更多的钱。"
      },
      {
        "id": "doubao-40d38e9103",
        "title": "主观 ："
      },
      {
        "id": "doubao-ee7ec02df8",
        "title": "逻辑推理："
      },
      {
        "id": "doubao-00e574526b",
        "title": "上下文检索："
      },
      {
        "id": "doubao-552148ce5d",
        "title": "信息/数据收集："
      },
      {
        "id": "doubao-16c16718df",
        "title": "表达方式："
      },
      {
        "id": "doubao-c6b5e30240",
        "title": "那豆包就全是缺陷，没优势吗？"
      },
      {
        "id": "doubao-03424c9c54",
        "title": "当然不是！"
      },
      {
        "id": "doubao-4fd5ac2312",
        "title": "所以我认为以大多数普通用户对豆包的使用，其免费版即可满足使用需求。而对于更为专业，需要依赖AI提供开发思路、提高工作效率、完成研究报告的用户豆包或许不是一个好的选择。"
      },
      {
        "id": "doubao-4ce45bffbc",
        "title": "豆包的会员服务适合哪些人？"
      },
      {
        "id": "doubao-5a59e326bc",
        "title": "国内视频平台视频创作者"
      },
      {
        "id": "doubao-d78115d142",
        "title": "偏爱豆包输出风格的重度Chat用户"
      },
      {
        "id": "doubao-d1ba148e88",
        "title": "钱多的不知道干点啥的人"
      },
      {
        "id": "doubao-b3c73229de",
        "title": "最后，看看其他各大AI智能体对豆包基础会员收费¥68/月的看法（仅供娱乐）："
      }
    ],
    "wordCount": 2094,
    "imageCount": 20,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/161083733",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  },
  "ai-studies": {
    "html": "<p>本文纯手搓，不含任何AI智能体介入。我认为这点很重要。</p>\n<p></p>\n<p>AI人工智能观念，或许在许久之前就已被广为熟知。尤其在19年之后，AI的发展更为迅猛，像一只蠢蠢欲动的老虎，时刻准备着冲出这名为瓶颈的牢笼。我当时只认为人工智能就是手机系统上自带的语音助手，可能是小艺、小度，亦可能是小爱同学、天猫精灵，并对人工智能的存在早已习惯，即使他们智能完成一些简单的指令。</p>\n<p></p>\n<p>当然，很多时候我嫌弃他们十分愚蠢。每当我询问小爱一些稍微复杂（没有预设）的问题，她都会诚实且无辜的回上一句“这个问题把我难住了，我会继续努力的”。</p>\n<p></p>\n<p>第一次认识并接触“大模型”这个概念，是在2023年8月份。雷军的年度演讲中宣布了小爱全面接入大模型，作为一个米粉，我迫不及待的在小米社区申请了Beta版的内测，安装上了接入大模型的小爱同学。体验后很震惊，我认为这是一个语音助手从完成简单的指令进化为能分析、理解问题，能搜索、学习相关知识，会汇总、整理并输出的真正的人工智能。我可以让她作诗作赋；可以把自己的语数英政史地生问题抛给她让她给你1对1讲解；我可以和她探讨我的感情经历和家庭矛盾；甚至可以让她直接生成一个小游戏的代码供你直接运行游玩。这不是预写好的程序，这是真正的AI！</p>\n<p></p>\n<p><strong>所以，本次人工智能发展浪潮的根基在于——大模型的诞生（源于Transformer）。</strong></p>\n<p></p>\n<p>同年，我高二。学校一周一次的升国旗仪式通常有老师进行主题演讲，某次，演讲的主题为ChatGPT，这名字熟悉又陌生。听了老师的讲解，我大概知道这是一个国外的人工智能体，而能力似乎与入了大模型的小爱大差不差，由于视野受限，我当时甚至想：为什么不讲一讲中国的小爱同学？不跟这ChatGPT差不多嘛。出于好奇，我在某镜像网站中试用了一下ChatGPT，当时只能总结为比小爱更聪明、更好用，现在看来当时的GPT在文本输出、逻辑、上下文衔接等方面都要高出同时期的小爱不止一个档次。缺点也很明显，很多时候回答过于官方，与我而言理解门槛高。</p>\n<p></p>\n<p><strong>我始终认为外国智能体在思维方式、人文文化、情感输出、社会价值等方面和中国人有差异。</strong></p>\n<p></p>\n<p>再后来就到了2025年年初，那时我已经是一个即将面临高考的高三学生了，DeepSeek席卷了整个互联网，全民都陷入了对AI智能程度的惊喜于欢呼当中。但当我使用DeepSeek时，却没有感受到质的飞跃，感觉像是从一个测试机（小米小爱）到一个更为完整、更为高效、思考能力更强更深的旗舰机。同时使用中很大概率遇到服务器加载失败等问题而导致无法输出，总之期待值很高而体验感并不好。</p>\n<p></p>\n<p>随后我国市面上的AI越来越丰富，字节跳动的豆包、阿里的通义千问、腾讯的元宝、百度的文心一言，这些都极大的降低了智能体的使用门槛并填满了空缺的市场。后来各家的大模型一点点更新完善，并针对不同的行业，不同需求出现了更为精进且专业的智能体。有医疗相关的；有创作相关的；有绘画相关的；有设计相关的；自然也有编程相关的。</p>\n<p></p>\n<p>于是，大家纷纷陷入“行业危机”，都害怕AI会取代自己的工作。当然，这是一个现实问题，在社会整体经济下滑的时代，已经有不少互联网公司因发展战略和成本原因不同程度的进行缩招、裁员，形成人工与AI协作以达到1+1＞3的高效工作模式。在计算机行业，Claude Code、Codex、Cursor、Trae、Lingma等智能体的能力，对比我上学期学习的Dev-C++后的我的能力，似乎已经没有了学习的意义也看不到任何的希望。在现在的大学环境中（我自身的大学（普通二本）的环境），大家习惯于借助智能体（绝大多数为豆包，鲜少的人知道Gemini、Grok或者Claude、Copilot这些）完成作业。简单的几行代码，人不会写而AI却能在几秒的时间内出色的完成，再学个十几年几十年似乎也难以超越现有AI的水平，更何况AI的进步速度远快于人，这样一来被替代便也成了理所应当。前段时间在自学HTML/CSS/JS，前端开发原来也是我想从事的工作之一，后来听了一个老师的讲座，说前端开发尤其是Web开发已经被AI大规模所取代，基本上没有任何一家企业的程序员在手搓HTML了。瞬间我不知道我的B站HTML课是否还要继续看下去，转向Java、Python、Rust的后端开发？或者学习更为底层的C、C++？没准明年或者后年在我毕业之前就又被取代了。</p>\n<p></p>\n<p>AI发展的速度堪比长征五号，对于普通人而言2025年初才进入AI时代，现在又出现了OpenClaw等一众龙虾。每天日新月异，几天不了解就有LLM、MCP、RAG、Tokens、Agent等这些专有名词一大堆，令人头晕眼花。未来几年AI很有可能由寄存于服务器、电子设备向实体机器人发展，具有独立思考和独立行动的能力，从物理层面上成为你的专属助手。很难想象等到3年后我即将大学毕业的时候会世界发展成什么样子。</p>\n<p></p>\n<p>这么说AI会永不停息的保持高速发展？但其实我并不认为。从根本上讲，人类是群居动物而逐渐形成社会，而社会是一个及其复杂的构成，其核心便是人的情感联系、价值导向、利益交换等等，而AI是很难做到这些的。或许AI可以安慰你的情绪，但这是模拟人类的“情”与“性”，它本身不会共情，并不具备主观能动这人类的特点。所以大家说AI创作比高中生的作文、比大学生的论文、比研究生的学术报告还要规范、高质且高效，但它始终不可能写出鲁迅的“我翻开历史一查......每页都写着‘仁义道德’......仔细看了半夜......满本都写着两个字是‘吃人’！”也不可能会有狄更斯的“那是最美好的时代，那是最糟糕的时代，那是智慧的年头，那是愚昧的年头。”所以开头我说，这篇文章不介入AI，这很重要，就像我永远不会用AI来帮我记日记，因为所有文章都可以反映出作者的思维逻辑和人文情感，这些AI只能对应照抄而无法体会，就像有些话只可意会不可言传，并非是表达能力不足，而是在特定条件下的特别共情。论语说“文胜质则野，质胜文则史。”AI可以轻松的做到词藻华丽，但难以复刻其每个典故背后的情感表达。</p>\n<p></p>\n<h4 class=\"reading-section\" id=\"ai-studies-3f540a3352\"><strong>至此，我认为AI的发展中不会打破人类文明发展中以“情”与“性”为根本的规律，好的创作终归是人主导，AI仅可作为辅助工具提升效率。但事实上这本身就很可能导致创作瓶颈，因为乱世才出英雄，英雄亦是人们的英雄。</strong></h4>\n<p></p>\n<p>讨论这么多，前端我还要学吗？计算机还是热门专业吗？AI的冲击是必然，这复杂的问题值得我去更深入的思考，或许没有必然的结果，但我现在会说：当然。即使含金量会不断降低，所有信息和技术都会通过不断的传播与进步而逐渐下放。我们应该换个方向，去学更好的运用AI，将自身与AI互补，做到既高效又完整的结合体，这些基础知识自然是必备的。</p>",
    "sections": [
      {
        "id": "ai-studies-3f540a3352",
        "title": "至此，我认为AI的发展中不会打破人类文明发展中以“情”与“性”为根本的规律，好的创作终归是人主导，AI仅可作为辅助工具提升效率。但事实上这本身就很可能导致创作瓶颈，因为乱世才出英雄，英雄亦是人们的英雄。"
      }
    ],
    "wordCount": 2703,
    "imageCount": 0,
    "sourceUrl": "https://blog.csdn.net/weixin_51354748/article/details/159318219",
    "fetchedAt": "2026-11-10T15:46:24+00:00"
  }
};
