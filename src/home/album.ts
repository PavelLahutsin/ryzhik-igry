import { el } from "../shared/dom";
import { goHome } from "../shared/router";
import { toolbar } from "../shared/ui";
import { STICKERS, earned, starsFor, stickerArt, totalStars } from "../shared/stickers";

/** «Мои наклейки»: stickers opened by stars from all games. */
export function renderAlbum(root: HTMLElement): () => void {
  let gone = false;
  const note = el("p", { class: "album__note", text: "Собирай звёздочки в играх — за них открываются наклейки." });
  const grid = el("div", { class: "album__grid" });
  const view = el("div", { class: "screen screen--album" }, [toolbar("Мои наклейки", goHome), note, grid]);
  root.append(view);
  void totalStars().then((stars) => {
    if (gone) return;
    const have = earned(stars);
    grid.replaceChildren(
      ...STICKERS.map((s, k) =>
        k < have
          ? el("figure", { class: "sticker", attrs: { "aria-label": s.name } }, [stickerArt(s), el("figcaption", { text: s.name })])
          : el("figure", { class: "sticker is-locked", attrs: { "aria-label": `Закрыта: нужно ${starsFor(k)} звёзд` } }, [
              stickerArt(s),
              el("figcaption", { text: `★ ${starsFor(k)}` }),
            ]),
      ),
    );
    const next = have < STICKERS.length ? starsFor(have) - stars : 0;
    note.textContent =
      have === STICKERS.length
        ? `Все ${STICKERS.length} наклеек собраны! Ты молодец!`
        : `Наклеек: ${have} из ${STICKERS.length}. До новой наклейки: ★ ${next}`;
  });
  return () => {
    gone = true;
    view.remove();
  };
}
