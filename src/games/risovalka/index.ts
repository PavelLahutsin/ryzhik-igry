import { mountLevelGame } from "../../shared/levelgame";
import { useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { levels, worlds } from "./pictures";
import { play, thumbArt } from "./trace";
import { freeCard, freeRoute } from "./free";

/** «Обводилка» (id "risovalka"): trace the dotted line with a finger, and the picture comes alive. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "risovalka",
      // Shown as «Обведи картинку» (you trace); the id, the route and the progress
      // key stay "risovalka", so stars are kept.
      title: "Обведи картинку",
      subtitle: "Обведи пальчиком по точкам — и рисунок оживёт",
      levels,
      worlds,
      // «Большие картины» (r52+, at the end of the array) come after «Мастер рисования».
      worldOrder: worlds.map((w) => w.id),
      thumb: (level) => svgNode(thumbArt(level), "rv-thumb"),
      caption: (level) => level.title,
      play,
      routes: { free: (root) => freeRoute(root) },
      listTop: () => freeCard(),
    },
    root,
  );
}

