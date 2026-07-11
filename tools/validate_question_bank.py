#!/usr/bin/env python3
"""Validate the browser question bank, CSV source, images, and solutions."""

from __future__ import annotations

import argparse
import binascii
import csv
import json
import math
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "assets" / "questionBank.js"
CSV_PATH = ROOT / "data" / "question-bank.csv"
IMAGE_ROOT = ROOT / "assets" / "question-images"
MANIFEST_PATH = ROOT / "data" / "pdf-crops.json"
OPTION_LABELS = "ABCDEFGH"
ALLOWED_STATUSES = {"ready", "draft", "review", "reviewed", "approved", "needs-review"}
ALLOWED_IMAGE_STATUSES = {
    "not-needed",
    "ready",
    "ready-svg-fallback",
    "ready-recreated-close",
    "ready-pdf-crop",
    "needs-review",
    "reviewed",
    "approved",
}


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    question_count: int = 0
    live_image_count: int = 0

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)


def safe_repo_path(raw: str) -> Path | None:
    value = str(raw or "").strip().replace("\\", "/")
    if not value or value.startswith(("/", "../")) or re.match(r"^[A-Za-z]:", value):
        return None
    candidate = (ROOT / value).resolve()
    try:
        candidate.relative_to(ROOT.resolve())
    except ValueError:
        return None
    return candidate


def load_question_bank(path: Path = BANK_PATH) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"window\.ESAT_QUESTION_BANK\s*=\s*", text)
    if not match:
        raise ValueError("missing window.ESAT_QUESTION_BANK assignment")
    payload = text[match.end() :].strip()
    if payload.endswith(";"):
        payload = payload[:-1].rstrip()
    return json.loads(payload)


def flatten_questions(bank: dict[str, Any]) -> list[dict[str, Any]]:
    questions: list[dict[str, Any]] = []
    for subject_key, subject in (bank.get("subjects") or {}).items():
        for question in subject.get("questions") or []:
            item = dict(question)
            item.setdefault("subject", subject_key)
            questions.append(item)
    return questions


