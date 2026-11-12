import type { ObjectId } from "./objects";

/**
 * «Как играть» for every game: 2–4 picture steps for the child (a few words
 * each, the picture does the talking) and a plain text for the parents.
 */

/** A picture in a step: a drawn object, a character, a silhouette or a mark. */
export type Art =
  | { o: ObjectId }
  | { c: string }
  | { shadow: ObjectId }
  | { mark: "dots" | "grid" | "maze" | "piece" | "slot" | "basket" | "lamp" | "plate" | "pyramid" | "block" | "ghost" | "number" | "big" | "pot" | "coin" | "till" | "brush" | "heart" | "star" };

/** What the hand does in the picture. */
export type Move = "drag" | "tap" | "trace" | "swipe";

export type Step = { move: Move; from: Art; to?: Art; text: string };
export type HowTo = {
  title: string;
  steps: Step[];
  rules: string;
  develops: string;
  /** How stars are given (level games), shown on the card and to parents. */
  stars?: string;
};

export const HOWTO: Record<string, HowTo> = {
  domik: {
    title: "Домик Рыжика",
    steps: [
      { move: "tap", from: { o: "flower" }, text: "Нажимай на всё — оно оживёт" },
      { move: "drag", from: { c: "ryzhik" }, to: { o: "house" }, text: "Переноси друзей куда хочешь" },
      { move: "tap", from: { o: "sun" }, text: "Солнце — день, луна — ночь" },
    ],
    rules: "Свободная игра без заданий: в доме, саду и лесу можно трогать вещи, переносить героев, включать день и ночь. Звёздочка в углу считает найденные сюрпризы.",
    develops: "Любопытство, речь (герои говорят), причину и следствие, мелкую моторику.",
  },
  kuhnya: {
    title: "Кухня Рыжика",
    steps: [
      { move: "drag", from: { o: "carrot" }, to: { mark: "pot" }, text: "Положи продукт на доску или в кастрюлю" },
      { move: "tap", from: { mark: "pot" }, text: "Стучи и жди — готовится" },
      { move: "drag", from: { mark: "plate" }, to: { c: "mishka" }, text: "Угости гостя" },
    ],
    rules: "Готовим что хотим: режем, жарим, варим, смешиваем в блендере и угощаем гостей. У каждого гостя свои любимые блюда — он покажет, понравилось ли.",
    develops: "Знакомство с продуктами и кухней, последовательность действий, эмоции и вкусы других.",
  },
  risovalka: {
    title: "Рисовалка",
    steps: [
      { move: "trace", from: { mark: "dots" }, text: "Веди пальцем от зелёной точки" },
      { move: "tap", from: { o: "sun" }, text: "Рисунок оживёт!" },
    ],
    rules: "Обводим пунктир пальцем от зелёной точки по стрелке. Обведённый рисунок оживает. В последнем мире обводим цифры и считаем яблочки.",
    develops: "Подготовку руки к письму, координацию, знакомство с цифрами.",
  },
  tochki: {
    title: "По точкам",
    steps: [
      { move: "tap", from: { mark: "number" }, text: "Начни с цифры 1" },
      { move: "trace", from: { mark: "dots" }, text: "Соединяй по порядку: 1, 2, 3…" },
      { move: "tap", from: { o: "star" }, text: "Получится картинка" },
    ],
    rules: "Соединяем точки по порядку цифр, не отрывая или отрывая палец. Когда последняя точка соединена, появляется картинка.",
    develops: "Счёт и порядок чисел (до 16), узнавание цифр, моторику.",
  },
  professii: {
    title: "Профессии",
    steps: [
      { move: "drag", from: { o: "cup" }, to: { c: "mishka" }, text: "Бери нужный предмет и неси" },
      { move: "swipe", from: { mark: "heart" }, text: "Иногда нужно потереть" },
      { move: "tap", from: { mark: "star" }, text: "Найди опасное — нажми" },
    ],
    rules: "Играем во врача, пожарного, продавца и учимся безопасности дома. Рыжик говорит, что сделать, а ладошка показывает, если ребёнок задумался.",
    develops: "Знания о профессиях и безопасности, внимание к инструкции, счёт до 10 (покупки и монетки).",
  },
  stroyka: {
    title: "Стройка",
    steps: [
      { move: "drag", from: { mark: "block" }, to: { mark: "ghost" }, text: "Ставь кубик на свой цвет" },
      { move: "tap", from: { o: "car" }, text: "Готово — модель оживёт!" },
    ],
    rules: "Собираем домики, машины и ракеты из больших кубиков по контуру: форма и цвет кубика должны совпасть.",
    develops: "Цвета и формы, пространственное мышление, счёт деталей.",
  },
  formy: {
    title: "Размер и форма",
    steps: [
      { move: "drag", from: { o: "apple" }, to: { c: "papa" }, text: "Большое — большому" },
      { move: "drag", from: { mark: "pyramid" }, to: { mark: "slot" }, text: "Пирамидку — с самого большого" },
      { move: "drag", from: { o: "ball" }, to: { mark: "basket" }, text: "Круглое — к кругу" },
    ],
    rules: "Раздаём вещи по размеру (папе, маме, Рыжику), собираем пирамидку, опускаем фигуры в сортер и ищем, что на что похоже.",
    develops: "Понятия «большой — средний — маленький», геометрические фигуры, сравнение.",
  },
  "tajnaya-kartinka": {
    title: "Тайная картинка",
    steps: [
      { move: "drag", from: { c: "ryzhik" }, to: { mark: "grid" }, text: "Веди Рыжика по полю" },
      { move: "tap", from: { mark: "piece" }, text: "Замкнул линию — кусочек открылся" },
      { move: "tap", from: { mark: "heart" }, text: "Береги сердечки от пчёлок" },
    ],
    rules: "Рыжик ведёт линию по полю и отрезает кусочки — под ними прячется картинка. Пчёлки мешают: если коснутся линии, теряется сердечко. Бонусы помогают.",
    develops: "Планирование, координацию «глаз — рука», терпение.",
  },
  mozaika: {
    title: "Мозаика",
    steps: [
      { move: "drag", from: { mark: "piece" }, to: { mark: "slot" }, text: "Перетащи кусочек на место" },
      { move: "tap", from: { mark: "lamp" }, text: "Трудно? Лампочка поможет" },
    ],
    rules: "Собираем картинку из 4–16 кусочков. Сначала видна бледная подсказка, потом её нет.",
    develops: "Зрительное восприятие, целое и часть, усидчивость.",
  },
  sliyanie: {
    title: "Вырасти сад",
    steps: [
      { move: "swipe", from: { mark: "grid" }, text: "Проведи пальцем — всё поедет" },
      { move: "drag", from: { o: "leaf" }, to: { o: "flower" }, text: "Две одинаковые — растёт новое" },
      { move: "tap", from: { mark: "big" }, text: "«Удвоялка»: 2+2=4, 4+4=8… до 2048!" },
    ],
    rules: "Сдвигаем все плитки пальцем или стрелками; две одинаковые сливаются в следующую. «Для малышей» — короткие уровни с картинками (семечко → росток → цветок…), цель показана наверху; застряли — «Перемешаем!», шаг назад — лампочка. «Удвоялка» — большая игра на поле 4×4: 2+2=4, 4+4=8 и так до 2048, после каждого хода появляется новая двойка (иногда четвёрка), за каждое слияние даются очки, рекорд сохраняется. Чем дальше, тем труднее — числа растут вдвое, а места мало. Перед игрой выбираются картинки (сад, зима, лес, космос или просто цифры) — на каждой плитке есть и число. Можно вернуться на шаг назад; если ходов нет — «Ещё раз», без проигрыша. Начатая игра сохраняется.",
    develops: "Логику, планирование ходов, удвоение чисел и счёт, понятие последовательности.",
  },
  "najdi-paru": {
    title: "Найди пару",
    steps: [
      { move: "tap", from: { mark: "piece" }, text: "Открой две карточки" },
      { move: "tap", from: { o: "apple" }, text: "Одинаковые — пара!" },
    ],
    rules: "Открываем по две карточки и ищем одинаковые. Не совпали — закроются, запоминаем, где что лежит.",
    develops: "Зрительную память, внимание.",
  },
  teni: {
    title: "Тени",
    steps: [
      { move: "drag", from: { o: "apple" }, to: { shadow: "apple" }, text: "Найди тень и положи на неё" },
      { move: "drag", from: { o: "kite" }, to: { shadow: "kite" }, text: "Каждой картинке — своя тень" },
    ],
    rules: "Сопоставляем картинку с её тенью. На поздних уровнях есть лишние тени.",
    develops: "Узнавание формы по силуэту, внимание к деталям.",
  },
  odezhda: {
    title: "Одень Рыжика",
    steps: [
      { move: "tap", from: { o: "sun" }, text: "Посмотри, какая погода" },
      { move: "drag", from: { o: "umbrella" }, to: { c: "ryzhik" }, text: "Одень Рыжика по погоде" },
    ],
    rules: "Одеваем Рыжика на прогулку по погоде: солнце, дождь, снег. Лишние вещи не подходят.",
    develops: "Знания о погоде и одежде, самостоятельность.",
  },
  sortirovka: {
    title: "Разложи по местам",
    steps: [
      { move: "drag", from: { o: "apple" }, to: { mark: "basket" }, text: "Красное — в красную корзинку" },
      { move: "drag", from: { o: "carrot" }, to: { mark: "basket" }, text: "Потом — по виду" },
    ],
    rules: "Раскладываем предметы по корзинкам: сначала по цвету, потом по виду (фрукты, игрушки, транспорт).",
    develops: "Классификацию, цвета, обобщающие слова.",
  },
  labirint: {
    title: "Лабиринт",
    steps: [
      { move: "trace", from: { mark: "maze" }, text: "Веди Рыжика пальцем по дорожке" },
      { move: "tap", from: { o: "apple" }, text: "Собери яблоки по пути" },
    ],
    rules: "Ведём Рыжика к другу по дорожкам лабиринта. На средних уровнях по пути нужно собрать яблоки.",
    develops: "Пространственное мышление, планирование пути, моторику.",
  },
  raskraska: {
    title: "Раскраска",
    steps: [
      { move: "tap", from: { mark: "brush" }, text: "Выбери цвет" },
      { move: "tap", from: { o: "flower" }, text: "Нажми — раскрасится" },
    ],
    rules: "Выбираем цвет и нажимаем на часть картинки — она закрашивается. Готовые рисунки сохраняются в альбоме, за них дают наклейки.",
    develops: "Цвета, аккуратность, творчество.",
  },
};

/** Level games: the same star rule everywhere (see shared/stars.ts). */
const STAR_LINE = "★★★ — сам, без лампочки · ★★ — с одной подсказкой или с ошибками · ★ — с помощью";
for (const id of ["risovalka", "bukvy", "tochki", "professii", "stroyka", "formy", "mozaika", "sliyanie", "najdi-paru", "teni", "odezhda", "sortirovka", "labirint"]) {
  const h = HOWTO[id];
  if (h) h.stars = STAR_LINE;
}
if (HOWTO["tajnaya-kartinka"]) HOWTO["tajnaya-kartinka"].stars = "★★★ — ни одного укуса · ★★ — один укус · ★ — больше";
