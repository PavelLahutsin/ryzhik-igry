/**
 * v23 «Кто новенький?» (Astra, brief 25-2): animals come to the meadow one by
 * one behind a curtain; tap the one who was not there before. Astra's cow and
 * goat have no picture: the cow is the sheep, the goat the giraffe.
 */
export type NewLevel = {
  id: string;
  world: "nw-easy" | "nw-mid" | "nw-hard";
  title: string;
  pool: string[];
  /** On the meadow from the start. */
  start: number;
  /** Newcomers to find. */
  steps: number;
  /** The animals change places while the curtain is closed. */
  shuffle: boolean;
  done: string;
};

export const NEW_WORLDS = [
  { id: "nw-easy", title: "Кто новенький?", color: "#f2b84a" },
  { id: "nw-mid", title: "Новенькие гости", color: "#7cc46a" },
  { id: "nw-hard", title: "Все перепутались", color: "#9b8cf0" },
];

const L = (id: string, world: NewLevel["world"], title: string, pool: string[], start: number, steps: number, shuffle: boolean, done: string): NewLevel => ({
  id,
  world,
  title,
  pool,
  start,
  steps,
  shuffle,
  done,
});

export const NEW_LEVELS: NewLevel[] = [
  L("nw1", "nw-easy", "Под ёлочкой", ["squirrel", "hare", "hedgehog"], 1, 2, false, "Все новенькие найдены!"),
  L("nw2", "nw-easy", "Тёплый дворик", ["piglet", "chicken", "sheep"], 1, 2, false, "Все новенькие найдены!"),
  L("nw3", "nw-easy", "У берёзы", ["raccoon", "bird", "bear", "frog"], 1, 3, false, "Все в сборе!"),
  L("nw4", "nw-easy", "Зелёный лужок", ["lamb", "horse", "duck", "dog"], 1, 3, false, "Все собрались на лужке!"),
  L("nw5", "nw-mid", "Звонкий ручеёк", ["penguin", "frog", "raccoon", "deer", "duck"], 2, 3, false, "У ручейка все в сборе!"),
  L("nw6", "nw-mid", "Под клёном", ["elephant", "cat", "owl", "hedgehog", "giraffe"], 2, 3, false, "Под клёном все в сборе!"),
  L("nw7", "nw-mid", "Пёстрые цветы", ["tiger", "piglet", "mouse", "chicken", "hare", "lamb"], 2, 4, false, "Все новенькие найдены!"),
  L("nw8", "nw-mid", "Весёлый пенёк", ["lion", "squirrel", "frog", "penguin", "sheep", "deer"], 2, 4, false, "У пенька все в сборе!"),
  L("nw9", "nw-hard", "Берёзовая роща", ["deer", "bear", "hare", "bird", "raccoon", "hedgehog"], 2, 4, true, "Все перепутались, а новенькие нашлись!"),
  L("nw10", "nw-hard", "Озёрная полянка", ["elephant", "duck", "penguin", "piglet", "frog", "horse", "mouse"], 2, 5, true, "На полянке все в сборе!"),
  L("nw11", "nw-hard", "Клёновый хоровод", ["tiger", "cat", "lamb", "giraffe", "dog", "raccoon", "owl", "lion"], 3, 5, true, "Хоровод собрался!"),
  L("nw12", "nw-hard", "Все под ёлкой", ["piglet", "elephant", "penguin", "lamb", "tiger", "lion", "raccoon", "deer", "squirrel"], 3, 6, true, "Под ёлкой все в сборе!"),
];
