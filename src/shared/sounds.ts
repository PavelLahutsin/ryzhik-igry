/**
 * Synthesized sound recipes. Each recipe schedules a few oscillators or
 * filtered noise bursts at time `t`. Volumes stay low (peak ≈ 0.14) — these
 * are for small ears.
 */

export const SOUND_KINDS = [
  // common
  "tap", "click", "pick", "drop", "snap", "miss", "boing", "merge", "win", "pop", "sparkle", "reveal", "magic", "whoosh", "note", "ding",
  // kitchen
  "yum", "munch", "yuck", "chop", "sizzle", "bubble", "blend", "pour",
  // professions
  "siren", "spray", "thump", "beep", "plaster", "till", "coin", "rustle",
  // building
  "clack", "chug", "toot", "rocket", "honk", "splash",
  // nature & animals
  "tweet", "drip", "meow", "woof", "frog", "owl", "squirrel", "hedgehog", "bear", "bee", "cricket",
  // kartinka & coloring
  "buzz", "powerup", "hurt", "flip",
] as const;

export type SoundKind = (typeof SOUND_KINDS)[number];
type Recipe = (c: AudioContext, out: AudioNode, t: number) => void;

type ToneOpts = { type?: OscillatorType; vol?: number; to?: number; attack?: number; vibrato?: number };

function tone(c: AudioContext, out: AudioNode, t: number, f: number, len: number, o: ToneOpts = {}): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(f, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + len);
  if (o.vibrato) {
    const lfo = c.createOscillator();
    const depth = c.createGain();
    lfo.frequency.value = o.vibrato;
    depth.gain.value = f * 0.04;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + len + 0.05);
  }
  const vol = o.vol ?? 0.12;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + (o.attack ?? 0.012));
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + len + 0.05);
}

type NoiseOpts = { freq?: number; to?: number; q?: number; type?: BiquadFilterType; vol?: number; attack?: number };

const buffers = new WeakMap<AudioContext, AudioBuffer>();
function whiteNoise(c: AudioContext): AudioBuffer {
  let b = buffers.get(c);
  if (!b) {
    b = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    buffers.set(c, b);
  }
  return b;
}

function noise(c: AudioContext, out: AudioNode, t: number, len: number, o: NoiseOpts = {}): void {
  const src = c.createBufferSource();
  src.buffer = whiteNoise(c);
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = o.type ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 1800, t);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + len);
  f.Q.value = o.q ?? 1;
  const g = c.createGain();
  const vol = o.vol ?? 0.1;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + (o.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(f).connect(g).connect(out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + len + 0.05);
}

const seq = (c: AudioContext, out: AudioNode, t: number, notes: Array<[number, number]>, o: ToneOpts = {}): void => {
  let at = t;
  for (const [f, len] of notes) {
    tone(c, out, at, f, len * 1.3, o);
    at += len;
  }
};

