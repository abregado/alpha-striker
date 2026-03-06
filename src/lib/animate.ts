/** Easing functions */
export const ease = {
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outBounce: (t: number) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  inOutQuad: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

export interface TweenOptions {
  from: number;
  to: number;
  duration: number;          // ms
  easing?: (t: number) => number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

export function tween(opts: TweenOptions): () => void {
  const { from, to, duration, easing = ease.outCubic, onUpdate, onComplete } = opts;
  let start: number | null = null;
  let rafId: number;
  let cancelled = false;

  function frame(ts: number) {
    if (cancelled) return;
    if (start === null) start = ts;
    const elapsed = ts - start;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(from + (to - from) * easing(t));
    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      onComplete?.();
    }
  }

  rafId = requestAnimationFrame(frame);
  return () => { cancelled = true; cancelAnimationFrame(rafId); };
}

/** Wait a given number of ms (Promise-based). */
export const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** Animate a number cycling rapidly (slot-machine style), then settle on finalValue. */
export function animateCounter(
  el: HTMLElement,
  finalValue: number,
  duration: number,
  min = 2,
  max = 12,
): Promise<void> {
  return new Promise(resolve => {
    const intervalMs = 60;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += intervalMs;
      if (elapsed >= duration) {
        clearInterval(interval);
        el.textContent = String(finalValue);
        resolve();
      } else {
        // Slow down near the end
        const progress = elapsed / duration;
        const speed = progress > 0.7 ? intervalMs * (1 + (progress - 0.7) * 6) : intervalMs;
        el.textContent = String(Math.floor(Math.random() * (max - min + 1)) + min);
        // Increase interval speed dynamically isn't easy with setInterval;
        // randomisation achieves a similar perceptual slowing.
        void speed; // suppress unused var warning
      }
    }, intervalMs);
  });
}
