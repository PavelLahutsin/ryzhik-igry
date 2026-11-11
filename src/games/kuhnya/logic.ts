/**
 * «Кухня Рыжика»: what a guest thinks of a dish. Pure rules, no DOM.
 * There is no wrong answer — every dish gets a reaction, some are funny.
 */
export type IngredientId =
  | "apple"
  | "pear"
  | "banana"
  | "berries"
  | "carrot"
  | "tomato"
  | "potato"
  | "mushroom"
  | "fish"
  | "egg"
  | "cheese"
  | "honey"
  | "lemon"
  | "pepper";

export type Op = "cut" | "boil" | "fry" | "blend";

export type Dish = { parts: IngredientId[]; ops: Op[] };

export type GuestId = "ryzhik" | "mama" | "mishka" | "ezhik";

export type Reaction = "love" | "yum" | "ok" | "yuck" | "raw" | "sour" | "spicy" | "burnt";

export const REACTIONS: readonly Reaction[] = ["love", "yum", "ok", "yuck", "raw", "sour", "spicy", "burnt"];

export type Ingredient = {
  id: IngredientId;
  name: string;
  /** Colour of a smoothie or soup made of it. */
  color: string;
  sweet?: boolean;
  /** Not eaten raw: potato, fish, egg. */
  cook?: boolean;
  sour?: boolean;
  spicy?: boolean;
  /** Belongs in a pot or a pan, not in a smoothie. */
  savoury?: boolean;
};

export const INGREDIENTS: Record<IngredientId, Ingredient> = {
  apple: { id: "apple", name: "Яблоко", color: "#f2c14e", sweet: true },
  pear: { id: "pear", name: "Груша", color: "#c9de6a", sweet: true },
  banana: { id: "banana", name: "Банан", color: "#ffe08a", sweet: true },
  berries: { id: "berries", name: "Черника", color: "#6a5bd6", sweet: true },
  carrot: { id: "carrot", name: "Морковка", color: "#f5862b" },
  tomato: { id: "tomato", name: "Помидор", color: "#e8463a", savoury: true },
  potato: { id: "potato", name: "Картошка", color: "#e7c98f", cook: true, savoury: true },
  mushroom: { id: "mushroom", name: "Грибок", color: "#c08a52", savoury: true },
  fish: { id: "fish", name: "Рыбка", color: "#ffb347", cook: true, savoury: true },
  egg: { id: "egg", name: "Яйцо", color: "#ffe9a8", cook: true, savoury: true },
  cheese: { id: "cheese", name: "Сыр", color: "#ffd54a", savoury: true },
  honey: { id: "honey", name: "Мёд", color: "#f5a623", sweet: true },
  lemon: { id: "lemon", name: "Лимон", color: "#fff27a", sour: true },
  pepper: { id: "pepper", name: "Острый перчик", color: "#e8463a", spicy: true },
};

export const INGREDIENT_IDS = Object.keys(INGREDIENTS) as IngredientId[];

export type Guest = {
  id: GuestId;
  name: string;
  loves: IngredientId[];
  dislikes: IngredientId[];
  /** A way of cooking that makes any dish better for this guest. */
  likesOp: Op;
};

export const GUESTS: Record<GuestId, Guest> = {
  ryzhik: { id: "ryzhik", name: "Рыжик", loves: ["apple", "banana", "berries", "honey"], dislikes: ["mushroom", "cheese"], likesOp: "blend" },
  mama: { id: "mama", name: "Мама", loves: ["carrot", "tomato", "pear", "potato"], dislikes: ["honey"], likesOp: "boil" },
  mishka: { id: "mishka", name: "Мишка", loves: ["berries", "honey", "fish"], dislikes: ["carrot", "tomato"], likesOp: "fry" },
  ezhik: { id: "ezhik", name: "Ёжик", loves: ["mushroom", "apple", "pear"], dislikes: ["banana", "fish"], likesOp: "cut" },
};

export const GUEST_IDS = Object.keys(GUESTS) as GuestId[];

/** How long a guest can eat before he is full. */
export const BITES_TO_FULL = 6;

