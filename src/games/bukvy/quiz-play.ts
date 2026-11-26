import { audio } from "../../shared/audio";
import { createAutoHint } from "../../shared/autoHint";
import { el, replayClass } from "../../shared/dom";
import { centre, showTap } from "../../shared/guide";
import { growth } from "../../shared/growth";
import type { PlayApi } from "../../shared/levelgame";
import { createScope } from "../../shared/lifecycle";
import { speakButton } from "../../shared/speak";
import { rate, rateHints } from "../../shared/stars";
import { svgNode } from "../../shared/ui";
import { ABC } from "./abc";
import type { AbcLevel, FirstLevel, QuizLevel } from "./quiz-levels";
import { wordArt } from "./word-art";

const sayIf = (id: string | undefined): boolean => {
  if (!id || !audio.hasVoice(id)) return false;
  audio.say(id);
  return true;
};
/** Ryzhik's line for a letter: «М! Мммячик» (public/audio/voice/words/<file>.mp3). */
export const letterVoice = (letter: string): string | undefined => {
  const l = ABC.find((x) => x.letter === letter);
  return l ? `words/${l.file}` : undefined;
};

export function quizThumb(level: QuizLevel): HTMLElement {
  const box = el("span", { class: "sk-thumb" });
  if (level.kind === "abc") for (const l of level.letters) box.append(el("b", { class: "bq-thumb__l", text: l.letter }));
  else {
    const art = wordArt(level.rounds[0]!.word);
    if (art) box.append(svgNode(art, "sk-thumb__i"));
    box.append(el("b", { class: "bq-thumb__l", text: "?" }));
  }
  return box;
}

function bubble(text: string, voice: string, withGrow: boolean): { node: HTMLElement; say: (t: string) => void; grow: ReturnType<typeof growth> } {
  const line = el("p", { class: "sk-say__text", attrs: { "aria-live": "polite" }, text });
  const speak = speakButton(voice);
  const grow = growth("flower");
  return {
    node: el("div", { class: "sk-say" }, [el("div", { class: "sk-say__bubble" }, [line, speak.node]), ...(withGrow ? [grow.node] : [])]),
    say: (t) => {
      line.textContent = t;
      replayClass(line, "is-new");
    },
    grow,
  };
}

export function playQuiz(stage: HTMLElement, level: QuizLevel, api: PlayApi): () => void {
  return level.kind === "abc" ? playAbc(stage, level, api) : playFirst(stage, level, api);
}

/** Three letter cards; a tap says the sound and the word and shows the three pictures. */
function playAbc(stage: HTMLElement, level: AbcLevel, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const bar = bubble("Нажми на картинку. Я назову букву!", "v152", false);
  const heard = new Set<string>();
  const words = el("div", { class: "bq-words", attrs: { "aria-live": "polite" } });
  const cards = level.letters.map((l) => {
    const first = wordArt(l.words[0]!.art);
    const card = el("button", { class: "bq-card", attrs: { type: "button", "aria-label": `Буква ${l.letter}` }, on: { click: () => open(l.letter) } }, [
      el("b", { class: "bq-card__l", text: l.letter }),
      ...(first ? [svgNode(first, "bq-card__art")] : []),
    ]);
    return { l, card };
  });
  stage.append(el("div", { class: "sk-layout bq-layout" }, [bar.node, el("div", { class: "bq-cards" }, cards.map((c) => c.card)), words]));
  audio.say("v152", { after: true });

  function open(letter: string): void {
    const c = cards.find((x) => x.l.letter === letter)!;
    audio.unlock();
    for (const x of cards) x.card.classList.toggle("is-open", x === c);
    replayClass(c.card, "is-tapped");
    if (!sayIf(letterVoice(letter))) audio.play("pop");
    bar.say(c.l.say);
    words.replaceChildren(
      ...c.l.words.map((w, i) => {
        const art = wordArt(w.art);
        return el("div", { class: "bq-word", style: { "--i": String(i) } as Record<string, string> }, [...(art ? [svgNode(art, "bq-word__art")] : []), el("span", { class: "bq-word__name", text: w.word })]);
      }),
    );
    heard.add(letter);
    c.card.classList.add("is-heard");
    if (heard.size === level.letters.length) {
      api.setHint(null);
      later(() => audio.play("magic"), 1800);
      later(() => api.win(rateHints(0), `${level.letters.map((l) => l.letter).join(", ")} — здорово!`), 3200);
    }
  }
  const next = (): HTMLElement | undefined => cards.find((c) => !heard.has(c.l.letter))?.card;
  api.setHint(() => {
    const n = next();
    if (n) replayClass(n, "is-hint");
  });
  api.setDemo(() => {
    const n = next();
    if (n) showTap(centre(n));
  });
  return scope.dispose;
}

