import { animate, motionValue } from './vendor/motion.js';

const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)') ?? { matches: true };
const spring = { type: 'spring', stiffness: 480, damping: 34, mass: .8 };
const ease = [.16, 1, .3, 1];
const controls = 'button:not(:disabled),a[href],summary';
const groups = '.main-nav,.feature-tabs,.note-filters,.work-selector,.filters';
const dialogs = new WeakMap();
let toastTimer;
let toastMotion;
let updateNavigation = () => {};
export function syncNavigation(instant = false) { updateNavigation(instant); }

export function showToast(message) {
  let toast = document.querySelector('.system-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'system-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }
  clearTimeout(toastTimer); toastMotion?.stop();
  toast.textContent = message; toast.hidden = false;
  if (reduce.matches) { toast.style.opacity = '1'; toast.style.transform = 'none'; }
  else toastMotion = animate(toast, { opacity: [0, 1], y: [12, 0], scale: [.96, 1] }, { duration: .28, ease });
  toastTimer = setTimeout(() => {
    if (reduce.matches) toast.hidden = true;
    else toastMotion = animate(toast, { opacity: 0, y: 8 }, { duration: .16, ease, onComplete: () => { toast.hidden = true; } });
  }, 2200);
}

export function openDialog(dialog) {
  document.dispatchEvent(new Event('belate:open-overlay'));
  const previous = dialogs.get(dialog);
  previous?.stop();
  const opening = !dialog.open;
  if (opening) dialog.showModal();
  dialog.dataset.dialogPhase = 'open';
  if (reduce.matches) { dialog.style.opacity = ''; dialog.style.transform = ''; return; }
  const keyframes = opening ? { opacity: [0, 1], y: [14, 0], scale: [.975, 1] } : { opacity: 1, y: 0, scale: 1 };
  dialogs.set(dialog, animate(dialog, keyframes, { duration: .28, ease }));
}

export function closeDialog(dialog, immediate = false) {
  if (!dialog.open) return;
  dialogs.get(dialog)?.stop();
  const finish = () => {
    dialog.close(); dialog.style.opacity = ''; dialog.style.transform = '';
    delete dialog.dataset.dialogPhase; dialogs.delete(dialog);
  };
  if (immediate || reduce.matches) { finish(); return; }
  dialog.dataset.dialogPhase = 'closing';
  dialogs.set(dialog, animate(dialog, { opacity: 0, y: 9, scale: .985 }, { duration: .15, ease, onComplete: finish }));
}

