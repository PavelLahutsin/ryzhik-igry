import { OBJECTS } from "../../shared/objects";
import { withArt } from "../../shared/art";
import { EXTRA } from "../tapni/scenes";
import { SHAPES } from "../teni/shapes";

/**
 * v23: animals for «Кто что ест?» and «Кто новенький?» — the ones already
 * drawn for «Тени» and «Нажми и послушай», plus eight new guests (Astra,
 * brief 25-2). No fox: the fox is Ryzhik. Astra's cow, goat and horse have no
 * picture in the game: the cow became a sheep, the goat a piglet, the horse the
 * circus pony; the chicken is the hen.
 */
const NEW_GUESTS = {
  piglet: {
    name: "Поросёнок",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M66 68 Q79 74 82 65 C85 57 74 57 76 63 Q78 68 85 62" fill="none"/>
        <ellipse cx="50" cy="66" rx="20" ry="18" fill="#f596a4"/>
        <ellipse cx="37" cy="80" rx="9" ry="6" fill="#e78394"/>
        <ellipse cx="63" cy="80" rx="9" ry="6" fill="#e78394"/>
        <path d="M26 39 Q18 29 23 17 Q34 18 40 27 Q50 24 60 27 Q66 18 77 17 Q82 29 74 39 C83 61 67 70 50 70 C33 70 17 61 26 39Z" fill="#ffb6bc"/>
        <path d="M27 23 Q28 30 32 32 M73 23 Q72 30 68 32" fill="none" stroke="#db7e90"/>
        <g fill="#3b2e25"><circle cx="37" cy="43" r="2"/><circle cx="63" cy="43" r="2"/></g>
        <ellipse cx="50" cy="53" rx="13" ry="9" fill="#ff91a1"/>
        <path d="M45 52v2 M55 52v2 M46 64q4 3 8 0" fill="none"/>
      </g>
    </svg>`,
  },
  elephant: {
    name: "Слонёнок",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <ellipse cx="50" cy="66" rx="22" ry="18" fill="#79b9dd"/>
        <ellipse cx="34" cy="78" rx="11" ry="8" fill="#a5d8ef"/>
        <ellipse cx="66" cy="78" rx="11" ry="8" fill="#a5d8ef"/>
        <path d="M35 34 C16 12 7 29 12 49 C15 66 28 65 37 53Z M65 34 C84 12 93 29 88 49 C85 66 72 65 63 53Z" fill="#9acdec"/>
        <path d="M30 39 Q16 24 19 44 Q21 59 29 52Z M70 39 Q84 24 81 44 Q79 59 71 52Z" fill="#efb6c9" stroke="none"/>
        <path d="M46 59 C32 59 27 51 28 39 C29 25 38 19 50 19 C64 19 73 28 72 42 Q72 55 57 59 L57 65 Q58 71 63 65 Q67 62 68 67 C67 80 47 81 46 67Z" fill="#9fd5ef"/>
        <g fill="#3b2e25"><circle cx="40" cy="41" r="2"/><circle cx="60" cy="41" r="2"/></g>
        <path d="M48 53h6 M49 59h4 M29 81v-2 M35 82v-2 M65 82v-2 M71 81v-2" fill="none"/>
      </g>
    </svg>`,
  },
  penguin: {
    name: "Пингвинёнок",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M30 44 Q18 45 14 64 Q22 68 33 55Z M70 44 Q82 45 86 64 Q78 68 67 55Z" fill="#476887"/>
        <path d="M50 14 C68 14 74 31 73 47 C78 72 70 81 50 82 C30 81 22 72 27 47 C26 31 32 14 50 14Z" fill="#527796"/>
        <path d="M50 36 C44 24 31 29 32 42 Q32 49 37 52 C25 69 35 77 50 77 C65 77 75 69 63 52 Q68 49 68 42 C69 29 56 24 50 36Z" fill="#fff6df" stroke="none"/>
        <g fill="#3b2e25"><circle cx="40" cy="42" r="2"/><circle cx="60" cy="42" r="2"/></g>
        <path d="M43 49 Q50 44 57 49 Q55 55 50 57 Q45 55 43 49Z" fill="#ffb448"/>
        <ellipse cx="37" cy="80" rx="12" ry="6" fill="#ffb448"/>
        <ellipse cx="63" cy="80" rx="12" ry="6" fill="#ffb448"/>
      </g>
    </svg>`,
  },
  lamb: {
    name: "Ягнёнок",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M31 55 Q24 54 23 62 Q17 69 25 74 Q26 84 37 80 Q47 88 56 82 Q69 87 75 77 Q85 73 77 63 Q78 53 67 53Z" fill="#fff0cf"/>
        <ellipse cx="38" cy="80" rx="8" ry="6" fill="#cc997e"/>
        <ellipse cx="62" cy="80" rx="8" ry="6" fill="#cc997e"/>
        <path d="M34 32 Q20 27 12 41 Q19 52 35 41Z M66 32 Q80 27 88 41 Q81 52 65 41Z" fill="#f6b8ad"/>
        <ellipse cx="50" cy="44" rx="22" ry="23" fill="#ffdbb2"/>
        <path d="M29 36 Q22 29 30 24 Q30 15 40 18 Q46 10 53 17 Q62 11 68 20 Q79 21 73 31 Q74 38 65 37 Q60 43 53 36 Q46 42 40 36 Q34 40 29 36Z" fill="#fff6df"/>
        <g fill="#3b2e25"><circle cx="40" cy="46" r="2"/><circle cx="60" cy="46" r="2"/></g>
        <path d="M46 53 Q50 51 54 53 L50 57Z" fill="#d48e87"/>
        <path d="M50 57q-3 5-7 2 M50 57q3 5 7 2" fill="none"/>
      </g>
    </svg>`,
  },
  tiger: {
    name: "Тигрёнок",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M65 72 Q78 78 78 58 Q81 50 86 57 Q89 83 64 80Z" fill="#ffb254"/>
        <ellipse cx="50" cy="66" rx="20" ry="18" fill="#ffa64c"/>
        <ellipse cx="36" cy="80" rx="10" ry="6" fill="#ffc778"/>
        <ellipse cx="64" cy="80" rx="10" ry="6" fill="#ffc778"/>
        <circle cx="29" cy="27" r="10" fill="#ffa64c"/><circle cx="71" cy="27" r="10" fill="#ffa64c"/>
        <circle cx="29" cy="27" r="4" fill="#ffcdac" stroke="none"/><circle cx="71" cy="27" r="4" fill="#ffcdac" stroke="none"/>
        <ellipse cx="50" cy="44" rx="29" ry="24" fill="#ffb254"/>
        <path d="M43 22l3 10 1-11 M53 21l1 11 4-10 M23 37l11 5-12-1 M22 48l11-2-9 7 M77 37l-11 5 12-1 M78 48l-11-2 9 7" fill="#624234" stroke="none"/>
        <ellipse cx="50" cy="55" rx="16" ry="10" fill="#fff0ce" stroke="none"/>
        <g fill="#3b2e25"><circle cx="40" cy="42" r="2"/><circle cx="60" cy="42" r="2"/></g>
        <path d="M45 50 Q50 48 55 50 L50 55Z" fill="#a96d59"/>
        <path d="M50 55q-3 6-8 3 M50 55q3 6 8 3" fill="none"/>
      </g>
    </svg>`,
  },
  lion: {
    name: "Львёнок",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M63 76 Q79 80 81 62" fill="none"/>
        <path d="M81 65 Q73 59 84 51 Q90 62 81 65Z" fill="#c47d42"/>
        <ellipse cx="50" cy="67" rx="20" ry="17" fill="#f5be59"/>
        <ellipse cx="37" cy="80" rx="10" ry="6" fill="#ffcf72"/><ellipse cx="63" cy="80" rx="10" ry="6" fill="#ffcf72"/>
        <path d="M50 16 Q61 9 66 20 Q79 17 78 31 Q89 36 80 46 Q86 59 73 61 Q71 74 58 69 Q50 78 42 69 Q29 74 27 61 Q14 59 20 46 Q11 36 22 31 Q21 17 34 20 Q39 9 50 16Z" fill="#d88a43"/>
        <circle cx="33" cy="32" r="7" fill="#ffd278"/><circle cx="67" cy="32" r="7" fill="#ffd278"/>
        <ellipse cx="50" cy="45" rx="22" ry="20" fill="#ffd278"/>
        <g fill="#3b2e25"><circle cx="40" cy="43" r="2"/><circle cx="60" cy="43" r="2"/></g>
        <ellipse cx="50" cy="54" rx="13" ry="8" fill="#fff0c6" stroke="none"/>
        <path d="M46 50 Q50 48 54 50 L50 54Z" fill="#97634d"/>
        <path d="M50 54q-3 5-7 3 M50 54q3 5 7 3" fill="none"/>
      </g>
    </svg>`,
  },
  raccoon: {
    name: "Енотёнок",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M59 72 Q69 72 76 56 C83 42 94 53 87 66 Q79 86 58 81Z" fill="#abbac2"/>
        <path d="M77 54l12 5 M72 65l11 6 M66 72l8 7" fill="none" stroke="#526174" stroke-width="4"/>
        <ellipse cx="47" cy="67" rx="20" ry="17" fill="#a4b6c0"/>
        <ellipse cx="34" cy="80" rx="9" ry="6" fill="#788893"/><ellipse cx="60" cy="80" rx="9" ry="6" fill="#788893"/>
        <path d="M23 36 Q19 24 24 16 Q34 17 40 26 Q49 23 57 26 Q63 17 74 16 Q78 26 72 37 L78 49 Q69 60 59 60 Q49 72 38 61 Q26 61 18 50Z" fill="#b9c6cb"/>
        <path d="M24 41 Q34 34 45 42 L42 51 Q30 57 23 47Z M72 41 Q62 34 51 42 L54 51 Q66 57 73 47Z" fill="#536271" stroke="none"/>
        <g fill="#fff6df" stroke="none"><circle cx="36" cy="44" r="4"/><circle cx="60" cy="44" r="4"/></g>
        <g fill="#3b2e25" stroke="none"><circle cx="36" cy="44" r="2.5"/><circle cx="60" cy="44" r="2.5"/></g>
        <ellipse cx="48" cy="55" rx="11" ry="8" fill="#fff2dc" stroke="none"/>
        <path d="M44 51 Q48 49 52 51 L48 55Z" fill="#495460"/>
        <path d="M44 58q4 4 8 0" fill="none"/>
      </g>
    </svg>`,
  },
  deer: {
    name: "Оленёнок",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <ellipse cx="50" cy="66" rx="19" ry="18" fill="#d99560"/>
        <ellipse cx="50" cy="69" rx="10" ry="12" fill="#ffe2b5" stroke="none"/>
        <ellipse cx="36" cy="80" rx="9" ry="6" fill="#b98260"/><ellipse cx="64" cy="80" rx="9" ry="6" fill="#b98260"/>
        <path d="M36 28 Q32 20 32 12 M33 21q-7-1-9-7 M64 28 Q68 20 68 12 M67 21q7-1 9-7" fill="none" stroke-width="4"/>
        <path d="M35 34 Q24 20 12 26 Q15 42 32 43Z M65 34 Q76 20 88 26 Q85 42 68 43Z" fill="#d99560"/>
        <path d="M29 37l-10-7 M71 37l10-7" fill="none" stroke="#f7b9a0"/>
        <path d="M50 24 C65 24 75 34 72 47 Q70 65 50 69 Q30 65 28 47 C25 34 35 24 50 24Z" fill="#e4a574"/>
        <g fill="#fff0ce" stroke="none"><ellipse cx="40" cy="34" rx="3" ry="2"/><ellipse cx="60" cy="34" rx="3" ry="2"/><ellipse cx="50" cy="30" rx="2" ry="3"/><ellipse cx="50" cy="57" rx="13" ry="9"/></g>
        <g fill="#3b2e25"><circle cx="39" cy="44" r="2"/><circle cx="61" cy="44" r="2"/></g>
        <ellipse cx="50" cy="53" rx="5" ry="3" fill="#785342"/>
        <path d="M45 60q5 4 10 0" fill="none"/>
      </g>
    </svg>`,
  },
} satisfies Record<string, { name: string; svg: string }>;
const from = (src: Record<string, { name: string; svg: string } | undefined>, id: string, name?: string): { name: string; svg: string } => {
  const a = src[id];
  if (!a) throw new Error(`no animal ${id}`);
  return { name: name ?? a.name, svg: a.svg };
};

