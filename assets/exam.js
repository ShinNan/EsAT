(function () {
  "use strict";

  var CONFIG_KEY = "esatSimulator.config";
  var ACTIVE_EXAM_KEY = "esatSimulator.activeExam";
  var LATEST_RESULT_KEY = "esatSimulator.latestResult";
  var WRONG_QUESTIONS_KEY = "esatSimulator.wrongQuestions";
  var OPTION_LABELS = ["A", "B", "C", "D", "E"];

  var state = {
    config: null,
    paper: [],
    currentIndex: 0,
    selectedAnswers: [],
    flagged: [],
    startedAt: 0,
    totalPausedMs: 0,
    pauseStartedAt: 0,
    isPaused: false,
    isFinished: false,
    timerId: null
  };

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function safeJSONParse(text, fallback) {
    try {
      return text ? JSON.parse(text) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function loadJSON(key, fallback) {
    try {
      return safeJSONParse(window.localStorage.getItem(key), fallback);
    } catch (error) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Unable to save localStorage key:", key, error);
      return false;
    }
  }

  function removeStorageItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn("Unable to remove localStorage key:", key, error);
    }
  }

  function getBank() {
    return window.ESAT_QUESTION_BANK || null;
  }

  function getWeights() {
    return window.ESAT_TOPIC_WEIGHTS || null;
  }

  function getSubject(subjectKey) {
    var bank = getBank();
    if (!bank || !bank.subjects) return null;
    return bank.subjects[subjectKey] || null;
  }

  function getSubjectLabel(subjectKey) {
    var subject = getSubject(subjectKey);
    return subject && subject.label ? subject.label : subjectKey;
  }

  function getSubjectQuestions(subjectKey) {
    var subject = getSubject(subjectKey);
    if (!subject || !Array.isArray(subject.questions)) return [];
    return subject.questions;
  }

  function normaliseConfig(rawConfig) {
    var bank = getBank();
    var weights = getWeights();
    var availableSubjects;
    var selectedSubjects;
    var questionCount;
    var pace;
    var paceModes;
    var paceDetails;
    var durationSeconds;

    if (!bank || !bank.subjects) return null;

    availableSubjects = Object.keys(bank.subjects);
    selectedSubjects = [];

    if (rawConfig && Array.isArray(rawConfig.selectedSubjects)) {
      rawConfig.selectedSubjects.forEach(function (subjectKey) {
        if (availableSubjects.indexOf(subjectKey) !== -1) {
          selectedSubjects.push(subjectKey);
        }
      });
    }

    if (selectedSubjects.length === 0 && availableSubjects.indexOf("maths1") !== -1) {
      selectedSubjects.push("maths1");
    }

    questionCount = Number(rawConfig && rawConfig.questionCount);
    if ([10, 20, 27].indexOf(questionCount) === -1) questionCount = 10;

    pace = rawConfig && rawConfig.pace ? rawConfig.pace : "exam";
    paceModes = weights && weights.paceModes ? weights.paceModes : {};
    paceDetails = paceModes[pace];

    if (!paceDetails) {
      pace = "exam";
      paceDetails = paceModes.exam || {
        label: "Exam pace",
        secondsPerQuestion: 89,
        isTimed: true
      };
    }

    durationSeconds = null;
    if (paceDetails.isTimed && paceDetails.secondsPerQuestion) {
      durationSeconds = questionCount * Number(paceDetails.secondsPerQuestion);
    }

    return {
      version: "1.0.0",
      selectedSubjects: selectedSubjects,
      questionCount: questionCount,
      pace: pace,
      paceLabel: paceDetails.label || pace,
      isTimed: Boolean(paceDetails.isTimed),
      durationSeconds: durationSeconds,
      shuffleQuestions: rawConfig && typeof rawConfig.shuffleQuestions === "boolean" ? rawConfig.shuffleQuestions : true,
      shuffleOptions: rawConfig && typeof rawConfig.shuffleOptions === "boolean" ? rawConfig.shuffleOptions : false,
      createdAt: new Date().toISOString()
    };
  }

  function shuffle(items) {
    var copy = items.slice();
    var i;
    var j;
    var temp;

    for (i = copy.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }

    return copy;
  }

  function sumNumbers(items, getter) {
    var total = 0;
    items.forEach(function (item) {
      total += getter(item);
    });
    return total;
  }

  function createBuckets(selectedSubjects) {
    var weights = getWeights();
    var buckets = [];

    selectedSubjects.forEach(function (subjectKey) {
      var questions = getSubjectQuestions(subjectKey);
      var weightData = weights && weights.subjects ? weights.subjects[subjectKey] : null;
      var topicNames = [];
      var topicSeen = {};

      if (weightData && Array.isArray(weightData.topicOrder)) {
        topicNames = weightData.topicOrder.slice();
      }

      questions.forEach(function (question) {
        var topic = question.topic || "Uncategorised";
        if (!topicSeen[topic]) {
          topicSeen[topic] = true;
          if (topicNames.indexOf(topic) === -1) topicNames.push(topic);
        }
      });

      topicNames.forEach(function (topic) {
        var topicQuestions = questions.filter(function (question) {
          return (question.topic || "Uncategorised") === topic;
        });

        if (topicQuestions.length > 0) {
          buckets.push({
            subject: subjectKey,
            topic: topic,
            weight: weightData && weightData.weights && weightData.weights[topic] ? Number(weightData.weights[topic]) : 1,
            questions: topicQuestions
          });
        }
      });
    });

    return buckets;
  }

  function allocateTargets(totalQuestions, buckets) {
    var totalWeight = sumNumbers(buckets, function (bucket) {
      return bucket.weight > 0 ? bucket.weight : 0;
    });
    var allocations = [];
    var allocated = 0;
    var sorted;

    if (totalWeight <= 0) totalWeight = buckets.length || 1;

    buckets.forEach(function (bucket, index) {
      var rawTarget = totalQuestions * ((bucket.weight > 0 ? bucket.weight : 1) / totalWeight);
      var baseTarget = Math.floor(rawTarget);

      allocations.push({
        index: index,
        target: baseTarget,
        remainder: rawTarget - baseTarget
      });
      allocated += baseTarget;
    });

    sorted = allocations.slice().sort(function (a, b) {
      return b.remainder - a.remainder;
    });

    sorted.forEach(function (item) {
      if (allocated < totalQuestions) {
        allocations[item.index].target += 1;
        allocated += 1;
      }
    });

    return allocations.map(function (item) {
      return item.target;
    });
  }

  function selectRawQuestions(config) {
    var buckets = createBuckets(config.selectedSubjects);
    var targets = allocateTargets(config.questionCount, buckets);
    var selected = [];
    var selectedIds = {};
    var fillPool = [];
    var allUnique = [];
    var allIds = {};

    buckets.forEach(function (bucket) {
      bucket.questions.forEach(function (question) {
        if (!allIds[question.id]) {
          allIds[question.id] = true;
          allUnique.push(question);
        }
      });
    });

    if (allUnique.length === 0) return [];

    buckets.forEach(function (bucket, bucketIndex) {
      var bucketQuestions = shuffle(bucket.questions);
      var target = targets[bucketIndex];

      bucketQuestions.forEach(function (question, index) {
        if (index < target && !selectedIds[question.id]) {
          selected.push(question);
          selectedIds[question.id] = true;
        }
      });
    });

    allUnique.forEach(function (question) {
      if (!selectedIds[question.id]) fillPool.push(question);
    });

    fillPool = shuffle(fillPool);
    while (selected.length < config.questionCount && fillPool.length > 0) {
      selected.push(fillPool.shift());
    }

    if (selected.length < config.questionCount) {
      fillPool = shuffle(allUnique);
      while (selected.length < config.questionCount) {
        selected.push(fillPool[selected.length % fillPool.length]);
        if (selected.length % fillPool.length === 0) fillPool = shuffle(allUnique);
      }
    }

    if (config.shuffleQuestions) selected = shuffle(selected);
    return selected.slice(0, config.questionCount);
  }

  function normaliseQuestion(question, occurrence, config) {
    var options = Array.isArray(question.options) ? question.options.slice() : [];
    var answerIndex = Number(question.answerIndex);
    var optionObjects;
    var newAnswerIndex;

    if (answerIndex < 0 || answerIndex >= options.length || isNaN(answerIndex)) {
      answerIndex = 0;
    }

    if (options.length === 0) {
      options = ["Option A", "Option B", "Option C", "Option D", "Option E"];
      answerIndex = 0;
    }

    if (options.length > 5) {
      options = options.slice(0, 5);
      if (answerIndex > 4) answerIndex = 4;
    }

    while (options.length < 5) {
      options.push("None of the above");
    }

    optionObjects = options.map(function (text, index) {
      return {
        text: String(text),
        correct: index === answerIndex
      };
    });

    if (config.shuffleOptions) optionObjects = shuffle(optionObjects);

    newAnswerIndex = 0;
    optionObjects.forEach(function (option, index) {
      if (option.correct) newAnswerIndex = index;
    });

    return {
      instanceId: question.id + "::" + occurrence,
      originalId: question.id,
      subject: question.subject,
      subjectLabel: getSubjectLabel(question.subject),
      topic: question.topic || "Uncategorised",
      difficulty: question.difficulty || 1,
      question: question.question || "",
      options: optionObjects.map(function (option) { return option.text; }),
      answerIndex: newAnswerIndex,
      explanation: question.explanation || "",
      tags: Array.isArray(question.tags) ? question.tags.slice() : []
    };
  }

  function generatePaper(config) {
    var rawQuestions = selectRawQuestions(config);
    var occurrences = {};

    return rawQuestions.map(function (question) {
      occurrences[question.id] = (occurrences[question.id] || 0) + 1;
      return normaliseQuestion(question, occurrences[question.id], config);
    });
  }

  function showError(message) {
    var errorBox = $("#examError");
    var errorText = $("#examErrorText");
    var examInterface = $("#examInterface");
    var title = $("#examModuleTitle");

    if (errorText) errorText.textContent = message;
    if (errorBox) errorBox.hidden = false;
    if (examInterface) examInterface.hidden = true;
    if (title) title.textContent = "Exam not loaded";
  }

  function showExam() {
    var errorBox = $("#examError");
    var examInterface = $("#examInterface");

    if (errorBox) errorBox.hidden = true;
    if (examInterface) examInterface.hidden = false;
  }

  function formatTime(seconds) {
    var value = Math.max(0, Math.floor(Number(seconds) || 0));
    var hours = Math.floor(value / 3600);
    var minutes = Math.floor((value % 3600) / 60);
    var secs = value % 60;
    var mm = minutes < 10 ? "0" + minutes : String(minutes);
    var ss = secs < 10 ? "0" + secs : String(secs);

    if (hours > 0) return String(hours) + ":" + mm + ":" + ss;
    return mm + ":" + ss;
  }

  function activeElapsedMs(now) {
    var current = now || Date.now();
    var currentPause = state.isPaused && state.pauseStartedAt ? current - state.pauseStartedAt : 0;
    return Math.max(0, current - state.startedAt - state.totalPausedMs - currentPause);
  }

  function timeUsedSeconds() {
    return Math.floor(activeElapsedMs(Date.now()) / 1000);
  }

  function timeRemainingSeconds() {
    if (!state.config || !state.config.isTimed || state.config.durationSeconds === null) return null;
    return Math.max(0, state.config.durationSeconds - timeUsedSeconds());
  }

  function answeredCount() {
    var count = 0;
    state.selectedAnswers.forEach(function (answer) {
      if (answer !== null && answer !== undefined) count += 1;
    });
    return count;
  }

  function flaggedCount() {
    var count = 0;
    state.flagged.forEach(function (item) {
      if (item) count += 1;
    });
    return count;
  }

  function updateTimer() {
    var display = $("#timerDisplay");
    var pill = $("#timerPill");
    var remaining = timeRemainingSeconds();

    if (!display || !pill) return;

    pill.classList.remove("warning");
    pill.classList.remove("danger");

    if (remaining === null) {
      display.textContent = formatTime(timeUsedSeconds()) + " used";
      return;
    }

    display.textContent = formatTime(remaining);

    if (remaining <= 60) {
      pill.classList.add("danger");
    } else if (remaining <= 300) {
      pill.classList.add("warning");
    }

    if (remaining <= 0 && !state.isFinished) {
      finishExam(true);
    }
  }

  function updateTopStats() {
    var answered = $("#answeredCount");
    var flagged = $("#flaggedCount");

    if (answered) answered.textContent = answeredCount() + " / " + state.paper.length;
    if (flagged) flagged.textContent = String(flaggedCount());
  }

  function examTitle() {
    var names = state.config.selectedSubjects.map(getSubjectLabel);
    return names.join(", ") + " · " + state.config.questionCount + " questions · " + state.config.paceLabel;
  }

  function renderOptions(question) {
    var answerList = $("#answerList");
    var selected = state.selectedAnswers[state.currentIndex];

    if (!answerList) return;
    answerList.innerHTML = "";

    question.options.forEach(function (optionText, index) {
      var button = document.createElement("button");
      var letter = document.createElement("span");
      var text = document.createElement("span");

      button.type = "button";
      button.className = "answer-option";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", selected === index ? "true" : "false");

      if (selected === index) button.classList.add("selected");

      letter.className = "answer-letter";
      letter.textContent = OPTION_LABELS[index];

      text.className = "answer-text";
      text.textContent = optionText;

      button.appendChild(letter);
      button.appendChild(text);

      button.addEventListener("click", function () {
        selectAnswer(index);
      });

      answerList.appendChild(button);
    });
  }

  function renderNavigator() {
    var nav = $("#questionNavigator");
    if (!nav) return;

    nav.innerHTML = "";

    state.paper.forEach(function (question, index) {
      var button = document.createElement("button");
      var isAnswered = state.selectedAnswers[index] !== null && state.selectedAnswers[index] !== undefined;

      button.type = "button";
      button.className = "nav-question-button";
      button.textContent = String(index + 1);
      button.setAttribute("aria-label", "Question " + (index + 1));

      if (index === state.currentIndex) button.classList.add("current");
      if (isAnswered) button.classList.add("answered");
      if (!isAnswered) button.classList.add("unanswered");
      if (state.flagged[index]) button.classList.add("flagged");

      button.addEventListener("click", function () {
        goToQuestion(index);
      });

      nav.appendChild(button);
    });
  }

  function updateButtons() {
    var prev = $("#prevBtn");
    var next = $("#nextBtn");
    var flag = $("#flagBtn");
    var pause = $("#pauseBtn");
    var clear = $("#clearAnswerBtn");

    if (prev) prev.disabled = state.isPaused || state.currentIndex === 0;
    if (next) next.disabled = state.isPaused || state.currentIndex === state.paper.length - 1;
    if (clear) clear.disabled = state.isPaused || state.selectedAnswers[state.currentIndex] === null;

    if (flag) {
      flag.disabled = state.isPaused;
      flag.classList.toggle("flag-active", Boolean(state.flagged[state.currentIndex]));
      flag.textContent = state.flagged[state.currentIndex] ? "Flagged for review" : "Flag for review";
    }

    if (pause) pause.textContent = state.isPaused ? "Resume" : "Pause";
  }

  function saveActiveExam() {
    if (!state.config || state.isFinished) return;

    saveJSON(ACTIVE_EXAM_KEY, {
      version: "1.0.0",
      savedAt: new Date().toISOString(),
      config: state.config,
      paper: state.paper,
      currentIndex: state.currentIndex,
      selectedAnswers: state.selectedAnswers,
      flagged: state.flagged,
      startedAt: state.startedAt,
      totalPausedMs: state.totalPausedMs,
      pauseStartedAt: state.pauseStartedAt,
      isPaused: state.isPaused
    });
  }

  function renderQuestion() {
    var question;

    if (!state.paper.length) return;

    question = state.paper[state.currentIndex];

    $("#examModuleTitle").textContent = examTitle();
    $("#questionPosition").textContent = "Question " + (state.currentIndex + 1) + " of " + state.paper.length;
    $("#questionSubject").textContent = question.subjectLabel;
    $("#questionTopic").textContent = question.topic;
    $("#questionDifficulty").textContent = "Difficulty " + question.difficulty;
    $("#questionText").textContent = question.question;

    renderOptions(question);
    renderNavigator();
    updateTopStats();
    updateButtons();
    saveActiveExam();
  }

  function selectAnswer(index) {
    if (state.isPaused || state.isFinished) return;
    state.selectedAnswers[state.currentIndex] = index;
    renderQuestion();
  }

  function clearAnswer() {
    if (state.isPaused || state.isFinished) return;
    state.selectedAnswers[state.currentIndex] = null;
    renderQuestion();
  }

  function goToQuestion(index) {
    if (state.isPaused || state.isFinished) return;
    if (index < 0 || index >= state.paper.length) return;
    state.currentIndex = index;
    renderQuestion();
  }

  function previousQuestion() {
    goToQuestion(state.currentIndex - 1);
  }

  function nextQuestion() {
    goToQuestion(state.currentIndex + 1);
  }

  function toggleFlag() {
    if (state.isPaused || state.isFinished) return;
    state.flagged[state.currentIndex] = !state.flagged[state.currentIndex];
    renderQuestion();
  }

  function setPaused(shouldPause) {
    var overlay = $("#pauseOverlay");

    if (state.isFinished) return;

    if (shouldPause && !state.isPaused) {
      state.isPaused = true;
      state.pauseStartedAt = Date.now();
    }

    if (!shouldPause && state.isPaused) {
      state.isPaused = false;
      if (state.pauseStartedAt) {
        state.totalPausedMs += Date.now() - state.pauseStartedAt;
      }
      state.pauseStartedAt = 0;
    }

    if (overlay) overlay.classList.toggle("visible", state.isPaused);
    updateButtons();
    updateTimer();
    saveActiveExam();
  }

  function togglePause() {
    setPaused(!state.isPaused);
  }

  function topicBreakdown() {
    var map = {};
    var list = [];

    state.paper.forEach(function (question, index) {
      var key = question.subject + "::" + question.topic;
      var selected = state.selectedAnswers[index];
      var isAnswered = selected !== null && selected !== undefined;
      var isCorrect = isAnswered && selected === question.answerIndex;

      if (!map[key]) {
        map[key] = {
          subject: question.subject,
          subjectLabel: question.subjectLabel,
          topic: question.topic,
          total: 0,
          answered: 0,
          correct: 0,
          incorrect: 0,
          percentage: 0
        };
        list.push(map[key]);
      }

      map[key].total += 1;
      if (isAnswered) map[key].answered += 1;
      if (isCorrect) map[key].correct += 1;
      if (!isCorrect) map[key].incorrect += 1;
    });

    list.forEach(function (item) {
      item.percentage = item.total ? Math.round((item.correct / item.total) * 100) : 0;
    });

    return list;
  }

  function incorrectQuestions() {
    var wrong = [];

    state.paper.forEach(function (question, index) {
      var selected = state.selectedAnswers[index];
      var isAnswered = selected !== null && selected !== undefined;
      var isCorrect = isAnswered && selected === question.answerIndex;

      if (!isCorrect) {
        wrong.push({
          questionNumber: index + 1,
          instanceId: question.instanceId,
          originalId: question.originalId,
          subject: question.subject,
          subjectLabel: question.subjectLabel,
          topic: question.topic,
          difficulty: question.difficulty,
          question: question.question,
          options: question.options.slice(),
          selectedAnswerIndex: isAnswered ? selected : null,
          selectedAnswerLabel: isAnswered ? OPTION_LABELS[selected] : "Not answered",
          selectedAnswerText: isAnswered ? question.options[selected] : "Not answered",
          correctAnswerIndex: question.answerIndex,
          correctAnswerLabel: OPTION_LABELS[question.answerIndex],
          correctAnswerText: question.options[question.answerIndex],
          explanation: question.explanation,
          status: isAnswered ? "incorrect" : "unanswered"
        });
      }
    });

    return wrong;
  }

  function mergeWrongQuestions(wrongList) {
    var existing = loadJSON(WRONG_QUESTIONS_KEY, []);
    var map = {};

    if (!Array.isArray(existing)) existing = [];

    existing.forEach(function (item) {
      if (item && item.originalId) map[item.originalId] = item;
    });

    wrongList.forEach(function (item) {
      var previous = map[item.originalId];

      map[item.originalId] = {
        originalId: item.originalId,
        subject: item.subject,
        subjectLabel: item.subjectLabel,
        topic: item.topic,
        difficulty: item.difficulty,
        question: item.question,
        options: item.options,
        correctAnswerIndex: item.correctAnswerIndex,
        correctAnswerLabel: item.correctAnswerLabel,
        correctAnswerText: item.correctAnswerText,
        explanation: item.explanation,
        lastSelectedAnswerIndex: item.selectedAnswerIndex,
        lastSelectedAnswerLabel: item.selectedAnswerLabel,
        lastSelectedAnswerText: item.selectedAnswerText,
        lastStatus: item.status,
        timesIncorrect: previous && previous.timesIncorrect ? previous.timesIncorrect + 1 : 1,
        firstWrongAt: previous && previous.firstWrongAt ? previous.firstWrongAt : new Date().toISOString(),
        lastWrongAt: new Date().toISOString()
      };
    });

    saveJSON(WRONG_QUESTIONS_KEY, Object.keys(map).map(function (id) {
      return map[id];
    }));
  }

  function buildResult(autoFinished) {
    var score = 0;
    var wrong;

    state.paper.forEach(function (question, index) {
      if (state.selectedAnswers[index] === question.answerIndex) score += 1;
    });

    wrong = incorrectQuestions();

    return {
      version: "1.0.0",
      completedAt: new Date().toISOString(),
      autoFinished: Boolean(autoFinished),
      finishReason: autoFinished ? "Time expired" : "Student finished",
      config: state.config,
      selectedSubjects: state.config.selectedSubjects.slice(),
      subjectLabels: state.config.selectedSubjects.map(getSubjectLabel),
      questionCount: state.paper.length,
      totalQuestions: state.paper.length,
      score: score,
      percentage: state.paper.length ? Math.round((score / state.paper.length) * 100) : 0,
      answeredCount: answeredCount(),
      flaggedCount: flaggedCount(),
      timeUsedSeconds: timeUsedSeconds(),
      timeRemainingSeconds: timeRemainingSeconds(),
      timeLimitSeconds: state.config.durationSeconds,
      pace: state.config.pace,
      paceLabel: state.config.paceLabel,
      topicBreakdown: topicBreakdown(),
      incorrectQuestions: wrong,
      responses: state.paper.map(function (question, index) {
        var selected = state.selectedAnswers[index];
        var isAnswered = selected !== null && selected !== undefined;

        return {
          questionNumber: index + 1,
          instanceId: question.instanceId,
          originalId: question.originalId,
          subject: question.subject,
          subjectLabel: question.subjectLabel,
          topic: question.topic,
          difficulty: question.difficulty,
          selectedAnswerIndex: isAnswered ? selected : null,
          selectedAnswerLabel: isAnswered ? OPTION_LABELS[selected] : null,
          correctAnswerIndex: question.answerIndex,
          correctAnswerLabel: OPTION_LABELS[question.answerIndex],
          isCorrect: isAnswered && selected === question.answerIndex,
          wasFlagged: Boolean(state.flagged[index])
        };
      }),
      paper: state.paper.map(function (question) {
        return {
          instanceId: question.instanceId,
          originalId: question.originalId,
          subject: question.subject,
          subjectLabel: question.subjectLabel,
          topic: question.topic,
          difficulty: question.difficulty,
          question: question.question,
          options: question.options.slice(),
          answerIndex: question.answerIndex,
          explanation: question.explanation
        };
      })
    };
  }

  function finishExam(autoFinished) {
    var unanswered;
    var ok;
    var result;

    if (state.isFinished) return;

    unanswered = state.paper.length - answeredCount();

    if (!autoFinished && unanswered > 0) {
      ok = window.confirm("You still have " + unanswered + " unanswered question" + (unanswered === 1 ? "" : "s") + ". Finish anyway?");
      if (!ok) return;
    }

    state.isFinished = true;
    if (state.timerId) window.clearInterval(state.timerId);

    result = buildResult(autoFinished);
    saveJSON(LATEST_RESULT_KEY, result);
    mergeWrongQuestions(result.incorrectQuestions);
    removeStorageItem(ACTIVE_EXAM_KEY);

    window.location.href = "results.html";
  }

  function wireEvents() {
    var prev = $("#prevBtn");
    var next = $("#nextBtn");
    var flag = $("#flagBtn");
    var pause = $("#pauseBtn");
    var resume = $("#resumeOverlayBtn");
    var finish = $("#finishBtn");
    var clear = $("#clearAnswerBtn");

    if (prev) prev.addEventListener("click", previousQuestion);
    if (next) next.addEventListener("click", nextQuestion);
    if (flag) flag.addEventListener("click", toggleFlag);
    if (pause) pause.addEventListener("click", togglePause);
    if (resume) resume.addEventListener("click", function () { setPaused(false); });
    if (finish) finish.addEventListener("click", function () { finishExam(false); });
    if (clear) clear.addEventListener("click", clearAnswer);

    document.addEventListener("keydown", function (event) {
      var key;

      if (event.altKey || event.ctrlKey || event.metaKey) return;

      key = event.key.toLowerCase();

      if (key === "p") {
        event.preventDefault();
        togglePause();
        return;
      }

      if (state.isPaused || state.isFinished) return;

      if (key === "a" || key === "b" || key === "c" || key === "d" || key === "e") {
        event.preventDefault();
        selectAnswer(OPTION_LABELS.map(function (label) {
          return label.toLowerCase();
        }).indexOf(key));
        return;
      }

      if (key === "f") {
        event.preventDefault();
        toggleFlag();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previousQuestion();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextQuestion();
      }
    });

    window.addEventListener("beforeunload", saveActiveExam);
  }

  function startTimer() {
    updateTimer();
    state.timerId = window.setInterval(updateTimer, 500);
  }

  function init() {
    var rawConfig = loadJSON(CONFIG_KEY, null);
    var config = normaliseConfig(rawConfig);
    var paper;

    if (!rawConfig) {
      showError("The exam settings could not be found. Return to the homepage and choose your exam setup again.");
      return;
    }

    if (!config) {
      showError("The question bank could not be loaded. Check assets/questionBank.js and assets/topicWeights.js.");
      return;
    }

    paper = generatePaper(config);

    if (!paper.length) {
      showError("No questions were found for the selected module. Add questions to assets/questionBank.js or choose a different module.");
      return;
    }

    state.config = config;
    state.paper = paper;
    state.currentIndex = 0;
    state.selectedAnswers = paper.map(function () { return null; });
    state.flagged = paper.map(function () { return false; });
    state.startedAt = Date.now();
    state.totalPausedMs = 0;
    state.pauseStartedAt = 0;
    state.isPaused = false;
    state.isFinished = false;

    showExam();
    wireEvents();
    renderQuestion();
    startTimer();
    saveActiveExam();
  }

  document.addEventListener("DOMContentLoaded", init);
}());