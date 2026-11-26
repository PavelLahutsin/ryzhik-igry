import * as A from "./art";
import { CHERDAK } from "./scene-cherdak";
import { VERANDA } from "./scene-veranda";
import type { CharId, Seat } from "./logic";

export type PropState = { night: boolean; n: number; on: boolean };

export type TapKind =
  | "curtains"
  | "lamp"
  | "clock"
  | "radio"
  | "toybox"
  | "plant"
  | "frame"
  | "sun"
  | "cloud"
  | "appletree"
  | "flowerbed"
  | "birdhouse"
  | "butterfly"
  | "carrots"
  | "fir"
  | "mushrooms"
  | "frog"
  | "oak"
  | "bush"
  | "pond"
  | "stump"
  | "turn" | "chime" | "sprinkle" | "sway" | "paddle" | "quack" | "stack" | "drum" | "flap"
  | "none";

export type PropDef = {
  id: string;
  name: string;
  /** Top-left corner and size in world units (1600 × 1000). */
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  art: (s: PropState) => string;
  tap: TapKind;
  /** Initial counter (apples on the tree, berries on the bush …). */
  n?: number;
};

export type SceneDef = {
  id: string;
  title: string;
  /** Characters stand on the ground band below this y. */
  floor: number;
  indoorLamp?: string;
  back: (night: boolean) => string;
  props: PropDef[];
  seats: Seat[];
  cast: Array<{ id: CharId; x: number; y: number }>;
  /** Tab picture. */
  icon: string;
};

