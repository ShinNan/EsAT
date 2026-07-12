# Project status and maintainer workflow

This is the practical guide for maintaining the ESAT simulator. Start here if
you are unsure which file to edit, which check to run, or what needs a human
decision.

For a technical explanation of the current implementation and its known weak
points, also read [CURRENT_SYSTEM_AUDIT.md](CURRENT_SYSTEM_AUDIT.md).

## Current position

The site is a static GitHub Pages project. It runs directly from HTML, CSS, and
JavaScript files, with no database and no build step.

The safest current image setup is:

| Question | Live image | Status |
| --- | --- | --- |
| ENGAA 2016 P1 Q04 | `assets/question-images/ENGAA_2016_P1_Q04_graph.svg` | `ready-svg-fallback` |
| ENGAA 2016 P1 Q06 | `assets/question-images/ENGAA_2016_P1_Q06_fission-diagrams.svg` | `ready-svg-fallback` |

The PDF-derived PNGs and crop tools remain in the repository for further work,
but a generated crop must not become a live `imagePath` until somebody has
looked at the final image and the deployed question.

### What is automatic and what still needs a person?

The scripts can check paths, required fields, answer keys, file sizes, image
dimensions, suspicious blank image space, and common formula mistakes. The crop
tool can reproducibly generate a PNG from a saved rectangle.

A person still needs to confirm that:

- a diagram contains every label, arrow, axis, unit, and relevant line;
- no nearby question text was accidentally included;
- formulas look correct in the browser, not only in the source data; and
- the deployed GitHub Pages page looks the same as the local preview.

For the current SVG fallback, you do **not** need to take or upload a screenshot.
Open the preview page, inspect Q04 and Q06, and report either “approved” or the
specific thing that looks wrong.

## 1. What the site supports

### Imported questions

- ENGAA 2016 Paper 1 questions Q01-Q10.
- Five Maths 1 questions and five Physics questions. The Maths 2 section exists
  but does not yet contain imported questions.
- Stable question IDs so browser profile history can continue to refer to the
  same questions.
- Difficulty, topic, status, source metadata, quickest method, common trap, and
  explanation fields.

### Answer options

- Options A-H are supported by the runtime question model.
- CSV imports require A-E and can add F-H when a question needs them.
- `correctAnswer` is the letter used in the CSV; `answerIndex` is the matching
  zero-based number used in JavaScript (`A = 0`, `B = 1`, and so on).

### Question data and CSV conversion

- `data/question-bank.csv` is the spreadsheet-friendly source.
- `admin/csv-converter.html` validates pasted CSV and generates the browser-ready
  question bank.
- `assets/questionBank.js` is the runtime copy loaded by the website.
- The CSV and JavaScript copies must describe the same questions.

### Formula rendering

- Formula data uses LaTeX-style commands such as `\sqrt{3}`, `\frac{x}{2}`, and
  `R^{2}T^{4}`.
- Formula-only blocks can be displayed centrally, while formulas inside prose,
  answer options, and explanations remain inline.
- The stabilised renderer uses KaTeX when it is available and keeps the local
  lightweight renderer as a fallback.
- Nuclear notation uses the project command `\nuclide{235}{92}{U}`, which the
  renderer converts safely.

### Images and solutions

- Questions can refer to SVG or PNG files in `assets/question-images/`.
- Q04 and Q06 currently use manually checked SVG fallbacks.
- Each imported question has a Markdown solution under
  `solutions/ENGAA/2016/P1/`.
- The question bank contains the explanation shown by the results page. The
  Markdown solution is maintainer/source material and is not fetched dynamically
  by the exam page.

### PDF crop tooling

- Source PDFs are stored under `source-papers/`.
- A manifest stores page numbers and normalised crop rectangles.
- A Python tool prepares review pages and builds deterministic PNG crops.
- A browser selector helps a reviewer draw or adjust the rectangle.
- This workflow is semi-automatic and always requires visual review.

## 2. Main file map

| Path | Purpose | When to edit it |
| --- | --- | --- |
| `assets/questionBank.js` | Browser-ready question data exposed as `window.ESAT_QUESTION_BANK`. | Regenerate/update it whenever the CSV changes. Do not change only this copy and forget the CSV. |
| `data/question-bank.csv` | Editable source table for imported questions. | Add or correct questions, answers, formula text, image metadata, and source metadata here. |
| `assets/question-images/` | Live SVG/PNG question diagrams and retained experimental crops. | Add a reviewed image with a stable, descriptive filename. |
| `source-papers/` | Original exam PDFs used as the reference and crop source. | Add a source paper before defining crop tasks for it. |
| `solutions/` | Markdown solution/reference files, grouped by exam and paper. | Add one solution file for every imported question and keep `solutionPath` accurate. |
| `admin/csv-converter.html` | Browser tool that validates CSV and generates question-bank JavaScript. | Use it after editing the CSV; change it only when the import schema changes. |
| `admin/question-preview.html` | Visual QA list for all questions, metadata, formulas, images, options, and warnings. | Open it before every question-bank PR and after GitHub Pages deploys. |
| `tools/crop_pdf_images.py` | Validates crop tasks, renders debug pages, builds PNGs, and validates outputs. | Use it for the experimental PDF crop workflow. |
| `tools/crop_selector.html` | Browser UI for selecting a crop rectangle on a debug-rendered PDF page. | Use it when a crop rectangle needs review or adjustment. |
| `data/pdf-crops.json` | Canonical crop manifest: source PDF, page, rectangle, output path, alt text, and review status. | Update it through `set-box` or carefully by hand when a crop task changes. |

