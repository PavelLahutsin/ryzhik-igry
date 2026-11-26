/** v23 (Astra): «Чердак» — the scene with its own drawn back and props. */
import type { SceneDef } from "./scenes";

export const CHERDAK: SceneDef = {
    id: "cherdak",
    title: "Чердак",
    floor: 760,
    indoorLamp: "atticLamp",

    icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="4" stroke-linejoin="round">
        <path d="M9 63 L50 12 L91 63 L83 68 L50 28 L17 68 Z" fill="#d27654"/>
        <path d="M20 64 L50 28 L80 64 V86 H20 Z" fill="#efbf80"/>
        <circle cx="50" cy="61" r="17" fill="#ffe6aa"/>
        <circle cx="50" cy="61" r="11" fill="#8acbd3"/>
        <path d="M50 50 V72 M39 61 H61" fill="none" stroke-width="3.5"/>
      </g>
    </svg>`,

    back: (night: boolean) => `<svg viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <rect width="1600" height="1000" fill="${night ? "#595066" : "#edc795"}"/>
      <g fill="none" stroke="${night ? "#504759" : "#d9b381"}" stroke-width="4">
        <path d="M0 210 H1600 M0 330 H1600 M0 450 H1600 M0 570 H1600 M0 690 H1600"/>
        <path d="M350 210 V330 M1090 210 V330 M530 330 V450 M1330 330 V450 M280 450 V570 M970 450 V570 M620 570 V690"/>
      </g>
      <g fill="${night ? "#494355" : "#be8766"}" stroke="#3b2e25" stroke-width="5" stroke-linejoin="round">
        <path d="M0 0 H650 L0 359 Z M950 0 H1600 V359 Z"/>
        <path d="M0 325 L590 0 H664 L0 373 Z M936 0 H1010 L1600 325 V373 Z" fill="${night ? "#635364" : "#d59d75"}"/>
        <path d="M0 143 H1600 V179 H0 Z"/>
        <path d="M0 708 H1600 V743 H0 Z"/>
      </g>
      <circle cx="800" cy="363" r="124" fill="${night ? "#816a70" : "#d99f6b"}" stroke="#3b2e25" stroke-width="5"/>
      <circle cx="800" cy="363" r="106" fill="${night ? "#343953" : "#9cdeed"}" stroke="#3b2e25" stroke-width="4"/>
      ${night
        ? '<path d="M850 281 Q823 316 860 330 Q833 340 818 316 Q807 291 850 281 Z" fill="#ffe9aa"/><g fill="#fff1cb"><circle cx="762" cy="298" r="4"/><circle cx="732" cy="389" r="3"/><circle cx="855" cy="393" r="4"/></g>'
        : '<circle cx="844" cy="312" r="24" fill="#ffde80"/><path d="M713 382 Q716 369 730 371 Q741 347 759 365 Q778 361 783 382 Z" fill="#fff4dc"/>'}
      <g fill="${night ? "#907879" : "#e4b780"}" stroke="#3b2e25" stroke-width="4">
        <rect x="793" y="257" width="14" height="212" rx="4"/>
        <rect x="694" y="356" width="212" height="14" rx="4"/>
        <rect x="677" y="477" width="246" height="18" rx="8"/>
      </g>
      <path d="M0 744 H1600 V1000 H0 Z" fill="${night ? "#766475" : "#dca575"}"/>
      <g fill="none" stroke="${night ? "#635665" : "#bd895f"}" stroke-width="4">
        <path d="M0 791 H1600 M0 863 H1600 M0 957 H1600"/>
        <path d="M416 744 L392 791 M1060 744 L1083 791 M653 791 L639 863 M1320 791 L1368 863 M263 863 L198 957 M961 863 L988 957 M530 957 L514 1000"/>
      </g>
      <g fill="${night ? "#665866" : "#c48f65"}">
        <ellipse cx="241" cy="878" rx="150" ry="12"/>
        <ellipse cx="1036" cy="850" rx="97" ry="9"/>
        <ellipse cx="1380" cy="821" rx="119" ry="10"/>
      </g>
    </svg>`,

    props: [
      {
        id: "atticCase", name: "Чемодан с кармашком",
        x: 90, y: 714, w: 300, h: 170, tap: "flap",
        art: (s) =>
          `<svg viewBox="0 0 300 170" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <g stroke="#3b2e25" stroke-width="4.5" stroke-linejoin="round">
              <rect x="7" y="44" width="286" height="118" rx="21" fill="#77aaa1"/>
              <rect x="7" y="38" width="286" height="34" rx="15" fill="#a1c9b5"/>
              <path d="M33 40 H53 V160 H33 Z M247 40 H267 V160 H247 Z" fill="#dca366"/>
              <rect x="87" y="87" width="126" height="61" rx="14" fill="#527f7e"/>
              ${s.on
                ? '<path d="M95 113 L109 80 L133 95 L149 81 L175 118 Z" fill="#ffdc91"/><path d="M90 90 Q150 62 210 90 L195 58 Q149 42 105 58 Z" fill="#e5b97f"/><path d="M88 114 Q148 126 212 114 V133 Q212 147 198 147 H102 Q88 147 88 133 Z" fill="#ce9363"/>'
                : '<path d="M87 89 Q150 80 213 89 L203 113 Q150 133 97 113 Z" fill="#e5b97f"/><circle cx="150" cy="113" r="6" fill="#ffe39b"/>'}
            </g>
          </svg>`,
      },
      {
        id: "atticSpinner", name: "Бумажная вертушка",
        x: 113, y: 385, w: 200, h: 225, tap: "turn",
        art: (s) =>
          `<svg viewBox="0 0 200 225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <g stroke="#3b2e25" stroke-width="4.5" stroke-linejoin="round">
              <rect x="93" y="88" width="14" height="127" rx="6" fill="#c58d60"/>
              <rect x="74" y="189" width="52" height="17" rx="7" fill="#e4b97d"/>
              <g transform="rotate(${(s.n % 3) * 120} 100 90)">
                <path d="M100 90 L56 22 Q109 6 123 47 Z" fill="#ed9072"/>
                <path d="M100 90 L168 46 Q184 99 143 113 Z" fill="#ffd070"/>
                <path d="M100 90 L144 158 Q91 174 77 133 Z" fill="#80b8a2"/>
                <path d="M100 90 L32 134 Q16 81 57 67 Z" fill="#96bddd"/>
              </g>
              <circle cx="100" cy="90" r="11" fill="#ffe9af"/>
            </g>
          </svg>`,
      },
      {
        id: "atticLamp", name: "Подвесная лампа",
        x: 426, y: 165, w: 186, h: 222, tap: "lamp",
        art: (s) =>
          `<svg viewBox="0 0 186 222" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            ${s.on ? '<ellipse cx="93" cy="147" rx="90" ry="72" fill="#ffe4a0" opacity=".42"/>' : ''}
            <g stroke="#3b2e25" stroke-width="4.5" stroke-linejoin="round">
              <path d="M93 5 V83" fill="none"/>
              <rect x="80" y="4" width="26" height="11" rx="5" fill="#ba855a"/>
              <ellipse cx="93" cy="137" rx="25" ry="32" fill="${s.on ? "#fff4bb" : "#bdb8ab"}"/>
              <path d="M32 137 Q42 126 52 105 Q67 80 82 80 H104 Q126 82 135 105 Q145 126 154 137 Z" fill="#74aaa9"/>
              <rect x="27" y="132" width="132" height="12" rx="6" fill="#a1c8b7"/>
            </g>
            ${s.on ? '<path d="M93 181 V197 M61 172 L52 185 M125 172 L134 185" fill="none" stroke="#ffdd82" stroke-width="5" stroke-linecap="round"/>' : ''}
          </svg>`,
      },
      {
        id: "atticMap", name: "Свёрнутая карта",
        x: 970, y: 280, w: 264, h: 238, tap: "flap",
        art: (s) =>
          `<svg viewBox="0 0 264 238" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <g stroke="#3b2e25" stroke-width="4.5" stroke-linejoin="round">
              <path d="M26 54 L132 9 L238 54" fill="none"/>
              <circle cx="132" cy="9" r="6" fill="#b67c54"/>
              <rect x="10" y="49" width="244" height="14" rx="6" fill="#b38359"/>
              <path d="M25 58 H239 V${s.on ? 210 : 101} H25 Z" fill="#ffe1a3"/>
              ${s.on
                ? '<path d="M38 91 Q65 71 92 83 Q118 88 102 108 Q75 125 46 115 Z M139 143 Q170 115 211 132 Q235 153 205 171 Q163 188 139 164 Z" fill="#a5c79f" stroke="none"/><path d="M40 183 Q70 144 111 151 T172 112 Q183 91 218 84" fill="none" stroke="#79b6c4" stroke-width="10"/><circle cx="73" cy="97" r="6" fill="#da8865"/>'
                : '<path d="M113 60 H150 L144 92 L132 83 L119 92 Z" fill="#d98868"/>'}
              <rect x="17" y="${s.on ? 202 : 97}" width="230" height="25" rx="12" fill="#efbd7c"/>
            </g>
          </svg>`,
      },
      {
        id: "atticBells", name: "Колокольчики",
        x: 1340, y: 165, w: 168, h: 209, tap: "chime",
        art: () =>
          `<svg viewBox="0 0 168 209" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <g stroke="#3b2e25" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 58 L84 8 L145 58 M34 60 V100 M84 60 V146 M134 60 V112" fill="none"/>
              <circle cx="84" cy="9" r="6" fill="#bf895e"/>
              <rect x="12" y="54" width="144" height="13" rx="6" fill="#bd8e67"/>
              <g fill="#f8ca72">
                <circle cx="34" cy="139" r="7"/><circle cx="84" cy="187" r="8"/><circle cx="134" cy="151" r="7"/>
                <path d="M12 135 Q18 128 19 114 Q21 99 34 99 Q48 99 49 114 Q50 127 56 135 Z"/>
                <path d="M58 183 Q65 174 67 158 Q69 143 84 143 Q99 143 101 158 Q103 174 110 183 Z" fill="#e8a16f"/>
                <path d="M112 147 Q118 139 119 126 Q121 111 134 111 Q148 111 149 126 Q150 139 156 147 Z"/>
              </g>
            </g>
          </svg>`,
      },
      {
        id: "atticBlocks", name: "Коробка с кубиками",
        x: 928, y: 660, w: 220, h: 194, tap: "stack",
        art: (s) =>
          `<svg viewBox="0 0 220 194" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <g stroke="#3b2e25" stroke-width="4.5" stroke-linejoin="round">
              <path d="M8 132 L24 111 H198 L212 132 Z" fill="#ac805d"/>
              <rect x="33" y="88" width="48" height="48" rx="6" fill="#e79479"/>
              <g transform="translate(${s.n % 3 === 0 ? '83 88' : '33 40'})">
                <rect x="0" y="0" width="48" height="48" rx="6" fill="#8ec2be"/>
                <circle cx="24" cy="24" r="10" fill="#d7e4c5" stroke="none"/>
              </g>
              <g transform="translate(${s.n % 3 === 2 ? '83 40' : '134 88'})">
                <rect x="0" y="0" width="48" height="48" rx="6" fill="#f4c86f"/>
                <path d="M13 33 L24 12 L35 33 Z" fill="#d8925c" stroke="none"/>
              </g>
              ${s.n % 3 === 2 ? '<rect x="83" y="89" width="48" height="46" rx="6" fill="#b4afcf"/>' : ''}
              <path d="M8 131 H212 L201 184 H19 Z" fill="#cf9871"/>
              <rect x="84" y="144" width="52" height="10" rx="5" fill="#916b55"/>
            </g>
          </svg>`,
      },
      {
        id: "atticScope", name: "Подзорная труба",
        x: 1220, y: 525, w: 315, h: 300, tap: "turn",
        art: (s) =>
          `<svg viewBox="0 0 315 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <g stroke="#3b2e25" stroke-width="5" stroke-linejoin="round">
              <path d="M148 124 H169 L175 282 H157 Z" fill="#b8825e"/>
              <path d="M148 126 L160 132 L86 291 L70 291 Z M156 132 L169 125 L250 291 H232 Z" fill="#d29e70"/>
              <g transform="rotate(${[-20, -34, -7][s.n % 3]} 156 115)">
                <rect x="27" y="99" width="135" height="30" rx="6" fill="#e8bc76"/>
                <rect x="101" y="90" width="153" height="49" rx="9" fill="#72a9aa"/>
                <rect x="224" y="83" width="50" height="62" rx="8" fill="#e7b66b"/>
                <ellipse cx="273" cy="114" rx="11" ry="30" fill="#abdfdf"/>
                <path d="M274 96 Q270 102 270 111" fill="none" stroke="#f5f4d7" stroke-width="4" stroke-linecap="round"/>
                <rect x="19" y="95" width="15" height="39" rx="5" fill="#937958"/>
              </g>
              <circle cx="156" cy="132" r="14" fill="#edc681"/>
              <circle cx="156" cy="132" r="4" fill="#987555" stroke="none"/>
            </g>
          </svg>`,
      },
    ],

    seats: [{ id: "atticCase", x: 240, y: 760, pose: "sit" }],
    cast: [
      { id: "ryzhik", x: 567, y: 938 },
      { id: "belka", x: 790, y: 951 },
    ],
  };
