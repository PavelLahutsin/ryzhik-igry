/**
 * Sound for all games: soft synthesized effects and a quiet optional music
 * loop, no files and no network. Recorded voice lines for Ryzhik can be
 * dropped into src/shared/voice/<id>.mp3 later; `audio.say(id)` plays them
 * when present (see NEEDED_ASSETS.json for the phrase list).
 *
 * Nothing sounds until the first tap (browsers require a gesture), and
 * nothing sounds when the grown-up turns effects off in «Родителям».
 * Music has its own switch and is off by default.
 */
import { platform } from "./platform";
import { recipe, type SoundKind, SOUND_KINDS } from "./sounds";
import { melodyFor, musicFor } from "./music";

export type { SoundKind };
export { SOUND_KINDS };

/** Notes for the toy piano / radio, C major. */
export const NOTES = [523, 587, 659, 698, 784, 880, 988, 1046];

let ctx: AudioContext | null = null;
let fx: GainNode | null = null;
let musicBus: GainNode | null = null;
let enabled = true;
let musicOn = false;
let theme = "home";
const KEY = "sound";
const MUSIC_KEY = "music";

void platform.storage.get<boolean>(KEY).then((value) => {
  if (value === false) enabled = false;
});
void platform.storage.get<boolean>(MUSIC_KEY).then((value) => {
  if (value === true) musicOn = true;
});

function context(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    // A gentle limiter keeps several sounds at once from getting loud.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.ratio.value = 6;
    limiter.connect(ctx.destination);
    fx = ctx.createGain();
    fx.gain.value = 0.9;
    fx.connect(limiter);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.35;
    musicBus.connect(limiter);
  } catch {
    ctx = null;
  }
  return ctx;
}

function ready(): AudioContext | null {
  if (!enabled) return null;
  const c = context();
  return c && c.state === "running" ? c : null;
}

// ---------------------------------------------------------------- voice
const VOICE = import.meta.glob("./voice/*.{mp3,ogg,m4a}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
let voicePlaying: HTMLAudioElement | null = null;

// ---------------------------------------------------------------- music
let musicTimer = 0;
let musicStep = 0;
let musicNext = 0;

function musicTick(): void {
  const c = ready();
  if (!c || !musicOn || !musicBus || document.hidden) return;
  const song = musicFor(theme);
  if (!song) return;
  // Schedule a little ahead so timers never stutter the beat.
  if (musicNext < c.currentTime) musicNext = c.currentTime + 0.05;
  while (musicNext < c.currentTime + 0.6) {
    const beat = song.beat;
    const note = song.notes[musicStep % song.notes.length]!;
    const bass = song.bass[Math.floor(musicStep / 4) % song.bass.length]!;
    if (note > 0) softNote(c, musicBus, musicNext, note, beat * 0.9, song.wave, 0.05);
    if (musicStep % 4 === 0 && bass > 0) softNote(c, musicBus, musicNext, bass, beat * 3.6, "sine", 0.045);
    musicNext += beat;
    musicStep++;
  }
}

function softNote(c: AudioContext, out: AudioNode, at: number, freq: number, len: number, wave: OscillatorType, vol: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = wave;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + len + 0.05);
}

function syncMusic(): void {
  const want = enabled && musicOn && Boolean(musicFor(theme));
  if (want && !musicTimer) {
    musicStep = 0;
    musicNext = 0;
    musicTimer = window.setInterval(musicTick, 200);
  } else if (!want && musicTimer) {
    clearInterval(musicTimer);
    musicTimer = 0;
  }
}

export const audio = {
  get enabled(): boolean {
    return enabled;
  },
  setEnabled(value: boolean): void {
    enabled = value;
    void platform.storage.set(KEY, value);
    if (!value) voicePlaying?.pause();
    syncMusic();
  },
  get music(): boolean {
    return musicOn;
  },
  setMusic(value: boolean): void {
    musicOn = value;
    void platform.storage.set(MUSIC_KEY, value);
    syncMusic();
  },
  /** Which game is open: picks its win tune and music. */
  setTheme(id: string): void {
    theme = id;
    musicStep = 0;
    syncMusic();
  },
  get theme(): string {
    return theme;
  },
  /** Call from a user gesture once; later sounds can then play. */
  unlock(): void {
    const c = context();
    if (c && c.state === "suspended") void c.resume();
    syncMusic();
  },
  play(kind: SoundKind): void {
    const c = ready();
    if (!c || !fx) return;
    if (kind === "win") {
      // Every game has its own short tune.
      melodyFor(theme).forEach(([f, len], i, all) => {
        const at = c.currentTime + all.slice(0, i).reduce((s, n) => s + n[1], 0);
        softNote(c, fx!, at, f, len * 1.6, "triangle", 0.13);
        softNote(c, fx!, at, f * 2, len * 0.9, "sine", 0.03);
      });
      return;
    }
    recipe(kind)(c, fx, c.currentTime);
  },
  /** The i-th star of a praise card lighting up (rising chime). */
  star(i: number): void {
    const c = ready();
    if (!c || !fx) return;
    const f = [1046, 1318, 1568][Math.min(2, i)]!;
    softNote(c, fx, c.currentTime, f, 0.5, "sine", 0.11);
    softNote(c, fx, c.currentTime + 0.03, f * 2, 0.3, "sine", 0.03);
  },
  /** One soft note (toy piano, radio). */
  tone(freq: number, length = 0.22): void {
    const c = ready();
    if (!c || !fx) return;
    softNote(c, fx, c.currentTime, freq, length, "triangle", 0.12);
  },
  /**
   * Ryzhik says a phrase when a recording exists (src/shared/voice/<id>.mp3).
   * Returns false when there is no recording yet, so callers keep the text.
   */
  say(id: string): boolean {
    const url = VOICE[`./voice/${id}.mp3`] ?? VOICE[`./voice/${id}.ogg`] ?? VOICE[`./voice/${id}.m4a`];
    if (!url || !enabled) return false;
    voicePlaying?.pause();
    const a = new Audio(url);
    a.volume = 0.9;
    voicePlaying = a;
    void a.play().catch(() => {});
    return true;
  },
  hasVoice(id: string): boolean {
    return Object.keys(VOICE).some((k) => k.startsWith(`./voice/${id}.`));
  },
};

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) voicePlaying?.pause();
  });
}
