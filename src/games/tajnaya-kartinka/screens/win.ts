import { getLevel, isUnlocked, nextLevel } from "../data/levels";
import { navigate } from "../router";
import { clearLastWin, lastWin, loadProgress } from "../storage";
import { el } from "../ui/dom";
import { praiseWord, starRow } from "../../../shared/ui";
import { toolbar } from "./levels";

/** Why this many stars: bees and ladybugs that caught Ryzhik. */
const PRAISE: Record<number, string> = {
  3: "3 звезды — ни одного укуса!",
  2: "2 звезды — был один укус. Без укусов будет 3!",
  1: "1 звезда — было несколько укусов. Попробуй ещё раз!",
};

export function renderWin(root: HTMLElement, levelId: string): () => void {
  const level = getLevel(levelId);
  if (!level) {
    navigate("/levels", { replace: true });
    return () => undefined;
  }

  const next = nextLevel(level.id);
  const nextBtn = el(
    "button",
    {
      class: "btn btn--play",
      attrs: { type: "button", hidden: true },
      on: { click: () => navigate(`/game/${next?.id}`) },
    },
    [el("span", { text: "Дальше" })],
  );
  const againBtn = el(
    "button",
    {
      class: "btn btn--ghost",
      attrs: { type: "button", hidden: true },
      on: { click: () => navigate(`/game/${level.id}`) },
    },
    [el("span", { text: "Ещё раз" })],
  );
  const starsSlot = el("div", { class: "win__stars" });
  const praise = el("p", { class: "praise__why" });
  const confetti = el("div", { class: "confetti", attrs: { "aria-hidden": "true" } });
  for (let i = 0; i < 18; i++) {
    confetti.append(
      el("i", {
        style: {
          left: `${(i * 37) % 100}%`,
          animationDelay: `${(i % 6) * 0.12}s`,
          background: ["#ffb23f", "#ff7aa2", "#4cc38a", "#6db3d4", "#ff8a3d"][i % 5]!,
        },
      }),
    );
  }

  const view = el("div", { class: "screen screen--win" }, [
    toolbar(level.title, () => navigate("/levels")),
    el("div", { class: "win__art-wrap" }, [
      el("img", {
        class: "win__art",
        attrs: { src: level.image, alt: level.title, draggable: "false" },
      }),
      confetti,
    ]),
    // v13: the same win card as every other game (yellow ring, title, SVG stars, why, buttons).
    el("div", { class: "praise__card win__card" }, [
      el("p", { class: "praise__title", text: praiseWord() }),
      starsSlot,
      praise,
      el("div", { class: "praise__actions win__actions" }, [
        nextBtn,
        againBtn,
        el(
          "button",
          {
            class: "btn btn--ghost",
            attrs: { type: "button" },
            on: { click: () => navigate("/collection") },
          },
          [el("span", { text: "Коллекция" })],
        ),
      ]),
    ]),
  ]);
  root.append(view);

  let cancelled = false;
  void Promise.all([loadProgress(), lastWin()]).then(([progress, win]) => {
    if (cancelled) return;
    // Fresh win: show the stars just earned. From the collection: the best ones.
    const fresh = win && win.id === level.id;
    const stars = fresh ? win.stars : (progress.stars[level.id] ?? 1);
    if (fresh) void clearLastWin();
    starsSlot.append(starRow(stars, "stars stars--big"));
    praise.textContent = PRAISE[stars] ?? PRAISE[1]!;
    if (stars < 3) againBtn.hidden = false;
    if (next && (isUnlocked(next.id, progress.completed) || progress.completed.includes(level.id))) {
      nextBtn.hidden = false;
    }
  });

  return () => {
    cancelled = true;
    view.remove();
  };
}
