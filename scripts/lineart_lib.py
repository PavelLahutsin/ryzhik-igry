#!/usr/bin/env python3
"""Shared helpers: clean a black/white line-art mask and emit a regions SVG + PNG."""
from __future__ import annotations

import cv2
import numpy as np
from scipy import ndimage

W, H = 2560, 1440
SW = 20
# After a 12 px outline inset, leftovers must still beat the 160 px tiny cap at 1280
# (640 px at 2560). Use a larger floor so antialias crumbs do not appear later.
MIN_WHITE_AREA_2560 = 900
NECK_RUN_2560 = 8  # ~4 px at the 1280 QA raster, just above the 1–3 px neck test


def path_from_mask(mask: np.ndarray, simplify: float = 1.2) -> str | None:
    m = np.ascontiguousarray(mask.astype(np.uint8))
    cnts, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    if not cnts or hier is None:
        return None
    hier = hier[0]
    parts: list[str] = []

    def one(cnt) -> str | None:
        if len(cnt) < 6:
            return None
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, max(simplify, 0.0012 * peri), True)
        pts = approx.reshape(-1, 2)
        if len(pts) < 3:
            return None
        return "M " + " L ".join(f"{int(x)},{int(y)}" for x, y in pts) + " Z"

    for i, cnt in enumerate(cnts):
        if hier[i][3] != -1:
            continue
        d = one(cnt)
        if not d:
            continue
        child = hier[i][2]
        while child != -1:
            hole = one(cnts[child])
            if hole:
                d += " " + hole
            child = hier[child][0]
        parts.append(d)
    if not parts:
        return None
    return " ".join(parts)


def edge_ink(labels: np.ndarray, radius: int = 12) -> np.ndarray:
    ink = np.zeros(labels.shape, dtype=bool)
    ink[:, 1:] |= labels[:, 1:] != labels[:, :-1]
    ink[1:, :] |= labels[1:, :] != labels[:-1, :]
    kern = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (radius * 2 + 1, radius * 2 + 1))
    return cv2.dilate(ink.astype(np.uint8), kern, iterations=1).astype(bool)


def _fill_small_white(ink: np.ndarray, min_area: int) -> np.ndarray:
    labels, n = ndimage.label(~ink)
    if n == 0:
        return ink
    counts = np.bincount(labels.ravel())
    small = np.zeros(n + 1, dtype=bool)
    small[1:] = counts[1:] < min_area
    if small.any():
        ink = ink | small[labels]
    return ink


def _fill_thin_white(ink: np.ndarray, min_radius: float) -> np.ndarray:
    """Drop needle-thin crumbs only. Do not fill large rings (eyes, ears)."""
    labels, n = ndimage.label(~ink)
    if n == 0:
        return ink
    # A needle's area stays modest; a colorable ring or eye is much larger.
    max_area = int(max(400, min_radius * min_radius * 3.1416 * 5))
    drop = np.zeros(n + 1, dtype=bool)
    for i in range(1, n + 1):
        blob = labels == i
        area = int(blob.sum())
        if area == 0 or area >= max_area:
            continue
        if ndimage.distance_transform_edt(blob).max() < min_radius:
            drop[i] = True
    if drop.any():
        ink = ink | drop[labels]
    return ink


def _narrow_runs(labels: np.ndarray, max_run: int) -> np.ndarray:
    """Mark interior 1..max_run horizontal/vertical runs of a label (QA neck test)."""
    h, w = labels.shape
    narrow = np.zeros(labels.shape, np.uint8)
    for y in range(h):
        row = labels[y]
        x = 0
        while x < w:
            lab = int(row[x])
            if lab == 0:
                x += 1
                continue
            end = x + 1
            while end < w and row[end] == lab:
                end += 1
            if end - x <= max_run and x > 0 and end < w:
                narrow[y, x:end] = end - x
            x = end
    for x in range(w):
        col = labels[:, x]
        y = 0
        while y < h:
            lab = int(col[y])
            if lab == 0:
                y += 1
                continue
            end = y + 1
            while end < h and col[end] == lab:
                end += 1
            if end - y <= max_run and y > 0 and end < h:
                narrow[y:end, x] = np.maximum(narrow[y:end, x], end - y)
            y = end
    return narrow


def _seal_necks(ink: np.ndarray, max_run: int) -> np.ndarray:
    labels, n = ndimage.label(~ink)
    if n == 0:
        return ink
    narrow = _narrow_runs(labels, max_run)
    if not narrow.any():
        return ink
    # Cores = white minus neck pixels. If a region has 2+ cores, fill its necks.
    cores, _ = ndimage.label((labels > 0) & (narrow == 0))
    # map each core id to the parent white label via a sample pixel
    # Then count unique cores per white label.
    # Vectorized: for every pixel with a core, look at labels[pixel]
    parent = labels[cores > 0]
    core_ids = cores[cores > 0]
    if core_ids.size == 0:
        return ink
    # unique (parent, core) pairs
    pairs = np.unique(parent.astype(np.int64) * (int(cores.max()) + 1) + core_ids.astype(np.int64))
    # count cores per parent
    parents_of_pairs = pairs // (int(cores.max()) + 1)
    counts = np.bincount(parents_of_pairs, minlength=n + 1)
    split = counts >= 2
    if not split.any():
        return ink
    ink = ink | (split[labels] & (narrow > 0))
    return ink


