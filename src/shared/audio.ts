/**
 * Sound for all games: soft synthesized effects and a quiet optional music
 * loop. Recorded files are optional: public/audio/voice/vNN.mp3 (Ryzhik's
 * phrases, `audio.say("v03")`) and public/audio/music/mNN.mp3 (music per
 * world, m12 = win jingle) are used when present, otherwise the synthesized
 * sounds play (see voice-lines.ts and public/audio/README.md).
 *
 * Nothing sounds until the first tap (browsers require a gesture), and
 * nothing sounds when the grown-up turns effects off in «Родителям».
 * Music has its own switch (on by default; the 🎵 button on the menu and
 * «Родителям»): switching music off never silences effects or the voice.
 *
 * v22 mixing: effects, Ryzhik's voice and the recorded music all go through
 * one WebAudio graph, so their volumes hold on every phone (iOS ignores
 * HTMLMediaElement.volume, so the track used to play at full volume and hid
 * the animals). While an effect on a channel (a touched toy or animal) or a
 * voice line plays, the music ducks and comes back afterwards. On iOS the
 * page asks for the «playback» audio session, so WebAudio is not muted by the
 * ring/silent switch when no music element is playing (before, effects were
 * silent on a muted iPhone as soon as the music was off).
 */
import { platform } from "./platform";
import { recipe, type SoundKind, SOUND_KINDS } from "./sounds";
import { melodyFor, musicFor } from "./music";
import { MUSIC_FILES, WIN_JINGLE } from "./voice-lines";
import audioFiles from "virtual:audio-files";

export type { SoundKind };
export { SOUND_KINDS };

/** Notes for the toy piano / radio, C major. */
export const NOTES = [523, 587, 659, 698, 784, 880, 988, 1046];

let ctx: AudioContext | null = null;
let fx: GainNode | null = null;
let musicBus: GainNode | null = null;
/** Everything musical (synth loop and recorded track) passes here: the ducking knob. */
let musicOut: GainNode | null = null;
/** Ryzhik's voice, straight to the speakers (the recordings are mastered). */
let voiceBus: GainNode | null = null;
let enabled = true;
// Music is on unless a parent switched it off in «Родителям» (v16: the
// recorded tracks are in, so the menu has its melody from the first tap).
let musicOn = true;
let theme = "home";
const KEY = "sound";
const MUSIC_KEY = "music";

void Promise.all([
  platform.storage.get<boolean>(KEY).then((value) => {
    if (value === false) enabled = false;
  }),
  platform.storage.get<boolean>(MUSIC_KEY).then((value) => {
    if (value === false) musicOn = false;
  }),
]).then(() => syncMusic());

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
    musicOut = ctx.createGain();
    musicOut.gain.value = 1;
    musicOut.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.35;
    musicBus.connect(musicOut);
    voiceBus = ctx.createGain();
    voiceBus.gain.value = 0.95;
    voiceBus.connect(ctx.destination);
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

/** Wake the context from a gesture (iOS also reports "interrupted" after a call). */
function resume(c: AudioContext): Promise<void> {
  return c.state === "running" ? Promise.resolve() : c.resume().catch(() => undefined);
}

let sessionAsked = false;
/**
 * iOS mutes WebAudio with the ring/silent switch unless the page plays as
 * media. Safari 17+ lets the page say so; older iOS gets one silent media
 * play inside the first gesture, which switches the page to playback too.
 */
function askPlaybackSession(): void {
  if (sessionAsked || typeof navigator === "undefined") return;
  sessionAsked = true;
  const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
  if (session) {
    try {
      session.type = "playback";
      return;
    } catch {
      // fall through to the silent clip
    }
  }
  if (typeof Audio === "undefined") return;
  try {
    const a = new Audio(SILENT_WAV);
    a.setAttribute("playsinline", "");
    void a.play().catch(() => undefined);
  } catch {
    // nothing to do
  }
}

/** 0.05 s of silence, 8 kHz mono 8-bit WAV, built here (no file, no network). */
const SILENT_WAV = ((): string => {
  const n = 400;
  const bytes = new Uint8Array(44 + n);
  const v = new DataView(bytes.buffer);
  const str = (o: number, t: string): void => [...t].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + n, true);
  str(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true);
  v.setUint32(28, 8000, true);
  v.setUint16(32, 1, true);
  v.setUint16(34, 8, true);
  str(36, "data");
  v.setUint32(40, n, true);
  bytes.fill(128, 44);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `data:audio/wav;base64,${typeof btoa === "function" ? btoa(bin) : ""}`;
})();

