# EsAT

Static ESAT practice simulator and question-bank tooling, deployed at
[shinnan.github.io/EsAT](https://shinnan.github.io/EsAT/).

## Maintainer start here

- [Current system audit](docs/CURRENT_SYSTEM_AUDIT.md) — how question loading,
  formulas, images, results, CSV conversion, and PDF crops currently work.
- [Project status and workflow](docs/PROJECT_STATUS_AND_WORKFLOW.md) — practical
  instructions for adding questions, reviewing diagrams, and checking PRs.
- [Visual QA report](docs/VISUAL_QA_REPORT.md) — checks completed for the current
  stabilisation branch and the short manual browser checklist still required.
- [Question preview](admin/question-preview.html) — visual QA for every imported
  question. On GitHub Pages, open
  [the live preview](https://shinnan.github.io/EsAT/admin/question-preview.html).
- [CSV converter](admin/csv-converter.html) — validate spreadsheet data and
  generate the runtime question bank.
- [PDF crop workflow](docs/pdf-crop-workflow.md) — prepare source pages, review
  crop boxes, and rebuild named PNG assets.
- [Image recovery progress](admin/image-crop-progress.html) — current fallback
  status and the manual approval step before a generated crop becomes live.

The canonical crop manifest is `data/pdf-crops.json`. Generated PDF crops are
experimental until the final image and the browser layout have both been
visually reviewed.

## Local review

From the repository root:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/`
- `http://localhost:4173/admin/question-preview.html`
- `http://localhost:4173/admin/csv-converter.html`

## Validation and smoke checks

```bash
python3 tools/validate_question_bank.py
node tools/smoke_check.js
python3 -m unittest discover -s tests -v
```

Install the PDF-tool dependency first when running crop builds or crop tests:

```bash
python3 -m pip install -r requirements-tools.txt
python3 tools/crop_pdf_images.py validate --require-outputs
```

