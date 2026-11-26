import { levels as oldLevels, worlds as oldWorlds, type ParaLevel } from "./levels";
import { NEW_LEVELS, NEW_WORLDS, type NewLevel } from "../zveri/guests-data";

/** v23: every level of the game, with the new mode. */
export type AnyLevel = ParaLevel | NewLevel;
export const isGuests = (l: AnyLevel): l is NewLevel => "pool" in l;

const inWorld = (w: string): ParaLevel[] => oldLevels.filter((l) => l.world === w);
export const levels: AnyLevel[] = [...oldLevels, ...NEW_LEVELS];
export const worlds = [...oldWorlds, ...NEW_WORLDS];
/** «Кто новенький?» is listed after «Семья и друзья» and opens with «Весёлые пары»; the old worlds open as before. */
export const WORLD_ORDER = [...new Set(["family", ...NEW_WORLDS.map((w) => w.id), ...oldLevels.map((l) => l.world!)])];
export const ALL_AFTER: Record<string, string> = {
  [NEW_LEVELS[0]!.id]: inWorld("family").at(-1)!.id,
  [inWorld("fun")[0]!.id]: inWorld("family").at(-1)!.id,
};
