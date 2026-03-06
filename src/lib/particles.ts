/** Canvas-based particle system for critical hit celebrations. */

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;          // 0–1 (1 = alive, 0 = dead)
  decay: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
}

const CRIT_COLORS = ['#f43f5e', '#fb923c', '#fbbf24', '#ffffff', '#e879f9'];

let canvas: HTMLCanvasElement | null = null;
let ctx2d: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let rafId: number | null = null;

function getCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  if (!canvas) {
    canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    ctx2d = canvas.getContext('2d')!;
  }
  resize();
  return { canvas, ctx: ctx2d! };
}

function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);

function loop() {
  const { canvas: c, ctx } = getCanvas();
  ctx.clearRect(0, 0, c.width, c.height);

  particles = particles.filter(p => p.life > 0);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.35;  // gravity
    p.vx *= 0.99;
    p.life -= p.decay;
    p.rotation += p.rotationSpeed;

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;

    if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (particles.length > 0) {
    rafId = requestAnimationFrame(loop);
  } else {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    ctx2d!.clearRect(0, 0, canvas!.width, canvas!.height);
  }
}

export function burstCrit(originEl: HTMLElement, count = 60) {
  const rect = originEl.getBoundingClientRect();
  const ox = rect.left + rect.width / 2;
  const oy = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 10;
    particles.push({
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      life: 1,
      decay: 0.012 + Math.random() * 0.015,
      size: 4 + Math.random() * 8,
      color: CRIT_COLORS[Math.floor(Math.random() * CRIT_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    });
  }

  if (rafId === null) {
    rafId = requestAnimationFrame(loop);
  }
}
