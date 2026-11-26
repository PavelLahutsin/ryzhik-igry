#!/usr/bin/env python3
"""Toddler coloring pages: back-to-front partition, then SVG regions + thick outline."""
from __future__ import annotations

import math
import sys
from pathlib import Path

import cv2
import numpy as np

from lineart_lib import SW, W, H, assets_from_ink, edge_ink, merge_small

MIN_AREA = 2500  # at 2560px; after 12px ink still above the 160-px tiny cap at 1280
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/games/raskraska/assets/pictures"


def X(cx, x, s, flip):
    return cx - x * s if flip else cx + x * s


class Canvas:
    def __init__(self):
        self.im = np.zeros((H, W), np.int32)
        self.n = 0
        self.ink_fill: list[str] = []
        self.ink_stroke: list[str] = []
        self.ink_prims: list = []

    def _lab(self) -> int:
        self.n += 1
        return self.n

    def ellipse(self, cx, cy, rx, ry, lab=None) -> int:
        lab = self._lab() if lab is None else lab
        rx, ry = max(2, int(round(rx))), max(2, int(round(ry)))
        cv2.ellipse(self.im, (int(round(cx)), int(round(cy))), (rx, ry), 0, 0, 360, int(lab), -1, cv2.LINE_8)
        return lab

    def circle(self, cx, cy, r, lab=None) -> int:
        return self.ellipse(cx, cy, r, r, lab)

    def poly(self, pts, lab=None) -> int:
        lab = self._lab() if lab is None else lab
        arr = np.array([(int(round(x)), int(round(y))) for x, y in pts], np.int32)
        cv2.fillPoly(self.im, [arr], int(lab), lineType=cv2.LINE_8)
        return lab

    def rrect(self, x, y, w, h, r, lab=None) -> int:
        r = max(0, min(r, w / 2, h / 2))
        lab = self._lab() if lab is None else lab
        overlay = np.zeros((H, W), np.uint8)
        cv2.rectangle(overlay, (int(round(x + r)), int(round(y))), (int(round(x + w - r)), int(round(y + h))), 1, -1)
        cv2.rectangle(overlay, (int(round(x)), int(round(y + r))), (int(round(x + w)), int(round(y + h - r))), 1, -1)
        for px, py in (
            (x + r, y + r),
            (x + w - r, y + r),
            (x + r, y + h - r),
            (x + w - r, y + h - r),
        ):
            cv2.circle(overlay, (int(round(px)), int(round(py))), int(round(r)), 1, -1, cv2.LINE_8)
        self.im[overlay.astype(bool)] = lab
        return lab

    def ear(self, base_x, base_y, tip_x, tip_y, width, lab=None) -> int:
        vx, vy = tip_x - base_x, tip_y - base_y
        L = math.hypot(vx, vy) or 1
        px, py = -vy / L * width, vx / L * width
        # teardrop: base quad + tip
        pts = [
            (base_x - px, base_y - py * 0.2),
            (base_x - px * 0.9, base_y - py),
            (tip_x, tip_y),
            (base_x + px * 0.9, base_y + py),
            (base_x + px, base_y - py * 0.2),
        ]
        return self.poly(pts, lab)

    def ink_circle(self, cx, cy, r):
        self.ink_prims.append(("circle", cx, cy, r))

    def ink_ellipse(self, cx, cy, rx, ry):
        self.ink_prims.append(("ellipse", cx, cy, rx, ry))

    def stroke(self, d: str):
        self.ink_stroke.append(d)

    def stroke_line(self, x1, y1, x2, y2):
        self.ink_prims.append(("line", x1, y1, x2, y2))
        self.ink_stroke.append(f"M {x1:.1f},{y1:.1f} L {x2:.1f},{y2:.1f}")

    def stroke_poly(self, pts):
        self.ink_prims.append(("poly", pts))

    def stroke_quad(self, x0, y0, x1, y1, x2, y2, n=8):
        pts = []
        for i in range(n):
            tt = i / (n - 1)
            u = 1 - tt
            x = x0 * u * u + x1 * 2 * u * tt + x2 * tt * tt
            y = y0 * u * u + y1 * 2 * u * tt + y2 * tt * tt
            pts.append((x, y))
        self.stroke_poly(pts)

    def smile(self, cx, cy, w, h):
        # Approximate the smile with a short polyline so it is baked into the outline mask.
        pts = []
        for i in range(7):
            t = i / 6
            # quadratic Bezier
            u = 1 - t
            x = (cx - w) * u * u + cx * 2 * u * t + (cx + w) * t * t
            y = cy * u * u + (cy + h) * 2 * u * t + cy * t * t
            pts.append((x, y))
        self.stroke_poly(pts)





