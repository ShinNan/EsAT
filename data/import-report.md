# ENGAA 2016 Paper 1 Q01-Q10 import report

## Summary

- Imported ENGAA 2016 Paper 1 questions 1 to 10.
- Replaced the test question bank in `assets/questionBank.js` with these 10 ready-status questions.
- Created `data/question-bank.csv` as the spreadsheet-style backup.
- Created per-question solution files in `solutions/ENGAA/2016/P1/`.
- Added image assets for Q04 and Q06 in `assets/question-images/`.

## Source files

Source files identified from the repository `main` branch / GitHub UI:

- `source-papers/ENGAA 2016 Section 1.pdf`
- `source-mark-schemes/ENGAA 2016 Section 1 Answer Key.pdf`

The local checkout for this PR branch did not contain those PDFs, and `git fetch origin main` failed in this environment with a 403 tunnel error. Therefore Q04/Q06 image assets remain recreated SVGs rather than true PDF crops. Once `main` is merged into this branch, those source PDFs should be present at the paths above and can be used for a true crop pass. The raw annotated solution PDF was still not present in `solutions-raw/ENGAA/2016/`.

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

## Image notes

- Q04 graph and Q06 fission diagrams have been recreated as SVG assets in `assets/question-images/` because the PR checkout did not include `source-papers/ENGAA 2016 Section 1.pdf`.
- Please visually compare these SVGs with the source paper before relying on them for production, or replace them with true crops after merging `main` into the PR branch.

## Validation notes

- All IDs are unique.
- All `answerIndex` values match `correctAnswer`.
- Each imported question has the expected number of answer options from the source question.
- Q04 and Q06 have image paths that exist in `assets/question-images/`.
- Status is set to `ready` for this batch, as requested.

## Conflict-resolution notes

GitHub reported merge conflicts in `admin/csv-converter.html` and `assets/questionBank.js` after PDFs were uploaded to `main`. Resolve those by keeping this PR branch's completed converter/schema additions and the ENGAA Q01-Q10 question bank, while also keeping the `main` branch source PDF files. In particular:

- `admin/csv-converter.html` should keep the PR branch fields for `markSchemeNotes`, `solutionPath`, `hasImage`, `imageStatus`, `diagramType`, `sourcePage`, and optional `optionF`-`optionH`.
- `assets/questionBank.js` should keep the PR branch `window.ESAT_QUESTION_BANK` with the ENGAA Q01-Q10 imported questions, not the old test-only question bank from `main`.

## Items to check before merging

- Confirm Q01 inequality text against `source-papers/ENGAA 2016 Section 1.pdf`.
- Confirm Q04 and Q06 recreated diagrams are acceptable or replace them with true PDF crops from `source-papers/ENGAA 2016 Section 1.pdf`.
- Confirm copyright/public-repo suitability for using ENGAA source question text and diagrams.
