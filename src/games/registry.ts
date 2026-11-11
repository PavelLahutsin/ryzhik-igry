import { character, picture } from "../shared/assets";
import coloringArt from "./raskraska/assets/pictures/ryzhik_sharik.png";

import { starSummary } from "../shared/levelgame";
import { SHELL_PREFIX } from "../shared/platform/web";

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
};

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
    art: { src: character("mama"), figure: true },
    load: () => import("./kuhnya"),
    ...foundThings("kuhnya", () => import("./kuhnya/logic")),
  },
  {
    id: "risovalka",
    title: "Рисовалка",
    note: "Обведи — и рисунок оживёт",
    color: "#9b6cd8",
    art: { src: character("belka"), figure: true },
    load: () => import("./risovalka"),
    ...levelStars("risovalka", () => import("./risovalka/pictures")),
  },
  {
    id: "tochki",
    title: "По точкам",
    note: "Соедини 1, 2, 3… — что получится?",
    color: "#3fae6a",
    art: { src: character("ezhik"), figure: true },
    load: () => import("./tochki"),
    ...levelStars("tochki", () => import("./tochki/levels")),
  },
  {
    id: "professii",
    title: "Профессии",
    note: "Доктор, пожарный, магазин и безопасный дом",
    color: "#6db3d4",
    art: { src: character("papa"), figure: true },
    load: () => import("./professii"),
    ...levelStars("professii", () => import("./professii/data")),
  },
  {
    id: "stroyka",
    title: "Стройка",
    note: "Строй из больших кубиков — и всё оживёт",
    color: "#ffb23f",
    art: { src: character("mishka"), figure: true },
    load: () => import("./stroyka"),
    ...levelStars("stroyka", () => import("./stroyka/levels")),
  },
  {
    id: "formy",
    title: "Размер и форма",
    note: "Большое и маленькое, круг и квадрат",
    color: "#9b6cd8",
    art: { src: character("mama"), figure: true },
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
    note: "Собери картинку",
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
  },
  {
    id: "najdi-paru",
    title: "Найди пару",
    note: "Открывай карточки",
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
    art: { src: character("mishka"), figure: true },
    load: () => import("./teni"),
    ...levelStars("teni", () => import("./teni/levels")),
  },
  {
    id: "odezhda",
    title: "Одень Рыжика",
    note: "По погоде",
    color: "#ffc94a",
    art: { src: character("ryzhik"), figure: true },
    load: () => import("./odezhda"),
    ...levelStars("odezhda", () => import("./odezhda/levels")),
  },
  {
    id: "sortirovka",
    title: "По корзинкам",
    note: "Разложи по цвету и по смыслу",
    color: "#ff9f6b",
    art: { src: character("belka"), figure: true },
    load: () => import("./sortirovka"),
    ...levelStars("sortirovka", () => import("./sortirovka/levels")),
  },
  {
    id: "labirint",
    title: "Лабиринт",
    note: "Проведи Рыжика к друзьям",
    color: "#5bb381",
    art: { src: character("ezhik"), figure: true },
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
