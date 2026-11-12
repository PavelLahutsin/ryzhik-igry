import { mountLevelGame } from "../../shared/levelgame";
import { adoptLevels } from "../../shared/progress";
import { useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "../risovalka/style.css?inline";
import { levels, MOVED_DIGITS, worlds } from "./letters";
import { play, thumbArt } from "../risovalka/trace";

/**
 * «Цифры и буквы»: trace digits 0–9 and the letters А–Я. The tracing is the
 * one of «Рисовалка»; digits count things, letters show their word. Each
 * world (digits, А–П, Р–Я) starts open.
 */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "bukvy",
      title: "Цифры и буквы",
      subtitle: "Пиши пальчиком: цифры и буквы по порядку линий",
      levels,
      worlds,
      openWorlds: true,
      // Digits 1–9 used to be in «Рисовалка»: their stars come along.
      migrate: () => adoptLevels("risovalka", "bukvy", MOVED_DIGITS),
      thumb: (level) => svgNode(thumbArt(level), "rv-thumb"),
      caption: (level) => level.letter ?? String(level.count ?? level.title),
      play,
    },
    root,
  );
}
