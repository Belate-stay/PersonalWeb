import { asset } from './content.js';
import photo from './hero-depth-layers.js';

function pointerResponse(value) {
  const position = Math.max(-1, Math.min(1, value));
  return position * (1.25 - .25 * position * position);
}

const touchInput = '(pointer: coarse)';
const radians = Math.PI / 180;
const tiltLimit = Math.sin(12 * radians);
let tiltPermission;
let tiltPermissionRequest;

function tiltResponse(value) {
  const magnitude = Math.abs(value);
  return magnitude <= .006 ? 0 : Math.sign(value) * (magnitude - .006) / (tiltLimit - .006);
}

function mountHeroTilt(host, point) {
  const touch = matchMedia(touchInput);
  const orientation = window.DeviceOrientationEvent;
  const permissionAPI = typeof orientation?.requestPermission === 'function' ? orientation : window.DeviceMotionEvent;
  const needsPermission = typeof permissionAPI?.requestPermission === 'function';
  const permission = () => needsPermission ? tiltPermission ?? 'prompt' : 'granted';
  let enabled = false, listening = false, disposed = false;
  let center, screenAngle;

  const button = needsPermission ? document.createElement('button') : null;
  if (button) {
    button.type = 'button';
    button.className = 'hero-tilt-control';
    button.textContent = '开启倾斜视差';
    button.hidden = true;
    host.append(button);
  }
  let watchedPermission;
  function watchPermission() {
    if (!tiltPermissionRequest || watchedPermission === tiltPermissionRequest) return;
    watchedPermission = tiltPermissionRequest;
    watchedPermission.then(() => { if (!disposed) update(); });
  }

  function update() {
    const available = enabled && touch.matches && Boolean(orientation) && window.isSecureContext;
    const listen = available && permission() !== 'denied';
    if (button) {
      button.hidden = !available || permission() !== 'prompt';
      button.disabled = Boolean(tiltPermissionRequest);
      watchPermission();
    }
    if (listen === listening) return;
    listening = listen;
    center = undefined;
    point(0, 0);
    if (listening) window.addEventListener('deviceorientation', onOrientation, { passive: true });
    else window.removeEventListener('deviceorientation', onOrientation);
  }

  function onOrientation({ beta, gamma }) {
    if (!Number.isFinite(beta) || !Number.isFinite(gamma)) return;
    const pitch = beta * radians, roll = gamma * radians;
    // Gravity projected onto the device axes stays continuous at Euler angle boundaries.
    const x = -Math.cos(pitch) * Math.sin(roll);
    const y = Math.sin(pitch);
    const z = Math.cos(pitch) * Math.cos(roll);
    const angle = (window.screen.orientation?.angle ?? window.orientation ?? 0) * radians;
    if (!center || screenAngle !== angle) {
      center = { x, y, z, pitch };
      screenAngle = angle;
      if (button && permission() === 'prompt') {
        tiltPermission = 'granted';
        button.hidden = true;
      }
      point(0, 0);
      return;
    }
    // Use a tangent to the resting grip for forward/back tilt, then align with the screen.
    const span = Math.hypot(center.y, center.z);
    const pitchChange = span > .001 ? (y * center.z - z * center.y) / span : y - center.y;
    const rollChange = (x - center.x) / Math.max(.4, Math.abs(Math.cos(center.pitch)));
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    point(tiltResponse(rollChange * cosine + pitchChange * sine), tiltResponse(pitchChange * cosine - rollChange * sine));
  }

  button?.addEventListener('click', () => {
    if (permission() !== 'prompt' || tiltPermissionRequest) return;
    // Call the browser from the tap handler, before losing user activation.
    tiltPermissionRequest = (async () => {
      try { tiltPermission = await permissionAPI.requestPermission(); }
      catch { tiltPermission = 'denied'; }
    })().finally(() => { tiltPermissionRequest = undefined; });
    update();
  });
  touch.addEventListener('change', update);
  const resetCenter = () => { center = undefined; if (listening) point(0, 0); };
  window.addEventListener('orientationchange', resetCenter);

  return {
    get isTouch() { return touch.matches; },
    setActive(active) { enabled = active; update(); },
    dispose() {
      disposed = true;
      enabled = false;
      update();
      touch.removeEventListener('change', update);
      window.removeEventListener('orientationchange', resetCenter);
      button?.remove();
    },
  };
}

