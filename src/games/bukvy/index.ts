import { mountLevelGame } from "../../shared/levelgame";
import { adoptLevels } from "../../shared/progress";
import { useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "../risovalka/style.css?inline";
import quizCss from "../skolko/style.css?inline";
import ownCss from "./style.css?inline";
import { MOVED_DIGITS } from "./letters";
import { play, thumbArt } from "../risovalka/trace";
import { playSkolko, skolkoThumb } from "../skolko/play";
import { playQuiz, quizThumb } from "./quiz-play";
import { allLevels, allWorlds, isQuiz, isSkolko } from "./all";

/**
 * «Цифры и буквы»: trace digits 0–9 and the letters А–Я. The tracing is the
 * one of «Рисовалка»; digits count things, letters show their word. Each
 * world starts open. v23: «Сколько?» and «Где больше?» (count and compare),
 * «Азбука-картинки» (letter sounds and words) and «На какую букву?».
 */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css, quizCss, ownCss);
  return mountLevelGame(
    {
      id: "bukvy",
      title: "Цифры и буквы",
      subtitle: "Пиши пальчиком, считай и слушай буквы",
      levels: allLevels,
      worlds: allWorlds,
      openWorlds: true,
      // Digits 1–9 used to be in «Рисовалка»: their stars come along.
      migrate: () => adoptLevels("risovalka", "bukvy", MOVED_DIGITS),
      thumb: (level) => (isSkolko(level) ? skolkoThumb(level) : isQuiz(level) ? quizThumb(level) : svgNode(thumbArt(level), "rv-thumb")),
      caption: (level) => (isSkolko(level) || isQuiz(level) ? level.title : (level.letter ?? String(level.count ?? level.title))),
      play: (stage, level, index, api) => (isSkolko(level) ? playSkolko(stage, level, api) : isQuiz(level) ? playQuiz(stage, level, api) : play(stage, level, index, api)),
    },
    root,
  );
}
