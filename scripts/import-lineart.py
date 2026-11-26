#!/usr/bin/env python3
"""Turn a PNG line-art file (Flow, GPT Image, a scan) into a regions coloring page.

    python3 scripts/import-lineart.py photo.png
    python3 scripts/import-lineart.py photo.png --id ovechki_oblako --out /tmp/imported --qa

Default output is /workspace/research/coloring-check/imported/<id>/ (or
./imported/<id> if that folder is not writable). The game pictures folder is
never overwritten unless you pass --install-pictures.

With --qa, the same stricter region QA used for hand SVG pages is run on the
result (npm run regions is not required; a one-file runner is called).
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

import cv2

# Allow `python3 scripts/import-lineart.py` from the repo root or from scripts/.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lineart_lib import (  # noqa: E402
    W,
    assets_from_ink,
    import_lineart_png,
)

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_IMPORT_ROOT = Path("/workspace/research/coloring-check/imported")
PICTURES = ROOT / "src/games/raskraska/assets/pictures"
QA_RUNNER = ROOT / "scripts/run-qa-files.mjs"


def default_out_dir(page_id: str) -> Path:
    root = DEFAULT_IMPORT_ROOT
    try:
        root.mkdir(parents=True, exist_ok=True)
        probe = root / ".write-test"
        probe.write_text("ok")
        probe.unlink()
        return root / page_id
    except OSError:
        return Path.cwd() / "imported" / page_id


def load_bgr(path: Path):
    data = path.read_bytes()
    arr = cv2.imdecode(__import__("numpy").frombuffer(data, dtype="uint8"), cv2.IMREAD_UNCHANGED)
    if arr is None:
        raise SystemExit(f"не удалось прочитать изображение: {path}")
    if arr.ndim == 2:
        return cv2.cvtColor(arr, cv2.COLOR_GRAY2BGR)
    if arr.shape[2] == 4:
        # composite onto white so transparent pixels do not become ink
        bgr = arr[:, :, :3]
        a = arr[:, :, 3:] / 255.0
        white = __import__("numpy").full_like(bgr, 255)
        return (bgr * a + white * (1 - a)).astype("uint8")
    return arr


def run_qa(svg_path: Path) -> int:
    env = os.environ.copy()
    env["REGION_QA_CLI"] = "1"
    proc = subprocess.run(
        ["node", str(QA_RUNNER), str(svg_path)],
        cwd=str(ROOT),
        env=env,
    )
    return proc.returncode


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input", help="PNG (or JPEG) line-art file")
    p.add_argument("--id", help="page id (default: input filename stem)")
    p.add_argument("--out", help="output directory (svg, png, qa.json). Does not write into the game folder.")
    p.add_argument("--threshold", type=int, default=72, help="ink threshold, same as the game (default 72)")
    p.add_argument("--stroke-radius", type=int, default=0, help="target outline half-width at 2560 px; 0 = auto, thicken hairlines only")
    p.add_argument("--qa", action="store_true", help="run the stricter region QA on the result")
    p.add_argument(
        "--install-pictures",
        action="store_true",
        help="also copy the result into src/games/raskraska/assets/pictures/ (off by default)",
    )
    args = p.parse_args(argv)

    src = Path(args.input).expanduser().resolve()
    if not src.is_file():
        print(f"нет файла: {src}", file=sys.stderr)
        return 2
    page_id = args.id or src.stem
    if not page_id.replace("_", "").isalnum():
        print(f"странный id «{page_id}»: используйте латиницу, цифры и _", file=sys.stderr)
        return 2
    out_dir = Path(args.out).expanduser().resolve() if args.out else default_out_dir(page_id)
    out_dir.mkdir(parents=True, exist_ok=True)

    bgr = load_bgr(src)
    ink = import_lineart_png(bgr, threshold=args.threshold, target_radius=args.stroke_radius)
    svg, png = assets_from_ink(ink, title=f"Ryzhik coloring page ({page_id})")
    svg_path = out_dir / f"{page_id}.svg"
    png_path = out_dir / f"{page_id}.png"
    svg_path.write_text(svg)
    png_path.write_bytes(png)
    print(f"wrote {svg_path} ({svg_path.stat().st_size} bytes, {svg.count('<path')} paths)")
    print(f"wrote {png_path} ({png_path.stat().st_size} bytes)")

    if args.install_pictures:
        PICTURES.mkdir(parents=True, exist_ok=True)
        (PICTURES / f"{page_id}.svg").write_text(svg)
        (PICTURES / f"{page_id}.png").write_bytes(png)
        print(f"copied into {PICTURES}")

    if args.qa:
        code = run_qa(svg_path)
        if code != 0:
            print("Region QA: брак (см. лог выше)", file=sys.stderr)
            return code
        print("Region QA: ок")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
