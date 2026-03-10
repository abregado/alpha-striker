/** Procedural sound effects via Web Audio API. */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Resume context after a user gesture (required by browsers). */
export function resumeAudio() {
  getCtx().resume();
}

// ── Audio file loading (try file first, fall back to procedural) ────────────
const BASE_URL: string = import.meta.env.BASE_URL;
const fileCache = new Map<string, AudioBuffer | null>();

async function loadBuffer(filename: string): Promise<AudioBuffer | null> {
  const path = `${BASE_URL}audio/${filename}`;
  if (fileCache.has(path)) return fileCache.get(path)!;
  try {
    const res = await fetch(path);
    if (!res.ok) { fileCache.set(path, null); return null; }
    const buf = await getCtx().decodeAudioData(await res.arrayBuffer());
    fileCache.set(path, buf);
    return buf;
  } catch {
    fileCache.set(path, null);
    return null;
  }
}

function playBuffer(buf: AudioBuffer): void {
  try {
    const src = getCtx().createBufferSource();
    src.buffer = buf;
    src.connect(getCtx().destination);
    src.start();
  } catch { /* silently ignore */ }
}

function playFileOrFallback(filename: string, fallback: () => void): void {
  void loadBuffer(filename).then(buf => buf ? playBuffer(buf) : fallback());
}

/**
 * Preload all weapon audio files in the background.
 * Place MP3s in public/audio/ using the filenames below.
 * If a file is missing the procedural fallback plays automatically.
 *   laser-shoot.mp3  laser-hit.mp3  laser-miss.mp3
 *   ballistic-shoot.mp3  ballistic-hit.mp3  ballistic-miss.mp3
 *   missile-shoot.mp3  missile-hit.mp3  missile-miss.mp3
 *   crit.mp3
 */
export function preloadAudio(): void {
  const files = [
    'laser-shoot.mp3', 'laser-hit.mp3', 'laser-miss.mp3',
    'ballistic-shoot.mp3', 'ballistic-hit.mp3', 'ballistic-miss.mp3',
    'missile-shoot.mp3', 'missile-hit.mp3', 'missile-miss.mp3',
    'crit.mp3',
  ];
  files.forEach(f => void loadBuffer(f));
}

function gain(ac: AudioContext, value: number, at = 0): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(value, at);
  return g;
}

/** Short tick/click sound for cycling numbers. */
export function playTick() {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = gain(ac, 0.08);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(220 + Math.random() * 80, ac.currentTime);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.04);
    osc.stop(ac.currentTime + 0.04);
  } catch { /* silently ignore */ }
}

/** Dice-rolling rumble. */
export function playRoll() {
  try {
    const ac = getCtx();
    const bufSize = ac.sampleRate * 0.35;
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 180;
    filter.Q.value = 0.8;
    const g = gain(ac, 0.5);
    src.connect(filter); filter.connect(g); g.connect(ac.destination);
    src.start();
  } catch { /* silently ignore */ }
}

/** Hit impact: a short metallic clang. */
export function playHit() {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = gain(ac, 0.5);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 0.25);
    osc.start();
    g.gain.setValueAtTime(0.5, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.3);
    osc.stop(ac.currentTime + 0.3);
  } catch { /* silently ignore */ }
}

/** Critical hit: deep boom + harmonic overtones. */
export function playCrit() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    // Sub boom
    (() => {
      const osc = ac.createOscillator();
      const g = gain(ac, 1.0);
      osc.connect(g); g.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.6);
      osc.start(t);
      g.gain.setValueAtTime(1.0, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.stop(t + 0.6);
    })();
    // High crack
    (() => {
      const osc = ac.createOscillator();
      const g = gain(ac, 0.4);
      osc.connect(g); g.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
      osc.start(t);
      g.gain.setValueAtTime(0.4, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.stop(t + 0.15);
    })();
    // Noise burst
    (() => {
      const bufSize = ac.sampleRate * 0.2;
      const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      const src = ac.createBufferSource();
      src.buffer = buf;
      const g = gain(ac, 0.6);
      src.connect(g); g.connect(ac.destination);
      src.start(t);
    })();
  } catch { /* silently ignore */ }
}

// ── Weapon-type sounds ─────────────────────────────────────────────────────