def load_csv_rows(path: Path = CSV_PATH) -> dict[str, dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return {row.get("id", ""): row for row in csv.DictReader(handle) if row.get("id")}


def formula_warnings(value: Any) -> list[str]:
    text = str(value or "")
    warnings: list[str] = []
    if re.search(r"\bsqrt\s*\(", text, re.IGNORECASE):
        warnings.append("use \\sqrt{...} instead of sqrt(...)")
    if re.search(r"(?<![\\\w])(?:[A-Za-z]|\d+)\s*/\s*(?:[A-Za-z]|\d+)(?!\w)", text):
        warnings.append("use \\frac{...}{...} for a mathematical fraction")
    if re.search(r"\^[A-Za-z0-9](?![A-Za-z0-9}])", text):
        warnings.append("put powers in braces, for example R^{2}")
    return warnings


def image_reference(question: dict[str, Any]) -> tuple[str, str]:
    nested = question.get("image") if isinstance(question.get("image"), dict) else {}
    return (
        str(question.get("imagePath") or nested.get("src") or ""),
        str(question.get("imageAlt") or nested.get("alt") or ""),
    )


def parse_svg_dimensions(path: Path) -> tuple[int, int]:
    root = ET.parse(path).getroot()
    view_box = root.attrib.get("viewBox", "").replace(",", " ").split()
    if len(view_box) == 4:
        width = float(view_box[2])
        height = float(view_box[3])
        if width > 0 and height > 0:
            return round(width), round(height)

    def numeric(value: str) -> float:
        match = re.match(r"\s*([0-9]+(?:\.[0-9]+)?)", value or "")
        return float(match.group(1)) if match else 0

    width = numeric(root.attrib.get("width", ""))
    height = numeric(root.attrib.get("height", ""))
    if width <= 0 or height <= 0:
        raise ValueError("SVG has no positive width/height or viewBox")
    return round(width), round(height)


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def parse_png(
    path: Path,
) -> tuple[int, int, float | None, float | None, tuple[float, float] | None]:
    data = path.read_bytes()
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("invalid PNG signature")

    offset = 8
    idat = bytearray()
    width = height = bit_depth = colour_type = interlace = None
    saw_iend = False

    while offset + 12 <= len(data):
        length = struct.unpack(">I", data[offset : offset + 4])[0]
        chunk_type = data[offset + 4 : offset + 8]
        end = offset + 12 + length
        if end > len(data):
            raise ValueError(f"truncated {chunk_type.decode('ascii', 'replace')} chunk")
        chunk = data[offset + 8 : offset + 8 + length]
        expected_crc = struct.unpack(">I", data[offset + 8 + length : end])[0]
        actual_crc = binascii.crc32(chunk_type + chunk) & 0xFFFFFFFF
        if expected_crc != actual_crc:
            raise ValueError(f"bad CRC in {chunk_type.decode('ascii', 'replace')} chunk")
        if chunk_type == b"IHDR":
            width, height, bit_depth, colour_type, _, _, interlace = struct.unpack(">IIBBBBB", chunk)
        elif chunk_type == b"IDAT":
            idat.extend(chunk)
        elif chunk_type == b"IEND":
            saw_iend = True
            break
        offset = end

    if not saw_iend:
        raise ValueError("PNG is missing its IEND chunk")
    if not width or not height or not idat:
        raise ValueError("PNG is missing IHDR or IDAT data")

    blank_ratio: float | None = None
    dark_ratio: float | None = None
    coverage: tuple[float, float] | None = None
    channels = {0: 1, 2: 3, 4: 2, 6: 4}.get(colour_type)
    if bit_depth == 8 and channels and interlace == 0:
        raw = zlib.decompress(bytes(idat))
        row_bytes = width * channels
        expected = height * (row_bytes + 1)
        if len(raw) != expected:
            raise ValueError(f"decoded PNG data has {len(raw)} bytes; expected {expected}")
        previous = bytearray(row_bytes)
        blank = 0
        dark = 0
        min_x, min_y, max_x, max_y = width, height, -1, -1
        cursor = 0
        for y in range(height):
            filter_type = raw[cursor]
            scan = bytearray(raw[cursor + 1 : cursor + 1 + row_bytes])
            cursor += row_bytes + 1
            for index in range(row_bytes):
                left = scan[index - channels] if index >= channels else 0
                up = previous[index]
                upper_left = previous[index - channels] if index >= channels else 0
                if filter_type == 1:
                    scan[index] = (scan[index] + left) & 255
                elif filter_type == 2:
                    scan[index] = (scan[index] + up) & 255
                elif filter_type == 3:
                    scan[index] = (scan[index] + ((left + up) // 2)) & 255
                elif filter_type == 4:
                    scan[index] = (scan[index] + _paeth(left, up, upper_left)) & 255
                elif filter_type != 0:
                    raise ValueError(f"unsupported PNG row filter {filter_type}")
            for x in range(width):
                pixel = scan[x * channels : (x + 1) * channels]
                if colour_type in {0, 4}:
                    rgb = (pixel[0], pixel[0], pixel[0])
                else:
                    rgb = tuple(pixel[:3])
                alpha = pixel[-1] if colour_type in {4, 6} else 255
                is_blank = alpha <= 8 or min(rgb) >= 248
                if is_blank:
                    blank += 1
                else:
                    min_x, max_x = min(min_x, x), max(max_x, x)
                    min_y, max_y = min(min_y, y), max(max_y, y)
                if alpha > 8 and max(rgb) <= 7:
                    dark += 1
            previous = scan
        blank_ratio = blank / (width * height)
        dark_ratio = dark / (width * height)
        if max_x >= min_x and max_y >= min_y:
            coverage = ((max_x - min_x + 1) / width, (max_y - min_y + 1) / height)
        else:
            coverage = (0.0, 0.0)

    return width, height, blank_ratio, dark_ratio, coverage


def inspect_image(path: Path, label: str, report: Report) -> None:
    if not path.exists():
        report.error(f"{label}: image does not exist: {path.relative_to(ROOT)}")
        return
    if path.stat().st_size == 0:
        report.error(f"{label}: image file is empty: {path.relative_to(ROOT)}")
        return
    try:
        if path.suffix.lower() == ".svg":
            width, height = parse_svg_dimensions(path)
            blank_ratio = None
            dark_ratio = None
            coverage = None
        elif path.suffix.lower() == ".png":
            width, height, blank_ratio, dark_ratio, coverage = parse_png(path)
        else:
            report.warn(f"{label}: unsupported image type {path.suffix}")
            return
    except Exception as exc:
        report.error(f"{label}: unreadable image {path.relative_to(ROOT)} ({exc})")
        return

    ratio = width / height
    if width < 16 or height < 16 or width > 12000 or height > 12000 or ratio > 8 or ratio < 0.125:
        report.warn(f"{label}: unusual image dimensions {width}x{height}")
    if blank_ratio is not None and blank_ratio >= 0.992:
        report.warn(f"{label}: PNG is {blank_ratio:.1%} blank/white")
    if dark_ratio is not None and dark_ratio >= 0.80:
        report.warn(f"{label}: PNG is {dark_ratio:.1%} near-solid black")
    if coverage and (coverage[0] < 0.25 or coverage[1] < 0.25):
        report.warn(
            f"{label}: PNG content covers only {coverage[0]:.1%} width x {coverage[1]:.1%} height"
        )


def validate_questions(questions: list[dict[str, Any]], report: Report) -> dict[str, dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    formula_fields = ("question", "explanation", "quickestMethod", "commonTrap")

    for question in questions:
        question_id = str(question.get("id") or "<missing-id>")
        if question_id in by_id:
            report.error(f"{question_id}: duplicate question ID")
        by_id[question_id] = question

        for field_name in ("id", "subject", "topic", "status"):
            if not question.get(field_name):
                report.error(f"{question_id}: missing {field_name}")

        options = question.get("options")
        if not isinstance(options, list) or not options:
            report.error(f"{question_id}: options must be a non-empty list")
            options = []
        if len(options) > len(OPTION_LABELS):
            report.error(f"{question_id}: has more than eight options")

        correct = str(question.get("correctAnswer") or "").upper()
        answer_index = question.get("answerIndex")
        if correct not in OPTION_LABELS[: len(options)]:
            report.error(f"{question_id}: correctAnswer {correct!r} does not match available options")
        expected_index = OPTION_LABELS.find(correct)
        if not isinstance(answer_index, int) or answer_index < 0 or answer_index >= len(options):
            report.error(f"{question_id}: answerIndex {answer_index!r} is outside available options")
        elif expected_index != answer_index:
            report.error(
                f"{question_id}: answerIndex {answer_index} does not match correctAnswer {correct}"
            )

        status = str(question.get("status") or "")
        if status and status not in ALLOWED_STATUSES:
            report.warn(f"{question_id}: unusual status {status!r}")

        image_path, image_alt = image_reference(question)
        has_image = bool(question.get("hasImage") or image_path)
        image_status = str(question.get("imageStatus") or "")
        if image_status and image_status not in ALLOWED_IMAGE_STATUSES:
            report.warn(f"{question_id}: unusual imageStatus {image_status!r}")
        if has_image:
            report.live_image_count += 1
            if not image_path:
                report.error(f"{question_id}: hasImage is true but imagePath is missing")
            elif image_path.replace("\\", "/").startswith("debug-renders/"):
                report.error(f"{question_id}: live imagePath must not use debug-renders/")
            else:
                resolved = safe_repo_path(image_path)
                if not resolved:
                    report.error(f"{question_id}: unsafe imagePath {image_path!r}")
                else:
                    inspect_image(resolved, question_id, report)
            if not image_alt:
                report.warn(f"{question_id}: imageAlt is missing")
            if not image_status.startswith("ready"):
                report.warn(f"{question_id}: imageStatus is not ready ({image_status or 'missing'})")
        elif image_status and image_status != "not-needed":
            report.warn(f"{question_id}: no live image but imageStatus is {image_status!r}")

        for field_name in formula_fields:
            for warning in formula_warnings(question.get(field_name)):
                report.warn(f"{question_id} {field_name}: {warning}")
        for option in options:
            for warning in formula_warnings(option):
                report.warn(f"{question_id} option: {warning}")

        for field_name in ("quickestMethod", "commonTrap"):
            if not question.get(field_name):
                report.warn(f"{question_id}: missing {field_name}")

        solution = str(question.get("solutionPath") or "")
        if not solution:
            report.warn(f"{question_id}: missing solutionPath")
        else:
            solution_path = safe_repo_path(solution)
            if not solution_path:
                report.error(f"{question_id}: unsafe solutionPath {solution!r}")
            elif not solution_path.exists():
                report.error(f"{question_id}: solutionPath does not exist: {solution}")

    return by_id


def validate_csv_sync(by_id: dict[str, dict[str, Any]], report: Report) -> None:
    rows = load_csv_rows()
    if set(rows) != set(by_id):
        missing_csv = sorted(set(by_id) - set(rows))
        missing_js = sorted(set(rows) - set(by_id))
        if missing_csv:
            report.error(f"CSV is missing IDs: {', '.join(missing_csv)}")
        if missing_js:
            report.error(f"questionBank.js is missing CSV IDs: {', '.join(missing_js)}")

    for question_id in sorted(set(rows) & set(by_id)):
        question = by_id[question_id]
        row = rows[question_id]
        image_path, _ = image_reference(question)
        comparisons = {
            "subject/section": (str(question.get("subject") or ""), row.get("section", "")),
            "correctAnswer": (str(question.get("correctAnswer") or ""), row.get("correctAnswer", "")),
            "answerIndex": (str(question.get("answerIndex")), row.get("answerIndex", "")),
            "imagePath": (image_path, row.get("imagePath", "")),
            "imageStatus": (str(question.get("imageStatus") or ""), row.get("imageStatus", "")),
            "solutionPath": (str(question.get("solutionPath") or ""), row.get("solutionPath", "")),
        }
        for label, (runtime, source) in comparisons.items():
            if runtime != source:
                report.error(f"{question_id}: {label} differs between JS ({runtime!r}) and CSV ({source!r})")


def validate_crop_assets(report: Report) -> set[Path]:
    referenced: set[Path] = set()
    if not MANIFEST_PATH.exists():
        report.warn("data/pdf-crops.json is missing; PDF crop checks skipped")
        return referenced
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        report.error(f"data/pdf-crops.json cannot be parsed ({exc})")
        return referenced
    for crop in manifest.get("crops") or []:
        crop_id = str(crop.get("id") or "<missing-crop-id>")
        output = safe_repo_path(str(crop.get("output") or ""))
        if not output:
            report.error(f"{crop_id}: unsafe or missing crop output path")
            continue
        referenced.add(output.resolve())
        inspect_image(output, f"crop {crop_id}", report)
    return referenced


def validate_orphan_images(live_paths: Iterable[Path], crop_paths: Iterable[Path], report: Report) -> None:
    referenced = {path.resolve() for path in live_paths} | {path.resolve() for path in crop_paths}
    for path in sorted(IMAGE_ROOT.glob("*")):
        if path.is_file() and path.suffix.lower() in {".png", ".svg"} and path.resolve() not in referenced:
            report.warn(f"orphan image asset is not live or in the crop manifest: {path.relative_to(ROOT)}")


def validate_repo() -> Report:
    report = Report()
    try:
        bank = load_question_bank()
        questions = flatten_questions(bank)
    except Exception as exc:
        report.error(f"assets/questionBank.js cannot be parsed ({exc})")
        return report

    report.question_count = len(questions)
    by_id = validate_questions(questions, report)
    validate_csv_sync(by_id, report)

    live_paths = []
    for question in questions:
        image_path, _ = image_reference(question)
        resolved = safe_repo_path(image_path) if image_path else None
        if resolved:
            live_paths.append(resolved)
    crop_paths = validate_crop_assets(report)
    validate_orphan_images(live_paths, crop_paths, report)

    for required_id in ("ENGAA_2016_P1_Q04", "ENGAA_2016_P1_Q06"):
        question = by_id.get(required_id)
        if not question:
            report.error(f"{required_id}: required imported question is missing")
            continue
        image_path, _ = image_reference(question)
        resolved = safe_repo_path(image_path) if image_path else None
        if not resolved or not resolved.exists():
            report.error(f"{required_id}: live image path is missing or does not exist")

    return report


def print_report(report: Report) -> None:
    state = "PASS" if not report.errors else "FAIL"
    print(
        f"{state}: {report.question_count} questions, {report.live_image_count} live images, "
        f"{len(report.errors)} errors, {len(report.warnings)} warnings"
    )
    for message in report.errors:
        print(f"ERROR: {message}")
    for message in report.warnings:
        print(f"WARNING: {message}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--strict-warnings", action="store_true", help="return failure when warnings exist")
    args = parser.parse_args(argv)
    report = validate_repo()
    print_report(report)
    return 1 if report.errors or (args.strict_warnings and report.warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
