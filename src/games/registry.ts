
import { starSummary } from "../shared/levelgame";
import { SHELL_PREFIX } from "../shared/platform/web";
import { isWinter } from "../shared/season";


/**
 * v22: every home tile is Ryzhik with the thing the game is about (chef hat
 * for the kitchen, paints for coloring…): src/home/icons/<game id>.webp,
 * 480×360 transparent cutouts.
 */
const ICONS = import.meta.glob<string>("../home/icons/*.webp", { eager: true, import: "default" });
export function tileIcon(id: string): string {
  const url = ICONS[`../home/icons/${id}.webp`];
  if (!url) throw new Error(`Нет иконки ${id}`);
  return url;
}

export type GameModule = { mount: (root: HTMLElement) => () => void };

/** What the home tile shows: stars (or finished pictures) out of the maximum. */
export type Summary = { got: number; max: number; unit: "stars" | "pictures" | "finds" | "free" };

export type GameEntry = {
  id: string;
  title: string;
  note: string;
  color: string;
  /** Tile picture: a scene (cover) or a cutout figure (contain). */
  art: { src: string; figure?: boolean };
  wide?: boolean;
  load: () => Promise<GameModule>;
  /** Progress for the home tile; loads only the game's small level list. */
  summary: () => Promise<Summary>;
  /** Storage keys that «Родителям → Сбросить» clears (never the coloring drawings). */
  resetKeys?: string[];
  /** v13: «Новое» badge on the home tile until the game is opened once after this release. */
  fresh?: { since: string; text: "Новое" | "Новые уровни" };
  /** v13: a seasonal entry is on the home screen only while this says so. */
  season?: () => boolean;
};

/** Free play with nothing to count on the tile. */
const free = async (): Promise<Summary> => ({ got: 0, max: 0, unit: "free" });

/** The key that remembers a «Новое» badge was seen (opening the game marks it). */
export const freshKey = (game: Pick<GameEntry, "id" | "fresh">): string | null => (game.fresh ? `new:${game.id}:${game.fresh.since}` : null);

/** A level game: stars on the tile, «Сбросить» clears "ryzhik-igry:<id>:progress". */
function levelStars(
  gameId: string,
  load: () => Promise<{ levels: ReadonlyArray<{ id: string }> }>,
): Pick<GameEntry, "summary" | "resetKeys"> {
  return {
    summary: async () => {
      const { levels } = await load();
      const s = await starSummary(gameId, levels.map((l) => l.id));
      return { got: s.got, max: s.max, unit: "stars" };
    },
    resetKeys: [`${SHELL_PREFIX}${gameId}:progress`],
  };
}

/** A free-play game: found things on the tile, «Сбросить» clears "ryzhik-igry:<id>:found". */
function foundThings(gameId: string, load: () => Promise<{ allFinds: () => string[] }>): Pick<GameEntry, "summary" | "resetKeys"> {
  return {
    summary: async () => {
      const [{ allFinds }, { gameFinds }] = await Promise.all([load(), import("../shared/finds")]);
      const all = allFinds();
      const list = await gameFinds(gameId).load();
      return { got: list.filter((id) => all.includes(id)).length, max: all.length, unit: "finds" };
    },
    resetKeys: [`${SHELL_PREFIX}${gameId}:found`],
  };
}

/**
 * Every game is its own module under src/games/<id>/ and is loaded only
 * when opened, so one game can change without touching the others.
 */
