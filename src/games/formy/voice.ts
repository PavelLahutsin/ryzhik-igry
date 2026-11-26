import type { FormLevel } from "./levels";
import type { Shape } from "./logic";

/**
 * v23: every task of «Размер и форма» is spoken by Ryzhik (children don't read).
 * One question per level, so one line per level; 🔊 repeats it. Lines from
 * Astra (brief 21-1, 22-3); the files arrive later — until then audio.say is
 * silent and the 🔊 button stays hidden.
 */
export const FORMY_TASK_VOICE = {
  "family:2": "v82",
  "family:3": "v83",
  pyramid: "v86",
  sorter: "v94",
  things: "v95",
  sort2: "v96",
  "order:up": "v84",
  "order:down": "v85",
  "pick:compare:size:most:2": "v72",
  "pick:compare:size:least:2": "v73",
  "pick:compare:size:most:3+": "v74",
  "pick:compare:size:least:3+": "v75",
  "pick:compare:length:most": "v76",
  "pick:compare:length:least": "v77",
  "pick:compare:height:most": "v78",
  "pick:compare:height:least": "v79",
  "pick:compare:thick:most": "v80",
  "pick:compare:thick:least": "v81",
  "pick:same": "v87",
  "pick:odd:tint": "v88",
  "pick:odd:shape": "v89",
  "pick:odd:size": "v90",
  "pick:pattern": "v91",
  "pick:fit": "v92",
  "pick:corners": "v93",
} as const;
export type TaskKey = keyof typeof FORMY_TASK_VOICE;

/** Said after a move (when recorded). */
export const FORMY_RESULT_VOICE = {
  ok: { fit: "v98", sorter: "v98", family: "v103", "pyramid:ring": "v97" },
  miss: { fit: "v99", sorter: "v99", compare: "v100", order: "v100", odd: "v101", pattern: "v102" },
  shapeName: {
    circle: "v104",
    square: "v105",
    triangle: "v106",
    star: "v107",
    heart: "v108",
    rhombus: "v109",
    oval: "v110",
    rect: "v111",
    pentagon: "v112",
    hexagon: "v113",
  } satisfies Record<Shape, string>,
  count: ["v114", "v115", "v116", "v117", "v118", "v119"],
  size: { big: "v120", small: "v121" },
} as const;

/** Older recorded lines that say nearly the same, while the new one is missing. */
export const FORMY_FALLBACK: Partial<Record<TaskKey, string>> = {
  "pick:same": "v67",
  sorter: "v67",
};

/** The bubble text: what Ryzhik says, shortened for the parent's eye. */
export const FORMY_BUBBLE: Record<string, string> = {
  v72: "Где большое? Нажми!",
  v73: "Где маленькое? Нажми!",
  v74: "Найди самое большое!",
  v75: "Найди самое маленькое!",
  v76: "Где длинный карандаш? Нажми!",
  v77: "Где короткий карандаш? Нажми!",
  v78: "Где высокая ёлочка? Нажми!",
  v79: "Где низкая ёлочка? Нажми!",
  v80: "Где толстая книжка? Нажми!",
  v81: "Где тонкая книжка? Нажми!",
  v82: "Большое — папе, маленькое — мне!",
  v83: "Папе, маме, мне — по размеру!",
  v84: "От маленького к большому!",
  v85: "От большого к маленькому!",
  v86: "Сначала самое большое колечко.",
  v87: "Найди такую же фигурку!",
  v88: "Найди фигурку другого цвета!",
  v89: "Найди фигурку другой формы!",
  v90: "Найди фигурку другого размера!",
  v91: "Что будет дальше? Нажми!",
  v92: "Какая фигурка пролезет в окошко?",
  v93: "Сколько уголков? Считай со мной!",
  v94: "Каждую фигурку — в своё окошко!",
  v95: "Каждую вещь — к похожей фигуре!",
  v96: "Смотри на цвет и форму!",
};

/** The kind of task of a level (one per level). */
export function taskKey(l: FormLevel): TaskKey {
  switch (l.mode) {
    case "family":
      return l.sizes.length >= 3 ? "family:3" : "family:2";
    case "order":
      return `order:${l.dir}`;
    case "pick": {
      const sp = l.spec;
      if (sp.kind === "compare") {
        const want = sp.want === "least" ? "least" : "most";
        const dim = sp.dims[0]!;
        return dim === "size" ? `pick:compare:size:${want}:${sp.count <= 2 ? "2" : "3+"}` : `pick:compare:${dim}:${want}`;
      }
      if (sp.kind === "odd") return `pick:odd:${sp.by === "mix" ? "shape" : sp.by}`;
      return `pick:${sp.kind}`;
    }
    default:
      return l.mode;
  }
}

export const taskVoice = (l: FormLevel): string => FORMY_TASK_VOICE[taskKey(l)];

/** The demo key (Astra's FORMY_DEMOS): compare by dimension, odd by any. */
export function demoKey(l: FormLevel): string {
  const k = taskKey(l);
  if (k.startsWith("family:")) return "family";
  if (k.startsWith("pick:compare:")) return k.split(":").slice(0, 3).join(":");
  if (k.startsWith("pick:odd:")) return "pick:odd";
  return k;
}
