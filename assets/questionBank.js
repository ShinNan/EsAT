/*
  ESAT Simulator Question Bank
  --------------------------------
  How to edit:
  1. Copy one question object.
  2. Change id, topic, difficulty, question, options, answerIndex and explanation.
  3. answerIndex starts from 0:
     0 = first option, 1 = second option, 2 = third option, 3 = fourth option.
  4. Keep subject as one of:
     "maths1", "maths2", "physics"
*/

window.ESAT_QUESTION_BANK = {
  version: "1.0.0",
  lastUpdated: "2026-06-02",
  subjects: {
    maths1: {
      label: "Maths 1",
      shortLabel: "M1",
      description: "Core mathematical fluency, algebra, graphs, geometry, sequences and problem solving.",
      questions: [
        {
          id: "M1-ALG-001",
          subject: "maths1",
          topic: "Algebra",
          difficulty: 1,
          question: "Solve 3x - 7 = 11.",
          options: ["x = 4", "x = 5", "x = 6", "x = 7"],
          answerIndex: 2,
          explanation: "3x - 7 = 11, so 3x = 18 and x = 6.",
          tags: ["linear equations"]
        },
        {
          id: "M1-ALG-002",
          subject: "maths1",
          topic: "Algebra",
          difficulty: 1,
          question: "Expand (2x - 3)(x + 5).",
          options: ["2x^2 + 7x - 15", "2x^2 - 7x - 15", "2x^2 + 10x - 3", "2x^2 + 7x + 15"],
          answerIndex: 0,
          explanation: "2x times x is 2x^2, 2x times 5 is 10x, -3 times x is -3x, and -3 times 5 is -15. This gives 2x^2 + 7x - 15.",
          tags: ["expanding brackets"]
        },
        {
          id: "M1-ALG-003",
          subject: "maths1",
          topic: "Algebra",
          difficulty: 1,
          question: "Factorise x^2 - 9x + 20.",
          options: ["(x - 2)(x - 10)", "(x - 4)(x - 5)", "(x + 4)(x + 5)", "(x - 1)(x - 20)"],
          answerIndex: 1,
          explanation: "The two numbers multiply to 20 and add to -9, so they are -4 and -5.",
          tags: ["factorising quadratics"]
        },
        {
          id: "M1-ALG-004",
          subject: "maths1",
          topic: "Algebra",
          difficulty: 1,
          question: "Solve x^2 = 49.",
          options: ["x = 7 only", "x = -7 only", "x = 0 or 7", "x = -7 or 7"],
          answerIndex: 3,
          explanation: "Both 7^2 and (-7)^2 are equal to 49.",
          tags: ["quadratics"]
        },
        {
          id: "M1-FUN-001",
          subject: "maths1",
          topic: "Functions",
          difficulty: 1,
          question: "If f(x) = 2x + 1, what is f(f(3))?",
          options: ["7", "12", "15", "18"],
          answerIndex: 2,
          explanation: "f(3) = 7, then f(7) = 15.",
          tags: ["functions"]
        },
        {
          id: "M1-FUN-002",
          subject: "maths1",
          topic: "Functions",
          difficulty: 1,
          question: "y is proportional to x^2. If x is doubled, what happens to y?",
          options: ["y is doubled", "y is tripled", "y is quadrupled", "y is halved"],
          answerIndex: 2,
          explanation: "If y is proportional to x^2, doubling x multiplies y by 2^2 = 4.",
          tags: ["proportion"]
        },
        {
          id: "M1-CG-001",
          subject: "maths1",
          topic: "Coordinate Geometry",
          difficulty: 1,
          question: "Find the equation of the line through (2, 5) and (6, 13).",
          options: ["y = 2x + 1", "y = 2x - 1", "y = x + 3", "y = 4x - 3"],
          answerIndex: 0,
          explanation: "The gradient is (13 - 5) / (6 - 2) = 2. Using (2,5), 5 = 2(2) + c, so c = 1.",
          tags: ["straight lines"]
        },
        {
          id: "M1-CG-002",
          subject: "maths1",
          topic: "Coordinate Geometry",
          difficulty: 1,
          question: "A line has gradient -1/3. What is the gradient of a perpendicular line?",
          options: ["-3", "-1/3", "1/3", "3"],
          answerIndex: 3,
          explanation: "Perpendicular gradients multiply to -1. Therefore the perpendicular gradient is 3.",
          tags: ["perpendicular gradients"]
        },
        {
          id: "M1-SEQ-001",
          subject: "maths1",
          topic: "Sequences",
          difficulty: 1,
          question: "Find the nth term of the sequence 5, 9, 13, 17, ...",
          options: ["4n + 1", "5n - 1", "4n - 1", "n + 4"],
          answerIndex: 0,
          explanation: "The common difference is 4. The sequence is 4n + 1.",
          tags: ["arithmetic sequences"]
        },
        {
          id: "M1-SEQ-002",
          subject: "maths1",
          topic: "Sequences",
          difficulty: 1,
          question: "What is the next term in the sequence 3, 6, 12, 24, ...?",
          options: ["30", "36", "48", "72"],
          answerIndex: 2,
          explanation: "Each term is multiplied by 2, so the next term is 48.",
          tags: ["geometric sequences"]
        },
        {
          id: "M1-TRI-001",
          subject: "maths1",
          topic: "Trigonometry",
          difficulty: 1,
          question: "In a right-angled triangle, sin theta = 3/5 and theta is acute. What is cos theta?",
          options: ["2/5", "3/5", "4/5", "5/4"],
          answerIndex: 2,
          explanation: "Using a 3-4-5 triangle, the adjacent side is 4 and the hypotenuse is 5.",
          tags: ["right angle trigonometry"]
        },
        {
          id: "M1-TRI-002",
          subject: "maths1",
          topic: "Trigonometry",
          difficulty: 1,
          question: "What is tan 45 degrees?",
          options: ["0", "1/2", "1", "sqrt(3)"],
          answerIndex: 2,
          explanation: "In a 45 degree right-angled triangle, the opposite and adjacent sides are equal, so tan 45 degrees = 1.",
          tags: ["exact trig values"]
        },
        {
          id: "M1-CAL-001",
          subject: "maths1",
          topic: "Basic Calculus",
          difficulty: 2,
          question: "Differentiate y = 3x^2 - 4x + 1.",
          options: ["6x - 4", "3x - 4", "6x + 1", "x^3 - 2x^2 + x"],
          answerIndex: 0,
          explanation: "The derivative of 3x^2 is 6x, the derivative of -4x is -4, and the constant differentiates to 0.",
          tags: ["differentiation"]
        },
        {
          id: "M1-CAL-002",
          subject: "maths1",
          topic: "Basic Calculus",
          difficulty: 2,
          question: "The curve y = x^2 - 6x + 8 has a stationary point. What is the x-coordinate of this point?",
          options: ["2", "3", "4", "6"],
          answerIndex: 1,
          explanation: "dy/dx = 2x - 6. Setting dy/dx = 0 gives x = 3.",
          tags: ["stationary points"]
        },
        {
          id: "M1-PRO-001",
          subject: "maths1",
          topic: "Probability",
          difficulty: 1,
          question: "A fair six-sided die is rolled once. What is the probability of rolling a number greater than 4?",
          options: ["1/6", "1/3", "1/2", "2/3"],
          answerIndex: 1,
          explanation: "The possible outcomes greater than 4 are 5 and 6, so the probability is 2/6 = 1/3.",
          tags: ["probability"]
        },
        {
          id: "M1-PRO-002",
          subject: "maths1",
          topic: "Probability",
          difficulty: 2,
          question: "Events A and B are independent. P(A) = 0.3 and P(B) = 0.5. What is P(A and B)?",
          options: ["0.15", "0.20", "0.30", "0.80"],
          answerIndex: 0,
          explanation: "For independent events, P(A and B) = P(A)P(B) = 0.3 x 0.5 = 0.15.",
          tags: ["independent events"]
        },
        {
          id: "M1-ALG-005",
          subject: "maths1",
          topic: "Algebra",
          difficulty: 2,
          question: "Solve the simultaneous equations 2x + y = 9 and x - y = 3.",
          options: ["x = 3, y = 3", "x = 4, y = 1", "x = 5, y = -1", "x = 2, y = 5"],
          answerIndex: 1,
          explanation: "Adding the equations gives 3x = 12, so x = 4. Then x - y = 3 gives y = 1.",
          tags: ["simultaneous equations"]
        },
        {
          id: "M1-NUM-001",
          subject: "maths1",
          topic: "Number",
          difficulty: 1,
          question: "Simplify 2^3 x 2^5.",
          options: ["2^8", "2^15", "4^8", "4^15"],
          answerIndex: 0,
          explanation: "When multiplying powers with the same base, add the indices: 2^3 x 2^5 = 2^8.",
          tags: ["indices"]
        },
        {
          id: "M1-NUM-002",
          subject: "maths1",
          topic: "Number",
          difficulty: 1,
          question: "The ratio a:b is 2:5. If a + b = 21, what is a?",
          options: ["4", "6", "8", "15"],
          answerIndex: 1,
          explanation: "There are 7 parts in total. Each part is 3, so a = 2 x 3 = 6.",
          tags: ["ratio"]
        },
        {
          id: "M1-GEO-001",
          subject: "maths1",
          topic: "Geometry",
          difficulty: 1,
          question: "What is the area of a circle with radius 3?",
          options: ["3pi", "6pi", "9pi", "18pi"],
          answerIndex: 2,
          explanation: "Area = pi r^2 = pi x 3^2 = 9pi.",
          tags: ["area"]
        },
        {
          id: "M1-ALG-006",
          subject: "maths1",
          topic: "Algebra",
          difficulty: 1,
          question: "Solve |x| = 5.",
          options: ["x = 5 only", "x = -5 only", "x = -5 or 5", "x = 0 or 5"],
          answerIndex: 2,
          explanation: "The absolute value of both 5 and -5 is 5.",
          tags: ["absolute value"]
        },
        {
          id: "M1-FUN-003",
          subject: "maths1",
          topic: "Functions",
          difficulty: 1,
          question: "For y = 1/x, what happens to y when x is doubled?",
          options: ["y is doubled", "y is halved", "y is squared", "y is unchanged"],
          answerIndex: 1,
          explanation: "If x becomes 2x, then y becomes 1/(2x), which is half the original value.",
          tags: ["reciprocal functions"]
        },
        {
          id: "M1-CG-003",
          subject: "maths1",
          topic: "Coordinate Geometry",
          difficulty: 1,
          question: "What is the y-intercept of the line y = 3x - 4?",
          options: ["-4", "-3", "3", "4"],
          answerIndex: 0,
          explanation: "The y-intercept is the constant term in y = mx + c, so it is -4.",
          tags: ["straight lines"]
        },
        {
          id: "M1-DAT-001",
          subject: "maths1",
          topic: "Data",
          difficulty: 1,
          question: "Find the median of 2, 5, 9, 10, 20.",
          options: ["5", "9", "10", "20"],
          answerIndex: 1,
          explanation: "The median is the middle value when the data are in order, so it is 9.",
          tags: ["median"]
        },
        {
          id: "M1-GEO-002",
          subject: "maths1",
          topic: "Geometry",
          difficulty: 1,
          question: "Two angles in a triangle are 40 degrees and 65 degrees. What is the third angle?",
          options: ["65 degrees", "70 degrees", "75 degrees", "85 degrees"],
          answerIndex: 2,
          explanation: "Angles in a triangle sum to 180 degrees. The third angle is 180 - 40 - 65 = 75 degrees.",
          tags: ["angles"]
        },
        {
          id: "M1-ALG-007",
          subject: "maths1",
          topic: "Algebra",
          difficulty: 1,
          question: "Solve the inequality 4x + 1 < 13.",
          options: ["x < 3", "x > 3", "x < 12", "x > 12"],
          answerIndex: 0,
          explanation: "4x + 1 < 13 gives 4x < 12, so x < 3.",
          tags: ["inequalities"]
        },
        {
          id: "M1-ALG-008",
          subject: "maths1",
          topic: "Algebra",
          difficulty: 2,
          question: "Complete the square: x^2 + 6x + 11.",
          options: ["(x + 3)^2 + 2", "(x + 3)^2 - 2", "(x - 3)^2 + 2", "(x - 3)^2 - 2"],
          answerIndex: 0,
          explanation: "x^2 + 6x + 11 = (x + 3)^2 + 2.",
          tags: ["completing the square"]
        }
      ]
    },

    maths2: {
      label: "Maths 2",
      shortLabel: "M2",
      description: "More advanced mathematical reasoning, calculus, vectors, trigonometry and algebraic fluency.",
      questions: [
        {
          id: "M2-CAL-001",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 1,
          question: "Differentiate y = x^3.",
          options: ["x^2", "2x", "3x^2", "3x"],
          answerIndex: 2,
          explanation: "Using the power rule, d/dx of x^3 is 3x^2.",
          tags: ["differentiation"]
        },
        {
          id: "M2-CAL-002",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 1,
          question: "Integrate 6x with respect to x.",
          options: ["6", "6x^2 + C", "3x^2 + C", "x^6 + C"],
          answerIndex: 2,
          explanation: "The integral of 6x is 3x^2 + C.",
          tags: ["integration"]
        },
        {
          id: "M2-CAL-003",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 1,
          question: "Differentiate y = ln x.",
          options: ["x", "1/x", "e^x", "ln x"],
          answerIndex: 1,
          explanation: "The derivative of ln x is 1/x.",
          tags: ["logarithmic differentiation"]
        },
        {
          id: "M2-ALG-001",
          subject: "maths2",
          topic: "Algebra",
          difficulty: 1,
          question: "Solve e^(2x) = e^6.",
          options: ["x = 2", "x = 3", "x = 6", "x = 12"],
          answerIndex: 1,
          explanation: "Since the bases are the same, 2x = 6, so x = 3.",
          tags: ["exponentials"]
        },
        {
          id: "M2-TRI-001",
          subject: "maths2",
          topic: "Trigonometry",
          difficulty: 2,
          question: "For 0 <= x < 2pi, how many solutions are there to sin x = 0?",
          options: ["1", "2", "3", "4"],
          answerIndex: 1,
          explanation: "In the interval 0 <= x < 2pi, sin x = 0 at x = 0 and x = pi.",
          tags: ["trigonometric equations"]
        },
        {
          id: "M2-TRI-002",
          subject: "maths2",
          topic: "Trigonometry",
          difficulty: 1,
          question: "Using the small-angle approximation in radians, sin 0.2 is approximately:",
          options: ["0.02", "0.1", "0.2", "2"],
          answerIndex: 2,
          explanation: "For small x in radians, sin x is approximately x.",
          tags: ["small angle approximation"]
        },
        {
          id: "M2-BIN-001",
          subject: "maths2",
          topic: "Binomial Expansion",
          difficulty: 2,
          question: "What is the coefficient of x^2 in the expansion of (1 + x)^5?",
          options: ["5", "10", "15", "20"],
          answerIndex: 1,
          explanation: "The coefficient of x^2 is 5 choose 2, which is 10.",
          tags: ["binomial expansion"]
        },
        {
          id: "M2-SEQ-001",
          subject: "maths2",
          topic: "Sequences and Series",
          difficulty: 1,
          question: "Find the sum 1 + 2 + 3 + ... + 20.",
          options: ["190", "200", "210", "220"],
          answerIndex: 2,
          explanation: "The sum is n(n + 1)/2 = 20 x 21 / 2 = 210.",
          tags: ["series"]
        },
        {
          id: "M2-VEC-001",
          subject: "maths2",
          topic: "Vectors",
          difficulty: 1,
          question: "Find the dot product of (2, 1) and (3, -4).",
          options: ["-2", "2", "6", "10"],
          answerIndex: 1,
          explanation: "The dot product is 2 x 3 + 1 x (-4) = 6 - 4 = 2.",
          tags: ["dot product"]
        },
        {
          id: "M2-VEC-002",
          subject: "maths2",
          topic: "Vectors",
          difficulty: 1,
          question: "Two non-zero vectors are perpendicular when their dot product is:",
          options: ["-1", "0", "1", "equal to their magnitudes"],
          answerIndex: 1,
          explanation: "Perpendicular vectors have dot product 0.",
          tags: ["perpendicular vectors"]
        },
        {
          id: "M2-VEC-003",
          subject: "maths2",
          topic: "Vectors",
          difficulty: 1,
          question: "What is the magnitude of the vector (3, 4)?",
          options: ["1", "5", "7", "12"],
          answerIndex: 1,
          explanation: "The magnitude is sqrt(3^2 + 4^2) = 5.",
          tags: ["vector magnitude"]
        },
        {
          id: "M2-CAL-004",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 1,
          question: "The velocity of a particle is v = t. What is the displacement from t = 0 to t = 4?",
          options: ["4", "8", "12", "16"],
          answerIndex: 1,
          explanation: "Displacement is the area under the velocity-time graph, integral of t from 0 to 4, which is 8.",
          tags: ["kinematics", "integration"]
        },
        {
          id: "M2-CAL-005",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 1,
          question: "Find the second derivative of y = x^4.",
          options: ["4x^3", "8x^2", "12x^2", "24x"],
          answerIndex: 2,
          explanation: "First derivative is 4x^3. Second derivative is 12x^2.",
          tags: ["second derivative"]
        },
        {
          id: "M2-CAL-006",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 1,
          question: "The curve y = (x - 2)^2 + 1 has a minimum point at:",
          options: ["(1, 2)", "(2, 1)", "(-2, 1)", "(2, -1)"],
          answerIndex: 1,
          explanation: "The completed square form shows the minimum is at x = 2 and y = 1.",
          tags: ["turning points"]
        },
        {
          id: "M2-SEQ-002",
          subject: "maths2",
          topic: "Sequences and Series",
          difficulty: 2,
          question: "An infinite geometric series has first term 6 and common ratio 1/3. What is its sum?",
          options: ["6", "8", "9", "18"],
          answerIndex: 2,
          explanation: "The sum to infinity is a/(1 - r) = 6/(1 - 1/3) = 9.",
          tags: ["geometric series"]
        },
        {
          id: "M2-ALG-002",
          subject: "maths2",
          topic: "Algebra",
          difficulty: 1,
          question: "Solve log10(x) = 2.",
          options: ["x = 2", "x = 10", "x = 20", "x = 100"],
          answerIndex: 3,
          explanation: "log10(x) = 2 means x = 10^2 = 100.",
          tags: ["logarithms"]
        },
        {
          id: "M2-CAL-007",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 2,
          question: "Differentiate y = x sin x.",
          options: ["cos x", "sin x + x cos x", "x cos x", "sin x - x cos x"],
          answerIndex: 1,
          explanation: "Using the product rule, d/dx of x sin x is sin x + x cos x.",
          tags: ["product rule"]
        },
        {
          id: "M2-CAL-008",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 2,
          question: "Differentiate y = (2x + 1)^5.",
          options: ["5(2x + 1)^4", "10(2x + 1)^4", "2(2x + 1)^4", "(2x + 1)^4"],
          answerIndex: 1,
          explanation: "Using the chain rule, multiply by the derivative of 2x + 1, giving 10(2x + 1)^4.",
          tags: ["chain rule"]
        },
        {
          id: "M2-CAL-009",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 1,
          question: "Integrate cos x with respect to x.",
          options: ["sin x + C", "-sin x + C", "tan x + C", "-cos x + C"],
          answerIndex: 0,
          explanation: "The derivative of sin x is cos x, so the integral of cos x is sin x + C.",
          tags: ["trig integration"]
        },
        {
          id: "M2-CAL-010",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 2,
          question: "A curve is given parametrically by x = t^2 and y = t^3. What is dy/dx?",
          options: ["3t/2", "2t/3", "3t^2", "2t"],
          answerIndex: 0,
          explanation: "dy/dt = 3t^2 and dx/dt = 2t, so dy/dx = 3t^2 / 2t = 3t/2.",
          tags: ["parametric differentiation"]
        },
        {
          id: "M2-CG-001",
          subject: "maths2",
          topic: "Coordinate Geometry",
          difficulty: 1,
          question: "A tangent has gradient 2. What is the gradient of the normal?",
          options: ["-2", "-1/2", "1/2", "2"],
          answerIndex: 1,
          explanation: "The normal is perpendicular to the tangent, so its gradient is the negative reciprocal, -1/2.",
          tags: ["normal gradient"]
        },
        {
          id: "M2-ALG-003",
          subject: "maths2",
          topic: "Algebra",
          difficulty: 2,
          question: "For x^2 + kx + 9 = 0 to have equal roots, what values can k take?",
          options: ["k = 3 or -3", "k = 6 or -6", "k = 9 or -9", "k = 0 only"],
          answerIndex: 1,
          explanation: "Equal roots require discriminant 0. k^2 - 36 = 0, so k = 6 or -6.",
          tags: ["discriminant"]
        },
        {
          id: "M2-TRI-003",
          subject: "maths2",
          topic: "Trigonometry",
          difficulty: 1,
          question: "180 degrees is equal to:",
          options: ["pi/2 radians", "pi radians", "2pi radians", "360 radians"],
          answerIndex: 1,
          explanation: "180 degrees equals pi radians.",
          tags: ["radians"]
        },
        {
          id: "M2-TRI-004",
          subject: "maths2",
          topic: "Trigonometry",
          difficulty: 2,
          question: "Find the area of a sector with radius 2 and angle pi/2 radians.",
          options: ["pi/2", "pi", "2pi", "4pi"],
          answerIndex: 1,
          explanation: "Sector area = 1/2 r^2 theta = 1/2 x 4 x pi/2 = pi.",
          tags: ["sector area"]
        },
        {
          id: "M2-CAL-011",
          subject: "maths2",
          topic: "Calculus",
          difficulty: 1,
          question: "If f'(a) = 0 and f''(a) > 0, then x = a is most likely a:",
          options: ["local maximum", "local minimum", "point of inflection only", "vertical asymptote"],
          answerIndex: 1,
          explanation: "A positive second derivative indicates the curve is concave up, so the stationary point is a local minimum.",
          tags: ["second derivative test"]
        },
        {
          id: "M2-VEC-004",
          subject: "maths2",
          topic: "Vectors",
          difficulty: 1,
          question: "Calculate (1, 2) + 3(2, -1).",
          options: ["(3, 1)", "(6, -3)", "(7, -1)", "(7, 5)"],
          answerIndex: 2,
          explanation: "3(2, -1) = (6, -3). Adding (1, 2) gives (7, -1).",
          tags: ["vector arithmetic"]
        },
        {
          id: "M2-ALG-004",
          subject: "maths2",
          topic: "Algebra",
          difficulty: 1,
          question: "Simplify ln(e^5).",
          options: ["1", "5", "e", "5e"],
          answerIndex: 1,
          explanation: "ln and e are inverse functions, so ln(e^5) = 5.",
          tags: ["logarithms"]
        }
      ]
    },

    physics: {
      label: "Physics",
      shortLabel: "PHY",
      description: "Mechanics, electricity, waves, materials, nuclear physics and core physical reasoning.",
      questions: [
        {
          id: "PHY-MEC-001",
          subject: "physics",
          topic: "Mechanics",
          difficulty: 1,
          question: "A resultant force of 6 N acts on a mass of 2 kg. What is its acceleration?",
          options: ["2 m s^-2", "3 m s^-2", "6 m s^-2", "12 m s^-2"],
          answerIndex: 1,
          explanation: "Using F = ma, a = F/m = 6/2 = 3 m s^-2.",
          tags: ["Newton's second law"]
        },
        {
          id: "PHY-MEC-002",
          subject: "physics",
          topic: "Mechanics",
          difficulty: 1,
          question: "What is the weight of a 5 kg object when g = 9.8 N kg^-1?",
          options: ["4.9 N", "9.8 N", "49 N", "98 N"],
          answerIndex: 2,
          explanation: "Weight = mg = 5 x 9.8 = 49 N.",
          tags: ["weight"]
        },
        {
          id: "PHY-MEC-003",
          subject: "physics",
          topic: "Mechanics",
          difficulty: 1,
          question: "A 0.5 kg object moves at 4 m s^-1. What is its momentum?",
          options: ["0.5 kg m s^-1", "2 kg m s^-1", "4 kg m s^-1", "8 kg m s^-1"],
          answerIndex: 1,
          explanation: "Momentum = mv = 0.5 x 4 = 2 kg m s^-1.",
          tags: ["momentum"]
        },
        {
          id: "PHY-MEC-004",
          subject: "physics",
          topic: "Mechanics",
          difficulty: 1,
          question: "A 2 kg object moves at 3 m s^-1. What is its kinetic energy?",
          options: ["3 J", "6 J", "9 J", "18 J"],
          answerIndex: 2,
          explanation: "Kinetic energy = 1/2 mv^2 = 1/2 x 2 x 3^2 = 9 J.",
          tags: ["kinetic energy"]
        },
        {
          id: "PHY-ENE-001",
          subject: "physics",
          topic: "Energy",
          difficulty: 1,
          question: "100 J of energy is transferred in 5 s. What is the power?",
          options: ["5 W", "10 W", "20 W", "500 W"],
          answerIndex: 2,
          explanation: "Power = energy/time = 100/5 = 20 W.",
          tags: ["power"]
        },
        {
          id: "PHY-ELE-001",
          subject: "physics",
          topic: "Electricity",
          difficulty: 1,
          question: "10 C of charge passes a point in 2 s. What is the current?",
          options: ["2 A", "5 A", "10 A", "20 A"],
          answerIndex: 1,
          explanation: "Current = charge/time = 10/2 = 5 A.",
          tags: ["current"]
        },
        {
          id: "PHY-ELE-002",
          subject: "physics",
          topic: "Electricity",
          difficulty: 1,
          question: "A current of 3 A flows through a 4 ohm resistor. What is the potential difference?",
          options: ["1.3 V", "7 V", "12 V", "24 V"],
          answerIndex: 2,
          explanation: "Using V = IR, V = 3 x 4 = 12 V.",
          tags: ["Ohm's law"]
        },
        {
          id: "PHY-ELE-003",
          subject: "physics",
          topic: "Electricity",
          difficulty: 1,
          question: "Two resistors of 2 ohm and 3 ohm are connected in series. What is the total resistance?",
          options: ["1 ohm", "5 ohm", "6 ohm", "12 ohm"],
          answerIndex: 1,
          explanation: "For series resistors, total resistance is the sum: 2 + 3 = 5 ohm.",
          tags: ["series circuits"]
        },
        {
          id: "PHY-ELE-004",
          subject: "physics",
          topic: "Electricity",
          difficulty: 2,
          question: "A 6 ohm resistor and a 3 ohm resistor are connected in parallel. What is the total resistance?",
          options: ["2 ohm", "3 ohm", "6 ohm", "9 ohm"],
          answerIndex: 0,
          explanation: "1/R = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2, so R = 2 ohm.",
          tags: ["parallel circuits"]
        },
        {
          id: "PHY-ELE-005",
          subject: "physics",
          topic: "Electricity",
          difficulty: 1,
          question: "A charge of 2 C moves through a potential difference of 5 V. How much energy is transferred?",
          options: ["2.5 J", "5 J", "7 J", "10 J"],
          answerIndex: 3,
          explanation: "Energy transferred = QV = 2 x 5 = 10 J.",
          tags: ["electrical energy"]
        },
        {
          id: "PHY-WAV-001",
          subject: "physics",
          topic: "Waves",
          difficulty: 1,
          question: "A wave has frequency 50 Hz and wavelength 0.40 m. What is its speed?",
          options: ["20 m s^-1", "50 m s^-1", "125 m s^-1", "200 m s^-1"],
          answerIndex: 0,
          explanation: "Wave speed = frequency x wavelength = 50 x 0.40 = 20 m s^-1.",
          tags: ["wave speed"]
        },
        {
          id: "PHY-WAV-002",
          subject: "physics",
          topic: "Waves",
          difficulty: 1,
          question: "A wave has frequency 5 Hz. What is its period?",
          options: ["0.2 s", "1 s", "2 s", "5 s"],
          answerIndex: 0,
          explanation: "Period T = 1/f = 1/5 = 0.2 s.",
          tags: ["period"]
        },
        {
          id: "PHY-MAT-001",
          subject: "physics",
          topic: "Materials",
          difficulty: 1,
          question: "An object has mass 200 g and volume 50 cm^3. What is its density?",
          options: ["2 g cm^-3", "4 g cm^-3", "50 g cm^-3", "250 g cm^-3"],
          answerIndex: 1,
          explanation: "Density = mass/volume = 200/50 = 4 g cm^-3.",
          tags: ["density"]
        },
        {
          id: "PHY-MEC-005",
          subject: "physics",
          topic: "Mechanics",
          difficulty: 1,
          question: "A force of 100 N acts over an area of 2 m^2. What is the pressure?",
          options: ["20 Pa", "50 Pa", "100 Pa", "200 Pa"],
          answerIndex: 1,
          explanation: "Pressure = force/area = 100/2 = 50 Pa.",
          tags: ["pressure"]
        },
        {
          id: "PHY-MAT-002",
          subject: "physics",
          topic: "Materials",
          difficulty: 1,
          question: "A spring has spring constant 100 N m^-1 and extension 0.020 m. What is the force?",
          options: ["0.2 N", "2 N", "20 N", "200 N"],
          answerIndex: 1,
          explanation: "Using F = kx, F = 100 x 0.020 = 2 N.",
          tags: ["Hooke's law"]
        },
        {
          id: "PHY-ENE-002",
          subject: "physics",
          topic: "Energy",
          difficulty: 1,
          question: "A 2 kg object is lifted by 3 m. Take g = 10 N kg^-1. What is the gain in gravitational potential energy?",
          options: ["6 J", "15 J", "30 J", "60 J"],
          answerIndex: 3,
          explanation: "Gain in GPE = mgh = 2 x 10 x 3 = 60 J.",
          tags: ["gravitational potential energy"]
        },
        {
          id: "PHY-ENE-003",
          subject: "physics",
          topic: "Energy",
          difficulty: 1,
          question: "A device transfers 60 J of energy, of which 30 J is useful. What is its efficiency?",
          options: ["25%", "50%", "75%", "200%"],
          answerIndex: 1,
          explanation: "Efficiency = useful output / total input = 30/60 = 0.5 = 50%.",
          tags: ["efficiency"]
        },
        {
          id: "PHY-WAV-003",
          subject: "physics",
          topic: "Waves",
          difficulty: 1,
          question: "When a light ray enters a more optically dense medium, it generally bends:",
          options: ["away from the normal", "towards the normal", "parallel to the surface", "back along its original path"],
          answerIndex: 1,
          explanation: "When light slows down entering a more optically dense medium, it bends towards the normal.",
          tags: ["refraction"]
        },
        {
          id: "PHY-NUC-001",
          subject: "physics",
          topic: "Nuclear Physics",
          difficulty: 1,
          question: "What is the charge of an alpha particle?",
          options: ["-1e", "0", "+1e", "+2e"],
          answerIndex: 3,
          explanation: "An alpha particle is a helium nucleus with charge +2e.",
          tags: ["alpha radiation"]
        },
        {
          id: "PHY-NUC-002",
          subject: "physics",
          topic: "Nuclear Physics",
          difficulty: 1,
          question: "In beta-minus decay, the emitted particle is:",
          options: ["an electron", "a proton", "a neutron", "an alpha particle"],
          answerIndex: 0,
          explanation: "Beta-minus radiation is the emission of an electron.",
          tags: ["beta decay"]
        },
        {
          id: "PHY-NUC-003",
          subject: "physics",
          topic: "Nuclear Physics",
          difficulty: 1,
          question: "After two half-lives, what fraction of the original radioactive nuclei remains?",
          options: ["1/2", "1/3", "1/4", "1/8"],
          answerIndex: 2,
          explanation: "After one half-life, 1/2 remains. After two half-lives, 1/4 remains.",
          tags: ["half-life"]
        },
        {
          id: "PHY-FLD-001",
          subject: "physics",
          topic: "Fields",
          difficulty: 1,
          question: "The magnetic force on a current-carrying wire is maximum when the current is:",
          options: ["parallel to the field", "perpendicular to the field", "zero", "opposite to the field but still parallel"],
          answerIndex: 1,
          explanation: "The magnetic force is maximum when the current is perpendicular to the magnetic field.",
          tags: ["magnetic force"]
        },
        {
          id: "PHY-ELE-006",
          subject: "physics",
          topic: "Electricity",
          difficulty: 2,
          question: "A transformer has 50 turns on the primary coil and 100 turns on the secondary coil. If the primary voltage is 10 V, what is the secondary voltage?",
          options: ["5 V", "10 V", "20 V", "100 V"],
          answerIndex: 2,
          explanation: "Vs/Vp = Ns/Np = 100/50 = 2, so Vs = 20 V.",
          tags: ["transformers"]
        },
        {
          id: "PHY-ELE-007",
          subject: "physics",
          topic: "Electricity",
          difficulty: 1,
          question: "A capacitor stores 6 C of charge at 3 V. What is its capacitance?",
          options: ["0.5 F", "2 F", "9 F", "18 F"],
          answerIndex: 1,
          explanation: "Capacitance C = Q/V = 6/3 = 2 F.",
          tags: ["capacitance"]
        },
        {
          id: "PHY-ELE-008",
          subject: "physics",
          topic: "Electricity",
          difficulty: 2,
          question: "A resistor of 1000 ohm is connected to a capacitor of 0.002 F. What is the time constant?",
          options: ["0.002 s", "0.5 s", "2 s", "2000 s"],
          answerIndex: 2,
          explanation: "Time constant = RC = 1000 x 0.002 = 2 s.",
          tags: ["capacitors"]
        },
        {
          id: "PHY-NUC-004",
          subject: "physics",
          topic: "Nuclear Physics",
          difficulty: 1,
          question: "Nuclear fission is best described as:",
          options: ["two light nuclei joining", "a heavy nucleus splitting", "an electron changing energy level", "a substance becoming ionised"],
          answerIndex: 1,
          explanation: "Fission is the splitting of a heavy nucleus into smaller nuclei.",
          tags: ["fission"]
        },
        {
          id: "PHY-ELE-009",
          subject: "physics",
          topic: "Electricity",
          difficulty: 1,
          question: "The unit ohm is equivalent to:",
          options: ["A/V", "V/A", "C/s", "J/s"],
          answerIndex: 1,
          explanation: "Resistance R = V/I, so the ohm is equivalent to V/A.",
          tags: ["units"]
        }
      ]
    }
  }
};
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
          "id": "TEST-M1-001",
          "subject": "maths1",
          "topicCode": "M4",
          "topic": "Algebra",
          "question": "What is 2^{2}+3?",
          "options": [
            "5",
            "6",
            "7",
            "8",
            "9"
          ],
          "answerIndex": 2,
          "explanation": "2^{2}=4, so 4+3=7.",
          "difficulty": 1,
          "quickestMethod": "Calculate 2^{2}=4 first, then add 3.",
          "commonTrap": "Choosing 5 because the power is ignored.",
          "tags": [
            "algebra",
            "powers"
          ],
          "status": "ready",
          "source": {
            "exam": "Generated",
            "year": "2026",
            "paper": "Sample",
            "questionNumber": "1",
            "originalReference": "Generated Sample Q1"
          }
        },
        {
          "id": "ENGAA-2016-S1-Q01",
          "subject": "maths1",
          "topicCode": "M4 Algebra",
          "topic": "Algebra",
          "question": "Find the complete set of solutions to -8 < 6 - x/2.",
          "options": [
            "x < 4",
            "x > 4",
            "x < 20",
            "x > 20",
            "x < 28"
          ],
          "answerIndex": 4,
          "explanation": "Start with -8 < 6 - x/2. Subtract 6 from both sides to get -14 < -x/2. Multiply both sides by -2 and reverse the inequality sign, giving 28 > x. Therefore x < 28.",
          "difficulty": 1,
          "quickestMethod": "Subtract 6, then multiply by -2 and remember to flip the inequality sign.",
          "commonTrap": "Forgetting to reverse the inequality sign when multiplying by a negative number.",
          "tags": [
            "algebra",
            "inequalities",
            "rearranging",
            "original-options-remapped"
          ],
          "status": "extracted",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "Section 1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "Q01",
            "originalReference": "ENGAA 2016 Section 1 Q1"
          }
        },
        {
          "id": "ENGAA-2016-S1-Q03",
          "subject": "maths1",
          "topicCode": "M4 Algebra",
          "topic": "Algebra",
          "question": "Which one of the following is a simplification of (√3 - √2)^2?",
          "options": [
            "1 - 2√3√2",
            "5 - 2√2√3",
            "2√3 - 2√2",
            "1",
            "5 - √2√3"
          ],
          "answerIndex": 1,
          "explanation": "Use (a - b)^2 = a^2 - 2ab + b^2. Here a = √3 and b = √2, so (√3 - √2)^2 = 3 - 2√6 + 2 = 5 - 2√6. Since √6 = √2√3, this is 5 - 2√2√3.",
          "difficulty": 2,
          "quickestMethod": "Square the two surds separately, then subtract twice their product.",
          "commonTrap": "Expanding as 3 - 2 only, or forgetting the middle term -2√3√2.",
          "tags": [
            "surds",
            "algebra",
            "expanding brackets"
          ],
          "status": "extracted",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "Section 1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "Q03",
            "originalReference": "ENGAA 2016 Section 1 Q3"
          }
        },
        {
          "id": "ENGAA-2016-S1-Q05",
          "subject": "maths1",
          "topicCode": "M3 Ratio and proportion",
          "topic": "Ratio and proportion",
          "question": "The ratio of Q:R is 5:2 and the ratio of R:S is 3:10. Which one gives the ratio Q:S in its simplest form?",
          "options": [
            "1:2",
            "2:1",
            "3:4",
            "3:25",
            "4:3"
          ],
          "answerIndex": 2,
          "explanation": "Make the R parts the same. Q:R = 5:2, so multiply by 3 to get Q:R = 15:6. R:S = 3:10, so multiply by 2 to get R:S = 6:20. Therefore Q:S = 15:20, which simplifies to 3:4.",
          "difficulty": 2,
          "quickestMethod": "Match the middle quantity R using LCM of 2 and 3, then compare Q with S.",
          "commonTrap": "Directly comparing 5 with 10 and ignoring that the two R values are not the same.",
          "tags": [
            "ratio",
            "proportion",
            "equivalent ratios",
            "original-options-remapped"
          ],
          "status": "extracted",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "Section 1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "Q05",
            "originalReference": "ENGAA 2016 Section 1 Q5"
          }
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
          "id": "TEST-P-001",
          "subject": "physics",
          "topicCode": "P2",
          "topic": "Waves",
          "question": "A wave has frequency 12 Hz and wavelength \\lambda = 0.50 m. What is its speed?",
          "options": [
            "0.042 m s^{-1}",
            "6.0 m s^{-1}",
            "12 m s^{-1}",
            "24 m s^{-1}",
            "60 m s^{-1}"
          ],
          "answerIndex": 1,
          "explanation": "Use v=f\\lambda. So v=12\\times0.50=6.0 m s^{-1}.",
          "difficulty": 3,
          "quickestMethod": "Use v=f\\lambda directly.",
          "commonTrap": "Using f/\\lambda instead of f\\lambda.",
          "tags": [
            "waves",
            "speed"
          ],
          "status": "ready",
          "source": {
            "exam": "Generated",
            "year": "2026",
            "paper": "Sample",
            "questionNumber": "2",
            "originalReference": "Generated Sample Q2"
          }
        },
        {
          "id": "TEST-P-IMG-001",
          "subject": "physics",
          "topicCode": "P4",
          "topic": "Electricity",
          "question": "The diagram shows a circuit. What is the resistance?",
          "options": [
            "1 \\Omega",
            "2 \\Omega",
            "3 \\Omega",
            "4 \\Omega",
            "5 \\Omega"
          ],
          "answerIndex": 3,
          "explanation": "Use R=V/I. Substitute the values from the diagram.",
          "difficulty": 4,
          "quickestMethod": "Use R=V/I directly.",
          "commonTrap": "Confusing current and voltage.",
          "tags": [
            "circuits",
            "resistance"
          ],
          "status": "ready",
          "source": {
            "exam": "Generated",
            "year": "2026",
            "paper": "Sample",
            "questionNumber": "3",
            "originalReference": "Generated Sample Q3"
          },
          "image": {
            "alt": "Simple circuit diagram with a cell and resistor"
          }
        },
        {
          "id": "ENGAA-2016-S1-Q02",
          "subject": "physics",
          "topicCode": "P6 Particles and radiation",
          "topic": "Particles and radiation",
          "question": "A nuclide Pb-214 with proton number 82 changes by radioactive decay into Pb-210 with proton number 82. Which combination of emissions produces this change?",
          "options": [
            "3 alpha",
            "2 alpha and 1 beta",
            "2 alpha and 2 beta",
            "1 alpha and 2 beta",
            "3 beta"
          ],
          "answerIndex": 3,
          "explanation": "The mass number decreases from 214 to 210, so the total change in mass number is -4. One alpha emission reduces mass number by 4 and proton number by 2, giving proton number 80. To return to proton number 82, two beta-minus emissions are needed, each increasing proton number by 1. Therefore the change is 1 alpha and 2 beta.",
          "difficulty": 2,
          "quickestMethod": "Use mass number first: -4 means one alpha. Then fix proton number: alpha makes Z drop by 2, so two beta-minus emissions bring Z back up by 2.",
          "commonTrap": "Thinking beta decay changes the mass number, or forgetting that alpha changes both mass number and proton number.",
          "tags": [
            "radioactivity",
            "alpha decay",
            "beta decay",
            "nuclides"
          ],
          "status": "extracted",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "Section 1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "Q02",
            "originalReference": "ENGAA 2016 Section 1 Q2"
          }
        },
        {
          "id": "ENGAA-2016-S1-Q04",
          "subject": "physics",
          "topicCode": "P1 Mechanics",
          "topic": "Mechanics",
          "question": "The graph shown of quantity y against quantity x represents the motion of a body. The straight-line graph passes through the origin and through x = 2.0, y = 10, so its gradient is 5. The scales are in appropriate SI units and g = 10 N kg^-1. Which two could the graph represent? 1 kinetic energy against velocity for a 10 kg object in free fall; 2 potential energy against height for a 20 kg object being lifted by a constant external force; 3 velocity against time for a 20 kg object accelerated by a resultant force of 100 N; 4 work done by a 5 N external force against distance moved at constant speed in the direction of the force.",
          "options": [
            "1 and 2",
            "1 and 3",
            "1 and 4",
            "2 and 3",
            "3 and 4"
          ],
          "answerIndex": 4,
          "explanation": "The graph is a straight line through the origin with gradient 10/2 = 5. Statement 3 works because F = ma gives a = 100/20 = 5 m s^-2, so velocity against time is v = 5t. Statement 4 works because work done W = Fd = 5d, so the work-distance graph has gradient 5. Statement 1 is not correct because kinetic energy against velocity is KE = 1/2 mv^2, so it is quadratic, not linear. Statement 2 is not correct because gravitational potential energy against height has gradient mg = 20 × 10 = 200, not 5.",
          "difficulty": 3,
          "quickestMethod": "Find the graph gradient first: gradient = 5. Then match only relationships with y = 5x.",
          "commonTrap": "Choosing any linear-looking physics relationship without checking the numerical gradient.",
          "tags": [
            "graphs",
            "mechanics",
            "force",
            "acceleration",
            "work done",
            "original-options-remapped"
          ],
          "status": "extracted",
          "source": {
            "exam": "ENGAA",
            "year": "2016",
            "paper": "Section 1",
            "section": "Part A Mathematics and Physics",
            "questionNumber": "Q04",
            "originalReference": "ENGAA 2016 Section 1 Q4"
          },
          "image": {
            "alt": "imageNeeded=yes; straight-line graph of y against x through the origin, passing through x = 2.0 and y = 10, with dashed guide lines to those values."
          }
        }
      ]
    }
  }
};