function playLaserShoot() {
  try {
    const ac = getCtx(); const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.0001, t);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(2800, t + 0.13);
    osc.start(t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.stop(t + 0.16);
  } catch { /* silently ignore */ }
}

function playLaserHit() {
  try {
    const ac = getCtx(); const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.45);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2600, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.13);
    osc.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.stop(t + 0.15);
    // Spark noise
    const bufSize = Math.floor(ac.sampleRate * 0.07);
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500;
    const gn = gain(ac, 0.35);
    src.connect(f); f.connect(gn); gn.connect(ac.destination);
    src.start(t);
  } catch { /* silently ignore */ }
}

function playLaserMiss() {
  try {
    const ac = getCtx(); const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.12);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.28);
    osc.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.stop(t + 0.3);
  } catch { /* silently ignore */ }
}

function playBallisticShoot() {
  try {
    const ac = getCtx();
    const bufSize = Math.floor(ac.sampleRate * 0.07);
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 0.4);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 380; f.Q.value = 1.2;
    const g = gain(ac, 0.9);
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start();
  } catch { /* silently ignore */ }
}

function playBallisticHit() {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = gain(ac, 0.5);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 0.25);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.3);
    osc.stop(ac.currentTime + 0.3);
  } catch { /* silently ignore */ }
}

function playBallisticMiss() {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = gain(ac, 0.15);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ac.currentTime + 0.2);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.2);
    osc.stop(ac.currentTime + 0.2);
  } catch { /* silently ignore */ }
}

function playMissileShoot() {
  try {
    const ac = getCtx(); const t = ac.currentTime;
    const bufSize = Math.floor(ac.sampleRate * 0.28);
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (i / bufSize);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.8;
    f.frequency.setValueAtTime(180, t);
    f.frequency.exponentialRampToValueAtTime(2000, t + 0.28);
    const g = gain(ac, 0.55);
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start(t);
  } catch { /* silently ignore */ }
}

function playMissileHit() {
  try {
    const ac = getCtx(); const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 1.2);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, t);
    osc.frequency.exponentialRampToValueAtTime(16, t + 0.55);
    osc.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.stop(t + 0.55);
    // Explosion noise
    const bufSize = Math.floor(ac.sampleRate * 0.38);
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 650;
    const gn = gain(ac, 0.7);
    src.connect(f); f.connect(gn); gn.connect(ac.destination);
    src.start(t);
  } catch { /* silently ignore */ }
}

function playMissileMiss() {
  try {
    const ac = getCtx(); const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.0001, t);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.38);
    osc.start(t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.stop(t + 0.4);
  } catch { /* silently ignore */ }
}

const WEAPON_FILES = [
  ['laser-shoot.mp3',    'laser-hit.mp3',    'laser-miss.mp3'],
  ['ballistic-shoot.mp3','ballistic-hit.mp3','ballistic-miss.mp3'],
  ['missile-shoot.mp3',  'missile-hit.mp3',  'missile-miss.mp3'],
] as const;

const WEAPON_PROC: Array<[() => void, () => void, () => void]> = [
  [playLaserShoot,    playLaserHit,    playLaserMiss],
  [playBallisticShoot,playBallisticHit,playBallisticMiss],
  [playMissileShoot,  playMissileHit,  playMissileMiss],
];

export function playWeaponShoot(type: number): void {
  playFileOrFallback(WEAPON_FILES[type]?.[0] ?? 'laser-shoot.mp3', WEAPON_PROC[type]?.[0] ?? playLaserShoot);
}
export function playWeaponHit(type: number): void {
  playFileOrFallback(WEAPON_FILES[type]?.[1] ?? 'laser-hit.mp3', WEAPON_PROC[type]?.[1] ?? playLaserHit);
}
export function playWeaponMiss(type: number): void {
  playFileOrFallback(WEAPON_FILES[type]?.[2] ?? 'laser-miss.mp3', WEAPON_PROC[type]?.[2] ?? playLaserMiss);
}
export function playWeaponCrit(): void {
  playFileOrFallback('crit.mp3', playCrit);
}

/** Miss: quiet soft thud. */
export function playMiss() {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = gain(ac, 0.15);
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ac.currentTime + 0.2);
    osc.start();
    g.gain.setValueAtTime(0.15, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.2);
    osc.stop(ac.currentTime + 0.2);
  } catch { /* silently ignore */ }
}
