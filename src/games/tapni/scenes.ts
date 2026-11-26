import { OBJECTS, type ObjectId } from "../../shared/objects";
import type { SoundKind } from "../../shared/sounds";
import type { Motion, Touchable } from "../../shared/toys";
import { SHAPES } from "../teni/shapes";

/**
 * «Тапни и послушай»: calm scenes where every thing answers a touch with its
 * sound, a little move and a word. No tasks, no score, nothing goes wrong.
 * Pictures are the shared objects, the «Тени» pictures, or a local EXTRA set for a new theme.
 */
type Spot = Touchable & { x: number; y: number };
export type TapScene = { id: string; title: string; icon: string; spots: Spot[] };

export const EXTRA: Record<string, { name: string; svg: string }> = {
  fish: { name: "Рыбка", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f39758" d="M33 49L11 32Q6 48 11 68L33 55Z"/><path fill="#ffc561" d="M26 51Q40 18 70 31Q84 36 91 50Q81 72 59 74Q38 75 26 51Z"/><path fill="#ee9258" d="M53 50Q47 49 40 54Q45 62 55 60Z"/><path fill="none" d="M79 56Q84 59 88 54"/><circle cx="73" cy="44" r="3" fill="#3b2e25"/></g></svg>` },
  jelly: { name: "Медуза", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f5a4aa" d="M26 49Q20 62 27 69Q32 75 26 79Q24 85 31 84Q44 77 36 64Q32 58 38 51ZM47 50Q40 65 47 74Q51 80 47 85Q46 90 52 88Q63 79 55 68Q51 61 58 51ZM67 51Q61 61 69 69Q75 75 70 79Q68 84 75 82Q86 74 78 64Q73 58 78 51Z"/><path fill="#efb6d2" d="M14 52C15 27 31 13 50 13S85 27 86 52Q80 62 72 54Q64 63 56 55Q48 64 40 55Q31 63 24 54Q18 60 14 52Z"/><path fill="none" d="M27 38Q31 28 42 25"/></g></svg>` },
  lighthouse: { name: "Маяк", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#fff0cf" d="M39 40H61L71 88H29Z"/><path fill="#e98168" d="M36 55H64L67 69H33Z"/><path fill="#ffd66f" d="M36 22H64V41H36Z"/><path fill="#e98168" d="M30 23L50 8L70 23Z"/><path fill="none" d="M50 25V39M31 41H69M24 88H76"/><path fill="#977259" d="M45 87V79A5 5 0 0 1 55 79V87Z"/></g></svg>` },
  wave: { name: "Волна", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#65c9c2" d="M9 66Q25 65 34 44C43 21 63 13 82 28C65 26 57 41 65 54Q74 68 91 57Q84 82 56 83Q29 85 9 72Z"/><path fill="#fff1d5" d="M34 44C43 21 63 13 82 28C71 27 64 33 62 42Q55 48 52 40Q46 48 43 42Q38 49 34 44Z"/><path fill="none" d="M27 70Q40 66 46 55"/></g></svg>` },
  dolphin: { name: "Дельфин", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#86c4d6" d="M15 66Q17 48 34 37Q35 27 28 19Q44 19 51 31C66 25 81 31 83 43L92 47Q97 53 84 54Q70 64 55 61Q52 72 40 75Q43 67 42 61Q28 60 21 69Q20 80 10 84Q13 76 11 72Q5 70 4 62Q11 62 15 66Z"/><circle cx="74" cy="42" r="2.5" fill="#3b2e25"/><path fill="none" d="M77 51Q81 54 85 53"/></g></svg>` },
  shell: { name: "Ракушка", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f5b198" d="M40 79C29 73 9 59 10 45Q10 35 20 34Q18 22 31 23Q36 11 48 19Q59 9 68 22Q81 18 83 32Q94 34 90 48Q87 63 59 79L61 86H38Z"/><path fill="none" d="M21 39Q26 56 43 72M33 29L46 69M50 25V68M66 28L54 69M80 38Q72 58 58 72"/></g></svg>` },
  crab: { name: "Крабик", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="none" d="M33 59L18 57L10 64M33 65L19 68L14 76M67 59L82 57L90 64M67 65L81 68L86 76"/><path fill="#f18b67" d="M31 55Q19 53 15 46Q4 42 8 26L17 34L22 22Q34 32 23 44L35 48ZM69 55Q81 53 85 46Q96 42 92 26L83 34L78 22Q66 32 77 44L65 48Z"/><ellipse cx="50" cy="58" rx="26" ry="17" fill="#ffa17b"/><circle cx="41" cy="44" r="5" fill="#fff1d5"/><circle cx="59" cy="44" r="5" fill="#fff1d5"/><path fill="none" d="M41 44h.1M59 44h.1M44 60Q50 66 56 60"/></g></svg>` },
  starfish: { name: "Морская звезда", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f5ab63" d="M46 15Q50 6 54 16L61 38L84 36Q96 35 87 45L69 59L77 81Q80 92 69 86L50 72L31 86Q20 92 23 81L31 59L13 45Q4 35 16 36L39 38Z"/><g fill="#d98054" stroke="none"><circle cx="50" cy="31" r="3"/><circle cx="30" cy="46" r="3"/><circle cx="70" cy="46" r="3"/><circle cx="36" cy="71" r="3"/><circle cx="64" cy="71" r="3"/><circle cx="50" cy="53" r="5"/></g></g></svg>` },
  crown: { name: "Корона", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#ffd66f" d="M14 70L20 34L36 54L50 22L64 54L80 34L86 70Z"/><path fill="#f5a623" d="M14 70H86V82H14Z"/><circle cx="20" cy="34" r="6" fill="#e98168"/><circle cx="50" cy="22" r="6" fill="#e98168"/><circle cx="80" cy="34" r="6" fill="#65c9c2"/></g></svg>` },
  guitar: { name: "Гитара", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="36" cy="66" rx="24" ry="26" fill="#e8a05a"/><ellipse cx="36" cy="66" rx="9" ry="9" fill="#fff1d5"/><path fill="#d08948" d="M44 46L84 16L90 24L50 54Z"/><path fill="none" d="M49 50L86 22M52 54L88 26"/><circle cx="36" cy="66" r="3" fill="#3b2e25"/><path fill="#3b2e25" d="M84 16L92 12L96 18L90 24Z"/></g></svg>` },
  // v23 (Astra): «Лес»
  hedgehog: { name: "Ёжик", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><ellipse cx=\"31\" cy=\"74\" rx=\"9\" ry=\"5\" fill=\"#bb8055\"/><ellipse cx=\"65\" cy=\"74\" rx=\"9\" ry=\"5\" fill=\"#bb8055\"/><path d=\"M13 66L6 57L15 54L9 42L21 43L19 29L31 34L36 19L45 29L55 17L59 31L71 24L70 40Q79 49 78 60Q66 79 37 74Q21 74 13 66Z\" fill=\"#a97654\"/><path d=\"M48 61Q60 53 65 38Q75 34 81 48Q84 55 94 55Q94 68 75 72Q55 77 45 69\" fill=\"#ffdaaa\"/><path d=\"M26 53L31 47M40 42L44 36\" fill=\"none\"/></g><circle cx=\"76\" cy=\"51\" r=\"3\" fill=\"#3b2e25\"/><ellipse cx=\"92\" cy=\"56\" rx=\"5\" ry=\"4\" fill=\"#3b2e25\"/></svg>" },
  squirrel: { name: "Белка", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M51 82C23 92 8 70 13 52C17 39 26 38 19 31C8 22 19 8 32 12C55 17 53 39 42 54Q31 69 53 71Z\" fill=\"#e88943\"/><path d=\"M24 72Q15 62 25 49Q37 33 30 27\" fill=\"none\"/><path d=\"M40 76Q35 62 49 51Q57 45 57 37L55 17L65 27L70 12L76 30Q85 32 86 40L93 45Q91 54 77 55Q70 60 75 71Q82 72 82 80Q70 88 47 84Q40 84 40 76Z\" fill=\"#ef9950\"/><path d=\"M48 78Q45 65 57 63Q68 63 66 77L74 78\" fill=\"none\"/><path d=\"M72 52Q79 59 85 55\" fill=\"none\"/></g><circle cx=\"78\" cy=\"38\" r=\"3\" fill=\"#3b2e25\"/><circle cx=\"91\" cy=\"45\" r=\"3\" fill=\"#3b2e25\"/></svg>" },
  bear: { name: "Медведь", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"#b7835b\" stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><circle cx=\"23\" cy=\"28\" r=\"14\"/><circle cx=\"77\" cy=\"28\" r=\"14\"/><g fill=\"#e8b88c\" stroke=\"none\"><circle cx=\"23\" cy=\"28\" r=\"7\"/><circle cx=\"77\" cy=\"28\" r=\"7\"/></g><path d=\"M13 61Q12 22 50 22Q88 22 87 61Q87 86 50 87Q13 86 13 61Z\"/><ellipse cx=\"50\" cy=\"65\" rx=\"20\" ry=\"15\" fill=\"#f7d6aa\" stroke=\"none\"/><path d=\"M43 58Q50 54 57 58Q57 64 50 66Q43 64 43 58Z\" fill=\"#3b2e25\"/><path d=\"M50 66V69Q45 74 40 69M50 69Q55 74 60 69\" fill=\"none\"/></g><g fill=\"#3b2e25\"><circle cx=\"34\" cy=\"49\" r=\"3.5\"/><circle cx=\"66\" cy=\"49\" r=\"3.5\"/></g></svg>" },
  bumblebee: { name: "Шмель", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M44 47C20 44 17 16 29 15Q43 13 49 43Z\" fill=\"#c6eff1\"/><path d=\"M47 45C44 23 60 9 67 18Q77 33 52 48Z\" fill=\"#ddf7f7\"/><ellipse cx=\"44\" cy=\"60\" rx=\"32\" ry=\"22\" fill=\"#ffd458\"/><path d=\"M28 42Q17 59 28 78M44 40Q34 60 46 80\" stroke-width=\"8\" fill=\"none\"/><path d=\"M69 44Q68 31 62 31M78 44Q84 31 90 34\" fill=\"none\"/><circle cx=\"73\" cy=\"56\" r=\"16\" fill=\"#ffdc70\"/><path d=\"M77 62Q81 65 85 59\" fill=\"none\"/></g><circle cx=\"78\" cy=\"52\" r=\"3\" fill=\"#3b2e25\"/></svg>" },
  cricket: { name: "Сверчок", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M68 39Q59 14 42 12M75 37Q76 18 93 14M59 60L70 75H80M70 55L83 68H90\" fill=\"none\"/><path d=\"M10 61Q29 40 61 42Q78 46 65 59Q42 72 10 61Z\" fill=\"#b7c878\"/><path d=\"M15 60Q39 39 62 47Q47 59 15 60Z\" fill=\"#8eaa61\"/><circle cx=\"73\" cy=\"43\" r=\"13\" fill=\"#c6d788\"/><path d=\"M54 60L39 48Q34 44 31 51L21 78H10M38 53L26 78\" fill=\"none\"/><path d=\"M76 49Q80 52 84 47\" fill=\"none\"/></g><circle cx=\"77\" cy=\"39\" r=\"3\" fill=\"#3b2e25\"/></svg>" },
  titmouse: { name: "Синица", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M50 71L48 81H42M61 70L60 81H54\" fill=\"none\"/><path d=\"M33 54L7 45L16 62L8 63L33 69Z\" fill=\"#6495ae\"/><path d=\"M22 57Q25 41 44 38Q51 19 68 24Q88 29 79 51Q76 74 54 75Q30 77 22 57Z\" fill=\"#ffda60\"/><path d=\"M45 38Q50 18 68 24Q82 27 81 39Q79 54 65 55Q60 46 45 38Z\" fill=\"#476778\"/><ellipse cx=\"70\" cy=\"44\" rx=\"8\" ry=\"6\" fill=\"#fff6dc\" stroke=\"none\"/><path d=\"M81 37L93 41L81 45Z\" fill=\"#dc9b4a\"/><path d=\"M25 54Q39 39 55 49Q53 65 25 62Z\" fill=\"#739fb1\"/></g><circle cx=\"72\" cy=\"35\" r=\"3\" fill=\"#302923\"/></svg>" },
  fern: { name: "Папоротник", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M42 83Q49 61 53 42L58 15\" fill=\"none\"/><path d=\"M44 76Q17 78 9 53Q32 54 44 76Z\" fill=\"#64b979\"/><path d=\"M45 72Q60 48 86 51Q78 74 45 72Z\" fill=\"#83c973\"/><path d=\"M49 58Q25 58 18 33Q39 34 49 58Z\" fill=\"#64b979\"/><path d=\"M51 53Q63 31 86 32Q80 52 51 53Z\" fill=\"#83c973\"/><path d=\"M54 39Q36 37 32 16Q49 19 54 39Z\" fill=\"#64b979\"/><path d=\"M55 35Q63 17 78 16Q75 33 55 35Z\" fill=\"#83c973\"/><path d=\"M56 26Q49 15 59 5Q68 16 56 26Z\" fill=\"#98d283\"/><path d=\"M44 75L37 92\" fill=\"none\"/></g></svg>" },
  acorn: { name: "Жёлудь", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M23 42Q21 70 40 81Q47 85 49 91Q53 85 60 82Q79 72 78 43Z\" fill=\"#e6a355\"/><path d=\"M33 54Q32 63 39 70\" stroke=\"#ffe0a2\" stroke-width=\"5\" fill=\"none\"/><path d=\"M46 30Q48 19 56 9Q59 6 63 10Q65 12 61 16Q54 23 54 31Z\" fill=\"#94704a\"/><path d=\"M17 43Q16 25 40 23Q70 17 81 34Q86 42 81 47Q51 56 19 48Z\" fill=\"#a97953\"/><path d=\"M29 35L34 39L39 34M45 31L50 35L55 30M60 36L65 40L70 35\" stroke=\"#775137\" fill=\"none\"/></g></svg>" },
  // v23 (Astra): «Ферма»
  farmBell: { name: "Колокольчик", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"50\" cy=\"21\" r=\"8\" fill=\"none\"/><circle cx=\"50\" cy=\"75\" r=\"9\" fill=\"#d78238\"/><path fill=\"#ffcb53\" d=\"M21 70Q31 60 31 48Q31 27 50 26Q69 27 69 48Q69 60 79 70Q54 79 21 70Z\"/><path fill=\"none\" d=\"M39 48Q39 39 45 36M14 47L9 42M86 47L91 42\"/></g></svg>" },
  farmBucket: { name: "Ведро", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#78b7d5\" d=\"M20 43L29 79Q50 88 71 79L80 43Z\"/><ellipse cx=\"50\" cy=\"43\" rx=\"30\" ry=\"8\" fill=\"#a4e1ee\"/><path fill=\"none\" d=\"M23 48C9 3 91 3 77 48\"/><rect x=\"38\" y=\"12\" width=\"24\" height=\"8\" rx=\"4\" fill=\"#edb56f\"/><path fill=\"#64c6e4\" d=\"M81 59Q69 75 81 76Q92 75 81 59Z\"/></g></svg>" },
  farmWateringCan: { name: "Лейка", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#91cf91\" d=\"M29 44C1 25 1 69 29 65L29 58C12 62 12 42 29 51Z\"/><path fill=\"#91cf91\" d=\"M51 60L77 39L83 45L59 73Z\"/><rect x=\"25\" y=\"39\" width=\"36\" height=\"40\" rx=\"9\" fill=\"#79c89e\"/><ellipse cx=\"43\" cy=\"40\" rx=\"15\" ry=\"4\" fill=\"#498e75\"/><path fill=\"#ffd375\" d=\"M73 34Q78 28 84 34L89 42Q91 47 84 49Z\"/><path fill=\"none\" d=\"M87 27L90 23M92 33L96 31\"/></g></svg>" },
  farmCarrot: { name: "Морковка", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#72bc68\" d=\"M58 39Q46 11 56 12Q62 13 65 27Q71 5 78 12Q82 16 72 30Q88 19 91 27Q93 34 65 43Z\"/><path fill=\"#ffa253\" d=\"M65 34Q80 42 68 56Q51 73 16 87Q25 55 44 37Q54 26 65 34Z\"/><path fill=\"none\" d=\"M40 43L49 49M53 64L46 60M29 64L35 68\"/></g></svg>" },
  farmCheese: { name: "Сыр", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><path fill=\"#ffe58b\" d=\"M12 53L60 23Q77 28 87 43L66 57Z\"/><path fill=\"#ffca56\" d=\"M12 53L87 43V53C75 52 75 67 87 65V72L12 83Z\"/><circle cx=\"29\" cy=\"66\" r=\"4\" fill=\"#efa343\"/><circle cx=\"59\" cy=\"60\" r=\"6\" fill=\"#efa343\"/><ellipse cx=\"59\" cy=\"37\" rx=\"6\" ry=\"3\" fill=\"#f5b752\"/></g></svg>" },
  farmBroom: { name: "Метла", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g transform=\"rotate(25 50 50)\" stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"46\" y=\"7\" width=\"8\" height=\"48\" rx=\"4\" fill=\"#bb8353\"/><path fill=\"#f2c769\" d=\"M40 49Q50 44 60 49Q61 68 72 84Q51 94 28 84Q39 63 40 49Z\"/><path fill=\"none\" d=\"M45 64L38 85M51 63L49 87M56 64L61 86\"/><rect x=\"38\" y=\"49\" width=\"24\" height=\"8\" rx=\"3\" fill=\"#e88266\"/></g></svg>" },
  farmGate: { name: "Калитка", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><rect x=\"13\" y=\"22\" width=\"10\" height=\"61\" rx=\"3\" fill=\"#a77350\"/><rect x=\"77\" y=\"22\" width=\"10\" height=\"61\" rx=\"3\" fill=\"#a77350\"/><path fill=\"#f3bd83\" d=\"M26 74V36L34 27L42 36V74ZM42 74V33L50 24L58 33V74ZM58 74V36L66 27L74 36V74Z\"/><path fill=\"#d99761\" d=\"M26 65L74 40V48L26 73Z\"/><rect x=\"67\" y=\"37\" width=\"15\" height=\"6\" rx=\"2\" fill=\"#80949a\"/></g></svg>" },
  farmGrain: { name: "Зёрна", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\"><g transform=\"rotate(28 47 32)\"><ellipse cx=\"47\" cy=\"32\" rx=\"11\" ry=\"18\" fill=\"#ffda79\"/><path fill=\"none\" d=\"M48 22Q44 31 47 41\"/></g><g transform=\"rotate(-35 31 65)\"><ellipse cx=\"31\" cy=\"65\" rx=\"12\" ry=\"18\" fill=\"#efb956\"/><path fill=\"none\" d=\"M32 55Q28 64 31 74\"/></g><g transform=\"rotate(49 68 63)\"><ellipse cx=\"68\" cy=\"63\" rx=\"12\" ry=\"18\" fill=\"#ffd578\"/><path fill=\"none\" d=\"M69 53Q65 63 68 72\"/></g></g></svg>" },
  // v23 (Astra): «Зима»
  snowmanBroom: { name: "Снеговик с метёлкой", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M75 84L83 38\" fill=\"none\"/><path d=\"M77 41L74 21L81 26L85 14L88 26L94 21L88 43Z\" fill=\"#eab96e\"/><path d=\"M60 59L78 49\" fill=\"none\"/><circle cx=\"42\" cy=\"68\" r=\"25\" fill=\"#edf9ff\"/><circle cx=\"42\" cy=\"32\" r=\"18\" fill=\"#fff\"/><path d=\"M26 44Q40 51 56 44L58 51L51 54L58 66L48 70L42 55Q32 55 24 51Z\" fill=\"#fa7968\"/><circle cx=\"36\" cy=\"28\" r=\"1.5\" fill=\"#3b2e25\"/><circle cx=\"46\" cy=\"28\" r=\"1.5\" fill=\"#3b2e25\"/><path d=\"M42 33L58 35L42 39Z\" fill=\"#ffab45\"/><circle cx=\"40\" cy=\"69\" r=\"2\" fill=\"#666477\"/><circle cx=\"40\" cy=\"80\" r=\"2\" fill=\"#666477\"/></g></svg>" },
  warmMitten: { name: "Тёплая варежка", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M32 75Q17 62 11 49Q7 38 16 35Q23 32 31 44L29 29Q27 12 43 9Q64 4 72 22Q79 40 73 60L68 77Z\" fill=\"#f67d83\"/><path d=\"M36 44L46 51L55 41L65 47\" fill=\"none\"/><rect x=\"30\" y=\"71\" width=\"41\" height=\"18\" rx=\"6\" fill=\"#ffe3a9\"/><path d=\"M40 76V84M50 76V84M60 76V84\" fill=\"none\"/></g></svg>" },
  iceSkate: { name: "Конёк", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 61H32V78H23ZM61 61H70V78H61Z\" fill=\"#a7bfce\"/><path d=\"M14 77H75Q82 77 86 71Q91 69 90 75Q86 85 75 85H16Q11 85 11 81Q11 78 14 77Z\" fill=\"#dceaf4\"/><path d=\"M19 19H49L51 39Q56 49 73 48Q85 48 85 59Q85 66 77 66H18Q13 66 15 58Z\" fill=\"#8bbcee\"/><path d=\"M19 16H48Q53 16 52 21L51 27H17L17 21Q17 17 19 16Z\" fill=\"#fff5dd\"/><path d=\"M42 36L53 32M45 45L56 40M53 52L62 46\" fill=\"none\"/></g></svg>" },
  winterFinch: { name: "Снегирёк", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M37 59L13 80L17 65L10 68L23 48Z\" fill=\"#546477\"/><ellipse cx=\"49\" cy=\"52\" rx=\"28\" ry=\"25\" fill=\"#ff8170\"/><path d=\"M46 36Q48 15 67 18Q82 20 79 36L70 45Q60 36 46 36Z\" fill=\"#505463\"/><path d=\"M78 29L90 34L78 39Z\" fill=\"#e9b76f\"/><circle cx=\"71\" cy=\"28\" r=\"3\" fill=\"#fff\"/><path d=\"M55 43Q32 32 20 57Q41 67 55 43Z\" fill=\"#8697ab\"/><path d=\"M45 76L43 83M58 76L56 82M29 85L72 80\" fill=\"none\"/></g></svg>" },
  scarf: { name: "Тёплый шарф", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M48 34L66 32L83 66L65 75Z\" fill=\"#ffb254\"/><path d=\"M66 73L69 81M73 70L77 78M80 67L84 74\" fill=\"none\"/><path d=\"M29 42L51 45L44 82L22 79Z\" fill=\"#f78453\"/><path d=\"M25 64L47 67L46 74L24 71Z\" fill=\"#ffe9a0\"/><path d=\"M24 80L23 87M32 82L31 89M41 82L40 89\" fill=\"none\"/><path d=\"M18 27Q19 15 46 14Q71 12 76 23L78 35Q71 48 46 49Q22 49 16 39Z\" fill=\"#ffad55\"/><ellipse cx=\"47\" cy=\"25\" rx=\"22\" ry=\"6\" fill=\"#bf664c\"/></g></svg>" },
  snowyFir: { name: "Ёлочка в снегу", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><rect x=\"43\" y=\"69\" width=\"14\" height=\"22\" rx=\"3\" fill=\"#b78054\"/><path d=\"M50 7L69 35L63 36L78 56L69 57L87 77Q51 90 13 77L31 57L22 56L37 36L31 35Z\" fill=\"#61b794\"/><path d=\"M50 7L69 35Q65 40 58 34Q54 42 47 35Q40 42 31 35Z\" fill=\"#f6fcff\"/><path d=\"M23 55Q32 58 38 53Q45 60 52 54Q59 60 66 54Q71 58 76 55\" fill=\"none\"/></g></svg>" },
  iceCube: { name: "Лёд", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 29L52 13Q55 12 59 14L85 26L51 45Z\" fill=\"#defaff\"/><path d=\"M14 29L51 45V86L17 71Q14 70 14 66Z\" fill=\"#a6e5f5\"/><path d=\"M51 45L85 26V65Q85 69 81 71L51 86Z\" fill=\"#78c8e4\"/><path d=\"M23 41L33 45M23 48L28 50M61 55L74 48\" fill=\"none\"/></g></svg>" },
  snowStump: { name: "Пенёк под снегом", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M28 34H70L71 49L81 43L85 49L72 62Q72 71 85 78Q89 85 78 85L65 82Q53 93 43 84Q28 90 15 83Q12 79 20 74Q29 68 28 34Z\" fill=\"#bd865a\"/><path d=\"M38 49Q40 64 34 73M58 45Q55 57 60 66\" fill=\"none\"/><ellipse cx=\"49\" cy=\"64\" rx=\"4\" ry=\"7\" fill=\"#976746\"/><path d=\"M17 36Q15 29 24 25Q27 16 38 19Q48 10 59 18Q71 15 76 24Q87 25 84 35Q82 42 73 40Q69 51 60 42Q52 47 45 41Q37 54 30 43Q18 46 17 36Z\" fill=\"#f2fbff\"/></g></svg>" },
  // v23 (Astra): «Цирк»
  tent: { name: "Шатёр", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M50 26V6l19 5-19 8\" fill=\"#ffd36b\"/><path d=\"M18 49h64l3 38H15z\" fill=\"#fff0cc\"/><path d=\"M25 53h9l-2 31h-9zm41 0h9l2 31h-9z\" fill=\"#ef796b\" stroke=\"none\"/><path d=\"M34 87q13-17 16-34 3 17 16 34z\" fill=\"#527578\"/><path d=\"M10 50q23-9 40-28 17 19 40 28v4q-7 9-16 0-8 9-16 0-8 9-16 0-8 9-16 0-9 9-16 0z\" fill=\"#ef796b\"/><path d=\"M33 49q10-10 17-27 7 17 17 27z\" fill=\"#fff0cc\" stroke=\"none\"/></g></svg>" },
  hoop: { name: "Обруч", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" stroke-linecap=\"round\"><circle cx=\"50\" cy=\"50\" r=\"33\" stroke=\"#3b2e25\" stroke-width=\"13\"/><circle cx=\"50\" cy=\"50\" r=\"33\" stroke=\"#65c4b8\" stroke-width=\"7\"/><path d=\"M50 17q6 0 11 2m20 42q-2 6-6 10M35 79q-5-2-9-7M18 43q1-6 4-11\" stroke=\"#fff0cc\" stroke-width=\"7\"/></g></svg>" },
  podium: { name: "Тумба", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><path d=\"M22 35h56l8 41q-36 13-72 0z\" fill=\"#ffd36b\"/><path d=\"M23 41q27 8 54 0L67 67 51 46 34 68z\" fill=\"#ef796b\"/><ellipse cx=\"50\" cy=\"35\" rx=\"29\" ry=\"9\" fill=\"#80cfc2\"/><path d=\"M15 72q35 11 70 0l1 6q-36 13-72 0z\" fill=\"#80cfc2\"/></g></svg>" },
  circusTicket: { name: "Билет", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g transform=\"rotate(-14 50 50)\" stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><path d=\"M14 29h72v14a7 7 0 0 0 0 14v14H14V57a7 7 0 0 0 0-14z\" fill=\"#ffd36b\"/><path d=\"M67 33v5m0 7v5m0 7v5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"m41 36 4 9 10 1-8 7 2 10-8-5-9 5 2-10-8-7 11-1z\" fill=\"#ef796b\"/></g></svg>" },
  circusPony: { name: "Лошадка", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M27 50Q13 39 9 53q5-2 4 5t-6 9q17 5 21-10\" fill=\"#885c48\"/><path d=\"M22 55q0-12 17-11l15 1 7-19q1-6 8-7l3-10q6 4 6 12l11 12q6 9-4 12l-11-3-6 17-3 22h-8l1-17-19 1-5 16h-8l4-23q-8 3-8-3z\" fill=\"#e7ab78\"/><path d=\"M68 20q-10-2-16 10l6-1-9 12 9-1 5-11z\" fill=\"#885c48\"/><path d=\"M34 45h18l-3 11H37z\" fill=\"#65c4b8\"/><circle cx=\"76\" cy=\"30\" r=\"2.5\" fill=\"#3b2e25\" stroke=\"none\"/></g></svg>" },
  tasselBall: { name: "Цирковой мяч", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M51 68q0 10 12 10\" fill=\"none\"/><path d=\"M63 76q8 1 13 10l-4-1 1 4-5-2-2 2q-6-6-6-11z\" fill=\"#ffd36b\"/><circle cx=\"49\" cy=\"42\" r=\"28\" fill=\"#ef796b\"/><path d=\"M49 14q-26 26 0 56-10-28 10-54z\" fill=\"#fff0cc\"/><path d=\"M56 15q28 25-4 55 19-29 4-55z\" fill=\"#65c4b8\" stroke=\"none\"/></g></svg>" },
  trapeze: { name: "Трапеция", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M36 16 25 70h6l11-54zm22 0 11 54h6L64 16z\" fill=\"#ffd36b\"/><rect x=\"18\" y=\"67\" width=\"64\" height=\"10\" rx=\"5\" fill=\"#65c4b8\"/><circle cx=\"39\" cy=\"15\" r=\"5\" fill=\"#ef796b\"/><circle cx=\"61\" cy=\"15\" r=\"5\" fill=\"#ef796b\"/></g></svg>" },
  tambourine: { name: "Бубен", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g transform=\"rotate(-14 50 50)\" stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><path d=\"M14 43h72v13c0 12-16 21-36 21s-36-9-36-21z\" fill=\"#ef796b\"/><ellipse cx=\"50\" cy=\"43\" rx=\"36\" ry=\"21\" fill=\"#ffe7ac\"/><ellipse cx=\"25\" cy=\"60\" rx=\"7\" ry=\"4\" fill=\"#a6d9d2\"/><ellipse cx=\"49\" cy=\"69\" rx=\"8\" ry=\"4\" fill=\"#a6d9d2\"/><ellipse cx=\"75\" cy=\"61\" rx=\"7\" ry=\"4\" fill=\"#a6d9d2\"/></g></svg>" },
  // v23 (Astra): «Забавы»
  yoyo: { name: "Йо-йо", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n        <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n          <path d=\"M47 63 C47 42 70 38 65 24 C62 16 67 8 74 11 C83 15 75 26 66 24\" fill=\"none\"/>\n          <circle cx=\"44\" cy=\"62\" r=\"25\" fill=\"#469fbc\"/>\n          <circle cx=\"52\" cy=\"65\" r=\"25\" fill=\"#85dfda\"/>\n          <circle cx=\"52\" cy=\"65\" r=\"14\" fill=\"#ffcc70\"/>\n          <circle cx=\"52\" cy=\"65\" r=\"5\" fill=\"#fff2ca\"/>\n        </g>\n      </svg>" },
  blocks: { name: "Башенка из кубиков", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n        <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\">\n          <rect x=\"38\" y=\"11\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#ffc766\"/>\n          <circle cx=\"50\" cy=\"23\" r=\"5\" fill=\"#fff2c8\"/>\n          <rect x=\"26\" y=\"36\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#8acbea\"/>\n          <rect x=\"51\" y=\"36\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#f49a88\"/>\n          <rect x=\"13\" y=\"61\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#f49a88\"/>\n          <rect x=\"38\" y=\"61\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#8ed1b3\"/>\n          <rect x=\"63\" y=\"61\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#ffc766\"/>\n        </g>\n      </svg>" },
  pullwagon: { name: "Тележка на верёвочке", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n        <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n          <path d=\"M65 55 Q78 57 88 28\" fill=\"none\"/>\n          <ellipse cx=\"89\" cy=\"23\" rx=\"4\" ry=\"6\" fill=\"#ffca72\"/>\n          <path d=\"M10 39 H71 L65 62 H17 Z\" fill=\"#ed9586\"/>\n          <rect x=\"9\" y=\"36\" width=\"64\" height=\"8\" rx=\"4\" fill=\"#ffc884\"/>\n          <circle cx=\"25\" cy=\"68\" r=\"10\" fill=\"#75c6c2\"/>\n          <circle cx=\"58\" cy=\"68\" r=\"10\" fill=\"#75c6c2\"/>\n          <circle cx=\"25\" cy=\"68\" r=\"3\" fill=\"#fff1ca\"/>\n          <circle cx=\"58\" cy=\"68\" r=\"3\" fill=\"#fff1ca\"/>\n        </g>\n      </svg>" },
  whistle: { name: "Свисток", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n        <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n          <circle cx=\"17\" cy=\"66\" r=\"7\" fill=\"none\"/>\n          <path d=\"M37 31 Q49 29 57 39 L86 32 L90 45 L61 57 C59 73 43 80 29 73 C12 64 15 37 37 31 Z\" fill=\"#ffbc64\"/>\n          <circle cx=\"39\" cy=\"55\" r=\"13\" fill=\"#ffdc96\"/>\n          <path d=\"M54 40 L65 37 L66 43 L57 46 Z\" fill=\"#98674e\"/>\n        </g>\n      </svg>" },
  soapbubbles: { name: "Мыльные пузыри", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n        <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n          <rect x=\"12\" y=\"53\" width=\"28\" height=\"35\" rx=\"7\" fill=\"#82d4bd\"/>\n          <rect x=\"15\" y=\"47\" width=\"22\" height=\"8\" rx=\"3\" fill=\"#ffc978\"/>\n          <path d=\"M43 77 L55 49\" fill=\"none\"/>\n          <ellipse cx=\"58\" cy=\"40\" rx=\"8\" ry=\"11\" fill=\"none\"/>\n          <circle cx=\"32\" cy=\"28\" r=\"11\" fill=\"#d2eefe\"/>\n          <circle cx=\"76\" cy=\"19\" r=\"7\" fill=\"#ffdae4\"/>\n          <circle cx=\"78\" cy=\"60\" r=\"12\" fill=\"#d9effa\"/>\n          <path d=\"M26 27 Q27 23 31 22 M72 59 Q73 55 77 54\" fill=\"none\"/>\n        </g>\n      </svg>" },
  toyKite: { name: "Воздушный змей", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n        <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n          <path d=\"M52 9 L79 32 L45 66 L23 30 Z\" fill=\"#ffca71\"/>\n          <path d=\"M52 9 L49 31 L23 30 Z\" fill=\"#8ed4cb\"/>\n          <path d=\"M49 31 L79 32 L45 66 Z\" fill=\"#f59488\"/>\n          <path d=\"M45 66 C41 81 60 73 62 82 Q65 91 77 85\" fill=\"none\"/>\n          <path d=\"M47 70 L52 76 L45 79 Z M59 86 L62 79 L68 83 Z\" fill=\"#8ed4cb\"/>\n        </g>\n      </svg>" },
  shapesorter: { name: "Кубик-сортер", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n        <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\">\n          <path d=\"M12 38 L32 25 L73 31 L54 45 Z\" fill=\"#ffdc92\"/>\n          <path d=\"M12 38 L54 45 V83 L12 75 Z\" fill=\"#8fd2bf\"/>\n          <path d=\"M54 45 L73 31 V69 L54 83 Z\" fill=\"#69b4af\"/>\n          <path d=\"M33 49 L44 69 L22 65 Z\" fill=\"#426967\"/>\n          <ellipse cx=\"64\" cy=\"56\" rx=\"5\" ry=\"9\" fill=\"#426967\"/>\n          <path d=\"M75 77 L83 63 L93 79 Z\" fill=\"#f39b88\"/>\n        </g>\n      </svg>" },
  sandcastle: { name: "Песочный куличик", svg: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n        <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n          <path d=\"M72 61 L83 29\" fill=\"none\"/>\n          <path d=\"M80 32 L76 23 Q76 19 80 19 L90 22 Q93 23 90 27 L84 33 Z\" fill=\"#83cebf\"/>\n          <path d=\"M67 54 L79 58 L75 70 Q70 77 65 67 Z\" fill=\"#83cebf\"/>\n          <ellipse cx=\"45\" cy=\"77\" rx=\"35\" ry=\"7\" fill=\"#f4d397\"/>\n          <path d=\"M17 74 L23 38 H32 V46 H40 V36 H49 V46 H57 V39 H65 L70 74 Q46 83 17 74 Z\" fill=\"#eabb78\"/>\n          <path d=\"M30 55 L28 67 M57 55 L59 67\" fill=\"none\"/>\n        </g>\n      </svg>" },
};
const art = (id: string): { name: string; svg: string } => EXTRA[id] ?? OBJECTS[id as ObjectId] ?? SHAPES[id]!;
const named: Record<string, string> = { cat: "Котик", bird: "Птичка", tree: "Дерево", cloud: "Тучка", moon: "Месяц" };
const t = (id: string, sound: SoundKind, motion: Motion, word: string, x = 0, y = 0): Spot => ({
  id,
  name: named[id] ?? art(id).name,
  svg: art(id).svg,
  sound,
  motion,
  word,
  x,
  y,
});

/**
 * v22: one theme per tab, so a child finds the animals with the animals and
 * the cars with the cars (before, the dog, the car and the bicycle shared
 * «Двор» and the owl lived in «Лес»). Only things with a drawn picture and a
 * sound of their own; animals without a sound yet (утёнок, курочка, мышка,
 * слон…) wait for their sound.
 */
export const SCENES: TapScene[] = [
  {
    id: "zhivotnye",
    title: "Животные",
    icon: SHAPES.cat!.svg,
    spots: [
      t("cat", "meow", "wobble", "Мяу!", 18, 22),
      t("dog", "woof", "hop", "Гав-гав!", 50, 20),
      t("bird", "tweet", "hop", "Чик-чирик!", 82, 22),
      t("owl", "owl", "wobble", "Ух-ух!", 28, 50),
      t("frog", "frog", "hop", "Ква-ква!", 72, 50),
      t("rabbit", "boing", "hop", "Прыг-скок!", 18, 80),
      t("butterfly", "whoosh", "float", "Порх-порх!", 50, 78),
      t("snail", "rustle", "wobble", "Ползу-ползу", 82, 80),
    ],
  },
  {
    id: "transport",
    title: "Транспорт",
    icon: OBJECTS.car.svg,
    spots: [
      t("plane", "whoosh", "float", "Вжу-у-ух!", 18, 20),
      t("rocket", "rocket", "float", "Пуск!", 50, 18),
      t("boat", "splash", "wobble", "Плюх!", 82, 20),
      t("car", "honk", "shake", "Би-бип!", 28, 50),
      t("bus", "honk", "shake", "Би-би!", 72, 50),
      t("train", "toot", "shake", "Ту-ту!", 18, 80),
      t("tractor", "chug", "shake", "Тр-р-р!", 50, 80),
      t("bicycle", "ding", "shake", "Дзынь-дзынь!", 82, 80),
    ],
  },
  {
    id: "kuhnya",
    title: "Кухня",
    icon: SHAPES.teapot!.svg,
    spots: [
      t("clock", "click", "shake", "Тик-так!", 18, 20),
      t("lamp", "click", "swing", "Щёлк!", 50, 18),
      t("teapot", "bubble", "shake", "Буль-буль!", 82, 22),
      t("cup", "ding", "wobble", "Дзынь!", 28, 50),
      t("glass", "pour", "wobble", "Буль!", 72, 50),
      t("apple", "munch", "squash", "Хрум!", 18, 80),
      t("spoon", "clack", "spin", "Динь!", 50, 80),
      t("egg", "pop", "wobble", "Тук-тук!", 82, 80),
    ],
  },
  {
    id: "priroda",
    title: "Природа",
    icon: SHAPES.tree!.svg,
    spots: [
      t("sun", "sparkle", "spin", "Тепло!", 18, 18),
      t("cloud", "whoosh", "float", "Ву-у-ух!", 50, 20),
      t("moon", "note", "swing", "Баю-бай!", 82, 20),
      t("tree", "rustle", "swing", "Шур-шур!", 25, 50),
      t("flower", "magic", "wobble", "Расцвёл!", 75, 50),
      t("mushroom", "pop", "squash", "Пум!", 18, 80),
      t("leaf", "rustle", "float", "Шурх!", 50, 80),
      t("drop", "drip", "hop", "Кап-кап!", 82, 80),
    ],
  },
  {
    id: "more",
    title: "Море",
    icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#65c9c2" d="M9 66Q25 65 34 44C43 21 63 13 82 28C65 26 57 41 65 54Q74 68 91 57Q84 82 56 83Q29 85 9 72Z"/><path fill="#fff1d5" d="M34 44C43 21 63 13 82 28C71 27 64 33 62 42Q55 48 52 40Q46 48 43 42Q38 49 34 44Z"/></g></svg>`,
    spots: [
      t("fish", "bubble", "wobble", "Буль-буль!", 18, 18),
      t("jelly", "boing", "float", "Пруг-пруг!", 50, 18),
      t("lighthouse", "sparkle", "swing", "Миг-миг!", 82, 18),
      t("wave", "whoosh", "swing", "Ш-ш-ш!", 32, 50),
      t("dolphin", "splash", "hop", "Плюх!", 68, 50),
      t("shell", "rustle", "wobble", "Шур-шур!", 18, 82),
      t("crab", "clack", "shake", "Клац-клац!", 50, 82),
      t("starfish", "pop", "spin", "Оп-ля!", 82, 82),
    ],
  },
  {
    id: "prazdnik",
    title: "Праздник",
    icon: OBJECTS.balloon.svg,
    spots: [
      t("balloon", "whoosh", "float", "Фью-у!", 18, 18),
      t("star", "sparkle", "spin", "Дзинь!", 50, 18),
      t("crown", "ding", "wobble", "Динь!", 82, 18),
      t("guitar", "note", "swing", "Трень!", 32, 50),
      t("drum", "thump", "bounce", "Бум-бум!", 68, 50),
      t("candy", "rustle", "shake", "Шур-шур!", 18, 82),
      t("cake1", "yum", "squash", "Ням-ням!", 50, 82),
      t("grapes", "pop", "hop", "Чпок!", 82, 82),
    ],
  },
  {
    id: "les",
    title: "Лес",
    icon: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><rect x=\"26\" y=\"67\" width=\"10\" height=\"19\" rx=\"3\" fill=\"#bc8152\"/><path d=\"M31 22L15 46H22L7 71Q31 78 54 71L40 47H47Z\" fill=\"#92c978\"/><rect x=\"57\" y=\"68\" width=\"13\" height=\"24\" rx=\"3\" fill=\"#bc8152\"/><path d=\"M63 7L44 35H52L35 56H44L28 77Q63 86 94 77L79 56H87L72 35H81Z\" fill=\"#4ca87a\"/><path d=\"M52 54Q60 57 68 54\" fill=\"none\"/></g></svg>",
    spots: [
      t("hedgehog", "hedgehog", "wobble", "Пых-пых!", 17, 29),
      t("squirrel", "squirrel", "hop", "Цок-цок!", 40, 24),
      t("bear", "bear", "bounce", "Р-р-р!", 63, 29),
      t("bumblebee", "bee", "float", "Ж-ж-ж!", 85, 24),
      t("cricket", "cricket", "hop", "Стр-р-р!", 17, 73),
      t("titmouse", "tweet", "bounce", "Чик-чирик!", 40, 68),
      t("fern", "rustle", "swing", "Шур-шур!", 63, 73),
      t("acorn", "drop", "squash", "Тук!", 85, 68),
    ],
  },
  {
    id: "ferma",
    title: "Ферма",
    icon: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#e87958\" d=\"M15 44L26 24L50 12L74 24L85 44V86H15Z\"/><path fill=\"#ffe3a0\" d=\"M9 45L22 21L50 7L78 21L91 45L84 49L72 27L50 16L28 27L16 49Z\"/><circle cx=\"50\" cy=\"34\" r=\"7\" fill=\"#a7dce5\"/><rect x=\"31\" y=\"52\" width=\"38\" height=\"34\" rx=\"2\" fill=\"#ae5941\"/><path fill=\"none\" stroke=\"#3b2e25\" d=\"M33 54L67 84M67 54L33 84\"/></g></svg>",
    spots: [
      t("farmBell", "ding", "swing", "Динь!", 17, 27),
      t("farmBucket", "splash", "wobble", "Плеск!", 39, 27),
      t("farmWateringCan", "spray", "swing", "Пш-ш!", 61, 27),
      t("farmCarrot", "munch", "hop", "Хрум!", 83, 27),
      t("farmCheese", "yum", "bounce", "Ням!", 17, 73),
      t("farmBroom", "whoosh", "swing", "Вжух!", 39, 73),
      t("farmGate", "clack", "wobble", "Клац!", 61, 73),
      t("farmGrain", "rustle", "shake", "Шур-шур!", 83, 73),
    ],
  },
  {
    id: "zima",
    title: "Зима",
    icon: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><circle cx=\"50\" cy=\"50\" r=\"43\" fill=\"#a6def5\"/><path d=\"M46 14H54V29L62 23L67 29L54 40V43L58 45L73 36L74 26L81 27L80 36L87 34L90 41L78 47L86 51L82 58L68 52L58 58V62L70 72L65 78L54 70V86H46V70L35 78L30 72L42 62V58L32 52L18 58L14 51L22 47L10 41L13 34L20 36L19 27L26 26L27 36L42 45L46 43V40L33 29L38 23L46 29Z\" fill=\"#fff\"/></g></svg>",
    spots: [
      t("snowmanBroom", "boing", "wobble", "Прыг!", 18, 18),
      t("warmMitten", "rustle", "shake", "Шур-шур!", 50, 18),
      t("iceSkate", "whoosh", "swing", "Вжух!", 82, 18),
      t("winterFinch", "tweet", "hop", "Фью!", 18, 50),
      t("scarf", "whoosh", "float", "Фух!", 82, 50),
      t("snowyFir", "rustle", "swing", "Ш-ш-ш!", 18, 82),
      t("iceCube", "clack", "bounce", "Тук!", 50, 82),
      t("snowStump", "thump", "squash", "Бух!", 82, 82),
    ],
  },
  {
    id: "cirk",
    title: "Цирк",
    icon: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><path d=\"M50 25V6l19 6-19 7\" fill=\"#ffd36b\"/><path d=\"M18 50h64v36H18z\" fill=\"#fff0cc\"/><path d=\"M12 52Q36 40 50 23q14 17 38 29z\" fill=\"#ef796b\"/><path d=\"M37 52l13-29 13 29z\" fill=\"#fff0cc\"/><path d=\"M34 86q12-12 16-31 4 19 16 31z\" fill=\"#527578\"/></g></svg>",
    spots: [
      t("tent", "whoosh", "wobble", "Оп-ля!", 18, 25),
      t("hoop", "flip", "spin", "Круть!", 40, 22),
      t("podium", "thump", "squash", "Топ!", 62, 25),
      t("circusTicket", "rustle", "shake", "Шур-шур!", 84, 22),
      t("circusPony", "clack", "hop", "Цок-цок!", 18, 72),
      t("tasselBall", "boing", "bounce", "Прыг!", 40, 75),
      t("trapeze", "whoosh", "swing", "Кач-кач!", 62, 72),
      t("tambourine", "ding", "shake", "Дзинь!", 84, 75),
    ],
  },
  {
    id: "zabavy",
    title: "Забавы",
    icon: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"> <g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"> <rect x=\"34\" y=\"13\" width=\"32\" height=\"32\" rx=\"5\" fill=\"#ffc766\"/> <circle cx=\"50\" cy=\"29\" r=\"7\" fill=\"#fff2c8\"/> <rect x=\"16\" y=\"46\" width=\"34\" height=\"34\" rx=\"5\" fill=\"#75cfbe\"/> <path d=\"M33 53 L42 71 H24 Z\" fill=\"#e5f7cf\"/> <rect x=\"51\" y=\"46\" width=\"34\" height=\"34\" rx=\"5\" fill=\"#f49389\"/> <rect x=\"61\" y=\"56\" width=\"14\" height=\"14\" rx=\"3\" fill=\"#ffe4ba\"/> </g> </svg>",
    spots: [
      t("yoyo", "whoosh", "spin", "Вжик!", 18, 23),
      t("blocks", "clack", "wobble", "Клац!", 50, 20),
      t("pullwagon", "whoosh", "swing", "Покатим!", 82, 23),
      t("whistle", "toot", "shake", "Фью!", 32, 50),
      t("soapbubbles", "pop", "float", "Чпок!", 68, 50),
      t("toyKite", "whoosh", "float", "Лети!", 18, 78),
      t("shapesorter", "click", "hop", "Щёлк!", 50, 81),
      t("sandcastle", "thump", "squash", "Шлёп!", 82, 78),
    ],
  },
];

/** «Потрогай»: toys that wobble and bounce; also the break between levels. */
export const TOYS: Touchable[] = [
  t("ball", "boing", "bounce", "Прыг!"),
  t("drum", "thump", "shake", "Бум-бум!"),
  t("top", "whoosh", "spin", "Ж-ж-ж!"),
  t("balloon", "whoosh", "float", "Лети!"),
  t("rattle", "clack", "shake", "Тр-р!"),
  t("robot", "beep", "hop", "Бип-буп!"),
  t("pyramid", "note", "wobble", "Ля-ля!"),
  t("matryoshka", "clack", "wobble", "Тук!"),
  t("teddy", "boing", "squash", "Обнимашки!"),
];

/** Every thing that can be touched, for «Найдено x из y» on the home tile. */
export function allFinds(): string[] {
  return [...SCENES.flatMap((s) => s.spots.map((p) => `${s.id}:${p.id}`)), ...TOYS.map((p) => `toys:${p.id}`)];
}
