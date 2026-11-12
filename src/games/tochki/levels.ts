import type { LevelInfo } from "../../shared/levelgame";
import { inWorldOrder } from "../../shared/order";
import { curve, type CountRule, type Pt } from "./logic";

export type Alive = "glow" | "spin" | "bounce" | "swim" | "flutter" | "drive" | "smoke" | "sway" | "rock" | "launch" | "beat";

/**
 * How the dots are labelled: 1, 2, 3… (default), backwards from N, by 2s /
 * 5s / 10s, or by the alphabet А, Б, В…
 */
export type Count = CountRule;

export type DotPicture = LevelInfo & {
  dots: Pt[];
  count?: Count;
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
  { id: "down", title: "Считаем назад", color: "#e8708a" },
  { id: "skip", title: "Через одну и пятёрками", color: "#b58be8" },
  { id: "abc", title: "По алфавиту", color: "#3fae6a" },
  { id: "big", title: "Много точек", color: "#e8463a" },
];

const ring = (n: number, cx: number, cy: number, r: (i: number) => number): Pt[] =>
  curve(n, (t) => {
    const a = -Math.PI / 2 + t * Math.PI * 2;
    const k = Math.round(t * n);
    return { x: cx + r(k) * Math.cos(a), y: cy + r(k) * Math.sin(a) };
  });

const leaf = curve(10, (t) => {
  const a = t * Math.PI * 2;
  const s = Math.sin(a);
  return { x: 100 + 64 * Math.sign(s) * Math.abs(s) ** 1.4, y: 100 - 82 * Math.cos(a) };
});

const balloon = [...curve(11, (t) => {
  const a = Math.PI / 2 + 0.35 + t * (Math.PI * 2 - 0.7);
  return { x: 100 + 60 * Math.cos(a), y: 80 + 60 * Math.sin(a) };
}), { x: 100, y: 156 }];