export const games: GameEntry[] = [
  {
    id: "zima",
    title: "Зима",
    note: "Снеговики, ёлочки и санки из разных игр",
    color: "#6db3d4",
    art: { src: tileIcon("zima"), figure: true },
    wide: true,
    load: () => import("./zima"),
    summary: free,
    resetKeys: [],
    fresh: { since: "v13", text: "Новое" },
    season: () => isWinter(),
  },
  {
    id: "domik",
    title: "Домик Рыжика",
    note: "Играй как хочешь: дом, сад и лес",
    color: "#ff8a3d",
    art: { src: tileIcon("domik"), figure: true },
    wide: true,
    load: () => import("./domik"),
    ...foundThings("domik", () => import("./domik/scenes")),
  },
  {
    id: "kuhnya",
    title: "Кухня Рыжика",
    note: "Готовь что хочешь и угощай",
    color: "#e8463a",
    art: { src: tileIcon("kuhnya"), figure: true },
    load: () => import("./kuhnya"),
    ...foundThings("kuhnya", () => import("./kuhnya/logic")),
  },
  {
    id: "tapni",
    title: "Нажми и послушай",
    note: "Животные, транспорт, кухня: всё звучит",
    color: "#3fae6a",
    art: { src: tileIcon("tapni"), figure: true },
    load: () => import("./tapni"),
    ...foundThings("tapni", () => import("./tapni/scenes")),
    fresh: { since: "v13", text: "Новое" },
  },
  {
    id: "risovalka",
    title: "Обведи картинку",
    note: "Обведи — и рисунок оживёт",
    color: "#9b6cd8",
    art: { src: tileIcon("risovalka"), figure: true },
    load: () => import("./risovalka"),
    ...levelStars("risovalka", () => import("./risovalka/pictures")),
  },
  {
    id: "bukvy",
    title: "Цифры и буквы",
    note: "Пиши пальчиком 1, 2, 3 и А, Б, В",
    color: "#f27aa0",
    art: { src: tileIcon("bukvy"), figure: true },
    load: () => import("./bukvy"),
    summary: async () => {
      const [{ levels, MOVED_DIGITS }, { adoptLevels }] = await Promise.all([import("./bukvy/letters"), import("../shared/progress")]);
      await adoptLevels("risovalka", "bukvy", MOVED_DIGITS);
      const s = await starSummary("bukvy", levels.map((l) => l.id));
      return { got: s.got, max: s.max, unit: "stars" };
    },
    resetKeys: [`${SHELL_PREFIX}bukvy:progress`],
  },
  {
    id: "tochki",
    title: "Рисуем по точкам",
    note: "Соедини точки: цифры и буквы",
    color: "#3fae6a",
    art: { src: tileIcon("tochki"), figure: true },
    load: () => import("./tochki"),
    ...levelStars("tochki", () => import("./tochki/levels")),
  },
  {
    id: "professii",
    title: "Профессии",
    note: "Играй в доктора, пожарного, магазин и безопасный дом",
    color: "#6db3d4",
    art: { src: tileIcon("professii"), figure: true },
    load: () => import("./professii"),
    ...levelStars("professii", () => import("./professii/data")),
  },
  {
    id: "stroyka",
    title: "Стройка",
    note: "Строй из больших кубиков — и всё оживёт",
    color: "#ffb23f",
    art: { src: tileIcon("stroyka"), figure: true },
    load: () => import("./stroyka"),
    ...levelStars("stroyka", () => import("./stroyka/levels")),
  },
  {
    id: "formy",
    title: "Размер и форма",
    note: "Больше-меньше, фигуры, узоры, углы",
    color: "#9b6cd8",
    art: { src: tileIcon("formy"), figure: true },
    load: () => import("./formy"),
    ...levelStars("formy", () => import("./formy/levels")),
  },
  {
    id: "tajnaya-kartinka",
    title: "Тайная картинка",
    note: "Веди Рыжика и открывай картинку",
    color: "#ff8a3d",
    art: { src: tileIcon("tajnaya-kartinka"), figure: true },
    wide: true,
    load: () => import("./tajnaya-kartinka"),
    summary: async () => {
      const [{ levels }, { loadProgress }] = await Promise.all([
        import("./tajnaya-kartinka/data/levels"),
        import("./tajnaya-kartinka/storage"),
      ]);
      const progress = await loadProgress();
      const got = levels.reduce((sum, level) => sum + (progress.stars[level.id] ?? 0), 0);
      return { got, max: levels.length * 3, unit: "stars" };
    },
    resetKeys: ["ryzhik-kartinka:progress", "ryzhik-kartinka:last-win"],
  },
  {
    id: "mozaika",
    title: "Мозаика",
    note: "Собери картинку из кусочков",
    color: "#6db3d4",
    art: { src: tileIcon("mozaika"), figure: true },
    load: () => import("./mozaika"),
    ...levelStars("mozaika", () => import("./mozaika/levels")),
  },
  {
    id: "sliyanie",
    title: "Вырасти сад",
    note: "Соединяй одинаковые",
    color: "#7cc46a",
    art: { src: tileIcon("sliyanie"), figure: true },
    load: () => import("./sliyanie"),
    ...levelStars("sliyanie", () => import("./sliyanie/levels")),
    // Levels plus the record and the started 2048 game (the chosen pictures stay).
    resetKeys: [`${SHELL_PREFIX}sliyanie:progress`, `${SHELL_PREFIX}sliyanie:best`, `${SHELL_PREFIX}sliyanie:big`],
  },
  {
    id: "najdi-paru",
    title: "Найди пару",
    note: "Пары, тени, счёт и тройки",
    color: "#f27aa0",
    art: { src: tileIcon("najdi-paru"), figure: true },
    load: () => import("./najdi-paru"),
    ...levelStars("najdi-paru", () => import("./najdi-paru/levels")),
  },
  {
    id: "teni",
    title: "Тени",
    note: "Чья это тень?",
    color: "#9b8cf0",
    art: { src: tileIcon("teni"), figure: true },
    load: () => import("./teni"),
    ...levelStars("teni", () => import("./teni/levels")),
  },
  {
    id: "odezhda",
    title: "Одень Рыжика",
    note: "По погоде",
    color: "#ffc94a",
    art: { src: tileIcon("odezhda"), figure: true },
    load: () => import("./odezhda"),
    ...levelStars("odezhda", () => import("./odezhda/levels")),
  },
  {
    id: "sortirovka",
    title: "Разложи по корзинкам",
    note: "По цвету, смыслу, размеру и счёту",
    color: "#ff9f6b",
    art: { src: tileIcon("sortirovka"), figure: true },
    fresh: { since: "v13", text: "Новые уровни" },
    load: () => import("./sortirovka"),
    ...levelStars("sortirovka", () => import("./sortirovka/levels")),
  },
  {
    id: "labirint",
    title: "Лабиринт",
    note: "Проведи Рыжика к друзьям",
    color: "#5bb381",
    art: { src: tileIcon("labirint"), figure: true },
    load: () => import("./labirint"),
    ...levelStars("labirint", () => import("./labirint/levels")),
  },
  {
    id: "raskraska",
    title: "Раскраска",
    note: "Раскрашивай Рыжика и друзей",
    color: "#157a62",
    art: { src: tileIcon("raskraska"), figure: true },
    load: () => import("./raskraska"),
    summary: async () => {
      const [{ store }, { catalog }] = await Promise.all([import("./raskraska/storage"), import("./raskraska/data/albums")]);
      const progress = await store.progress();
      const ids = catalog.albums.filter((a) => a.available).flatMap((a) => a.pictures.map((p) => p.id));
      const got = ids.filter((id) => progress.pictures[id]?.status === "done").length;
      return { got, max: ids.length, unit: "pictures" };
    },
  },
  {
    id: "stikery",
    title: "Картинка из наклеек",
    note: "Клей наклейки куда хочешь",
    color: "#f27aa0",
    art: { src: tileIcon("stikery"), figure: true },
    load: () => import("./stikery"),
    summary: free,
    resetKeys: [`${SHELL_PREFIX}stikery:picture`],
    fresh: { since: "v13", text: "Новое" },
  },
];

export function findGame(id: string | null): GameEntry | undefined {
  return id ? games.find((game) => game.id === id) : undefined;
}
