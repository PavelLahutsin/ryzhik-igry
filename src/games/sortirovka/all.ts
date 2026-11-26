import { AFTER, levels as oldLevels, worlds as oldWorlds, type SortLevel } from "./levels";
import { FEED_LEVELS, FEED_WORLDS, type FeedLevel } from "../zveri/feed-data";

/** v23: every level of the game, with the new mode. */
export type AnyLevel = SortLevel | FeedLevel;
export const isFeed = (l: AnyLevel): l is FeedLevel => "animals" in l;

const inWorld = (w: string): SortLevel[] => oldLevels.filter((l) => l.world === w);
export const levels: AnyLevel[] = [...oldLevels, ...FEED_LEVELS];
export const worlds = [...oldWorlds, ...FEED_WORLDS];
/** «Кто что ест?» is listed after «По цвету» and opens with «Ещё порядок»; the old worlds open as before. */
export const WORLD_ORDER = [...new Set(["colors", ...FEED_WORLDS.map((w) => w.id), ...oldLevels.map((l) => l.world!)])];
export const ALL_AFTER: Record<string, string> = {
  ...AFTER,
  [FEED_LEVELS[0]!.id]: inWorld("colors").at(-1)!.id,
  [inWorld("more")[0]!.id]: inWorld("colors").at(-1)!.id,
};
