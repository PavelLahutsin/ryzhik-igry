/** v23 (Astra): new plans for «Дострой половинку», «По образцу» and «Большие стройки». */
import type { Kind, ColorId, Piece } from "./logic";
import type { Plan } from "./levels";

const p = (kind: Kind, color: ColorId, x: number, y: number, w = 1, h = 1, more: Partial<Piece> = {}): Piece => ({ kind, color, x, y, w, h, ...more });

export const PLANS_V23: Plan[] = [
{
  id: "h7",
  title: "Золотая корона",
  world: "half",
  look: "half",
  cols: 8,
  rows: 4,
  pieces: [
    p("brick", "yellow", 0, 0, 1, 2, { fixed: true }),
    p("brick", "yellow", 3, 0, 1, 2, { fixed: true }),
    p("brick", "yellow", 0, 2, 4, 1, { fixed: true }),
    p("brick", "orange", 0, 3, 2, 1, { fixed: true }),
    p("brick", "red", 2, 3, 1, 1, { fixed: true }),
    p("brick", "orange", 3, 3, 1, 1, { fixed: true }),
    p("brick", "yellow", 7, 0, 1, 2),
    p("brick", "yellow", 4, 0, 1, 2),
    p("brick", "yellow", 4, 2, 4, 1),
    p("brick", "orange", 6, 3, 2, 1),
    p("brick", "red", 5, 3),
    p("brick", "orange", 4, 3)
  ],
  extra: [{ kind: "brick", color: "blue", w: 1, h: 1 }],
  alive: "tower",
  intro: "Дострой корону. Поставь красный камешек так же, как слева!",
  done: "На короне сияют два камешка!"
},
{
  id: "h8",
  title: "Алый тюльпан",
  world: "half",
  look: "half",
  cols: 6,
  rows: 6,
  pieces: [
    p("brick", "red", 0, 0, 1, 2, { fixed: true }),
    p("brick", "red", 1, 1, 2, 1, { fixed: true }),
    p("brick", "red", 1, 2, 2, 1, { fixed: true }),
    p("brick", "green", 2, 3, 1, 3, { fixed: true }),
    p("brick", "green", 0, 3, 1, 1, { fixed: true }),
    p("brick", "green", 0, 4, 2, 1, { fixed: true }),
    p("brick", "red", 5, 0, 1, 2),
    p("brick", "red", 3, 1, 2, 1),
    p("brick", "red", 3, 2, 2, 1),
    p("brick", "green", 3, 3, 1, 3),
    p("brick", "green", 5, 3),
    p("brick", "green", 4, 4, 2, 1)
  ],
  extra: [{ kind: "brick", color: "purple", w: 2, h: 1 }],
  alive: "tower",
  intro: "Сложи вторую половинку тюльпана. Добавь зелёный листик!",
  done: "Алый тюльпан раскрыл лепестки!"
},
{
  id: "c7",
  title: "Полосатый зонтик",
  world: "copy",
  look: "copy",
  cols: 7,
  rows: 6,
  pieces: [
    p("brick", "red", 2, 0, 3, 1),
    p("brick", "orange", 1, 1, 5, 1),
    p("brick", "yellow", 0, 2, 7, 1),
    p("brick", "blue", 3, 3, 1, 2),
    p("brick", "blue", 1, 4),
    p("brick", "blue", 1, 5, 3, 1)
  ],
  extra: [{ kind: "brick", color: "green", w: 5, h: 1 }],
  alive: "tower",
  intro: "Собери полоски, как на картинке. Добавь синюю ручку крючком!",
  done: "Под зонтиком дождик не страшен!"
},
{
  id: "c8",
  title: "Улитка",
  world: "copy",
  look: "copy",
  cols: 7,
  rows: 4,
  pieces: [
    p("brick", "orange", 1, 0, 2, 1),
    p("brick", "orange", 0, 1, 1, 2),
    p("brick", "purple", 1, 1, 2, 1),
    p("brick", "orange", 3, 1, 1, 2),
    p("brick", "orange", 1, 2, 2, 1),
    p("brick", "yellow", 5, 1),
    p("brick", "yellow", 6, 0, 1, 2),
    p("brick", "yellow", 5, 2, 2, 1),
    p("brick", "yellow", 0, 3, 7, 1)
  ],
  extra: [{ kind: "brick", color: "blue", w: 2, h: 1 }],
  alive: "drive",
  intro: "Сложи улитку по картинке. Найди фиолетовый блок для серединки раковины!",
  done: "Улитка вытянула жёлтые рожки!"
},
{
  id: "b7",
  title: "Вокзал с часами",
  world: "big",
  look: "copy",
  cols: 10,
  rows: 6,
  pieces: [
    p("roof", "red", 3, 0, 4, 1),
    p("brick", "yellow", 3, 1, 1, 2),
    p("num", "white", 4, 1, 2, 2, { n: 3 }),
    p("brick", "yellow", 6, 1, 1, 2),
    p("roof", "red", 0, 3, 3, 1),
    p("brick", "orange", 3, 3, 4, 1),
    p("roof", "red", 7, 3, 3, 1),
    p("brick", "yellow", 0, 4, 1, 2),
    p("window", "blue", 1, 4, 2, 2),
    p("brick", "yellow", 3, 4, 1, 2),
    p("door", "green", 4, 4, 2, 2),
    p("brick", "yellow", 6, 4, 1, 2),
    p("window", "blue", 7, 4, 2, 2),
    p("brick", "yellow", 9, 4, 1, 2)
  ],
  extra: [{ kind: "num", color: "purple", w: 2, h: 2, n: 3 }],
  alive: "house",
  intro: "Построй вокзал по картинке. Над дверью поставь белые часы с тройкой!",
  done: "Вокзальные часы показывают три!"
},
{
  id: "h10", title: "Мягкое кресло", world: "half", look: "half", alive: "house",
  cols: 6, rows: 5,
  intro: "Дострой кресло. Пусть обе ручки будут жёлтыми.",
  done: "Вот где можно отдохнуть!",
  pieces: [
    p("brick", "blue", 1, 0, 2, 2, { fixed: true }),
    p("brick", "yellow", 0, 2, 1, 1, { fixed: true }),
    p("brick", "blue", 1, 2, 2, 1, { fixed: true }),
    p("brick", "purple", 0, 3, 3, 1, { fixed: true }),
    p("brick", "purple", 0, 4, 1, 1, { fixed: true }),
    p("brick", "blue", 3, 0, 2, 2),
    p("brick", "yellow", 5, 2),
    p("brick", "blue", 3, 2, 2, 1),
    p("brick", "purple", 3, 3, 3, 1),
    p("brick", "purple", 5, 4)
  ],
  extra: [{ kind: "brick", color: "red", w: 1, h: 1 }]
},
{
  id: "c9", title: "Жёлтая уточка", world: "copy", look: "copy", alive: "boat",
  cols: 5, rows: 4,
  intro: "Собери уточку по картинке. Найди оранжевый клюв.",
  done: "Уточка плывёт по пруду!",
  pieces: [
    p("brick", "yellow", 3, 0, 1, 2),
    p("brick", "orange", 4, 1),
    p("brick", "yellow", 0, 1),
    p("brick", "yellow", 0, 2, 4, 1),
    p("brick", "yellow", 1, 3, 2, 1)
  ],
  extra: [{ kind: "brick", color: "green", w: 1, h: 1 }]
},
{
  id: "c10", title: "Самокат", world: "copy", look: "copy", alive: "drive",
  cols: 6, rows: 5,
  intro: "Собери самокат с зелёным рулём.",
  done: "Самокат катится по дорожке!",
  pieces: [
    p("brick", "green", 4, 0, 2, 1),
    p("brick", "blue", 5, 1, 1, 2),
    p("brick", "yellow", 0, 3, 3, 1),
    p("brick", "yellow", 3, 3, 3, 1),
    p("wheel", "black", 0, 4),
    p("wheel", "black", 5, 4)
  ],
  extra: [{ kind: "brick", color: "orange", w: 2, h: 1 }]
},
{
  id: "b8", title: "Подъёмный кран", world: "big", look: "copy", alive: "tower",
  cols: 8, rows: 7,
  intro: "Построй высокий кран. Подвесь крюк, как на картинке.",
  done: "Кран готов поднимать грузы!",
  pieces: [
    p("brick", "yellow", 0, 0, 4, 1),
    p("brick", "yellow", 4, 0, 4, 1),
    p("brick", "purple", 0, 1),
    p("window", "blue", 1, 1, 2, 1),
    p("brick", "orange", 1, 2, 2, 1),
    p("brick", "yellow", 2, 3, 1, 3),
    p("brick", "blue", 0, 6, 4, 1),
    p("brick", "black", 7, 1, 1, 2),
    p("brick", "red", 7, 3, 1, 2),
    p("brick", "red", 6, 4)
  ],
  extra: [{ kind: "window", color: "green", w: 2, h: 1 }]
},
{
  id: "b9", title: "Книжный шкаф", world: "big", look: "copy", alive: "house",
  cols: 7, rows: 7,
  intro: "Собери шкаф и расставь книги по цветам.",
  done: "Все книги на своих полках!",
  pieces: [
    p("brick", "orange", 0, 0, 7, 1),
    p("brick", "orange", 0, 1, 1, 5),
    p("brick", "orange", 6, 1, 1, 5),
    p("brick", "orange", 1, 3, 5, 1),
    p("brick", "orange", 0, 6, 7, 1),
    p("brick", "red", 1, 1, 1, 2),
    p("brick", "blue", 2, 2),
    p("brick", "green", 4, 1, 1, 2),
    p("brick", "yellow", 5, 1, 1, 2),
    p("brick", "purple", 1, 4, 1, 2),
    p("brick", "blue", 2, 4, 1, 2),
    p("brick", "green", 4, 5, 2, 1),
    p("brick", "red", 4, 4, 2, 1)
  ],
  extra: [{ kind: "brick", color: "white", w: 1, h: 2 }]
},
];