export function initInteractions() {
  let pressed = null, scanFrame = 0, disposed = false;
  const pressMotion = new Map();
  const selections = new Map();

  function prepare(element) {
    if (element.classList.contains('system-control') || element.matches('.main-nav a')) return;
    if (getComputedStyle(element).display === 'inline') return;
    element.classList.add('system-control');
  }
  function scale(element, value) {
    pressMotion.get(element)?.stop();
    if (reduce.matches) { element.style.removeProperty('--press-scale'); return; }
    let animation;
    animation = animate(element, { '--press-scale': value }, {
      ...(value < 1 ? { duration: .085, ease: [.3, 0, .2, 1] } : spring),
      onComplete: () => {
        if (pressMotion.get(element) !== animation) return;
        pressMotion.delete(element);
        if (value === 1) element.style.removeProperty('--press-scale');
      },
    });
    pressMotion.set(element, animation);
  }
  function release() {
    if (!pressed) return;
    const element = pressed; pressed = null;
    delete element.dataset.pressed;
    scale(element, 1);
  }
  function press(element) {
    if (!element || element.closest('[inert]') || element.getAttribute('aria-disabled') === 'true') return;
    release(); prepare(element);
    if (!element.classList.contains('system-control')) return;
    pressed = element; element.dataset.pressed = '';
    scale(element, element.matches('summary,.article-row,.related-project,[data-image]') ? .992 : .956);
  }
  function pointerDown(event) {
    if (!event.isPrimary || event.button > 0 || event.target.closest('input,textarea,select')) return;
    press(event.target.closest(controls));
  }
  function keyDown(event) {
    if (event.repeat || !['Enter', ' '].includes(event.key) || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.key === ' ' && event.target.closest('a')) return;
    press(event.target.closest(controls));
  }
  function keyUp(event) { if (['Enter', ' '].includes(event.key)) release(); }
  function feedback(event) {
    const element = event.target.closest(controls);
    if (!element || reduce.matches || element.matches('[data-image],.case-cover') || !element.classList.contains('system-control')) return;
    const rect = element.getBoundingClientRect();
    if (rect.width > 700 || rect.height > 250) return;
    const ink = document.createElement('span');
    ink.className = 'system-ink'; ink.setAttribute('aria-hidden', 'true');
    const size = Math.max(rect.width, rect.height) * 2;
    Object.assign(ink.style, { width: `${size}px`, height: `${size}px`, left: `${event.detail ? event.clientX - rect.left : rect.width / 2}px`, top: `${event.detail ? event.clientY - rect.top : rect.height / 2}px` });
    element.append(ink);
    const animation = ink.animate([{ opacity: .15, transform: 'translate(-50%,-50%) scale(0)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    animation.finished.then(() => ink.remove()).catch(() => ink.remove());
  }

  // The Uiverse glider is measured here so wrapped labels and different text widths work.
  function moveSelection(group, state, instant = false) {
    const active = group.querySelector('a[aria-current],button[aria-selected="true"],button[aria-pressed="true"]');
    if (!active) return;
    const width = active.offsetWidth;
    const target = { x: active.offsetLeft + (state.navigation ? width / 2 : 0), y: active.offsetTop, width, height: active.offsetHeight };
    const signature = Object.values(target).join('/');
    if (!instant && signature === state.signature) return;
    state.signature = signature;
    const jump = instant || reduce.matches || !state.initialized;
    state.initialized = true;
    if (state.navigation && !jump) {
      const { x, y, width, height } = state.values;
      const stretch = Math.min(30, Math.abs(target.x - x.get()) * .4);
      const expanded = target.width + stretch;
      y.jump(target.y); height.jump(target.height);
      animate(x, target.x, { duration: .44, ease });
      if (stretch > 1 && expanded > width.get()) {
        animate(width, [width.get(), expanded, target.width], {
          duration: .44, times: [0, .33, 1], ease: [[.25, .65, .35, 1], [.2, .65, .28, 1]],
        });
      } else animate(width, target.width, { duration: .44, ease });
      return;
    }
    for (const [name, value] of Object.entries(state.values)) {
      if (jump) value.jump(target[name]);
      else animate(value, target[name], spring);
    }
  }
  function scan() {
    scanFrame = 0;
    if (disposed) return;
    if (pressed && !pressed.isConnected) release();
    for (const [element, animation] of pressMotion) if (!element.isConnected) { animation.stop(); pressMotion.delete(element); }
    document.querySelectorAll(controls).forEach(prepare);
    document.querySelectorAll('.work-console,.related-project,.article-row,.home-note>summary').forEach(element => element.classList.add('uiv-surface'));
    for (const [group, state] of selections) if (!group.isConnected) {
      state.resize.disconnect(); state.unsubscribe.forEach(off => off()); Object.values(state.values).forEach(value => value.destroy()); selections.delete(group);
    }
    document.querySelectorAll(groups).forEach(group => {
      let state = selections.get(group);
      if (!state) {
        const marker = document.createElement('span');
        marker.className = 'uiv-glider'; marker.setAttribute('aria-hidden', 'true');
        group.classList.add('has-glider'); group.append(marker);
        const navigation = group.matches('.main-nav');
        const values = Object.fromEntries(['x', 'y', 'width', 'height'].map(name => [name, motionValue(0)]));
        const render = () => {
          const width = values.width.get();
          const left = values.x.get() - (navigation ? width / 2 : 0);
          Object.assign(marker.style, { transform: `translate(${left}px,${values.y.get()}px)`, width: `${width}px`, height: `${values.height.get()}px` });
        };
        state = { marker, values, navigation, initialized: false, signature: '', resize: null, unsubscribe: Object.values(values).map(value => value.on('change', render)) };
        state.resize = new ResizeObserver(() => {
          const width = group.clientWidth;
          const height = group.clientHeight;
          if (width === state.groupWidth && height === state.groupHeight) return;
          state.groupWidth = width;
          state.groupHeight = height;
          moveSelection(group, state, true);
        });
        state.resize.observe(group); selections.set(group, state);
        moveSelection(group, state, true);
      } else moveSelection(group, state);
    });
  }
  function queueScan() { if (!scanFrame) scanFrame = requestAnimationFrame(scan); }
  updateNavigation = instant => {
    const group = document.querySelector('.main-nav');
    const state = selections.get(group);
    if (state) moveSelection(group, state, instant);
  };
  const observer = new MutationObserver(records => {
    if (records.some(record => record.type === 'attributes' || [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === 1 && !node.matches('.system-ink,.uiv-glider,.system-toast')))) queueScan();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'aria-selected', 'aria-pressed'] });
  function reset() {
    release();
    for (const [element, animation] of pressMotion) { animation.stop(); element.style.removeProperty('--press-scale'); delete element.dataset.pressed; }
    pressMotion.clear();
    selections.forEach((state, group) => moveSelection(group, state, true));
  }
  document.addEventListener('pointerdown', pointerDown, true);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', reset);
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  document.addEventListener('click', feedback);
  reduce.addEventListener('change', reset);
  // 相关文章/资料卡：与关于页社交卡同一套压感倾斜参数（鼠标专属、reduced 关闭）。
  let tiltFrame = 0, tiltMove = null;
  const tiltCardOf = target => target instanceof Element ? target.closest('.tilt-card') : null;
  const clearTilt = card => { for (const name of ['--card-rotate-x', '--card-rotate-y', '--card-light-x', '--card-light-y']) card.style.removeProperty(name); };
  const onTiltMove = event => {
    if (reduce.matches || event.pointerType !== 'mouse') return;
    const card = tiltCardOf(event.target);
    if (!card) return;
    tiltMove = { card, x: event.clientX, y: event.clientY };
    if (tiltFrame) return;
    tiltFrame = requestAnimationFrame(() => {
      tiltFrame = 0;
      const move = tiltMove;
      if (!move || !move.card.isConnected) return;
      const box = move.card.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const x = Math.max(-1, Math.min(1, 2 * (move.x - box.left) / box.width - 1));
      const y = Math.max(-1, Math.min(1, 2 * (move.y - box.top) / box.height - 1));
      move.card.style.setProperty('--card-rotate-x', `${y * -5.5}deg`);
      move.card.style.setProperty('--card-rotate-y', `${x * 5}deg`);
      move.card.style.setProperty('--card-light-x', `${50 + x * 43}%`);
      move.card.style.setProperty('--card-light-y', `${40 + y * 35}%`);
    });
  };
  const onTiltOut = event => {
    const card = tiltCardOf(event.target);
    if (!card) return;
    if (event.relatedTarget && card.contains(event.relatedTarget)) return;
    clearTilt(card);
  };
  const onTiltReset = () => document.querySelectorAll('.tilt-card').forEach(clearTilt);
  document.addEventListener('pointermove', onTiltMove, { passive: true });
  document.addEventListener('pointerout', onTiltOut, { passive: true });
  reduce.addEventListener('change', onTiltReset);
  scan();
  return () => {
    disposed = true; reset(); observer.disconnect(); cancelAnimationFrame(scanFrame); updateNavigation = () => {};
    selections.forEach(state => { state.resize.disconnect(); state.unsubscribe.forEach(off => off()); Object.values(state.values).forEach(value => value.destroy()); state.marker.remove(); }); selections.clear();
    document.removeEventListener('pointerdown', pointerDown, true); window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); window.removeEventListener('blur', reset);
    document.removeEventListener('visibilitychange', reset); document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp); document.removeEventListener('click', feedback); reduce.removeEventListener('change', reset);
    cancelAnimationFrame(tiltFrame); document.removeEventListener('pointermove', onTiltMove); document.removeEventListener('pointerout', onTiltOut); reduce.removeEventListener('change', onTiltReset);
  };
}
