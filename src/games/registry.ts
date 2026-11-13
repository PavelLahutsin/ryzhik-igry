import { picture } from "../shared/assets";
import { svgUrl, TILE_ART } from "../home/tile-art";
import coloringArt from "./raskraska/assets/pictures/ryzhik_sharik.png";

import { starSummary } from "../shared/levelgame";
import { SHELL_PREFIX } from "../shared/platform/web";

/** Home tile of «Цифры и буквы»: three letter blocks, drawn here (no file to load). */
const BUKVY_ART = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20x%3D%2214%22%20y%3D%2222%22%20width%3D%2280%22%20height%3D%2280%22%20rx%3D%2218%22%20fill%3D%22%23ffd54a%22%20stroke%3D%22%233b2e25%22%20stroke-width%3D%225%22/%3E%3Cpath%20d%3D%22M42%2082%20L54%2042%20L66%2082%20M47%2068%20H61%22%20fill%3D%22none%22%20stroke%3D%22%233b2e25%22%20stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Crect%20x%3D%22106%22%20y%3D%2222%22%20width%3D%2280%22%20height%3D%2280%22%20rx%3D%2218%22%20fill%3D%22%236db3d4%22%20stroke%3D%22%233b2e25%22%20stroke-width%3D%225%22/%3E%3Cpath%20d%3D%22M134%2052%20L148%2040%20V84%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%229%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Crect%20x%3D%2260%22%20y%3D%22108%22%20width%3D%2280%22%20height%3D%2280%22%20rx%3D%2218%22%20fill%3D%22%23f27aa0%22%20stroke%3D%22%233b2e25%22%20stroke-width%3D%225%22/%3E%3Cpath%20d%3D%22M86%20128%20V168%20H106%20C%20124%20168%20124%20146%20106%20146%20H86%20M86%20128%20H116%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E";

export type GameModule = { mount: (root: HTMLElement) => () => void };

/** What the home tile shows: stars (or finished pictures) out of the maximum. */
export type Summary = { got: number; max: number; unit: "stars" | "pictures" | "finds" };

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
};

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
    id: "domik",
    title: "Домик Рыжика",
    note: "Играй как хочешь: дом, сад и лес",
    color: "#ff8a3d",
    art: { src: picture("ryzhik-mashet") },
    wide: true,
    load: () => import("./domik"),
    ...foundThings("domik", () => import("./domik/scenes")),
  },
  {
    id: "kuhnya",
    title: "Кухня Рыжика",
    note: "Готовь что хочешь и угощай",
    color: "#e8463a",
    art: { src: svgUrl(TILE_ART.kuhnya), figure: true },
    load: () => import("./kuhnya"),
    ...foundThings("kuhnya", () => import("./kuhnya/logic")),
  },
  {
    id: "risovalka",
    title: "Обводилка",
    note: "Обведи — и рисунок оживёт",
    color: "#9b6cd8",
    art: { src: svgUrl(TILE_ART.risovalka), figure: true },
    load: () => import("./risovalka"),
    ...levelStars("risovalka", () => import("./risovalka/pictures")),
  },
  {
    id: "bukvy",
    title: "Цифры и буквы",
    note: "Пиши пальчиком 1, 2, 3 и А, Б, В",
    color: "#f27aa0",
    art: { src: BUKVY_ART, figure: true },
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
    title: "По точкам",
    note: "Соедини точки: цифры и буквы",
    color: "#3fae6a",
    art: { src: svgUrl(TILE_ART.tochki), figure: true },
    load: () => import("./tochki"),
    ...levelStars("tochki", () => import("./tochki/levels")),
  },
  {
    id: "professii",
    title: "Профессии",
    note: "Доктор, пожарный, магазин и безопасный дом",
    color: "#6db3d4",
    art: { src: svgUrl(TILE_ART.professii), figure: true },
    load: () => import("./professii"),
    ...levelStars("professii", () => import("./professii/data")),
  },
  {
    id: "stroyka",
    title: "Стройка",
    note: "Строй из больших кубиков — и всё оживёт",
    color: "#ffb23f",
    art: { src: svgUrl(TILE_ART.stroyka), figure: true },
    load: () => import("./stroyka"),
    ...levelStars("stroyka", () => import("./stroyka/levels")),
  },
  {
    id: "formy",
    title: "Размер и форма",
    note: "Больше-меньше, фигуры, узоры, углы",
    color: "#9b6cd8",
    art: { src: svgUrl(TILE_ART.formy), figure: true },
    load: () => import("./formy"),
    ...levelStars("formy", () => import("./formy/levels")),
  },
  {
    id: "tajnaya-kartinka",
    title: "Тайная картинка",
    note: "Веди Рыжика и открывай картинку",
    color: "#ff8a3d",
    art: { src: picture("ryzhik-zmey") },
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
    art: { src: picture("piknik") },
    load: () => import("./mozaika"),
    ...levelStars("mozaika", () => import("./mozaika/levels")),
  },
  {
    id: "sliyanie",
    title: "Вырасти сад",
    note: "Соединяй одинаковые",
    color: "#7cc46a",
    art: { src: picture("sad") },
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
    art: { src: picture("vse-vmeste") },
    load: () => import("./najdi-paru"),
    ...levelStars("najdi-paru", () => import("./najdi-paru/levels")),
  },
  {
    id: "teni",
    title: "Тени",
    note: "Чья это тень?",
    color: "#9b8cf0",
    art: { src: svgUrl(TILE_ART.teni), figure: true },
    load: () => import("./teni"),
    ...levelStars("teni", () => import("./teni/levels")),
  },
  {
    id: "odezhda",
    title: "Одень Рыжика",
    note: "По погоде",
    color: "#ffc94a",
    art: { src: svgUrl(TILE_ART.odezhda), figure: true },
    load: () => import("./odezhda"),
    ...levelStars("odezhda", () => import("./odezhda/levels")),
  },
  {
    id: "sortirovka",
    title: "По корзинкам",
    note: "По цвету, смыслу, размеру и счёту",
    color: "#ff9f6b",
    art: { src: svgUrl(TILE_ART.sortirovka), figure: true },
    fresh: { since: "v13", text: "Новые уровни" },
    load: () => import("./sortirovka"),
    ...levelStars("sortirovka", () => import("./sortirovka/levels")),
  },
  {
    id: "labirint",
    title: "Лабиринт",
    note: "Проведи Рыжика к друзьям",
    color: "#5bb381",
    art: { src: svgUrl(TILE_ART.labirint), figure: true },
    load: () => import("./labirint"),
    ...levelStars("labirint", () => import("./labirint/levels")),
  },
  {
    id: "raskraska",
    title: "Раскраска",
    note: "Раскрашивай Рыжика и друзей",
    color: "#157a62",
    art: { src: coloringArt },
    load: () => import("./raskraska"),
    summary: async () => {
      const [{ store }, { catalog }] = await Promise.all([import("./raskraska/storage"), import("./raskraska/data/albums")]);
      const progress = await store.progress();
      const ids = catalog.albums.filter((a) => a.available).flatMap((a) => a.pictures.map((p) => p.id));
      const got = ids.filter((id) => progress.pictures[id]?.status === "done").length;
      return { got, max: ids.length, unit: "pictures" };
    },
  },
];

export function findGame(id: string | null): GameEntry | undefined {
  return id ? games.find((game) => game.id === id) : undefined;
}
