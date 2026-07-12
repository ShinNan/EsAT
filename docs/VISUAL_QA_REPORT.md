# Visual QA report

Branch: `fix/display-stabilisation-and-review-tools`

This report records what was checked during the display-stabilisation work and
what still needs a human browser check before the draft PR is merged.

## Result

The repository-level checks pass. Q04 and Q06 use the stable SVG fallbacks,
formula data for ENGAA 2016 P1 Q01-Q10 is synchronised between the CSV and the
runtime bank, and the exam/results pages load the shared KaTeX adapter in the
correct order. No merge-blocking file or data error was found.

The in-app browser was not permitted to open either `localhost` or the public
GitHub Pages domain in this session. It would be misleading to claim that a
fresh browser screenshot was inspected. The remaining browser checks are
listed below and should be completed while the PR is still a draft.

## Automated and source-level checks completed

| Area | Check | Result |
| --- | --- | --- |
| Question data | Parse `assets/questionBank.js` and compare all maintained fields with `data/question-bank.csv` | Pass: 10 questions, no differences |
| Live images | Resolve, read, and measure every live `imagePath` | Pass: Q04 and Q06 SVG files exist and are non-empty |
| Broken crop protection | Reject live paths under `debug-renders/`; validate PNG chunks, dimensions, blank space, dark space, and content coverage | Pass |
| Q06 crop | Regenerate and validate the retained experimental PNG after the old binary was found truncated | Pass as an experimental file; it is not live |
| Formula renderer | Exercise `\sqrt{3}`, `\frac{x}{2}`, `R^{2}T^{4}`, and `\nuclide{235}{92}{U}` through mocked KaTeX and the local fallback | Pass |
| Runtime loading | Check KaTeX -> `assets/app.js` -> `assets/math.js` -> page script order in `exam.html` and `results.html` | Pass |
| Preview page | Parse HTML, compile its inline JavaScript, and verify bank/math/KaTeX references | Pass |
| Exam behavior | Check structured display-formula code, inline option rendering, A-H keyboard support, image loading/error states, and saved image metadata | Pass by source/smoke inspection |
| Results behavior | Check structured question blocks, formula rendering, and image recovery/rendering for old and new saved results | Pass by source/smoke inspection |
| CSV converter | Check A-H handling, canonical flat image fields, grouped boolean parsing, and formula warnings | Pass by source inspection |
| Python suite | Crop-tool tests plus question-bank validation tests | Pass: 9/9 |

The normal validator reports one non-blocking warning for
`assets/question-images/ENGAA_2016_P1_S1_Q04_graph.png`. It is a retained,
unreferenced legacy asset. This stabilisation PR deliberately warns about it
instead of deleting it.

## Questions checked in data and rendering logic

- **Q01:** the inequality now uses `\frac{x}{2}` as a centred display block;
  all eight answers use explicit inline-math delimiters.
- **Q04:** live path is
  `assets/question-images/ENGAA_2016_P1_Q04_graph.svg` with
  `ready-svg-fallback`.
- **Q06:** live path is
  `assets/question-images/ENGAA_2016_P1_Q06_fission-diagrams.svg` with
  `ready-svg-fallback`. The experimental PNG is retained but is not selected.
- **A-H options:** Q01, Q06, and Q10 all exercise eight-option rendering; the
  runtime keyboard handler now accepts A-H.
- **Results/review:** saved question images and structured formula blocks are
  now available to the review renderer. Older saved attempts can recover image
  metadata from the current bank by original question ID.

## Manual browser review still required

Serve the repository from its root:

```bash
python3 -m http.server 4173
```

Then perform this short review:

1. Open `http://localhost:4173/admin/question-preview.html`.
   - Confirm the counters show 10 total questions, 2 with images, 0 missing
     images, 0 formula warnings, 10 ready questions, and 0 drafts.
   - Use **Only with images** and confirm Q04 and Q06 both remain visible.
   - Use **Only warnings** and confirm only intentional warnings, if any, appear.
2. Check Q01.
   - The `x/2` term should be a real stacked fraction.
   - The equation block should be centred and the A-H choices compact.
3. Check Q04.
   - The full graph, both axes, labels, and line should be visible.
   - There should be no large empty image container.
4. Check Q06.
   - All three fission diagrams and their labels should be visible.
   - The display must not be a narrow top strip with blank/black space below.
5. Start an exam from `http://localhost:4173/` and inspect one short question,
   Q04/Q06 when reached, and an eight-option question.
6. Complete or restore a test attempt and open
   `http://localhost:4173/results.html`; confirm formulas and diagrams appear in
   review.
7. Open `http://localhost:4173/admin/csv-converter.html` and confirm the page
   loads and its formula guidance is readable.
8. Repeat the preview and one exam question at a narrow mobile width.

After merge and GitHub Pages deployment, repeat the key checks at:

- `https://shinnan.github.io/EsAT/`
- `https://shinnan.github.io/EsAT/admin/question-preview.html`

Use a hard refresh or private window so an older cached question bank or image
cannot be mistaken for the deployed version.

## Known limitations

- KaTeX is loaded from a pinned CDN because GitHub Pages has no build step. If
  the CDN is unavailable, the local lightweight renderer remains active, but it
  is less typographically complete.
- The PDF crop workflow is still experimental. Passing coordinate and binary
  validation does not replace comparison with the source paper.
- The preview page can detect a missing image request, but only a person can
  confirm that a diagram is semantically complete and faithful to the paper.
- No screenshot artifact is attached from this session because browser access
  to the local and deployed sites was blocked. The draft PR must remain under
  manual visual review until the checklist above is completed.
