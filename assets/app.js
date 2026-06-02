(function () {
  "use strict";

  var CONFIG_KEY = "esatSimulator.config";
  var ACTIVE_EXAM_KEY = "esatSimulator.activeExam";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function getBank() {
    return window.ESAT_QUESTION_BANK || null;
  }

  function getWeights() {
    return window.ESAT_TOPIC_WEIGHTS || null;
  }

  function getSubjectData(subjectKey) {
    var bank = getBank();
    if (!bank || !bank.subjects) return null;
    return bank.subjects[subjectKey] || null;
  }

  function getSubjectQuestions(subjectKey) {
    var subject = getSubjectData(subjectKey);
    if (!subject || !Array.isArray(subject.questions)) return [];
    return subject.questions;
  }

  function getSelectedSubjects() {
    return $all("input[name='module']:checked").map(function (input) {
      return input.value;
    });
  }

  function getSelectedRadioValue(name, fallback) {
    var selected = $("input[name='" + name + "']:checked");
    return selected ? selected.value : fallback;
  }

  function getQuestionCount() {
    return Number(getSelectedRadioValue("questionCount", "10"));
  }

  function getPaceMode() {
    return getSelectedRadioValue("pace", "exam");
  }

  function getPaceDetails(paceKey) {
    var weights = getWeights();
    if (!weights || !weights.paceModes) return null;
    return weights.paceModes[paceKey] || null;
  }

  function getDurationSeconds(questionCount, paceKey) {
    var pace = getPaceDetails(paceKey);
    if (!pace || !pace.isTimed || !pace.secondsPerQuestion) return null;
    return questionCount * pace.secondsPerQuestion;
  }

  function formatDuration(seconds) {
    if (seconds === null || seconds === undefined) return "Untimed";

    var totalSeconds = Math.max(0, Number(seconds));
    var minutes = Math.floor(totalSeconds / 60);
    var remainingSeconds = totalSeconds % 60;

    if (remainingSeconds === 0) {
      return minutes + " min";
    }

    return minutes + " min " + remainingSeconds + " s";
  }

  function formatSubjectName(subjectKey) {
    var subject = getSubjectData(subjectKey);
    return subject ? subject.label : subjectKey;
  }

  function countQuestionsByTopic(subjectKey) {
    var questions = getSubjectQuestions(subjectKey);
    return questions.reduce(function (map, question) {
      var topic = question.topic || "Uncategorised";
      map[topic] = (map[topic] || 0) + 1;
      return map;
    }, {});
  }

  function countAllQuestions() {
    var bank = getBank();
    if (!bank || !bank.subjects) return 0;

    return Object.keys(bank.subjects).reduce(function (total, subjectKey) {
      return total + getSubjectQuestions(subjectKey).length;
    }, 0);
  }

  function buildConfig(destination) {
    var selectedSubjects = getSelectedSubjects();
    var questionCount = getQuestionCount();
    var pace = getPaceMode();
    var durationSeconds = getDurationSeconds(questionCount, pace);

    return {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      destination: destination || "exam",
      selectedSubjects: selectedSubjects,
      questionCount: questionCount,
      pace: pace,
      durationSeconds: durationSeconds,
      shuffleQuestions: true,
      shuffleOptions: false,
      allowReview: true,
      source: "index.html"
    };
  }

  function saveConfig(config) {
    try {
      window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      window.localStorage.removeItem(ACTIVE_EXAM_KEY);
      return true;
    } catch (error) {
      console.warn("Unable to save exam config:", error);
      return false;
    }
  }

  function setText(selector, text) {
    var element = $(selector);
    if (element) element.textContent = text;
  }

  function renderBankStats() {
    var container = $("#bankStats");
    if (!container) return;

    var bank = getBank();

    if (!bank || !bank.subjects) {
      container.innerHTML = "<p class='muted'>Question bank not found. Check that assets/questionBank.js is linked correctly.</p>";
      return;
    }

    var subjectKeys = Object.keys(bank.subjects);
    var html = "";

    subjectKeys.forEach(function (subjectKey) {
      var subject = bank.subjects[subjectKey];
      var count = getSubjectQuestions(subjectKey).length;
      html += ""
        + "<div class='stat-row'>"
        + "<span>" + subject.label + "</span>"
        + "<strong>" + count + " questions</strong>"
        + "</div>";
    });

    html += ""
      + "<div class='stat-row stat-row-total'>"
      + "<span>Total bank</span>"
      + "<strong>" + countAllQuestions() + " questions</strong>"
      + "</div>";

    container.innerHTML = html;
  }

  function renderTopicPreview() {
    var container = $("#topicPreview");
    if (!container) return;

    var selectedSubjects = getSelectedSubjects();
    var weights = getWeights();

    if (!selectedSubjects.length) {
      container.innerHTML = "<p class='muted'>Choose at least one module to see topic coverage.</p>";
      return;
    }

    if (!weights || !weights.subjects) {
      container.innerHTML = "<p class='muted'>Topic weights not found. Check that assets/topicWeights.js is linked correctly.</p>";
      return;
    }

    var html = "";

    selectedSubjects.forEach(function (subjectKey) {
      var subjectWeight = weights.subjects[subjectKey];
      var subject = getSubjectData(subjectKey);
      var topicCounts = countQuestionsByTopic(subjectKey);

      if (!subjectWeight || !subject) return;

      html += "<div class='topic-card'>";
      html += "<div class='topic-card-header'>";
      html += "<h4>" + subject.label + "</h4>";
      html += "<span>" + getSubjectQuestions(subjectKey).length + " available</span>";
      html += "</div>";

      subjectWeight.topicOrder.forEach(function (topicName) {
        var weight = subjectWeight.weights[topicName] || 0;
        var available = topicCounts[topicName] || 0;

        html += ""
          + "<div class='topic-line'>"
          + "<div class='topic-line-top'>"
          + "<span>" + topicName + "</span>"
          + "<span>" + weight + "% · " + available + " Qs</span>"
          + "</div>"
          + "<div class='topic-bar' aria-hidden='true'>"
          + "<span style='width:" + Math.max(0, Math.min(100, weight)) + "%'></span>"
          + "</div>"
          + "</div>";
      });

      html += "</div>";
    });

    container.innerHTML = html;
  }

  function renderSelectionSummary() {
    var selectedSubjects = getSelectedSubjects();
    var questionCount = getQuestionCount();
    var pace = getPaceMode();
    var paceDetails = getPaceDetails(pace);
    var durationSeconds = getDurationSeconds(questionCount, pace);

    var moduleText = selectedSubjects.length
      ? selectedSubjects.map(formatSubjectName).join(", ")
      : "No module selected";

    setText("#summaryModules", moduleText);
    setText("#summaryQuestionCount", questionCount + " questions");
    setText("#summaryPace", paceDetails ? paceDetails.label : pace);
    setText("#summaryDuration", formatDuration(durationSeconds));

    var status = $("#startStatus");
    var startExamButton = $("#startExamBtn");
    var startPracticeButton = $("#startPracticeBtn");

    var canStart = selectedSubjects.length > 0;

    if (startExamButton) startExamButton.disabled = !canStart;
    if (startPracticeButton) startPracticeButton.disabled = !canStart;

    if (status) {
      if (!canStart) {
        status.textContent = "Select at least one module to begin.";
        status.className = "status-message warning";
      } else {
        status.textContent = "Ready. Your settings will be saved locally in this browser.";
        status.className = "status-message success";
      }
    }
  }

  function updateModuleBadges() {
    $all("[data-question-count-for]").forEach(function (element) {
      var subjectKey = element.getAttribute("data-question-count-for");
      var count = getSubjectQuestions(subjectKey).length;
      element.textContent = count + " questions";
    });
  }

  function updateInterface() {
    renderSelectionSummary();
    renderTopicPreview();
    updateModuleBadges();
  }

  function handleStart(destination) {
    var config = buildConfig(destination);

    if (!config.selectedSubjects.length) {
      renderSelectionSummary();
      return;
    }

    var saved = saveConfig(config);

    if (!saved) {
      alert("Your browser blocked local storage. The exam page may not be able to load your settings.");
    }

    if (destination === "practice") {
      window.location.href = "practice.html";
    } else {
      window.location.href = "exam.html";
    }
  }

  function loadPreviousConfig() {
    try {
      var raw = window.localStorage.getItem(CONFIG_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function applyPreviousConfig() {
    var config = loadPreviousConfig();
    if (!config) return;

    if (Array.isArray(config.selectedSubjects)) {
      $all("input[name='module']").forEach(function (input) {
        input.checked = config.selectedSubjects.indexOf(input.value) !== -1;
      });
    }

    if (config.questionCount) {
      var countInput = $("input[name='questionCount'][value='" + config.questionCount + "']");
      if (countInput) countInput.checked = true;
    }

    if (config.pace) {
      var paceInput = $("input[name='pace'][value='" + config.pace + "']");
      if (paceInput) paceInput.checked = true;
    }
  }

  function clearSavedConfig() {
    try {
      window.localStorage.removeItem(CONFIG_KEY);
      window.localStorage.removeItem(ACTIVE_EXAM_KEY);
    } catch (error) {
      console.warn("Unable to clear saved config:", error);
    }

    var maths1 = $("input[name='module'][value='maths1']");
    if (maths1) maths1.checked = true;

    var count10 = $("input[name='questionCount'][value='10']");
    if (count10) count10.checked = true;

    var examPace = $("input[name='pace'][value='exam']");
    if (examPace) examPace.checked = true;

    updateInterface();
  }

  function wireEvents() {
    $all("input[name='module'], input[name='questionCount'], input[name='pace']").forEach(function (input) {
      input.addEventListener("change", updateInterface);
    });

    var startExamButton = $("#startExamBtn");
    if (startExamButton) {
      startExamButton.addEventListener("click", function () {
        handleStart("exam");
      });
    }

    var startPracticeButton = $("#startPracticeBtn");
    if (startPracticeButton) {
      startPracticeButton.addEventListener("click", function () {
        handleStart("practice");
      });
    }

    var clearButton = $("#clearSavedBtn");
    if (clearButton) {
      clearButton.addEventListener("click", clearSavedConfig);
    }
  }

  function init() {
    setText("#bankVersion", getBank() ? getBank().version : "Not loaded");
    setText("#totalQuestions", countAllQuestions() + " questions");

    renderBankStats();
    applyPreviousConfig();
    wireEvents();
    updateInterface();
  }

  document.addEventListener("DOMContentLoaded", init);
})();