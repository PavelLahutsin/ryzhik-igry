/**
 * «Новое!» bubbles for the level where something new shows up first.
 * `at` is a selector inside the play area; the text is short on purpose.
 * Shown once each (see seen.ts), resettable in «Родителям».
 */
export type LevelTip = { at: string; text: string };

export const LEVEL_TIPS: Record<string, Record<string, LevelTip>> = {
  mozaika: {
    m3: { at: ".mz-area", text: "Теперь без подсказки на рамке. Смотри на картинку!" },
  },
  teni: {
    t9: { at: ".tn-board", text: "Тут есть лишняя тень. Её никто не ищет!" },
    t10: { at: ".tn-board", text: "Тени похожи — смотри на мелочи!" },
    t25: { at: ".tn-board", text: "Большой — к большой тени, маленький — к маленькой" },
    t22: { at: ".tn-board", text: "Тени смотрят в другую сторону — всё равно узнай!" },
    t23: { at: ".tn-board", text: "Тени вверх ногами! Переверни картинку в уме" },
    t27: { at: ".tn-board", text: "Тень спряталась в кустах — узнай по кусочку" },
    t31: { at: ".tn-round", text: "Тут две части: после первых теней будут новые" },
  },
  odezhda: {
    o2: { at: ".od-banner", text: "Смотри на погоду: что надеть под дождик?" },
  },
  sortirovka: {
    k1: { at: ".so-basket", text: "Теперь не по цвету, а по виду: что куда?" },
  },
  labirint: {
    l6: { at: ".lb-count", text: "Собери по дороге яблоко!" },
  },
  sliyanie: {
    s1: { at: ".sl-chain", text: "Здесь видно, что вырастет дальше" },
    z1: { at: ".sl-chain", text: "Зима! Из снежинок лепим снеговика" },
  },
  risovalka: {
    r13: { at: ".rv-board", text: "Теперь линий больше — веди по очереди" },
    r19: { at: ".rv-board", text: "Мастер! Видна только одна линия — следующая появится потом" },
  },
  bukvy: {
    b1: { at: ".rv-board", text: "Цифры на линиях: какую вести первой, какую второй" },
  },
  tochki: {
    t13: { at: ".td-board", text: "Теперь точек больше десяти!" },
    d2: { at: ".td-board", text: "Считаем назад: 10, 9, 8… до единицы" },
    k1: { at: ".td-board", text: "Через одну: 2, 4, 6, 8…" },
    k3: { at: ".td-board", text: "Пятёрками: 5, 10, 15, 20…" },
    k4: { at: ".td-board", text: "Десятками: 10, 20, 30… до ста!" },
    a1: { at: ".td-board", text: "Вместо цифр — буквы: А, Б, В, Г…" },
    g1: { at: ".td-board", text: "Много точек — больше двадцати! Следующая светится зелёным" },
  },
  professii: {
    "vrach-kotik": { at: '[data-tool="cotton"]', text: "Ватку надо потереть по лапке туда-сюда" },
    "pozhar-dom": { at: '[data-tool="water"]', text: "Води струёй по огню, пока он не погаснет" },
    "magazin-1": { at: ".pr-list", text: "Это список: купи всё, что в нём" },
    "dom-kuhnya": { at: ".pr-scene-wrap", text: "Нажимай на всё опасное" },
  },
  stroyka: {
    s10: { at: ".sk-model", text: "Смотри на картинку и ставь кубик в его окошко" },
    s7: { at: ".sk-say", text: "На вагончиках цифры: 1, 2, 3…" },
    h1: { at: ".sk-board", text: "Половинка уже есть. Вторую строй такой же — как в зеркале!" },
    c1: { at: ".sk-sample__box", text: "Места серые. Цвет смотри на образце!" },
    b1: { at: ".sk-sample__box", text: "Большая стройка — много кубиков, смотри на образец" },
  },
  formy: {
    r3: { at: ".fm-pole", text: "Самое большое колечко — первым!" },
    f1: { at: ".fm-box", text: "У каждой фигурки своё окошко" },
    c1: { at: ".fm-q", text: "Нажми на ответ. Ошибся — не беда, попробуй другой" },
    o1: { at: ".fm-shelf", text: "Ставь по порядку: на место 1, потом 2, 3…" },
    m4: { at: ".fm-say", text: "Слушай: «самый длинный» или «самая низкая»?" },
    s2: { at: ".fm-sample", text: "Цвет одинаковый — смотри на форму" },
    d1: { at: ".fm-q", text: "Все похожи, а одна — нет. Найди её!" },
    q1: { at: ".fm-row", text: "Фигуры повторяются. Что встанет вместо «?»" },
    h2: { at: ".fm-holebox", text: "Смотри и на форму, и на размер окошка" },
    k1: { at: ".fm-cornerbox", text: "Посчитай уголки пальчиком: раз, два, три…" },
    x1: { at: ".fm-shelves", text: "Нужно, чтобы совпали и цвет, и форма!" },
  },
};
