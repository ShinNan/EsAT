# ENGAA 2016 Paper 1 Q01-Q10 import report

## Summary

- Imported ENGAA 2016 Paper 1 questions 1 to 10.
- Replaced the test question bank in `assets/questionBank.js` with these 10 ready-status questions.
- Created `data/question-bank.csv` as the spreadsheet-style backup.
- Created per-question solution files in `solutions/ENGAA/2016/P1/`.
- Added image assets for Q04 and Q06 in `assets/question-images/`.

## Source files

Expected local source files:

- `source-papers/ENGAA_2016_P1.pdf`
- `source-mark-schemes/ENGAA_2016_P1_MS.pdf`
- `solutions-raw/ENGAA/2016/ENGAA_2016_P1_annotated_solutions.pdf`

These files were not visible in the current checkout when inspected, so the import used the publicly accessible ENGAA 2016 Section 1 question paper and answer key text as reference. The raw annotated solution PDF was not available locally.

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

- Q04 graph and Q06 fission diagrams have been recreated as SVG assets in `assets/question-images/` because PDF cropping tools/source PDFs were not available in the checkout.
- Please visually compare these SVGs with the source paper before relying on them for production.

## Validation notes

- All IDs are unique.
- All `answerIndex` values match `correctAnswer`.
- Each imported question has the expected number of answer options from the source question.
- Q04 and Q06 have image paths that exist in `assets/question-images/`.
- Status is set to `ready` for this batch, as requested.

## Items to check before merging

- Confirm Q01 inequality text against the original PDF rendering.
- Confirm Q04 and Q06 recreated diagrams are acceptable or replace them with true PDF crops.
- Confirm copyright/public-repo suitability for using ENGAA source question text and diagrams.
