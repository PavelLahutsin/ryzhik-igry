import { picture } from "../../shared/assets";
import * as A from "./art";
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
    back: () => A.roomBack(),
    icon: A.svg(100, 100, `<rect x="16" y="40" width="68" height="52" fill="#ffe1a8" stroke="#3b2e25" stroke-width="5"/><path d="M6 46 L 50 10 L 94 46 Z" fill="#e8463a" stroke="#3b2e25" stroke-width="5" stroke-linejoin="round"/><rect x="42" y="62" width="16" height="30" fill="#9b6a3c" stroke="#3b2e25" stroke-width="4"/>`),
    props: [
      { id: "window", name: "Окно", x: 140, y: 150, w: 300, h: 300, art: (s) => A.windowArt(s.on, s.night), tap: "curtains" },
      { id: "frame", name: "Фотография", x: 560, y: 170, w: 250, h: 180, art: () => A.frameArt(picture("vse-vmeste")), tap: "frame" },
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
      { id: "mishka", x: 1480, y: 985 },
      { id: "ryzhik", x: 230, y: 930 },
      { id: "ezhik", x: 640, y: 960 },
      { id: "belka", x: 1250, y: 730 },
    ],
  },
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
  ryzhik: ["Привет!", "Поиграем?", "Ура!", "Хи-хи!", "Я Рыжик!"],
  mama: ["Здравствуй, малыш!", "Какой ты молодец!", "Я тебя люблю!"],
  papa: ["Привет, сынок!", "Пойдём гулять?", "Хо-хо!"],
  belka: ["Привет!", "Где мои шишки?", "Прыг-скок!"],
  ezhik: ["Фыр-фыр!", "Привет!", "Я ищу грибы"],
  mishka: ["Р-р-р… привет!", "Люблю ягоды!", "Обнимашки!"],
};
