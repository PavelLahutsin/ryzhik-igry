/**
 * Per-game win tunes and quiet background loops. Pure data plus tiny
 * helpers, so tests can check every game has a tune.
 */
const G4 = 392, A4 = 440;
const C5 = 523, D5 = 587, E5 = 659, F5 = 698, G5 = 784, A5 = 880, B5 = 988, C6 = 1046;
const A3 = 220, G3 = 196, F3 = 175, C3 = 131, D3 = 147, E3 = 165;

type Note = [number, number];

/** Short win melodies: [Hz, seconds]. */
export const MELODIES: Record<string, Note[]> = {
  default: [[C5, 0.12], [E5, 0.12], [G5, 0.12], [C6, 0.3]],
  mozaika: [[G5, 0.1], [E5, 0.1], [G5, 0.1], [C6, 0.3]],
  sliyanie: [[C5, 0.1], [D5, 0.1], [E5, 0.1], [G5, 0.1], [C6, 0.28]],
  "najdi-paru": [[E5, 0.1], [G5, 0.1], [E5, 0.1], [C6, 0.3]],
  teni: [[A4, 0.12], [C5, 0.12], [E5, 0.12], [A5, 0.3]],
  odezhda: [[F5, 0.1], [A5, 0.1], [C6, 0.1], [A5, 0.1], [C6, 0.28]],
  sortirovka: [[C5, 0.1], [E5, 0.1], [C5, 0.1], [G5, 0.3]],
  labirint: [[D5, 0.1], [F5, 0.1], [A5, 0.1], [D5, 0.1], [A5, 0.3]],
  risovalka: [[E5, 0.12], [G5, 0.12], [B5, 0.12], [E5, 0.3]],
  bukvy: [[C5, 0.1], [E5, 0.1], [G5, 0.1], [E5, 0.1], [C6, 0.3]],
  tochki: [[C5, 0.08], [D5, 0.08], [E5, 0.08], [F5, 0.08], [G5, 0.3]],
  professii: [[G4, 0.1], [C5, 0.1], [E5, 0.1], [G5, 0.1], [E5, 0.1], [G5, 0.3]],
  stroyka: [[C5, 0.1], [C5, 0.1], [G5, 0.1], [G5, 0.1], [C6, 0.3]],
  formy: [[E5, 0.1], [C5, 0.1], [G5, 0.1], [C6, 0.3]],
};

export function melodyFor(game: string): Note[] {
  return MELODIES[game] ?? MELODIES.default!;
}

export type Song = { beat: number; wave: OscillatorType; notes: number[]; bass: number[] };

/** Gentle loops, pentatonic so nothing clashes with effects. 0 = rest. */
export const SONGS: Record<string, Song> = {
  home: { beat: 0.42, wave: "triangle", notes: [C5, 0, E5, G5, 0, E5, D5, 0, C5, 0, D5, E5, G5, 0, E5, 0], bass: [C3, A3 / 2, F3, G3] },
  domik: { beat: 0.45, wave: "sine", notes: [G4, 0, C5, E5, 0, D5, C5, 0, A4, 0, C5, D5, 0, C5, G4, 0], bass: [C3, F3, G3, C3] },
  kuhnya: { beat: 0.34, wave: "triangle", notes: [C5, E5, G5, 0, A5, G5, E5, 0, D5, E5, C5, 0, D5, 0, C5, 0], bass: [C3, F3, G3, C3] },
  professii: { beat: 0.36, wave: "triangle", notes: [E5, 0, G5, A5, 0, G5, E5, 0, D5, 0, E5, G5, 0, E5, D5, 0], bass: [C3, A3 / 2, D3, G3] },
  stroyka: { beat: 0.33, wave: "square", notes: [C5, 0, C5, E5, 0, G5, 0, E5, D5, 0, D5, F5, 0, A5, 0, F5], bass: [C3, D3, C3, G3] },
  labirint: { beat: 0.4, wave: "triangle", notes: [A4, 0, C5, D5, 0, E5, D5, 0, C5, 0, A4, G4, 0, A4, 0, 0], bass: [A3 / 2, F3, C3, G3] },
  sliyanie: { beat: 0.48, wave: "sine", notes: [E5, 0, D5, 0, C5, 0, D5, E5, 0, G5, 0, E5, D5, 0, C5, 0], bass: [C3, G3, A3 / 2, F3] },
  default: { beat: 0.44, wave: "sine", notes: [C5, 0, D5, E5, 0, G5, 0, E5, D5, 0, C5, 0, A4, 0, C5, 0], bass: [C3, F3, G3, E3] },
};

/** Music for a game; the coloring game has its own sounds and lullabies. */
export function musicFor(game: string): Song | null {
  if (game === "raskraska" || game === "roditelyam") return null;
  return SONGS[game] ?? SONGS.default!;
}