/** Spikes on a hedgehog's back: valleys and tips along an arc. */
const spikes = Array.from({ length: 15 }, (_, k) => {
  const a = ((150 - 10 * k) * Math.PI) / 180;
  const r = k % 2 ? 88 : 65;
  return { x: Math.round(100 + r * Math.cos(a)), y: Math.round(150 - r * Math.sin(a)) };
});

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
    dots: P(60, 30, 80, 60, 100, 24, 120, 60, 140, 30, 152, 86, 134, 118, 112, 124, 112, 182, 88, 182, 88, 124, 66, 118, 48, 86),
    color: "#e8708a",
    details: `<rect x="88" y="122" width="24" height="60" fill="#5fae4e"/><path d="M100 168 q-30 -6 -40 -34 q28 4 40 26 M100 160 q30 -8 40 -36 q-28 4 -40 28" fill="#7cc46a"/>`,
    alive: "sway",
    done: "Расцвёл!",
  },
  {
    id: "t10",
    title: "Ёлочка",
    world: "more",
    dots: P(100, 20, 136, 64, 114, 64, 152, 104, 130, 104, 166, 150, 112, 150, 112, 182, 88, 182, 88, 150, 34, 150, 70, 104, 48, 104, 86, 64, 64, 64),
    color: "#4f9a4a",
    details: `<rect x="88" y="150" width="24" height="32" fill="#9a6a3a"/><circle cx="96" cy="58" r="6" fill="#e8463a"/><circle cx="118" cy="96" r="6" fill="#ffd54a"/><circle cx="80" cy="100" r="6" fill="#6db3d4"/><circle cx="130" cy="138" r="6" fill="#e8463a"/><circle cx="70" cy="140" r="6" fill="#ffd54a"/><circle cx="100" cy="124" r="6" fill="#e8708a"/>`,
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
  // ---------------------------------------------------------------- v10
  {
    id: "d2",
    title: "Колокольчик",
    world: "down",
    count: "down",
    dots: P(100, 28, 128, 42, 138, 74, 144, 112, 170, 146, 100, 152, 30, 146, 56, 112, 62, 74, 72, 42),
    color: "#ffd54a",
    details: `<circle cx="100" cy="160" r="12" fill="#c98a1c" stroke="${INK}" stroke-width="3"/><path d="M74 60 q-6 30 -10 66" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/><path d="M100 28 q-16 -14 -24 -4 q8 10 24 4 q16 -14 24 -4 q-8 10 -24 4" fill="#e8463a" stroke="${INK}" stroke-width="2.5"/>`,
    alive: "rock",
    done: "Динь-дон! Звенит!",
  },
  {
    id: "d1",
    title: "Салют",
    world: "down",
    count: "down",
    dots: ring(12, 100, 100, (k) => (k % 2 ? 34 : 80)),
    color: "#ff6fa5",
    details: `<circle cx="100" cy="100" r="16" fill="#ffd54a"/><path d="M100 54 V30 M140 70 L160 54 M60 70 L40 54 M146 118 L168 128 M54 118 L32 128" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`,
    alive: "spin",
    done: "3, 2, 1… Бум! Салют!",
  },
  {
    id: "d3",
    title: "Снеговик",
    world: "down",
    count: "down",
    dots: P(100, 26, 126, 38, 132, 64, 120, 84, 146, 100, 150, 138, 136, 170, 100, 182, 64, 170, 50, 138, 54, 100, 80, 84, 68, 64, 74, 38),
    color: "#f4f8fc",
    details: `${eye(90, 54)}${eye(110, 54)}<path d="M100 62 L124 68 L100 70 Z" fill="#ff8a3d" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M82 84 q18 10 36 0" fill="none" stroke="#e8463a" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="116" r="5" fill="${INK}"/><circle cx="100" cy="136" r="5" fill="${INK}"/><circle cx="100" cy="156" r="5" fill="${INK}"/><path d="M50 120 L22 100 M150 120 L178 100" stroke="#9a6a3a" stroke-width="4" stroke-linecap="round"/>`,
    alive: "bounce",
    done: "Снеговик готов — можно играть в снежки!",
  },
  {
    id: "k1",
    title: "Листик",
    world: "skip",
    count: 2,
    dots: leaf,
    color: "#7cc46a",
    details: `<path d="M100 22 V180 M100 70 L130 50 M100 100 L136 80 M100 130 L130 112 M100 70 L70 50 M100 100 L64 80 M100 130 L70 112" fill="none" stroke="#4f9a4a" stroke-width="3.5" stroke-linecap="round"/><path d="M100 180 V194" stroke="#9a6a3a" stroke-width="5" stroke-linecap="round"/>`,
    alive: "sway",
    done: "Листик закружился!",
  },
  {
    id: "k2",
    title: "Шарик",
    world: "skip",
    count: 2,
    dots: balloon,
    color: "#e8463a",
    details: `<path d="M72 52 q8 -12 22 -14" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/><path d="M100 156 q-10 14 0 22 q10 8 0 16" fill="none" stroke="${INK}" stroke-width="2.5"/>`,
    alive: "launch",
    done: "Шарик улетает вверх!",
  },
  {
    id: "k3",
    title: "Кит",
    world: "skip",
    count: 5,
    dots: P(26, 108, 40, 76, 78, 60, 122, 64, 150, 90, 176, 62, 168, 104, 178, 136, 146, 114, 116, 142, 70, 148, 36, 136),
    color: "#5b8fd4",
    details: `${eye(56, 96)}<path d="M30 116 q30 30 80 24" fill="none" stroke="#cfe3f7" stroke-width="5" stroke-linecap="round"/><path d="M80 56 q-4 -18 -16 -24 M80 56 q2 -20 14 -26 M80 56 V30" fill="none" stroke="#6db3d4" stroke-width="4" stroke-linecap="round"/>`,
    alive: "swim",
    done: "Пф-ф! Кит пускает фонтан!",
  },
  {
    id: "k4",
    title: "Тортик",
    world: "skip",
    count: 10,
    dots: P(24, 172, 24, 112, 56, 100, 88, 98, 88, 56, 112, 56, 112, 98, 144, 100, 176, 112, 176, 172),
    color: "#f7c6d4",
    details: `<rect x="88" y="56" width="24" height="42" fill="#6db3d4" stroke="${INK}" stroke-width="3"/><path class="td-flame" d="M100 30 q-9 12 0 22 q9 -10 0 -22 Z" fill="#ffb23f"/><path d="M24 128 q19 14 38 0 t38 0 t38 0 t38 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="48" cy="152" r="7" fill="#e8463a"/><circle cx="100" cy="152" r="7" fill="#e8463a"/><circle cx="152" cy="152" r="7" fill="#e8463a"/>`,
    alive: "glow",
    done: "С днём рождения! Задуй свечку!",
  },
  {
    id: "a1",
    title: "Яблоко",
    world: "abc",
    count: "abc",
    dots: P(100, 58, 130, 44, 162, 64, 166, 110, 140, 158, 100, 150, 60, 158, 34, 110, 38, 64, 70, 44),
    color: "#e8463a",
    details: `<path d="M100 58 q-2 -20 8 -36" fill="none" stroke="#9a6a3a" stroke-width="5" stroke-linecap="round"/><path d="M106 34 q20 -18 40 -8 q-16 18 -40 8 Z" fill="#7cc46a" stroke="${INK}" stroke-width="2.5"/><path d="M58 80 q-8 18 -4 36" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>`,
    alive: "bounce",
    done: "Хрум! Яблоко — на букву Я, последнюю в алфавите!",
  },
  {
    id: "a2",
    title: "Птичка",
    world: "abc",
    count: "abc",
    dots: P(30, 92, 52, 80, 66, 58, 92, 56, 108, 76, 140, 70, 176, 52, 168, 96, 150, 124, 116, 140, 76, 136, 54, 112),
    color: "#ffb23f",
    details: `${eye(72, 72)}<path d="M30 92 L52 80 L54 96 Z" fill="#e8463a"/><path d="M84 104 q30 -24 60 -14 q-20 26 -60 14 Z" fill="#f2903a" stroke="${INK}" stroke-width="2.5"/><path d="M96 140 v20 M120 138 v22 M90 160 h12 M114 160 h12" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    alive: "flutter",
    done: "Чик-чирик! Полетела!",
  },
  {
    id: "a3",
    title: "Корона",
    world: "abc",
    count: "abc",
    dots: P(40, 150, 34, 56, 50, 100, 67, 44, 84, 100, 100, 32, 116, 100, 133, 44, 150, 100, 166, 56, 160, 150, 100, 158),
    color: "#ffd54a",
    details: `<path d="M44 128 H156" stroke="#c98a1c" stroke-width="5"/><circle cx="70" cy="128" r="7" fill="#e8463a"/><circle cx="100" cy="130" r="8" fill="#6db3d4"/><circle cx="130" cy="128" r="7" fill="#7cc46a"/><circle cx="34" cy="56" r="5" fill="#fff"/><circle cx="100" cy="32" r="5" fill="#fff"/><circle cx="166" cy="56" r="5" fill="#fff"/>`,
    alive: "spin",
    done: "Корона для принцессы!",
  },
  {
    id: "a4",
    title: "Автобус",
    world: "abc",
    count: "abc",
    dots: P(24, 150, 24, 110, 26, 72, 42, 54, 72, 52, 104, 52, 136, 52, 160, 54, 176, 70, 176, 110, 176, 150, 150, 152, 118, 152, 84, 152, 52, 152),
    color: "#ffd54a",
    details: `<rect x="36" y="70" width="28" height="26" rx="4" fill="#cdeefb" stroke="${INK}" stroke-width="3"/><rect x="72" y="70" width="28" height="26" rx="4" fill="#cdeefb" stroke="${INK}" stroke-width="3"/><rect x="108" y="70" width="28" height="26" rx="4" fill="#cdeefb" stroke="${INK}" stroke-width="3"/><rect x="144" y="70" width="24" height="56" rx="4" fill="#cdeefb" stroke="${INK}" stroke-width="3"/><path d="M24 112 H140" stroke="#e8463a" stroke-width="6"/><circle cx="60" cy="150" r="15" fill="${INK}"/><circle cx="60" cy="150" r="6" fill="#ccc"/><circle cx="140" cy="150" r="15" fill="${INK}"/><circle cx="140" cy="150" r="6" fill="#ccc"/>`,
    alive: "drive",
    done: "Би-бип! Все садимся в автобус!",
  },
  {
    id: "g1",
    title: "Солнышко",
    world: "big",
    dots: ring(20, 100, 100, (k) => (k % 2 ? 52 : 80)),
    color: "#ffc93c",
    details: `<circle cx="100" cy="100" r="42" fill="#ffe27a"/>${eye(86, 94)}${eye(114, 94)}<path d="M84 112 q16 14 32 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><circle cx="74" cy="110" r="6" fill="#ff9d7a" opacity=".7"/><circle cx="126" cy="110" r="6" fill="#ff9d7a" opacity=".7"/>`,
    alive: "spin",
    done: "Солнышко проснулось!",
  },
  {
    id: "g4",
    title: "Цветок",
    world: "big",
    dots: ring(20, 100, 92, (k) => [80, 56, 36, 56][k % 4]!),
    color: "#e8708a",
    details: `<circle cx="100" cy="92" r="22" fill="#ffd54a" stroke="${INK}" stroke-width="3"/><circle cx="94" cy="86" r="3" fill="#c98a1c"/><circle cx="106" cy="94" r="3" fill="#c98a1c"/><circle cx="98" cy="100" r="3" fill="#c98a1c"/><path d="M100 172 V196" stroke="#5fae4e" stroke-width="6" stroke-linecap="round"/>`,
    alive: "sway",
    done: "Какой красивый цветок!",
  },
  {
    id: "g2",
    title: "Паровозик",
    world: "big",
    dots: P(22, 150, 22, 104, 44, 100, 44, 62, 30, 42, 76, 42, 66, 62, 66, 96, 84, 80, 108, 76, 128, 96, 128, 62, 110, 42, 188, 42, 176, 62, 176, 150, 150, 150, 124, 150, 98, 150, 72, 150, 46, 150),
    color: "#4f9ad4",
    details: `<rect x="134" y="66" width="30" height="30" rx="4" fill="#cdeefb" stroke="${INK}" stroke-width="3"/><path d="M22 120 H128" stroke="#ffd54a" stroke-width="6"/><circle cx="48" cy="156" r="16" fill="${INK}"/><circle cx="48" cy="156" r="6" fill="#e8463a"/><circle cx="96" cy="156" r="16" fill="${INK}"/><circle cx="96" cy="156" r="6" fill="#e8463a"/><circle cx="150" cy="154" r="20" fill="${INK}"/><circle cx="150" cy="154" r="8" fill="#e8463a"/><path d="M48 156 H150" stroke="#ccc" stroke-width="4"/>`,
    alive: "drive",
    done: "Ту-ту! Паровозик поехал!",
  },
  {
    id: "g3",
    title: "Ёжик",
    world: "big",
    dots: [{ x: 18, y: 154 }, { x: 25, y: 131 }, ...spikes, ...P(172, 162, 136, 162, 102, 162, 68, 162, 40, 160)],
    color: "#a07a55",
    details: `<path d="M18 154 L25 131 L44 118 Q62 150 40 160 Z" fill="#f2d2a8"/>${eye(38, 138)}<circle cx="18" cy="154" r="5" fill="${INK}"/><path d="M80 120 l10 -14 M110 112 l6 -16 M136 122 l12 -12 M100 140 l8 -12 M130 146 l10 -10" stroke="#6e5238" stroke-width="3" stroke-linecap="round"/><circle cx="118" cy="92" r="9" fill="#e8463a"/><path d="M118 83 v-6" stroke="#5fae4e" stroke-width="3"/>`,
    alive: "bounce",
    done: "Ёжик несёт яблочко домой!",
  },
  // v10: two bigger «Весёлые картинки», so the world sits after «Дальше 10».
  {
    id: "f1",
    title: "Чайник",
    world: "fun",
    dots: P(52, 162, 148, 162, 158, 140, 180, 130, 181, 102, 162, 84, 148, 108, 140, 78, 116, 72, 112, 48, 88, 48, 84, 72, 58, 80, 42, 100, 28, 72, 20, 94, 36, 130),
    color: "#6db3d4",
    details: `<circle cx="100" cy="40" r="6" fill="${INK}"/><path d="M60 92 H140" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="124" r="14" fill="#ffd54a"/><circle cx="100" cy="124" r="5" fill="#e8708a"/><circle cx="76" cy="132" r="6" fill="#fff"/><circle cx="124" cy="132" r="6" fill="#fff"/>`,
    alive: "rock",
    done: "Чай готов! Пых-пых!",
  },
  {
    id: "f2",
    title: "Самолёт",
    world: "fun",
    dots: P(182, 100, 162, 112, 120, 112, 100, 150, 78, 150, 88, 112, 50, 112, 40, 136, 18, 128, 28, 100, 20, 62, 42, 62, 52, 90, 88, 90, 78, 50, 100, 50, 120, 90, 162, 88),
    color: "#f2f2f2",
    details: `<circle cx="134" cy="100" r="5" fill="#6db3d4"/><circle cx="150" cy="100" r="5" fill="#6db3d4"/><circle cx="118" cy="100" r="5" fill="#6db3d4"/><path d="M164 94 q12 2 16 6 q-4 4 -16 6 Z" fill="#6db3d4"/><path d="M30 70 L42 96" stroke="#e8463a" stroke-width="5" stroke-linecap="round"/>`,
    alive: "drive",
    done: "Самолёт полетел!",
  },
];

/** Worlds go from easy to hard (tests check the mean difficulty rises world by world). */
export const levels: DotPicture[] = inWorldOrder(ALL, ["ten", "more", "fun", "down", "skip", "abc", "big"]);
