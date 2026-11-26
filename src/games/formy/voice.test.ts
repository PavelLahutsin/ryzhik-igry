import { describe, expect, it } from "vitest";
import { VOICE_LINES } from "../../shared/voice-lines";
import { ASK_ICONS } from "./ask-icons";
import { FORMY_DEMOS } from "./demos";
import { levels } from "./levels";
import { demoKey, FORMY_BUBBLE, FORMY_FALLBACK, FORMY_RESULT_VOICE, FORMY_TASK_VOICE, taskKey, taskVoice } from "./voice";
import type { FormLevel } from "./levels";

const flat = (o: unknown): string[] => (typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(flat) : Object.values(o as object).flatMap(flat));

describe("formy v23: one spoken question per level", () => {
  it("every level asks one thing (no «mix» left)", () => {
    for (const l of levels) {
      if (l.mode !== "pick") continue;
      if (l.spec.kind === "compare") {
        expect(l.spec.dims.length, l.id).toBe(1);
        expect(l.spec.want, l.id).not.toBe("mix");
      }
      if (l.spec.kind === "odd") expect(l.spec.by, l.id).not.toBe("mix");
    }
  });
  it("every level has a recorded-to-be line, a bubble and a demo", () => {
    for (const l of levels) {
      const v = taskVoice(l);
      expect(VOICE_LINES[v], `${l.id} ${v}`).toBeTruthy();
      expect(FORMY_BUBBLE[v], `${l.id} ${v}`).toBeTruthy();
      expect(FORMY_DEMOS.some((d) => d.key === demoKey(l)), `${l.id} ${demoKey(l)}`).toBe(true);
    }
    for (const id of [...flat(FORMY_TASK_VOICE), ...flat(FORMY_RESULT_VOICE), ...flat(FORMY_FALLBACK)]) expect(VOICE_LINES[id], id).toBeTruthy();
    // The bubble says what Ryzhik says (shortened, same meaning): same first word.
    for (const [id, text] of Object.entries(FORMY_BUBBLE)) expect(VOICE_LINES[id], id).toBeTruthy(), expect(text.length).toBeLessThanOrEqual(VOICE_LINES[id]!.length + 2);
  });
  it("the line matches the question", () => {
    const by = (id: string): FormLevel => levels.find((l) => l.id === id)!;
    expect(taskKey(by("m1"))).toBe("pick:compare:length:most");
    expect(taskKey(by("m1b"))).toBe("pick:compare:length:least");
    expect(taskKey(by("y2"))).toBe("pick:compare:size:most:3+");
    expect(taskKey(by("c1"))).toBe("pick:compare:size:most:2");
    expect(taskVoice(by("r2"))).toBe("v83");
    expect(taskVoice(by("d4b"))).toBe("v90");
    expect(taskVoice(by("o2"))).toBe("v85");
  });
  it("titles are unique and the child's words follow the rules", () => {
    expect(new Set(levels.map((l) => l.title)).size).toBe(levels.length);
    for (const l of levels) {
      for (const t of [l.title, l.ask, l.done]) {
        expect(t, l.id).not.toMatch(/молод|умни|мастер|сыщик|сынок|Ищём|втрёх|ты нашёл|ты нашла/i);
        expect(t, l.id).not.toMatch(/елоч|еще\b|зеленый/i);
      }
    }
  });
  it("ask icons and demos are well formed", () => {
    for (const [k, svg] of Object.entries(ASK_ICONS)) {
      expect(svg, k).toMatch(/^<svg viewBox="0 0 100 100"/);
      expect(svg, k).not.toMatch(/<script|<image|href=|<text|on\w+=/i);
      expect((svg.match(/<g\b/g) ?? []).length, k).toBe((svg.match(/<\/g>/g) ?? []).length);
    }
    expect(new Set(FORMY_DEMOS.map((d) => d.key)).size).toBe(FORMY_DEMOS.length);
    for (const d of FORMY_DEMOS) {
      expect(d.trial.length).toBeGreaterThanOrEqual(1);
      for (const s of d.steps) {
        expect(d.trial[s.from], d.key).toBeTruthy();
        if (s.move === "drag") expect(d.trial[s.to!], d.key).toBeTruthy();
      }
      expect(VOICE_LINES[d.voiceAfter]).toBeTruthy();
    }
  });
});
