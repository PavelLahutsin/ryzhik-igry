/** A woven basket drawn in code (viewBox 0 0 120 90), tinted per basket. */
export function basketSvg(color: string): string {
  const O = `stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  let weave = "";
  for (let x = 24; x <= 96; x += 12) weave += `<path d="M${x} 40 L ${x + (x - 60) * 0.12} 82" stroke="#3b2e25" stroke-opacity=".25" stroke-width="2"/>`;
  return (
    `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M22 38 C 22 8 98 8 98 38" fill="none" stroke="#3b2e25" stroke-width="9" stroke-linecap="round"/>` +
    `<path d="M22 38 C 22 8 98 8 98 38" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M10 36 L 110 36 L 98 84 C 97 87 95 88 92 88 L 28 88 C 25 88 23 87 22 84 Z" fill="${color}" ${O}/>` +
    weave +
    `<path d="M16 56 L 104 56 M 19 70 L 101 70" stroke="#fff" stroke-opacity=".45" stroke-width="3"/>` +
    `<rect x="6" y="30" width="108" height="12" rx="6" fill="${color}" ${O}/>` +
    `<rect x="12" y="33" width="40" height="3" rx="1.5" fill="#fff" opacity=".5"/>` +
    `</svg>`
  );
}
