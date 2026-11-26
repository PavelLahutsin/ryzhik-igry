import type { LevelInfo } from "../../shared/levelgame";
import { ABC, FIRST_LETTER_LEVELS, type AbcLetter } from "./abc";

/** v23: «Азбука-картинки» — three letters a level; tap each picture card and listen. */
export type AbcLevel = LevelInfo & { world: "azbuka"; kind: "abc"; letters: AbcLetter[] };
/** v23: «На какую букву?» — a picture; tap the letter it starts with. */
export type FirstLevel = LevelInfo & { world: "pervaya"; kind: "first"; rounds: { word: string; options: string[]; answer: string }[] };

export const QUIZ_WORLDS = [
  { id: "azbuka", title: "Азбука-картинки", color: "#e8705a" },
  { id: "pervaya", title: "На какую букву?", color: "#c05fa8" },
];

const groups: AbcLetter[][] = [];
for (let i = 0; i < ABC.length; i += 3) groups.push(ABC.slice(i, i + 3));

export const ABC_LEVELS: AbcLevel[] = groups.map((letters, i) => ({
  id: `az${i + 1}`,
  world: "azbuka",
  kind: "abc",
  title: letters.map((l) => l.letter).join(" "),
  letters,
}));

export const FIRST_LEVELS: FirstLevel[] = FIRST_LETTER_LEVELS.map((l) => ({ id: l.id, world: "pervaya", kind: "first", title: l.title, rounds: l.rounds }));

export type QuizLevel = AbcLevel | FirstLevel;
