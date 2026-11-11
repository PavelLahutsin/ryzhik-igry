/** «Профессии» art, drawn in code. Scenes use a 1000 × 800 box, tools 100 × 100. */
const INK = "#3b2e25";
const O = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const o = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (body: string, vb = "0 0 100 100"): string => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const fx = (id: string, body: string, flash = false): string => `<g class="pr-fx${flash ? " pr-fx--flash" : ""}" data-fx="${id}">${body}</g>`;
const zone = (id: string, shape: string): string => shape.replace("<", `<`).replace(/^<(\w+)/, `<$1 class="pr-zone" data-zone="${id}"`);
const heart = (x: number, y: number, s = 1): string =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 10 C -26 -8 -14 -30 0 -16 C 14 -30 26 -8 0 10 Z" fill="#ef5b6b" stroke="${INK}" stroke-width="3"/>`;
const sparkle = (x: number, y: number, s = 1, c = "#ffd54a"): string =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z" fill="${c}"/>`;

// ---------------------------------------------------------------- tools

export const TOOLS: Record<string, { name: string; art: string }> = {
  thermo: {
    name: "Градусник",
    art: svg(`<g transform="rotate(-40 50 50)"><rect x="14" y="42" width="66" height="16" rx="8" fill="#fff" ${o}/><rect x="24" y="47" width="40" height="6" rx="3" fill="#e8463a"/><circle cx="82" cy="50" r="11" fill="#e8463a" ${o}/></g>`),
  },
  medicine: {
    name: "Сироп",
    art: svg(`<rect x="30" y="34" width="40" height="54" rx="10" fill="#e8708a" ${o}/><rect x="36" y="18" width="28" height="18" rx="4" fill="#fff" ${o}/><rect x="36" y="50" width="28" height="22" rx="4" fill="#fff"/><path d="M50 54 v14 M43 61 h14" stroke="#e8463a" stroke-width="4" stroke-linecap="round"/>`),
  },
  blanket: {
    name: "Одеяло",
    art: svg(`<path d="M12 26 Q50 14 88 26 L86 80 Q50 90 14 80 Z" fill="#ffb23f" ${o}/><path d="M20 44 Q50 36 80 44 M18 62 Q50 54 82 62" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
  },
  tea: {
    name: "Чай",
    art: svg(`<path d="M20 44 H70 V64 C70 82 20 82 20 64 Z" fill="#fff" ${o}/><path d="M70 50 C86 50 86 68 70 68" fill="none" ${o}/><ellipse cx="45" cy="46" rx="22" ry="4" fill="#c0392b"/><path d="M34 34 q-6 -8 0 -16 M48 34 q-6 -8 0 -16 M62 34 q-6 -8 0 -16" fill="none" stroke="#c9b8a3" stroke-width="3.5" stroke-linecap="round"/>`),
  },
  cotton: {
    name: "Ватка",
    art: svg(`<circle cx="40" cy="52" r="18" fill="#fff" ${o}/><circle cx="58" cy="44" r="18" fill="#fff" ${o}/><circle cx="62" cy="62" r="16" fill="#fff" ${o}/><circle cx="44" cy="66" r="14" fill="#fff" ${o}/><circle cx="50" cy="54" r="14" fill="#fff"/>`),
  },
  cream: {
    name: "Мазь",
    art: svg(`<path d="M24 30 L66 30 L80 74 L38 74 Z" fill="#6db3d4" ${o} transform="rotate(-20 50 52)"/><rect x="70" y="18" width="16" height="14" rx="3" fill="#fff" ${o} transform="rotate(-20 50 52)"/><path d="M38 52 H62" stroke="#fff" stroke-width="5" stroke-linecap="round" transform="rotate(-20 50 52)"/>`),
  },
  bandage: {
    name: "Бинт",
    art: svg(`<path d="M62 66 C78 70 86 80 84 94 L72 94 C74 84 70 78 60 76 Z" fill="#fff" ${o}/><path d="M26 28 V70 C26 80 66 80 66 70 V28" fill="#fff" ${o}/><ellipse cx="46" cy="28" rx="20" ry="8" fill="#f4efe6" ${o}/><ellipse cx="46" cy="28" rx="7" ry="3" fill="#d9cdbb"/><path d="M27 44 C34 50 58 50 65 44 M27 58 C34 64 58 64 65 58" fill="none" stroke="#e6dccd" stroke-width="3"/>`),
  },
  sticker: {
    name: "Наклейка",
    art: svg(`<circle cx="50" cy="50" r="38" fill="#fff" ${o}/><path d="M50 22 L58 42 L80 42 L62 56 L69 77 L50 64 L31 77 L38 56 L20 42 L42 42 Z" fill="#ffd54a" ${o}/>`),
  },
  light: {
    name: "Фонарик",
    art: svg(`<rect x="16" y="40" width="46" height="22" rx="6" fill="#6db3d4" ${o}/><path d="M62 36 L80 28 V74 L62 66 Z" fill="#9fd3ea" ${o}/><path d="M84 40 L96 34 M84 51 H98 M84 62 L96 68" stroke="#ffc94a" stroke-width="4" stroke-linecap="round"/>`),
  },
  spray: {
    name: "Спрей",
    art: svg(`<rect x="32" y="40" width="34" height="48" rx="8" fill="#7cc46a" ${o}/><rect x="40" y="24" width="18" height="18" rx="3" fill="#fff" ${o}/><path d="M58 30 H76" ${o}/><circle cx="84" cy="24" r="3" fill="#9fd3ea"/><circle cx="88" cy="32" r="3" fill="#9fd3ea"/><circle cx="84" cy="38" r="3" fill="#9fd3ea"/>`),
  },
  scarf: {
    name: "Шарф",
    art: svg(`<path d="M14 34 Q50 52 86 34 L88 50 Q50 70 12 50 Z" fill="#e8463a" ${o}/><path d="M56 56 L60 90 L76 88 L70 52" fill="#e8463a" ${o}/><path d="M60 72 L74 70 M61 80 L75 78" stroke="#fff" stroke-width="4"/>`),
  },
  honey: {
    name: "Молоко с мёдом",
    art: svg(`<path d="M22 40 H68 V66 C68 84 22 84 22 66 Z" fill="#fff" ${o}/><path d="M68 48 C84 48 84 66 68 66" fill="none" ${o}/><ellipse cx="45" cy="42" rx="20" ry="4" fill="#f5a623"/><path d="M32 30 q-5 -8 0 -14 M46 30 q-5 -8 0 -14 M60 30 q-5 -8 0 -14" fill="none" stroke="#c9b8a3" stroke-width="3.5" stroke-linecap="round"/>`),
  },
  hose: {
    name: "Шланг",
    art: svg(`<circle cx="46" cy="52" r="30" fill="none" stroke="${INK}" stroke-width="16"/><circle cx="46" cy="52" r="30" fill="none" stroke="#e9cf7a" stroke-width="10"/><circle cx="46" cy="52" r="12" fill="#c9302c" ${o}/><path d="M74 60 L92 70" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M74 60 L92 70" stroke="#b0b8c0" stroke-width="8" stroke-linecap="round"/>`),
  },
  water: {
    name: "Вода",
    art: svg(`<path d="M18 74 L56 40" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M18 74 L56 40" stroke="#e9cf7a" stroke-width="11" stroke-linecap="round"/><path d="M52 44 L68 28" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M52 44 L68 28" stroke="#b0b8c0" stroke-width="8" stroke-linecap="round"/><circle cx="80" cy="18" r="5" fill="#6db3d4"/><circle cx="88" cy="28" r="4" fill="#6db3d4"/><circle cx="76" cy="30" r="3.5" fill="#6db3d4"/>`),
  },
  ladder: {
    name: "Лестница",
    art: svg(`<path d="M30 92 L46 8 M58 92 L74 8" ${O} stroke-width="6"/><path d="M33 76 H61 M36 58 H64 M40 40 H68 M43 22 H71" stroke="#c9302c" stroke-width="6" stroke-linecap="round"/>`),
  },
  glove: {
    name: "Перчатки",
    art: svg(`<path d="M30 88 V44 C30 36 40 36 40 44 V30 C40 22 50 22 50 30 V26 C50 18 60 18 60 26 V34 C60 28 70 28 70 36 V62 C70 78 62 88 50 88 Z" fill="#ffb23f" ${o}/><path d="M30 56 C20 50 14 58 22 66 L32 76" fill="#ffb23f" ${o}/><rect x="28" y="80" width="44" height="12" rx="4" fill="#c9302c" ${o}/>`),
  },
  milk: {
    name: "Молочко",
    art: svg(`<path d="M14 52 H86 C84 76 68 86 50 86 C32 86 16 76 14 52 Z" fill="#6db3d4" ${o}/><ellipse cx="50" cy="52" rx="36" ry="9" fill="#fff" ${o}/>`),
  },
  bucket: {
    name: "Ведро",
    art: svg(`<path d="M22 36 H78 L70 88 H30 Z" fill="#c9302c" ${o}/><ellipse cx="50" cy="36" rx="28" ry="7" fill="#6db3d4" ${o}/><path d="M24 36 C24 6 76 6 76 36" fill="none" ${o}/>`),
  },
  shovel: {
    name: "Лопата",
    art: svg(`<path d="M66 12 L44 56" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M66 12 L44 56" stroke="#c48a4a" stroke-width="5" stroke-linecap="round"/><path d="M32 52 L58 64 L50 86 C44 94 26 88 22 80 Z" fill="#b0b8c0" ${o}/><path d="M60 8 H74" ${O} stroke-width="6"/>`),
  },
};

// ---------------------------------------------------------------- clinic + patients

export type PatientKind = "zayka" | "kotik" | "mishka";

const FUR: Record<PatientKind, string> = { zayka: "#f3eee8", kotik: "#ffa552", mishka: "#b98252" };
const LIGHT: Record<PatientKind, string> = { zayka: "#ffffff", kotik: "#ffe0c4", mishka: "#e8c9a3" };

function ears(k: PatientKind, f: string): string {
  if (k === "zayka")
    return `<g transform="rotate(-12 575 230)"><ellipse cx="575" cy="170" rx="32" ry="90" fill="${f}" ${O}/><ellipse cx="575" cy="178" rx="15" ry="62" fill="#f6b8c4"/></g><g transform="rotate(14 665 230)"><ellipse cx="665" cy="170" rx="32" ry="90" fill="${f}" ${O}/><ellipse cx="665" cy="178" rx="15" ry="62" fill="#f6b8c4"/></g>`;
  if (k === "kotik")
    return `<path d="M522 300 L536 182 L606 240 Z" fill="${f}" ${O}/><path d="M540 270 L546 210 L582 240 Z" fill="#ffc6a8"/><path d="M718 300 L704 182 L634 240 Z" fill="${f}" ${O}/><path d="M700 270 L694 210 L658 240 Z" fill="#ffc6a8"/>`;
  return `<circle cx="536" cy="246" r="38" fill="${f}" ${O}/><circle cx="536" cy="246" r="20" fill="#e8c9a3"/><circle cx="704" cy="246" r="38" fill="${f}" ${O}/><circle cx="704" cy="246" r="20" fill="#e8c9a3"/>`;
}

function patient(k: PatientKind): string {
  const f = FUR[k];
  const l = LIGHT[k];
  const whiskers =
    k === "kotik" ? `<path d="M560 372 L512 362 M560 384 L514 392 M680 372 L728 362 M680 384 L726 392" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` : "";
  return `<g class="pr-patient is-sad">
    ${ears(k, f)}
    <ellipse cx="620" cy="548" rx="125" ry="115" fill="${f}" ${O}/>
    <ellipse cx="620" cy="568" rx="72" ry="72" fill="${l}"/>
    <ellipse cx="506" cy="560" rx="30" ry="56" fill="${f}" ${O} transform="rotate(22 506 560)"/>
    <path d="M708 548 L762 484" stroke="${INK}" stroke-width="60" stroke-linecap="round"/>
    <path d="M708 548 L762 484" stroke="${f}" stroke-width="52" stroke-linecap="round"/>
    <circle cx="764" cy="480" r="16" fill="${l}"/>
    <circle cx="620" cy="330" r="110" fill="${f}" ${O}/>
    <ellipse cx="620" cy="378" rx="52" ry="38" fill="${l}"/>
    ${whiskers}
    <g class="pr-cheeks"><circle cx="562" cy="372" r="18" fill="#ff6b6b" opacity=".55"/><circle cx="678" cy="372" r="18" fill="#ff6b6b" opacity=".55"/></g>
    <g class="pr-eyes"><circle cx="582" cy="318" r="11" fill="${INK}"/><circle cx="586" cy="314" r="3.5" fill="#fff"/><circle cx="658" cy="318" r="11" fill="${INK}"/><circle cx="662" cy="314" r="3.5" fill="#fff"/></g>
    <path class="pr-brow" d="M560 300 L598 288 M680 300 L642 288" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="620" cy="356" rx="12" ry="9" fill="${k === "zayka" ? "#f08aa0" : INK}"/>
    <path class="pr-mouth pr-mouth--sad" d="M600 392 Q620 376 640 392" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
    <path class="pr-mouth pr-mouth--happy" d="M594 378 Q620 410 646 378 Z" fill="#c94a5a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <g class="pr-mouth pr-mouth--open"><ellipse cx="620" cy="392" rx="20" ry="24" fill="#8a2f3a" ${o}/><ellipse cx="620" cy="404" rx="11" ry="7" fill="#e8708a"/></g>
  </g>`;
}

function clinic(): string {
  return `<rect width="1000" height="800" fill="#e6f3f6"/>
  <rect y="610" width="1000" height="190" fill="#e2cfb2"/><path d="M0 610 H1000" stroke="${INK}" stroke-width="4" opacity=".15"/>
  <rect x="60" y="80" width="210" height="180" rx="16" fill="#bfe6f5" ${O}/><path d="M165 80 V260 M60 170 H270" stroke="${INK}" stroke-width="4"/>
  <path d="M40 66 H290" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M48 70 C80 140 60 220 44 290 L96 290 C110 200 104 120 96 70 Z M282 70 C250 140 270 220 286 290 L234 290 C220 200 226 120 234 70 Z" fill="#ff9d7a" ${o}/>
  <g transform="translate(880 120)"><circle r="58" fill="#fff" ${O}/><path d="M-14 -38 H14 V-14 H38 V14 H14 V38 H-14 V14 H-38 V-14 H-14 Z" fill="#e8463a"/></g>
  <g transform="translate(150 470)"><rect x="-70" y="-20" width="140" height="140" rx="16" fill="#fff" ${O}/><path d="M-70 30 H70" stroke="${INK}" stroke-width="4"/><rect x="-28" y="-40" width="56" height="24" rx="10" fill="none" ${O}/><path d="M-12 60 H12 M0 48 V72" stroke="#e8463a" stroke-width="8" stroke-linecap="round"/></g>
  <rect x="410" y="300" width="420" height="330" rx="34" fill="#8fc7e8" ${O}/><rect x="440" y="330" width="360" height="40" rx="14" fill="#fff" opacity=".35"/>`;
}

function bedFront(): string {
  return `<rect x="370" y="596" width="500" height="74" rx="22" fill="#fff" ${O}/><rect x="386" y="666" width="22" height="70" rx="6" fill="#8fc7e8" ${O}/><rect x="832" y="666" width="22" height="70" rx="6" fill="#8fc7e8" ${O}/>`;
}

function doctorFx(): string {
  return [
    fx("sweat", `<path d="M552 262 q-10 16 0 22 q10 -6 0 -22 Z M690 256 q-10 16 0 22 q10 -6 0 -22 Z" fill="#9fd3ea" ${o}/>`),
    fx("scratch", `<g data-life="paw"><path d="M744 466 L776 494 M736 480 L766 506 M756 456 L784 480" stroke="#d6303a" stroke-width="5" stroke-linecap="round"/></g>`),
    fx(
      "thermo",
      `<g transform="rotate(-24 636 392)"><rect x="632" y="384" width="120" height="17" rx="8.5" fill="#fff" ${o}/><rect x="650" y="389" width="66" height="7" rx="3.5" fill="#e8463a"/><circle cx="752" cy="392" r="12" fill="#e8463a" ${o}/></g>` +
        `<g transform="translate(830 250)"><rect x="-82" y="-36" width="164" height="66" rx="22" fill="#fff" ${O}/><text x="0" y="10" text-anchor="middle" font-size="38" font-weight="800" font-family="system-ui, sans-serif" fill="#e8463a">38,5°</text></g>`,
    ),
    fx("medicine", `<path d="M580 404 L470 470" stroke="#b0b8c0" stroke-width="12" stroke-linecap="round"/><ellipse cx="596" cy="398" rx="30" ry="16" fill="#e0e4e8" ${o}/><ellipse cx="596" cy="396" rx="19" ry="8" fill="#e8708a"/>`, true),
    fx("blanket", `<path d="M398 534 Q620 486 842 534 L858 668 L382 668 Z" fill="#ffb23f" ${O}/><path d="M420 574 Q620 534 820 574 M410 622 Q620 584 832 622" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>`),
    fx("tea", `<g transform="translate(700 410)"><path d="M-36 -10 H36 V12 C36 40 -36 40 -36 12 Z" fill="#fff" ${O}/><ellipse cx="0" cy="-10" rx="36" ry="7" fill="#c0392b" ${o}/><path d="M-14 -24 q-8 -12 0 -24 M10 -24 q-8 -12 0 -24" fill="none" stroke="#c9b8a3" stroke-width="5" stroke-linecap="round"/></g>`, true),
    fx("honey", `<g transform="translate(700 410)"><path d="M-36 -10 H36 V12 C36 40 -36 40 -36 12 Z" fill="#fff" ${O}/><ellipse cx="0" cy="-10" rx="36" ry="7" fill="#f5a623" ${o}/><path d="M-14 -24 q-8 -12 0 -24 M10 -24 q-8 -12 0 -24" fill="none" stroke="#c9b8a3" stroke-width="5" stroke-linecap="round"/></g>`, true),
    fx("clean", `${sparkle(752, 470, 1.2, "#9fd3ea")}${sparkle(786, 500, 0.8, "#9fd3ea")}${sparkle(730, 500, 0.7, "#9fd3ea")}`, true),
    fx("cream", `<path d="M740 470 C750 456 776 458 782 474 C786 490 760 500 746 492 C736 486 734 478 740 470 Z" fill="#fff" opacity=".85" ${o}/>`, true),
    fx("bandage", `<g transform="rotate(-48 764 482)"><rect x="728" y="464" width="72" height="36" rx="12" fill="#fff" ${O}/><path d="M748 466 V498 M764 466 V498 M780 466 V498" stroke="#e6dccd" stroke-width="3"/></g>`),
    fx("sticker", `<circle cx="620" cy="574" r="34" fill="#fff" ${O}/><path d="M620 548 L627 566 L646 566 L631 578 L637 597 L620 586 L603 597 L609 578 L594 566 L613 566 Z" fill="#ffd54a" ${o}/>`),
    fx("light", `<path d="M470 470 L598 372 L640 410 Z" fill="#fff4a8" opacity=".85"/><g transform="translate(440 486) rotate(-38)"><rect x="-40" y="-14" width="60" height="28" rx="6" fill="#6db3d4" ${O}/><path d="M20 -18 L40 -26 V26 L20 18 Z" fill="#9fd3ea" ${O}/></g>`, true),
    fx("spray", `<circle cx="604" cy="384" r="14" fill="#cfeaf5"/><circle cx="636" cy="378" r="10" fill="#cfeaf5"/><circle cx="620" cy="404" r="12" fill="#cfeaf5"/><circle cx="650" cy="398" r="8" fill="#cfeaf5"/>`, true),
    fx("scarf", `<path d="M528 424 Q620 470 712 424 L720 462 Q620 510 520 462 Z" fill="#e8463a" ${O}/><path d="M652 460 L662 560 L700 556 L688 452" fill="#e8463a" ${O}/><path d="M660 506 L694 502 M662 530 L696 526 M548 438 L556 474 M600 456 L602 490" stroke="#fff" stroke-width="7"/>`),
    fx("hearts", `${heart(560, 150, 1.4)}${heart(690, 128, 1.1)}${heart(800, 190, 1.2)}`, true),
  ].join("");
}

function doctorZones(): string {
  return [
    zone("mouth", `<ellipse cx="620" cy="384" rx="62" ry="48"/>`),
    zone("forehead", `<ellipse cx="620" cy="270" rx="90" ry="50"/>`),
    zone("neck", `<rect x="520" y="430" width="200" height="56" rx="20"/>`),
    zone("paw", `<circle cx="764" cy="482" r="66"/>`),
    zone("body", `<ellipse cx="620" cy="584" rx="170" ry="100"/>`),
  ].join("");
}

export function clinicScene(k: PatientKind): string {
  return svg(`${clinic()}${patient(k)}${bedFront()}${doctorFx()}${doctorZones()}`, "0 0 1000 800");
}

// ---------------------------------------------------------------- firefighters

function sky(ground = "#8fd06f"): string {
  return `<defs><linearGradient id="pr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f2"/><stop offset="1" stop-color="#e3f5fb"/></linearGradient></defs>
  <rect width="1000" height="800" fill="url(#pr-sky)"/><circle cx="110" cy="100" r="46" fill="#ffd54a"/>
  <g fill="#fff"><ellipse cx="330" cy="110" rx="70" ry="26"/><ellipse cx="380" cy="94" rx="44" ry="28"/><ellipse cx="760" cy="80" rx="60" ry="22"/></g>
  <path d="M0 610 Q250 584 500 604 T1000 596 V800 H0 Z" fill="${ground}"/>`;
}

function flame(id: string, x: number, y: number, s: number): string {
  return `<g class="pr-fire" data-life="${id}" transform="translate(${x} ${y}) scale(${s})"><g class="pr-fire__body">
    <path d="M0 0 C-58 0 -64 -52 -40 -86 C-34 -60 -20 -58 -18 -70 C-22 -104 0 -130 12 -150 C14 -114 52 -100 48 -56 C58 -66 60 -78 58 -86 C82 -54 66 0 0 0 Z" fill="#f04a2a" ${O}/>
    <path d="M0 -6 C-36 -6 -40 -40 -22 -60 C-14 -44 -4 -48 -4 -60 C2 -80 16 -90 20 -100 C24 -70 44 -56 36 -30 C34 -14 22 -6 0 -6 Z" fill="#ff9d2a"/>
    <path d="M2 -10 C-16 -10 -18 -30 -6 -42 C0 -34 6 -40 8 -50 C18 -40 24 -26 18 -18 C14 -12 10 -10 2 -10 Z" fill="#ffe066"/>
  </g><g class="pr-fire__smoke"><circle cx="-10" cy="-40" r="22" fill="#b8bec6"/><circle cx="14" cy="-70" r="18" fill="#cfd4da"/><circle cx="-4" cy="-100" r="14" fill="#e2e6ea"/></g></g>`;
}

function truck(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="40" width="290" height="110" rx="14" fill="#e8463a" ${O}/>
    <path d="M290 70 H350 L384 112 V150 H290 Z" fill="#e8463a" ${O}/><path d="M300 80 H344 L366 110 H300 Z" fill="#cdeefb" ${o}/>
    <path d="M20 26 L260 26 M20 6 L260 6 M40 6 V26 M80 6 V26 M120 6 V26 M160 6 V26 M200 6 V26 M240 6 V26" stroke="#b0b8c0" stroke-width="8" stroke-linecap="round"/>
    <rect x="22" y="66" width="70" height="44" rx="8" fill="#ffd54a" ${o}/><rect x="110" y="66" width="70" height="44" rx="8" fill="#ffd54a" ${o}/><rect x="198" y="66" width="70" height="44" rx="8" fill="#ffd54a" ${o}/>
    <rect x="0" y="120" width="384" height="12" fill="#fff" opacity=".7"/>
    <circle cx="70" cy="152" r="32" fill="${INK}"/><circle cx="70" cy="152" r="12" fill="#b0b8c0"/><circle cx="310" cy="152" r="32" fill="${INK}"/><circle cx="310" cy="152" r="12" fill="#b0b8c0"/>
    <rect class="pr-siren pr-siren--a" x="304" y="54" width="22" height="16" rx="5" fill="#3a8fd4" ${o}/><rect class="pr-siren pr-siren--b" x="330" y="54" width="22" height="16" rx="5" fill="#e8463a" ${o}/>
  </g>`;
}

export function houseFireScene(): string {
  const house = `<rect x="560" y="380" width="320" height="250" fill="#ffe0a8" ${O}/>
    <path d="M526 396 L720 220 L914 396 Z" fill="#e8463a" ${O}/>
    <rect x="596" y="440" width="96" height="84" rx="8" fill="#9fd3ea" ${O}/><path d="M644 440 V524 M596 482 H692" stroke="${INK}" stroke-width="4"/>
    <rect x="756" y="440" width="96" height="84" rx="8" fill="#9fd3ea" ${O}/><path d="M804 440 V524 M756 482 H852" stroke="${INK}" stroke-width="4"/>
    <rect x="694" y="540" width="56" height="90" rx="6" fill="#9a6a3a" ${O}/>
    <g class="pr-soot" data-soot="fire-a"><ellipse cx="660" cy="320" rx="50" ry="22" fill="${INK}" opacity=".25"/></g>
    <g class="pr-soot" data-soot="fire-b"><ellipse cx="644" cy="450" rx="44" ry="16" fill="${INK}" opacity=".25"/></g>
    <g class="pr-soot" data-soot="fire-c"><ellipse cx="804" cy="450" rx="44" ry="16" fill="${INK}" opacity=".25"/></g>`;
  const hydrant = `<g transform="translate(470 690)"><rect x="-22" y="-60" width="44" height="64" rx="10" fill="#e8463a" ${O}/><rect x="-32" y="-44" width="64" height="16" rx="6" fill="#c9302c" ${o}/><path d="M-22 -60 C-22 -84 22 -84 22 -60" fill="#e8463a" ${O}/><rect x="-30" y="2" width="60" height="12" rx="4" fill="#c9302c" ${o}/></g>`;
  const hose = fx("hose", `<path d="M316 690 C360 760 420 760 448 666" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M316 690 C360 760 420 760 448 666" fill="none" stroke="#e9cf7a" stroke-width="14" stroke-linecap="round"/>`);
  return svg(
    `${sky()}<path d="M0 700 H1000" stroke="#c9b8a3" stroke-width="60" opacity=".55"/>${house}${flame("fire-a", 660, 330, 1)}${flame("fire-b", 644, 486, 0.8)}${flame("fire-c", 804, 486, 0.8)}${truck(-40, 560)}${hydrant}${hose}
    ${fx("hearts", `${heart(640, 200, 1.3)}${heart(780, 170, 1.1)}`, true)}
    ${zone("hydrant", `<circle cx="470" cy="660" r="66"/>`)}${zone("fire-a", `<circle cx="660" cy="270" r="84"/>`)}${zone("fire-b", `<circle cx="644" cy="450" r="66"/>`)}${zone("fire-c", `<circle cx="804" cy="450" r="66"/>`)}`,
    "0 0 1000 800",
  );
}

function kitten(): string {
  const f = "#9aa3ad";
  return `<path d="M30 40 C70 40 74 0 60 -10" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M30 40 C70 40 74 0 60 -10" fill="none" stroke="${f}" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="0" cy="40" rx="40" ry="32" fill="${f}" ${O}/>
    <path d="M-34 -10 L-30 -58 L-4 -34 Z M34 -10 L30 -58 L4 -34 Z" fill="${f}" ${O}/>
    <circle cx="0" cy="-8" r="38" fill="${f}" ${O}/>
    <circle cx="-14" cy="-12" r="6" fill="${INK}"/><circle cx="14" cy="-12" r="6" fill="${INK}"/><ellipse cx="0" cy="2" rx="6" ry="4" fill="#f08aa0"/>
    <path class="pr-mouth pr-mouth--sad" d="M-8 16 Q0 8 8 16" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <path class="pr-mouth pr-mouth--happy" d="M-10 10 Q0 22 10 10" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M-20 4 L-44 0 M-20 10 L-42 14 M20 4 L44 0 M20 10 L42 14" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
}

function ladderArt(): string {
  const a = { x: 470, y: 760 };
  const b = { x: 700, y: 300 };
  const off = 46;
  let rungs = "";
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    rungs += `<path d="M${x} ${y} L${x + off} ${y + 10}" stroke="#c9302c" stroke-width="9" stroke-linecap="round"/>`;
  }
  return `<path d="M${a.x} ${a.y} L${b.x} ${b.y} M${a.x + off} ${a.y + 10} L${b.x + off} ${b.y + 10}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M${a.x} ${a.y} L${b.x} ${b.y} M${a.x + off} ${a.y + 10} L${b.x + off} ${b.y + 10}" stroke="#b0b8c0" stroke-width="7" stroke-linecap="round"/>${rungs}`;
}

export function catTreeScene(): string {
  const tree = `<path d="M600 700 C610 560 600 420 610 300 L670 300 C680 420 670 560 690 700 Z" fill="#9a6a3a" ${O}/>
    <path d="M660 330 C720 300 760 300 820 290" stroke="${INK}" stroke-width="28" stroke-linecap="round"/><path d="M660 330 C720 300 760 300 820 290" stroke="#9a6a3a" stroke-width="20" stroke-linecap="round"/>
    <g fill="#5fae4e" ${O}><circle cx="560" cy="210" r="110"/><circle cx="720" cy="160" r="120"/><circle cx="850" cy="230" r="90"/><circle cx="660" cy="250" r="90"/></g>
    <g fill="#7cc46a"><circle cx="540" cy="190" r="60"/><circle cx="720" cy="130" r="64"/><circle cx="850" cy="210" r="44"/></g>
    <g fill="#e8463a"><circle cx="600" cy="150" r="10"/><circle cx="790" cy="110" r="10"/><circle cx="880" cy="250" r="10"/><circle cx="520" cy="250" r="10"/></g>`;
  return svg(
    `${sky()}${tree}${truck(-60, 560)}${fx("ladder", ladderArt())}
    <g class="pr-kitten is-sad"><g transform="translate(780 236)">${kitten()}</g></g>
    ${fx("milk", `<g transform="translate(470 700)"><path d="M-50 -10 H50 C48 16 30 26 0 26 C-30 26 -48 16 -50 -10 Z" fill="#6db3d4" ${O}/><ellipse cx="0" cy="-10" rx="50" ry="10" fill="#fff" ${o}/></g>`)}
    ${fx("hearts", `${heart(540, 520, 1.2)}${heart(620, 480, 1)}${heart(460, 470, 0.9)}`, true)}
    ${zone("tree", `<rect x="560" y="260" width="160" height="440" rx="40"/>`)}
    <g class="pr-kitten-zone">${zone("cat", `<circle cx="780" cy="236" r="78"/>`)}</g>`,
    "0 0 1000 800",
  );
}

export function forestFireScene(): string {
  const firs = [120, 300, 860, 980]
    .map((x, i) => `<g transform="translate(${x} ${430 + (i % 2) * 30})"><path d="M0 -190 L70 -60 H40 L90 40 H-90 L-40 -60 H-70 Z" fill="#3f8f4a" ${O}/><rect x="-12" y="40" width="24" height="40" fill="#9a6a3a" ${o}/></g>`)
    .join("");
  const camp = `<g transform="translate(600 600)"><ellipse cx="0" cy="20" rx="90" ry="26" fill="#c9b8a3" opacity=".6"/>
    <g fill="#9aa3ad" ${o}><ellipse cx="-70" cy="16" rx="22" ry="16"/><ellipse cx="-30" cy="30" rx="22" ry="16"/><ellipse cx="20" cy="32" rx="22" ry="16"/><ellipse cx="66" cy="18" rx="22" ry="16"/></g>
    <path d="M-50 10 L50 -10 M-50 -10 L50 10" stroke="#7a4a2a" stroke-width="16" stroke-linecap="round"/>
    <g class="pr-embers" data-life="embers"><circle cx="-20" cy="2" r="9" fill="#ff7a2a"/><circle cx="10" cy="-2" r="8" fill="#ffb23f"/><circle cx="30" cy="6" r="7" fill="#ff7a2a"/><circle cx="-4" cy="10" r="6" fill="#e8463a"/></g>
    <g class="pr-sand"><ellipse cx="0" cy="2" rx="62" ry="24" fill="#e2c58e" ${o}/></g></g>`;
  return svg(
    `${sky("#7cc46a")}${firs}<ellipse cx="190" cy="690" rx="170" ry="62" fill="#6db3d4" ${O}/><ellipse cx="150" cy="676" rx="70" ry="16" fill="#fff" opacity=".5"/>
    ${camp}${flame("fire-a", 600, 600, 1.05)}${flame("fire-b", 840, 690, 0.75)}
    ${fx("splash", `${sparkle(150, 640, 1.4, "#fff")}${sparkle(230, 660, 1, "#fff")}${sparkle(200, 620, 0.8, "#fff")}`, true)}
    ${fx("hearts", `${heart(520, 300, 1.2)}${heart(640, 260, 1)}${heart(760, 300, 1.2)}`, true)}
    ${zone("pond", `<ellipse cx="190" cy="690" rx="180" ry="80"/>`)}${zone("embers", `<ellipse cx="600" cy="610" rx="100" ry="50"/>`)}${zone("fire-a", `<circle cx="600" cy="520" r="90"/>`)}${zone("fire-b", `<circle cx="840" cy="640" r="70"/>`)}`,
    "0 0 1000 800",
  );
}

// ---------------------------------------------------------------- safety rooms

/** A thing to tap: drawn art + its tap area (in the scene's 1000 × 800 box). */
const thing = (id: string, art: string, hit: string): string =>
  `<g class="pr-thing" data-thing="${id}">${art}${hit.replace(/^<(\w+)/, `<$1 class="pr-thing__hit"`)}</g>`;

export function kitchenScene(): string {
  const back = `<rect width="1000" height="800" fill="#fff4e0"/>
    <g opacity=".25" stroke="#c9b8a3" stroke-width="2">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 90} 300 V470"/>`).join("")}<path d="M0 340 H1000 M0 385 H1000 M0 430 H1000"/></g>
    <rect y="650" width="1000" height="150" fill="#d9c3a5"/>
    <rect x="390" y="60" width="220" height="170" rx="14" fill="#bfe6f5" ${O}/><path d="M500 60 V230 M390 145 H610" stroke="${INK}" stroke-width="4"/>
    <rect x="0" y="470" width="1000" height="26" fill="#c48a4a" ${O}/><rect x="300" y="496" width="700" height="160" fill="#f0d9b5" ${O}/>
    <path d="M520 496 V656 M740 496 V656" stroke="${INK}" stroke-width="4"/><circle cx="500" cy="576" r="7" fill="${INK}"/><circle cx="540" cy="576" r="7" fill="${INK}"/><circle cx="720" cy="576" r="7" fill="${INK}"/>`;
  const stove = `<rect x="60" y="400" width="240" height="256" rx="10" fill="#f6f7f9" ${O}/><rect x="84" y="480" width="192" height="130" rx="12" fill="#3b2e25" opacity=".85"/><rect x="100" y="496" width="160" height="70" rx="8" fill="#6b5a4c"/>
    <circle cx="100" cy="430" r="10" fill="${INK}"/><circle cx="140" cy="430" r="10" fill="${INK}"/>
    <ellipse cx="180" cy="396" rx="72" ry="10" fill="#ff7a2a" opacity=".85"/>
    <path d="M120 360 H240 V380 C240 400 120 400 120 380 Z" fill="#7d8790" ${O}/><path d="M240 368 H300" ${O} stroke-width="10"/>
    <path class="pr-steam" d="M150 340 q-10 -20 0 -40 M180 340 q-10 -20 0 -40 M210 340 q-10 -20 0 -40" fill="none" stroke="#c9b8a3" stroke-width="5" stroke-linecap="round"/>`;
  const kettle = `<path d="M340 470 C330 410 350 390 390 390 C430 390 450 410 440 470 Z" fill="#6db3d4" ${O}/><path d="M440 420 L476 400" ${O} stroke-width="10"/><path d="M356 392 C356 364 424 364 424 392" fill="none" ${O} stroke-width="8"/>
    <path class="pr-steam" d="M480 390 q-10 -18 0 -36 M496 396 q-10 -18 0 -36" fill="none" stroke="#c9b8a3" stroke-width="5" stroke-linecap="round"/>`;
  const knife = `<g transform="rotate(-10 620 460)"><path d="M560 452 H660 C680 452 690 460 676 466 H560 Z" fill="#dfe4ea" ${O}/><rect x="520" y="450" width="46" height="18" rx="6" fill="#7a4a2a" ${O}/></g>`;
  const matches = `<rect x="720" y="430" width="80" height="44" rx="6" fill="#ffd54a" ${O}/><rect x="726" y="436" width="40" height="32" rx="4" fill="#e8463a"/><path d="M800 440 L846 414" ${O} stroke-width="5"/><circle cx="848" cy="412" r="7" fill="#e8463a" ${o}/>`;
  const chem = `<rect x="760" y="510" width="220" height="140" fill="#9a6a3a" opacity=".25"/><path d="M760 496 L700 520 V650 L760 656 Z" fill="#f0d9b5" ${O}/>
    <rect x="790" y="546" width="44" height="96" rx="10" fill="#7cc46a" ${O}/><rect x="800" y="528" width="24" height="20" fill="#fff" ${o}/><path d="M800 590 l24 -16 M800 574 l24 16" stroke="#e8463a" stroke-width="5"/>
    <rect x="860" y="560" width="54" height="82" rx="10" fill="#b58be8" ${O}/><rect x="874" y="540" width="24" height="22" fill="#fff" ${o}/>`;
  const bowl = `<path d="M880 424 H990 C988 462 960 474 935 474 C910 474 882 462 880 424 Z" fill="#fff" ${O}/><circle cx="912" cy="416" r="20" fill="#e8463a" ${o}/><circle cx="950" cy="412" r="22" fill="#ffd54a" ${o}/>`;
  const plant = `<path d="M440 236 H560 L548 290 H452 Z" fill="#e8708a" ${O}/><path d="M500 236 C470 190 450 180 440 170 M500 236 C520 180 540 170 560 168 M500 236 V160" stroke="#3f8f4a" stroke-width="10" stroke-linecap="round"/>`;
  const clock = `<circle cx="820" cy="140" r="56" fill="#fff" ${O}/><path d="M820 140 V104 M820 140 L846 152" ${O}/>`;
  return svg(
    `${back}
    ${thing("plita", stove, `<rect x="60" y="300" width="250" height="356"/>`)}
    ${thing("chaynik", kettle, `<rect x="330" y="350" width="170" height="122"/>`)}
    ${thing("nozh", knife, `<rect x="510" y="420" width="190" height="60"/>`)}
    ${thing("spichki", matches, `<rect x="712" y="396" width="150" height="86"/>`)}
    ${thing("himiya", chem, `<rect x="700" y="500" width="290" height="156"/>`)}
    ${thing("frukty", bowl, `<rect x="870" y="380" width="128" height="96"/>`)}
    ${thing("cvetok", plant, `<rect x="430" y="150" width="140" height="146"/>`)}
    ${thing("chasy", clock, `<circle cx="820" cy="140" r="64"/>`)}`,
    "0 0 1000 800",
  );
}

export function roomScene(): string {
  const back = `<rect width="1000" height="800" fill="#eef0fa"/><rect y="640" width="1000" height="160" fill="#d9c3a5"/><path d="M0 640 H1000" stroke="${INK}" stroke-width="4" opacity=".15"/>
    <rect x="80" y="660" width="380" height="110" rx="50" fill="#9fd3ea" opacity=".6"/>`;
  const socket = `<rect x="110" y="470" width="90" height="90" rx="14" fill="#fff" ${O}/><circle cx="140" cy="515" r="9" fill="${INK}"/><circle cx="170" cy="515" r="9" fill="${INK}"/>`;
  const iron = `<path d="M260 470 L560 470" ${O} stroke-width="10"/><path d="M300 470 L360 640 M520 470 L460 640" ${O} stroke-width="8"/>
    <path d="M330 456 C330 410 380 396 460 400 L480 456 Z" fill="#6db3d4" ${O}/><path d="M360 404 C360 370 440 370 448 400" fill="none" ${O} stroke-width="10"/><circle cx="460" cy="430" r="7" fill="#e8463a"/>
    <path class="pr-steam" d="M350 390 q-10 -18 0 -36 M380 380 q-10 -18 0 -36" fill="none" stroke="#c9b8a3" stroke-width="5" stroke-linecap="round"/>`;
  const scissors = `<g transform="translate(600 720) rotate(-20)"><path d="M0 0 L80 -16 M0 -16 L80 0" ${O} stroke-width="8"/><circle cx="-14" cy="-20" r="16" fill="none" stroke="#e8463a" stroke-width="8"/><circle cx="-14" cy="6" r="16" fill="none" stroke="#e8463a" stroke-width="8"/></g>`;
  const table = `<rect x="700" y="500" width="250" height="20" rx="6" fill="#c48a4a" ${O}/><path d="M720 520 V640 M930 520 V640" ${O} stroke-width="10"/>`;
  const pills = `<rect x="740" y="452" width="40" height="50" rx="8" fill="#fff" ${O}/><rect x="736" y="440" width="48" height="16" rx="4" fill="#e8463a" ${o}/><g ${o}><ellipse cx="810" cy="494" rx="14" ry="8" fill="#ffd54a"/><ellipse cx="836" cy="490" rx="14" ry="8" fill="#e8708a"/><ellipse cx="822" cy="478" rx="14" ry="8" fill="#9fd3ea"/></g>`;
  const windowOpen = `<rect x="560" y="70" width="230" height="250" rx="10" fill="#bfe6f5" ${O}/><path d="M790 70 L880 100 V350 L790 320 Z" fill="#dff3fa" ${O}/><path d="M550 330 H800" ${O} stroke-width="12"/>
    <ellipse cx="640" cy="160" rx="34" ry="14" fill="#fff"/><ellipse cx="720" cy="230" rx="30" ry="12" fill="#fff"/>`;
  const teddy = `<g transform="translate(200 690)"><circle cx="-28" cy="-74" r="16" fill="#b98252" ${o}/><circle cx="28" cy="-74" r="16" fill="#b98252" ${o}/><ellipse cx="0" cy="-10" rx="44" ry="40" fill="#b98252" ${O}/><circle cx="0" cy="-60" r="36" fill="#b98252" ${O}/><circle cx="-12" cy="-64" r="5" fill="${INK}"/><circle cx="12" cy="-64" r="5" fill="${INK}"/><ellipse cx="0" cy="-50" rx="12" ry="9" fill="#e8c9a3"/></g>`;
  const books = `<g transform="translate(830 500)"><rect x="-10" y="-46" width="26" height="46" fill="#7cc46a" ${o}/><rect x="16" y="-56" width="26" height="56" fill="#ffb23f" ${o}/><rect x="42" y="-40" width="26" height="40" fill="#6db3d4" ${o}/></g>`;
  const ball = `<g transform="translate(380 720)"><circle r="34" fill="#fff" ${O}/><path d="M0 -34 C-20 -10 -20 10 0 34 C-10 10 -10 -10 0 -34 Z" fill="#e8463a"/><path d="M-34 -4 C-10 6 10 6 34 -4 C12 14 -12 14 -34 -4 Z" fill="#3a8fd4"/><circle r="34" fill="none" ${O}/></g>`;
  const lamp = `<path d="M60 120 H180 L150 60 H90 Z" fill="#ffd54a" ${O}/><path d="M120 120 V180" ${O}/><ellipse cx="120" cy="200" rx="60" ry="16" fill="#fff4a8" opacity=".6"/>`;
  return svg(
    `${back}${table}
    ${thing("rozetka", socket, `<rect x="96" y="456" width="118" height="118"/>`)}
    ${thing("utyug", iron, `<rect x="320" y="340" width="180" height="126"/>`)}
    ${thing("nozhnicy", scissors, `<rect x="560" y="660" width="140" height="100"/>`)}
    ${thing("tabletki", pills, `<rect x="730" y="430" width="126" height="76"/>`)}
    ${thing("okno", windowOpen, `<rect x="550" y="60" width="340" height="290"/>`)}
    ${thing("mishka", teddy, `<rect x="140" y="580" width="120" height="160"/>`)}
    ${thing("knigi", books, `<rect x="816" y="440" width="96" height="62"/>`)}
    ${thing("myach", ball, `<circle cx="380" cy="720" r="44"/>`)}
    ${thing("lampa", lamp, `<rect x="50" y="50" width="140" height="160"/>`)}`,
    "0 0 1000 800",
  );
}

export const badgeOk = `<g class="pr-badge"><circle r="26" fill="#3fae6a" stroke="#fff" stroke-width="5"/><path d="M-11 0 L-3 9 L12 -9" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
export const badgeWarn = `<g class="pr-badge"><path d="M0 -30 L30 22 H-30 Z" fill="#ffc94a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M0 -12 V6" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="15" r="3.5" fill="${INK}"/></g>`;

// ---------------------------------------------------------------- shop

export function basketArt(): string {
  return svg(
    `<path d="M40 60 C40 10 160 10 160 60" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M40 60 C40 10 160 10 160 60" fill="none" stroke="#c48a4a" stroke-width="6" stroke-linecap="round"/>
    <path d="M14 60 H186 L166 150 H34 Z" fill="#e2a85a" ${O}/><path d="M30 86 H170 M36 114 H164 M70 60 L76 150 M100 60 V150 M130 60 L124 150" stroke="#b77c3a" stroke-width="5"/>`,
    "0 0 200 160",
  );
}

export function coinArt(): string {
  return svg(`<circle cx="50" cy="50" r="40" fill="#ffd54a" ${O}/><circle cx="50" cy="50" r="28" fill="none" stroke="#e0a91a" stroke-width="5"/><path d="M44 36 h14 M50 36 V66 M42 66 h16" stroke="#b07a10" stroke-width="6" stroke-linecap="round"/>`);
}

export function tillArt(): string {
  return svg(
    `<rect x="20" y="70" width="160" height="80" rx="12" fill="#6db3d4" ${O}/><rect x="40" y="20" width="120" height="50" rx="10" fill="#e9eef5" ${O}/><rect x="56" y="32" width="88" height="26" rx="6" fill="#2f3b45"/>
    <rect x="70" y="84" width="60" height="12" rx="6" fill="${INK}"/><g fill="#fff">${[0, 1, 2].map((i) => `<rect x="${44 + i * 40}" y="108" width="30" height="16" rx="4"/>`).join("")}</g>`,
    "0 0 200 160",
  );
}
