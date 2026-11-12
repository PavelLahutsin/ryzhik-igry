import { mountLevelGame } from "../../shared/levelgame";
import { useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { levels, worlds } from "./pictures";
import { play, thumbArt } from "./trace";

/** «Рисовалка»: trace the dotted line with a finger, and the picture comes alive. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "risovalka",
      title: "Рисовалка",
      subtitle: "Обведи пальчиком по точкам — и рисунок оживёт",
      levels,
      worlds,
      thumb: (level) => svgNode(thumbArt(level), "rv-thumb"),
      caption: (level) => level.title,
      play,
    },
    root,
  );
}

