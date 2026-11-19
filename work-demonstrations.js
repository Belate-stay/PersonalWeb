import { freeChatDemos } from './work-demo-freechat.js';
import { codexDemos } from './work-demo-continue.js';
import { wztiDemos } from './work-demo-wzti.js';

const demonstrations = { freechat: freeChatDemos, 'codex-continue': codexDemos, wzti: wztiDemos };

export function workDemonstration(id, feature, label, closed = false) {
  const deck = demonstrations[id][feature];
  return `<figure class="work-demonstration" data-demo-project="${id}" data-demo-feature="${feature}"${closed ? ' data-demo-closed' : ''}>
    <figcaption>
      <div class="demo-window-bar">
        ${deck.length > 1 ? `<div class="demo-choices" role="tablist" aria-label="演示片段">${deck.map(({ title }, i) =>
          `<button type="button" id="work-demo-choice-${i}" role="tab" aria-controls="work-demo-viewport" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-demo-example="${i}">${title}</button>`).join('')}</div>` : ''}
        <button class="demo-toggle" type="button" ${deck.length > 1 ? `aria-label="${closed ? '展开演示' : '收起演示'}"` : ''} aria-expanded="${!closed}" aria-controls="work-demo-viewport">
          ${deck.length === 1 ? `<span data-demo-title>${label ?? deck[0].title}</span>` : ''}<i class="demo-chevron" aria-hidden="true"></i>
        </button>
        <button type="button" data-demo-replay aria-label="重播演示"><span class="demo-replay-icon" aria-hidden="true">↻</span><span class="demo-replay-label">重播</span></button>
      </div>
    </figcaption>
    <div class="demo-window-body">
      <div class="demo-window-clip">
        <div id="work-demo-viewport" class="demo-viewport" tabindex="0" role="${deck.length > 1 ? 'tabpanel' : 'region'}" aria-label="${label ?? deck[0].title}"${closed ? ' inert' : ''}></div>
      </div>
    </div>
  </figure>`;
}

function makePlayback(view, demonstration, signal) {
  view.innerHTML = demonstration.markup();
  view.scrollTop = 0;
  const prepared = demonstration.prepare?.(view, signal);
  const elements = Array.from(view.querySelectorAll('[data-demo-in]'), element => ({
    element,
    from: Number(element.dataset.demoIn),
    to: Number(element.dataset.demoOut ?? Infinity),
    folding: element.classList.contains('demo-fold'),
  }));
  const presses = Array.from(view.querySelectorAll('[data-demo-press]'));
  const { beats } = demonstration;
  let stage = -1;
  return {
    duration: beats.at(-1) + 860,
    draw(elapsed, instant = false, restored = false) {
      const next = beats.findLastIndex(time => elapsed >= time) + 1;
      if (next === stage && !prepared) return;
      const follow = demonstration.follow !== false && (next !== stage || demonstration.theme === 'chat');
      const previousHeight = follow ? view.scrollHeight : 0;
      const nearEnd = follow && previousHeight - view.clientHeight - view.scrollTop < 34;
      if (next !== stage) {
        stage = next;
        view.dataset.demoStage = String(stage);
        for (const { element, from, to, folding } of elements) {
          const show = stage >= from && stage < to;
          if (folding) {
            element.toggleAttribute('data-demo-shown', show);
            element.setAttribute('aria-hidden', String(!show));
          } else {
            element.hidden = !show;
            if (restored && show) element.setAttribute('data-demo-seen', '');
          }
        }
        for (const element of presses) element.toggleAttribute('data-demo-pressed', stage === Number(element.dataset.demoPress));
      }
      prepared?.(elapsed, stage, instant);
      if (nearEnd && view.scrollHeight !== previousHeight) view.scrollTop = view.scrollHeight;
    },
  };
}