def cap_labels(im: np.ndarray, max_labels: int = 36) -> np.ndarray:
    """Merge the smallest semantic parts into a neighbor until the page is not too busy."""
    out = im.copy()
    for _ in range(40):
        labs, counts = np.unique(out[out > 0], return_counts=True)
        if labs.size <= max_labels:
            break
        lab = int(labs[int(np.argmin(counts))])
        mask = out == lab
        dil = cv2.dilate(mask.astype(np.uint8), np.ones((7, 7), np.uint8), iterations=2).astype(bool)
        neigh = out[dil & ~mask]
        neigh = neigh[neigh != 0]
        if neigh.size:
            out[mask] = int(np.bincount(neigh).argmax())
        else:
            out[mask] = 0
    return out


def to_svg(c: Canvas) -> str:
    svg, _png = to_assets(c)
    return svg


def to_assets(c: Canvas) -> tuple[str, bytes]:
    labels = cap_labels(merge_small(c.im, MIN_AREA, min_radius=30), max_labels=36)
    ink = edge_ink(labels, radius=max(8, SW // 2))
    overlay = np.zeros((H, W), np.uint8)
    for kind, *args in c.ink_prims:
        if kind == "circle":
            cx, cy, r = args
            cv2.circle(overlay, (int(cx), int(cy)), int(max(2, r)), 1, -1, cv2.LINE_8)
        elif kind == "ellipse":
            cx, cy, rx, ry = args
            cv2.ellipse(overlay, (int(cx), int(cy)), (int(max(2, rx)), int(max(2, ry))), 0, 0, 360, 1, -1, cv2.LINE_8)
        elif kind == "line":
            x1, y1, x2, y2 = args
            cv2.line(overlay, (int(x1), int(y1)), (int(x2), int(y2)), 1, SW, cv2.LINE_8)
        elif kind == "poly":
            pts = np.array([(int(x), int(y)) for x, y in args[0]], np.int32)
            cv2.polylines(overlay, [pts], False, 1, SW, cv2.LINE_8)
    ink = ink | overlay.astype(bool)
    return assets_from_ink(ink, title="Ryzhik coloring page")


def hill(c: Canvas, y, bump=-180):
    pts = [(0, H), (0, y)]
    for i in range(1, 33):
        t = i / 32
        # quadratic from (0,y) through (W/2, y+bump) to (W, y+40)
        u = 1 - t
        x = 0 * u * u + (W / 2) * 2 * u * t + W * t * t
        yy = y * u * u + (y + bump) * 2 * u * t + (y + 40) * t * t
        pts.append((x, yy))
    pts += [(W, H)]
    c.poly(pts)


def sun(c: Canvas, cx, cy, r=150, rays=8, ray_len=100):
    c.circle(cx, cy, r)
    for i in range(rays):
        ang = math.radians(-90 + i * (360 / rays))
        x1 = cx + math.cos(ang) * (r + 36)
        y1 = cy + math.sin(ang) * (r + 36)
        x2 = cx + math.cos(ang) * (r + 36 + ray_len)
        y2 = cy + math.sin(ang) * (r + 36 + ray_len)
        c.stroke_line(x1, y1, x2, y2)


def moon(c: Canvas, cx, cy, r=150):
    c.circle(cx, cy, r)


def star_pts(cx, cy, ro, ri, n=5):
    pts = []
    for i in range(n * 2):
        ang = math.radians(-90 + i * 180 / n)
        r = ro if i % 2 == 0 else ri
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return pts


def bush(c: Canvas, cx, cy, s):
    c.ellipse(cx - 0.45 * s, cy, 0.5 * s, 0.42 * s)
    # overwrite into one region: draw remaining bumps with the same label
    lab = c.n
    c.ellipse(cx + 0.4 * s, cy + 0.05 * s, 0.48 * s, 0.4 * s, lab)
    c.ellipse(cx, cy - 0.28 * s, 0.5 * s, 0.42 * s, lab)
    c.ellipse(cx, cy + 0.12 * s, 0.7 * s, 0.32 * s, lab)


def tree(c: Canvas, cx, base_y, s=1.0):
    c.rrect(cx - 30 * s, base_y - 220 * s, 60 * s, 230 * s, 14 * s)
    lab = c.poly([
        (cx, base_y - 620 * s),
        (cx - 210 * s, base_y - 200 * s),
        (cx + 210 * s, base_y - 200 * s),
    ])
    c.poly([
        (cx, base_y - 720 * s),
        (cx - 170 * s, base_y - 380 * s),
        (cx + 170 * s, base_y - 380 * s),
    ], lab)


def eyes(c: Canvas, left, right, rx, ry, pr, s=1.0, flip=False, origin=None):
    # origin unused; pass absolute coords
    for cx, cy in (left, right):
        c.ellipse(cx, cy, rx, ry)
        c.ink_circle(cx + (4 if not flip else -4), cy + 4, pr)
    return


def ryzhik(c: Canvas, cx, fy, s=1.0, flip=False, pose="stand", eyes_open=True, hat=False):
    """Live-page fox cub: big head, star shirt, shorts, white muzzle, white tail tip."""
    def x(v):
        return X(cx, v, s, flip)

    def y(v):
        return fy + v * s

    # back: tail
    c.poly([
        (x(-30), y(-280)),
        (x(-160), y(-360)),
        (x(-280), y(-300)),
        (x(-300), y(-180)),
        (x(-240), y(-80)),
        (x(-140), y(-120)),
        (x(-40), y(-220)),
    ])
    c.ellipse(x(-250), y(-120), 70 * s, 55 * s)  # tip
    # far arm first if needed
    if pose in ("stand", "sled", "paint", "hold"):
        c.ellipse(x(-145), y(-400), 36 * s, 80 * s)
        c.ellipse(x(-150), y(-320), 38 * s, 28 * s)
    # legs + feet
    c.ellipse(x(-48), y(-70), 36 * s, 60 * s)
    c.ellipse(x(52), y(-70), 36 * s, 60 * s)
    c.ellipse(x(-48), y(-14), 50 * s, 22 * s)
    c.ellipse(x(52), y(-14), 50 * s, 22 * s)
    # shorts + shirt
    left = min(x(-100), x(100)) - 0 * s
    # use centered rrect
    c.rrect(cx - 100 * s, y(-250), 200 * s, 140 * s, 30 * s)
    c.rrect(cx - 115 * s, y(-470), 230 * s, 240 * s, 44 * s)
    # near arm
    if pose == "hold":
        c.ellipse(x(150), y(-360), 80 * s, 32 * s)
        c.ellipse(x(230), y(-360), 34 * s, 28 * s)
    elif pose == "paint":
        c.ellipse(x(160), y(-380), 90 * s, 30 * s)
        c.ellipse(x(250), y(-380), 32 * s, 26 * s)
    else:
        c.ellipse(x(145), y(-400), 36 * s, 80 * s)
        c.ellipse(x(150), y(-320), 38 * s, 28 * s)
    # ears, head, inner ears, muzzle, star, eyes
    c.ear(x(-110), y(-610), x(-200), y(-760), 48 * s)
    c.ear(x(110), y(-610), x(200), y(-760), 48 * s)
    c.ellipse(x(0), y(-580), 160 * s, 155 * s)
    # no inner-ear strokes: they split the ear into slivers
    c.ellipse(x(0), y(-500), 100 * s, 72 * s)
    c.poly(star_pts(x(0), y(-370), 90 * s, 50 * s))
    if hat:
        c.ellipse(x(0), y(-700), 130 * s, 50 * s)
        c.circle(x(0), y(-780), 40 * s)
    if eyes_open:
        c.ellipse(x(-70), y(-610), 58 * s, 66 * s)
        c.ellipse(x(70), y(-610), 58 * s, 66 * s)
        c.ink_circle(x(-62), y(-606), 18 * s)
        c.ink_circle(x(78), y(-606), 18 * s)
    else:
        c.ink_ellipse(x(-58), y(-618), 36 * s, 10 * s)
        c.ink_ellipse(x(58), y(-618), 36 * s, 10 * s)
    c.ink_ellipse(x(0), y(-515), 24 * s, 16 * s)
    c.smile(x(0), y(-470), 44 * s, 28 * s)


def ryzhik_sleep(c: Canvas, cx, fy, s=1.0):
    def x(v):
        return cx + v * s

    def y(v):
        return fy + v * s

    c.ellipse(x(-120), y(-40), 230 * s, 100 * s)  # pillow
    c.ellipse(x(280), y(40), 160 * s, 70 * s)  # tail
    c.ellipse(x(380), y(70), 70 * s, 40 * s)  # tip
    # blanket
    c.poly([
        (x(-40), y(-60)),
        (x(140), y(-150)),
        (x(420), y(-80)),
        (x(520), y(40)),
        (x(480), y(180)),
        (x(80), y(200)),
        (x(-80), y(120)),
    ])
    c.ear(x(-200), y(-140), x(-260), y(-300), 34 * s)
    c.ear(x(-40), y(-160), x(10), y(-320), 34 * s)
    c.ellipse(x(-120), y(-130), 140 * s, 125 * s)
    c.ellipse(x(-110), y(-60), 85 * s, 58 * s)
    c.ink_ellipse(x(-165), y(-158), 30 * s, 9 * s)
    c.ink_ellipse(x(-75), y(-166), 30 * s, 9 * s)
    c.ink_ellipse(x(-110), y(-72), 20 * s, 14 * s)
    c.smile(x(-110), y(-32), 36 * s, 20 * s)


def mishka(c: Canvas, cx, fy, s=1.0, flip=False):
    def x(v):
        return X(cx, v, s, flip)

    def y(v):
        return fy + v * s

    c.ellipse(x(-50), y(-70), 42 * s, 62 * s)
    c.ellipse(x(55), y(-70), 42 * s, 62 * s)
    c.ellipse(x(-50), y(-12), 52 * s, 22 * s)
    c.ellipse(x(55), y(-12), 52 * s, 22 * s)
    # far arm
    c.ellipse(x(-155), y(-390), 40 * s, 90 * s)
    c.ellipse(x(-160), y(-300), 42 * s, 32 * s)
    c.rrect(cx - 115 * s, y(-280), 230 * s, 200 * s, 36 * s)  # overalls
    c.rrect(cx - 80 * s, y(-430), 160 * s, 170 * s, 28 * s)  # bib
    c.ellipse(x(155), y(-390), 40 * s, 90 * s)
    c.ellipse(x(160), y(-300), 42 * s, 32 * s)
    # ears then head
    c.circle(x(-120), y(-680), 58 * s)
    c.circle(x(120), y(-680), 58 * s)
    c.ellipse(x(0), y(-590), 165 * s, 155 * s)
    # inner ears as ink so they do not make crumbs
    c.ink_circle(x(-120), y(-680), 18 * s)
    c.ink_circle(x(120), y(-680), 18 * s)
    c.ellipse(x(0), y(-510), 95 * s, 72 * s)
    c.ellipse(x(-70), y(-620), 58 * s, 64 * s)
    c.ellipse(x(70), y(-620), 58 * s, 64 * s)
    c.ink_circle(x(-62), y(-616), 18 * s)
    c.ink_circle(x(78), y(-616), 18 * s)
    c.ink_ellipse(x(0), y(-525), 26 * s, 18 * s)
    c.smile(x(0), y(-480), 40 * s, 24 * s)
    # straps as short strokes that end on the bib, not closing a pocket
    c.stroke_line(x(-50), y(-430), x(-58), y(-560))
    c.stroke_line(x(50), y(-430), x(58), y(-560))


def zayka(c: Canvas, cx, fy, s=1.0, flip=False):
    def x(v):
        return X(cx, v, s, flip)

    def y(v):
        return fy + v * s

    c.ellipse(x(-45), y(-20), 52 * s, 22 * s)
    c.ellipse(x(50), y(-20), 52 * s, 22 * s)
    c.ellipse(x(-45), y(-70), 32 * s, 55 * s)
    c.ellipse(x(50), y(-70), 32 * s, 55 * s)
    c.ellipse(x(-130), y(-380), 32 * s, 90 * s)
    c.ellipse(x(-135), y(-290), 34 * s, 28 * s)
    # dress
    c.poly([
        (x(-50), y(-500)),
        (x(50), y(-500)),
        (x(180), y(-40)),
        (x(-180), y(-40)),
    ])
    c.ellipse(x(0), y(-500), 55 * s, 28 * s)  # collar
    c.ellipse(x(130), y(-380), 32 * s, 90 * s)
    c.ellipse(x(135), y(-290), 34 * s, 28 * s)
    # long ears, then head
    c.ellipse(x(-70), y(-820), 52 * s, 160 * s)
    c.ellipse(x(70), y(-820), 52 * s, 160 * s)
    c.ellipse(x(0), y(-600), 130 * s, 140 * s)
    c.ellipse(x(0), y(-530), 72 * s, 52 * s)
    c.ellipse(x(-58), y(-640), 52 * s, 60 * s)
    c.ellipse(x(58), y(-640), 52 * s, 60 * s)
    c.ink_circle(x(-50), y(-636), 16 * s)
    c.ink_circle(x(66), y(-636), 16 * s)
    c.ink_ellipse(x(0), y(-545), 16 * s, 12 * s)
    c.smile(x(0), y(-505), 32 * s, 20 * s)


def sheep(c: Canvas, cx, fy, s=1.0):
    def x(v):
        return cx + v * s

    def y(v):
        return fy + v * s

    # legs
    for dx in (-90, -20, 50, 120):
        c.rrect(x(dx), y(-70), 36 * s, 80 * s, 14 * s)
    # fleece: one label, several bumps
    lab = c.ellipse(x(20), y(-200), 220 * s, 150 * s)
    c.ellipse(x(-90), y(-240), 130 * s, 110 * s, lab)
    c.ellipse(x(130), y(-230), 130 * s, 110 * s, lab)
    c.ellipse(x(20), y(-300), 140 * s, 100 * s, lab)
    c.ellipse(x(-40), y(-140), 120 * s, 80 * s, lab)
    c.ellipse(x(90), y(-140), 120 * s, 80 * s, lab)
    # head to the left
    c.ellipse(x(-200), y(-240), 95 * s, 88 * s)
    c.ellipse(x(-290), y(-320), 36 * s, 48 * s)  # ear kept clear of the face
    c.ellipse(x(-210), y(-200), 52 * s, 38 * s)
    c.ink_ellipse(x(-228), y(-248), 22 * s, 8 * s)
    c.ink_ellipse(x(-172), y(-248), 22 * s, 8 * s)
    c.ink_ellipse(x(-215), y(-212), 12 * s, 9 * s)
    c.smile(x(-205), y(-190), 28 * s, 14 * s)


def wolf(c: Canvas, cx, fy, s=1.0, flip=False):
    def x(v):
        return X(cx, v, s, flip)

    def y(v):
        return fy + v * s

    c.poly([
        (x(-20), y(-260)),
        (x(-160), y(-340)),
        (x(-260), y(-240)),
        (x(-220), y(-80)),
        (x(-80), y(-140)),
    ])
    c.ellipse(x(-150), y(-400), 32 * s, 80 * s)
    c.ellipse(x(-155), y(-320), 34 * s, 26 * s)
    c.ellipse(x(-48), y(-70), 34 * s, 65 * s)
    c.ellipse(x(52), y(-70), 34 * s, 65 * s)
    c.ellipse(x(-48), y(-12), 44 * s, 20 * s)
    c.ellipse(x(52), y(-12), 44 * s, 20 * s)
    c.rrect(cx - 95 * s, y(-250), 190 * s, 140 * s, 28 * s)
    c.rrect(cx - 105 * s, y(-460), 210 * s, 230 * s, 36 * s)
    # sack in the near hand
    c.ellipse(x(170), y(-280), 100 * s, 130 * s)
    c.ellipse(x(170), y(-420), 42 * s, 32 * s)
    c.ellipse(x(120), y(-350), 70 * s, 30 * s)  # arm holding sack
    c.ellipse(x(200), y(-330), 32 * s, 26 * s)
    c.ear(x(-80), y(-620), x(-130), y(-780), 32 * s)
    c.ear(x(50), y(-630), x(110), y(-780), 32 * s)
    c.ellipse(x(-10), y(-580), 130 * s, 125 * s)
    c.ellipse(x(100), y(-530), 95 * s, 48 * s)  # snout
    c.ellipse(x(-50), y(-610), 50 * s, 56 * s)
    c.ellipse(x(42), y(-610), 50 * s, 56 * s)
    c.ink_circle(x(-42), y(-606), 16 * s)
    c.ink_circle(x(50), y(-606), 16 * s)
    c.ink_ellipse(x(160), y(-530), 20 * s, 14 * s)
    c.smile(x(120), y(-505), 40 * s, 16 * s)


def unicorn(c: Canvas, cx, fy, s=1.0, flip=False):
    def x(v):
        return X(cx, v, s, flip)

    def y(v):
        return fy + v * s

    # body + legs
    c.ellipse(x(40), y(-200), 190 * s, 120 * s)
    for dx in (-80, -15, 80, 145):
        c.rrect(x(dx), y(-110), 38 * s, 120 * s, 14 * s)
        c.ellipse(x(dx + 19), y(-8), 28 * s, 14 * s)
    # tail locks
    c.poly([
        (x(210), y(-200)),
        (x(330), y(-230)),
        (x(360), y(-80)),
        (x(250), y(-40)),
        (x(220), y(-140)),
    ])
    c.poly([
        (x(220), y(-230)),
        (x(350), y(-300)),
        (x(370), y(-150)),
        (x(260), y(-100)),
    ])
    # neck + head
    c.poly([
        (x(-60), y(-280)),
        (x(-130), y(-420)),
        (x(-80), y(-520)),
        (x(20), y(-420)),
        (x(40), y(-260)),
    ])
    c.ellipse(x(-90), y(-560), 95 * s, 72 * s)
    c.ellipse(x(-180), y(-530), 75 * s, 32 * s)
    c.poly([(x(-90), y(-620)), (x(-70), y(-780)), (x(-35), y(-615))])
    # three mane locks
    c.ellipse(x(30), y(-600), 36 * s, 80 * s)
    c.ellipse(x(50), y(-500), 36 * s, 80 * s)
    c.ellipse(x(60), y(-400), 32 * s, 70 * s)
    c.ear(x(-30), y(-620), x(5), y(-720), 22 * s)
    c.ellipse(x(-110), y(-575), 40 * s, 46 * s)
    c.ink_circle(x(-106), y(-572), 14 * s)
    c.ink_ellipse(x(-220), y(-530), 12 * s, 9 * s)
    c.smile(x(-190), y(-512), 28 * s, 12 * s)


def cloud(c: Canvas, cx, cy, s):
    lab = c.ellipse(cx, cy, 1.0 * s, 0.42 * s)
    c.ellipse(cx - 0.7 * s, cy, 0.55 * s, 0.38 * s, lab)
    c.ellipse(cx + 0.7 * s, cy + 0.02 * s, 0.55 * s, 0.38 * s, lab)
    c.ellipse(cx - 0.25 * s, cy - 0.28 * s, 0.5 * s, 0.36 * s, lab)
    c.ellipse(cx + 0.3 * s, cy - 0.32 * s, 0.55 * s, 0.4 * s, lab)


def snowflake(c: Canvas, cx, cy, r):
    for ang in (0, 60, 120):
        a = math.radians(ang)
        c.stroke_line(cx - r * math.cos(a), cy - r * math.sin(a),
                      cx + r * math.cos(a), cy + r * math.sin(a))
    c.ink_circle(cx, cy, 18)


def page_ovechki_oblako() -> Canvas:
    c = Canvas()
    sun(c, 2080, 300, r=150)
    cloud(c, 1280, 1000, 620)
    sheep(c, 1240, 920, s=1.35)
    return c


def page_kozlyata_volk_gorka() -> Canvas:
    c = Canvas()
    hill(c, 1000, bump=-200)
    sun(c, 2140, 280, r=130, ray_len=80)
    tree(c, 420, 1080, s=1.15)
    wolf(c, 1500, 1260, s=1.2)
    return c


def page_slova_yabloko() -> Canvas:
    c = Canvas()
    hill(c, 1120, bump=-100)
    sun(c, 2100, 260, r=130, ray_len=80)
    bush(c, 320, 1180, 240)
    ryzhik(c, 760, 1280, s=1.12, pose="hold")
    c.circle(1280, 1000, 180)
    c.ellipse(1280, 820, 18, 50)
    c.poly([(1295, 830), (1420, 760), (1440, 860), (1320, 890)])
    mishka(c, 1840, 1280, s=1.12, flip=True)
    return c


def page_slova_zayka() -> Canvas:
    c = Canvas()
    hill(c, 1140, bump=-90)
    sun(c, 2140, 260, r=130, ray_len=80)
    bush(c, 300, 1200, 220)
    ryzhik(c, 860, 1280, s=1.15)
    zayka(c, 1760, 1280, s=1.12, flip=True)
    return c


def page_sneg_sanki() -> Canvas:
    c = Canvas()
    hill(c, 920, bump=-260)
    moon(c, 2140, 260, r=140)
    tree(c, 400, 980, s=1.05)
    # sled
    c.rrect(900, 1120, 800, 100, 36)
    c.stroke_line(940, 1220, 880, 1320)
    c.stroke_line(1620, 1220, 1700, 1320)
    c.stroke_line(860, 1320, 1720, 1320)
    ryzhik(c, 1300, 1125, s=0.95, pose="sled", hat=True)
    return c


def page_sneg_mishka_zayka() -> Canvas:
    c = Canvas()
    hill(c, 1140, bump=-120)
    sun(c, 2140, 250, r=120, ray_len=70)
    snowflake(c, 360, 300, 100)
    snowflake(c, 1260, 260, 120)
    snowflake(c, 860, 400, 80)
    mishka(c, 860, 1280, s=1.15)
    zayka(c, 1760, 1280, s=1.12, flip=True)
    return c


def page_ovechki_son() -> Canvas:
    c = Canvas()
    hill(c, 1040, bump=-70)
    moon(c, 2100, 280, r=150)
    c.poly(star_pts(420, 280, 110, 60))
    c.poly(star_pts(700, 200, 90, 50))
    ryzhik_sleep(c, 1000, 1080, s=1.35)
    return c


def page_edinorozhka_risuet() -> Canvas:
    c = Canvas()
    hill(c, 1140, bump=-70)
    sun(c, 2200, 250, r=120, ray_len=70)
    # easel board
    c.rrect(1420, 280, 700, 560, 20)
    unicorn(c, 1770, 780, s=0.72)
    c.stroke_line(1520, 840, 1440, 1180)
    c.stroke_line(2020, 840, 2100, 1180)
    c.stroke_line(1480, 1040, 2060, 1040)
    ryzhik(c, 720, 1280, s=1.12, pose="paint")
    c.rrect(948, 780, 52, 180, 14)
    c.ellipse(974, 760, 28, 36)
    return c


PAGES = {
    "ovechki_oblako": page_ovechki_oblako,
    "kozlyata_volk_gorka": page_kozlyata_volk_gorka,
    "slova_yabloko": page_slova_yabloko,
    "slova_zayka": page_slova_zayka,
    "sneg_sanki": page_sneg_sanki,
    "sneg_mishka_zayka": page_sneg_mishka_zayka,
    "ovechki_son": page_ovechki_son,
    "edinorozhka_risuet": page_edinorozhka_risuet,
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    names = [n for n in PAGES if not sys.argv[1:] or n in sys.argv[1:]]
    for name in names:
        svg, png = to_assets(PAGES[name]())
        path = OUT / f"{name}.svg"
        path.write_text(svg)
        (OUT / f"{name}.png").write_bytes(png)
        print("wrote", path, "bytes", path.stat().st_size, "paths", svg.count("<path"), "png", len(png))


if __name__ == "__main__":
    main()
