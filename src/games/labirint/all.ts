import { levels as oldLevels, worlds as oldWorlds, type LabLevel } from "./levels";
import { ARROW_LEVELS, ARROW_WORLDS, type ArrowLevel } from "./arrows-data";

/** v23: every level of the game, with the new mode. */
export type AnyLevel = LabLevel | ArrowLevel;
export const isArrows = (l: AnyLevel): l is ArrowLevel => "solution" in l;

const inWorld = (w: string): LabLevel[] => oldLevels.filter((l) => l.world === w);
export const levels: AnyLevel[] = [...oldLevels, ...ARROW_LEVELS];
export const worlds = [...oldWorlds, ...ARROW_WORLDS];
/** «Дорожка стрелками» is listed after «Домой» and opens with «В гости»; the old worlds open as before. */
export const WORLD_ORDER = [...new Set(["home", ...ARROW_WORLDS.map((w) => w.id), ...oldLevels.map((l) => l.world!)])];
export const ALL_AFTER: Record<string, string> = {
  [ARROW_LEVELS[0]!.id]: inWorld("home").at(-1)!.id,
  [inWorld("guests")[0]!.id]: inWorld("home").at(-1)!.id,
};
