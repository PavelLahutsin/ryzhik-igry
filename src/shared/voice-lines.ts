/**
 * Recorded voice of Ryzhik and recorded music, both optional. Files go to
 * public/audio/voice/vNN.mp3 and public/audio/music/mNN.mp3 (ids as in
 * prompts/ryzhik-igry-prompts.md). Missing files are fine: the games keep
 * their synthesized sounds and say nothing.
 */
export const VOICE_LINES: Record<string, string> = {
  v01: "Привет! Давай играть!",
  v02: "Молодец!",
  v03: "Ура, получилось!",
  v04: "Здорово! Ты умничка!",
  v05: "Попробуй ещё разок!",
  v06: "Не получилось? Ничего, давай вместе!",
  v07: "Смотри, я покажу!",
  v08: "Новое! Посмотри, что это!",
  v09: "Ты прошёл все уровни! Ты настоящий чемпион!",
  v10: "Держи звёздочку!",
  v11: "Выбирай игру!",
  v12: "Пока-пока! Приходи ещё!",
  v13: "Отрезай кусочки поля, и картинка откроется!",
  v14: "Осторожно, пчёлка!",
  v15: "Собери картинку из кусочков!",
  v16: "Соединяй одинаковые, и вырастет сад!",
  v17: "Давай перемешаем!",
  v18: "Найди две одинаковые картинки!",
  v19: "Чья это тень? Найди!",
  v20: "Помоги мне одеться по погоде!",
  v21: "Варежки — для мороза!",
  v22: "Разложи всё по корзинкам!",
  v23: "Проведи меня по лабиринту и собери яблочки!",
  v24: "Это мой домик! Нажимай на всё, что видишь!",
  v25: "Давай готовить! Что положим?",
  v26: "Ням-ням, как вкусно!",
  v27: "Фу, это я не люблю!",
  v28: "Обведи по точкам, и рисунок оживёт!",
  v29: "Соедини точки по порядку!",
  v30: "Кем будем сегодня? Доктором или пожарным?",
  v31: "Зайка заболел, давай его полечим!",
  v32: "Пожар! Скорее туши огонь!",
  v33: "Возьми в магазине всё по списку!",
  v34: "Давай строить! Ставь кубик на место!",
  v35: "Сюда нужен синий кубик!",
  v36: "Где большой, а где маленький?",
  v37: "Какой формы этот предмет?",
};

/** When each line plays (also the list for NEEDED_ASSETS.json). */
export const VOICE_WHEN: Record<string, string> = {
  v01: "первый заход на главный экран",
  v02: "похвала после уровня (случайно из v02, v03, v04, v10)",
  v05: "промах (не чаще раза в 15 секунд, каждый третий)",
  v06: "нажата лампочка-подсказка",
  v07: "обучение на первом уровне: ладошка показывает ход",
  v08: "пузырёк «Новое!»",
  v09: "пройден последний уровень игры",
  v11: "возврат на главный экран",
  v12: "кнопка «Все игры» после последнего уровня",
  v14: "Тайная картинка: пчёлка задела линию",
  v17: "Вырасти сад: кнопка «Перемешаем!»",
  v21: "Одень Рыжика: надели варежки",
  v26: "Кухня: гостю вкусно",
  v27: "Кухня: гостю невкусно",
  v31: "Профессии: начало «Зайка простыл»",
  v32: "Профессии: начало пожара",
  v33: "Профессии: начало магазина",
  v35: "Стройка: кубик не того цвета на синее место",
  v37: "Размер и форма: уровни с фигурами",
};

export const PRAISE_LINES = ["v02", "v03", "v04", "v10"];

export function praiseLine(rand: () => number = Math.random): string {
  return PRAISE_LINES[Math.floor(rand() * PRAISE_LINES.length)]!;
}

/** «Как играть» card of each game: Ryzhik explains. */
export const HOWTO_VOICE: Record<string, string> = {
  "tajnaya-kartinka": "v13",
  mozaika: "v15",
  sliyanie: "v16",
  "najdi-paru": "v18",
  teni: "v19",
  odezhda: "v20",
  sortirovka: "v22",
  labirint: "v23",
  domik: "v24",
  kuhnya: "v25",
  risovalka: "v28",
  tochki: "v29",
  professii: "v30",
  stroyka: "v34",
  formy: "v36",
};

/** Background music per game (m12 is the win jingle). The coloring book keeps its own sounds. */
export const MUSIC_FILES: Record<string, string> = {
  home: "m01",
  "tajnaya-kartinka": "m02",
  labirint: "m02",
  mozaika: "m03",
  "najdi-paru": "m03",
  teni: "m03",
  formy: "m03",
  sortirovka: "m03",
  sliyanie: "m04",
  odezhda: "m05",
  domik: "m06",
  "domik-night": "m07",
  kuhnya: "m08",
  professii: "m09",
  stroyka: "m10",
  risovalka: "m11",
  tochki: "m11",
};
export const WIN_JINGLE = "m12";
