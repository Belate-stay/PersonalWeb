// Uiverse wise-shrimp-26 标记：项目详情 / 项目外链 / 展开阅读共用同一套动画。
// 尺寸靠 font-size 的 em 几何与各位置的容器查询缩放。
const parrotArrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';

export function parrotButton(href, parts, className = '', ariaLabel = '', attrs = '') {
  const words = parts.map(part => `<span>${part}</span>`).join('');
  return `<a class="uiv-parrot${className ? ` ${className}` : ''}" href="${href}"${attrs}${ariaLabel ? ` aria-label="${ariaLabel}"` : ''}><span class="uiv-parrot-text">${words}</span><span class="uiv-parrot-clone" aria-hidden="true">${words}</span>${parrotArrow}</a>`;
}

export function swipeButton(href, label, className = '') {
  return `<a class="uiv-swipe${className ? ` ${className}` : ''}" href="${href}">${label}</a>`;
}

export function wiseButton(href, label, className = '', ariaLabel = '', attrs = '') {
  return `<a class="uiv-wise${className ? ` ${className}` : ''}" href="${href}"${attrs}${ariaLabel ? ` aria-label="${ariaLabel}"` : ''}><span class="uiv-wise-line"></span><span class="uiv-wise-line"></span><span class="uiv-wise-text">${label}</span><span class="uiv-wise-drow1"></span><span class="uiv-wise-drow2"></span></a>`;
}
