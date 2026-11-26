/**
 * v23 «Азбука-картинки»: tap a letter — Ryzhik says its sound and a word
 * («М! Мммячик»; Ё, Ю, Я, Й only the word; Ь, Ъ a short phrase), and three
 * pictures on that letter show. Astra, brief 24-1/2, with fixes: «Ельник»
 * (the same as «Ель»), «Йод» (medicine), «Йоркширский терьер» (too long, looked
 * like a cat) and «подъёмный мост» dropped; Э got its own file name (it had
 * Е's «bukva-e»). Recorded lines go to public/audio/voice/words/<file>.mp3.
 */
export type AbcWord = { word: string; art: string };
export type AbcLetter = { letter: string; say: string; file: string; words: AbcWord[] };

/** "have:<key>": a picture the game already has (see word-art.ts). */
export const ABC: AbcLetter[] = [
  {
    letter: "А",
    say: "А! Ааист",
    file: "bukva-a",
    words: [
      { word: "Аист", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="none" stroke="#bd6547" d="M36 62v23l-9 3m24-26v23l8 2"/><path fill="#fff9e9" d="M8 59q14-22 39-18 10 2 12-12 0-16 12-16 12 0 12 11 0 8-10 11-1 32-28 34-20 2-37-10Z"/><path fill="#474956" d="M11 58q14-17 37-13-5 16-22 19l3-6-12 5Z"/><path fill="#ff9258" d="m81 22 16 7-17 1Z"/><circle cx="73" cy="21" r="2" fill="#3b2e25"/></g></svg>` },
      { word: "Арбуз", art: "have:Арбуз" },
      { word: "Акула", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#78c8dd" d="M24 47q9-9 21-11l3-17q11 5 15 17 18 1 30 17-10 16-32 17l-13 11-1-13q-14-1-24-10L7 70l4-19-5-17Z"/><path fill="none" d="M91 55q-7 6-14 2m-16-9-2 7m-4-7-2 6"/><circle cx="76" cy="47" r="3" fill="#3b2e25"/></g></svg>` },
    ],
  },
  {
    letter: "Б",
    say: "Б! Банан",
    file: "bukva-b",
    words: [
      { word: "Банан", art: "have:Банан" },
      { word: "Барабан", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#ff8975" d="M12 42h76v32c0 17-76 17-76 0Z"/><path fill="none" d="m16 48 11 29 12-25 12 29 12-29 12 26 10-30"/><ellipse cx="50" cy="42" rx="38" ry="12" fill="#ffe7ab"/><path fill="none" d="m19 15 36 17m25-21L49 34"/><circle cx="55" cy="32" r="4" fill="#e5ac69"/><circle cx="49" cy="34" r="4" fill="#e5ac69"/></g></svg>` },
      { word: "Бабочка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#ffac79" d="M49 48C24 4 4 15 9 40q2 14 17 17C3 76 32 96 49 63c17 33 46 13 25-6q15-3 17-17C96 15 76 4 51 48Z"/><circle cx="27" cy="38" r="8" fill="#ffe68e"/><circle cx="73" cy="38" r="8" fill="#ffe68e"/><circle cx="33" cy="68" r="5" fill="#ea8da9"/><circle cx="67" cy="68" r="5" fill="#ea8da9"/><ellipse cx="50" cy="53" rx="5" ry="20" fill="#bc865f"/><path fill="none" d="M48 35q-1-11-8-13m12 13q1-11 8-13"/></g></svg>` },
    ],
  },
  {
    letter: "В",
    say: "В! Ввварежка",
    file: "bukva-v",
    words: [
      { word: "Варежка", art: "have:Варежка" },
      { word: "Вишня", art: "have:Вишня" },
      { word: "Ваза", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#76d1c8" d="M32 16h36q-12 23-1 31 25 20 2 39-19 8-38 0-23-19 2-39 11-8-1-31Z"/><ellipse cx="50" cy="16" rx="18" ry="5" fill="#459caa"/><path fill="#ffe194" d="M25 60q25 10 50 0l2 10q-27 12-54 0Z"/></g></svg>` },
    ],
  },
  {
    letter: "Г",
    say: "Г! Гриб",
    file: "bukva-g",
    words: [
      { word: "Гриб", art: "have:Гриб" },
      { word: "Груша", art: "have:Груша" },
      { word: "Гусь", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#ffab58" d="m40 70 6 2-2 12 10 3H35Zm15 0 6-1 1 12 9 4H55Z"/><path fill="#fff8dd" d="M8 47q12 9 26 4 11-5 21-2 9 2 8-11-4-22 6-25 13-5 17 6 3 9-8 13 3 26-9 37-23 19-50-1Q10 61 8 47Z"/><path fill="#ffae5e" d="m84 20 12 6-14 2Z"/><path fill="none" d="M23 56q15 14 33 0"/><circle cx="77" cy="20" r="2" fill="#3b2e25"/></g></svg>` },
    ],
  },
  {
    letter: "Д",
    say: "Д! Дом",
    file: "bukva-d",
    words: [
      { word: "Дом", art: "have:Дом" },
      { word: "Дуб", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#bc895b" d="m42 54-10-9 4-5 13 9 13-12 5 5-11 15q-2 23 9 32H32q11-9 10-35Z"/><path fill="#89ca70" d="M28 57C8 64 2 41 16 34 11 20 26 13 36 19 42 3 62 5 68 18 83 11 92 24 87 35 103 47 87 64 73 56q-10 11-24 1-12 10-21 0Z"/><path fill="none" d="M29 34q5-8 13-5m16 11q7 6 14-1"/></g></svg>` },
      { word: "Дыня", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#81bf71" d="M78 42q3-16 14-17 2 13-14 17Z"/><ellipse cx="48" cy="56" rx="40" ry="27" fill="#ffd46c"/><path fill="none" stroke="#b88035" d="M13 52q30-26 65-10M13 59q30 21 66 8M17 55q27-8 62-5"/></g></svg>` },
    ],
  },
  {
    letter: "Е",
    say: "Е! Ель",
    file: "bukva-e",
    words: [
      { word: "Ель", art: "have:Ель" },
      { word: "Ежевика", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#8bcb76" d="M49 31Q27 31 19 13q21-2 30 13 5-16 24-17-2 17-24 22Z"/><circle cx="39" cy="38" r="13" fill="#8173ac"/><circle cx="60" cy="38" r="13" fill="#665b93"/><circle cx="28" cy="54" r="12" fill="#726498"/><circle cx="50" cy="54" r="14" fill="#8679ac"/><circle cx="72" cy="54" r="12" fill="#71649b"/><circle cx="38" cy="70" r="13" fill="#66598e"/><circle cx="61" cy="70" r="13" fill="#8173a6"/><circle cx="50" cy="81" r="11" fill="#706295"/></g></svg>` },
    ],
  },
  {
    letter: "Ё",
    say: "Ёжик!",
    file: "bukva-yo",
    words: [
      { word: "Ёжик", art: "have:Ёжик" },
      { word: "Ёлочка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="44" y="72" width="12" height="20" rx="3" fill="#bc895e"/><path fill="#63bf85" d="M50 9 31 35h9L23 55h12L14 79q36 8 72 0L65 55h12L60 35h9Z"/><circle cx="45" cy="39" r="4" fill="#ffcf67"/><circle cx="59" cy="55" r="5" fill="#ff8e86"/><circle cx="38" cy="69" r="5" fill="#9edbff"/><circle cx="66" cy="73" r="4" fill="#ffcf67"/></g></svg>` },
      { word: "Ёрш", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#efbd68" d="m29 43 2-17 8 8 4-15 8 13 6-16 5 16 8-10 1 19Z"/><path fill="#a8c877" d="M23 46q39-31 69 5-24 35-69 8L7 70l3-18-3-17Z"/><path fill="#efbd68" d="m57 57-14 14-2-15Z"/><path fill="none" d="M69 42q-6 11 0 20"/><circle cx="78" cy="47" r="3" fill="#3b2e25"/><path fill="none" d="m34 45 2 4m10-8 2 5m10-6 2 4"/></g></svg>` },
    ],
  },
  {
    letter: "Ж",
    say: "Ж! Жжжук",
    file: "bukva-zh",
    words: [
      { word: "Жук", art: "have:Жук" },
      { word: "Жаба", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="23" cy="68" rx="16" ry="12" fill="#86b76b"/><ellipse cx="77" cy="68" rx="16" ry="12" fill="#86b76b"/><path fill="#accc7d" d="M18 54q1-13 9-18-3-16 10-17 10 0 13 12 5-13 15-12 12 2 11 17 11 11 7 24-3 19-33 20-34 0-32-26Z"/><circle cx="37" cy="30" r="3" fill="#3b2e25"/><circle cx="65" cy="30" r="3" fill="#3b2e25"/><path fill="none" d="M30 51q20 11 40-1"/><g fill="#829d53" stroke="none"><circle cx="27" cy="42" r="3"/><circle cx="73" cy="43" r="3"/><circle cx="35" cy="65" r="3"/><circle cx="67" cy="64" r="4"/></g></g></svg>` },
      { word: "Жираф", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#ffd479" d="M24 91 43 39q-16-1-18-15 13-4 23 6l3-11q7-7 17-1l5 12q4 9 15 12 8 3 5 13-3 11-20 8L59 56 48 91Z"/><path fill="none" d="m54 19-3-9m12 9 3-9"/><circle cx="50" cy="9" r="4" fill="#be8755"/><circle cx="67" cy="9" r="4" fill="#be8755"/><circle cx="65" cy="33" r="3" fill="#3b2e25"/><circle cx="86" cy="49" r="2" fill="#3b2e25"/><path fill="#c38a51" stroke="none" d="m42 48 9 3-3 8-9-2Zm-8 21 10 2-3 9-10-2Zm19-6 6 2-3 8-6-3Z"/></g></svg>` },
    ],
  },
  {
    letter: "З",
    say: "З! Зззонтик",
    file: "bukva-z",
    words: [
      { word: "Зонтик", art: "have:Зонтик" },
      { word: "Звезда", art: "have:Звезда" },
      { word: "Замок", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#ffd392" d="M12 39h21v15h34V39h21v46H12Z"/><path fill="#f99b83" d="m8 39 15-23 15 23Zm54 0 15-23 15 23Z"/><path fill="#ffdeaa" d="M35 85V35h30v50Z"/><path fill="#ef927f" d="m30 35 20-26 20 26Z"/><path fill="#a77757" d="M42 85V69a8 8 0 0 1 16 0v16Z"/><g fill="#91cfe3"><rect x="19" y="48" width="7" height="11" rx="3"/><rect x="74" y="48" width="7" height="11" rx="3"/><circle cx="50" cy="44" r="4"/></g></g></svg>` },
    ],
  },
  {
    letter: "И",
    say: "И! Ииива",
    file: "bukva-i",
    words: [
      { word: "Ива", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#b98a60" d="M44 47 32 35l4-6 15 12 12-14 6 5-13 19q-3 30 7 39H34q11-10 10-43Z"/><path fill="#a7d382" d="M50 11C20 9 8 34 9 74q10-6 15-30-2 24 3 36 10-13 12-43 0 23 5 29 9-14 9-36 3 25 12 44 5-13 1-36 9 19 13 42 7-10 3-38 5 11 9 26 2-48-27-55Z"/></g></svg>` },
      { word: "Иголка", art: "have:Иголка" },
      { word: "Индюк", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#db9971" d="M52 63Q17 72 9 52q-3-8 7-9Q1 25 17 24q-5-18 12-13 5-13 14 0 14-10 18 5 15-4 13 10 15 5 6 17Z"/><path fill="none" d="m43 53-27-23m29 19L29 17m20 31-6-31m10 30 6-25"/><path fill="none" d="M46 71v14l-8 2m21-16v13l8 3"/><path fill="#b98257" d="M24 56q14-13 30-7 9 3 11-8 0-13 11-13 12 0 10 12-1 6-7 8-1 29-27 29-20 0-28-21Z"/><path fill="#ffbc61" d="m85 34 10 6-11 2Z"/><path fill="#ef8877" d="M80 44q9 3 6 12-6 5-8-3Z"/><circle cx="78" cy="35" r="2" fill="#3b2e25"/></g></svg>` },
    ],
  },
  {
    letter: "Й",
    say: "Йогурт!",
    file: "bukva-j",
    words: [
      { word: "Йогурт", art: "have:Йогурт" },
    ],
  },
  {
    letter: "К",
    say: "К! Кубик",
    file: "bukva-k",
    words: [
      { word: "Кубик", art: "have:Кубик" },
      { word: "Кораблик", art: "have:Кораблик" },
      { word: "Кит", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#85cde3" d="M10 56c0-18 12-29 30-29 17 0 27 13 32 21 7-1 10-8 10-13-8 0-13-6-14-14 9-1 15 3 17 9 2-7 7-10 12-11 2 10-2 17-9 19-1 26-18 42-46 42-20 0-32-10-32-24Z"/><path fill="#69b8d3" d="M49 60q8 3 17 1-4 14-13 13Z"/><circle cx="31" cy="50" r="3" fill="#3b2e25"/><path fill="none" d="M12 59q8 7 17 2"/><path fill="none" stroke="#78bed9" d="M39 23q-4-14-10-10m11 8q3-14 10-11"/></g></svg>` },
    ],
  },
  {
    letter: "Л",
    say: "Л! Лллодка",
    file: "bukva-l",
    words: [
      { word: "Лодка", art: "have:Лодка" },
      { word: "Лампа", art: "have:Лампа" },
      { word: "Лук", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#8ccc7a" d="M43 42q0-17-11-26 12 1 18 15-1-15 5-24 4 14 0 26 6-10 15-12-9 9-13 22Z"/><path fill="#f9ce76" d="M43 37q7 4 14 0 0 9 13 15 18 10 12 26-6 13-31 12-24 1-32-13-8-16 11-26 12-6 13-14Z"/><path fill="none" stroke="#bd8b52" d="M42 49q-22 23-7 33m22-32q21 19 12 31"/><path fill="none" d="m48 90-4 4m9-4 3 4"/></g></svg>` },
    ],
  },
  {
    letter: "М",
    say: "М! Мммячик",
    file: "bukva-m",
    words: [
      { word: "Мячик", art: "have:Мячик" },
      { word: "Морковка", art: "have:Морковка" },
      { word: "Малина", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><g fill="#fa8195"><circle cx="35" cy="43" r="14"/><circle cx="63" cy="43" r="14"/><circle cx="49" cy="41" r="14"/><circle cx="28" cy="57" r="12"/><circle cx="70" cy="57" r="12"/><circle cx="39" cy="69" r="13"/><circle cx="60" cy="69" r="13"/><circle cx="50" cy="79" r="11"/><circle cx="49" cy="57" r="14"/></g><path fill="#86c777" d="M47 26q-16-12-28-4l18 10-9 7q14 2 22-9 9 12 21 10l-8-9 16-8q-13-8-26 2 2-9 10-13l-5-5q-10 7-11 19Z"/></g></svg>` },
    ],
  },
  {
    letter: "Н",
    say: "Н! Ннносок",
    file: "bukva-n",
    words: [
      { word: "Носок", art: "have:Носок" },
      { word: "Ножницы", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#c1d6dd" d="M37 69 69 16q5-7 8-3 3 4-1 12L49 72Z"/><path fill="#dde7e8" d="M61 69 28 16q-4-7-8-3-3 4 2 13l28 47Z"/><circle cx="50" cy="51" r="4" fill="#e6af6a"/><path fill="#ff9b82" fill-rule="evenodd" d="M44 74a15 15 0 1 1-30 0 15 15 0 1 1 30 0Zm-8 0a7 7 0 1 0-14 0 7 7 0 1 0 14 0Z"/><path fill="#ffb981" fill-rule="evenodd" d="M85 74a15 15 0 1 1-30 0 15 15 0 1 1 30 0Zm-8 0a7 7 0 1 0-14 0 7 7 0 1 0 14 0Z"/></g></svg>` },
      { word: "Носорог", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#aab9c5" d="M12 58q-3-24 19-29 22-6 34 9l6 3 6 8 12 2q7 2 6 11-1 10-20 9l-5 10H58l-1-11H38l-3 11H21l-1-14Z"/><path fill="#aab9c5" d="M64 40q-9-9-4-18 11 3 12 15Z"/><path fill="#fff0cb" d="M77 51q9-9 11-20 6 11 1 23Z"/><circle cx="74" cy="49" r="2" fill="#3b2e25"/><path fill="none" d="M93 62q-6 4-11 2M13 42q-7 5-6 18"/></g></svg>` },
    ],
  },
  {
    letter: "О",
    say: "О! Оооблако",
    file: "bukva-o",
    words: [
      { word: "Облако", art: "have:Облако" },
      { word: "Ослик", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#b6b6c0" d="M36 45C22 32 17 10 25 7q12-4 21 32h8Q63 4 75 7c9 4 0 28-12 39 10 9 10 22 4 30-6 10-29 11-37 0-7-9-4-23 6-31Z"/><path fill="none" stroke="#d8909f" d="M29 17q3 12 10 20m31-20q-3 12-10 20"/><path fill="#777784" d="m39 43 3-11 5 5 5-8 5 10 5-2-3 10Z"/><ellipse cx="50" cy="75" rx="23" ry="14" fill="#f2d9c1"/><g fill="#3b2e25"><circle cx="39" cy="54" r="3"/><circle cx="61" cy="54" r="3"/><circle cx="38" cy="72" r="2"/><circle cx="62" cy="72" r="2"/></g><path fill="none" d="M44 80q6 4 12 0"/></g></svg>` },
      { word: "Остров", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="76" rx="44" ry="13" fill="#92dbe9"/><path fill="#ffe19d" d="M13 73q10-16 37-16 26 0 37 16-35 14-74 0Z"/><path fill="#c9945f" d="M42 67q10-23 7-40l6-2q8 21-4 43Z"/><path fill="#81c777" d="M52 26Q33 4 20 23q16-3 26 6-22-3-27 17 16-9 31-13 8 6 10 19 10-14-3-23 12-4 27 7-5-20-27-15 6-10 18-10-17-9-23 15Z"/></g></svg>` },
    ],
  },
  {
    letter: "П",
    say: "П! Пчела",
    file: "bukva-p",
    words: [
      { word: "Пчела", art: "have:Пчела" },
      { word: "Подарок", art: "have:Подарок" },
      { word: "Пингвин", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="36" cy="85" rx="13" ry="6" fill="#ffb461"/><ellipse cx="64" cy="85" rx="13" ry="6" fill="#ffb461"/><path fill="#566475" d="M28 39q0-28 22-28t22 28q12 10 15 29-9 1-15-9 5 26-22 26T28 59q-7 10-15 9 3-19 15-29Z"/><path fill="#fff5df" d="M50 33q-14-16-18 2-2 8 5 14-16 30 13 31t13-31q7-6 5-14-4-18-18-2Z"/><circle cx="41" cy="38" r="2" fill="#3b2e25"/><circle cx="59" cy="38" r="2" fill="#3b2e25"/><path fill="#ffbb68" d="m42 45 8-4 8 4-8 7Z"/></g></svg>` },
    ],
  },
  {
    letter: "Р",
    say: "Р! Рррыбка",
    file: "bukva-r",
    words: [
      { word: "Рыбка", art: "have:Рыбка" },
      { word: "Рак", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="#ff8068" stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M38 43 26 33C12 38 5 23 10 11L20 23 25 9C35 16 34 24 31 29L43 36ZM62 43 74 33C88 38 95 23 90 11L80 23 75 9C65 16 66 24 69 29L57 36Z"/><path d="m36 45-12 2-7 7m19-1-12 4-5 8m18-4-10 5-3 8m40-29 12 2 7 7m-19-1 12 4 5 8m-18-4 10 5 3 8" fill="none"/><path d="M46 74Q30 77 33 88Q43 92 50 85Q57 92 67 88Q70 77 54 74Z"/><path d="M50 28C28 28 31 58 39 72Q50 89 61 72C69 58 72 28 50 28Z"/><path d="M36 55Q50 64 64 55M39 66Q50 73 61 66" fill="none"/><circle cx="41" cy="31" r="4" fill="#3b2e25"/><circle cx="59" cy="31" r="4" fill="#3b2e25"/></g></svg>` },
      { word: "Ромашка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M50 48Q47 70 52 93" fill="none"/><path d="M50 83Q28 84 21 63Q44 62 50 83ZM50 75Q55 55 77 57Q74 74 50 75Z" fill="#78bf74"/><g fill="#fff9e7"><ellipse cx="50" cy="23" rx="10" ry="18"/><ellipse cx="50" cy="23" rx="10" ry="18" transform="rotate(60 50 39)"/><ellipse cx="50" cy="23" rx="10" ry="18" transform="rotate(120 50 39)"/><ellipse cx="50" cy="23" rx="10" ry="18" transform="rotate(180 50 39)"/><ellipse cx="50" cy="23" rx="10" ry="18" transform="rotate(240 50 39)"/><ellipse cx="50" cy="23" rx="10" ry="18" transform="rotate(300 50 39)"/></g><circle cx="50" cy="39" r="13" fill="#ffca48"/></g></svg>` },
    ],
  },
  {
    letter: "С",
    say: "С! Сссолнце",
    file: "bukva-s",
    words: [
      { word: "Солнце", art: "have:Солнце" },
      { word: "Сапог", art: "have:Сапог" },
      { word: "Слон", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M17 46Q10 49 10 61L7 67" fill="none"/><path d="M17 53C12 26 38 23 52 30C69 14 91 23 89 45L88 59Q87 69 93 62Q98 58 96 68C94 81 75 81 74 64L73 52 66 57 65 80 54 80 52 63 38 64 35 81 23 81 23 60Z" fill="#93bee7"/><path d="M67 34C54 20 40 30 45 47Q51 68 65 54Q71 47 67 34Z" fill="#b3d4ed"/><circle cx="78" cy="39" r="2" fill="#3b2e25"/></g></svg>` },
    ],
  },
  {
    letter: "Т",
    say: "Т! Торт",
    file: "bukva-t",
    words: [
      { word: "Торт", art: "have:Торт" },
      { word: "Трактор", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M72 49V30H79V49" fill="#70818b"/><path d="M20 54 23 23H53L58 49H81Q90 49 90 60V69H17V54Z" fill="#83c669"/><path d="m29 29-2 19h22l-3-19Z" fill="#c5eff9"/><rect x="18" y="19" width="39" height="7" rx="3" fill="#ffbe57"/><circle cx="28" cy="68" r="20" fill="#65717b"/><circle cx="28" cy="68" r="9" fill="#ffcc5a"/><circle cx="80" cy="73" r="14" fill="#65717b"/><circle cx="80" cy="73" r="6" fill="#ffcc5a"/></g></svg>` },
      { word: "Тапок", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M9 65Q9 55 26 48L56 32Q79 21 90 42Q98 55 85 63L42 80Q19 88 10 76Z" fill="#ffc260"/><path d="M10 64Q13 54 32 46L53 37 69 61 40 73Q20 80 10 70Z" fill="#ffe7ac"/><path d="M34 46Q40 43 48 49Q57 56 58 67L85 57Q98 49 87 36Q74 20 57 29Z" fill="#6bbec6"/><path d="M55 40Q65 42 69 50" fill="none"/></g></svg>` },
    ],
  },
  {
    letter: "У",
    say: "У! Ууутка",
    file: "bukva-u",
    words: [
      { word: "Утка", art: "have:Утка" },
      { word: "Улитка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="m73 48-5-18m14 17 7-20" fill="none"/><circle cx="68" cy="28" r="4" fill="#3b2e25"/><circle cx="89" cy="25" r="4" fill="#3b2e25"/><path d="M7 74Q24 71 32 60L60 64Q68 62 67 53Q65 42 77 42Q94 40 92 57Q91 76 70 80H24Q12 80 7 74Z" fill="#99ce80"/><circle cx="39" cy="49" r="26" fill="#ffb363"/><path d="M57 57Q52 73 35 66Q20 60 25 45Q29 33 42 36Q54 39 49 50Q46 57 39 54Q34 52 37 47" fill="none"/></g></svg>` },
      { word: "Удочка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M76 19Q86 33 83 57V78Q83 88 76 87Q70 86 72 77L75 80" fill="none"/><path d="M16 82Q41 27 73 16Q78 14 79 19Q48 32 22 85Z" fill="#e7ad66"/><path d="m19 67 10 5-10 20q-2 3-6 1l-4-3Z" fill="#df875a"/><circle cx="33" cy="67" r="8" fill="#80c6d7"/><ellipse cx="83" cy="59" rx="5" ry="9" fill="#ff806e"/></g></svg>` },
    ],
  },
  {
    letter: "Ф",
    say: "Ф! Фффлажок",
    file: "bukva-f",
    words: [
      { word: "Флажок", art: "have:Флажок" },
      { word: "Фонарь", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(38 50 50)" stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><rect x="37" y="40" width="26" height="48" rx="8" fill="#63baba"/><path d="M27 20H73L69 37 60 47H40L31 37Z" fill="#76cdd0"/><ellipse cx="50" cy="20" rx="23" ry="8" fill="#fff3ac"/><rect x="46" y="52" width="8" height="13" rx="4" fill="#ffb55f"/></g></svg>` },
      { word: "Фартук", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M35 30V20Q35 7 50 7Q65 7 65 20V30H59V20Q59 13 50 13Q41 13 41 20V30Z" fill="#ffd275"/><path d="m27 50-20 7 2 6 20-7m44-6 20 7-2 6-20-7" fill="#ffd275"/><path d="M35 25H65Q65 43 75 48L81 88Q50 95 19 88L25 48Q35 43 35 25Z" fill="#ff9484"/><path d="M34 58H66V65Q66 77 50 77Q34 77 34 65Z" fill="#ffcf78"/></g></svg>` },
    ],
  },
  {
    letter: "Х",
    say: "Х! Хххлеб",
    file: "bukva-h",
    words: [
      { word: "Хлеб", art: "have:Хлеб" },
      { word: "Хомяк", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="34" cy="84" rx="10" ry="5" fill="#f6ad99"/><ellipse cx="66" cy="84" rx="10" ry="5" fill="#f6ad99"/><path d="M25 35C13 16 31 8 41 22Q50 18 59 22C70 8 87 17 75 35Q87 50 81 65Q82 87 50 86Q18 87 19 65Q13 49 25 35Z" fill="#e6a55e"/><path d="M21 52Q32 41 43 51Q50 56 57 51Q69 41 79 52Q85 67 69 70Q69 83 50 84Q31 83 31 70Q15 67 21 52Z" fill="#fff0cd"/><circle cx="36" cy="40" r="3" fill="#3b2e25"/><circle cx="64" cy="40" r="3" fill="#3b2e25"/><path d="M45 50Q50 46 55 50L50 55Z" fill="#ef9a90"/><path d="M50 55Q46 61 42 56M50 55Q54 61 58 56" fill="none"/></g></svg>` },
      { word: "Халат", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="m37 14-16 8-14 30 13 7 10-19-6 48q26 7 52 0l-6-48 10 19 13-7-14-30-16-8Z" fill="#87cdda"/><path d="m37 14 13 22 13-22-6-3H43Z" fill="#e3f6ee"/><path d="m37 14 21 35m5-35L40 53l-4 36" fill="none"/><path d="M28 52Q50 57 72 52L73 59Q50 64 27 59Z" fill="#ffce76"/><path d="m54 58 8 14 6-4-9-12Z" fill="#ffce76"/></g></svg>` },
    ],
  },
  {
    letter: "Ц",
    say: "Ц! Цветок",
    file: "bukva-ts",
    words: [
      { word: "Цветок", art: "have:Цветок" },
      { word: "Цыплёнок", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M42 72v13l-9 3m9-3 6 3m12-16v13l-6 3m6-3 8 3" fill="none"/><path d="M22 49Q17 51 10 43Q8 61 23 67Q33 80 55 76Q76 74 77 54Q89 44 82 29Q73 11 54 18Q42 23 43 39Q29 36 22 49Z" fill="#ffda61"/><path d="m82 34 12 6-12 6Z" fill="#ff9c50"/><circle cx="72" cy="32" r="3" fill="#3b2e25"/><path d="M32 50Q46 45 56 52Q47 68 32 59" fill="#ffbf4f"/></g></svg>` },
      { word: "Цирк", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M50 25V6l18 5-18 6" fill="#ffbf4e"/><path d="M13 49H87V88H13Z" fill="#fff1ca"/><path d="M20 51H30V88H20ZM70 51H80V88H70Z" fill="#f48377"/><path d="M34 88Q45 68 43 51H57Q55 68 66 88Z" fill="#71718d"/><path d="M50 21Q33 40 7 48Q9 60 20 54Q29 62 39 54Q50 63 61 54Q71 62 80 54Q91 60 93 48Q67 40 50 21Z" fill="#ff9586"/><path d="M50 21Q43 42 39 54Q29 62 20 54Q40 38 50 21ZM50 21Q57 42 61 54Q71 62 80 54Q60 38 50 21Z" fill="#fff1ca"/></g></svg>` },
    ],
  },
  {
    letter: "Ч",
    say: "Ч! Чашка",
    file: "bukva-ch",
    words: [
      { word: "Чашка", art: "have:Чашка" },
      { word: "Чайник", art: "have:Чайник" },
      { word: "Черепаха", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="m22 58-16-3 12 11m6-4-3 13q4 5 11 2l4-13m19-1 2 14q6 4 12-1l-2-14" fill="#93c778"/><path d="M61 60Q70 57 71 45Q73 31 85 33Q97 35 94 48Q93 58 81 57Q75 69 63 68Z" fill="#a4d78a"/><path d="M13 60Q16 28 41 26Q65 24 73 60Q46 73 13 60Z" fill="#78b882"/><path d="m29 31 5 12 17 2 8-12M34 43l-9 15m26-13 11 14" fill="none"/><path d="M13 58Q42 67 73 58L74 64Q44 76 12 64Z" fill="#e0c77b"/><circle cx="85" cy="41" r="2" fill="#3b2e25"/></g></svg>` },
    ],
  },
  {
    letter: "Ш",
    say: "Ш! Шшшарик",
    file: "bukva-sh",
    words: [
      { word: "Шарик", art: "have:Шарик" },
      { word: "Шапка", art: "have:Шапка" },
      { word: "Шишка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M47 23Q45 14 53 7L59 11Q51 16 53 23Z" fill="#947054"/><path d="M50 18Q68 18 77 40Q89 66 60 85Q51 94 44 88Q15 71 20 49Q25 24 50 18Z" fill="#cc905b"/><path d="M32 28Q34 38 44 41Q54 38 57 28M53 36Q60 45 70 40M23 44Q27 53 36 55Q45 52 47 45Q52 55 61 57Q71 54 76 47M23 60Q28 68 36 69M36 58Q39 68 48 72Q58 69 61 61M58 70Q64 73 70 68M37 77Q42 80 47 79Q50 85 55 86" fill="none"/></g></svg>` },
    ],
  },
  {
    letter: "Щ",
    say: "Щ! Щука",
    file: "bukva-shch",
    words: [
      { word: "Щука", art: "have:Щука" },
      { word: "Щётка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-22 50 50)" stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M12 47H60L58 65H11Z" fill="#ffe39b"/><path d="m19 53-1 11m10-11-1 12m10-12-1 12m10-12-1 12m10-12-1 12" fill="none"/><path d="M9 43Q9 37 16 37H52Q60 37 63 41L86 39Q94 38 94 45Q94 51 86 50L63 48Q60 52 54 52H15Q9 52 9 47Z" fill="#65b9bc"/><circle cx="86" cy="45" r="2" fill="#fff0cd"/></g></svg>` },
      { word: "Щенок", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M24 40Q24 17 50 16Q76 17 76 40L77 57Q78 81 50 85Q22 81 23 57Z" fill="#efbd82"/><path d="M31 25Q25 16 16 26Q5 39 7 58Q8 69 18 63Q30 55 31 25ZM69 25Q75 16 84 26Q95 39 93 58Q92 69 82 63Q70 55 69 25Z" fill="#b77b56"/><ellipse cx="50" cy="64" rx="21" ry="15" fill="#ffe6bb"/><circle cx="37" cy="45" r="3" fill="#3b2e25"/><circle cx="63" cy="45" r="3" fill="#3b2e25"/><path d="M43 57Q50 52 57 57Q56 63 50 65Q44 63 43 57Z" fill="#514038"/><path d="M50 65Q45 72 40 66M50 65Q55 72 60 66" fill="none"/></g></svg>` },
    ],
  },
  {
    letter: "Ъ",
    say: "Твёрдый знак. Разделяет звуки.",
    file: "bukva-tverdyj",
    words: [
      { word: "подЪёмный кран", art: "have:подЪёмный кран" },
      { word: "подЪёмник", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="m6 29 88-21M50 19l4 14-5 8" fill="none"/><circle cx="49" cy="19" r="5" fill="#829ba7"/><path d="M31 39H68Q77 39 80 49L85 72Q88 87 74 89H27Q13 87 16 73L21 49Q23 39 31 39Z" fill="#f28c73"/><path d="M29 46H46V66H22ZM54 46H70L77 66H54Z" fill="#c2eaf1"/><path d="M50 69V86m-7-12h2" fill="none"/></g></svg>` },
    ],
  },
  {
    letter: "Ы",
    say: "Ы! Сыыыр",
    file: "bukva-y",
    words: [
      { word: "сЫр", art: "have:сЫр" },
      { word: "мЫшь", art: "have:мЫшь" },
      { word: "дЫня", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="42" cy="44" rx="34" ry="26" fill="#f9cc61"/><path d="M15 40Q38 18 65 29M14 49Q33 27 70 35" fill="none"/><path d="M10 45Q5 44 6 37" fill="none"/><path d="M26 60 92 42Q94 71 69 81Q44 91 26 60Z" fill="#a7ba71"/><path d="m28 59 62-17Q86 65 66 73Q44 79 28 59Z" fill="#ffe8a0"/><path d="M47 58Q58 53 77 50Q69 60 56 62Z" fill="#efbc72"/><path d="m57 57 2 1m7-4 2 1" fill="none"/></g></svg>` },
    ],
  },
  {
    letter: "Ь",
    say: "Мягкий знак. Делает звук мягким.",
    file: "bukva-myagkij",
    words: [
      { word: "конЬ", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M24 44Q9 36 8 51Q8 62 5 65Q19 68 21 53Z" fill="#865c46"/><path d="m24 56-4 28h8l9-23m18-3 3 26h8l-1-31" fill="#c3865e"/><path d="M20 48Q23 38 37 40L50 41Q52 25 63 20L64 9 73 18 78 12 80 24 92 39Q96 46 86 49L72 43 65 58 58 63 53 86H45L47 62H34L36 86H27L23 62Q18 56 20 48Z" fill="#e4a16e"/><path d="M65 19Q50 16 45 31L41 39 50 37 47 46Q59 40 62 29Z" fill="#936344"/><circle cx="76" cy="29" r="2" fill="#3b2e25"/><circle cx="88" cy="41" r="1.5" fill="#3b2e25"/></g></svg>` },
      { word: "мышЬ", art: "have:мышЬ" },
      { word: "пенЬ", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M23 35H76L75 55 81 49 87 54 77 66Q78 75 90 83Q78 88 67 81Q60 91 50 84Q35 92 29 82Q17 87 8 82Q22 70 23 57Z" fill="#c79161"/><ellipse cx="50" cy="34" rx="28" ry="13" fill="#f6d598"/><ellipse cx="50" cy="34" rx="17" ry="7" fill="none"/><path d="M45 34Q50 30 56 34M33 49Q35 64 29 74m17-18-2 19m18-26q-3 13 2 24" fill="none"/></g></svg>` },
    ],
  },
  {
    letter: "Э",
    say: "Э! Эээскимо",
    file: "bukva-eh",
    words: [
      { word: "Эскимо", art: "have:Эскимо" },
      { word: "Экран", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M44 64H56L58 78 69 80V84H31V80L42 78Z" fill="#a4b6c3"/><rect x="7" y="16" width="86" height="54" rx="7" fill="#788e9d"/><rect x="13" y="22" width="74" height="41" rx="3" fill="#a4e1ed"/><path d="m21 42 12-12m-5 17 14-14" fill="none" stroke="#3b2e25"/></g></svg>` },
      { word: "Экскаватор", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="m43 54 14-34q2-5 7-1l20 23-4 7-19-19-9 29Z" fill="#ffc151"/><path d="m78 43 7-3 6 24-7 2Z" fill="#efaa4e"/><path d="M85 59Q89 62 94 61Q97 74 85 78Q76 80 69 71L79 70Z" fill="#91a3a9"/><rect x="7" y="66" width="53" height="16" rx="8" fill="#72818a"/><path d="M10 54H17V33Q17 29 21 29H37L44 51H54V66H10Z" fill="#ffd065"/><path d="M22 34H33L38 49H22Z" fill="#b4e6ee"/><circle cx="18" cy="74" r="3" fill="#d3d9d8"/><circle cx="33" cy="74" r="3" fill="#d3d9d8"/><circle cx="48" cy="74" r="3" fill="#d3d9d8"/></g></svg>` },
    ],
  },
  {
    letter: "Ю",
    say: "Юла!",
    file: "bukva-yu",
    words: [
      { word: "Юла", art: "have:Юла" },
      { word: "Юбка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M32 25H68Q73 48 90 75Q79 84 66 79Q54 86 42 81Q24 85 10 76Q27 48 32 25Z" fill="#ee91ae"/><path d="M30 20Q50 24 70 20L69 31Q50 35 31 31Z" fill="#ffca77"/><path d="M39 39Q37 55 27 71m22-31-2 32m12-33q4 17 13 32" fill="none"/></g></svg>` },
      { word: "Юрта", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M9 48Q25 27 43 23H57Q76 28 91 48L88 79Q51 90 12 79Z" fill="#ffe1ae"/><path d="M9 48Q47 62 91 48M13 72Q50 83 88 72" fill="none"/><path d="M38 84V57Q49 54 61 57V84Z" fill="#b67c58"/><path d="M44 82V62H55V83Z" fill="#745849"/><ellipse cx="50" cy="24" rx="10" ry="4" fill="#e59066"/><path d="m36 32-12 12m39-12 13 12" fill="none"/></g></svg>` },
    ],
  },
  {
    letter: "Я",
    say: "Яблоко!",
    file: "bukva-ya",
    words: [
      { word: "Яблоко", art: "have:Яблоко" },
      { word: "Ягода", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M49 28Q24 18 17 40Q10 60 40 84Q50 94 60 83Q87 59 83 41Q80 20 55 28Z" fill="#ff807a"/><path d="M48 29Q42 18 29 20L38 30 24 34Q35 40 46 36L49 47 56 36Q67 41 76 35L62 28 70 21Q57 19 52 27Q53 16 61 11L56 7Q47 12 48 29Z" fill="#83bf75"/><path d="m29 46 1 3m11 1 1 3m17-5-1 3m13-6-1 3M34 60l2 3m14-4v3m14-3-2 3m-19 7 2 3m10-3-1 3" fill="none"/></g></svg>` },
      { word: "Якорь", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M45 23H55V68Q68 67 77 53L68 52 89 40 91 63 85 59Q78 77 59 81L50 89 41 81Q22 77 15 59L9 63 11 40 32 52 23 53Q32 67 45 68Z" fill="#82b6cd"/><rect x="30" y="31" width="40" height="8" rx="4" fill="#a1ccdc"/><circle cx="50" cy="18" r="11" fill="#82b6cd"/><circle cx="50" cy="18" r="4" fill="#fff4d9"/></g></svg>` },
    ],
  },
];

export type FirstLetterLevel = { id: string; world: "fl-easy" | "fl-mid" | "fl-hard"; title: string; rounds: { word: string; options: string[]; answer: string }[] };

/** v23 «На какую букву?» (Astra, brief 24-3). «Метла» (there is no picture, the broom is «Веник») → «Лодка». */
export const FIRST_LETTER_LEVELS: FirstLetterLevel[] = [
  {
    "id": "fl1",
    "world": "fl-easy",
    "title": "Рыжик зовёт",
    "rounds": [
      {
        "word": "Арбуз",
        "options": [
          "А",
          "М"
        ],
        "answer": "А"
      },
      {
        "word": "Мячик",
        "options": [
          "О",
          "М"
        ],
        "answer": "М"
      },
      {
        "word": "Банан",
        "options": [
          "У",
          "Б"
        ],
        "answer": "Б"
      },
      {
        "word": "Лодка",
        "options": [
          "Л",
          "Э"
        ],
        "answer": "Л"
      }
    ]
  },
  {
    "id": "fl2",
    "world": "fl-easy",
    "title": "Лёгкое облако",
    "rounds": [
      {
        "word": "Облако",
        "options": [
          "Ш",
          "О"
        ],
        "answer": "О"
      },
      {
        "word": "Шарик",
        "options": [
          "Ш",
          "А"
        ],
        "answer": "Ш"
      },
      {
        "word": "Торт",
        "options": [
          "Т",
          "О"
        ],
        "answer": "Т"
      },
      {
        "word": "Утка",
        "options": [
          "М",
          "У"
        ],
        "answer": "У"
      }
    ]
  },
  {
    "id": "fl3",
    "world": "fl-easy",
    "title": "У озёрка",
    "rounds": [
      {
        "word": "Дом",
        "options": [
          "Д",
          "С"
        ],
        "answer": "Д"
      },
      {
        "word": "Рыбка",
        "options": [
          "Ш",
          "Р"
        ],
        "answer": "Р"
      },
      {
        "word": "Флажок",
        "options": [
          "Ф",
          "А"
        ],
        "answer": "Ф"
      },
      {
        "word": "Зонтик",
        "options": [
          "Л",
          "З"
        ],
        "answer": "З"
      }
    ]
  },
  {
    "id": "fl4",
    "world": "fl-easy",
    "title": "Под берёзой",
    "rounds": [
      {
        "word": "Кубик",
        "options": [
          "О",
          "К"
        ],
        "answer": "К"
      },
      {
        "word": "Солнце",
        "options": [
          "С",
          "М"
        ],
        "answer": "С"
      },
      {
        "word": "Гриб",
        "options": [
          "А",
          "Г"
        ],
        "answer": "Г"
      },
      {
        "word": "Чашка",
        "options": [
          "Ч",
          "О"
        ],
        "answer": "Ч"
      }
    ]
  },
  {
    "id": "fl5",
    "world": "fl-easy",
    "title": "Тёплый хлеб",
    "rounds": [
      {
        "word": "Иголка",
        "options": [
          "И",
          "О"
        ],
        "answer": "И"
      },
      {
        "word": "Лампа",
        "options": [
          "С",
          "Л"
        ],
        "answer": "Л"
      },
      {
        "word": "Мыло",
        "options": [
          "Э",
          "М"
        ],
        "answer": "М"
      },
      {
        "word": "Хлеб",
        "options": [
          "Х",
          "Б"
        ],
        "answer": "Х"
      }
    ]
  },
  {
    "id": "fl6",
    "world": "fl-easy",
    "title": "В гости к ёжику",
    "rounds": [
      {
        "word": "Ёжик",
        "options": [
          "Л",
          "Ё"
        ],
        "answer": "Ё"
      },
      {
        "word": "Носок",
        "options": [
          "Н",
          "О"
        ],
        "answer": "Н"
      },
      {
        "word": "Шапка",
        "options": [
          "Ш",
          "У"
        ],
        "answer": "Ш"
      },
      {
        "word": "Вишня",
        "options": [
          "А",
          "В"
        ],
        "answer": "В"
      }
    ]
  },
  {
    "id": "fl7",
    "world": "fl-easy",
    "title": "Зелёный листик",
    "rounds": [
      {
        "word": "Груша",
        "options": [
          "Г",
          "О"
        ],
        "answer": "Г"
      },
      {
        "word": "Морковка",
        "options": [
          "С",
          "М"
        ],
        "answer": "М"
      },
      {
        "word": "Капелька",
        "options": [
          "К",
          "У"
        ],
        "answer": "К"
      },
      {
        "word": "Листик",
        "options": [
          "Э",
          "Л"
        ],
        "answer": "Л"
      }
    ]
  },
  {
    "id": "fl8",
    "world": "fl-easy",
    "title": "Весёлый чайник",
    "rounds": [
      {
        "word": "Стул",
        "options": [
          "А",
          "С"
        ],
        "answer": "С"
      },
      {
        "word": "Чайник",
        "options": [
          "Ч",
          "О"
        ],
        "answer": "Ч"
      },
      {
        "word": "Машинка",
        "options": [
          "У",
          "М"
        ],
        "answer": "М"
      },
      {
        "word": "Варежка",
        "options": [
          "В",
          "Л"
        ],
        "answer": "В"
      }
    ]
  },
  {
    "id": "fl9",
    "world": "fl-mid",
    "title": "Пёстрый цветок",
    "rounds": [
      {
        "word": "Цветок",
        "options": [
          "М",
          "Ц",
          "О"
        ],
        "answer": "Ц"
      },
      {
        "word": "Жук",
        "options": [
          "Ж",
          "Л",
          "А"
        ],
        "answer": "Ж"
      },
      {
        "word": "Пчела",
        "options": [
          "У",
          "С",
          "П"
        ],
        "answer": "П"
      },
      {
        "word": "Щука",
        "options": [
          "Т",
          "Щ",
          "О"
        ],
        "answer": "Щ"
      }
    ]
  },
  {
    "id": "fl10",
    "world": "fl-mid",
    "title": "Юла поёт",
    "rounds": [
      {
        "word": "Юла",
        "options": [
          "К",
          "Ш",
          "Ю"
        ],
        "answer": "Ю"
      },
      {
        "word": "Яблоко",
        "options": [
          "Л",
          "Я",
          "С"
        ],
        "answer": "Я"
      },
      {
        "word": "Эскимо",
        "options": [
          "Э",
          "М",
          "Т"
        ],
        "answer": "Э"
      },
      {
        "word": "Звезда",
        "options": [
          "А",
          "Ч",
          "З"
        ],
        "answer": "З"
      }
    ]
  },
  {
    "id": "fl11",
    "world": "fl-mid",
    "title": "Кораблик плывёт",
    "rounds": [
      {
        "word": "Кораблик",
        "options": [
          "К",
          "О",
          "Ш"
        ],
        "answer": "К"
      },
      {
        "word": "Домик",
        "options": [
          "У",
          "Ф",
          "Д"
        ],
        "answer": "Д"
      },
      {
        "word": "Сапог",
        "options": [
          "М",
          "С",
          "Т"
        ],
        "answer": "С"
      },
      {
        "word": "Мишка",
        "options": [
          "М",
          "Р",
          "Э"
        ],
        "answer": "М"
      }
    ]
  },
  {
    "id": "fl12",
    "world": "fl-mid",
    "title": "Синее ведёрко",
    "rounds": [
      {
        "word": "Ведёрко",
        "options": [
          "О",
          "В",
          "К"
        ],
        "answer": "В"
      },
      {
        "word": "Часы",
        "options": [
          "Ч",
          "А",
          "Л"
        ],
        "answer": "Ч"
      },
      {
        "word": "Мороженое",
        "options": [
          "Ф",
          "У",
          "М"
        ],
        "answer": "М"
      },
      {
        "word": "Лодка",
        "options": [
          "С",
          "Л",
          "Д"
        ],
        "answer": "Л"
      }
    ]
  },
  {
    "id": "fl13",
    "world": "fl-mid",
    "title": "Что везём?",
    "rounds": [
      {
        "word": "Чемодан",
        "options": [
          "Р",
          "О",
          "Ч"
        ],
        "answer": "Ч"
      },
      {
        "word": "Монетка",
        "options": [
          "М",
          "Т",
          "Э"
        ],
        "answer": "М"
      },
      {
        "word": "Подарок",
        "options": [
          "А",
          "П",
          "З"
        ],
        "answer": "П"
      },
      {
        "word": "Окошко",
        "options": [
          "Л",
          "Ш",
          "О"
        ],
        "answer": "О"
      }
    ]
  },
  {
    "id": "fl14",
    "world": "fl-mid",
    "title": "Угощение для ёжика",
    "rounds": [
      {
        "word": "Ёжик",
        "options": [
          "Ё",
          "К",
          "С"
        ],
        "answer": "Ё"
      },
      {
        "word": "Груша",
        "options": [
          "М",
          "Г",
          "О"
        ],
        "answer": "Г"
      },
      {
        "word": "Вишня",
        "options": [
          "Л",
          "У",
          "В"
        ],
        "answer": "В"
      },
      {
        "word": "Яблоко",
        "options": [
          "Я",
          "П",
          "Ш"
        ],
        "answer": "Я"
      }
    ]
  },
  {
    "id": "fl15",
    "world": "fl-mid",
    "title": "Ковёр для игрушек",
    "rounds": [
      {
        "word": "Кубик",
        "options": [
          "О",
          "К",
          "Ф"
        ],
        "answer": "К"
      },
      {
        "word": "Мячик",
        "options": [
          "С",
          "Т",
          "М"
        ],
        "answer": "М"
      },
      {
        "word": "Юла",
        "options": [
          "Ю",
          "А",
          "Ш"
        ],
        "answer": "Ю"
      },
      {
        "word": "Шарик",
        "options": [
          "Р",
          "Ш",
          "У"
        ],
        "answer": "Ш"
      }
    ]
  },
  {
    "id": "fl16",
    "world": "fl-mid",
    "title": "Тёплый дождик",
    "rounds": [
      {
        "word": "Облако",
        "options": [
          "Т",
          "М",
          "О"
        ],
        "answer": "О"
      },
      {
        "word": "Капелька",
        "options": [
          "К",
          "А",
          "С"
        ],
        "answer": "К"
      },
      {
        "word": "Зонтик",
        "options": [
          "Л",
          "З",
          "У"
        ],
        "answer": "З"
      },
      {
        "word": "Солнце",
        "options": [
          "С",
          "П",
          "Я"
        ],
        "answer": "С"
      }
    ]
  },
  {
    "id": "fl17",
    "world": "fl-hard",
    "title": "Ёжик слушает",
    "rounds": [
      {
        "word": "Ёжик",
        "options": [
          "Е",
          "Ё",
          "Э"
        ],
        "answer": "Ё"
      },
      {
        "word": "Шапка",
        "options": [
          "Щ",
          "Ж",
          "Ш"
        ],
        "answer": "Ш"
      },
      {
        "word": "Щука",
        "options": [
          "Щ",
          "Ч",
          "Ш"
        ],
        "answer": "Щ"
      },
      {
        "word": "Жук",
        "options": [
          "Ш",
          "Ж",
          "З"
        ],
        "answer": "Ж"
      }
    ]
  },
  {
    "id": "fl18",
    "world": "fl-hard",
    "title": "Звонкое ведёрко",
    "rounds": [
      {
        "word": "Банан",
        "options": [
          "Б",
          "В",
          "П"
        ],
        "answer": "Б"
      },
      {
        "word": "Ведёрко",
        "options": [
          "Ф",
          "Б",
          "В"
        ],
        "answer": "В"
      },
      {
        "word": "Подарок",
        "options": [
          "Н",
          "П",
          "Б"
        ],
        "answer": "П"
      },
      {
        "word": "Носок",
        "options": [
          "Н",
          "П",
          "И"
        ],
        "answer": "Н"
      }
    ]
  },
  {
    "id": "fl19",
    "world": "fl-hard",
    "title": "Звёздное небо",
    "rounds": [
      {
        "word": "Звезда",
        "options": [
          "С",
          "Э",
          "З"
        ],
        "answer": "З"
      },
      {
        "word": "Солнце",
        "options": [
          "З",
          "С",
          "О"
        ],
        "answer": "С"
      },
      {
        "word": "Эскимо",
        "options": [
          "Э",
          "З",
          "С"
        ],
        "answer": "Э"
      },
      {
        "word": "Окошко",
        "options": [
          "С",
          "Ф",
          "О"
        ],
        "answer": "О"
      }
    ]
  },
  {
    "id": "fl20",
    "world": "fl-hard",
    "title": "Торт со свечёй",
    "rounds": [
      {
        "word": "Торт",
        "options": [
          "Г",
          "Т",
          "Д"
        ],
        "answer": "Т"
      },
      {
        "word": "Домик",
        "options": [
          "Т",
          "А",
          "Д"
        ],
        "answer": "Д"
      },
      {
        "word": "Кубик",
        "options": [
          "К",
          "Г",
          "Х"
        ],
        "answer": "К"
      },
      {
        "word": "Груша",
        "options": [
          "Т",
          "Г",
          "К"
        ],
        "answer": "Г"
      }
    ]
  },
  {
    "id": "fl21",
    "world": "fl-hard",
    "title": "Пчёлки жужжат",
    "rounds": [
      {
        "word": "Пчела",
        "options": [
          "Б",
          "Н",
          "П"
        ],
        "answer": "П"
      },
      {
        "word": "Жук",
        "options": [
          "Ж",
          "Ш",
          "З"
        ],
        "answer": "Ж"
      },
      {
        "word": "Цветок",
        "options": [
          "Щ",
          "Ц",
          "Ч"
        ],
        "answer": "Ц"
      },
      {
        "word": "Шарик",
        "options": [
          "Ж",
          "Щ",
          "Ш"
        ],
        "answer": "Ш"
      }
    ]
  },
  {
    "id": "fl22",
    "world": "fl-hard",
    "title": "Берём на прогулку",
    "rounds": [
      {
        "word": "Флажок",
        "options": [
          "Ф",
          "В",
          "О"
        ],
        "answer": "Ф"
      },
      {
        "word": "Варежка",
        "options": [
          "Б",
          "В",
          "Ф"
        ],
        "answer": "В"
      },
      {
        "word": "Сапог",
        "options": [
          "О",
          "З",
          "С"
        ],
        "answer": "С"
      },
      {
        "word": "Зонтик",
        "options": [
          "З",
          "Э",
          "С"
        ],
        "answer": "З"
      }
    ]
  },
  {
    "id": "fl23",
    "world": "fl-hard",
    "title": "Огонёк в окошке",
    "rounds": [
      {
        "word": "Лампа",
        "options": [
          "А",
          "Л",
          "П"
        ],
        "answer": "Л"
      },
      {
        "word": "Чайник",
        "options": [
          "Ч",
          "Ц",
          "Щ"
        ],
        "answer": "Ч"
      },
      {
        "word": "Стул",
        "options": [
          "З",
          "О",
          "С"
        ],
        "answer": "С"
      },
      {
        "word": "Дом",
        "options": [
          "А",
          "Д",
          "Т"
        ],
        "answer": "Д"
      }
    ]
  },
  {
    "id": "fl24",
    "world": "fl-hard",
    "title": "Ещё поиграем?",
    "rounds": [
      {
        "word": "Щука",
        "options": [
          "Ч",
          "Ш",
          "Щ"
        ],
        "answer": "Щ"
      },
      {
        "word": "Ёжик",
        "options": [
          "Ё",
          "Е",
          "Э"
        ],
        "answer": "Ё"
      },
      {
        "word": "Банан",
        "options": [
          "П",
          "Б",
          "В"
        ],
        "answer": "Б"
      },
      {
        "word": "Шапка",
        "options": [
          "Щ",
          "Ж",
          "Ш"
        ],
        "answer": "Ш"
      }
    ]
  }
];
