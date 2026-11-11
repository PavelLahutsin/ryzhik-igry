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

export const levels: OdezhdaLevel[] = [
  { id: "o1", title: "Солнышко", weather: "sun", wear: ["panama", "sunglasses"], extra: ["hat", "mittens"] },
  { id: "o2", title: "Дождик", weather: "rain", wear: ["raincoat", "rainboots", "umbrella"], extra: ["sunglasses", "sandals"] },
  { id: "o3", title: "Снег", weather: "snow", wear: ["hat", "scarf", "mittens", "winterboots"], extra: ["panama", "umbrella"] },
  { id: "o4", title: "Ветер", weather: "wind", wear: ["jacket", "scarf", "kite"], extra: ["umbrella", "panama", "sandals"] },
  {
    id: "o5",
    title: "Жаркий день",
    weather: "sun",
    wear: ["panama", "sunglasses", "sandals"],
    extra: ["scarf", "raincoat", "winterboots"],
  },
  {
    id: "o6",
    title: "Зимняя прогулка",
    weather: "snow",
    wear: ["hat", "scarf", "jacket", "mittens", "winterboots"],
    extra: ["sandals", "panama", "sunglasses"],
  },
];
