/**
 * v23: a small picture of the question next to the task bubble (Astra, brief 21-2),
 * so a child who can't read sees what is asked: the bigger one with rays, the
 * stairs going up, the odd one with rays. «oddOne» redrawn: Astra's looked like
 * a pattern (three dots and an empty place), the same as «nextOne».
 */
export const ASK_ICONS = {
  bigOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M65 20l-2-7 4 0z M85 27l3-7 3 3z M92 43l4-4 1 4z M86 71l7 4-3 3z M66 80l2 7h-4z M45 72l-3 7-3-3z M44 28l-7-4 3-3z"/>
      <g fill="#e8463a"><circle cx="18" cy="50" r="11"/><circle cx="65" cy="50" r="23"/></g>
    </g>
  </svg>`,
  smallOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M18 32l-2-7h4z M31 37l4-7 3 3z M35 50l5-2v4z M31 63l7 4-3 3z M18 68l2 7h-4z M6 64l-2 6-2-3z M6 36l-4-3 2-3z"/>
      <g fill="#e8463a"><circle cx="18" cy="50" r="11"/><circle cx="65" cy="50" r="23"/></g>
    </g>
  </svg>`,
  longOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M17 23l-6-5 3-2z M50 22l-2-8h4z M81 23l3-7 3 2z M18 50l-3 7-3-2z M50 50l2 8h-4z M81 50l6 5-3 2z"/>
      <path fill="#3a8fd4" d="M12 29h62v14H12q-4 0-4-4v-6q0-4 4-4z M33 65h24v14H33q-4 0-4-4v-6q0-4 4-4z"/>
      <path fill="#ffd59b" d="M74 29l17 7-17 7z M57 65l17 7-17 7z"/>
      <path fill="#3b2e25" d="M85 34l6 2-6 2z M68 70l6 2-6 2z"/>
    </g>
  </svg>`,
  shortOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M28 59l-7-3 2-3z M49 58l-2-8h4z M69 59l4-7 3 3z M28 85l-4 7-3-3z M49 86l2 8h-4z M69 85l7 4-3 3z"/>
      <path fill="#3a8fd4" d="M12 29h62v14H12q-4 0-4-4v-6q0-4 4-4z M33 65h24v14H33q-4 0-4-4v-6q0-4 4-4z"/>
      <path fill="#ffd59b" d="M74 29l17 7-17 7z M57 65l17 7-17 7z"/>
      <path fill="#3b2e25" d="M85 34l6 2-6 2z M68 70l6 2-6 2z"/>
    </g>
  </svg>`,
  tallOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M67 12l-2-8h4z M52 23l-7-4 3-3z M81 23l4-7 3 3z M46 43l-8-2 2-4z M87 43l6-6 2 4z M90 65l6-4 1 4z M67 88l2 7h-4z"/>
      <g fill="#a0683a"><rect x="19" y="68" width="9" height="13" rx="2"/><rect x="61" y="63" width="12" height="18" rx="2"/></g>
      <path fill="#3fae6a" d="M23 44l11 17h-5l9 12H9l9-12h-5z M67 18l15 26h-7l11 15h-8l12 13H44l12-13h-8l11-15h-7z"/>
    </g>
  </svg>`,
  lowOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M23 37l-2-8h4z M12 44l-7-4 3-3z M34 44l4-7 3 3z M8 59l-6-2 1-4z M38 59l5-6 2 4z M12 81l-4 7-3-3z M23 88l2 7h-4z M35 81l7 4-3 3z"/>
      <g fill="#a0683a"><rect x="19" y="68" width="9" height="13" rx="2"/><rect x="61" y="63" width="12" height="18" rx="2"/></g>
      <path fill="#3fae6a" d="M23 44l11 17h-5l9 12H9l9-12h-5z M67 18l15 26h-7l11 15h-8l12 13H44l12-13h-8l11-15h-7z"/>
    </g>
  </svg>`,
  thickOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M17 20l-6-5 3-2z M50 19l-2-8h4z M81 20l4-7 3 3z M17 57l-4 7-3-3z M50 58l2 7h-4z M81 57l7 4-3 3z"/>
      <g fill="#e8463a"><rect x="14" y="26" width="72" height="25" rx="6"/><rect x="14" y="72" width="72" height="11" rx="4"/></g>
      <g fill="#ffda83"><rect x="38" y="32" width="24" height="13" rx="3"/><path d="M25 27v23m50-23v23M25 73v9m50-9v9"/></g>
    </g>
  </svg>`,
  thinOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M17 66l-6-5 3-2z M50 65l-2-8h4z M81 66l4-7 3 3z M17 89l-4 7-3-3z M50 89l2 7h-4z M81 89l7 4-3 3z"/>
      <g fill="#e8463a"><rect x="14" y="26" width="72" height="25" rx="6"/><rect x="14" y="72" width="72" height="11" rx="4"/></g>
      <g fill="#ffda83"><rect x="38" y="32" width="24" height="13" rx="3"/><path d="M25 27v23m50-23v23M25 73v9m50-9v9"/></g>
    </g>
  </svg>`,
  stairsUp: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <rect x="9" y="70" width="27" height="17" rx="2" fill="#85c9ef"/>
      <rect x="36" y="55" width="27" height="32" rx="2" fill="#66badf"/>
      <rect x="63" y="39" width="27" height="48" rx="2" fill="#49a6d8"/>
      <path fill="#ff8a3d" d="M12 48l47-29-5-8 25-3-8 24-6-8-47 30z"/>
    </g>
  </svg>`,
  stairsDown: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <rect x="9" y="39" width="27" height="48" rx="2" fill="#49a6d8"/>
      <rect x="36" y="55" width="27" height="32" rx="2" fill="#66badf"/>
      <rect x="63" y="70" width="27" height="17" rx="2" fill="#85c9ef"/>
      <path fill="#ff8a3d" d="M17 9l50 30 5-8 9 24-26-2 6-8-50-30z"/>
    </g>
  </svg>`,
  oddOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#ffc94a" d="M84 43l-2-8h4z M72 47l-7-4 3-3z M96 47l4-7 3 3z M72 69l-7 4 3 3z M96 69l4 7 3-3z"/>
      <g fill="#3a8fd4"><circle cx="15" cy="58" r="10"/><circle cx="38" cy="58" r="10"/><circle cx="61" cy="58" r="10"/></g>
      <circle cx="84" cy="58" r="10" fill="#e8463a"/>
    </g>
  </svg>`,
  nextOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="11" cy="56" r="7.5" fill="#e8463a"/>
      <rect x="23" y="48.5" width="15" height="15" rx="1.5" fill="#3a8fd4"/>
      <circle cx="50" cy="56" r="7.5" fill="#e8463a"/>
      <rect x="62" y="48.5" width="15" height="15" rx="1.5" fill="#3a8fd4"/>
      <circle cx="89" cy="56" r="7.5" fill="none" stroke-dasharray="4 5"/>
      <path fill="#ffc94a" d="M84 26q5-4 10 0l-5 16z"/>
    </g>
  </svg>`,
  sameOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <rect x="24" y="5" width="52" height="42" rx="7" fill="#fff1ca"/>
      <path fill="#ffc94a" d="M50 10l5 11 13 1-10 9 3 12-11-6-11 6 3-12-10-9 13-1z"/>
      <path fill="#ff8a3d" d="M46 50h8v9h7L50 70 39 59h7z"/>
      <path fill="#ffc94a" d="M25 64l4 9 11 1-8 7 2 10-9-5-9 5 2-10-8-7 11-1z M75 64l4 9 11 1-8 7 2 10-9-5-9 5 2-10-8-7 11-1z"/>
    </g>
  </svg>`,
  fitOne: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
      <rect x="14" y="59" width="72" height="35" rx="8" fill="#edbd82"/>
      <path fill="#514238" d="M50 64l18 24H32z"/>
      <path fill="#3fae6a" d="M50 6l18 24H32z"/>
      <path fill="#ff8a3d" d="M46 36h8v9h7L50 56 39 45h7z"/>
    </g>
  </svg>`,
  plates: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path fill="#69b4d7" d="M3 49q4 17 21 17t21-17z M50 51q3 11 14 11t14-11z M80 53q3 7 9 7t9-7z"/>
      <g fill="#c3ecf4"><ellipse cx="24" cy="49" rx="21" ry="9"/><ellipse cx="64" cy="51" rx="14" ry="6"/><ellipse cx="89" cy="53" rx="9" ry="4"/></g>
    </g>
  </svg>`,
  dots3: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="50" cy="50" r="43" fill="#fff1cf"/>
      <g fill="#3a8fd4"><circle cx="32" cy="32" r="8"/><circle cx="50" cy="50" r="8"/><circle cx="68" cy="68" r="8"/></g>
    </g>
  </svg>`,
  dots4: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="50" cy="50" r="43" fill="#fff1cf"/>
      <g fill="#3a8fd4"><circle cx="32" cy="32" r="8"/><circle cx="68" cy="32" r="8"/><circle cx="32" cy="68" r="8"/><circle cx="68" cy="68" r="8"/></g>
    </g>
  </svg>`,
  dots5: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="50" cy="50" r="43" fill="#fff1cf"/>
      <g fill="#3a8fd4"><circle cx="32" cy="32" r="8"/><circle cx="68" cy="32" r="8"/><circle cx="50" cy="50" r="8"/><circle cx="32" cy="68" r="8"/><circle cx="68" cy="68" r="8"/></g>
    </g>
  </svg>`
} satisfies Record<string, string>;

export type AskIcon = keyof typeof ASK_ICONS;
