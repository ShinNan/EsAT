#!/usr/bin/env python3
"""Prepare, review, and build deterministic question-image crops from PDFs.

The crop manifest stores 1-based page numbers and normalized boxes in the
top-left coordinate system: ``[x0, y0, x1, y1]`` where every value is in the
range 0..1.  This keeps selections independent of preview and output DPI.

Typical Codespaces workflow, run from the repository root::

    python3 tools/crop_pdf_images.py prepare
    python3 -m http.server 4173
    # Open http://localhost:4173/tools/crop_selector.html and draw a box.
    python3 tools/crop_pdf_images.py set-box --id CROP_ID --box x0,y0,x1,y1
    python3 tools/crop_pdf_images.py build
    python3 tools/crop_pdf_images.py validate --require-outputs
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = Path("data/pdf-crops.json")
DEBUG_DIR = Path("debug-renders")
ALLOWED_STATUSES = {"needs-review", "reviewed", "approved"}
ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]*$")


class ManifestError(ValueError):
    """Raised when the crop manifest is unsafe or internally inconsistent."""


@dataclass(frozen=True)
class DocumentSpec:
    key: str
    pdf: Path
    debug_dpi: int
    output_dpi: int


@dataclass(frozen=True)
class CropSpec:
    crop_id: str
    question_id: str
    document: str
    page: int
    box: tuple[float, float, float, float]
    output: Path
    alt: str
    status: str
    note: str


@dataclass(frozen=True)
class CropManifest:
    path: Path
    root: Path
    raw: dict[str, Any]
    documents: dict[str, DocumentSpec]
    crops: tuple[CropSpec, ...]


def load_fitz():
    """Import PyMuPDF only when a PDF operation is requested."""
    try:
        import pymupdf as fitz  # type: ignore
    except ImportError:
        try:
            import fitz  # type: ignore
        except ImportError as exc:  # pragma: no cover - environment guard
            raise SystemExit(
                "PyMuPDF is required. Install it with "
                "`python3 -m pip install -r requirements-tools.txt`."
            ) from exc
    return fitz


def _expect_mapping(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ManifestError(f"{label} must be a JSON object")
    return value


def _expect_string(value: Any, label: str, *, allow_empty: bool = False) -> str:
    if not isinstance(value, str):
        raise ManifestError(f"{label} must be a string")
    result = value.strip()
    if not allow_empty and not result:
        raise ManifestError(f"{label} must not be empty")
    return result


def _expect_int(value: Any, label: str, minimum: int, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ManifestError(f"{label} must be an integer")
    if not minimum <= value <= maximum:
        raise ManifestError(f"{label} must be between {minimum} and {maximum}")
    return value


def _validate_identifier(value: Any, label: str) -> str:
    result = _expect_string(value, label)
    if not ID_PATTERN.fullmatch(result):
        raise ManifestError(
            f"{label} must contain only letters, numbers, underscores, and hyphens"
        )
    return result


def resolve_repo_path(root: Path, value: Any, label: str) -> Path:
    """Resolve a manifest path while preventing absolute/path-traversal writes."""
    raw = _expect_string(value, label)
    path = Path(raw)
    if path.is_absolute():
        raise ManifestError(f"{label} must be relative to the repository root")
    resolved_root = root.resolve()
    resolved = (resolved_root / path).resolve()
    try:
        resolved.relative_to(resolved_root)
    except ValueError as exc:
        raise ManifestError(f"{label} escapes the repository root: {raw}") from exc
    return resolved


def parse_box(value: Any, label: str = "box") -> tuple[float, float, float, float]:
    if isinstance(value, str):
        value = [part.strip() for part in value.split(",")]
    if not isinstance(value, (list, tuple)) or len(value) != 4:
        raise ManifestError(f"{label} must contain exactly four numbers")
    try:
        box = tuple(float(part) for part in value)
    except (TypeError, ValueError) as exc:
        raise ManifestError(f"{label} must contain exactly four numbers") from exc
    if not all(math.isfinite(part) for part in box):
        raise ManifestError(f"{label} values must be finite")
    x0, y0, x1, y1 = box
    if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
        raise ManifestError(
            f"{label} must satisfy 0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1"
        )
    return box  # type: ignore[return-value]


def normalized_box_to_rect(
    box: Sequence[float], width: float, height: float
) -> tuple[float, float, float, float]:
    x0, y0, x1, y1 = box
    return (x0 * width, y0 * height, x1 * width, y1 * height)


def debug_filename(document_key: str, page: int) -> str:
    return f"{document_key}_page_{page:02d}_grid.png"


def load_manifest(
    manifest_path: Path | str = DEFAULT_MANIFEST, root: Path = REPO_ROOT
) -> CropManifest:
    root = root.resolve()
    path = Path(manifest_path)
    if not path.is_absolute():
        path = root / path
    path = path.resolve()
    try:
        path.relative_to(root)
    except ValueError as exc:
        raise ManifestError("manifest path must be inside the repository") from exc
    if not path.is_file():
        raise ManifestError(f"manifest not found: {path}")

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ManifestError(f"invalid JSON in {path}: {exc}") from exc
    raw = _expect_mapping(raw, "manifest")
    if raw.get("schemaVersion") != 1:
        raise ManifestError("manifest.schemaVersion must be 1")

    raw_documents = _expect_mapping(raw.get("documents"), "manifest.documents")
    if not raw_documents:
        raise ManifestError("manifest.documents must not be empty")
    documents: dict[str, DocumentSpec] = {}
    for raw_key, raw_document in raw_documents.items():
        key = _validate_identifier(raw_key, "document key")
        data = _expect_mapping(raw_document, f"documents.{key}")
        documents[key] = DocumentSpec(
            key=key,
            pdf=resolve_repo_path(root, data.get("pdf"), f"documents.{key}.pdf"),
            debug_dpi=_expect_int(
                data.get("debugDpi", 150), f"documents.{key}.debugDpi", 72, 600
            ),
            output_dpi=_expect_int(
                data.get("outputDpi", 300), f"documents.{key}.outputDpi", 72, 600
            ),
        )

    raw_crops = raw.get("crops")
    if not isinstance(raw_crops, list) or not raw_crops:
        raise ManifestError("manifest.crops must be a non-empty JSON array")

    crops: list[CropSpec] = []
    seen_ids: set[str] = set()
    seen_outputs: set[Path] = set()
    image_root = (root / "assets/question-images").resolve()
    for index, raw_crop in enumerate(raw_crops):
        label = f"crops[{index}]"
        data = _expect_mapping(raw_crop, label)
        crop_id = _validate_identifier(data.get("id"), f"{label}.id")
        question_id = _validate_identifier(
            data.get("questionId"), f"{label}.questionId"
        )
        document = _validate_identifier(data.get("document"), f"{label}.document")
        if document not in documents:
            raise ManifestError(f"{label}.document references unknown document {document}")
        page = _expect_int(data.get("page"), f"{label}.page", 1, 10000)
        box = parse_box(data.get("box"), f"{label}.box")
        output = resolve_repo_path(root, data.get("output"), f"{label}.output")
        try:
            output.relative_to(image_root)
        except ValueError as exc:
            raise ManifestError(
                f"{label}.output must be inside assets/question-images"
            ) from exc
        if output.suffix.lower() != ".png":
            raise ManifestError(f"{label}.output must end in .png")
        status = _expect_string(data.get("status", "needs-review"), f"{label}.status")
        if status not in ALLOWED_STATUSES:
            allowed = ", ".join(sorted(ALLOWED_STATUSES))
            raise ManifestError(f"{label}.status must be one of: {allowed}")
        alt = _expect_string(data.get("alt", ""), f"{label}.alt", allow_empty=True)
        if status == "approved" and not alt:
            raise ManifestError(f"{label}.alt is required when status is approved")
        note = _expect_string(data.get("note", ""), f"{label}.note", allow_empty=True)

        if crop_id in seen_ids:
            raise ManifestError(f"duplicate crop id: {crop_id}")
        if output in seen_outputs:
            raise ManifestError(f"duplicate crop output: {output.relative_to(root)}")
        seen_ids.add(crop_id)
        seen_outputs.add(output)
        crops.append(
            CropSpec(
                crop_id=crop_id,
                question_id=question_id,
                document=document,
                page=page,
                box=box,
                output=output,
                alt=alt,
                status=status,
                note=note,
            )
        )

    return CropManifest(
        path=path,
        root=root,
        raw=raw,
        documents=documents,
        crops=tuple(crops),
    )


def select_crops(manifest: CropManifest, crop_ids: Iterable[str]) -> tuple[CropSpec, ...]:
    requested = list(dict.fromkeys(crop_ids))
    if not requested:
        return manifest.crops
    by_id = {crop.crop_id: crop for crop in manifest.crops}
    missing = [crop_id for crop_id in requested if crop_id not in by_id]
    if missing:
        raise ManifestError(f"unknown crop id(s): {', '.join(missing)}")
    return tuple(by_id[crop_id] for crop_id in requested)


def validate_documents(manifest: CropManifest, fitz: Any) -> dict[str, tuple[float, float, int]]:
    page_meta: dict[str, tuple[float, float, int]] = {}
    for key, document in manifest.documents.items():
        if not document.pdf.is_file():
            raise ManifestError(
                f"source PDF not found: {document.pdf.relative_to(manifest.root)}"
            )
        with fitz.open(document.pdf) as pdf:
            for crop in (item for item in manifest.crops if item.document == key):
                if crop.page > len(pdf):
                    raise ManifestError(
                        f"{crop.crop_id} uses page {crop.page}, but {key} has {len(pdf)} pages"
                    )
                page = pdf[crop.page - 1]
                page_meta[crop.crop_id] = (page.rect.width, page.rect.height, len(pdf))
    return page_meta


def _draw_grid(page: Any, step: float = 50.0) -> None:
    width = float(page.rect.width)
    height = float(page.rect.height)
    value = 0.0
    while value <= width + 0.01:
        major = round(value) % 100 == 0
        page.draw_line(
            (value, 0),
            (value, height),
            color=(0.80, 0.25, 0.25) if major else (0.92, 0.72, 0.72),
            width=0.55 if major else 0.25,
            overlay=True,
        )
        if major and value > 0:
            page.insert_text(
                (value + 2, 8),
                f"x={value:g}",
                fontsize=5,
                color=(0.65, 0.05, 0.05),
                overlay=True,
            )
        value += step
    value = 0.0
    while value <= height + 0.01:
        major = round(value) % 100 == 0
        page.draw_line(
            (0, value),
            (width, value),
            color=(0.80, 0.25, 0.25) if major else (0.92, 0.72, 0.72),
            width=0.55 if major else 0.25,
            overlay=True,
        )
        if major and value > 0:
            page.insert_text(
                (2, value - 2),
                f"y={value:g}",
                fontsize=5,
                color=(0.65, 0.05, 0.05),
                overlay=True,
            )
        value += step


def prepare_debug_renders(
    manifest: CropManifest, crops: Sequence[CropSpec], fitz: Any
) -> Path:
    debug_dir = (manifest.root / DEBUG_DIR).resolve()
    debug_dir.mkdir(parents=True, exist_ok=True)
    page_requests = sorted({(crop.document, crop.page) for crop in crops})
    page_details: dict[tuple[str, int], dict[str, Any]] = {}

    for document_key, page_number in page_requests:
        document = manifest.documents[document_key]
        with fitz.open(document.pdf) as source:
            source_page = source[page_number - 1]
            with fitz.open() as preview_document:
                preview_page = preview_document.new_page(
                    width=source_page.rect.width, height=source_page.rect.height
                )
                preview_page.show_pdf_page(preview_page.rect, source, page_number - 1)
                _draw_grid(preview_page)
                pixmap = preview_page.get_pixmap(
                    matrix=fitz.Matrix(document.debug_dpi / 72, document.debug_dpi / 72),
                    alpha=False,
                )
                filename = debug_filename(document_key, page_number)
                destination = debug_dir / filename
                temporary = debug_dir / f".{filename}.tmp.png"
                pixmap.save(temporary)
                temporary.replace(destination)
                page_details[(document_key, page_number)] = {
                    "image": (DEBUG_DIR / filename).as_posix(),
                    "pageWidthPoints": round(float(source_page.rect.width), 4),
                    "pageHeightPoints": round(float(source_page.rect.height), 4),
                    "debugDpi": document.debug_dpi,
                }
                print(f"debug: {destination.relative_to(manifest.root)}")

    index = {
        "schemaVersion": 1,
        "tasks": [
            {
                "id": crop.crop_id,
                "questionId": crop.question_id,
                "document": crop.document,
                "page": crop.page,
                "box": list(crop.box),
                "output": crop.output.relative_to(manifest.root).as_posix(),
                "alt": crop.alt,
                "status": crop.status,
                "note": crop.note,
                **page_details[(crop.document, crop.page)],
            }
            for crop in crops
        ],
    }
    index_path = debug_dir / "index.json"
    temporary_index = debug_dir / ".index.json.tmp"
    temporary_index.write_text(
        json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    temporary_index.replace(index_path)
    print(f"index: {index_path.relative_to(manifest.root)}")
    return index_path


def build_crops(manifest: CropManifest, crops: Sequence[CropSpec], fitz: Any) -> None:
    grouped: dict[str, list[CropSpec]] = {}
    for crop in crops:
        grouped.setdefault(crop.document, []).append(crop)

    for document_key, document_crops in grouped.items():
        document = manifest.documents[document_key]
        with fitz.open(document.pdf) as source:
            matrix = fitz.Matrix(document.output_dpi / 72, document.output_dpi / 72)
            for crop in document_crops:
                page = source[crop.page - 1]
                rect = fitz.Rect(
                    *normalized_box_to_rect(crop.box, page.rect.width, page.rect.height)
                )
                pixmap = page.get_pixmap(
                    matrix=matrix, clip=rect, alpha=False, annots=True
                )
                crop.output.parent.mkdir(parents=True, exist_ok=True)
                temporary = crop.output.with_name(f".{crop.output.stem}.tmp.png")
                pixmap.save(temporary)
                temporary.replace(crop.output)
                print(
                    f"crop: {crop.crop_id} -> {crop.output.relative_to(manifest.root)} "
                    f"({pixmap.width}x{pixmap.height})"
                )


def validate_outputs(manifest: CropManifest, crops: Sequence[CropSpec], fitz: Any) -> None:
    for crop in crops:
        if not crop.output.is_file():
            raise ManifestError(f"generated output is missing: {crop.output.relative_to(manifest.root)}")
        pixmap = fitz.Pixmap(crop.output)
        if pixmap.width < 2 or pixmap.height < 2:
            raise ManifestError(
                f"generated output is empty: {crop.output.relative_to(manifest.root)}"
            )


def update_box(
    manifest: CropManifest,
    crop_id: str,
    box: tuple[float, float, float, float],
    status: str,
) -> CropManifest:
    if status not in ALLOWED_STATUSES:
        allowed = ", ".join(sorted(ALLOWED_STATUSES))
        raise ManifestError(f"status must be one of: {allowed}")
    found = False
    for raw_crop in manifest.raw["crops"]:
        if raw_crop.get("id") == crop_id:
            raw_crop["box"] = [round(value, 6) for value in box]
            raw_crop["status"] = status
            found = True
            break
    if not found:
        raise ManifestError(f"unknown crop id: {crop_id}")
    temporary = manifest.path.with_name(f".{manifest.path.name}.tmp")
    temporary.write_text(
        json.dumps(manifest.raw, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    temporary.replace(manifest.path)
    print(f"updated: {manifest.path.relative_to(manifest.root)} ({crop_id})")
    return load_manifest(manifest.path, manifest.root)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--manifest",
        default=str(DEFAULT_MANIFEST),
        help=f"manifest path relative to the repository (default: {DEFAULT_MANIFEST})",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    for command, help_text in (
        ("prepare", "render referenced PDF pages and write debug-renders/index.json"),
        ("build", "build final PNG crops from the manifest"),
        ("all", "prepare debug renders and build final PNG crops"),
    ):
        subparser = subparsers.add_parser(command, help=help_text)
        subparser.add_argument(
            "--id", dest="crop_ids", action="append", default=[], help="limit to one crop id (repeatable)"
        )

    validate_parser = subparsers.add_parser("validate", help="validate manifest, source PDFs, and page bounds")
    validate_parser.add_argument(
        "--require-outputs", action="store_true", help="also require every generated PNG to exist"
    )
    validate_parser.add_argument(
        "--id", dest="crop_ids", action="append", default=[], help="limit output checks to one crop id"
    )

    set_box_parser = subparsers.add_parser("set-box", help="update one normalized crop box in the manifest")
    set_box_parser.add_argument("--id", dest="crop_id", required=True, help="crop id to update")
    set_box_parser.add_argument(
        "--box", required=True, help="normalized x0,y0,x1,y1 values copied from the selector"
    )
    set_box_parser.add_argument(
        "--status", choices=sorted(ALLOWED_STATUSES), default="reviewed", help="new review status"
    )
    set_box_parser.add_argument("--build", action="store_true", help="build this crop immediately after updating")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        manifest = load_manifest(args.manifest, REPO_ROOT)
        fitz = load_fitz()
        validate_documents(manifest, fitz)

        if args.command == "set-box":
            box = parse_box(args.box, "--box")
            manifest = update_box(manifest, args.crop_id, box, args.status)
            validate_documents(manifest, fitz)
            if args.build:
                build_crops(manifest, select_crops(manifest, [args.crop_id]), fitz)
            return 0

        crops = select_crops(manifest, getattr(args, "crop_ids", []))
        if args.command in {"prepare", "all"}:
            prepare_debug_renders(manifest, crops, fitz)
        if args.command in {"build", "all"}:
            build_crops(manifest, crops, fitz)
        if args.command == "validate" and args.require_outputs:
            validate_outputs(manifest, crops, fitz)
        if args.command == "validate":
            print(
                f"valid: {manifest.path.relative_to(manifest.root)} "
                f"({len(manifest.documents)} document(s), {len(manifest.crops)} crop(s))"
            )
        return 0
    except ManifestError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
