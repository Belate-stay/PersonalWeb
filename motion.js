import { animate, motionValue } from './vendor/motion.js';

export function projectFromURL(url) {
  const value = new URL(url).searchParams.get('project');
  return value === 'freechat' || value === 'wzti' ? value : null;
}

export function shouldDismiss(distance, velocity, idleMilliseconds = 0) {
  const releaseVelocity = idleMilliseconds > 100 ? 0 : velocity;
  return distance > 100 || (distance > 18 && releaseVelocity > 550);
}

export function animateSpring(initial, render, complete = () => {}, options = {}) {
  const value = motionValue(initial);
  const unsubscribe = value.on('change', render);
  let animation;
  let generation = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  return {
    to(target) {
      const request = ++generation;
      if (reduced.matches) {
        animation?.stop();
        value.jump(target);
        complete(target);
      } else {
        animation = animate(value, target, {
          ...(options.ease
            ? { duration: options.duration ?? .56, ease: options.ease }
            : { type: 'spring', stiffness: options.stiffness ?? 390, damping: options.damping ?? 39, restDelta: .0002, restSpeed: .002 }),
          onComplete: () => { if (request === generation) complete(target); },
        });
      }
    },
    stop() { generation++; animation?.stop(); unsubscribe(); value.destroy(); },
    get value() { return value.get(); },
  };
}

function hasNativeWheelTarget(event, scroller, direction) {
  for (const element of event.composedPath()) {
    if (element === scroller) break;
    if (!(element instanceof Element)) continue;
    if (element.matches('select,textarea,input[type="number"]')) return true;
    const limit = element.scrollHeight - element.clientHeight;
    if (limit <= 1) continue;
    const { overflowY, overscrollBehaviorY } = getComputedStyle(element);
    if (!['auto', 'scroll', 'overlay'].includes(overflowY)) continue;
    const canScroll = direction > 0 ? element.scrollTop < limit - 1 : element.scrollTop > 1;
    if (canScroll || overscrollBehaviorY !== 'auto') return true;
  }
  return false;
}

export function initWheelScroll(reduced) {
  const scroller = document.scrollingElement;
  const finePointer = matchMedia('(any-pointer: fine)');
  const duration = 400;
  const rampTime = 56;
  let frame = 0;
  let nativeUntil = 0;
  let applied;
  let glide;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    glide = null;
  }

  function sample(now) {
    const { from, to, start, ramp, initialVelocity, coastVelocity } = glide;
    const elapsed = Math.max(0, now - start);
    if (elapsed < ramp) {
      const velocity = initialVelocity + (coastVelocity - initialVelocity) * elapsed / ramp;
      return { top: from + (initialVelocity + velocity) * elapsed / 2, velocity };
    }
    const remaining = Math.max(0, duration - elapsed);
    const velocity = coastVelocity * remaining / (duration - ramp);
    return { top: to - velocity * remaining / 2, velocity };
  }

  function step(now) {
    if (scroller.scrollTop !== applied) { stop(); return; }
    window.scrollTo({ top: sample(now).top, behavior: 'instant' });
    applied = scroller.scrollTop;
    if (now - glide.start < duration) frame = requestAnimationFrame(step);
    else stop();
  }

  window.addEventListener('wheel', event => {
    const { deltaMode, deltaX, deltaY } = event;
    if (reduced.matches || !finePointer.matches || !event.cancelable || event.defaultPrevented ||
        event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || deltaX || !deltaY) {
      stop();
      return;
    }
    const now = performance.now();
    const pixels = deltaMode === WheelEvent.DOM_DELTA_PIXEL;
    // Leave small, precise gestures and their momentum on the browser's scroll path.
    if (pixels && (Math.abs(deltaY) < 24 || !Number.isInteger(deltaY))) nativeUntil = now + 160;
    const direction = Math.sign(deltaY);
    if ((pixels && now < nativeUntil) || document.body.matches('.demo-expanded, :has(dialog[open])') ||
        hasNativeWheelTarget(event, scroller, direction)) {
      stop();
      return;
    }
    const from = scroller.scrollTop;
    const unit = pixels ? 1 : deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : scroller.clientHeight;
    const limit = scroller.scrollHeight - scroller.clientHeight;
    const continuing = glide && applied === from && glide.to <= limit && Math.sign(glide.to - from) === direction;
    const target = Math.max(0, Math.min(limit, (continuing ? glide.to : from) + deltaY * unit));
    if (target === from) { stop(); return; }
    event.preventDefault();
    if (continuing && target === glide.to) return;
    const { top, velocity } = continuing ? sample(now) : { top: from, velocity: 0 };
    const distance = target - top;
    const ramp = velocity ? Math.min(rampTime, Math.abs(distance / velocity)) : rampTime;
    // The ramp joins the current speed to a linear coast whose area covers the remaining distance.
    const coastVelocity = (2 * distance - velocity * ramp) / duration;
    glide = { from: top, to: target, start: now, ramp, initialVelocity: velocity, coastVelocity };
    applied = from;
    if (!frame) frame = requestAnimationFrame(step);
  }, { passive: false });

  window.addEventListener('pointerdown', stop, { capture: true, passive: true });
  window.addEventListener('keydown', stop, true);
  window.addEventListener('blur', stop);
  document.addEventListener('visibilitychange', stop);
  document.addEventListener('belate:open-overlay', stop);
  reduced.addEventListener('change', stop);
  return stop;
}