export const SCENES: SceneDef[] = [
  {
    id: "dom",
    title: "Дом",
    floor: 760,
    back: A.roomBack,
    indoorLamp: "lamp",
    icon: A.svg(100, 100, `<rect x="16" y="40" width="68" height="52" fill="#ffe1a8" stroke="#3b2e25" stroke-width="5"/><path d="M6 46 L 50 10 L 94 46 Z" fill="#e8463a" stroke="#3b2e25" stroke-width="5" stroke-linejoin="round"/><rect x="42" y="62" width="16" height="30" fill="#9b6a3c" stroke="#3b2e25" stroke-width="4"/>`),
    props: [
      { id: "storybook", name: "Книжка с картинками", x: 518, y: 385, w: 182, h: 103, art: (s) => A.bookArt(s.n), tap: "turn" },
      { id: "bells", name: "Колокольчики", x: 1240, y: 66, w: 230, h: 230, art: A.chimesArt, tap: "chime" },
      { id: "window", name: "Окно", x: 140, y: 150, w: 300, h: 300, art: (s) => A.windowArt(s.on, s.night), tap: "curtains" },
      { id: "frame", name: "Картина", x: 560, y: 170, w: 250, h: 180, art: A.frameArt, tap: "frame" },
      { id: "clock", name: "Часы", x: 880, y: 140, w: 170, h: 200, art: () => A.clockArt(), tap: "clock" },
      { id: "lamp", name: "Торшер", x: 1060, y: 360, w: 140, h: 380, art: (s) => A.lampArt(s.on), tap: "lamp" },
      { id: "bed", name: "Кровать", x: 1150, y: 500, w: 440, h: 280, art: () => A.bedArt(), tap: "none" },
      { id: "blanket", name: "Одеяло", x: 1150, y: 640, w: 440, h: 160, z: 900, art: () => A.blanketArt(), tap: "none" },
      { id: "radio", name: "Радио", x: 470, y: 500, w: 240, h: 250, art: () => A.radioArt(), tap: "radio" },
      { id: "toybox", name: "Ящик с игрушками", x: 760, y: 600, w: 240, h: 210, art: (s) => A.toyboxArt(s.on), tap: "toybox" },
      { id: "plant", name: "Цветок", x: 30, y: 540, w: 160, h: 240, art: (s) => A.plantArt(s.n), tap: "plant" },
    ],
    seats: [{ id: "bed", x: 1330, y: 700, pose: "sleep" }],
    cast: [
      { id: "ryzhik", x: 330, y: 900 },
      { id: "mama", x: 620, y: 930 },
      { id: "papa", x: 1000, y: 950 },
    ],
  },
  {
    id: "sad",
    title: "Сад",
    floor: 690,
    back: (night) => A.gardenBack(night),
    icon: A.svg(100, 100, `<path d="M46 96 V60" stroke="#9b6a3c" stroke-width="10"/><circle cx="50" cy="40" r="30" fill="#6fbf4a" stroke="#3b2e25" stroke-width="5"/><circle cx="38" cy="36" r="7" fill="#e8463a"/><circle cx="62" cy="46" r="7" fill="#e8463a"/>`),
    props: [
      { id: "pinwheel", name: "Вертушка", x: 738, y: 460, w: 178, h: 235, art: (s) => A.wheelArt(s.n), tap: "turn" },
      { id: "can", name: "Лейка", x: 493, y: 839, w: 186, h: 138, art: A.canArt, tap: "sprinkle" },
      { id: "sun", name: "Солнышко", x: 1330, y: 40, w: 200, h: 200, art: (s) => A.sunArt(s.night), tap: "sun" },
      { id: "cloud", name: "Облако", x: 760, y: 60, w: 300, h: 170, art: (s) => A.cloudArt(s.night), tap: "cloud" },
      { id: "appletree", name: "Яблоня", x: 1060, y: 220, w: 520, h: 640, art: (s) => A.appleTreeArt(s.n), tap: "appletree", n: 5 },
      { id: "swing", name: "Качели", x: 380, y: 360, w: 300, h: 460, art: () => A.swingArt(), tap: "none" },
      { id: "birdhouse", name: "Скворечник", x: 140, y: 330, w: 160, h: 380, art: (s) => A.birdhouseArt(s.on), tap: "birdhouse" },
      { id: "flowerbed", name: "Клумба", x: 650, y: 700, w: 440, h: 200, art: (s) => A.flowerbedArt(s.n), tap: "flowerbed" },
      { id: "carrots", name: "Грядка", x: 60, y: 820, w: 280, h: 130, art: (s) => A.carrotsArt(s.n), tap: "carrots", n: 4 },
      { id: "butterfly", name: "Бабочка", x: 900, y: 520, w: 120, h: 100, z: 950, art: () => A.butterflyArt(), tap: "butterfly" },
    ],
    seats: [{ id: "swing", x: 530, y: 700, pose: "swing" }],
    cast: [
      { id: "ryzhik", x: 980, y: 930 },
      { id: "belka", x: 1450, y: 900 },
      { id: "ezhik", x: 420, y: 930 },
    ],
  },
  {
    id: "les",
    title: "Лес",
    floor: 680,
    back: (night) => A.forestBack(night),
    icon: A.svg(100, 100, `<path d="M50 6 L 20 54 H 36 L 14 88 H 86 L 64 54 H 80 Z" fill="#3f8f2c" stroke="#3b2e25" stroke-width="5" stroke-linejoin="round"/><rect x="44" y="88" width="12" height="10" fill="#9b6a3c"/>`),
    props: [
      { id: "snail", name: "Улитка", x: 314, y: 873, w: 182, h: 112, art: (s) => A.snailArt(s.n), tap: "sway" },
      { id: "fern", name: "Папоротник", x: 975, y: 719, w: 174, h: 144, art: (s) => A.fernArt(s.n), tap: "sway" },
      { id: "oak", name: "Дуб с дуплом", x: 20, y: 140, w: 320, h: 620, art: (s) => A.oakArt(s.night), tap: "oak" },
      { id: "fir", name: "Ёлка", x: 560, y: 150, w: 300, h: 580, art: () => A.firArt(), tap: "fir" },
      { id: "bush", name: "Черничный куст", x: 870, y: 560, w: 260, h: 180, art: (s) => A.bushArt(s.n), tap: "bush", n: 6 },
      { id: "stump", name: "Пенёк", x: 330, y: 680, w: 240, h: 170, art: () => A.stumpArt(), tap: "stump" },
      { id: "mushrooms", name: "Грибы", x: 760, y: 830, w: 220, h: 160, art: () => A.mushroomsArt(), tap: "mushrooms" },
      { id: "frog", name: "Лягушка", x: 1110, y: 800, w: 130, h: 100, z: 880, art: () => A.frogArt(), tap: "frog" },
      { id: "pond", name: "Пруд", x: 1140, y: 790, w: 300, h: 120, z: 5, art: () => A.pondSpotArt(), tap: "pond" },
    ],
    seats: [{ id: "stump", x: 450, y: 720, pose: "sit" }],
    cast: [
      { id: "mishka", x: 1490, y: 979 },
      { id: "ryzhik", x: 230, y: 930 },
      { id: "ezhik", x: 668, y: 954 },
      { id: "belka", x: 1230, y: 733 },
    ],
  },
  {
    id: "rechka", title: "Речка", floor: 782, back: A.riverBack, icon: A.boatArt(0),
    props: [
      { id: "bridge", name: "Мостик", x: 120, y: 342, w: 455, h: 282, art: A.bridgeArt, tap: "drum" },
      { id: "sailboat", name: "Лодочка", x: 776, y: 336, w: 270, h: 204, art: (s) => A.boatArt(s.n), tap: "paddle" },
      { id: "rushes", name: "Камыши", x: 30, y: 497, w: 175, h: 244, art: A.reedsArt, tap: "sway" },
      { id: "shoal", name: "Стайка рыбок", x: 465, y: 565, w: 246, h: 148, art: (s) => A.shoalArt(s.n), tap: "paddle" },
      { id: "ducks", name: "Утка с утятами", x: 1180, y: 462, w: 337, h: 151, art: (s) => A.ducksArt(s.n), tap: "quack" },
      { id: "lily", name: "Кувшинка", x: 930, y: 600, w: 188, h: 126, art: (s) => A.lilyArt(s.n), tap: "sprinkle" },
    ],
    seats: [{ id: "bridge", x: 348, y: 520, pose: "sit" }],
    cast: [{ id: "ryzhik", x: 786, y: 905 }, { id: "papa", x: 1220, y: 967 }],
  },
  {
    id: "detskaya", title: "Детская", floor: 775, back: A.nurseryBack, icon: A.tentArt(true), indoorLamp: "nightlight",
    props: [
      { id: "tent", name: "Шалаш", x: 50, y: 360, w: 475, h: 407, art: (s) => A.tentArt(s.on), tap: "flap" },
      { id: "rocker", name: "Лошадка-качалка", x: 1130, y: 530, w: 390, h: 297, art: A.rockerArt, tap: "sway" },
      { id: "blocks", name: "Кубики", x: 572, y: 568, w: 231, h: 209, art: (s) => A.blocksArt(s.n), tap: "stack" },
      { id: "nightlight", name: "Ночник", x: 967, y: 345, w: 200, h: 188, art: (s) => A.nightlightArt(s.on), tap: "lamp" },
      { id: "drum", name: "Барабан", x: 868, y: 595, w: 196, h: 165, art: A.drumArt, tap: "drum" },
      { id: "picturebook", name: "Книжка", x: 320, y: 808, w: 220, h: 155, art: (s) => A.bookArt(s.n), tap: "turn" },
    ],
    seats: [{ id: "rocker", x: 1293, y: 687, pose: "sit" }],
    cast: [{ id: "ryzhik", x: 650, y: 965 }, { id: "mama", x: 1100, y: 959 }],
  },
  {
    id: "plyazh",
    title: "Пляж",
    floor: 755,
    back: A.beachBack,
    icon: A.beachIcon,
    props: [
      { id: "parasol", name: "Зонтик", x: 60, y: 286, w: 370, h: 500, art: (s) => A.beachUmbrellaArt(s.on), tap: "flap" },
      { id: "dinghy", name: "Лодочка", x: 620, y: 368, w: 238, h: 175, art: (s) => A.beachBoatArt(s.n), tap: "paddle" },
      { id: "shellbells", name: "Ракушки на ниточках", x: 1280, y: 382, w: 225, h: 339, art: A.beachShellsArt, tap: "chime" },
      { id: "lounger", name: "Шезлонг", x: 107, y: 691, w: 300, h: 164, art: (s) => A.beachLoungerArt(s.n), tap: "sway" },
      { id: "pinwheel", name: "Вертушка", x: 477, y: 537, w: 176, h: 259, art: (s) => A.beachWheelArt(s.n), tap: "turn" },
      { id: "sandfort", name: "Песочный замок", x: 845, y: 723, w: 300, h: 225, art: (s) => A.beachCastleArt(s.n), tap: "stack", n: 1 },
      { id: "pail", name: "Ведёрко с водой", x: 1418, y: 780, w: 182, h: 177, art: (s) => A.beachPailArt(s.n), tap: "sprinkle" },
    ],
    seats: [{ id: "lounger", x: 285, y: 779, pose: "sit" }],
    cast: [
      { id: "ryzhik", x: 697, y: 914 },
      { id: "belka", x: 476, y: 948 },
    ],
  },
  {
    id: "dvor",
    title: "Двор",
    floor: 750,
    back: A.yardBack,
    icon: A.yardIcon,
    props: [
      { id: "line", name: "Бельевая верёвка", x: 228, y: 315, w: 395, h: 316, art: (s) => A.yardLineArt(s.n), tap: "sway", n: 0 },
      { id: "gate", name: "Калитка", x: 671, y: 437, w: 258, h: 195, art: (s) => A.yardGateArt(s.on), tap: "flap" },
      { id: "pinwheel", name: "Вертушка", x: 968, y: 331, w: 150, h: 241, art: (s) => A.yardWheelArt(s.n), tap: "turn", n: 0 },
      { id: "bells", name: "Колокольчики", x: 1389, y: 388, w: 157, h: 169, art: A.yardBellsArt, tap: "chime" },
      { id: "bench", name: "Скамейка", x: 1052, y: 628, w: 338, h: 178, art: A.yardBenchArt, tap: "none" },
      { id: "sandpit", name: "Песочница", x: 48, y: 704, w: 395, h: 197, art: (s) => A.yardSandArt(s.n), tap: "stack", n: 0 },
      { id: "puddle", name: "Лужа", x: 1258, y: 850, w: 293, h: 107, art: (s) => A.yardPuddleArt(s.n, s.night), tap: "sprinkle", n: 0 },
    ],
    seats: [{ id: "bench", x: 1221, y: 750, pose: "sit" }],
    cast: [
      { id: "ryzhik", x: 602, y: 929 },
      { id: "belka", x: 915, y: 949 },
    ],
  },
  CHERDAK,
  VERANDA,
];

