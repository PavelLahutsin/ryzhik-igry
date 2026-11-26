import { SKOLKO_LEVELS, SKOLKO_WORLDS, type SkolkoLevel } from "../skolko/levels";
import { levels, worlds, type LetterPicture } from "./letters";
import { ABC_LEVELS, FIRST_LEVELS, QUIZ_WORLDS, type QuizLevel } from "./quiz-levels";

/** Every level of «Цифры и буквы» (v23: with «Сколько?» and the letter quizzes), in play order. */
export type BukvyLevel = LetterPicture | SkolkoLevel | QuizLevel;

export const isSkolko = (l: BukvyLevel): l is SkolkoLevel => "mode" in l && (l.mode === "count" || l.mode === "more");
export const isQuiz = (l: BukvyLevel): l is QuizLevel => "kind" in l && (l.kind === "abc" || l.kind === "first");

const inWorld = (id: string): LetterPicture[] => levels.filter((l) => l.world === id);

export const allWorlds = [
  ...worlds.filter((w) => w.id === "digits" || w.id === "schitaem"),
  ...SKOLKO_WORLDS,
  ...worlds.filter((w) => w.id === "letters1" || w.id === "letters2"),
  ...QUIZ_WORLDS,
  ...worlds.filter((w) => w.id === "strochnye"),
];

export const allLevels: BukvyLevel[] = [
  ...inWorld("digits"),
  ...inWorld("schitaem"),
  ...SKOLKO_LEVELS,
  ...inWorld("letters1"),
  ...inWorld("letters2"),
  ...ABC_LEVELS,
  ...FIRST_LEVELS,
  ...inWorld("strochnye"),
];
export { allLevels as levels };