// ---------------------------------------------------------------- ducking
/** How loud the music stays under an effect / under the voice (share of normal). */
export const DUCK_FX = 0.25;
export const DUCK_VOICE = 0.3;
let duckUntil = 0;
let voiceDucks = 0;

/** Music down now, back up after `seconds` (or when the voice ends). */
function duck(level: number, seconds: number): void {
  const c = ctx;
  const now = c?.currentTime ?? 0;
  duckUntil = Math.max(duckUntil, now + seconds);
  if (c && musicOut) {
    const g = musicOut.gain;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(Math.min(level, voiceDucks > 0 ? DUCK_VOICE : 1), now, 0.03);
    if (voiceDucks === 0) g.setTargetAtTime(1, duckUntil, 0.25);
  }
  // A track outside WebAudio (no context yet): its own volume, where the browser allows.
  if (track && !trackRouted) {
    track.volume = TRACK_VOLUME * Math.min(level, voiceDucks > 0 ? DUCK_VOICE : 1);
    const t = track;
    setTimeout(() => {
      if (track === t && voiceDucks === 0) t.volume = TRACK_VOLUME;
    }, seconds * 1000);
  }
}

function voiceDuckStart(): void {
  voiceDucks++;
  duck(DUCK_VOICE, 0.1);
}

function voiceDuckEnd(): void {
  voiceDucks = Math.max(0, voiceDucks - 1);
  if (voiceDucks > 0) return;
  const c = ctx;
  if (c && musicOut) {
    const now = c.currentTime;
    musicOut.gain.cancelScheduledValues(now);
    musicOut.gain.setTargetAtTime(1, Math.max(now, duckUntil), 0.25);
  }
  if (track && !trackRouted) track.volume = TRACK_VOLUME;
}

// ---------------------------------------------------------------- files
// Optional recordings (public/audio); the list comes from vite.config.ts.
const BASE = (import.meta.env?.BASE_URL as string | undefined) ?? "/";
export const fileUrl = (kind: "voice" | "music", id: string): string => `${BASE}audio/${kind}/${id}.mp3`;
const present = new Set([...audioFiles.voice, ...audioFiles.music]);

/** Is the optional recording there? (Known at build time, no network.) */
function fileKnown(url: string): boolean {
  // v23: "v72", "m03" or "words/bukva-m" (letters of «Азбука-картинки»).
  const id = url.replace(/^.*audio\/(voice|music)\//, "").replace(/\.mp3$/, "");
  return present.has(id);
}

/** The voice line playing now (a buffer source or a media element): stop() cuts it. */
let voicePlaying: { stop: () => void } | null = null;
let voiceToken = 0;
const voiceBuffers = new Map<string, Promise<AudioBuffer>>();

function voiceBuffer(c: AudioContext, url: string): Promise<AudioBuffer> {
  let p = voiceBuffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      })
      .then((data) => new Promise<AudioBuffer>((ok, fail) => void c.decodeAudioData(data, ok, fail)));
    p.catch(() => voiceBuffers.delete(url));
    voiceBuffers.set(url, p);
  }
  return p;
}
let lastMissVoice = 0;
let misses = 0;

// Recorded music: one looping element, quieter while Ryzhik speaks.
let track: HTMLAudioElement | null = null;
let trackUrl = "";
/** The track plays through musicOut (WebAudio), so its gain works on iOS too. */
let trackRouted = false;
let trackNode: MediaElementAudioSourceNode | null = null;
let trackGain: GainNode | null = null;
const TRACK_VOLUME = 0.22;

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

function stopTrack(): void {
  track?.pause();
  trackNode?.disconnect();
  trackGain?.disconnect();
  trackNode = null;
  trackGain = null;
  trackRouted = false;
  track = null;
  trackUrl = "";
}

/** Send the track through WebAudio when it can be (same origin, context there). */
function routeTrack(a: HTMLAudioElement): void {
  const c = ctx;
  if (!c || !musicOut || trackRouted || typeof c.createMediaElementSource !== "function") return;
  try {
    trackNode = c.createMediaElementSource(a);
    trackGain = c.createGain();
    trackGain.gain.value = TRACK_VOLUME;
    trackNode.connect(trackGain).connect(musicOut);
    a.volume = 1;
    trackRouted = true;
  } catch {
    trackRouted = false;
  }
}

