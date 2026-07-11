# Current system audit

Audit baseline: `main` at `f2dbb00a9f322feabf71d9c0d1a0520859fa993d`
(the merge commit for PR #11). This document describes the system before the
display-stabilisation changes in this branch.

## Short version

The simulator is a static HTML, CSS, and JavaScript site. It does not need a
database or a build step. Ten ENGAA 2016 Paper 1 questions are stored twice:

- `data/question-bank.csv` is the editable spreadsheet-style source.
- `assets/questionBank.js` is the browser-ready copy loaded by the site.

The exam engine selects questions from `window.ESAT_QUESTION_BANK`, renders the
question and answer choices, saves progress in browser `localStorage`, and sends
the completed paper to the results page.

The current live image paths already use the SVG fallbacks restored by PR #11.
The experimental PDF-derived PNGs and crop tooling are still present, but the
question bank does not use those PNGs live.

## How questions are loaded

1. `assets/questionBank.js` defines `window.ESAT_QUESTION_BANK`.
2. `index.html`, `practice.html`, `exam.html`, and `results.html` load that file
   with ordinary `<script>` tags.
3. `assets/app.js` reads the bank for homepage counts and setup.
4. `assets/exam.js` selects questions, optionally shuffles them, and normalises
   fields such as options, answer index, and image path.
5. The active paper and the completed result are stored in `localStorage`.
6. `assets/results.js` renders the saved paper and explanations.

Questions are grouped under `maths1`, `maths2`, and `physics`. The current bank
contains five Maths 1 questions, no Maths 2 questions, and five Physics
questions.

## How formulas are rendered on the baseline

The first section of `assets/app.js` contains a small local parser. It supports
only a limited subset of LaTeX-like syntax:

- `\frac{a}{b}`
- `\sqrt{x}`
- superscripts and subscripts
- a short symbol list
- a custom `\nuclide{mass}{proton}{symbol}` command

`assets/exam.js` splits question text at blank lines. Short blocks containing
an equality, inequality, power, or selected command are centred as formula
blocks. Answer options and explanations are passed through the same renderer.

This is the main formula weakness. The parser is not a real TeX layout engine,
and much of the current data is plain text (`x/2`, `sqrt(3)`, or unmarked mixed
prose and maths). It therefore cannot reliably produce exam-style fractions,
roots, spacing, and nested notation. The same lightweight-math CSS rules also
appear twice in `assets/styles.css`, which makes future changes harder to audit.

## How images are rendered on the baseline

`assets/exam.js` copies either top-level `imagePath` / `imageAlt` fields or the
converter's nested `image.src` / `image.alt` fields into the active paper. The
exam page then assigns the path directly to an `<img>` element.

The baseline has no image load-error message and no runtime size or integrity
check. CSS applies only a generic maximum width and `max-height: 420px` with
`object-fit: contain`. A corrupt image can therefore leave an unhelpful empty
container, and an image with large internal white margins can look tiny or
create an apparently blank region.

The results review renders formula text but does not show a question image.

## Questions with images

| Question | Live path | Live status | Notes |
| --- | --- | --- | --- |
| Q04 | `assets/question-images/ENGAA_2016_P1_Q04_graph.svg` | `ready-svg-fallback` | Previously working graph SVG. |
| Q06 | `assets/question-images/ENGAA_2016_P1_Q06_fission-diagrams.svg` | `ready-svg-fallback` | Previously working fission-diagram SVG. |

The corresponding PNG files remain in `assets/question-images/`. During this
audit the committed Q06 PNG could not be decoded (`premature end of data in png
image`). That is a concrete reason not to select it as a live image until it has
been regenerated and visually reviewed.

`ENGAA_2016_P1_S1_Q04_graph.png` is also present but is not referenced by the
runtime bank or crop manifest. It is treated as a legacy asset in this branch;
it is not deleted as part of display stabilisation.

## PDF crop workflow

The canonical crop manifest is `data/pdf-crops.json`. The requested name
`data/image-crops.json` does not currently exist; documentation should point to
the real manifest rather than creating a second competing copy.

The workflow consists of:

- `data/pdf-crops.json`: source PDF, page, normalised crop box, output path, and
  review status.
- `tools/crop_pdf_images.py`: validates the manifest, renders debug pages, and
  builds PNG outputs.
- `tools/crop_selector.html`: browser UI for reviewing or changing crop boxes.
- `.github/workflows/question-image-crops.yml`: test, validation, build, and
  artifact upload in GitHub Actions.
- `docs/pdf-crop-workflow.md`: operator instructions.

This is a human-in-the-loop workflow. `approved` in the manifest means the crop
rectangle was reviewed; it does not prove that the committed binary uploaded
correctly or that the final website renders it correctly.

## CSV converter

`admin/csv-converter.html` parses pasted CSV and generates a replacement
`window.ESAT_QUESTION_BANK` object. It supports A-H answer options, teaching
fields, source metadata, solution paths, and image metadata. It preserves
backslashes in formula text, but the baseline does not explain a consistent
formula-delimiter convention and does not warn about common raw formula forms.

The converter emits image data in a nested `image` object, while the hand-edited
bank currently uses top-level `imagePath` and `imageAlt`. `assets/exam.js`
supports both, so this is compatible but should be explained clearly.
The baseline `hasImage` true-value regular expression is also missing grouping,
so it should be tightened while the converter is updated.

## Solution files

All ten imported questions point to Markdown files under
`solutions/ENGAA/2016/P1/`, and all ten referenced files exist. The browser
results page currently uses the explanation embedded in the question bank; the
Markdown files are maintainer/source material rather than dynamically loaded
pages.

## Most likely causes of visible problems

1. The committed Q06 PNG is truncated and cannot be decoded reliably.
2. The old renderer is a limited handcrafted parser, not a full LaTeX engine.
3. Formula data mixes prose, Unicode symbols, plain arithmetic, and LaTeX-like
   commands without a consistent inline/display convention.
4. Image rendering has no load-error state or asset validation.
5. The generic image container cannot detect internal blank space.
6. Results review does not share the exam's structured question-block layout.
7. GitHub Pages and browser caching can briefly show an older bank or asset
   after a merge, making it important to verify the deployed URL after Actions
   and Pages have finished.
8. The crop workflow's path filters do not run for question-bank, CSV, image,
   formula-renderer, or admin-preview-only changes.

## Stabilisation direction

- Keep Q04 and Q06 on the SVG fallbacks.
- Add a real KaTeX renderer loaded directly from a pinned CDN, with the local
  parser retained as an offline/failure fallback.
- use explicit `\(...\)` delimiters inside prose and clean formula-only blocks.
- add a question-bank and image validator.
- add a visual admin preview showing every imported question and warning.
- run browser checks before merge and repeat them on GitHub Pages after merge.
