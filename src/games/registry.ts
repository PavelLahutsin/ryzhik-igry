import { character, picture } from "../shared/assets";
import coloringArt from "./raskraska/assets/pictures/ryzhik_sharik.png";

import { starSummary } from "../shared/levelgame";

export type GameModule = { mount: (root: HTMLElement) => () => void };

/** What the home tile shows: stars (or finished pictures) out of the maximum. */
export type Summary = { got: number; max: number; unit: "stars" | "pictures" };

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

async function levelStars(gameId: string, load: () => Promise<{ levels: ReadonlyArray<{ id: string }> }>): Promise<Summary> {
  const { levels } = await load();
  const s = await starSummary(gameId, levels.map((l) => l.id));
  return { got: s.got, max: s.max, unit: "stars" };
}

/**
 * Every game is its own module under src/games/<id>/ and is loaded only
 * when opened, so one game can change without touching the others.
 */
export const games: GameEntry[] = [
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
    summary: () => levelStars("mozaika", () => import("./mozaika/levels")),
    resetKeys: ["ryzhik-igry:mozaika:progress"],
  },
  {
    id: "sliyanie",
    title: "Вырасти сад",
    note: "Соединяй одинаковые",
    color: "#7cc46a",
    art: { src: picture("sad") },
    load: () => import("./sliyanie"),
    summary: () => levelStars("sliyanie", () => import("./sliyanie/levels")),
    resetKeys: ["ryzhik-igry:sliyanie:progress"],
  },
  {
    id: "najdi-paru",
    title: "Найди пару",
    note: "Открывай карточки",
    color: "#f27aa0",
    art: { src: picture("vse-vmeste") },
    load: () => import("./najdi-paru"),
    summary: () => levelStars("najdi-paru", () => import("./najdi-paru/levels")),
    resetKeys: ["ryzhik-igry:najdi-paru:progress"],
  },
  {
    id: "teni",
    title: "Тени",
    note: "Чья это тень?",
    color: "#9b8cf0",
    art: { src: character("mishka"), figure: true },
    load: () => import("./teni"),
    summary: () => levelStars("teni", () => import("./teni/levels")),
    resetKeys: ["ryzhik-igry:teni:progress"],
  },
  {
    id: "odezhda",
    title: "Одень Рыжика",
    note: "По погоде",
    color: "#ffc94a",
    art: { src: character("ryzhik"), figure: true },
    load: () => import("./odezhda"),
    summary: () => levelStars("odezhda", () => import("./odezhda/levels")),
    resetKeys: ["ryzhik-igry:odezhda:progress"],
  },
  {
    id: "sortirovka",
    title: "По корзинкам",
    note: "Разложи по цвету и по смыслу",
    color: "#ff9f6b",
    art: { src: character("belka"), figure: true },
    load: () => import("./sortirovka"),
    summary: () => levelStars("sortirovka", () => import("./sortirovka/levels")),
    resetKeys: ["ryzhik-igry:sortirovka:progress"],
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