function syncMusic(): void {
  const want = enabled && musicOn && Boolean(musicFor(theme));
  const id = MUSIC_FILES[theme];
  const url = id ? fileUrl("music", id) : "";
  // No media element outside a browser (unit tests): nothing to sync.
  if (typeof Audio === "undefined" || typeof document === "undefined") return;
  if (want && url && fileKnown(url)) {
    // A recorded track replaces the synthesized loop.
    stopSynth();
    if (trackUrl !== url) {
      stopTrack();
      track = new Audio(url);
      track.loop = true;
      track.volume = TRACK_VOLUME;
      track.setAttribute("playsinline", "");
      trackUrl = url;
    }
    // Only once the context runs: a routed element is silent while it sleeps.
    if (track && ctx && ctx.state === "running") routeTrack(track);
    if (track && track.paused && !document.hidden) void track.play().catch(() => {});
    return;
  }
  stopTrack();
  if (want) startSynth();
  else stopSynth();
}

function stopSynth(): void {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = 0;
  }
}

function startSynth(): void {
  if (!musicTimer) {
    musicStep = 0;
    musicNext = 0;
    musicTimer = window.setInterval(musicTick, 200);
  }
}

/** Sounds that cut each other (see audio.play). */
const channels = new Map<string, GainNode>();
export const CHANNEL_GAIN = 1.6;
const CHANNEL_DUCK_SECONDS = 1.1;

let queued: string | null = null;
let lastSaid = { id: "", at: 0 };

/** The voice line finished by itself: play the one waiting, if any. */
function voiceDone(): void {
  voicePlaying = null;
  const next = queued;
  queued = null;
  if (next) audio.say(next);
}

function stopVoice(): void {
  voiceToken++;
  queued = null;
  const v = voicePlaying;
  voicePlaying = null;
  v?.stop();
}