def clean_ink(ink: np.ndarray, min_area: int = MIN_WHITE_AREA_2560, max_run: int = NECK_RUN_2560) -> np.ndarray:
    """Fill crumbs and seal 1–few-pixel necks so the stricter region QA can pass."""
    out = np.ascontiguousarray(ink.astype(bool))
    # Same square close as regions.ts closeGaps (separable box of radius r).
    r = 2 if out.shape[1] <= 1280 else 4
    kern = np.ones((r * 2 + 1, r * 2 + 1), np.uint8)
    out = cv2.morphologyEx(out.astype(np.uint8), cv2.MORPH_CLOSE, kern).astype(bool)
    for _ in range(6):
        before = out.copy()
        out = _fill_small_white(out, min_area)
        thin_r = 12 if ink.shape[1] >= 2000 else 5
        out = _fill_thin_white(out, min_radius=thin_r)
        out = _seal_necks(out, max_run)
        if np.array_equal(before, out):
            break
    # One last engine-style close so QA's closingRadius=2 cannot isolate a crumb.
    r = 2 if out.shape[1] <= 1280 else 4
    kern = np.ones((r * 2 + 1, r * 2 + 1), np.uint8)
    out = cv2.morphologyEx(out.astype(np.uint8), cv2.MORPH_CLOSE, kern).astype(bool)
    out = _fill_small_white(out, min_area)
    return out


def merge_small(im: np.ndarray, min_area: int, min_radius: float) -> np.ndarray:
    """Absorb crumbs and needle-thin semantic parts into a neighbor."""
    out = im.copy()
    structure = np.ones((3, 3), np.uint8)
    for _ in range(8):
        changed = False
        labels, n = ndimage.label(out > 0, structure=structure)
        if n == 0:
            break
        # component -> semantic id (max vote)
        # merge components that are small or thin
        slices = ndimage.find_objects(labels)
        for i, sl in enumerate(slices, start=1):
            if sl is None:
                continue
            blob = labels[sl] == i
            area = int(blob.sum())
            if area >= min_area:
                # cheap min-dimension gate before EDT
                ys, xs = np.where(blob)
                if (ys.max() - ys.min() + 1) >= min_radius * 2 and (xs.max() - xs.min() + 1) >= min_radius * 2:
                    if area >= min_area * 6 or ndimage.distance_transform_edt(blob).max() >= min_radius:
                        continue
            # neighbor semantic labels in the full image
            # dilate in the local slice with a pad
            pad = 3
            y0, x0 = sl[0].start, sl[1].start
            y1, x1 = sl[0].stop, sl[1].stop
            ya, xa = max(0, y0 - pad), max(0, x0 - pad)
            yb, xb = min(out.shape[0], y1 + pad), min(out.shape[1], x1 + pad)
            local = labels[ya:yb, xa:xb] == i
            dil = cv2.dilate(local.astype(np.uint8), np.ones((7, 7), np.uint8), iterations=1).astype(bool)
            neigh = out[ya:yb, xa:xb][dil & ~local]
            neigh = neigh[neigh != 0]
            if neigh.size:
                out[y0:y1, x0:x1][blob] = int(np.bincount(neigh).argmax())
            else:
                out[y0:y1, x0:x1][blob] = 0
            changed = True
        if not changed:
            break
    return out


def ink_to_png_bytes(ink: np.ndarray) -> bytes:
    img = np.full((ink.shape[0], ink.shape[1], 3), 255, np.uint8)
    img[ink] = 0
    ok, buf = cv2.imencode(".png", img)
    if not ok:
        raise RuntimeError("png encode failed")
    return buf.tobytes()


def ink_to_svg(ink: np.ndarray, title: str = "Ryzhik coloring page",
               display_w: int | None = None, display_h: int | None = None) -> str:
    h, w = ink.shape
    dw = w if display_w is None else display_w
    dh = h if display_h is None else display_h
    labels, n = ndimage.label(~ink)
    regions: list[str] = []
    for lab in range(1, n + 1):
        mask = labels == lab
        if int(mask.sum()) < 80:
            continue
        d = path_from_mask(mask, simplify=1.6)
        if d:
            regions.append(d)
    outline = path_from_mask(ink, simplify=0.25)

    def paths(ds, extra):
        return "\n".join('    <path d="%s" %s/>' % (d, extra) for d in ds)

    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" shape-rendering="crispEdges">' % (dw, dh, w, h),
        "  <title>%s</title>" % title,
        '  <rect width="%d" height="%d" fill="#ffffff"/>' % (w, h),
        '  <g id="regions" fill="#ffffff" stroke="none" fill-rule="evenodd">',
        paths(regions, 'fill="#ffffff" stroke="none"'),
        "  </g>",
        '  <g id="outline" fill="#000000" stroke="none" fill-rule="evenodd">',
    ]
    if outline:
        parts.append('    <path d="%s" fill="#000000" stroke="none"/>' % outline)
    parts += ["  </g>", "</svg>", ""]
    return "\n".join(parts)


