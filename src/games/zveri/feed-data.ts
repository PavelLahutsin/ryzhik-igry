import { OBJECTS } from "../../shared/objects";

/**
 * v23 «Кто что ест?» (Astra, brief 25-1): drag each treat to the animal that
 * eats it. Food pictures are Astra's; apple, carrot, fish and mushroom are the
 * shared objects. Every food in a level fits exactly one animal there, the
 * extra treats fit nobody (tested).
 */
const NEW_FOODS: Record<string, { name: string; svg: string }> = {
  nut: {
    name: "Орешек",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#d9904e" d="M50 8Q54 17 65 21C83 28 90 49 84 67Q77 86 51 92Q24 87 16 68C9 48 20 28 37 21Q46 17 50 8Z"/><path fill="none" d="M48 24Q32 39 30 57M56 26Q65 37 67 48"/><path fill="#b97645" d="M17 64Q49 76 84 63Q81 85 51 92Q22 87 17 64Z"/><path fill="none" d="M34 76l5 2m12 2h5m10-4 3-1"/></g></svg>`,
  },
  cone: {
    name: "Шишка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#b68a58" d="M46 22l2-15 9 2-3 15Z"/><path fill="#c98b55" d="M50 16C66 16 81 38 81 55C81 71 65 87 50 93C35 87 19 71 19 55C19 38 34 16 50 16Z"/><path fill="#e2a66b" d="M30 30q6 13 15 14l6-10q5 8 12 10l9-10M21 47q5 11 13 14l10-12q6 10 15 13l10-13 11 6M23 64q7 11 16 13l10-11q5 9 14 12l12-12"/></g></svg>`,
  },
  hay: {
    name: "Сено",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#f4cd66" d="M9 43l8 1-4-9 10 2-3-8q16 5 28 6l31-16-1 8 11-4-3 10 7-1-5 10 6 2-7 7 5 5-10 3 4 7q-21-4-33 0L19 81l2-9-11 3 5-11-8 2 6-11-7 1 8-9Z"/><path fill="none" d="M20 45l20 4m-23 9 24-4m-19 14 19-9m16-18 20-8M60 48l22-6m-20 13 17-3"/><path fill="#dd8953" d="M39 35q9 13 9 33l11-4q0-17-10-30Z"/></g></svg>`,
  },
  bone: {
    name: "Косточка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path fill="#ffebc7" stroke="#3b2e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" d="M23 51l32-27C52 12 60 6 68 9q10 3 10 13C90 18 97 30 90 39q-6 8-16 4L43 70c4 11-3 21-13 21q-12 0-13-14C6 79 3 67 9 58q5-8 14-7Z"/></svg>`,
  },
  milk: {
    name: "Миска молока",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#79c9de" d="M7 40q3 28 23 39 20 8 40 0 20-11 23-39Z"/><ellipse cx="50" cy="40" rx="43" ry="16" fill="#ace3ed"/><ellipse cx="50" cy="42" rx="35" ry="10" fill="#fffaf0"/></g></svg>`,
  },
  grain: {
    name: "Зёрнышки",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#f6c75a" d="M39 40Q36 16 65 9Q74 32 50 44Q43 47 39 40Z"/><path fill="#ffdb79" d="M10 72Q8 49 34 42Q45 62 24 77Q15 82 10 72Z"/><path fill="#efb34e" d="M48 79Q50 54 84 49Q89 75 62 85Q51 89 48 79Z"/><path fill="none" d="M46 36l12-16M17 69l12-17m28 24 18-17"/></g></svg>`,
  },
  honeyPot: {
    name: "Бочонок мёда",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#d79559" d="M23 24q-14 30-3 55c8 16 52 16 60 0q11-25-3-55Z"/><path fill="none" d="M35 44q-5 25 1 42m29-41q5 23-1 41"/><path fill="#99adb0" d="M17 68q33 11 66 0l-2 10q-31 11-62 0Z"/><path fill="#ffbd38" d="M22 24q28-16 56 0l2 10q-2 6-8 5v10c0 8-11 9-11 1v-6q-1-5-5-3c-7 6-17 0-22-2q-9 3-13-5Z"/><ellipse cx="50" cy="24" rx="28" ry="10" fill="#ffda60"/></g></svg>`,
  },
  fish2: {
    name: "Рыбка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#73cbbf" d="M57 38q-6-15-23-17l3 17Z"/><path fill="#8adbd0" d="M8 50q25-37 60-10l5 5 17-13v36L73 56q-33 35-65-6Z"/><path fill="none" d="M35 38q7 12 0 24"/><path fill="#51b4ac" d="M46 49l13-3q-2 9-12 12Z"/></g><circle cx="23" cy="47" r="3.5" fill="#3b2e25"/></svg>`,
  },
  cheese2: {
    name: "Кусочек сыра",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#ffdf75" d="M9 49l52-31q21 5 29 22L66 56Z"/><path fill="#f6be53" d="M9 49l81-9v13c-11 1-12 14 0 15v6L9 85Z"/><ellipse cx="60" cy="34" rx="6" ry="3" fill="#e9a84a"/><circle cx="28" cy="66" r="5" fill="#e9a84a"/><circle cx="61" cy="59" r="7" fill="#e9a84a"/></g></svg>`,
  },
  seeds: {
    name: "Семечки",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#626775" d="M22 10Q13 29 17 43C21 61 44 55 43 41Q42 26 22 10Z"/><path fill="#525968" d="M84 16Q58 21 50 38C44 53 60 63 71 50Q82 38 84 16Z"/><path fill="#737886" d="M67 69Q44 55 26 62C10 69 17 88 33 87Q50 86 67 69Z"/></g><g fill="none" stroke="#e8dfca" stroke-width="3.5" stroke-linecap="round"><path d="M24 23q0 13 7 22m45-19L57 46M53 69l-25 7"/></g></svg>`,
  },
  cabbage: {
    name: "Капуста",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#b5df84" d="M16 53C12 38 21 23 34 22q11-14 25-6 18-2 23 16 11 10 4 26L52 84Z"/><path fill="#8ccd77" d="M53 84Q16 89 9 58 3 34 18 37q13 0 24 14 16 17 11 33Z"/><path fill="#a0d97c" d="M43 84q-1-25 17-40 17-15 28-8 10 8-1 29-14 23-44 19Z"/><path fill="none" d="M19 48q16 10 25 27m9 0 25-27M31 32q12-9 20 4m7-10 11 6"/></g></svg>`,
  },
  grass: {
    name: "Травка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="#86d17b" d="M23 80Q20 57 7 36q17 6 29 28Q29 32 32 15q16 16 21 44Q61 25 77 13q-10 31-10 51 11-17 26-23-13 20-17 39-24 9-53 0Z"/><path fill="none" d="M42 73l-4-17m20 18 4-21"/></g></svg>`,
  },
  oats: {
    name: "Овёс",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path fill="none" d="M38 91q9-39 18-77M49 44Q34 32 24 38m22 24Q30 50 17 59m36-31q15-13 23-6M49 48q12-9 22-4"/><path fill="#f4cc74" d="M25 36q3 17-12 22-2-16 12-22Zm-7 21q4 16-10 24-4-15 10-24Zm57-37q15 4 14 21-14-2-14-21Zm-5 22q16 4 15 22-15-3-15-22ZM56 18q-7-8 2-15 8 9-2 15Z"/></g></svg>`,
  },
};
export const FOODS: Record<string, { name: string; svg: string }> = {
  ...NEW_FOODS,
  apple: { name: "Яблоко", svg: OBJECTS.apple.svg },
  carrot: { name: "Морковка", svg: OBJECTS.carrot.svg },
  fish: { name: "Рыбка", svg: OBJECTS.fish.svg },
  mushroom: { name: "Грибок", svg: OBJECTS.mushroom.svg },
};

/** Who eats what. Astra's cow is the sheep and her goat the piglet (no cow or goat picture). */
export const EATS: Record<string, string[]> = {
  squirrel: ["nut", "cone", "mushroom"],
  hare: ["carrot", "cabbage"],
  sheep: ["hay", "grass"],
  dog: ["bone"],
  cat: ["milk", "fish2"],
  bird: ["grain", "seeds"],
  bear: ["honeyPot", "fish"],
  hedgehog: ["apple", "mushroom"],
  horse: ["oats", "carrot", "hay"],
  mouse: ["cheese2", "grain"],
  piglet: ["cabbage", "apple"],
  chicken: ["grain"],
};

export type FeedLevel = {
  id: string;
  world: "feed1" | "feed2" | "feed3";
  title: string;
  animals: string[];
  foods: string[];
  extra: string[];
  ask: string;
  done: string;
};

export const FEED_WORLDS = [
  { id: "feed1", title: "Кто что ест?", color: "#f29a4a" },
  { id: "feed2", title: "Обед для троих", color: "#7cc46a" },
  { id: "feed3", title: "Большой обед", color: "#3a8fd4" },
];

const L = (id: string, world: FeedLevel["world"], title: string, animals: string[], foods: string[], extra: string[], ask: string, done: string): FeedLevel => ({
  id,
  world,
  title,
  animals,
  foods,
  extra,
  ask,
  done,
});

export const FEED_LEVELS: FeedLevel[] = [
  L("kf1", "feed1", "Под ёлкой", ["squirrel", "hare"], ["carrot", "nut"], [], "Угости белочку и зайку!", "Зайка хрустит морковкой, а белочка грызёт орешек!"),
  L("kf2", "feed1", "Тёплый двор", ["sheep", "dog"], ["bone", "hay"], [], "Кому сено, а кому косточку?", "Овечка жуёт сено, собачка грызёт косточку!"),
  L("kf3", "feed1", "Пёстрые миски", ["mouse", "cat"], ["milk", "cheese2"], [], "Что дать мышке? А кошке?", "Мышке — сыр, кошке — молоко!"),
  L("kf4", "feed1", "Мёд и семечки", ["bear", "bird"], ["seeds", "honeyPot"], [], "Кто любит мёд? А кто семечки?", "Мишке — мёд, птичке — семечки!"),
  L("kf5", "feed2", "Весёлое утро", ["horse", "chicken", "piglet"], ["cabbage", "oats", "grain"], ["bone"], "Выбери завтрак для каждого!", "Все позавтракали!"),
  L("kf6", "feed2", "Ёжик в гостях", ["hedgehog", "cat", "sheep"], ["grass", "apple", "fish2"], ["nut"], "Кто что любит? Угости!", "Всем вкусно!"),
  L("kf7", "feed2", "У берёзки", ["squirrel", "mouse", "dog"], ["cheese2", "bone", "cone"], ["milk"], "Кому дать шишку? Накорми всех!", "Все сыты!"),
  L("kf8", "feed2", "У лесной речки", ["bear", "hare", "bird"], ["seeds", "fish", "carrot"], ["hay"], "Подбери еду для каждого!", "Мишка поймал рыбку, а зайка грызёт морковку!"),
  L(
    "kf9",
    "feed3",
    "На зелёном лугу",
    ["sheep", "hare", "chicken", "dog"],
    ["grain", "bone", "grass", "carrot"],
    ["honeyPot", "cheese2"],
    "Накорми зверят на лугу!",
    "На лугу все сыты!",
  ),
  L(
    "kf10",
    "feed3",
    "За пеньком ёжик",
    ["hedgehog", "squirrel", "bear", "bird"],
    ["cone", "seeds", "apple", "honeyPot"],
    ["hay", "bone"],
    "Раздай угощения лесным друзьям!",
    "Лесные друзья говорят: спасибо!",
  ),
  L(
    "kf11",
    "feed3",
    "Пёстрый лужок",
    ["horse", "piglet", "cat", "mouse"],
    ["milk", "oats", "cheese2", "cabbage"],
    ["cone", "honeyPot"],
    "Что кому по вкусу? Угости!",
    "Всем по вкусу!",
  ),
  L(
    "kf12",
    "feed3",
    "Вкусный вечер",
    ["hedgehog", "bear", "horse", "chicken"],
    ["hay", "mushroom", "grain", "fish"],
    ["bone", "cheese2"],
    "Выбери каждому что-нибудь вкусное!",
    "Ням-ням, все сыты!",
  ),
];

/** The animal in this level that eats the food, or null. */
export const eaterOf = (level: FeedLevel, food: string): string | null => level.animals.find((a) => EATS[a]?.includes(food)) ?? null;
