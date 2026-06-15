/*
  ESAT Simulator Question Bank
  --------------------------------
  Generated from data/question-bank.csv.
  Source batch: ENGAA 2016 Paper 1, Questions 1-10.
  Keep question IDs stable so localStorage profile progress remains valid.
*/

window.ESAT_QUESTION_BANK = {
  "version": "1.0.0",
  "lastUpdated": "2026-06-15",
  "subjects": {
    "maths1": {
      "label": "Maths 1",
      "shortLabel": "M1",
      "description": "Core mathematical fluency, algebra, graphs, geometry, sequences and problem solving.",
      "questions": [
        {
          "id": "ENGAA_2016_P1_Q01",
          "subject": "maths1",
          "topicCode": "ALG-INEQ",
          "topic": "Inequalities",
          "difficulty": 2,
          "question": "Find the complete set of solutions to 2x - 68 < -12.",
          "options": [
            "x < 4",
            "x > 4",
            "x < 20",
            "x > 20",
            "x < 22",
            "x > 22",
            "x < 28",
            "x > 28"
          ],
          "correctAnswer": "G",
          "answerIndex": 6,
          "explanation": "Add 68 to both sides to get 2x < 56, then divide by 2 to get x < 28.",
          "markSchemeNotes": "Answer key gives G.",
          "quickestMethod": "Move the constant term first: 2x < 56, so x < 28.",
          "commonTrap": "Forgetting that only multiplying or dividing by a negative reverses an inequality; here division is by positive 2 so the sign stays the same.",
          "tags": [
            "inequalities",
            "linear inequalities",
            "algebra"
          ],
          "hasImage": false,
          "imageStatus": "not-needed",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "1",
            "page": "4",
            "originalReference": "ENGAA 2016 P1 Q01"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q01.md"
        },
        {
          "id": "ENGAA_2016_P1_Q03",
          "subject": "maths1",
          "topicCode": "SURD",
          "topic": "Surds",
          "difficulty": 2,
          "question": "Which one of the following is a simplification of (sqrt(3) - sqrt(2))^2?",
          "options": [
            "1 - 2sqrt(6)",
            "5 - 2sqrt(6)",
            "2sqrt(3) - 2sqrt(2)",
            "1",
            "5 - 2sqrt(3)",
            "13 - 2sqrt(6)",
            "5 + 2sqrt(6)",
            "5sqrt(6)"
          ],
          "correctAnswer": "B",
          "answerIndex": 1,
          "explanation": "Use (a - b)^2 = a^2 - 2ab + b^2. This gives 3 - 2sqrt(6) + 2 = 5 - 2sqrt(6).",
          "markSchemeNotes": "Answer key gives B.",
          "quickestMethod": "Square the surds separately and remember the cross term is -2sqrt(3)sqrt(2) = -2sqrt(6).",
          "commonTrap": "Dropping the cross term or simplifying sqrt(3)sqrt(2) incorrectly.",
          "tags": [
            "surds",
            "expanding brackets",
            "algebra"
          ],
          "hasImage": false,
          "imageStatus": "not-needed",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "3",
            "page": "5",
            "originalReference": "ENGAA 2016 P1 Q03"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q03.md"
        },
        {
          "id": "ENGAA_2016_P1_Q05",
          "subject": "maths1",
          "topicCode": "RATIO",
          "topic": "Ratio",
          "difficulty": 2,
          "question": "The ratio of Q:R is 5:2 and the ratio of R:S is 3:10. Which one of the following gives the ratio Q:S in its simplest form?",
          "options": [
            "1:2",
            "2:1",
            "3:4",
            "3:25",
            "4:3",
            "25:3"
          ],
          "correctAnswer": "C",
          "answerIndex": 2,
          "explanation": "Make the R parts match. Q:R = 5:2 is equivalent to 15:6, and R:S = 3:10 is equivalent to 6:20. Therefore Q:S = 15:20 = 3:4.",
          "markSchemeNotes": "Answer key gives C.",
          "quickestMethod": "Scale both ratios so R is 6, then compare Q and S directly.",
          "commonTrap": "Multiplying the visible Q and S numbers without matching the shared R term first.",
          "tags": [
            "ratio",
            "proportion"
          ],
          "hasImage": false,
          "imageStatus": "not-needed",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "5",
            "page": "7",
            "originalReference": "ENGAA 2016 P1 Q05"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q05.md"
        },
        {
          "id": "ENGAA_2016_P1_Q07",
          "subject": "maths1",
          "topicCode": "STAT-MEAN",
          "topic": "Averages",
          "difficulty": 2,
          "question": "The mean age of the twenty members of a running club is exactly 28. The mean age increases by exactly 2 years when two new members join. What is the mean age of the two new members?",
          "options": [
            "20 years",
            "22 years",
            "30 years",
            "40 years",
            "50 years",
            "52 years"
          ],
          "correctAnswer": "E",
          "answerIndex": 4,
          "explanation": "The original total age is 20 x 28 = 560. With 22 members the new mean is 30, so the new total is 22 x 30 = 660. The two new members therefore total 100 years, giving a mean of 50 years.",
          "markSchemeNotes": "Answer key gives E.",
          "quickestMethod": "Compare total ages before and after: 660 - 560 = 100 for two people.",
          "commonTrap": "Adding 2 years to 28 and assuming the new members average 30, which ignores the existing 20 members.",
          "tags": [
            "mean",
            "averages",
            "statistics"
          ],
          "hasImage": false,
          "imageStatus": "not-needed",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "7",
            "page": "9",
            "originalReference": "ENGAA 2016 P1 Q07"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q07.md"
        },
        {
          "id": "ENGAA_2016_P1_Q09",
          "subject": "maths1",
          "topicCode": "PERCENT",
          "topic": "Percentages",
          "difficulty": 2,
          "question": "A medical scanner is bought for £15 000. The value of the scanner depreciates by 20% every year. By how much has the scanner reduced in value after 2 years?",
          "options": [
            "£600",
            "£3000",
            "£5400",
            "£6000",
            "£9000",
            "£9600",
            "£12 000"
          ],
          "correctAnswer": "C",
          "answerIndex": 2,
          "explanation": "After one year the value is 80% of £15 000, and after two years it is 0.8^2 x 15000 = £9600. The reduction is £15 000 - £9600 = £5400.",
          "markSchemeNotes": "Answer key gives C.",
          "quickestMethod": "Use the multiplier 0.8 twice, then subtract the remaining value from the original price.",
          "commonTrap": "Subtracting 40% of the original price; successive 20% decreases compound, so the second decrease is 20% of the reduced value.",
          "tags": [
            "percentages",
            "depreciation",
            "multipliers"
          ],
          "hasImage": false,
          "imageStatus": "not-needed",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "9",
            "page": "10",
            "originalReference": "ENGAA 2016 P1 Q09"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q09.md"
        }
      ]
    },
    "maths2": {
      "label": "Maths 2",
      "shortLabel": "M2",
      "description": "More advanced mathematical reasoning, calculus, vectors, trigonometry and algebraic fluency.",
      "questions": []
    },
    "physics": {
      "label": "Physics",
      "shortLabel": "PHY",
      "description": "Mechanics, electricity, waves, materials, particles and practical physics.",
      "questions": [
        {
          "id": "ENGAA_2016_P1_Q02",
          "subject": "physics",
          "topicCode": "NUC",
          "topic": "Nuclear Physics",
          "difficulty": 2,
          "question": "A nuclide ^214_82Pb changes by radioactive decay into the nuclide ^210_82Pb. Which combination of emissions produces this change?",
          "options": [
            "3 alpha",
            "2 alpha and 1 beta",
            "2 alpha and 2 beta",
            "1 alpha and 2 beta",
            "3 beta"
          ],
          "correctAnswer": "D",
          "answerIndex": 3,
          "explanation": "The mass number falls by 4 while the atomic number is unchanged. One alpha emission changes A by -4 and Z by -2; two beta-minus emissions then increase Z by 2, restoring the atomic number to 82.",
          "markSchemeNotes": "Answer key gives D.",
          "quickestMethod": "Match mass first: a drop of 4 means one alpha. Then restore proton number with two beta-minus decays.",
          "commonTrap": "Counting only the mass change and forgetting that alpha decay also changes the atomic number.",
          "tags": [
            "radioactive decay",
            "alpha decay",
            "beta decay",
            "nuclear physics"
          ],
          "hasImage": false,
          "imageStatus": "not-needed",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "2",
            "page": "4",
            "originalReference": "ENGAA 2016 P1 Q02"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q02.md"
        },
        {
          "id": "ENGAA_2016_P1_Q04",
          "subject": "physics",
          "topicCode": "MECH-GRAPH",
          "topic": "Mechanics Graphs",
          "difficulty": 3,
          "question": "The graph shown of quantity y against quantity x represents the motion of a body. The line runs from (0, 0) to (2.0, 10). The scales on both axes are in the appropriate S.I. units and g = 10 N kg^-1. Which two statements could the graph represent? 1 kinetic energy against velocity for an object of mass 10 kg undergoing free-fall; 2 potential energy against height for an object of mass 20 kg being lifted by a constant external force; 3 velocity against time for an object of mass 20 kg being accelerated by a resultant force of 100 N; 4 work done by an external force of 5 N against distance moved for an object of mass 12 kg being moved at constant speed by the external force.",
          "options": [
            "1 and 2",
            "1 and 3",
            "1 and 4",
            "2 and 3",
            "2 and 4",
            "3 and 4"
          ],
          "correctAnswer": "F",
          "answerIndex": 5,
          "explanation": "The graph is a straight line through the origin with gradient 10/2 = 5. Kinetic energy varies with v^2, so statement 1 is not linear. Potential energy mgh for m = 20 has gradient 200, so statement 2 is not this graph. For statement 3, acceleration is F/m = 100/20 = 5, so v = 5t. For statement 4, work W = Fs = 5s. Therefore statements 3 and 4 match.",
          "markSchemeNotes": "Answer key gives F.",
          "quickestMethod": "Find the gradient, 5, then test each proposed relation for linearity and gradient.",
          "commonTrap": "Accepting any straight-line proportionality without checking the actual gradient or forgetting kinetic energy is proportional to v^2.",
          "tags": [
            "graphs",
            "mechanics",
            "work",
            "acceleration"
          ],
          "hasImage": true,
          "imagePath": "assets/question-images/ENGAA_2016_P1_Q04_graph.svg",
          "imageAlt": "Line graph of y against x passing through the origin and the point x equals 2.0, y equals 10.",
          "diagramType": "graph",
          "imageStatus": "ready",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "4",
            "page": "6",
            "originalReference": "ENGAA 2016 P1 Q04"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q04.md"
        },
        {
          "id": "ENGAA_2016_P1_Q06",
          "subject": "physics",
          "topicCode": "NUC-FISSION",
          "topic": "Nuclear Fission",
          "difficulty": 3,
          "question": "A uranium-235 nucleus can undergo fission to produce two smaller nuclei. Which of the diagrams, if any, could represent this process?",
          "options": [
            "none of them",
            "1 only",
            "2 only",
            "3 only",
            "1 and 2 only",
            "1 and 3 only",
            "2 and 3 only",
            "1, 2 and 3"
          ],
          "correctAnswer": "C",
          "answerIndex": 2,
          "explanation": "Check conservation of nucleon number and proton number. Diagram 2 balances: 235 + 1 = 96 + 137 + 3 and 92 = 38 + 54. The other diagrams do not conserve the required totals, so only diagram 2 is possible.",
          "markSchemeNotes": "Answer key gives C.",
          "quickestMethod": "For each diagram, add mass numbers and atomic numbers on both sides. Reject any diagram where either total changes.",
          "commonTrap": "Checking mass number only and not checking proton number, or missing emitted neutrons.",
          "tags": [
            "nuclear fission",
            "conservation",
            "nuclear physics"
          ],
          "hasImage": true,
          "imagePath": "assets/question-images/ENGAA_2016_P1_Q06_fission-diagrams.svg",
          "imageAlt": "Three proposed uranium-235 fission diagrams with emitted neutrons and daughter nuclei; only diagram 2 conserves mass and proton number.",
          "diagramType": "nuclear diagram",
          "imageStatus": "ready",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "6",
            "page": "8",
            "originalReference": "ENGAA 2016 P1 Q06"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q06.md"
        },
        {
          "id": "ENGAA_2016_P1_Q08",
          "subject": "physics",
          "topicCode": "ELEC-POWER",
          "topic": "Electricity",
          "difficulty": 3,
          "question": "A circuit consists of a 5.0 ohm resistor and a variable resistor connected in series with a 24 V battery. The variable resistor has a minimum resistance of 3.0 ohm and a maximum resistance of 15 ohm. The battery and connecting wires have negligible resistance. What is the maximum power dissipated in the 5.0 ohm resistor?",
          "options": [
            "7.2 W",
            "18 W",
            "27 W",
            "45 W",
            "72 W",
            "75 W"
          ],
          "correctAnswer": "D",
          "answerIndex": 3,
          "explanation": "Power in the fixed 5.0 ohm resistor is I^2R. The current is largest when the variable resistor is at its minimum value, so total resistance is 5.0 + 3.0 = 8.0 ohm. The current is 24/8 = 3.0 A, and the fixed-resistor power is 3.0^2 x 5.0 = 45 W.",
          "markSchemeNotes": "Answer key gives D.",
          "quickestMethod": "Use the minimum total resistance to maximize current, then apply P = I^2R to the 5 ohm resistor.",
          "commonTrap": "Using P = V^2/R with the full 24 V across the 5 ohm resistor; the 24 V is across both series resistors.",
          "tags": [
            "electric circuits",
            "power",
            "resistance",
            "series circuits"
          ],
          "hasImage": false,
          "imageStatus": "not-needed",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "8",
            "page": "9",
            "originalReference": "ENGAA 2016 P1 Q08"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q08.md"
        },
        {
          "id": "ENGAA_2016_P1_Q10",
          "subject": "physics",
          "topicCode": "ASTRO-RADIATION",
          "topic": "Radiation and Proportionality",
          "difficulty": 3,
          "question": "The total power P radiated by a star is given by P = kR^2T^4, where R is the radius of the star, T is its surface temperature and k is a constant. The power currently radiated by the Sun is 4.0 x 10^26 W. Towards the end of the Sun's life its radius will increase by a factor of 100 and its surface temperature will decrease by a factor of 2. What will be the power radiated by the Sun when these changes have occurred?",
          "options": [
            "2.5 x 10^27 W",
            "1.0 x 10^28 W",
            "2.0 x 10^28 W",
            "2.5 x 10^29 W",
            "1.0 x 10^30 W",
            "2.0 x 10^30 W",
            "2.5 x 10^33 W",
            "1.0 x 10^34 W"
          ],
          "correctAnswer": "D",
          "answerIndex": 3,
          "explanation": "The radius factor contributes 100^2 = 10 000. The temperature factor contributes (1/2)^4 = 1/16. The net factor is 10 000/16 = 625. Therefore the new power is 4.0 x 10^26 x 625 = 2.5 x 10^29 W.",
          "markSchemeNotes": "Answer key gives D.",
          "quickestMethod": "Compute the proportional change only: 100^2 divided by 2^4 equals 625, then multiply 4.0 x 10^26 by 625.",
          "commonTrap": "Forgetting that temperature is raised to the fourth power, or applying the radius factor only once instead of squaring it.",
          "tags": [
            "proportionality",
            "powers",
            "radiation",
            "astrophysics"
          ],
          "hasImage": false,
          "imageStatus": "not-needed",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "P1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "10",
            "page": "10",
            "originalReference": "ENGAA 2016 P1 Q10"
          },
          "status": "ready",
          "solutionPath": "solutions/ENGAA/2016/P1/ENGAA_2016_P1_Q10.md"
        }
      ]
    }
  }
};
