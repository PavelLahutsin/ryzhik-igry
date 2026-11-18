import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import ts from "typescript";
import { join } from "node:path";

/** v12: texts talk to a boy and a girl alike — no «сам», «ты прошёл», «справился». */
const BAD = [
  /(?<![а-яё])сам[аи]?(?![а-яё])/iu,
  /(?<![а-яё])ты(,? [а-яё«»]+){0,3} [а-яё]+(ал|ял|ил|ел|ёл|ул|ыл|ог|лся|лась|ла)(?![а-яё])/iu,
  /справил(ся|ась)/iu,
];
// JS \b does not recognize Cyrillic. Match complete inflected words only.
const forms = [
  "молод(?:ец|ц(?:а|у|ом|е|ы|ов|ам|ами|ах))",
  "умниц(?:а|ы|е|у|ей|ею|ам|ами|ах)?",
  "(?:умнич|дочень)(?:к(?:а|и|е|у|ой|ою|ам|ами|ах)|ек)",
  "(?:мастер|сыщик)(?:а|у|ом|е|ы|и|ов|ам|ами|ах)?",
  "приш(?:[её]л|ла|ли|ло)",
  "сын(?:ок|к(?:а|у|ом|е|и|ов|ам|ами|ах))",
];
BAD.push(new RegExp(`(?<![\\p{L}\\p{M}])(?:${forms.join("|")})(?![\\p{L}\\p{M}])`, "iu"));
const rejected = (text: string): boolean => BAD.some((r) => r.test(text));

function* files(dir: string): Generator<string> {
  for (const f of readdirSync(dir)) {
    if (/^lullabies(?:\.|$)/.test(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (/\.(ts|json)$/.test(f) && !f.endsWith(".test.ts")) yield p;
  }
}

describe("gender-neutral texts", () => {
  it("matches whole words including inflections", () => {
    for (const word of ["Молодец!", "молодцом", "«умницей»", "умничек", "мастерами", "сыщика", "пришёл", "пришла", "сынка", "доченькой"])
      expect(rejected(word), word).toBe(true);
    for (const word of ["фломастер", "фломастерами", "мастерская", "голубцы"]) expect(rejected(word), word).toBe(false);
  });

  it("checks TS literals, template fragments and JSON strings outside lullabies", () => {
    const hits: string[] = [];
    for (const f of files("src")) {
      const file = ts.createSourceFile(f, readFileSync(f, "utf8"), ts.ScriptTarget.Latest, false,
        f.endsWith(".json") ? ts.ScriptKind.JSON : ts.ScriptKind.TS);
      function visit(node: ts.Node): void {
        if ((ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) && rejected(node.text)) {
          const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
          hits.push(`${f}:${line + 1} ${node.text}`);
        }
        ts.forEachChild(node, visit);
      }
      visit(file);
    }
    expect(hits).toEqual([]);
  });
});
