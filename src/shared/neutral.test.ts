import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** v12: texts talk to a boy and a girl alike — no «сам», «ты прошёл», «справился». */
const BAD = [
  /(?<![а-яё])сам[аи]?(?![а-яё])/iu,
  /(?<![а-яё])ты(,? [а-яё«»]+){0,3} [а-яё]+(ал|ял|ил|ел|ёл|ул|ыл|ог|лся|лась|ла)(?![а-яё])/iu,
  /справил(ся|ась)/iu,
];
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.ts$/.test(f) && !/\.test\.ts$/.test(f) ? [p] : [];
  });

describe("gender-neutral texts", () => {
  it("no game or screen text speaks to the child as he or she", () => {
    const hits: string[] = [];
    for (const f of files("src")) {
      readFileSync(f, "utf8").split("\n").forEach((line, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
        for (const s of line.match(/"[^"]*"|`[^`]*`/g) ?? []) if (BAD.some((r) => r.test(s))) hits.push(`${f}:${i + 1} ${s}`);
      });
    }
    expect(hits).toEqual([]);
  });
});