export function mountWorkDemonstration(figure, reduced) {
  const deck = demonstrations[figure.dataset.demoProject][Number(figure.dataset.demoFeature)];
  const view = figure.querySelector('.demo-viewport');
  const toggle = figure.querySelector('.demo-toggle');
  const replay = figure.querySelector('[data-demo-replay]');
  const title = figure.querySelector('[data-demo-title]');
  const choices = [...figure.querySelectorAll('[data-demo-example]')];
  const listeners = new AbortController();
  const { signal } = listeners;
  const saved = new Map();
  let current = 0;
  let opened = !figure.hasAttribute('data-demo-closed');
  let visible = false;
  let elapsed = 0;
  let lastFrame = 0;
  let frame = 0;
  let playback;
  let playbackListeners;
  let slide;
  let swipe;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
  }

  function tick(now) {
    elapsed = Math.min(playback.duration, elapsed + (lastFrame ? Math.min(now - lastFrame, 100) : 0));
    lastFrame = now;
    playback.draw(elapsed);
    if (elapsed < playback.duration) {
      frame = requestAnimationFrame(tick);
    } else {
      frame = 0;
      figure.dataset.demoState = 'complete';
    }
  }

  function updatePlayback() {
    if (reduced.matches) {
      stop();
      elapsed = playback.duration;
      playback.draw(elapsed, true);
      figure.dataset.demoState = 'complete';
      if (visible) figure.setAttribute('data-playing', '');
    } else if (!visible || !opened || document.hidden || swipe?.moving) {
      stop();
      if (elapsed < playback.duration) figure.dataset.demoState = elapsed ? 'paused' : 'ready';
    } else if (!frame && elapsed < playback.duration) {
      figure.setAttribute('data-playing', '');
      figure.dataset.demoState = 'playing';
      frame = requestAnimationFrame(tick);
    }
  }

  function reset(at = 0, scrollTop = 0) {
    stop();
    playbackListeners?.abort();
    playbackListeners = new AbortController();
    const demonstration = deck[current];
    figure.dataset.demoTheme = demonstration.theme;
    view.setAttribute('aria-label', title?.textContent ?? demonstration.title);
    if (choices.length) view.setAttribute('aria-labelledby', choices[current].id);
    elapsed = at;
    playback = makePlayback(view, demonstration, playbackListeners.signal);
    if (!reduced.matches) {
      playback.draw(elapsed, false, true);
      if (at > 0) view.scrollTop = scrollTop;
    }
    updatePlayback();
  }

  function showBody(next) {
    opened = next;
    toggle.setAttribute('aria-expanded', String(opened));
    if (choices.length) toggle.setAttribute('aria-label', opened ? '收起演示' : '展开演示');
    figure.toggleAttribute('data-demo-closed', !opened);
    view.inert = !opened;
  }

  function setOpen(next) {
    showBody(next);
    updatePlayback();
  }

  function animateSlide(offset, duration) {
    slide?.cancel();
    if (!reduced.matches) slide = view.animate([
      { transform: `translateX(${offset}px)`, opacity: .6 },
      { transform: 'none', opacity: 1 },
    ], { duration, easing: 'cubic-bezier(.2,.48,.25,1)' });
  }

  function select(index) {
    if (index === current) {
      if (!opened) setOpen(true);
      return;
    }
    const direction = Math.sign(index - current);
    if (deck[current].retain || elapsed >= playback.duration) saved.set(current, { elapsed, scrollTop: view.scrollTop });
    else saved.delete(current);
    current = index;
    choices.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    showBody(true);
    const previous = saved.get(index);
    reset(previous?.elapsed, previous?.scrollTop);
    animateSlide(direction * 34, 380);
  }

  reset();
  const visibility = new IntersectionObserver(([entry]) => {
    const next = entry.intersectionRatio >= .12;
    if (next === visible) return;
    visible = next;
    updatePlayback();
  }, { threshold: .12 });
  visibility.observe(view);

  toggle.addEventListener('click', () => setOpen(!opened), { signal });
  replay.addEventListener('click', () => {
    if (!opened) showBody(true);
    reset();
  }, { signal });
  for (const [index, choice] of choices.entries()) {
    choice.addEventListener('click', () => select(index), { signal });
    choice.addEventListener('keydown', event => {
      const last = deck.length - 1;
      const next = {
        ArrowLeft: (index + last) % deck.length,
        ArrowRight: (index + 1) % deck.length,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next);
      choices[next].focus({ preventScroll: true });
    }, { signal });
  }
  if (choices.length) {
    view.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch' || !event.isPrimary || event.target.closest('button,a,summary,pre')) return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, moving: false };
    }, { signal });
    view.addEventListener('pointermove', event => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      if (!swipe.moving && Math.abs(dx) > Math.max(10, Math.abs(dy) * 1.3)) {
        swipe.moving = true;
        slide?.cancel();
        updatePlayback();
      }
      if (!swipe.moving || reduced.matches) return;
      const hasNeighbor = dx > 0 ? current > 0 : current < deck.length - 1;
      const offset = Math.max(-84, Math.min(84, dx * (hasNeighbor ? .65 : .17)));
      view.style.translate = `${offset}px 0`;
    }, { signal });
    function finishSwipe(event) {
      if (!swipe || swipe.id !== event.pointerId) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      const moved = swipe.moving;
      const offset = Number.parseFloat(view.style.translate) || 0;
      swipe = undefined;
      view.style.translate = '';
      const next = current + (dx < 0 ? 1 : -1);
      if (event.type === 'pointerup' && moved && Math.abs(dx) >= Math.max(45, Math.abs(dy) * 1.3) && next >= 0 && next < deck.length) {
        select(next);
      } else {
        if (offset) animateSlide(offset, 180);
        updatePlayback();
      }
    }
    view.addEventListener('pointercancel', finishSwipe, { signal });
    view.addEventListener('pointerup', finishSwipe, { signal });
  }
  reduced.addEventListener('change', updatePlayback, { signal });
  document.addEventListener('visibilitychange', updatePlayback, { signal });
  return () => {
    stop();
    slide?.cancel();
    visibility.disconnect();
    playbackListeners.abort();
    listeners.abort();
  };
}
