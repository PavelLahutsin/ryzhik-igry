/**
 * Audio stub: soft synthesized tones, no files, no network. Real voice and
 * sounds can replace this later behind the same `audio.play(kind)` call.
 * Silent until the first tap (browsers require a gesture) and when the
 * player turns sound off on the home screen.
 */
import { platform } from "./platform";

export type SoundKind = "tap" | "pick" | "snap" | "miss" | "merge" | "win";

const TONES: Record<SoundKind, Array<[number, number]>> = {
  tap: [[660, 0.06]],
  pick: [[520, 0.07]],
  snap: [[784, 0.08], [1046, 0.1]],
  miss: [[330, 0.12]],
  merge: [[659, 0.07], [880, 0.09]],
  win: [[523, 0.12], [659, 0.12], [784, 0.12], [1046, 0.22]],
};

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
    for (const [freq, length] of TONES[kind]) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.12, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
      osc.connect(gain).connect(c.destination);
      osc.start(at);
      osc.stop(at + length + 0.02);
      at += length * 0.85;
    }
  },
};
