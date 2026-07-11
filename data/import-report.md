# ENGAA 2016 Paper 1 Q01-Q10 import report

## Summary

- Imported ENGAA 2016 Paper 1 questions 1 to 10.
- Stored the runtime bank in `assets/questionBank.js` and the spreadsheet-style
  source in `data/question-bank.csv`.
- Added per-question solution files in `solutions/ENGAA/2016/P1/`.
- Added image assets for Q04 and Q06 in `assets/question-images/`.

## Source files

The repository contains the source files used by the image workflow:

- `source-papers/ENGAA 2016 Section 1.pdf`
- `source-mark-schemes/ENGAA 2016 Section 1 Answer Key.pdf`

The earlier import note said the question PDF was unavailable in the working
checkout. That limitation no longer applies on `main`.

## Imported questions

| ID | Subject | Topic | Correct | Image |
| --- | --- | --- | --- | --- |
| ENGAA_2016_P1_Q01 | maths1 | Inequalities | G | no |
| ENGAA_2016_P1_Q02 | physics | Nuclear Physics | D | no |
| ENGAA_2016_P1_Q03 | maths1 | Surds | B | no |
| ENGAA_2016_P1_Q04 | physics | Mechanics Graphs | F | yes |
| ENGAA_2016_P1_Q05 | maths1 | Ratio | C | no |
| ENGAA_2016_P1_Q06 | physics | Nuclear Fission | C | yes |
| ENGAA_2016_P1_Q07 | maths1 | Averages | E | no |
| ENGAA_2016_P1_Q08 | physics | Electricity | D | no |
| ENGAA_2016_P1_Q09 | maths1 | Percentages | C | no |
| ENGAA_2016_P1_Q10 | physics | Radiation and Proportionality | D | no |

## Formatting pass

- Preserved meaningful paragraph breaks in Q01-Q10.
- Q04 keeps the bracketed S.I. units / `g` note and numbered statements.
- Q06 relies on a diagram image instead of flattening the diagram into text.
- The renderer supports formula blocks, numbered statement rows, isotope
  notation, A-H options, and per-question images.

## Image status and reproducible crops

Q04 and Q06 use reviewed source-PDF PNG crops with
`imageStatus: ready-pdf-crop`. Their normalized boxes and deterministic output
paths are defined in `data/pdf-crops.json` with status `approved`.

Use the browser selector and manifest-driven PyMuPDF tool documented in
`docs/pdf-crop-workflow.md` to review only the non-text diagram region. The
workflow produces canonical debug filenames, deterministic PNG outputs, and a
GitHub Actions artifact without any manual screenshot upload.

- Q04: the crop contains only the graph and preserves every axis label and guide.
- Q06: the crop contains all three diagrams and preserves every isotope label.
- The earlier recreated SVGs remain in the repository as historical fallbacks;
  the CSV and runtime bank point to the approved PNGs.

## Validation notes

- All IDs are unique.
- All `answerIndex` values match `correctAnswer`.
- Every question has the expected number of source-paper answer options.
- Q04 and Q06 reference existing, approved PNG assets.
- Imported questions include A-F, A-G, and A-H option sets; runtime support
  remains A-H and no options are truncated.
- Crop manifest validation checks source files, page bounds, safe output paths,
  unique crop IDs/outputs, normalized boxes, and alt text for approved crops.

## Remaining review

- Confirm copyright/public-repository suitability before publishing source
  question text or PDF-derived images.