const R: Record<SoundKind, Recipe> = {
  tap: (c, o, t) => tone(c, o, t, 660, 0.06, { vol: 0.08 }),
  click: (c, o, t) => {
    noise(c, o, t, 0.03, { freq: 3000, q: 4, vol: 0.06 });
    tone(c, o, t, 880, 0.04, { vol: 0.05, type: "triangle" });
  },
  pick: (c, o, t) => tone(c, o, t, 440, 0.09, { to: 620, vol: 0.09, type: "triangle" }),
  drop: (c, o, t) => tone(c, o, t, 520, 0.1, { to: 300, vol: 0.08, type: "triangle" }),
  snap: (c, o, t) => {
    noise(c, o, t, 0.04, { freq: 2500, q: 3, vol: 0.07 });
    seq(c, o, t + 0.01, [[784, 0.07], [1046, 0.1]], { vol: 0.1 });
  },
  // v12: a soft rubbery «boing» — a miss should not sound like a scolding.
  miss: (c, o, t) => {
    tone(c, o, t, 210, 0.12, { to: 290, vol: 0.055, type: "sine", vibrato: 11 });
    tone(c, o, t + 0.1, 290, 0.16, { to: 200, vol: 0.045, type: "sine" });
  },
  boing: (c, o, t) => tone(c, o, t, 200, 0.32, { to: 420, vol: 0.09, type: "triangle", vibrato: 14 }),
  merge: (c, o, t) => seq(c, o, t, [[659, 0.06], [880, 0.07], [1175, 0.1]], { vol: 0.09 }),
  win: (c, o, t) => seq(c, o, t, [[523, 0.12], [659, 0.12], [784, 0.12], [1046, 0.24]], { type: "triangle" }),
  pop: (c, o, t) => tone(c, o, t, 700, 0.08, { to: 1500, vol: 0.1 }),
  sparkle: (c, o, t) => {
    [1568, 2093, 1760, 2349, 2637].forEach((f, i) => tone(c, o, t + i * 0.05, f, 0.18, { vol: 0.045 }));
  },
  reveal: (c, o, t) => {
    noise(c, o, t, 0.5, { freq: 600, to: 4000, q: 0.8, vol: 0.05, attack: 0.2 });
    seq(c, o, t + 0.15, [[784, 0.08], [988, 0.08], [1318, 0.2]], { vol: 0.07 });
  },
  magic: (c, o, t) => {
    seq(c, o, t, [[784, 0.07], [988, 0.07], [1175, 0.07], [1568, 0.18]], { vol: 0.09 });
    [2093, 2637].forEach((f, i) => tone(c, o, t + 0.3 + i * 0.06, f, 0.2, { vol: 0.03 }));
  },
  whoosh: (c, o, t) => noise(c, o, t, 0.35, { freq: 400, to: 3000, q: 0.7, vol: 0.08, attack: 0.12 }),
  note: (c, o, t) => tone(c, o, t, 523, 0.2, { type: "triangle" }),
  ding: (c, o, t) => {
    tone(c, o, t, 1318, 0.6, { vol: 0.1 });
    tone(c, o, t, 2637, 0.3, { vol: 0.025 });
  },
  // ---- kitchen
  yum: (c, o, t) => seq(c, o, t, [[523, 0.1], [659, 0.1], [880, 0.18]], { type: "triangle", vol: 0.1 }),
  munch: (c, o, t) => {
    for (let i = 0; i < 3; i++) noise(c, o, t + i * 0.13, 0.08, { freq: 700, q: 2, vol: 0.09 });
  },
  yuck: (c, o, t) => seq(c, o, t, [[300, 0.16], [200, 0.22]], { type: "sawtooth", vol: 0.05, to: 150 }),
  chop: (c, o, t) => {
    noise(c, o, t, 0.05, { freq: 1200, q: 3, vol: 0.12 });
    tone(c, o, t, 160, 0.06, { to: 90, vol: 0.1, type: "square" });
  },
  sizzle: (c, o, t) => noise(c, o, t, 0.9, { freq: 6000, type: "highpass", vol: 0.04, attack: 0.08 }),
  bubble: (c, o, t) => {
    for (let i = 0; i < 4; i++) tone(c, o, t + i * 0.11, 300 + Math.random() * 200, 0.07, { to: 900 + Math.random() * 300, vol: 0.06 });
  },
  blend: (c, o, t) => {
    tone(c, o, t, 110, 0.7, { to: 170, vol: 0.05, type: "sawtooth", attack: 0.1, vibrato: 30 });
    noise(c, o, t, 0.7, { freq: 900, q: 1.5, vol: 0.04, attack: 0.1 });
  },
  pour: (c, o, t) => noise(c, o, t, 0.5, { freq: 1500, to: 700, q: 3, vol: 0.06, attack: 0.05 }),
  // ---- professions
  siren: (c, o, t) => {
    for (let i = 0; i < 2; i++) {
      tone(c, o, t + i * 0.6, 660, 0.3, { to: 880, type: "triangle", vol: 0.06, attack: 0.05 });
      tone(c, o, t + i * 0.6 + 0.3, 880, 0.3, { to: 660, type: "triangle", vol: 0.06, attack: 0.05 });
    }
  },
  spray: (c, o, t) => noise(c, o, t, 0.45, { freq: 3500, q: 0.8, vol: 0.06, attack: 0.04 }),
  thump: (c, o, t) => {
    tone(c, o, t, 90, 0.12, { to: 55, vol: 0.14 });
    tone(c, o, t + 0.22, 85, 0.1, { to: 55, vol: 0.11 });
  },
  beep: (c, o, t) => seq(c, o, t, [[1760, 0.08], [1760, 0.08]], { vol: 0.05, type: "square" }),
  plaster: (c, o, t) => {
    noise(c, o, t, 0.12, { freq: 2500, to: 5000, q: 1.5, vol: 0.06 });
    tone(c, o, t + 0.12, 520, 0.08, { to: 700, vol: 0.06 });
  },
  till: (c, o, t) => {
    noise(c, o, t, 0.06, { freq: 3000, q: 2, vol: 0.06 });
    tone(c, o, t + 0.06, 2093, 0.5, { vol: 0.09 });
    tone(c, o, t + 0.06, 2637, 0.4, { vol: 0.04 });
  },
  coin: (c, o, t) => seq(c, o, t, [[1318, 0.05], [1976, 0.16]], { vol: 0.07, type: "square" }),
  rustle: (c, o, t) => noise(c, o, t, 0.2, { freq: 4000, q: 0.6, vol: 0.05, attack: 0.03 }),
  // ---- building
  clack: (c, o, t) => {
    noise(c, o, t, 0.03, { freq: 2200, q: 5, vol: 0.12 });
    tone(c, o, t, 600, 0.05, { to: 400, vol: 0.06, type: "square" });
  },
  chug: (c, o, t) => {
    for (let i = 0; i < 4; i++) noise(c, o, t + i * 0.18, 0.12, { freq: 500, q: 1, vol: 0.08 });
  },
  toot: (c, o, t) => {
    tone(c, o, t, 587, 0.5, { type: "triangle", vol: 0.08, attack: 0.05 });
    tone(c, o, t, 740, 0.5, { type: "triangle", vol: 0.06, attack: 0.05 });
  },
  rocket: (c, o, t) => {
    noise(c, o, t, 1.2, { freq: 200, to: 2500, q: 0.6, vol: 0.09, attack: 0.3 });
    tone(c, o, t, 80, 1.2, { to: 300, vol: 0.04, type: "sawtooth", attack: 0.3 });
  },
  honk: (c, o, t) => seq(c, o, t, [[330, 0.12], [330, 0.18]], { type: "square", vol: 0.05 }),
  splash: (c, o, t) => noise(c, o, t, 0.4, { freq: 1200, to: 400, q: 0.8, vol: 0.09 }),
  // ---- nature & animals
  tweet: (c, o, t) => seq(c, o, t, [[2000, 0.06], [2400, 0.07], [2200, 0.06]], { to: 2900, vol: 0.05 }),
  drip: (c, o, t) => tone(c, o, t, 1200, 0.1, { to: 500, vol: 0.08 }),
  meow: (c, o, t) => tone(c, o, t, 600, 0.5, { to: 420, type: "triangle", vol: 0.07, attack: 0.08, vibrato: 6 }),
  woof: (c, o, t) => {
    for (let i = 0; i < 2; i++) {
      tone(c, o, t + i * 0.22, 260, 0.12, { to: 150, type: "sawtooth", vol: 0.05 });
      noise(c, o, t + i * 0.22, 0.1, { freq: 600, q: 1, vol: 0.05 });
    }
  },
  frog: (c, o, t) => {
    for (let i = 0; i < 2; i++) tone(c, o, t + i * 0.2, 180, 0.12, { to: 120, type: "square", vol: 0.04, vibrato: 40 });
  },
  owl: (c, o, t) => seq(c, o, t, [[440, 0.25], [392, 0.4]], { vol: 0.06, attack: 0.06 }),
  squirrel: (c, o, t) => {
    for (let i = 0; i < 5; i++) tone(c, o, t + i * 0.06, 2600, 0.04, { to: 1800, vol: 0.04 });
  },
  hedgehog: (c, o, t) => {
    for (let i = 0; i < 3; i++) noise(c, o, t + i * 0.12, 0.07, { freq: 2000, q: 2, vol: 0.06 });
  },
  bear: (c, o, t) => tone(c, o, t, 140, 0.6, { to: 110, type: "sawtooth", vol: 0.04, attack: 0.1, vibrato: 8 }),
  bee: (c, o, t) => tone(c, o, t, 220, 0.6, { to: 260, type: "sawtooth", vol: 0.03, attack: 0.05, vibrato: 25 }),
  cricket: (c, o, t) => {
    for (let i = 0; i < 6; i++) tone(c, o, t + i * 0.05, 4200, 0.03, { vol: 0.025 });
  },
  // ---- kartinka & coloring
  buzz: (c, o, t) => tone(c, o, t, 180, 0.35, { to: 140, type: "sawtooth", vol: 0.04, vibrato: 30 }),
  powerup: (c, o, t) => seq(c, o, t, [[523, 0.05], [659, 0.05], [784, 0.05], [1046, 0.05], [1318, 0.14]], { vol: 0.07, type: "square" }),
  hurt: (c, o, t) => tone(c, o, t, 500, 0.35, { to: 200, type: "triangle", vol: 0.09 }),
  flip: (c, o, t) => noise(c, o, t, 0.18, { freq: 1500, to: 4000, q: 0.7, vol: 0.06, attack: 0.04 }),
};

export function recipe(kind: SoundKind): Recipe {
  return R[kind] ?? R.tap;
}
