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
  { id: "more", title: "Ещё прогулки", color: "#7cc46a" },
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
  { id: "o13", world: "more", title: "На пляж", weather: "sun", wear: ["panama", "sunglasses", "tshirt", "sandals", "bucket"], extra: ["mittens", "winterboots", "scarf"] },
  { id: "o14", world: "more", title: "Запускаем змея", weather: "wind", wear: ["hat", "jacket", "scarf", "kite"], extra: ["sled", "umbrella", "sandals"] },
  { id: "o15", world: "more", title: "Горка во дворе", weather: "snow", wear: ["hat", "scarf", "jacket", "mittens", "winterboots", "sled"], extra: ["sunglasses", "sandals"] },
  { id: "o16", world: "more", title: "За ракушками", weather: "sun", wear: ["panama", "sunglasses", "sandals", "bucket"], extra: ["scarf", "raincoat", "winterboots"] },
  { id: "o17", world: "more", title: "Мимо водостока", weather: "rain", wear: ["raincoat", "rainboots"], extra: ["sunglasses", "sandals", "kite"] },
  { id: "o18", world: "more", title: "Следы на снегу", weather: "snow", wear: ["hat", "jacket", "mittens", "winterboots"], extra: ["cap", "rainboots", "bucket"] },
  { id: "o19", world: "more", title: "На пригорок", weather: "wind", wear: ["scarf", "jacket", "kite"], extra: ["mittens", "umbrella", "sled"] },
  { id: "o20", world: "more", title: "По тропинке к макам", weather: "sun", wear: ["cap", "sunglasses", "tshirt", "sandals"], extra: ["hat", "raincoat", "mittens"] },
  { id: "o21", world: "more", title: "К уткам под зонтом", weather: "rain", wear: ["rainboots", "umbrella"], extra: ["sandals", "bucket", "sled"] },
  { id: "o22", world: "more", title: "Санки у ёлки", weather: "snow", wear: ["scarf", "jacket", "mittens", "winterboots", "sled"], extra: ["tshirt", "sandals", "kite"] },
  { id: "o23", world: "more", title: "За шуршащим листком", weather: "wind", wear: ["hat", "scarf", "jacket"], extra: ["panama", "mittens", "umbrella"] },
  { id: "o24", world: "more", title: "Песочный пирожок для ёжика", weather: "sun", wear: ["panama", "tshirt", "sandals", "bucket"], extra: ["mittens", "raincoat", "sled"] },
  { id: "o25", world: "more", title: "Стрекоза у клёна", weather: "sun", wear: ["cap", "sunglasses", "sandals"], extra: ["hat", "umbrella", "winterboots"] },
  { id: "o26", world: "more", title: "Ручеёк у крыльца", weather: "rain", wear: ["raincoat", "rainboots"], extra: ["sunglasses", "sled", "kite"] },
  { id: "o27", world: "more", title: "Капли на берёзе", weather: "rain", wear: ["raincoat", "rainboots", "umbrella"], extra: ["panama", "sandals", "mittens"] },
  { id: "o28", world: "more", title: "Лепим снежного котёнка", weather: "snow", wear: ["hat", "jacket", "mittens", "winterboots"], extra: ["bucket", "rainboots", "tshirt"] },
  { id: "o29", world: "more", title: "Везём мишку", weather: "snow", wear: ["scarf", "mittens", "winterboots", "sled"], extra: ["sandals", "umbrella", "kite"] },
  { id: "o30", world: "more", title: "Бежит жёлтый листок", weather: "wind", wear: ["hat", "scarf", "jacket"], extra: ["cap", "raincoat", "sled"] },
  { id: "o31", world: "more", title: "Змей над клёном", weather: "wind", wear: ["jacket", "scarf", "kite"], extra: ["sunglasses", "umbrella", "winterboots"] },
  // v23 (Astra b26-3)
  { id: "o32", world: "more", title: "Песочный домик", weather: "sun", wear: ["panama", "tshirt", "sandals", "bucket"], extra: ["scarf", "winterboots", "sled"] },
  { id: "o33", world: "more", title: "Шлёп по луже", weather: "rain", wear: ["raincoat", "rainboots"], extra: ["panama", "winterboots", "kite"] },
  { id: "o34", world: "more", title: "Санки для лисёнка", weather: "snow", wear: ["hat", "jacket", "mittens", "winterboots", "sled"], extra: ["panama", "sandals", "kite"] },
  { id: "o35", world: "more", title: "Полёт бумажного змея", weather: "wind", wear: ["scarf", "jacket", "kite"], extra: ["bucket", "sandals", "sled"] },
  { id: "o36", world: "more", title: "Божьи коровки", weather: "sun", wear: ["cap", "sunglasses", "tshirt"], extra: ["mittens", "winterboots", "raincoat"] },
  { id: "o37", world: "more", title: "Под весёлым зонтом", weather: "rain", wear: ["raincoat", "rainboots", "umbrella"], extra: ["sled", "sunglasses", "panama"] },
  { id: "o38", world: "more", title: "Ёлочка в снегу", weather: "snow", wear: ["hat", "scarf", "jacket", "mittens", "winterboots"], extra: ["tshirt", "sandals", "bucket"] },
  { id: "o39", world: "more", title: "Вертушка у берёзы", weather: "wind", wear: ["hat", "scarf", "jacket"], extra: ["sled", "rainboots", "bucket"] },
  { id: "o40", world: "more", title: "Жёлтая ракушка", weather: "sun", wear: ["cap", "sunglasses", "tshirt", "bucket"], extra: ["hat", "mittens", "sled"] },
];

/** A thing for the hint lamp: one Ryzhik still needs. */
export function hintItem(level: OdezhdaLevel, worn: readonly string[]): string | null {
  return level.wear.find((id) => !worn.includes(id)) ?? null;
}