def finalize_ink(ink: np.ndarray) -> np.ndarray:
    """Clean at 2560, then again on the 1280 QA grid so downsample cannot open a neck."""
    full = np.asarray(ink, dtype=bool)
    if full.shape != (H, W):
        return clean_ink(full)
    cleaned = clean_ink(full, min_area=MIN_WHITE_AREA_2560, max_run=NECK_RUN_2560)
    small = cleaned[0:H:2, 0:W:2]
    small = clean_ink(small, min_area=160, max_run=3)
    return np.repeat(np.repeat(small, 2, axis=0), 2, axis=1)


def assets_from_ink(ink: np.ndarray, title: str = "Ryzhik coloring page") -> tuple[str, bytes]:
    cleaned = finalize_ink(ink)
    # Trace SVG in 1280 space so QA's 1280-wide resvg pass is 1:1 with the cleaned grid.
    small = cleaned[0:H:2, 0:W:2]
    svg = ink_to_svg(small, title=title, display_w=W, display_h=H)
    return svg, ink_to_png_bytes(cleaned)


def letterbox_to_page(img_bgr: np.ndarray) -> np.ndarray:
    """Scale a raster into 2560×1440 with a white canvas, keeping aspect ratio."""
    h, w = img_bgr.shape[:2]
    scale = min(W / w, H / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    resized = cv2.resize(img_bgr, (nw, nh), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
    canvas = np.full((H, W, 3), 255, np.uint8)
    x0, y0 = (W - nw) // 2, (H - nh) // 2
    canvas[y0:y0 + nh, x0:x0 + nw] = resized
    return canvas


def letterbox_mask(mask: np.ndarray) -> np.ndarray:
    """Scale a binary ink mask to 2560×1440 with nearest-neighbour, no blur."""
    h, w = mask.shape
    scale = min(W / w, H / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    resized = cv2.resize(mask.astype(np.uint8), (nw, nh), interpolation=cv2.INTER_NEAREST)
    canvas = np.zeros((H, W), np.uint8)
    x0, y0 = (W - nw) // 2, (H - nh) // 2
    canvas[y0:y0 + nh, x0:x0 + nw] = resized
    return canvas.astype(bool)


def raster_to_ink(img_bgr: np.ndarray, threshold: int = 72) -> np.ndarray:
    """Same ink test as the game: shade = min(R,G,B), ink = 255-shade (opaque)."""
    if img_bgr.ndim == 2:
        shade = img_bgr
    else:
        # OpenCV is BGR
        shade = img_bgr.min(axis=2)
    ink_amt = 255 - shade
    return ink_amt >= threshold


def estimate_stroke_radius(ink: np.ndarray) -> float:
    if not ink.any():
        return 0.0
    dist = ndimage.distance_transform_edt(ink)
    vals = dist[ink & (dist > 0)]
    if vals.size == 0:
        return 0.0
    return float(np.median(vals))


def import_lineart_png(img_bgr: np.ndarray, threshold: int = 72, target_radius: int = 0) -> np.ndarray:
    """Turn a photo or generated line-art PNG into a cleaned 2560×1440 ink mask.

    Threshold and gap-close at native resolution, then nearest-neighbour scale
    so already-thick coloring lines are not blurred and re-thickened.
    target_radius 0 (default) only thickens hairlines (radius < 4 at 2560).
    A positive target_radius thickens up to that half-width.
    """
    ink = raster_to_ink(img_bgr, threshold=threshold)
    lab, n = ndimage.label(ink)
    if n:
        counts = np.bincount(lab.ravel())
        keep = np.zeros(n + 1, dtype=bool)
        # drop tiny speckles, scaled to the source pixel count
        min_speck = max(8, int(ink.size / (2560 * 1440) * 40))
        keep[1:] = counts[1:] >= min_speck
        ink = keep[lab]
    # close 1–2 px gaps at native size (5×5 at ~1280)
    close_r = 2 if min(ink.shape) <= 900 else 3
    kern = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close_r * 2 + 1, close_r * 2 + 1))
    ink = cv2.morphologyEx(ink.astype(np.uint8), cv2.MORPH_CLOSE, kern).astype(bool)
    ink = letterbox_mask(ink)
    radius = estimate_stroke_radius(ink)
    want = 4 if target_radius <= 0 else target_radius
    if radius < want - 0.5:
        k = int(max(1, round(want - radius)))
        kern = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k * 2 + 1, k * 2 + 1))
        ink = cv2.dilate(ink.astype(np.uint8), kern, iterations=1).astype(bool)
    return clean_ink(ink)
