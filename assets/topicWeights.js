/*
  Topic Weights
  --------------------------------
  These weights are used by the homepage and can later be used by exam.js
  to select a balanced set of questions.

  The numbers do not need to be perfect, but each subject should ideally
  total 100.
*/

window.ESAT_TOPIC_WEIGHTS = {
  version: "1.0.0",

  questionModes: {
    10: {
      label: "10 questions",
      description: "Short diagnostic practice",
      recommendedUse: "Best for warm-up practice or checking one sitting quickly."
    },
    20: {
      label: "20 questions",
      description: "Half-length training set",
      recommendedUse: "Best for targeted revision or timed homework."
    },
    27: {
      label: "27 questions",
      description: "Full ESAT-style module length",
      recommendedUse: "Best for realistic exam practice."
    }
  },

  paceModes: {
    exam: {
      label: "Exam pace",
      description: "Uses a realistic ESAT-style pace.",
      secondsPerQuestion: 89,
      isTimed: true
    },
    relaxed: {
      label: "Relaxed pace",
      description: "Gives extra thinking time while keeping a timer.",
      secondsPerQuestion: 150,
      isTimed: true
    },
    untimed: {
      label: "Untimed",
      description: "No countdown timer. Useful for learning and review.",
      secondsPerQuestion: null,
      isTimed: false
    }
  },

  subjects: {
    maths1: {
      label: "Maths 1",
      shortLabel: "M1",
      topicOrder: [
        "Algebra",
        "Functions",
        "Coordinate Geometry",
        "Sequences",
        "Trigonometry",
        "Geometry",
        "Probability",
        "Number",
        "Data",
        "Basic Calculus"
      ],
      weights: {
        Algebra: 24,
        Functions: 10,
        "Coordinate Geometry": 12,
        Sequences: 8,
        Trigonometry: 10,
        Geometry: 10,
        Probability: 8,
        Number: 8,
        Data: 4,
        "Basic Calculus": 6
      }
    },

    maths2: {
      label: "Maths 2",
      shortLabel: "M2",
      topicOrder: [
        "Calculus",
        "Algebra",
        "Trigonometry",
        "Vectors",
        "Sequences and Series",
        "Binomial Expansion",
        "Coordinate Geometry"
      ],
      weights: {
        Calculus: 34,
        Algebra: 18,
        Trigonometry: 16,
        Vectors: 12,
        "Sequences and Series": 8,
        "Binomial Expansion": 6,
        "Coordinate Geometry": 6
      }
    },

    physics: {
      label: "Physics",
      shortLabel: "PHY",
      topicOrder: [
        "Mechanics",
        "Electricity",
        "Waves",
        "Energy",
        "Materials",
        "Nuclear Physics",
        "Fields"
      ],
      weights: {
        Mechanics: 20,
        Electricity: 28,
        Waves: 12,
        Energy: 12,
        Materials: 8,
        "Nuclear Physics": 14,
        Fields: 6
      }
    }
  }
};