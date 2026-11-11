export type Child = Node | string | null | undefined | false;

export type ElProps = {
  class?: string;
  text?: string;
  attrs?: Record<string, string | number | boolean | null | undefined>;
  on?: Record<string, EventListener>;
  style?: Record<string, string>;
};

/** Small element helper. No framework, no virtual DOM. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: ElProps = {},
  children: Child[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props.class) node.className = props.class;
  if (props.text !== undefined) node.textContent = props.text;
  if (props.attrs) {
    for (const [key, value] of Object.entries(props.attrs)) {
      if (value === null || value === undefined || value === false) continue;
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  if (props.style) {
    for (const [key, value] of Object.entries(props.style)) {
      if (key.startsWith("--")) node.style.setProperty(key, value);
      else (node.style as unknown as Record<string, string>)[key] = value;
    }
  }
  if (props.on) {
    for (const [event, listener] of Object.entries(props.on)) {
      node.addEventListener(event, listener);
    }
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

export const SVG_NS = "http://www.w3.org/2000/svg";

/** Small SVG element helper: `svgEl("circle", { cx: 5, cy: 5, r: 2 })`. */
export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

/** A client (screen) point in the SVG's own units; {0,0} before layout. */
export function svgLocal(svg: SVGSVGElement, client: { clientX: number; clientY: number }): { x: number; y: number } {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = client.clientX;
  pt.y = client.clientY;
  const p = pt.matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}
