from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = REPO_ROOT / "tools" / "validate_question_bank.py"
SPEC = importlib.util.spec_from_file_location("validate_question_bank", MODULE_PATH)
assert SPEC and SPEC.loader
validate_question_bank = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = validate_question_bank
SPEC.loader.exec_module(validate_question_bank)


class QuestionBankValidationTests(unittest.TestCase):
    def test_current_repository_has_no_validation_errors(self) -> None:
        report = validate_question_bank.validate_repo()
        self.assertEqual(report.question_count, 39)
        self.assertEqual(report.live_image_count, 14)
        self.assertEqual(report.errors, [])

    def test_formula_warning_patterns_are_focused(self) -> None:
        self.assertIn("use \\sqrt{...} instead of sqrt(...)", validate_question_bank.formula_warnings("sqrt(3)"))
        self.assertTrue(validate_question_bank.formula_warnings("x/2 - 6 < 8"))
        self.assertTrue(validate_question_bank.formula_warnings("R^2 T^4"))
        self.assertTrue(validate_question_bank.formula_warnings("I^2R"))
        self.assertEqual(validate_question_bank.formula_warnings(r"\frac{x}{2}"), [])
        self.assertEqual(validate_question_bank.formula_warnings(r"R^{2}T^{4}"), [])

    def test_q04_and_q06_use_existing_svg_fallbacks(self) -> None:
        questions = validate_question_bank.flatten_questions(validate_question_bank.load_question_bank())
        by_id = {question["id"]: question for question in questions}
        expected = {
            "ENGAA_2016_P1_Q04": "assets/question-images/ENGAA_2016_P1_Q04_graph.svg",
            "ENGAA_2016_P1_Q06": "assets/question-images/ENGAA_2016_P1_Q06_fission-diagrams.svg",
        }
        for question_id, image_path in expected.items():
            with self.subTest(question_id=question_id):
                question = by_id[question_id]
                self.assertEqual(question["imagePath"], image_path)
                self.assertEqual(question["imageStatus"], "ready-svg-fallback")
                self.assertGreater((REPO_ROOT / image_path).stat().st_size, 0)


if __name__ == "__main__":
    unittest.main()
