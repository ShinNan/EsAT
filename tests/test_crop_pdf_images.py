from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = REPO_ROOT / "tools" / "crop_pdf_images.py"
SPEC = importlib.util.spec_from_file_location("crop_pdf_images", MODULE_PATH)
assert SPEC and SPEC.loader
crop_pdf_images = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = crop_pdf_images
SPEC.loader.exec_module(crop_pdf_images)


class CropWorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.fitz = crop_pdf_images.load_fitz()

    def make_repository(self, root: Path, *, output: str = "assets/question-images/test.png") -> Path:
        (root / "source-papers").mkdir(parents=True)
        (root / "data").mkdir(parents=True)
        document = self.fitz.open()
        page = document.new_page(width=200, height=100)
        page.draw_rect((10, 10, 190, 90), color=(0, 0, 0), width=1)
        page.insert_text((20, 50), "diagram")
        document.save(root / "source-papers/test.pdf")
        document.close()

        manifest = {
            "schemaVersion": 1,
            "documents": {
                "TEST_Document1": {
                    "pdf": "source-papers/test.pdf",
                    "debugDpi": 144,
                    "outputDpi": 144,
                }
            },
            "crops": [
                {
                    "id": "TEST_Q01_diagram",
                    "questionId": "TEST_Q01",
                    "document": "TEST_Document1",
                    "page": 1,
                    "box": [0.1, 0.2, 0.6, 0.7],
                    "output": output,
                    "alt": "A test diagram.",
                    "status": "reviewed",
                    "note": "Synthetic integration fixture.",
                }
            ],
        }
        path = root / "data/pdf-crops.json"
        path.write_text(json.dumps(manifest), encoding="utf-8")
        return path

    def test_normalized_box_conversion(self) -> None:
        self.assertEqual(
            crop_pdf_images.normalized_box_to_rect((0.1, 0.2, 0.6, 0.7), 200, 100),
            (20.0, 20.0, 120.0, 70.0),
        )

    def test_canonical_debug_filename(self) -> None:
        self.assertEqual(
            crop_pdf_images.debug_filename("ENGAA_2016_Section1", 8),
            "ENGAA_2016_Section1_page_08_grid.png",
        )

    def test_prepare_build_and_validate_synthetic_pdf(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            manifest_path = self.make_repository(root)
            manifest = crop_pdf_images.load_manifest(manifest_path, root)
            crop_pdf_images.validate_documents(manifest, self.fitz)

            index_path = crop_pdf_images.prepare_debug_renders(
                manifest, manifest.crops, self.fitz
            )
            self.assertEqual(index_path.name, "index.json")
            self.assertTrue(
                (root / "debug-renders/TEST_Document1_page_01_grid.png").is_file()
            )
            index = json.loads(index_path.read_text(encoding="utf-8"))
            self.assertEqual(
                index["tasks"][0]["image"],
                "debug-renders/TEST_Document1_page_01_grid.png",
            )

            crop_pdf_images.build_crops(manifest, manifest.crops, self.fitz)
            output = root / "assets/question-images/test.png"
            self.assertTrue(output.is_file())
            pixmap = self.fitz.Pixmap(output)
            self.assertEqual((pixmap.width, pixmap.height), (200, 100))
            crop_pdf_images.validate_outputs(manifest, manifest.crops, self.fitz)

    def test_output_path_must_not_escape_image_directory(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            manifest_path = self.make_repository(
                root, output="assets/question-images/../../escaped.png"
            )
            with self.assertRaisesRegex(
                crop_pdf_images.ManifestError, "must be inside assets/question-images"
            ):
                crop_pdf_images.load_manifest(manifest_path, root)

    def test_set_box_updates_manifest_atomically(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            manifest_path = self.make_repository(root)
            manifest = crop_pdf_images.load_manifest(manifest_path, root)
            updated = crop_pdf_images.update_box(
                manifest,
                "TEST_Q01_diagram",
                (0.2, 0.3, 0.8, 0.9),
                "approved",
            )
            self.assertEqual(updated.crops[0].box, (0.2, 0.3, 0.8, 0.9))
            self.assertEqual(updated.crops[0].status, "approved")

    def test_selector_has_required_url_and_fallback_controls(self) -> None:
        html = (REPO_ROOT / "tools/crop_selector.html").read_text(encoding="utf-8")
        self.assertIn("Debug image path / URL", html)
        self.assertIn("debug-renders/ENGAA_2016_Section1_page_08_grid.png", html)
        self.assertIn("Load image path", html)
        self.assertIn("Debug render PNG fallback", html)
        self.assertIn('<base href="../">', html)
        self.assertIn("pageImage.src = source", html)


if __name__ == "__main__":
    unittest.main()
