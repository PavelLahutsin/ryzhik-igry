/**
 * Audio stub: soft synthesized tones, no files, no network. Real voice and
 * sounds can replace this later behind the same `audio.play(kind)` call.
 * Silent until the first tap (browsers require a gesture) and when the
 * player turns sound off on the home screen.
 */
import { platform } from "./platform";

export type SoundKind =
  | "tap"
  | "pick"
  | "snap"
  | "miss"
  | "merge"
  | "win"
  | "pop"
  | "boing"
  | "yum"
  | "yuck"
  | "whoosh"
  | "chop"
  | "sizzle"
  | "bubble"
  | "blend"
  | "ding"
  | "honk"
  | "tweet"
  | "drip"
  | "magic"
  | "note";

/** [frequency Hz, length s, wave, slide-to Hz]. "noise" is a short hiss. */
type Tone = [number, number, OscillatorType?, number?];

const TONES: Record<SoundKind, Array<Tone | "noise">> = {
  tap: [[660, 0.06]],
  pick: [[520, 0.07]],
  snap: [[784, 0.08], [1046, 0.1]],
  miss: [[330, 0.12]],
  merge: [[659, 0.07], [880, 0.09]],
  win: [[523, 0.12], [659, 0.12], [784, 0.12], [1046, 0.22]],
  pop: [[900, 0.07, "sine", 1500]],
  boing: [[220, 0.25, "triangle", 520]],
  yum: [[523, 0.1, "triangle"], [659, 0.1, "triangle"], [880, 0.16, "triangle"]],
  yuck: [[300, 0.18, "sawtooth", 180], [200, 0.22, "sawtooth", 140]],
  whoosh: ["noise"],
  chop: [[180, 0.05, "square", 90]],
  sizzle: ["noise", "noise"],
  bubble: [[400, 0.06, "sine", 900], [500, 0.06, "sine", 1000]],
  blend: [[120, 0.4, "sawtooth", 160]],
  ding: [[1318, 0.25]],
  honk: [[330, 0.12, "square"], [330, 0.16, "square"]],
  tweet: [[2000, 0.06, "sine", 2600], [2200, 0.07, "sine", 2900]],
  drip: [[1200, 0.08, "sine", 500]],
  magic: [[784, 0.08], [988, 0.08], [1175, 0.08], [1568, 0.16]],
  note: [[523, 0.18, "triangle"]],
};

/** Notes for the toy piano / radio, C major. */
export const NOTES = [523, 587, 659, 698, 784, 880, 988, 1046];

let ctx: AudioContext | null = null;
let enabled = true;
const KEY = "sound";

void platform.storage.get<boolean>(KEY).then((value) => {
  if (value === false) enabled = false;
});

function context(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

export const audio = {
  get enabled(): boolean {
    return enabled;
  },
  setEnabled(value: boolean): void {
    enabled = value;
    void platform.storage.set(KEY, value);
  },
  /** Call from a user gesture once; later sounds can then play. */
  unlock(): void {
    const c = context();
    if (c && c.state === "suspended") void c.resume();
  },
  play(kind: SoundKind): void {
    if (!enabled) return;
    const c = context();
    if (!c || c.state !== "running") return;
    let at = c.currentTime;
    for (const tone of TONES[kind]) {
      if (tone === "noise") {
        noise(c, at, 0.18);
        at += 0.12;
        continue;
      }
      const [freq, length, wave = "sine", slide] = tone;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, at);
      if (slide) osc.frequency.exponentialRampToValueAtTime(slide, at + length);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.12, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
      osc.connect(gain).connect(c.destination);
      osc.start(at);
      osc.stop(at + length + 0.02);
      at += length * 0.85;
    }
  },
  /** One soft note (toy piano, radio). */
  tone(freq: number, length = 0.22): void {
    if (!enabled) return;
    const c = context();
    if (!c || c.state !== "running") return;
    const at = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.12, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain).connect(c.destination);
    osc.start(at);
    osc.stop(at + length + 0.02);
  },
};

function noise(c: AudioContext, at: number, length: number): void {
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * length), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  const gain = c.createGain();
  gain.gain.value = 0.1;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(at);
}