There is no `data/image-crops.json` in this repository. Do not create a second
manifest under that name; `data/pdf-crops.json` is the single source of truth.

## 3. How to add a question without an image

1. Start from the latest `main` branch and create a feature branch.
2. Add a row to `data/question-bank.csv`.
3. Give it a stable, unique ID such as `ENGAA_2016_P1_Q11`. Do not reuse or
   renumber an existing ID.
4. Fill in the section, topic code/name, difficulty, question text, options A-E,
   correct-answer letter, worked solution, status, and source metadata. Add F-H
   only when needed.
5. Prefer proper LaTeX in formula data:
   - `\sqrt{3}`, not `sqrt(3)`;
   - `\frac{x}{2}`, not `x/2`, when a displayed fraction is intended;
   - `R^{2}`, not `R^2`;
   - `\times`, `\leq`, and other clear commands where appropriate.
6. Set `hasImage` to `false`, leave `imagePath`, `imageAlt`, and `diagramType`
   empty, and set `imageStatus` to `not-needed`.
7. Add the Markdown solution file and enter its repository-relative path in
   `solutionPath`.
8. Open `admin/csv-converter.html`, paste the complete CSV, resolve every error,
   and copy the generated bank into `assets/questionBank.js`.
9. Run the validator and smoke check from the repository root:

   ```bash
   python3 tools/validate_question_bank.py
   node tools/smoke_check.js
   ```

10. Serve the repository and inspect the new question in the preview page:

    ```bash
    python3 -m http.server 4173
    ```

    Open `http://localhost:4173/admin/question-preview.html`.

## 4. How to add a question with a diagram

Complete the no-image steps above, then add the image workflow:

1. Crop or recreate only the diagram. Keep the question text and answer options
   as structured text in the bank.
2. Save the reviewed image under `assets/question-images/` with a stable name,
   for example `ENGAA_2016_P1_Q11_diagram.svg`.
3. Open the image itself and check every label, unit, arrow, axis, and boundary.
4. In both the CSV and generated bank, set:
   - `hasImage` to `true`;
   - `imagePath` to the repository-relative asset path;
   - `imageAlt` to a useful description of the information in the diagram;
   - `diagramType` to a short category such as `graph`, `circuit`, or
     `fission-diagrams`;
   - `imageStatus` to an honest state. Use `ready-svg-fallback` for a checked SVG
     fallback, `ready` for another checked live asset, or `needs-review` while it
     must not be used live.
5. Run `python3 tools/validate_question_bank.py`.
6. Inspect the question in `admin/question-preview.html`, then in the actual exam
   layout at desktop and mobile width.
7. If the image came from the PDF crop workflow, also compare it directly with
   the source PDF before changing the live `imagePath`.

An image being present in the repository is not the same as it being approved.
The live path should point only to the version that passed visual review.

## 5. Recommended image workflow

### Option A — safe fallback (recommended for live questions)

Use a manually checked SVG or PNG in `assets/question-images/`.

1. Create or crop the diagram.
2. Open the final file, not only the source editor or debug page.
3. Compare it with the source paper.
4. Run the question-bank validator.
5. View it in the admin preview and exam page.
6. Set the live `imagePath` only after those checks pass.

This is the right choice when a clear SVG already exists, as it does for Q04
and Q06.

### Option B — experimental/semi-automatic PDF crop

Install the tool dependency and prepare debug pages:

```bash
python3 -m pip install -r requirements-tools.txt
python3 tools/crop_pdf_images.py prepare
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/tools/crop_selector.html
```

Then:

1. Choose the crop task.
2. Draw tightly around the diagram only.
3. Check the selector preview for all labels, axes, units, arrows, and lines.
4. Copy and run the generated `set-box` command.
5. Build and validate the crop:

   ```bash
   python3 tools/crop_pdf_images.py build
   python3 tools/crop_pdf_images.py validate --require-outputs
   ```

6. Open the generated file under `assets/question-images/` directly. A valid
   rectangle can still produce a corrupt or visually incomplete PNG.
7. Compare the generated file with the source PDF and view it in
   `admin/question-preview.html`.
