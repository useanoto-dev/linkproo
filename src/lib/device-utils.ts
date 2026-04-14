/**
 * Lightweight device-capability helpers used by canvas-based effects.
 * All functions are safe to call during render (they check `window` existence).
 */

/** Returns true when the viewport is narrower than 768 px (phone-class devices). */
export function isMobileDevice(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

/**
 * Target minimum frame interval in milliseconds for canvas animation loops.
 * Mobile: ~30 fps (33 ms) to avoid CPU starvation.
 * Desktop: 0 — no artificial throttle, browser drives the cadence.
 */
export function canvasFrameInterval(mobile: boolean): number {
  return mobile ? 33 : 0;
}
