/**
 * Lines for Ryzhik's recorded voice. Drop a file named <id>.mp3 (or .ogg /
 * .m4a) into src/shared/voice/ and it plays at that moment; with no file the
 * game stays as it is (sound effects only). NEEDED_ASSETS.json lists these.
 */
export const VOICE_LINES: Record<string, string> = {
  "praise-1": "Молодец!",
  "praise-2": "Умница!",
  "praise-3": "Ура! Получилось!",
  "praise-4": "Здорово!",
  "praise-5": "Вот это да!",
  "praise-6": "Отлично!",
  "all-done": "Ты прошёл все уровни! Я тобой горжусь!",
  "tutorial": "Смотри, как надо. А теперь ты!",
  "hint": "Давай я подскажу!",
  "try-again": "Попробуй ещё разок!",
  "sticker": "Новая наклейка! Посмотри в альбоме!",
  "gift": "У меня для тебя подарок!",
  "hello": "Привет! Я лисёнок Рыжик. Поиграем?",
  "howto-domik": "Это мой домик. Нажимай на всё вокруг!",
  "howto-kuhnya": "Давай готовить! Перетаскивай продукты.",
  "howto-risovalka": "Веди пальчиком по линии — и рисунок оживёт!",
  "howto-tochki": "Соединяй точки по порядку: один, два, три…",
  "howto-professii": "Кем будем сегодня? Доктором, пожарным или продавцом?",
  "howto-stroyka": "Строим! Ставь кубики на свои места.",
  "howto-formy": "Большое, маленькое, круглое, квадратное — разложим всё!",
  "howto-tajnaya-kartinka": "Веди меня по полю и открывай картинку!",
  "howto-mozaika": "Перетащи кусочек на его место.",
  "howto-sliyanie": "Проведи пальцем — одинаковые картинки соединятся!",
  "howto-najdi-paru": "Открывай карточки и ищи две одинаковые.",
  "howto-teni": "Найди, чья это тень!",
  "howto-odezhda": "Посмотри на погоду и одень меня!",
  "howto-sortirovka": "Разложи всё по корзинкам!",
  "howto-labirint": "Помоги мне дойти до друга!",
  "howto-raskraska": "Выбирай цвет и раскрашивай!",
};

export function praiseLine(rand: () => number = Math.random): string {
  return `praise-${1 + Math.floor(rand() * 6)}`;
}
