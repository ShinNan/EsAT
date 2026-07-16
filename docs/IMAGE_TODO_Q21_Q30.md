# Image TODO: ENGAA 2016 Paper 1 Q21-Q30

This batch imports text and answer options only. Do not use automatic PDF crops as live images. Any image below must be manually cropped, checked visually, committed under `assets/question-images/`, and then wired into the question bank in a separate focused PR.

Update: Q22, Q26, Q27 and Q28 now use manually checked uploaded images. Q30 remains unwired because it has been identified as crossed out / not used for ESAT-topic coverage and no Q30 image file is currently present.

## Image-needed questions

| Question ID | Status | Field to use later | Final storage path | Suggested filename | Crop scope | What exactly to crop | Reminders |
|---|---|---|---|---|---|---|---|
| ENGAA_2016_P1_Q22 | Completed | `imagePath` | `assets/question-images/ENGAA_2016_P1_Q22_velocity_time_graph.png` | `ENGAA_2016_P1_Q22_velocity_time_graph.png` | Diagram only | The velocity-time graph showing the object motion over 30 s, including axes, scale labels and plotted line. | Do not include the original paper question number. Do not include answer options; options are rendered as HTML buttons. |
| ENGAA_2016_P1_Q26 | Completed | `imagePath` | `assets/question-images/ENGAA_2016_P1_Q26_alpha_decay.png` | `ENGAA_2016_P1_Q26_alpha_decay.png` | Diagram only | The before/after alpha decay diagram showing uranium-238, thorium-234, the alpha particle and direction arrows. | Do not include the original paper question number. Do not include answer options; options are rendered as HTML buttons. |
| ENGAA_2016_P1_Q27 | Completed | `imagePath` | `assets/question-images/ENGAA_2016_P1_Q27_polygon_angle.png` | `ENGAA_2016_P1_Q27_polygon_angle.png` | Diagram only | The regular polygon segment labelled \(P,Q,R,S,T\), including the extended line to \(T\), equal side markings and angle \(x\). | Do not include the original paper question number. Do not include answer options; options are rendered as HTML buttons. |
| ENGAA_2016_P1_Q28 | Completed | `imagePath` | `assets/question-images/ENGAA_2016_P1_Q28_echo_buildings.png` | `ENGAA_2016_P1_Q28_echo_buildings.png` | Diagram only | The two-building setup with the student/loudspeaker position, 128 m total separation and 48 m distance label. | Do not include the original paper question number. Do not include answer options; options are rendered as HTML buttons. |
| ENGAA_2016_P1_Q30 | Deferred: crossed out / not used | `imagePath` | `assets/question-images/ENGAA_2016_P1_Q30_parachutist_forces.png` | `ENGAA_2016_P1_Q30_parachutist_forces.png` | Diagram only | The two force diagrams: parachute forces and parachutist forces, including labels \(L,M,N,P,Q,R\). | Do not wire this until the crossed-out question handling workflow is defined. |

## No image needed

- ENGAA_2016_P1_Q21
- ENGAA_2016_P1_Q23
- ENGAA_2016_P1_Q24
- ENGAA_2016_P1_Q25
- ENGAA_2016_P1_Q29

## Wiring rule for the follow-up PR

- Diagram-only crop: keep `displayMode: simple-html`, set `hasImage: true`, set `imagePath`, add useful `imageAlt`, set `imageStatus: ready`, and remove the visible `[Image needed: ...]` placeholder line from `question`.
- Full question stem crop: use `stemImagePath` / `stem-image` only if a later task explicitly decides that the whole stem must be rendered as an image.