8. Keep the existing safe image live until the final PNG and the browser layout
   both pass review.

The selector normally loads Codespaces files by relative URL, so you should not
need to download a screenshot and upload it again. See
[pdf-crop-workflow.md](pdf-crop-workflow.md) for command details.

## 6. What to check before merging a PR

### Repository and data

- The branch was created from the latest `main` and still includes recently
  merged work.
- Question IDs are unique and existing IDs were not renamed.
- `data/question-bank.csv` and `assets/questionBank.js` agree.
- The correct-answer letter and zero-based answer index point to the same option.
- Every `imagePath` and `solutionPath` exists.
- No live image path starts with `debug-renders/`.
- Generated final images that are intentionally live are committed.
- Experimental crop files and tools have not been deleted accidentally.

### Formulas and visual layout

- Fractions, roots, powers, subscripts, Greek letters, inequalities, and nuclear
  notation render correctly.
- Display equations are centred only when appropriate; prose remains normal
  text.
- Q01, Q04, Q06, and one A-H question have been checked in the admin preview and
  exam page.
- The image contains no large unexplained blank/black/transparent region.
- Desktop and a narrow mobile viewport remain usable.
- Results/review rendering has been checked with at least one completed attempt.

### Commands

Run these from the repository root:

```bash
python3 tools/validate_question_bank.py
node tools/smoke_check.js
python3 -m unittest discover -s tests -v
```

If the crop manifest, crop script, source PDF, or generated PNG changed, also
run:

```bash
python3 tools/crop_pdf_images.py validate --require-outputs
```

Use `python3 tools/validate_question_bank.py --strict-warnings` when you want all
warnings to block the merge. A normal validation run can pass with warnings, so
read the warning list rather than looking only at the exit code.

Finally, review the draft PR diff and wait for its GitHub Actions checks. Do not
merge merely because the files exist or the tests are green; visual questions
still need the human checks above.

## 7. What to check after merging a PR

1. Wait for GitHub Actions and the GitHub Pages deployment to finish.
2. Open the live site:

   - `https://shinnan.github.io/EsAT/`
   - `https://shinnan.github.io/EsAT/admin/question-preview.html`

3. Use a hard refresh or a private/incognito window. GitHub Pages and the browser
   can briefly serve an older JavaScript or image asset.
4. Check Q01 formula display, Q04 graph, Q06 fission diagrams, an A-H option list,
   and one completed results/review screen.
5. Check one narrow/mobile viewport.
6. Confirm the deployed `imagePath` shown by the preview is the intended live
   asset, not an old PNG or `debug-renders/` path.
7. Record what was checked and any remaining limitations in
   `docs/VISUAL_QA_REPORT.md`.

If production is visibly worse, do not rewrite history or revert unrelated
merged work. Create a small hotfix from the latest `main`, restore the last
known-good live asset, retain the experimental tooling, and diagnose the broken
asset separately.

## 8. Common mistakes

### Wrong `imagePath`

Paths are relative to the repository/site root. The path must match the filename
and letter case exactly. Run the validator and open the live preview.

### Using `debug-renders/` as a live path

Debug renders are temporary review pages and are ignored by Git. They are not
question assets. Live images belong under `assets/question-images/`.

### Forgetting generated PNGs

The crop manifest and script do not make a PNG appear on GitHub automatically.
If a reviewed PNG is intentionally used live, build it, inspect it, and commit
the file in the same PR.

### Formula text is not proper LaTeX

Raw forms such as `sqrt(3)`, `x/2`, or `R^2T^4` may look acceptable in the CSV
but render poorly. Prefer `\sqrt{3}`, `\frac{x}{2}`, and `R^{2}T^{4}` and check
the browser output.

### Browser cache after GitHub Pages updates

The deployed HTML, JavaScript, and images may update at slightly different
times. Wait for Pages, hard-refresh, and check in a private window before
deciding that a merged fix failed.

### Starting from an old `main`

An old base can reintroduce paths or documentation that another PR already
fixed. Fetch the latest `main` before creating the branch and update the branch
again before asking for merge approval.

### Over-trusting generated PDF crops

An `approved` rectangle proves only that somebody reviewed the coordinates. It
does not prove the committed PNG is complete, decodable, or correct in the live
layout. Inspect the final binary and the deployed page every time.

## Quick decision guide

- **Adding text-only content?** Edit the CSV, regenerate the bank, validate, and
  inspect the admin preview.
- **A good SVG/PNG already exists?** Use the safe asset workflow.
- **The diagram exists only in a PDF?** Use the crop selector, but keep the
  existing fallback live until the final crop passes visual review.
- **A validator warning is unclear?** Look at the named question in
  `admin/question-preview.html` before changing data.
- **The live site differs from local?** Wait for Pages, hard-refresh, and compare
  the live admin preview before opening a hotfix.
