import { beforeAll, describe, expect, it, vi } from "vitest";

/**
 * v22: «Нажми и послушай» — with the music on the animals were drowned out,
 * with the music off (menu button) they were silent. Effects must play
 * whatever the music does, and the music must step back under them.
 * A tiny fake AudioContext records what the mixer does.
 */
type Call = [string, ...unknown[]];
class FakeParam {
  value = 1;
  calls: Call[] = [];
  setValueAtTime(...a: unknown[]): void {
    this.calls.push(["setValueAtTime", ...a]);
  }
  exponentialRampToValueAtTime(...a: unknown[]): void {
    this.calls.push(["exp", ...a]);
  }
  setTargetAtTime(...a: unknown[]): void {
    this.calls.push(["target", ...a]);
  }
  cancelScheduledValues(): void {}
}
class FakeNode {
  gain = new FakeParam();
  frequency = new FakeParam();
  threshold = new FakeParam();
  ratio = new FakeParam();
  Q = new FakeParam();
  type = "";
  buffer: unknown = null;
  loop = false;
  out: unknown[] = [];
  connect<T>(n: T): T {
    this.out.push(n);
    return n;
  }
  disconnect(): void {}
  start(): void {}
  stop(): void {}
}
const made = { osc: 0, gains: [] as FakeNode[] };
class FakeContext {
  static last: FakeContext | null = null;
  state: "running" | "suspended" = "suspended";
  currentTime = 1;
  sampleRate = 8000;
  destination = new FakeNode();
  constructor() {
    FakeContext.last = this;
  }
  resume(): Promise<void> {
    this.state = "running";
    return Promise.resolve();
  }
  createDynamicsCompressor(): FakeNode {
    return new FakeNode();
  }
  createGain(): FakeNode {
    const g = new FakeNode();
    made.gains.push(g);
    return g;
  }
  createOscillator(): FakeNode {
    made.osc++;
    return new FakeNode();
  }
  createBiquadFilter(): FakeNode {
    return new FakeNode();
  }
  createBufferSource(): FakeNode {
    return new FakeNode();
  }
  createBuffer(_c: number, n: number): { getChannelData: () => Float32Array } {
    const d = new Float32Array(n);
    return { getChannelData: () => d };
  }
}

let audio: typeof import("./audio").audio;
let DUCK_FX: number;

beforeAll(async () => {
  vi.stubGlobal("window", { AudioContext: FakeContext, location: { search: "", hash: "" }, setInterval: () => 0 });
  const mod = await import("./audio");
  audio = mod.audio;
  DUCK_FX = mod.DUCK_FX;
});

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

describe("sound effects and music (v22)", () => {
  it("the very first tap wakes the context and its sound still plays", async () => {
    audio.play("meow", "toy");
    expect(made.osc).toBe(0);
    await flush();
    expect(FakeContext.last!.state).toBe("running");
    expect(made.osc).toBeGreaterThan(0);
  });

  it("an animal sounds with the music switched off", () => {
    audio.setMusic(false);
    const before = made.osc;
    audio.play("woof", "toy");
    expect(made.osc).toBeGreaterThan(before);
    audio.setMusic(true);
  });

  it("the music ducks under a touched toy or animal and comes back", () => {
    // fx, musicOut, musicBus, voiceBus are the first four gains.
    const musicOut = made.gains[1]!;
    musicOut.gain.calls = [];
    audio.play("frog", "toy");
    const targets = musicOut.gain.calls.filter((c) => c[0] === "target").map((c) => c[1]);
    expect(targets[0]).toBe(DUCK_FX);
    expect(targets.at(-1)).toBe(1);
  });

  it("a touched thing is louder than a plain click (its channel gain)", () => {
    audio.play("meow", "toy");
    const channel = made.gains.at(-1)!;
    expect(channel.gain.value).toBeGreaterThan(1);
  });

  it("only the grown-ups' switch («Звуки» in «Родителям») silences effects", () => {
    audio.setEnabled(false);
    const before = made.osc;
    audio.play("meow", "toy");
    expect(made.osc).toBe(before);
    audio.setEnabled(true);
    audio.play("meow", "toy");
    expect(made.osc).toBeGreaterThan(before);
  });

  it("the menu button turns only the music off, and turns sounds back on if they were off", () => {
    audio.setEnabled(true);
    audio.setMusic(true);
    expect(audio.audible).toBe(true);
    audio.toggleMenuMusic();
    expect(audio.music).toBe(false);
    expect(audio.enabled).toBe(true);
    expect(audio.audible).toBe(false);

    audio.setEnabled(false);
    audio.setMusic(true);
    expect(audio.audible).toBe(false);
    audio.toggleMenuMusic();
    expect(audio.enabled).toBe(true);
    expect(audio.music).toBe(true);
    expect(audio.audible).toBe(true);
  });
});