export function taste(guestId: GuestId, dish: Dish): Reaction {
  const guest = GUESTS[guestId];
  const parts = dish.parts.map((id) => INGREDIENTS[id]);
  const fries = dish.ops.filter((op) => op === "fry").length;
  const boils = dish.ops.filter((op) => op === "boil").length;
  const blended = dish.ops.includes("blend");
  if (fries >= 2) return "burnt";
  if (parts.some((p) => p.spicy)) return "spicy";
  if (parts.some((p) => p.cook) && fries + boils === 0) return "raw";
  if (blended && parts.some((p) => p.savoury)) return "yuck";
  if (parts.some((p) => p.sour) && !(blended && parts.some((p) => p.sweet))) return "sour";
  let score = 0;
  for (const p of parts) {
    if (guest.loves.includes(p.id)) score += 2;
    if (guest.dislikes.includes(p.id)) score -= 2;
  }
  if (dish.ops.includes(guest.likesOp)) score += 1;
  if (score >= 3) return "love";
  if (score >= 1) return "yum";
  if (score === 0) return "ok";
  return "yuck";
}

/** What a tool does to a dish. Pot and blender take up to three things. */
export const CAPACITY: Record<Op, number> = { cut: 1, fry: 1, boil: 3, blend: 3 };

export function addToTool(contents: readonly Dish[], dish: Dish, op: Op): Dish[] | null {
  if (contents.length >= CAPACITY[op]) return null;
  return [...contents, dish];
}

/** Cook what is in a tool into one dish. */
export function cook(contents: readonly Dish[], op: Op): Dish | null {
  if (contents.length === 0) return null;
  const parts = contents.flatMap((d) => d.parts);
  const ops = [...new Set(contents.flatMap((d) => d.ops))];
  // Frying twice burns it: keep the earlier fry so `taste` sees it.
  const earlierFry = contents.some((d) => d.ops.includes("fry"));
  const next = op === "fry" && earlierFry ? [...ops, "fry" as Op] : ops.includes(op) && op !== "fry" ? ops : [...ops, op];
  return { parts, ops: next };
}

/** Name of a dish for the bubble and screen readers. */
export function dishName(dish: Dish): string {
  const first = INGREDIENTS[dish.parts[0]!].name.toLowerCase();
  if (dish.ops.includes("blend")) return dish.parts.length > 1 ? "Коктейль" : `Коктейль: ${first}`;
  if (dish.ops.includes("boil") && dish.parts.length > 1) return "Суп";
  const fries = dish.ops.filter((o) => o === "fry").length;
  if (fries >= 2) return "Подгорело";
  const how = fries ? "Жареное" : dish.ops.includes("boil") ? "Варёное" : dish.ops.includes("cut") ? "Нарезанное" : "";
  return how ? `${how}: ${first}` : INGREDIENTS[dish.parts[0]!].name;
}

/** Average colour of the parts (smoothie, soup). */
export function mixColor(parts: readonly IngredientId[]): string {
  const rgb = parts.map((id) => {
    const hex = INGREDIENTS[id].color.slice(1);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  });
  const avg = [0, 1, 2].map((k) => Math.round(rgb.reduce((s, c) => s + c[k]!, 0) / rgb.length));
  return `#${avg.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export const SAY: Record<Reaction, string[]> = {
  love: ["Вкуснятина!", "Моё любимое!", "Ещё хочу!"],
  yum: ["Ням-ням!", "Вкусно!", "Спасибо!"],
  ok: ["Неплохо", "Можно есть", "М-м… ничего"],
  yuck: ["Фу-у!", "Бе-е, невкусно!", "Ой, нет!"],
  raw: ["Сырое! Надо сварить", "Бе-е, сырое!", "Это надо пожарить"],
  sour: ["Ой, кисло!", "Кислятина!", "Ух, какой кислый!"],
  spicy: ["Ой-ой, остро!", "Горячо! Воды!", "Огонь во рту!"],
  burnt: ["Кхе-кхе! Подгорело", "Угольки!", "Слишком жарко пожарили"],
};

export function allFinds(): string[] {
  return GUEST_IDS.flatMap((g) => REACTIONS.map((r) => `${g}:${r}`));
}
