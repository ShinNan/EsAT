(function () {
  "use strict";

  var CONFIG_KEY = "esatSimulator.config";
  var ACTIVE_EXAM_KEY = "esatSimulator.activeExam";
  var LATEST_RESULT_KEY = "esatSimulator.latestResult";
  var WRONG_QUESTIONS_KEY = "esatSimulator.wrongQuestions";
  var OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

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

  function renderMath(value, options) {
    if (window.ESATMath && typeof window.ESATMath.renderToString === "function") {
      return window.ESATMath.renderToString(value, options);
    }

    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function setMath(selector, value) {
    var element = $(selector);
    if (element) {
      element.innerHTML = renderMath(value);
      element.classList.add("math-rendered");
    }
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

  function getCurrentProfile() {
    if (window.ESATProfiles && typeof window.ESATProfiles.ensureCurrentProfile === "function") {
      return window.ESATProfiles.ensureCurrentProfile();
    }

    return null;
  }

  function normaliseConfig(rawConfig) {
    var bank = getBank();
    var weights = getWeights();
    var availableSubjects;
    var selectedSubjects;
    var selectedTopics;
    var retryWrongQuestionIds;
    var questionCount;
    var pace;
    var paceModes;
    var paceDetails;
    var durationSeconds;
    var practiceMode;
    var profile = getCurrentProfile();

    if (!bank || !bank.subjects) return null;

    availableSubjects = Object.keys(bank.subjects);
    selectedSubjects = [];

    if (rawConfig && Array.isArray(rawConfig.selectedSubjects)) {
      rawConfig.selectedSubjects.forEach(function (subjectKey) {
        if (availableSubjects.indexOf(subjectKey) !== -1) selectedSubjects.push(subjectKey);
      });
    }

    if (selectedSubjects.length === 0 && availableSubjects.indexOf("maths1") !== -1) {
      selectedSubjects.push("maths1");
    }

    selectedTopics = [];
    if (rawConfig && Array.isArray(rawConfig.selectedTopics)) {
      rawConfig.selectedTopics.forEach(function (topic) {
        if (topic !== null && topic !== undefined && selectedTopics.indexOf(String(topic)) === -1) {
          selectedTopics.push(String(topic));
        }
      });
    }

    retryWrongQuestionIds = [];
    if (rawConfig && Array.isArray(rawConfig.retryWrongQuestionIds)) {
      rawConfig.retryWrongQuestionIds.forEach(function (id) {
        if (id !== null && id !== undefined && retryWrongQuestionIds.indexOf(String(id)) === -1) {
          retryWrongQuestionIds.push(String(id));
        }
      });
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

    practiceMode = rawConfig && rawConfig.practiceMode ? rawConfig.practiceMode : "mixed";

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
      selectedTopics: selectedTopics,
      practiceMode: practiceMode,
      retryWrongQuestionIds: retryWrongQuestionIds,
      profileId: profile ? profile.id : null,
      profileName: profile ? profile.name : "Guest",
      usedPreviouslyAttemptedQuestions: false,
      duplicateQuestionsInAttempt: false,
      unseenQuestionCount: 0,
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

  function attemptedMapForCurrentProfile() {
    var profile = getCurrentProfile();
    var map = {};

    if (!profile || !Array.isArray(profile.attemptedQuestionIds)) return map;

    profile.attemptedQuestionIds.forEach(function (id) {
      map[id] = true;
    });

    return map;
  }

  function buildWrongQuestionPool(config) {
    var profile = getCurrentProfile();
    var wrongList = profile && Array.isArray(profile.wrongQuestions)
      ? profile.wrongQuestions
      : loadJSON(WRONG_QUESTIONS_KEY, []);
    var idFilter = {};
    var pool = [];
    var bankQuestions = {};
    var selectedSubjectMap = {};
    var hasIdFilter = false;

    if (!Array.isArray(wrongList)) wrongList = [];

    config.selectedSubjects.forEach(function (subject) {
      selectedSubjectMap[subject] = true;
    });

    if (Array.isArray(config.retryWrongQuestionIds) && config.retryWrongQuestionIds.length) {
      config.retryWrongQuestionIds.forEach(function (id) {
        idFilter[id] = true;
        hasIdFilter = true;
      });
    }

    Object.keys((getBank() && getBank().subjects) || {}).forEach(function (subjectKey) {
      getSubjectQuestions(subjectKey).forEach(function (question) {
        bankQuestions[question.id] = question;
      });
    });

    wrongList.forEach(function (item) {
      var id = item && item.originalId;
      var fromBank;

      if (!id) return;
      if (hasIdFilter && !idFilter[id]) return;
      if (item.subject && !selectedSubjectMap[item.subject]) return;

      fromBank = bankQuestions[id];

      if (fromBank) {
        pool.push(fromBank);
        return;
      }

      pool.push({
        id: item.originalId,
        subject: item.subject,
        topic: item.topic || "Uncategorised",
        difficulty: item.difficulty || 1,
        question: item.question || "",
        options: Array.isArray(item.options) ? item.options.slice() : [],
        answerIndex: Number(item.correctAnswerIndex || 0),
        explanation: item.explanation || "",
        tags: ["wrong-question-retry"]
      });
    });

    return pool;
  }

  function createBuckets(selectedSubjects, selectedTopics) {
    var weights = getWeights();
    var buckets = [];
    var topicFilter = {};
    var hasTopicFilter = false;

    if (Array.isArray(selectedTopics)) {
      selectedTopics.forEach(function (topic) {
        topicFilter[topic] = true;
        hasTopicFilter = true;
      });
    }

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
        var topicQuestions;

        if (hasTopicFilter && !topicFilter[topic]) return;

        topicQuestions = questions.filter(function (question) {
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

  function countUniqueQuestions(buckets) {
    var seen = {};
    var count = 0;

    buckets.forEach(function (bucket) {
      bucket.questions.forEach(function (question) {
        if (!seen[question.id]) {
          seen[question.id] = true;
          count += 1;
        }
      });
    });

    return count;
  }

  function filterBucketsByAttemptStatus(buckets, attemptedMap, wantUnseen) {
    return buckets
      .map(function (bucket) {
        return {
          subject: bucket.subject,
          topic: bucket.topic,
          weight: bucket.weight,
          questions: bucket.questions.filter(function (question) {
            var attempted = Boolean(attemptedMap[question.id]);
            return wantUnseen ? !attempted : attempted;
          })
        };
      })
      .filter(function (bucket) {
        return bucket.questions.length > 0;
      });
  }

  function selectUniqueFromBuckets(buckets, count, selectedIds) {
    var selected = [];
    var fillPool = [];
    var targets;
    var uniqueMap = {};

    if (!buckets.length || count <= 0) return selected;

    selectedIds = selectedIds || {};
    targets = allocateTargets(count, buckets);

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

    buckets.forEach(function (bucket) {
      bucket.questions.forEach(function (question) {
        if (!selectedIds[question.id] && !uniqueMap[question.id]) {
          uniqueMap[question.id] = true;
          fillPool.push(question);
        }
      });
    });

    fillPool = shuffle(fillPool);

    while (selected.length < count && fillPool.length > 0) {
      var question = fillPool.shift();
      if (!selectedIds[question.id]) {
        selected.push(question);
        selectedIds[question.id] = true;
      }
    }

    return selected;
  }

  function allUniqueQuestionsFromBuckets(buckets) {
    var all = [];
    var seen = {};

    buckets.forEach(function (bucket) {
      bucket.questions.forEach(function (question) {
        if (!seen[question.id]) {
          seen[question.id] = true;
          all.push(question);
        }
      });
    });

    return all;
  }

  function selectRawQuestions(config) {
    var buckets;
    var unseenBuckets;
    var selected = [];
    var selectedIds = {};
    var attemptedMap = attemptedMapForCurrentProfile();
    var allUnique;
    var wrongPool;
    var repeatsPool;
    var additional;

    if (config.practiceMode === "wrongQuestions") {
      wrongPool = buildWrongQuestionPool(config);

      if (!wrongPool.length) return [];

      wrongPool = shuffle(wrongPool);

      while (selected.length < config.questionCount && wrongPool.length > 0) {
        selected.push(wrongPool.shift());
      }

      if (selected.length < config.questionCount) {
        repeatsPool = shuffle(selected.slice());
        config.duplicateQuestionsInAttempt = true;

        while (selected.length < config.questionCount && repeatsPool.length > 0) {
          selected.push(repeatsPool[selected.length % repeatsPool.length]);
        }
      }

      if (config.shuffleQuestions) selected = shuffle(selected);
      return selected.slice(0, config.questionCount);
    }

    buckets = createBuckets(config.selectedSubjects, config.practiceMode === "topic" ? config.selectedTopics : []);

    if (!buckets.length && config.practiceMode === "topic") {
      buckets = createBuckets(config.selectedSubjects, []);
    }

    if (!buckets.length) return [];

    unseenBuckets = filterBucketsByAttemptStatus(buckets, attemptedMap, true);
    config.unseenQuestionCount = countUniqueQuestions(unseenBuckets);

    selected = selectUniqueFromBuckets(unseenBuckets, config.questionCount, selectedIds);

    if (selected.length < config.questionCount) {
      config.usedPreviouslyAttemptedQuestions = true;

      additional = selectUniqueFromBuckets(buckets, config.questionCount - selected.length, selectedIds);
      selected = selected.concat(additional);
    }

    if (selected.length < config.questionCount) {
      allUnique = shuffle(allUniqueQuestionsFromBuckets(buckets));
      config.duplicateQuestionsInAttempt = true;

      while (selected.length < config.questionCount && allUnique.length > 0) {
        selected.push(allUnique[selected.length % allUnique.length]);
      }
    }

    if (config.shuffleQuestions) selected = shuffle(selected);
    return selected.slice(0, config.questionCount);
  }

  function normaliseQuestion(question, occurrence, config) {
    var options = Array.isArray(question.options) ? question.options.slice() : [];
    var answerIndex = Number(question.answerIndex);
    var image = question.image && typeof question.image === "object" ? question.image : null;
    var optionObjects;
    var newAnswerIndex;

    if (answerIndex < 0 || answerIndex >= options.length || isNaN(answerIndex)) answerIndex = 0;

    if (options.length === 0) {
      options = ["Option A", "Option B", "Option C", "Option D", "Option E"];
      answerIndex = 0;
    }

    if (options.length > OPTION_LABELS.length) {
      options = options.slice(0, OPTION_LABELS.length);
      if (answerIndex >= OPTION_LABELS.length) answerIndex = OPTION_LABELS.length - 1;
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
      options: optionObjects.map(function (option) {
        return option.text;
      }),
      answerIndex: newAnswerIndex,
      explanation: question.explanation || "",
      imagePath: question.imagePath || (image && image.src) || "",
      imageAlt: question.imageAlt || (image && image.alt) || "",
      diagramType: question.diagramType || "",
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

  function renderRepeatNotice() {
    var main = $("#examApp");
    var existing = $("#repeatNotice");
    var message = "";

    if (!main || !state.config) return;

    if (existing) existing.remove();

    if (state.config.usedPreviouslyAttemptedQuestions) {
      message = "Repeated profile questions are being used because this profile has fewer unseen questions available than the selected paper length.";
    }

    if (state.config.duplicateQuestionsInAttempt) {
      message = "Some questions may repeat within this attempt because the available question bank is smaller than the selected paper length.";
    }

    if (!message) return;

    var notice = document.createElement("div");
    notice.id = "repeatNotice";
    notice.className = "status-message warning exam-repeat-notice";
    notice.textContent = message;

    main.insertAdjacentElement("afterbegin", notice);
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
    return state.config.profileName + " · " + names.join(", ") + " · " + state.config.questionCount + " questions · " + state.config.paceLabel;
  }


  function isNumberedStatementBlock(block) {
    return /^(\d+)\s+(.+)$/.test(block);
  }

  function isFormulaBlock(block) {
    var compact = String(block || "").trim();
    if (!compact || compact.length > 80) return false;
    if (/^\\\[[\s\S]*\\\]$/.test(compact)) return true;
    if (hasProseWords(compact)) return false;
    if (/(?:=|<|>|\^|\\times|\\frac|\\sqrt|\\cdot|\\propto)/.test(compact)) return true;
    return /(?:=|<|>|≤|≥|\^|\\times|\\frac|\\cdot)/.test(compact);
  }

  function hasProseWords(value) {
    var text = String(value || "")
      .replace(/\\\([\s\S]*?\\\)/g, "")
      .replace(/\\\[[\s\S]*?\\\]/g, "")
      .replace(/\\[A-Za-z]+(?:\s*\{[^{}]*\})*/g, "");
    return /[A-Za-z]{3,}|[a-z]{2,}/.test(text);
  }

  function appendQuestionParagraph(container, block) {
    var paragraph = document.createElement("p");
    paragraph.className = "question-paragraph math-rendered";
    paragraph.innerHTML = renderMath(block);
    container.appendChild(paragraph);
  }

  function appendQuestionFormula(container, block) {
    var formula = document.createElement("div");
    formula.className = "question-formula math-rendered";
    formula.innerHTML = renderMath(block, { displayMode: true });
    container.appendChild(formula);
  }

  function appendQuestionStatement(list, block) {
    var match = block.match(/^(\d+)\s+(.+)$/);
    var statement = document.createElement("div");
    var number = document.createElement("span");
    var text = document.createElement("span");

    statement.className = "question-statement";
    number.className = "question-statement-number";
    text.className = "question-statement-text math-rendered";

    number.textContent = match[1];
    text.innerHTML = renderMath(match[2]);

    statement.appendChild(number);
    statement.appendChild(text);
    list.appendChild(statement);
  }

  function renderQuestionBody(text) {
    var container = $("#questionText");
    var blocks;
    var statementList = null;

    if (!container) return;

    container.innerHTML = "";
    container.classList.remove("math-rendered");

    blocks = String(text || "")
      .split(/\n\s*\n/)
      .map(function (block) { return block.trim(); })
      .filter(Boolean);

    if (!blocks.length) return;

    blocks.forEach(function (block) {
      if (isNumberedStatementBlock(block)) {
        if (!statementList) {
          statementList = document.createElement("div");
          statementList.className = "question-statement-list";
          container.appendChild(statementList);
        }
        appendQuestionStatement(statementList, block);
        return;
      }

      statementList = null;

      if (isFormulaBlock(block)) {
        appendQuestionFormula(container, block);
        return;
      }

      appendQuestionParagraph(container, block);
    });
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

      text.className = "answer-text math-rendered";
      text.innerHTML = renderMath(optionText);

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

  function renderQuestionImage(question) {
    var imageWrap = $("#questionImageWrap");
    var image = $("#questionImage");
    var imageError = $("#questionImageError");

    if (!imageWrap || !image) return;

    if (question.imagePath) {
      imageWrap.hidden = false;
      imageWrap.dataset.state = "loading";
      image.hidden = true;
      if (imageError) imageError.hidden = true;
      image.alt = question.imageAlt || "Question diagram";
      image.onload = function () {
        imageWrap.dataset.state = "ready";
        image.hidden = false;
        if (imageError) imageError.hidden = true;
      };
      image.onerror = function () {
        imageWrap.dataset.state = "error";
        image.hidden = true;
        if (imageError) {
          imageError.textContent = "The question diagram could not be loaded: " + question.imagePath;
          imageError.hidden = false;
        }
      };
      image.src = question.imagePath;
      return;
    }

    imageWrap.hidden = true;
    delete imageWrap.dataset.state;
    image.onload = null;
    image.onerror = null;
    image.removeAttribute("src");
    image.alt = "";
    image.hidden = false;
    if (imageError) imageError.hidden = true;
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

    renderQuestionBody(question.question);
    renderQuestionImage(question);

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
          imagePath: question.imagePath,
          imageAlt: question.imageAlt,
          diagramType: question.diagramType,
          status: isAnswered ? "incorrect" : "unanswered"
        });
      }
    });

    return wrong;
  }

  function mergeWrongQuestionsLegacy(wrongList) {
    var existing = loadJSON(WRONG_QUESTIONS_KEY, []);
    var map = {};

    if (!Array.isArray(existing)) existing = [];

    existing.forEach(function (item) {
      if (item && item.originalId) map[item.originalId] = item;
    });

    wrongList.forEach(function (item) {
      map[item.originalId] = item;
    });

    saveJSON(WRONG_QUESTIONS_KEY, Object.keys(map).map(function (id) {
      return map[id];
    }));
  }

  function buildResult(autoFinished) {
    var score = 0;
    var wrong;
    var profile = getCurrentProfile();

    state.paper.forEach(function (question, index) {
      if (state.selectedAnswers[index] === question.answerIndex) score += 1;
    });

    wrong = incorrectQuestions();

    return {
      version: "1.0.0",
      completedAt: new Date().toISOString(),
      autoFinished: Boolean(autoFinished),
      finishReason: autoFinished ? "Time expired" : "Student finished",
      profileId: profile ? profile.id : null,
      profileName: profile ? profile.name : "Guest",
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
      usedPreviouslyAttemptedQuestions: state.config.usedPreviouslyAttemptedQuestions,
      duplicateQuestionsInAttempt: state.config.duplicateQuestionsInAttempt,
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
          explanation: question.explanation,
          imagePath: question.imagePath,
          imageAlt: question.imageAlt,
          diagramType: question.diagramType
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

    if (window.ESATProfiles && typeof window.ESATProfiles.updateAfterResult === "function") {
      window.ESATProfiles.updateAfterResult(result);
    }

    saveJSON(LATEST_RESULT_KEY, result);
    mergeWrongQuestionsLegacy(result.incorrectQuestions);
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

      if (/^[a-h]$/.test(key)) {
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
    renderRepeatNotice();
    wireEvents();
    renderQuestion();
    startTimer();
    saveActiveExam();
  }

  document.addEventListener("DOMContentLoaded", init);
}());
