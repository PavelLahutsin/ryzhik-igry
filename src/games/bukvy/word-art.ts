import { THINGS } from "../formy/art";
import { thingArt } from "../sortirovka/things";
import { WORDS } from "./words";

/** Words of «Азбука-картинки» and «На какую букву?» whose picture the game already has. */
const BY_THING: Record<string, string> = {
  Груша: "pear",
  Морковка: "carrot",
  Звезда: "star",
  Машинка: "car",
  Домик: "house",
  Листик: "leaf",
  Кораблик: "boat",
  Капелька: "drop",
  Шапка: "hat",
  Варежка: "mitten",
  Сапог: "boot",
  Мишка: "teddy",
  Стул: "chair",
  Лампа: "lamp",
  Чайник: "teapot",
  Часы: "clock",
  Ведёрко: "bucket",
  Мороженое: "icecream",
  Мыло: "soap",
  Чемодан: "suitcase",
};
const BY_FORMY: Record<string, keyof typeof THINGS> = { Монетка: "coin", Окошко: "window", Подарок: "present" };
const ALIAS: Record<string, string> = { мЫшь: "мышЬ" };

/** The picture of a word (or null). `art` may be "have:<word>" or an inline SVG. */
export function wordArt(wordOrArt: string): string | null {
  if (wordOrArt.startsWith("<svg")) return wordOrArt;
  const word = ALIAS[wordOrArt.replace(/^have:/, "")] ?? wordOrArt.replace(/^have:/, "");
  const letterWord = Object.values(WORDS).find((w) => w.word === word);
  if (letterWord) return letterWord.svg;
  if (BY_THING[word]) return thingArt(BY_THING[word]!).svg;
  if (BY_FORMY[word]) return THINGS[BY_FORMY[word]!].art;
  return null;
}
