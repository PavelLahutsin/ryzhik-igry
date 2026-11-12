import type { LevelInfo } from "../../shared/levelgame";
import { inWorldOrder } from "../../shared/order";
import { curve, type Pt } from "./logic";

export type Alive = "glow" | "spin" | "bounce" | "swim" | "flutter" | "drive" | "smoke" | "sway" | "rock" | "launch" | "beat";

export type DotPicture = LevelInfo & {
  dots: Pt[];
  /** Fill colour of the joined shape. */
  color: string;
  /** Details drawn over the shape when it is done (eyes, windows …). */
  details: string;
  alive: Alive;
  done: string;
};

const INK = "#3b2e25";
const eye = (x: number, y: number): string => `<circle cx="${x}" cy="${y}" r="5.5" fill="${INK}"/><circle cx="${x + 1.6}" cy="${y - 1.6}" r="1.8" fill="#fff"/>`;
const P = (...xy: number[]): Pt[] => xy.reduce<Pt[]>((a, v, i) => (i % 2 ? (a[a.length - 1]!.y = v, a) : [...a, { x: v, y: 0 }]), []);

const star = curve(10, (t) => {
  const a = -Math.PI / 2 + t * Math.PI * 2;
  const r = Math.round(t * 10) % 2 ? 34 : 80;
  return { x: 100 + r * Math.cos(a), y: 108 + r * Math.sin(a) };
});

const heart = P(100, 62, 118, 40, 144, 34, 166, 48, 174, 74, 166, 102, 146, 128, 122, 152, 100, 172, 78, 152, 54, 128, 34, 102, 26, 74, 34, 48, 56, 34, 82, 40);

export const worlds = [
  { id: "ten", title: "Считаем до 10", color: "#ffb23f" },
  { id: "more", title: "Дальше 10", color: "#7cc46a" },
  { id: "fun", title: "Весёлые картинки", color: "#6db3d4" },
];

