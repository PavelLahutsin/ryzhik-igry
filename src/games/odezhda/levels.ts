import type { LevelInfo } from "../../shared/levelgame";
import type { Weather } from "./items";

export type OdezhdaLevel = LevelInfo & {
  weather: Weather;
  /** Things Ryzhik needs today (one per slot). */
  wear: string[];
  /** Things that don't fit the weather. */
  extra: string[];
};

export const WEATHER: Record<Weather, { name: string; ask: string }> = {
  sun: { name: "Солнышко", ask: "На улице солнышко! Что надеть Рыжику?" },
  rain: { name: "Дождик", ask: "Идёт дождик! Что надеть Рыжику?" },
  snow: { name: "Снег", ask: "Выпал снег! Что надеть Рыжику?" },
  wind: { name: "Ветер", ask: "Дует ветер! Что взять Рыжику?" },
};

export const worlds = [
  { id: "first", title: "Первые прогулки", color: "#ffb23f" },
  { id: "change", title: "Погода меняется", color: "#6db3d4" },
  { id: "big", title: "Большие сборы", color: "#9b8cf0" },
];

/** Ids o1–o6 are the first version's levels, kept so saved stars stay. */
export const levels: OdezhdaLevel[] = [
  { id: "o1", world: "first", title: "Солнышко", weather: "sun", wear: ["panama", "sunglasses"], extra: ["hat", "mittens"] },
  { id: "o2", world: "first", title: "Дождик", weather: "rain", wear: ["raincoat", "rainboots", "umbrella"], extra: ["sunglasses", "sandals"] },
  { id: "o3", world: "first", title: "Снег", weather: "snow", wear: ["hat", "scarf", "mittens", "winterboots"], extra: ["panama", "umbrella"] },
  { id: "o4", world: "first", title: "Ветер", weather: "wind", wear: ["jacket", "scarf", "kite"], extra: ["umbrella", "panama", "sandals"] },
  { id: "o5", world: "change", title: "Жаркий день", weather: "sun", wear: ["panama", "sunglasses", "sandals"], extra: ["scarf", "raincoat", "winterboots"] },
  { id: "o7", world: "change", title: "В песочницу", weather: "sun", wear: ["cap", "tshirt", "sandals", "bucket"], extra: ["hat", "jacket", "rainboots"] },
  { id: "o8", world: "change", title: "По лужам", weather: "rain", wear: ["raincoat", "rainboots", "umbrella"], extra: ["cap", "sandals", "sled", "sunglasses"] },
  { id: "o9", world: "change", title: "На санках", weather: "snow", wear: ["hat", "jacket", "mittens", "winterboots", "sled"], extra: ["tshirt", "bucket", "sandals"] },
  { id: "o6", world: "big", title: "Зимняя прогулка", weather: "snow", wear: ["hat", "scarf", "jacket", "mittens", "winterboots"], extra: ["sandals", "panama", "sunglasses"] },
  { id: "o10", world: "big", title: "Ветреный день", weather: "wind", wear: ["hat", "scarf", "jacket", "kite"], extra: ["umbrella", "cap", "sandals", "bucket"] },
  { id: "o11", world: "big", title: "Летний денёк", weather: "sun", wear: ["cap", "sunglasses", "tshirt", "sandals", "bucket"], extra: ["hat", "scarf", "winterboots"] },
  { id: "o12", world: "big", title: "Дождливая прогулка", weather: "rain", wear: ["raincoat", "rainboots", "umbrella"], extra: ["panama", "sunglasses", "sandals", "sled", "kite"] },
];

/** A thing for the hint lamp: one Ryzhik still needs. */
export function hintItem(level: OdezhdaLevel, worn: readonly string[]): string | null {
  return level.wear.find((id) => !worn.includes(id)) ?? null;
}
