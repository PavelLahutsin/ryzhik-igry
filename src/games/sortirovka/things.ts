import { OBJECTS } from "../../shared/objects";
import { SHAPES } from "../teni/shapes";

/**
 * v13 «Собираемся»: things for the packing levels. Shared objects first,
 * then the coloured pictures from «Тени», then a few drawn here.
 */
const S = 'stroke="#3b2a20" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
export const STORY: Record<string, { name: string; svg: string }> = {
  towel: {
    name: "Полотенце",
    svg: `<svg viewBox="0 0 100 100"><path d="M24 22 H76 V80 H24 Z" fill="#7cc4e8" ${S}/><path d="M24 64 H76 M24 70 H76" stroke="#fff" stroke-width="4"/><path d="M20 22 H80" ${S}/></svg>`,
  },
  soap: {
    name: "Мыло",
    svg: `<svg viewBox="0 0 100 100"><circle cx="70" cy="30" r="7" fill="#e8f6ff" ${S}/><circle cx="82" cy="44" r="4" fill="#e8f6ff" ${S}/><rect x="20" y="46" width="60" height="32" rx="14" fill="#f7a8c8" ${S}/><path d="M32 56 Q40 52 48 56" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  },
  broom: {
    name: "Веник",
    svg: `<svg viewBox="0 0 100 100"><path d="M50 10 V44" stroke="#a86b3c" stroke-width="7" stroke-linecap="round"/><path d="M38 44 H62 L74 88 H26 Z" fill="#8bc46a" ${S}/><path d="M42 54 L36 84 M50 54 V86 M58 54 L64 84" stroke="#4e8a3a" stroke-width="3" stroke-linecap="round"/><path d="M38 46 H62" ${S}/></svg>`,
  },
  suitcase: {
    name: "Чемодан",
    svg: `<svg viewBox="0 0 100 100"><path d="M38 30 V20 H62 V30" fill="none" ${S}/><rect x="16" y="30" width="68" height="52" rx="8" fill="#e89a3a" ${S}/><path d="M16 50 H84" ${S}/><circle cx="30" cy="86" r="4" fill="#3b2a20"/><circle cx="70" cy="86" r="4" fill="#3b2a20"/></svg>`,
  },
  toothbrush: {
    name: "Зубная щётка",
    svg: `<svg viewBox="0 0 100 100"><path d="M18 78 L70 26" stroke="#3a8fd4" stroke-width="10" stroke-linecap="round"/><path d="M18 78 L70 26" stroke="#3b2a20" stroke-width="2" stroke-opacity=".25" stroke-linecap="round"/><rect x="62" y="12" width="24" height="16" rx="3" transform="rotate(-45 74 20)" fill="#fff" ${S}/></svg>`,
  },
};

/** Name and picture of any thing on the table or on a basket label. */
export function thingArt(id: string): { name: string; svg: string } {
  const o = OBJECTS[id as keyof typeof OBJECTS] ?? SHAPES[id] ?? STORY[id];
  if (!o) throw new Error(`no art for ${id}`);
  return o;
}
