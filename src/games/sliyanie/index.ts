import { el } from "../../shared/dom";
import { goHome } from "../../shared/router";
import { useStyles } from "../../shared/style";
import { toolbar } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";

/** Placeholder until the game lands. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss);
  const view = el("div", { class: "screen" }, [toolbar("Скоро", goHome), el("p", { class: "loading", text: "Игра скоро появится" })]);
  root.append(view);
  return () => view.remove();
}
