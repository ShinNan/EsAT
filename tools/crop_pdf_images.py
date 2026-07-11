#!/usr/bin/env python3
"""Crop ENGAA 2016 Section 1 question diagrams from the source PDF.

This script uses PyMuPDF (`fitz`) and is intentionally static-project friendly:
it reads the checked-in source paper and writes PNG crops into
`assets/question-images/`.

Run from the repository root:

    python3 tools/crop_pdf_images.py --debug
    python3 tools/crop_pdf_images.py

The `--debug` pass writes full-page 300 DPI renders to `debug-renders/` so crop
rectangles can be checked/tuned before committing crop outputs.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PDF = REPO_ROOT / "source-papers" / "ENGAA 2016 Section 1.pdf"
IMAGE_DIR = REPO_ROOT / "assets" / "question-images"
DEBUG_DIR = REPO_ROOT / "debug-renders"
DPI = 300
ZOOM = DPI / 72


@dataclass(frozen=True)
class CropSpec:
    question_id: str
    page_index: int
    rect: tuple[float, float, float, float]
    output: str
    note: str


# Coordinates are PDF points in PyMuPDF's page coordinate space.
# Tune with `--debug` if the checked-in PDF differs from the public ENGAA copy.
CROPS: tuple[CropSpec, ...] = (
    CropSpec(
        question_id="ENGAA_2016_P1_Q04",
        page_index=5,
        rect=(200, 75, 430, 255),
        output="ENGAA_2016_P1_Q04_graph_crop.png",
        note="comparison crop for simple graph; recreated SVG remains main image unless crop is clearer",
    ),
    CropSpec(
        question_id="ENGAA_2016_P1_Q06",
        page_index=7,
        rect=(70, 95, 505, 365),
        output="ENGAA_2016_P1_Q06_fission-diagrams.png",
        note="main crop for nuclear fission diagrams; use PDF crop because exact notation matters",
    ),
)


def load_fitz():
    try:
        import fitz  # type: ignore
    except ImportError as exc:  # pragma: no cover - environment guard
        raise SystemExit(
            "PyMuPDF is required. Install it with `python3 -m pip install pymupdf` "
            "and rerun this script."
        ) from exc
    return fitz


def ensure_source_pdf() -> None:
    if not SOURCE_PDF.exists():
        raise SystemExit(
            f"Source PDF not found: {SOURCE_PDF}\n"
            "Merge the main branch/source-papers upload into this branch, then rerun."
        )


def render_debug_pages(doc: "fitz.Document") -> None:
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)
    pages = sorted({spec.page_index for spec in CROPS})
    matrix = fitz.Matrix(ZOOM, ZOOM)
    for page_index in pages:
        page = doc[page_index]
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        out = DEBUG_DIR / f"ENGAA_2016_Section_1_page_{page_index + 1:02d}_300dpi.png"
        pix.save(out)
        print(f"debug render: {out.relative_to(REPO_ROOT)}")


def render_crop(doc: "fitz.Document", spec: CropSpec) -> None:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    page = doc[spec.page_index]
    clip = fitz.Rect(*spec.rect)
    pix = page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), clip=clip, alpha=False)
    out = IMAGE_DIR / spec.output
    pix.save(out)
    print(f"crop: {spec.question_id} -> {out.relative_to(REPO_ROOT)} ({spec.note})")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--debug", action="store_true", help="write full-page debug renders before crops")
    parser.add_argument("--no-crops", action="store_true", help="only write debug renders")
    args = parser.parse_args()

    ensure_source_pdf()

    fitz = load_fitz()

    with fitz.open(SOURCE_PDF) as doc:
        if args.debug:
            render_debug_pages(doc)
        if not args.no_crops:
            for spec in CROPS:
                render_crop(doc, spec)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
