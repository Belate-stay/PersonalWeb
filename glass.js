/** Diffuse matte surfaces: only broad light and color pass through the blur. */
let active;
export function initGlass() {
  if (active) return active;
  const surfaces = new Set();
  function scan() {
    for (const element of surfaces) if (!element.isConnected) surfaces.delete(element);
    document.querySelectorAll('.frosted-glass').forEach(element => {
      surfaces.add(element); element.dataset.glassRenderer = 'frost';
    });
  }
  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true });
  scan();
  active = () => {
    observer.disconnect();
    surfaces.forEach(element => { delete element.dataset.glassRenderer; });
    surfaces.clear(); active = undefined;
  };
  return active;
}
