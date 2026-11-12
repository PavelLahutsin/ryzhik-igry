"""Cut characters out of the master sheets (/workspace/masters) into transparent webp.

    python3 scripts/make-cutouts.py /path/to/masters

The sheets have a plain light-grey studio background. Background is flood
filled from the crop border by colour distance, then the edge is softened.
Output: src/shared/assets/characters/<id>.webp (height 480 px).
"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

MASTERS = Path(sys.argv[1] if len(sys.argv) > 1 else "/workspace/masters")
OUT = Path(__file__).resolve().parent.parent / "src/shared/assets/characters"

# id: (file, box in 1000-px-wide preview coordinates, tolerance[, erase box])
# Ryzhik comes from the coloring app's clean ryzhik-wave.webp instead;
# the white bunny is too close to the studio grey to cut cleanly.
CROPS = {
    "mama": ("mama.jpeg", (40, 35, 240, 332), 30),
    "papa": ("papa.jpeg", (5, 18, 230, 333), 30),
    "ezhik": ("lineup.jpg", (60, 255, 228, 502), 26),
    "belka": ("lineup.jpg", (192, 180, 412, 502), 26, (192, 300, 232, 502)),
    "mishka": ("lineup.jpg", (732, 90, 968, 502), 26),
}


def cloth(c):
    """Light clothes that are close to the studio grey but not grey: bluish
    denim (Мишка's rolled-up cuffs) and lilac (Мама's lit dress hem). The
    studio grey and the floor are neutral or warm, so these never are."""
    r, g, b = c
    return b - r > 3 or (r - g > 6 and b - g > 6)


def cut(name, file, box, tol, erase=None):
    im = Image.open(MASTERS / file).convert("RGB")
    scale = im.width / 1000
    im = im.crop(tuple(round(v * scale) for v in box))
    w, h = im.size
    px = im.load()
    if erase:
        # A neighbour from the lineup overlaps the crop: paint it as studio grey.
        ex0, ey0, ex1, ey1 = (round((v - o) * scale) for v, o in zip(erase, (box[0], box[1], box[0], box[1])))
        for y in range(max(0, ey0), min(h, ey1)):
            for x in range(max(0, ex0), min(w, ex1)):
                px[x, y] = px[0, 0]
    border = [px[x, 0] for x in range(w)] + [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)]
    border.sort(key=sum)
    bg = border[len(border) // 2]
    seen = bytearray(w * h)
    q = deque()
    def near(c, ref):
        return sum((a - b) ** 2 for a, b in zip(c, ref)) < tol * tol
    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y, px[x, y]))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y, px[x, y]))
    while q:
        x, y, ref = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        c = px[x, y]
        # Compare with the studio colour and with the neighbour we came from,
        # so the soft gradient and floor shadow are followed but fur is not.
        warm = not cloth(c)
        floor = warm and y > h * 0.85 and max(c) - min(c) < 30 and 3 * 100 < sum(c) < 3 * 215
        if not (floor or near(c, bg) or warm and near(c, ref) and sum(c) > 3 * 150 and max(c) - min(c) < 30):
            continue
        seen[i] = 1
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                q.append((nx, ny, c))
    # Second pass: grow the background through cool, grey pixels touching it.
    # The studio grey and the floor shadow are neutral or bluish, while fur,
    # skin and clothes here are warm or clearly coloured. Near the floor the
    # rule is looser, so the soft contact shadow under the feet goes too.
    rows = [y for y in range(h) if any(not seen[y * w + x] for x in range(w))]
    top, bottom = rows[0], rows[-1]
    feet = bottom - (bottom - top) * 0.14

    def greyish(c, y):
        r, g, b = c
        spread = max(c) - min(c)
        if y > feet:
            # Light floor and contact shadow between and under the feet;
            # paws and fur stay because they are darker or orange-brown.
            return not cloth(c) and 6 < r - b < 48 and spread < 50 and sum(c) > 3 * 140
        # Neutral only: bluish light grey is denim (Мишка's rolled-up cuffs),
        # not the warm studio grey.
        return not cloth(c) and r - b < 6 and spread < 24 and sum(c) > 3 * 120

    q = deque(i for i in range(w * h) if seen[i])
    while q:
        i = q.popleft()
        x, y = i % w, i // w
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                j = ny * w + nx
                if not seen[j] and greyish(px[nx, ny], ny):
                    seen[j] = 1
                    q.append(j)
    # Gaps between the legs are closed off from the border, so the passes
    # above never reach them: clear neutral light pixels low in the figure.
    gap = bottom - (bottom - top) * 0.18
    for y in range(int(gap), h):
        for x in range(w):
            c = px[x, y]
            # Neutral grey, not the bluish denim of the overalls.
            if not cloth(c) and max(c) - min(c) < 24 and c[2] - c[0] < 8 and sum(c) > 3 * 125:
                seen[y * w + x] = 1
    # Keep only the biggest figure: drops slivers of neighbours in the lineup.
    comp = [0] * (w * h)
    best, best_size, label = 0, 0, 0
    parts = {}
    for start in range(w * h):
        if seen[start] or comp[start]:
            continue
        label += 1
        size, stack, top_y, colour = 0, [start], start // w, 0
        comp[start] = label
        while stack:
            i = stack.pop()
            size += 1
            x, y = i % w, i // w
            c = px[x, y]
            colour += max(c) - min(c)
            top_y = min(top_y, y)
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if not seen[j] and not comp[j]:
                        comp[j] = label
                        stack.append(j)
        parts[label] = (size, top_y, colour / size)
        if size > best_size:
            best, best_size = label, size
    # Feet that the floor passes cut off from the body stay too: small parts
    # that start low in the figure (neighbours in the lineup are tall).
    # A grey floor shadow is not a foot: feet are brown or orange.
    keep = {best} | {k for k, (size, top_y, sat) in parts.items() if size > best_size * 0.004 and top_y > gap and sat > 30}
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            if comp[y * w + x] in keep:
                mp[x, y] = 255
    # Close pin holes inside the figure, then shave and soften the edge.
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(mask)
    bbox = mask.point(lambda v: 255 if v > 40 else 0).getbbox()
    out = out.crop(bbox)
    out.thumbnail((10000, 480))
    out.save(OUT / f"{name}.webp", quality=88, method=6)
    print(name, out.size)


for name, (file, box, tol, *erase) in CROPS.items():
    cut(name, file, box, tol, erase[0] if erase else None)