export const audio = {
  get enabled(): boolean {
    return enabled;
  },
  setEnabled(value: boolean): void {
    enabled = value;
    void platform.storage.set(KEY, value);
    if (!value) stopVoice();
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
  /** Music is heard only when both the music switch and the sounds switch are on. */
  get audible(): boolean {
    return enabled && musicOn;
  },
  /**
   * The menu 🎵 button. Turns only the music off. If sounds were off
   * (v21's 🔊 button stored that), turns sounds and music back on, so the
   * note does not look "on" while everything stays silent.
   */
  toggleMenuMusic(): void {
    if (enabled && musicOn) {
      this.setMusic(false);
      return;
    }
    if (!enabled) this.setEnabled(true);
    this.setMusic(true);
  },
  /** Call from a user gesture once; later sounds can then play. */
  unlock(): void {
    askPlaybackSession();
    const c = context();
    if (c && c.state !== "running") void resume(c).then(syncMusic);
    syncMusic();
  },
  /**
   * A short sound. With a `channel` (e.g. "toy"), a new sound on that channel
   * cuts the one still ringing there, so fast taps do not pile up.
   */
  play(kind: SoundKind, channel?: string): void {
    const c = ready();
    if (!c || !fx) {
      // The very first tap: the context is still waking up, play once it is.
      const w = enabled ? context() : null;
      if (w && w.state !== "running") void resume(w).then(() => w.state === "running" && audio.play(kind, channel));
      return;
    }
    if (channel) {
      // A touched toy or animal is the point of the moment: the music steps back.
      duck(DUCK_FX, CHANNEL_DUCK_SECONDS);
      const prev = channels.get(channel);
      if (prev) {
        prev.gain.setTargetAtTime(0, c.currentTime, 0.015);
        setTimeout(() => prev.disconnect(), 120);
      }
      const g = c.createGain();
      // Touched things are a bit louder than the game's clicks (the limiter keeps it soft).
      g.gain.value = CHANNEL_GAIN;
      g.connect(fx);
      channels.set(channel, g);
      recipe(kind)(c, g, c.currentTime);
      return;
    }
    if (kind === "miss" || kind === "boing") {
      // Now and then Ryzhik cheers up after a miss (when recorded).
      misses++;
      if (misses % 3 === 0 && Date.now() - lastMissVoice > 15000) {
        lastMissVoice = Date.now();
        // Not over a hint Ryzhik is already saying.
        setTimeout(() => !voicePlaying && audio.say("v05"), 300);
      }
    }
    if (kind === "win") {
      const jingle = fileUrl("music", WIN_JINGLE);
      if (fileKnown(jingle)) {
        const a = new Audio(jingle);
        a.volume = 0.6;
        void a.play().catch(() => {});
        return;
      }
      // Every game has its own short tune.
      const bus = fx;
      melodyFor(theme).forEach(([f, len], i, all) => {
        const at = c.currentTime + all.slice(0, i).reduce((s, n) => s + n[1], 0);
        softNote(c, bus, at, f, len * 1.6, "triangle", 0.13);
        softNote(c, bus, at, f * 2, len * 0.9, "sine", 0.03);
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
   * Ryzhik says a phrase (public/audio/voice/<id>.mp3) when it is recorded;
   * otherwise nothing happens and the game's own sounds and text stay.
   */
  /** Is this voice line recorded (known at build time)? */
  hasVoice(id: string): boolean {
    return fileKnown(fileUrl("voice", id));
  },
  /** Was this line started within the last `ms` (e.g. a game name said on the menu tile)? */
  saidRecently(id: string, ms: number): boolean {
    return lastSaid.id === id && Date.now() - lastSaid.at < ms;
  },
  /**
   * With `after`, a line waits for the one still playing (the game's name
   * said on the menu, then «Как играть») instead of cutting it.
   */
  say(id: string, opts: { after?: boolean } = {}): void {
    if (!enabled) return;
    const url = fileUrl("voice", id);
    if (!fileKnown(url) || (typeof document !== "undefined" && document.hidden)) return;
    if (opts.after && voicePlaying) {
      queued = id;
      return;
    }
    queued = null;
    lastSaid = { id, at: Date.now() };
    stopVoice();
    const mine = voiceToken;
    const c = ctx;
    // Through WebAudio once it runs: plays also after a game finished loading
    // (outside the tap), where iOS refuses a new media element.
    if (c && c.state === "running" && voiceBus && typeof fetch === "function") {
      let started = false;
      let ended = false;
      const end = (): void => {
        if (ended) return;
        ended = true;
        if (started) voiceDuckEnd();
      };
      voicePlaying = { stop: end };
      voiceBuffer(c, url)
        .then((buffer) => {
          if (mine !== voiceToken || ended || !voiceBus) return;
          const src = c.createBufferSource();
          src.buffer = buffer;
          src.connect(voiceBus);
          started = true;
          voiceDuckStart();
          src.onended = () => {
            end();
            if (mine === voiceToken) voiceDone();
          };
          voicePlaying = {
            stop: () => {
              try {
                src.stop();
              } catch {
                // already stopped
              }
              end();
            },
          };
          src.start();
        })
        .catch(() => {
          if (mine === voiceToken && !ended) sayMedia(url, mine);
          else if (mine === voiceToken) voiceDone();
        });
      return;
    }
    sayMedia(url, mine);
  },
};

/** The old way: a media element (before the first tap, or without WebAudio). */
function sayMedia(url: string, mine: number): void {
  if (typeof Audio === "undefined") return;
  const a = new Audio(url);
  a.volume = 0.95;
  let ended = false;
  const back = (): void => {
    if (ended) return;
    ended = true;
    voiceDuckEnd();
  };
  voicePlaying = {
    stop: () => {
      a.pause();
      back();
    },
  };
  if (mine !== voiceToken) return;
  voiceDuckStart();
  const done = (): void => {
    back();
    if (mine === voiceToken) voiceDone();
  };
  a.addEventListener("ended", done);
  a.addEventListener("error", done);
  void a.play().catch(done);
}

if (typeof document !== "undefined") {
  // Browsers start WebAudio only from a user gesture: wake it on the first one.
  // A recorded track may only start inside a gesture too: the first tap on the
  // menu (also when the page opens straight on it) starts the melody, and a
  // track the browser refused earlier (e.g. after the system Back) retries.
  const wake = (): void => {
    if (!enabled) return;
    askPlaybackSession();
    const c = context();
    if (c && c.state !== "running") void resume(c).then(syncMusic);
    syncMusic();
  };
  for (const type of ["pointerdown", "touchend", "keydown"]) document.addEventListener(type, wake, { capture: true, passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopVoice();
      track?.pause();
    } else syncMusic();
  });
}
