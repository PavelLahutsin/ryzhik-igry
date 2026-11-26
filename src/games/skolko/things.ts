import { OBJECTS, type ObjectId } from "../../shared/objects";

/** v23: small things that count well (Astra, brief 23-3): alike, separate, compact. */
export const COUNT_THINGS = {
  ladybug: {
    name: "Божья коровка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M45 26 Q44 18 39 16 M55 26 Q56 18 61 16" fill="none"/>
        <ellipse cx="50" cy="31" rx="14" ry="11" fill="#564238"/>
        <ellipse cx="50" cy="56" rx="29" ry="30" fill="#ff685b"/>
        <path d="M50 27 V85" fill="none"/>
      </g>
      <g fill="#3b2e25">
        <circle cx="38" cy="44" r="5"/><circle cx="62" cy="44" r="5"/>
        <circle cx="33" cy="60" r="4"/><circle cx="67" cy="60" r="4"/>
        <circle cx="41" cy="72" r="4"/><circle cx="59" cy="72" r="4"/>
      </g>
    </svg>`,
  },
  acorn: {
    name: "Жёлудь",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M25 44 Q49 36 75 44 Q74 71 57 79 Q52 81 50 85 Q47 81 42 79 Q25 71 25 44Z" fill="#efa74f"/>
        <path d="M46 33 Q47 22 54 14 Q57 12 60 16 Q53 23 54 33Z" fill="#986240"/>
        <path d="M20 44 Q23 26 48 25 Q74 24 80 43 Q81 49 74 50 Q50 54 26 50 Q19 49 20 44Z" fill="#bb794b"/>
        <path d="M33 38 L37 35 M48 42 L52 39 M62 36 L65 38" fill="none"/>
      </g>
      <ellipse cx="36" cy="60" rx="3" ry="5" fill="#ffdb91"/>
    </svg>`,
  },
  button: {
    name: "Пуговица",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="50" cy="50" r="35" fill="#51c6bc"/>
        <circle cx="50" cy="50" r="26" fill="#92e3d4"/>
      </g>
      <g fill="#3b2e25">
        <circle cx="43" cy="43" r="4.5"/><circle cx="57" cy="43" r="4.5"/>
        <circle cx="43" cy="57" r="4.5"/><circle cx="57" cy="57" r="4.5"/>
      </g>
    </svg>`,
  },
  shell: {
    name: "Ракушка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M42 68 Q35 72 35 78 Q41 82 50 78 Q59 82 65 78 Q65 72 58 68Z" fill="#ee9982"/>
        <path d="M44 73 Q30 66 19 55 Q10 45 19 38 Q17 27 29 27 Q33 17 43 22 Q50 12 57 22 Q68 17 72 27 Q84 27 82 38 Q92 45 81 56 Q69 67 56 73 Q50 76 44 73Z" fill="#ffbea4"/>
        <path d="M24 43 Q34 56 42 63 M34 31 Q39 47 46 61 M50 27 V59 M66 31 Q61 47 54 61 M76 43 Q66 56 58 63" fill="none"/>
      </g>
    </svg>`,
  },
  butterfly: {
    name: "Бабочка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M49 49 C40 31 24 18 17 30 C10 42 22 55 33 57 C21 60 23 77 34 78 Q45 79 50 60 Q55 79 66 78 C77 77 79 60 67 57 C78 55 90 42 83 30 C76 18 60 31 51 49Z" fill="#c19af4"/>
        <path d="M49 40 Q48 30 42 26 M51 40 Q52 30 58 26" fill="none"/>
        <ellipse cx="50" cy="52" rx="5" ry="17" fill="#84563e"/>
      </g>
      <g fill="#ffe08c">
        <ellipse cx="30" cy="41" rx="6" ry="8" transform="rotate(-36 30 41)"/>
        <ellipse cx="70" cy="41" rx="6" ry="8" transform="rotate(36 70 41)"/>
        <circle cx="35" cy="66" r="4"/><circle cx="65" cy="66" r="4"/>
      </g>
    </svg>`,
  },
  strawberry: {
    name: "Клубничка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M50 32 C65 24 82 31 81 48 C80 65 61 84 50 85 C39 84 20 65 19 48 C18 31 35 24 50 32Z" fill="#ff6d76"/>
        <path d="M49 28 Q46 21 51 15 L56 17 Q52 22 54 28 Q66 24 73 31 Q66 31 60 37 L63 44 Q55 42 50 36 Q45 43 36 45 L40 36 Q33 32 27 32 Q34 24 49 28Z" fill="#7ac86d"/>
      </g>
      <g fill="#fff0ad">
        <ellipse cx="32" cy="50" rx="2.5" ry="4"/><ellipse cx="50" cy="48" rx="2.5" ry="4"/>
        <ellipse cx="68" cy="50" rx="2.5" ry="4"/><ellipse cx="40" cy="62" rx="2.5" ry="4"/>
        <ellipse cx="60" cy="62" rx="2.5" ry="4"/><ellipse cx="50" cy="73" rx="2.5" ry="4"/>
      </g>
    </svg>`,
  },
  cucumber: {
    name: "Огурец",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(40 50 50)" stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M49 14 C61 12 67 23 64 39 Q61 55 63 66 C65 79 58 87 48 86 C37 85 34 77 35 64 Q38 46 35 33 Q33 17 49 14Z" fill="#84d273"/>
        <path d="M47 22 Q42 24 43 33" fill="none"/>
      </g>
      <g transform="rotate(40 50 50)" fill="#47985b">
        <circle cx="55" cy="32" r="2.5"/><circle cx="46" cy="43" r="2.5"/>
        <circle cx="54" cy="55" r="2.5"/><circle cx="44" cy="66" r="2.5"/>
        <circle cx="53" cy="75" r="2.5"/>
      </g>
    </svg>`,
  },
  egg: {
    name: "Яйцо",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 C64 15 78 42 78 59 C78 76 66 85 50 85 C34 85 22 76 22 59 C22 42 36 15 50 15Z" fill="#ffdfa6" stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
      <ellipse cx="39" cy="38" rx="4" ry="9" transform="rotate(24 39 38)" fill="#fff4d9"/>
      <g fill="#cd965c">
        <circle cx="60" cy="66" r="2.5"/><circle cx="65" cy="59" r="1.8"/><circle cx="53" cy="70" r="1.8"/>
      </g>
    </svg>`,
  },
  snail: {
    name: "Улитка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M66 47 L63 33 M74 47 L79 35" fill="none"/>
        <path d="M18 66 Q29 67 37 58 L57 58 Q61 53 61 48 C60 38 76 38 80 47 Q85 58 75 68 Q69 76 56 76 L34 76 Q22 76 17 70 Q14 66 18 66Z" fill="#a6d882"/>
        <circle cx="40" cy="49" r="23" fill="#f3ae65"/>
        <path d="M27 58 C19 46 28 33 41 34 C54 34 60 48 52 57 C45 65 32 61 32 51 C32 43 43 40 46 47 Q48 53 41 53" fill="none"/>
      </g>
      <circle cx="74" cy="49" r="2.4" fill="#3b2e25"/>
    </svg>`,
  },
  candy: {
    name: "Конфета",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-15 50 50)" stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M33 47 L17 38 Q14 37 15 41 L17 49 L14 56 L17 63 L33 54Z M67 47 L83 38 Q86 37 85 41 L83 49 L86 56 L83 63 L67 54Z" fill="#ffb8cb"/>
        <rect x="29" y="32" width="42" height="36" rx="16" fill="#fa829e"/>
        <path d="M49 32 H59 L46 68 H40 Q38 68 36 66Z" fill="#ffe294"/>
      </g>
    </svg>`,
  },
  sock: {
    name: "Носочек",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(8 50 50)" stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M42 26 H69 V58 Q69 68 59 73 L43 81 C32 86 22 81 21 72 Q20 64 29 59 L42 52Z" fill="#81c9ef"/>
        <path d="M28 60 Q40 63 42 81 C32 86 22 81 21 72 Q20 65 28 60Z" fill="#ffcc75"/>
        <rect x="39" y="17" width="33" height="15" rx="4" fill="#ffcc75"/>
        <path d="M48 22 V27 M55 22 V27 M62 22 V27" fill="none"/>
      </g>
    </svg>`,
  },
  blueberry: {
    name: "Черничка",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M50 20 C70 17 85 33 85 52 C85 73 69 85 49 85 C29 85 15 71 15 52 C15 33 30 18 50 20Z" fill="#889ae6"/>
        <path d="M47 30 Q52 34 57 27 Q59 34 66 33 Q62 39 66 44 Q59 43 56 49 Q53 43 46 44 Q50 39 45 35Z" fill="#626cb6"/>
      </g>
      <ellipse cx="31" cy="45" rx="4" ry="8" transform="rotate(25 31 45)" fill="#cbd6ff"/>
    </svg>`,
  },
} satisfies Record<string, { name: string; svg: string }>;

export type CountThing = ObjectId | keyof typeof COUNT_THINGS;

export function countArt(id: string): { name: string; svg: string } {
  return (COUNT_THINGS as Record<string, { name: string; svg: string }>)[id] ?? OBJECTS[id as ObjectId];
}