/** A picture; tap the letter the word starts with. */
function playFirst(stage: HTMLElement, level: FirstLevel, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const autoHint = createAutoHint();
  const bar = bubble("С какой буквы начинается слово?", "v153", true);
  const pic = el("div", { class: "bq-pic" });
  const opts = el("div", { class: "sk-opts bq-opts", attrs: { role: "group" } });
  stage.append(el("div", { class: "sk-layout" }, [bar.node, pic, opts]));
  audio.say("v153", { after: true });
  let at = 0;
  let misses = 0;
  let hints = 0;
  let busy = false;
  let buttons: HTMLButtonElement[] = [];

  function show(): void {
    const r = level.rounds[at]!;
    busy = false;
    const art = wordArt(r.word);
    pic.replaceChildren(...(art ? [svgNode(art, "bq-pic__art")] : []), el("span", { class: "bq-pic__name", text: r.word }));
    replayClass(pic, "is-new");
    bar.say("С какой буквы начинается слово?");
    buttons = r.options.map((o) => {
      const b = el("button", { class: "sk-opt bq-letter", attrs: { type: "button", "aria-label": `Буква ${o}` }, on: { click: () => choose(o, b) } }, [el("span", { text: o })]);
      if (o === r.answer) b.dataset.ok = "";
      return b;
    });
    opts.replaceChildren(...buttons);
  }
  function choose(o: string, b: HTMLButtonElement): void {
    const r = level.rounds[at]!;
    if (busy || b.disabled) return;
    audio.unlock();
    if (o !== r.answer) {
      misses++;
      audio.play("boing");
      replayClass(b, "is-wrong");
      b.disabled = true;
      b.classList.add("is-off");
      bar.say(`Послушай ещё раз: ${r.word}!`);
      sayIf("v156");
      if (autoHint.recordMiss()) showHint();
      return;
    }
    busy = true;
    autoHint.reset();
    b.classList.add("is-right");
    audio.play("pop");
    const l = ABC.find((x) => x.letter === r.answer);
    // «А! Арбуз»: the letter's sound, then the word.
    bar.say(l?.say.startsWith(`${r.answer}!`) ? `${r.answer}! ${r.word}` : `${r.word}!`);
    // The letter's recording says its first word: use it when that is this word.
    const same = l?.words[0] ? wordArt(l.words[0].art) === wordArt(r.word) : false;
    if (!(same && sayIf(letterVoice(r.answer)))) sayIf("v155");
    at++;
    bar.grow.set(at, level.rounds.length);
    if (at < level.rounds.length) return void later(show, 1500);
    api.setHint(null);
    later(() => audio.play("magic"), 600);
    later(() => api.win(rate(misses, hints), "Отлично!"), 1700);
  }
  function showHint(): void {
    const b = buttons.find((x) => x.dataset.ok !== undefined);
    if (!b || busy) return;
    if (autoHint.recordShown(b)) hints++;
    replayClass(b, "is-hint");
  }
  api.setHint(showHint);
  api.setDemo(() => {
    const b = buttons.find((x) => x.dataset.ok !== undefined);
    if (b) showTap(centre(b));
  });
  show();
  return scope.dispose;
}