export function mountHeroDepth(host) {
  const view = document.createElement('div');
  view.className = 'hero-depth';
  view.hidden = true;
  view.setAttribute('aria-hidden', 'true');
  const plane = document.createElement('div');
  plane.className = 'hero-depth-plane';
  plane.style.width = `${photo.width}px`;
  plane.style.height = `${photo.height}px`;
  view.append(plane);
  host.append(view);

  function layer(id) {
    const image = new Image();
    image.alt = '';
    image.draggable = false;
    image.src = asset(`hero-depth-${id}.webp`);
    image.dataset.depthLayer = id;
    plane.append(image);
    return image;
  }

  const background = layer('background');
  const padding = photo.backgroundPadding ?? 0;
  Object.assign(background.style, {
    left: `${-padding}px`, top: `${-padding}px`,
    width: `${photo.width + 2 * padding}px`, height: `${photo.height + 2 * padding}px`,
  });
  const objects = photo.layers.map(meta => {
    const image = layer(meta.id);
    const seed = Number(meta.id.slice(1)) || 19;
    const paper = Boolean(meta.pin);
    Object.assign(image.style, {
      left: `${meta.x}px`, top: `${meta.y}px`, width: `${meta.w}px`, height: `${meta.h}px`,
      transformOrigin: meta.pin ? `${meta.pin[0]}px ${meta.pin[1]}px` : '53% 100%',
    });
    return {
      image, seed, paper,
      travelX: meta.depth * (paper ? 29 + seed % 3 * 1.4 : 28),
      travelY: meta.depth * (paper ? 11 + seed % 4 * 1.4 : 7),
      speed: paper ? 8 + seed % 7 * .65 : 11.5,
      x: 0, y: 0, swing: 0, velocity: 0,
    };
  });

  let ready = false, active = false, requested = false, disposed = false;
  let frame = 0, last = 0, elapsed = 0, pointerX = 0, pointerY = 0, roomX = 0, roomY = 0;
  const tilt = mountHeroTilt(host, point);
  const images = [background, ...objects.map(object => object.image)];
  Promise.all(images.map(image => image.decode())).then(() => {
    if (disposed) return;
    ready = true;
    setActive(requested);
  }).catch(() => { if (!disposed) view.dataset.depthUnavailable = 'true'; });

  function fit(width, height, focal) {
    const scale = Math.max(width / photo.width, height / photo.height);
    const left = (width - photo.width * scale) * focal;
    const top = (height - photo.height * scale) / 2;
    plane.style.transform = `translate3d(${left}px,${top}px,0) scale(${scale})`;
  }

  function point(x, y) {
    pointerX = pointerResponse(x);
    pointerY = pointerResponse(y);
  }

  function draw(time) {
    if (!active) return;
    const dt = last ? Math.min((time - last) / 1000, .034) : 1 / 60;
    last = time;
    elapsed += dt;
    const roomFollow = 1 - Math.exp(-dt * 9);
    roomX += (pointerX - roomX) * roomFollow;
    roomY += (pointerY - roomY) * roomFollow;
    background.style.transform = `translate3d(${-roomX * 7}px,${-roomY * 5}px,0)${padding ? '' : ' scale(1.008)'}`;

    const horizontal = tilt.isTouch ? 1.3 : 1;
    const vertical = tilt.isTouch ? 1.35 : 1;
    for (const object of objects) {
      const { image, paper, seed, travelX, travelY, speed } = object;
      const follow = 1 - Math.exp(-dt * speed);
      object.x += (pointerX - object.x) * follow;
      object.y += (pointerY - object.y) * follow;
      const x = -object.x * travelX * horizontal;
      const y = -object.y * travelY * vertical;
      if (!paper) {
        // The bicycle follows the viewing angle while its weight stays on the tyres.
        image.style.transform = `translate3d(${x}px,${y}px,0)`;
        continue;
      }
      const air = elapsed * (.51 + seed * .029) + seed * 1.618;
      const drive = Math.sin(air) * (.25 + seed % 5 * .16) + Math.sin(air * 1.73 + .8) * .24 - object.x * 1.35;
      const stiffness = 16 + seed % 7 * 2.1;
      object.velocity = (object.velocity + (drive - object.swing) * stiffness * dt) * Math.exp(-dt * (2.9 + seed % 5 * .35));
      object.swing += object.velocity * dt;
      const yaw = object.x * (2.6 + seed % 4 * 1.15) + Math.sin(air + 1.2) * 1.9;
      const pitch = object.y * (3.7 + seed % 4 * .55) + Math.cos(air * 1.19) * 1.4;
      // Pivot at the suspension point. The lower edge travels farther than the pin.
      image.style.transform = `translate3d(${x}px,${y}px,0) perspective(950px) rotateZ(${object.swing}deg) rotateY(${yaw}deg) rotateX(${pitch}deg)`;
    }
    frame = requestAnimationFrame(draw);
  }

  function setActive(enabled) {
    requested = enabled;
    const next = enabled && ready;
    if (next === active) return;
    active = next;
    view.hidden = !active;
    tilt.setActive(active);
    cancelAnimationFrame(frame);
    last = 0;
    if (active) frame = requestAnimationFrame(draw);
    else {
      point(0, 0);
      roomX = roomY = 0;
      background.style.transform = '';
      for (const object of objects) {
        object.x = object.y = object.swing = object.velocity = 0;
        object.image.style.transform = '';
      }
    }
  }

  return {
    fit, point, setActive,
    get active() { return active; },
    get usesTilt() { return tilt.isTouch; },
    dispose() { disposed = true; setActive(false); tilt.dispose(); view.remove(); },
  };
}
