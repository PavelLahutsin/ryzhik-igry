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
  },
  formy: {
    r3: { at: ".fm-pole", text: "Самое большое колечко — первым!" },
    f1: { at: ".fm-box", text: "У каждой фигурки своё окошко" },
  },
};
