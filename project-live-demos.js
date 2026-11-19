import { continuationMarkup, mountContinuation } from './project-showcases.js';
import { mountWztiQuiz } from './wzti-quiz.js';

// 项目详情页的实时交互演示：复用首页展台同一套续跑状态机与三题速测，
// 只换壳（阅读栏里的面板），不复制逻辑。
export function mountProjectLiveDemo(slot) {
  const controller = new AbortController();
  const { signal } = controller;
  const kind = slot.dataset.projectDemo;
  slot.innerHTML = `<div class="project-showcase project-showcase--${kind} detail-showcase">
    <div class="detail-showcase-body">${kind === 'codex-continue'
      ? continuationMarkup()
      : '<section class="quick-quiz" aria-label="WZTI 三题速测" aria-busy="true"><p role="status">正在抽题…</p></section>'}</div>
  </div>`;
  if (kind === 'codex-continue') {
    mountContinuation(slot.querySelector('.detail-showcase-body'), { signal });
  } else {
    const quiz = slot.querySelector('.quick-quiz');
    mountWztiQuiz(quiz, signal);
    quiz.setAttribute('aria-busy', 'false');
  }
  return () => controller.abort();
}