/** Every discovery the home tile counts: each prop with a reaction, each seat, every favourite meal, and the night. */
export function allFinds(): string[] {
  const out: string[] = ["night"];
  for (const scene of SCENES) {
    for (const prop of scene.props) if (prop.tap !== "none") out.push(`${scene.id}:${prop.id}`);
    for (const seat of scene.seats) out.push(`seat:${seat.id}`);
  }
  for (const char of ["ryzhik", "mama", "papa", "belka", "ezhik", "mishka"]) out.push(`fav:${char}`);
  return out;
}

export const PHRASES: Record<CharId, string[]> = {
  ryzhik: ["Привет!", "Поиграем?", "Ура!", "Хи-хи!", "Я Рыжик!", "Давай играть вместе!", "Что там шуршит?"],
  mama: ["Здравствуй!", "Как хорошо с тобой!", "Давай обнимемся!", "Хочешь сказку?", "Я тебя люблю!"],
  papa: ["Рад тебя видеть!", "Слышишь ветерок?", "Посидим рядышком?", "Пойдём гулять?", "Хо-хо!"],
  belka: ["Привет!", "Где мои шишки?", "Прыг-скок!", "Поищи со мной!", "Слышишь шелест?"],
  ezhik: ["Фыр-фыр!", "Привет!", "Я ищу грибы!", "Вот тропинка!", "Пойдём за мной?"],
  mishka: ["Р-р-р… привет!", "Люблю ягоды!", "Обнимашки!", "Угощайся!", "Давай потопаем!"],
};
