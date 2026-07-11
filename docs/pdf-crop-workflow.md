# PDF question-image workflow

This workflow keeps question text and answer choices as structured data and crops
only the diagram that cannot be represented as text. Do not capture the whole
question: that duplicates content, removes accessibility and search, and makes
mobile rendering worse.

The workflow is intentionally human-in-the-loop. PyMuPDF can find embedded
raster images, but ENGAA diagrams also contain vector strokes and separately
positioned labels. Fully automatic grouping can silently omit isotope labels or
include nearby question text. A reviewer therefore approves one rectangle per
diagram; rendering, naming, repeatability, and validation are automated.

## One-time setup in Codespaces

From the repository root:

```bash
python3 -m pip install -r requirements-tools.txt
python3 tools/crop_pdf_images.py prepare
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/tools/crop_selector.html
```

The selector reads `debug-renders/index.json`. You can also enter a repository
path such as:

```text
debug-renders/ENGAA_2016_Section1_page_08_grid.png
```

The page includes a local-file fallback, but normal Codespaces use should not
need any screenshot download or upload.

## Review and save a crop

1. Choose a task.
2. Draw tightly around the diagram only.
3. Check that every label, axis, arrow, and unit is visible in the preview.
4. Copy and run the generated `set-box` command from the repository root.

Example:

```bash
python3 tools/crop_pdf_images.py set-box \
  --id "ENGAA_2016_P1_Q06_fission_diagrams" \
  --box "0.117647,0.112827,0.848739,0.433492" \
  --status reviewed \
  --build
```

The box is normalized (`0..1`) and page numbers are 1-based. It therefore does
not depend on preview DPI. The manifest at `data/pdf-crops.json` is the source
of truth; generated PNGs can be recreated at any time.

## Batch commands

```bash
# Validate manifest structure, source files, and PDF page bounds.
python3 tools/crop_pdf_images.py validate

# Render all referenced PDF pages with a 50-point coordinate grid.
python3 tools/crop_pdf_images.py prepare

# Build every final PNG from the original PDFs.
python3 tools/crop_pdf_images.py build

# Prepare pages and build crops in one pass.
python3 tools/crop_pdf_images.py all

# Require generated outputs as part of validation.
python3 tools/crop_pdf_images.py validate --require-outputs

# Limit a prepare/build/validation run to one task (repeatable).
python3 tools/crop_pdf_images.py build --id ENGAA_2016_P1_Q06_fission_diagrams
```

## Naming and review rules

- Document keys use letters, numbers, underscores, and hyphens. The canonical
  ENGAA key is `ENGAA_2016_Section1`.
- Debug pages are named `<document>_page_<NN>_grid.png`.
- Final outputs must stay under `assets/question-images/` and end in `.png`.
- Crop statuses are `needs-review`, `reviewed`, or `approved`.
- `approved` crops require useful alt text.
- Generated debug renders are ignored by Git; final reviewed assets are not.
- Keep an existing SVG when it is clearer than the PDF comparison crop.

The GitHub Actions workflow validates the manifest, runs the tests, builds all
debug pages and crops, and uploads them as a review artifact. It has read-only
repository permissions and never commits generated files by itself.

