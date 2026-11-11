import { character, picture } from "../shared/assets";

export type GameModule = { mount: (root: HTMLElement) => () => void };

export type GameEntry = {
  id: string;
  title: string;
  note: string;
  color: string;
  /** Tile picture: a scene (cover) or a cutout figure (contain). */
  art: { src: string; figure?: boolean };
  wide?: boolean;
  load: () => Promise<GameModule>;
};

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
  },
  {
    id: "mozaika",
    title: "Мозаика",
    note: "Собери картинку",
    color: "#6db3d4",
    art: { src: picture("piknik") },
    load: () => import("./mozaika"),
  },
  {
    id: "sliyanie",
    title: "Вырасти сад",
    note: "Соединяй одинаковые",
    color: "#7cc46a",
    art: { src: picture("sad") },
    load: () => import("./sliyanie"),
  },
  {
    id: "najdi-paru",
    title: "Найди пару",
    note: "Открывай карточки",
    color: "#f27aa0",
    art: { src: picture("vse-vmeste") },
    load: () => import("./najdi-paru"),
  },
  {
    id: "teni",
    title: "Тени",
    note: "Чья это тень?",
    color: "#9b8cf0",
    art: { src: character("mishka"), figure: true },
    load: () => import("./teni"),
  },
  {
    id: "odezhda",
    title: "Одень Рыжика",
    note: "По погоде",
    color: "#ffc94a",
    art: { src: character("ryzhik"), figure: true },
    load: () => import("./odezhda"),
  },
];

export function findGame(id: string | null): GameEntry | undefined {
  return id ? games.find((game) => game.id === id) : undefined;
}