// v29: the guests that had their own svg get a painted picture (tiger, lion, lamb …).
withArt(NEW_GUESTS);

export const ANIMALS = {
  squirrel: from(EXTRA, "squirrel", "Белочка"),
  hare: from(SHAPES, "rabbit", "Зайка"),
  sheep: from(SHAPES, "sheep", "Овечка"),
  dog: from(SHAPES, "dog", "Собачка"),
  cat: from(SHAPES, "cat", "Кошка"),
  bird: from(SHAPES, "bird", "Птичка"),
  bear: from(EXTRA, "bear", "Мишка"),
  hedgehog: from(EXTRA, "hedgehog", "Ёжик"),
  horse: from(EXTRA, "circusPony", "Лошадка"),
  mouse: from(SHAPES, "mouse", "Мышка"),
  chicken: from(SHAPES, "hen", "Курочка"),
  duck: from(SHAPES, "duck", "Уточка"),
  frog: from(SHAPES, "frog", "Лягушка"),
  owl: from(SHAPES, "owl", "Совушка"),
  turtle: from(SHAPES, "turtle", "Черепашка"),
  giraffe: from(SHAPES, "giraffe", "Жирафик"),
  ...NEW_GUESTS,
};
export type AnimalId = keyof typeof ANIMALS;

export const animalArt = (id: string): { name: string; svg: string } => ANIMALS[id as AnimalId] ?? OBJECTS[id as keyof typeof OBJECTS];
