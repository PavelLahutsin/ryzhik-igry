/** v23 (Astra): «Веранда» — the scene with its own drawn back and props. */
import type { SceneDef } from "./scenes";

export const VERANDA: SceneDef = {
    id: "veranda",
    title: "Веранда",
    floor: 760,
    icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#3b2e25" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path fill="#e9ba83" d="M14 33h10v48H14zM76 33h10v48H76z"/>
        <path fill="#dc805e" d="M7 34 23 15h54l16 19z"/>
        <path fill="#f2cc92" d="M10 80h80v8H10z"/>
        <path fill="#83afaa" d="M31 61h39v7H31z"/>
        <path fill="none" d="M36 69v10m28-10v10"/>
        <path fill="none" d="M54 52q9-7 8 0-1 5-7 6"/>
        <path fill="#f2b553" d="m34 50 8 3q0-4 3-5h9q6 7 0 13H44q-4-2-5-6z"/>
        <path fill="#df9361" d="M43 48q5-8 12 0z"/>
      </g>
    </svg>`,
    back: (night: boolean) => `<svg viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <rect width="1600" height="1000" fill="${night ? "#445775" : "#c1e7e5"}"/>
      <g fill="${night ? "#f6dfa4" : "#fff0b1"}">
        <circle cx="891" cy="222" r="${night ? 30 : 42}"/>
        ${night ? '<circle cx="798" cy="188" r="4"/><circle cx="984" cy="253" r="4"/><circle cx="1240" cy="212" r="5"/><circle cx="1455" cy="291" r="4"/>' : ''}
      </g>
      <g stroke="#3b2e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path fill="${night ? "#566c74" : "#a9c8a2"}" d="M0 418Q230 299 451 392T900 381t420-18q159-37 280-8v370H0z"/>
        <path fill="${night ? "#475f62" : "#88b39b"}" d="M0 480q157-114 344-31t379-8q162-94 334-5t333-5q112-55 210-26v341H0z"/>
        <path fill="${night ? "#997561" : "#f0cc9f"}" fill-rule="evenodd" d="M0 120h450v640H0z M65 280v200h310V280z"/>
        <g fill="${night ? "#81655c" : "#d7a477"}">
          <path d="M455 547h1145v28H455zM455 699h1145v25H455z"/>
          <path d="M611 575h18v124h-18zM815 575h18v124h-18zM1019 575h18v124h-18zM1223 575h18v124h-18zM1427 575h18v124h-18z"/>
        </g>
        <path fill="${night ? "#a07c69" : "#e5bb8f"}" d="M0 747h1600v253H0z"/>
        <path fill="none" stroke="${night ? "#816458" : "#cfa478"}" d="M0 808h1600M0 896h1600M0 989h1600M304 748l-18 58m656 4-8 84m-736 4-24 89m1110-89 23 89"/>
        <g fill="${night ? "#936e5e" : "#d49a6f"}">
          <path d="M449 124h35v626h-35zM1520 109h42v641h-42z"/>
          <path d="M484 137h116L484 251v-38l70-76zm1036 0h-116l116 114v-38l-70-76z"/>
        </g>
        <path fill="${night ? "#86675f" : "#d99d79"}" d="M0 0h1600v112H0z"/>
        <path fill="none" stroke="${night ? "#735952" : "#ba8368"}" d="m128 0-48 109M435 0l-28 109M800 0v109M1165 0l28 109M1472 0l48 109"/>
        <path fill="${night ? "#af8772" : "#edbc8a"}" d="M0 110h1600v34H0z"/>
        <path fill="${night ? "#8e8482" : "#e6b3a1"}" d="M643 859q0-8 12-8h316q12 0 16 8l34 62q4 10-11 10H612q-14 0-9-10z"/>
        <path fill="none" stroke="${night ? "#655e62" : "#b87c70"}" d="m665 862-30 58m47-58-30 58m292-58 29 58m-46-58 29 58"/>
        <g fill="${night ? "#ba926e" : "#e6ba7c"}">
          <path d="m438 772 14 1-7 58h-13zm113 0 12-2 10 58h-13z"/>
          <path d="M435 762q-26-112 1-144 22-27 65-27t63 30q22 34-3 141z"/>
          <g fill="none" stroke="${night ? "#8c6f56" : "#b88958"}">
            <path d="M438 637q60-35 122 0m-125 20q65-34 129 0m-126 21q61-30 123 0m-121 20q58-23 118 0"/>
            <path d="m449 622 16 89m5-100 12 97m17-101v98m25-94-9 96m31-85-14 88"/>
          </g>
          <path fill="${night ? "#809a93" : "#9ccabd"}" d="M431 752q3-25 68-26t71 25q0 20-70 23t-69-22z"/>
          <path d="M425 750q67 29 148-2l-7 27q-62 23-133 2z"/>
          <path fill="none" d="M434 755q-22-12-22-40 0-17 12-17 16 0 24 36m113 18q21-18 21-41 0-15-11-15-14 1-21 36"/>
        </g>
      </g>
    </svg>`,
    props: [
      {
        id: "gardenwindow", name: "Окно в сад", x: 49, y: 264, w: 342, h: 232, tap: "curtains",
        art: (s) => `<svg viewBox="0 0 342 232" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#3b2e25" stroke-width="4" stroke-linejoin="round">
            <path fill="#e6b07c" fill-rule="evenodd" d="M5 5h332v216H5z M17 17v191h308V17z"/>
            <path fill="#efc999" d="M166 16h10v192h-10z"/>
            <path fill="#8fb8ba" d="${s.on
              ? "M16 17h65q-6 55-43 94l14 93q-19 9-36 0z M326 17h-65q6 55 43 94l-14 93q19 9 36 0z"
              : "M16 17h152v182q-19 16-38 4-20 13-39 0-20 13-39 0-17 12-36 0z M326 17H174v182q19 16 38 4 20 13 39 0 20 13 39 0 17 12 36 0z"}"/>
            <rect x="3" y="213" width="336" height="15" rx="6" fill="#ce956c"/>
          </g>
        </svg>`,
      },
      {
        id: "postlight", name: "Фонарь у столба", x: 1460, y: 245, w: 112, h: 168, tap: "lamp",
        art: (s) => `<svg viewBox="0 0 112 168" xmlns="http://www.w3.org/2000/svg">
          ${s.on ? '<ellipse cx="55" cy="97" rx="54" ry="68" fill="#ffe295" opacity=".58"/>' : ''}
          <g stroke="#3b2e25" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
            <path fill="none" d="M94 13H64q-10 0-10 12v14"/>
            <path fill="#557876" d="m17 62 37-27 37 27-3 7H21z"/>
            <path fill="${s.on ? "#ffe39a" : "#b5cdca"}" d="M24 70h61l-9 64H34z"/>
            <path fill="none" d="m39 71 4 59m27-59-4 59"/>
            <path fill="#557876" d="M31 132h47v9l-23 12-24-12z"/>
          </g>
        </svg>`,
      },
      {
        id: "breezebells", name: "Ветряной колокольчик", x: 634, y: 142, w: 128, h: 221, tap: "chime",
        art: () => `<svg viewBox="0 0 128 221" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#3b2e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
            <path fill="none" d="M64 2v18L15 59m49-39 48 39M27 68v37m37-37v60m36-60v42"/>
            <rect x="10" y="56" width="108" height="13" rx="6" fill="#bd885e"/>
            <rect x="19" y="102" width="16" height="52" rx="7" fill="#e5bb6e"/>
            <rect x="56" y="123" width="16" height="53" rx="7" fill="#87bbb4"/>
            <rect x="92" y="107" width="16" height="54" rx="7" fill="#db9376"/>
            <path fill="none" d="M64 176v13"/>
            <path fill="#e9bc73" d="M64 186q15 10 0 29-14-15 0-29z"/>
          </g>
        </svg>`,
      },
      {
        id: "leafbasket", name: "Подвесное кашпо", x: 1004, y: 143, w: 178, h: 226, tap: "sway",
        art: (s) => `<svg viewBox="0 0 178 226" xmlns="http://www.w3.org/2000/svg">
          <g transform="rotate(${s.n === 1 ? -9 : s.n === 2 ? 9 : 0} 89 5)" stroke="#3b2e25" stroke-width="4" stroke-linejoin="round">
            <path fill="none" d="M89 5 34 157m55-152 55 152"/>
            <g fill="#82ae86">
              <path d="M87 157q-40-1-46-53 40 1 46 53z"/>
              <path d="M87 154q-22-41 8-74 23 32-8 74z"/>
              <path d="M90 155q3-43 44-51-1 42-44 51z"/>
            </g>
            <path fill="#d88e71" d="M34 150h110q-5 53-55 56-48-3-55-56z"/>
            <rect x="31" y="147" width="116" height="15" rx="7" fill="#ebb18b"/>
            <path fill="none" d="M49 178q40 18 80 0"/>
          </g>
        </svg>`,
      },
      {
        id: "seedtray", name: "Кормушка с зёрнышками", x: 1252, y: 426, w: 176, h: 132, tap: "sprinkle",
        art: (s) => `<svg viewBox="0 0 176 132" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#3b2e25" stroke-width="4" stroke-linejoin="round">
            <path fill="#bf8b63" d="M60 89h13v36H60zm44 0h13v36h-13z"/>
            <path fill="#f0cd92" d="m7 77 21-37h121l20 37-12 16H18z"/>
            <g fill="#dba750" stroke-width="3.5">
              <ellipse cx="56" cy="64" rx="6" ry="4"/><ellipse cx="112" cy="56" rx="6" ry="4"/>
              ${s.n === 1 || s.n === 2 ? '<ellipse cx="80" cy="53" rx="6" ry="4"/><ellipse cx="129" cy="68" rx="6" ry="4"/><ellipse cx="93" cy="66" rx="6" ry="4"/>' : ''}
              ${s.n === 2 ? '<ellipse cx="41" cy="54" rx="6" ry="4"/><ellipse cx="69" cy="72" rx="6" ry="4"/><ellipse cx="133" cy="50" rx="6" ry="4"/><ellipse cx="97" cy="47" rx="6" ry="4"/>' : ''}
            </g>
            <path fill="#cb986a" d="M7 77h162l-8 22H16z"/>
          </g>
        </svg>`,
      },
      {
        id: "porchteapot", name: "Столик с чайником", x: 1025, y: 572, w: 348, h: 272, tap: "flap",
        art: (s) => `<svg viewBox="0 0 348 272" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#3b2e25" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
            <path fill="#b77f59" d="M41 132h20l-10 127H33zm248 0h18l10 127h-19z"/>
            <rect x="50" y="145" width="249" height="20" rx="7" fill="#d59e70"/>
            <path fill="#edc18b" d="M8 111q0-14 23-18h284q23 4 25 18v17q0 12-18 13H26q-18-1-18-13z"/>
            <path fill="#92c2ba" fill-rule="evenodd" d="M213 56q49-32 55 3 4 29-48 39l-3-13q39-9 37-23-1-16-34 6z"/>
            <path fill="#92c2ba" d="M154 53q-13 8-17 25-10 0-19-20l-22-3q7 12 11 27 8 23 34 23 8 17 45 17 50 0 52-29 2-23-21-40z"/>
            <ellipse cx="185" cy="53" rx="32" ry="7" fill="#526e69"/>
            <g transform="rotate(${s.on ? 32 : 0} 216 53)">
              <path fill="#e8ad67" d="M150 52q9-19 35-19t35 19q-34 10-70 0z"/>
              <circle cx="185" cy="31" r="7" fill="#c78657"/>
            </g>
            <path fill="#f7d38b" d="M169 89q10-18 22-2-6 12-22 2z"/>
          </g>
        </svg>`,
      },
    ],
    seats: [{ id: "wicker", x: 500, y: 780, pose: "sit" }],
    cast: [
      { id: "ryzhik", x: 720, y: 930 },
      { id: "ezhik", x: 420, y: 950 },
    ],
  };
