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
