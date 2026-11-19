import { animateSpring } from './motion.js';

export function showPhotoDialog(dialog) {
  document.dispatchEvent(new Event('belate:open-overlay'));
  dialog.showModal();
}

export function photoBox(image) {
  const box = image.getBoundingClientRect();
  const ratio = (image.naturalWidth || Number(image.getAttribute('width'))) /
    (image.naturalHeight || Number(image.getAttribute('height')));
  if (!ratio || getComputedStyle(image).objectFit !== 'contain') return box;
  const width = Math.min(box.width, box.height * ratio);
  const height = width / ratio;
  return new DOMRect(box.left + (box.width - width) / 2, box.top + (box.height - height) / 2, width, height);
}

export function photoTrack(image, viewport) {
  if (!image) return null;
  const { x, y, width, height, right, bottom } = photoBox(image);
  const bounds = viewport ?? {
    left: 0, right: document.documentElement.clientWidth, bottom: innerHeight,
    top: Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0),
  };
  if (!width || !height) return null;
  const clamp = value => Math.min(1, Math.max(0, value));
  return {
    x, y, width, height,
    cropTop: clamp((bounds.top - y) / height),
    cropRight: clamp((right - bounds.right) / width),
    cropBottom: clamp((bottom - bounds.bottom) / height),
    cropLeft: clamp((bounds.left - x) / width),
  };
}

export function photoFrame(image, viewport) {
  if (!image) return null;
  const { x, y, width, height, right, bottom } = photoBox(image);
  const bounds = viewport ?? {
    left: 0, right: document.documentElement.clientWidth, bottom: innerHeight,
    top: Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0),
  };
  if (!width || !height || right <= bounds.left || x >= bounds.right || bottom <= bounds.top || y >= bounds.bottom) return null;
  return {
    x, y, width, height,
    cropTop: Math.max(0, bounds.top - y) / height,
    cropRight: Math.max(0, right - bounds.right) / width,
    cropBottom: Math.max(0, bottom - bounds.bottom) / height,
    cropLeft: Math.max(0, bounds.left - x) / width,
  };
}

export function photoClip({ cropTop, cropRight, cropBottom, cropLeft }, radius = 0) {
  return `inset(${cropTop * 100}% ${cropRight * 100}% ${cropBottom * 100}% ${cropLeft * 100}%${radius ? ` round ${radius}px` : ''})`;
}

export function createPhotoPainter(image, from, to) {
  const end = typeof to === 'function' ? to() : to;
  const { width, height } = from.width > end.width ? from : end;
  image.style.width = `${width}px`;
  image.style.height = `${height}px`;
  return value => {
    image.style.transform = `translate(${value.x}px, ${value.y}px) scale(${value.width / width}, ${value.height / height})`;
    image.style.clipPath = photoClip(value);
  };
}

// to 可传函数：飞行途中每个计时点重新取目标框（页面滚动/恢复滚动时落点实时跟随，不落错位）。
export function movePhoto(from, to, paint, complete = () => {}, options = {}) {
  const target = typeof to === 'function' ? to : () => to;
  let end = target();
  const keys = Object.keys(from);
  paint(from);
  const spring = animateSpring(0, progress => {
    const t = Math.max(0, Math.min(1, progress));
    end = target() ?? end;
    const frame = {};
    for (const key of keys) frame[key] = from[key] + (end[key] - from[key]) * t;
    paint(frame);
  }, () => { paint(end); complete(); }, { stiffness: 320, damping: 34, ...options });
  spring.to(1);
  return spring;
}