const ALL: DotPicture[] = [
  {
    id: "t1",
    title: "Кристаллик",
    world: "ten",
    dots: P(70, 50, 130, 50, 162, 86, 100, 166, 38, 86),
    color: "#6fd0e8",
    details: `<path d="M70 50 L86 86 L100 50 L114 86 L130 50 M38 86 H162 M86 86 L100 166 L114 86" fill="none" stroke="#fff" stroke-width="3" opacity=".75"/>`,
    alive: "spin",
    done: "Блестит!",
  },
  {
    id: "t2",
    title: "Кораблик",
    world: "ten",
    dots: P(100, 22, 150, 110, 172, 124, 142, 168, 58, 168, 28, 124, 52, 110),
    color: "#f2a65a",
    details: `<path d="M100 22 L100 124 M100 30 L146 108 L100 108 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M28 124 H172" stroke="${INK}" stroke-width="3"/><circle cx="76" cy="146" r="7" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="124" cy="146" r="7" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M10 180 q15 -10 30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="#6db3d4" stroke-width="5" stroke-linecap="round"/>`,
    alive: "rock",
    done: "Поплыл!",
  },
  {
    id: "t3",
    title: "Машинка",
    world: "ten",
    dots: P(24, 142, 24, 110, 56, 104, 76, 66, 130, 66, 152, 104, 178, 112, 178, 142),
    color: "#e8463a",
    details: `<path d="M84 76 H100 V102 H66 Z M110 76 H126 L140 102 H110 Z" fill="#cdeefb" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="60" cy="146" r="17" fill="${INK}"/><circle cx="60" cy="146" r="7" fill="#ccc"/><circle cx="144" cy="146" r="17" fill="${INK}"/><circle cx="144" cy="146" r="7" fill="#ccc"/><circle cx="170" cy="120" r="5" fill="#ffd54a"/>`,
    alive: "drive",
    done: "Би-би! Поехали!",
  },
  {
    id: "t4",
    title: "Котик",
    world: "ten",
    dots: P(55, 160, 38, 115, 48, 40, 82, 72, 118, 72, 152, 40, 162, 115, 145, 160, 100, 178),
    color: "#ff9d4a",
    details: `${eye(80, 112)}${eye(120, 112)}<path d="M94 130 L106 130 L100 137 Z" fill="#e8708a"/><path d="M100 137 q-8 10 -16 4 M100 137 q8 10 16 4" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M58 128 L28 122 M58 136 L30 142 M142 128 L172 122 M142 136 L170 142" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path d="M56 52 L70 72 L56 70 Z M144 52 L130 72 L144 70 Z" fill="#ffc6a8"/>`,
    alive: "bounce",
    done: "Мяу! Мур-мур!",
  },
  {
    id: "t5",
    title: "Домик",
    world: "ten",
    dots: P(50, 180, 50, 102, 100, 52, 122, 74, 122, 44, 144, 44, 144, 98, 150, 180),
    color: "#ffe0a8",
    details: `<rect x="122" y="44" width="22" height="50" fill="#9a6a3a" stroke="${INK}" stroke-width="3"/><path d="M44 106 L100 50 L156 106 Z" fill="#e8463a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="52" y="104" width="96" height="76" fill="#ffe0a8"/><rect x="62" y="116" width="26" height="24" fill="#ffd54a" stroke="${INK}" stroke-width="3"/><rect x="88" y="140" width="28" height="40" rx="4" fill="#9a6a3a" stroke="${INK}" stroke-width="3"/><rect x="120" y="116" width="22" height="20" fill="#ffd54a" stroke="${INK}" stroke-width="3"/>`,
    alive: "smoke",
    done: "В домике тепло!",
  },
  {
    id: "t6",
    title: "Звёздочка",
    world: "ten",
    dots: star,
    color: "#ffd54a",
    details: `${eye(88, 108)}${eye(112, 108)}<path d="M90 124 q10 10 20 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    alive: "spin",
    done: "Звёздочка сияет!",
  },
  {
    id: "t7",
    title: "Рыбка",
    world: "ten",
    dots: P(30, 100, 60, 66, 110, 58, 145, 85, 176, 60, 170, 100, 176, 140, 145, 115, 110, 142, 60, 134),
    color: "#ff8a3d",
    details: `${eye(62, 92)}<path d="M100 70 q14 30 0 60 M120 76 q10 24 0 48" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M34 106 q8 6 14 2" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    alive: "swim",
    done: "Буль-буль, поплыла!",
  },
  {
    id: "t8",
    title: "Ракета",
    world: "more",
    dots: P(100, 14, 126, 50, 126, 118, 152, 148, 152, 172, 126, 156, 74, 156, 48, 172, 48, 148, 74, 118, 74, 50),
    color: "#e9eef5",
    details: `<path d="M100 14 L126 50 H74 Z" fill="#e8463a"/><circle cx="100" cy="88" r="14" fill="#6db3d4" stroke="${INK}" stroke-width="3"/><path d="M126 118 L152 148 V172 L126 156 Z M74 118 L48 148 V172 L74 156 Z" fill="#e8463a"/><path class="td-flame" d="M84 158 Q100 196 116 158 Z" fill="#ffb23f"/>`,
    alive: "launch",
    done: "Пуск! Летим к звёздам!",
  },
  {
    id: "t9",
    title: "Тюльпан",
    world: "more",
    dots: P(60, 30, 80, 60, 100, 24, 120, 60, 140, 30, 152, 86, 130, 120, 108, 124, 108, 182, 92, 182, 92, 124, 70, 120, 48, 86),
    color: "#e8708a",
    details: `<rect x="92" y="122" width="16" height="60" fill="#5fae4e"/><path d="M100 168 q-30 -6 -40 -34 q28 4 40 26 M100 160 q30 -8 40 -36 q-28 4 -40 28" fill="#7cc46a"/>`,
    alive: "sway",
    done: "Расцвёл!",
  },
  {
    id: "t10",
    title: "Ёлочка",
    world: "more",
    dots: P(100, 20, 136, 64, 118, 64, 152, 104, 130, 104, 166, 150, 110, 150, 110, 182, 90, 182, 90, 150, 34, 150, 70, 104, 48, 104, 82, 64, 64, 64),
    color: "#4f9a4a",
    details: `<rect x="90" y="150" width="20" height="32" fill="#9a6a3a"/><circle cx="96" cy="58" r="6" fill="#e8463a"/><circle cx="118" cy="96" r="6" fill="#ffd54a"/><circle cx="80" cy="100" r="6" fill="#6db3d4"/><circle cx="130" cy="138" r="6" fill="#e8463a"/><circle cx="70" cy="140" r="6" fill="#ffd54a"/><circle cx="100" cy="124" r="6" fill="#e8708a"/>`,
    alive: "sway",
    done: "Ёлочка зажглась!",
  },
  {
    id: "t11",
    title: "Сердечко",
    world: "more",
    dots: heart,
    color: "#ef5b6b",
    details: `<path d="M64 64 q10 -14 26 -6" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>`,
    alive: "beat",
    done: "Тук-тук! Это тебе!",
  },
  {
    id: "t12",
    title: "Бабочка",
    world: "more",
    dots: P(100, 62, 130, 30, 170, 34, 166, 86, 132, 100, 162, 124, 150, 166, 116, 152, 100, 122, 84, 152, 50, 166, 38, 124, 68, 100, 34, 86, 30, 34, 70, 30),
    color: "#b58be8",
    details: `<ellipse cx="100" cy="100" rx="8" ry="42" fill="${INK}"/><path d="M96 60 q-10 -20 -18 -22 M104 60 q10 -20 18 -22" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="62" cy="62" r="12" fill="#ffd54a"/><circle cx="138" cy="62" r="12" fill="#ffd54a"/><circle cx="68" cy="136" r="9" fill="#6fd0e8"/><circle cx="132" cy="136" r="9" fill="#6fd0e8"/>`,
    alive: "flutter",
    done: "Полетела!",
  },
  {
    id: "t13",
    title: "Грибок",
    world: "fun",
    dots: P(30, 104, 44, 66, 70, 44, 100, 36, 130, 44, 156, 66, 170, 104, 126, 104, 130, 170, 70, 170, 74, 104),
    color: "#e8463a",
    details: `<path d="M74 104 H126 L130 170 H70 Z" fill="#f6e7cf" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="70" cy="74" r="9" fill="#fff"/><circle cx="104" cy="58" r="8" fill="#fff"/><circle cx="138" cy="80" r="10" fill="#fff"/>${eye(88, 134)}${eye(112, 134)}`,
    alive: "bounce",
    done: "Вырос грибок!",
  },
  {
    id: "t14",
    title: "Зонтик",
    world: "fun",
    dots: P(24, 100, 40, 60, 70, 36, 100, 28, 130, 36, 160, 60, 176, 100, 150, 92, 126, 100, 100, 92, 74, 100, 50, 92),
    color: "#6db3d4",
    details: `<path d="M100 30 L74 98 M100 30 L126 98 M100 30 V92" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/><path d="M100 94 V164 q0 16 -16 16 q-12 0 -14 -12" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="26" r="5" fill="${INK}"/>`,
    alive: "sway",
    done: "Теперь дождик не страшен!",
  },
];

/** Easier extra worlds sit where their difficulty fits, so levels keep getting harder. */
export const levels: DotPicture[] = inWorldOrder(ALL, ["ten", "fun", "more"]);
