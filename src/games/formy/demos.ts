import type { ObjectId } from "../../shared/objects";
import type { Dim, Fig, Shape, Tint } from "./logic";

/**
 * v23: the hand shows the move on a «trial pair» — two or three separate
 * pictures above the field that are not the level's answers (so the answer is
 * not given away), then they go and Ryzhik says the task. Shown the first time
 * a child meets a kind of task and again after 4 s without a touch, at most 3
 * times a level. Data after Astra (brief 22-2) with fixes:
 * «длиннее» and «толще» shown on pencils and books (not on a big and a small
 * carrot or rectangle — that is «больше»), «такая же» with a same-colour pair
 * (the plain level wants the same colour), corners counted on the corners.
 */
export type DemoTarget =
  | { fig: Fig }
  | { obj: ObjectId; size: "big" | "small" }
  | { measure: Dim; v: 1 | 2; color: string }
  | { slot: "papa" | "pole" | "shelf" }
  | { slot: "hole"; shape: Shape }
  | { slot: "box"; shape: Shape; tint?: Tint };

/** A step: indexes into `trial`. `corners` taps the corners of a figure one by one. */
export type DemoStep = { move: "tap" | "drag" | "corners"; from: number; to?: number };
export type Demo = { key: string; trial: DemoTarget[]; steps: DemoStep[]; voiceAfter: string };

const fig = (shape: Shape, tint: Tint, size: 1 | 2 | 3 = 2, turn?: number): DemoTarget => ({ fig: { shape, tint, size, ...(turn ? { turn } : {}) } });

export const FORMY_DEMOS: Demo[] = [
  { key: "family", trial: [{ obj: "pear", size: "big" }, { slot: "papa" }], steps: [{ move: "drag", from: 0, to: 1 }], voiceAfter: "v82" },
  { key: "pyramid", trial: [fig("circle", "purple", 1), fig("circle", "purple", 3), { slot: "pole" }], steps: [{ move: "drag", from: 1, to: 2 }], voiceAfter: "v86" },
  { key: "sorter", trial: [fig("heart", "orange"), { slot: "hole", shape: "heart" }], steps: [{ move: "drag", from: 0, to: 1 }], voiceAfter: "v94" },
  { key: "things", trial: [{ obj: "kite", size: "big" }, { slot: "box", shape: "rhombus" }], steps: [{ move: "drag", from: 0, to: 1 }], voiceAfter: "v95" },
  { key: "sort2", trial: [fig("rhombus", "purple"), { slot: "box", shape: "rhombus", tint: "purple" }], steps: [{ move: "drag", from: 0, to: 1 }], voiceAfter: "v96" },
  {
    key: "order:up",
    trial: [{ obj: "boat", size: "big" }, { obj: "boat", size: "small" }, { slot: "shelf" }],
    steps: [{ move: "drag", from: 1, to: 2 }, { move: "drag", from: 0, to: 2 }],
    voiceAfter: "v84",
  },
  {
    key: "order:down",
    trial: [{ obj: "cup", size: "small" }, { obj: "cup", size: "big" }, { slot: "shelf" }],
    steps: [{ move: "drag", from: 1, to: 2 }, { move: "drag", from: 0, to: 2 }],
    voiceAfter: "v85",
  },
  { key: "pick:compare:size", trial: [{ obj: "cherry", size: "small" }, { obj: "cherry", size: "big" }], steps: [{ move: "tap", from: 1 }], voiceAfter: "v72" },
  { key: "pick:compare:length", trial: [{ measure: "length", v: 2, color: "#ff8a3d" }, { measure: "length", v: 1, color: "#ff8a3d" }], steps: [{ move: "tap", from: 0 }], voiceAfter: "v76" },
  { key: "pick:compare:height", trial: [{ obj: "house", size: "small" }, { obj: "house", size: "big" }], steps: [{ move: "tap", from: 1 }], voiceAfter: "v78" },
  { key: "pick:compare:thick", trial: [{ measure: "thick", v: 2, color: "#ff8a3d" }, { measure: "thick", v: 1, color: "#ff8a3d" }], steps: [{ move: "tap", from: 0 }], voiceAfter: "v80" },
  { key: "pick:same", trial: [fig("oval", "purple", 3), fig("triangle", "green"), fig("oval", "purple")], steps: [{ move: "tap", from: 2 }], voiceAfter: "v87" },
  { key: "pick:odd", trial: [fig("heart", "yellow"), fig("star", "yellow"), fig("heart", "yellow")], steps: [{ move: "tap", from: 1 }], voiceAfter: "v89" },
  { key: "pick:pattern", trial: [fig("circle", "purple"), fig("star", "orange"), fig("circle", "purple"), fig("star", "orange")], steps: [{ move: "tap", from: 3 }], voiceAfter: "v91" },
  { key: "pick:fit", trial: [fig("pentagon", "green"), { slot: "hole", shape: "pentagon" }], steps: [{ move: "drag", from: 0, to: 1 }], voiceAfter: "v92" },
  { key: "pick:corners", trial: [fig("triangle", "purple", 3)], steps: [{ move: "corners", from: 0 }], voiceAfter: "v93" },
];

export const demoFor = (key: string): Demo | undefined => FORMY_DEMOS.find((d) => d.key === key);
