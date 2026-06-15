(function () {
  "use strict";

  var CONFIG_KEY = "esatSimulator.config";
  var ACTIVE_EXAM_KEY = "esatSimulator.activeExam";
  var LATEST_RESULT_KEY = "esatSimulator.latestResult";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function renderMath(value) {
    if (window.ESATMath && typeof window.ESATMath.renderToString === "function") {
      return window.ESATMath.renderToString(value);
    }

    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
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

  function setText(selector, value) {
    var element = $(selector);
    if (element) element.textContent = value;
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

  function formatDateTime(isoString) {
    if (!isoString) return "-";

    try {
      return new Date(isoString).toLocaleString();
    } catch (error) {
      return isoString;
    }
  }

  function getCurrentProfile() {
    if (window.ESATProfiles && typeof window.ESATProfiles.ensureCurrentProfile === "function") {
      return window.ESATProfiles.ensureCurrentProfile();
    }

    return null;
  }

  function getLatestResult() {
    var profile = getCurrentProfile();

    if (profile) {
      return profile.latestResult || null;
    }

    return loadJSON(LATEST_RESULT_KEY, null);
  }

  function getWrongQuestions() {
    var profile = getCurrentProfile();
    return profile && Array.isArray(profile.wrongQuestions) ? profile.wrongQuestions : [];
  }

  function getSubjectLabels(result) {
    if (Array.isArray(result.subjectLabels) && result.subjectLabels.length) return result.subjectLabels;
    if (Array.isArray(result.selectedSubjects)) return result.selectedSubjects;
    return ["-"];
  }

  function getQuestionData(result, index) {
    if (Array.isArray(result.paper) && result.paper[index]) return result.paper[index];
    return null;
  }

  function getResponseData(result, index) {
    if (Array.isArray(result.responses) && result.responses[index]) return result.responses[index];
    return null;
  }

  function renderDashboard(result) {
    var total = Number(result.totalQuestions || result.questionCount || 0);
    var score = Number(result.score || 0);
    var incorrect = Math.max(0, total - score);
    var profile = getCurrentProfile();

    setText("#resultTitle", "Score " + score + " / " + total);
    setText("#scoreMetric", score + " / " + total);
    setText("#percentageMetric", String(result.percentage || 0) + "%");
    setText("#correctMetric", String(score));
    setText("#incorrectMetric", incorrect + " incorrect");
    setText("#timeMetric", formatTime(result.timeUsedSeconds));
    setText("#paceMetric", result.paceLabel || result.pace || "Timing mode");
    setText("#moduleMetric", getSubjectLabels(result).join(", "));
    setText("#questionCountMetric", String(total));
    setText("#answeredMetric", String(result.answeredCount || 0));
    setText("#flaggedMetric", (result.flaggedCount || 0) + " flagged");
    setText("#completedMetric", formatDateTime(result.completedAt));
    setText("#finishReasonMetric", result.finishReason || "Student finished");
    setText("#profileMetric", profile ? profile.name : (result.profileName || "Guest"));

    if (result.autoFinished) {
      setText("#resultSubtitle", "The exam was automatically finished because the timer reached zero.");
    } else {
      setText("#resultSubtitle", "Review this profile’s score, timing, topic performance and question-by-question feedback.");
    }
  }

  function renderTopicBreakdown(result) {
    var body = $("#topicBreakdownBody");
    var topics = Array.isArray(result.topicBreakdown) ? result.topicBreakdown : [];

    if (!body) return;

    if (!topics.length) {
      body.innerHTML = "<tr><td colspan='6'>No topic breakdown was saved for this result.</td></tr>";
      return;
    }

    body.innerHTML = "";

    topics.forEach(function (item) {
      var row = document.createElement("tr");
      var attempted = Number(item.answered || 0);
      var correct = Number(item.correct || 0);
      var percentage = Number(item.percentage || 0);

      row.innerHTML =
        "<td><strong>" + escapeHTML(item.topic || "Uncategorised") + "</strong></td>" +
        "<td>" + escapeHTML(item.subjectLabel || item.subject || "-") + "</td>" +
        "<td class='number-cell'>" + attempted + " / " + Number(item.total || 0) + "</td>" +
        "<td class='number-cell'>" + correct + "</td>" +
        "<td class='number-cell'>" + percentage + "%</td>" +
        "<td><div class='progress-track'><span class='progress-fill' style='width:" + Math.max(0, Math.min(100, percentage)) + "%'></span></div></td>";

      body.appendChild(row);
    });
  }

  function renderReview(result) {
    var reviewList = $("#reviewList");
    var total = Number(result.totalQuestions || result.questionCount || 0);
    var index;

    if (!reviewList) return;

    reviewList.innerHTML = "";

    if (!total) {
      reviewList.innerHTML = "<div class='empty-state'>No question-level review was saved for this result.</div>";
      return;
    }

    for (index = 0; index < total; index += 1) {
      renderReviewCard(result, index, reviewList);
    }
  }

  function renderReviewCard(result, index, container) {
    var question = getQuestionData(result, index);
    var response = getResponseData(result, index);
    var card = document.createElement("article");
    var selectedIndex;
    var correctIndex;
    var isCorrect;
    var studentAnswer;
    var correctAnswer;
    var statusText;

    if (!question || !response) return;

    selectedIndex = response.selectedAnswerIndex;
    correctIndex = response.correctAnswerIndex;
    isCorrect = Boolean(response.isCorrect);

    studentAnswer = selectedIndex === null || selectedIndex === undefined
      ? "Not answered"
      : labelForIndex(selectedIndex) + ". " + (question.options[selectedIndex] || "");

    correctAnswer = labelForIndex(correctIndex) + ". " + (question.options[correctIndex] || "");
    statusText = isCorrect ? "Correct" : "Incorrect";

    card.className = "review-card " + (isCorrect ? "correct" : "incorrect");

    card.innerHTML =
      "<div class='review-card-header'>" +
        "<strong>Question " + Number(index + 1) + " · " + escapeHTML(question.topic || response.topic || "Uncategorised") + "</strong>" +
        "<span class='review-status " + (isCorrect ? "correct" : "incorrect") + "'>" + statusText + "</span>" +
      "</div>" +
      "<div class='review-card-body'>" +
        "<p class='review-question math-rendered'>" + renderMath(question.question || "") + "</p>" +
        "<div class='answer-compare'>" +
          "<div class='answer-box " + (isCorrect ? "" : "student-wrong") + "'>" +
            "<span>Student answer</span>" +
            "<strong class='math-rendered'>" + renderMath(studentAnswer) + "</strong>" +
          "</div>" +
          "<div class='answer-box correct-answer'>" +
            "<span>Correct answer</span>" +
            "<strong class='math-rendered'>" + renderMath(correctAnswer) + "</strong>" +
          "</div>" +
        "</div>" +
        "<div class='explanation-box math-rendered'>" +
          "<strong>Explanation:</strong> " + renderMath(question.explanation || "No explanation saved for this question.") +
        "</div>" +
      "</div>";

    container.appendChild(card);
  }

  function labelForIndex(index) {
    var labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    return labels[Number(index)] || "-";
  }

  function renderWrongQuestions() {
    var container = $("#profileWrongList");
    var wrong = getWrongQuestions();

    if (!container) return;

    if (!wrong.length) {
      container.innerHTML = "<div class='empty-state'>This profile has no saved wrong questions.</div>";
      return;
    }

    container.innerHTML = "";

    wrong.forEach(function (item, index) {
      var card = document.createElement("article");
      card.className = "review-card incorrect";

      card.innerHTML =
        "<div class='review-card-header'>" +
          "<strong>Wrong question " + (index + 1) + " · " + escapeHTML(item.topic || "Uncategorised") + "</strong>" +
          "<span class='review-status incorrect'>Saved</span>" +
        "</div>" +
        "<div class='review-card-body'>" +
          "<p class='review-question math-rendered'>" + renderMath(item.question || "") + "</p>" +
          "<div class='answer-box correct-answer'>" +
            "<span>Correct answer</span>" +
            "<strong class='math-rendered'>" + renderMath((item.correctAnswerLabel || "") + ". " + (item.correctAnswerText || "")) + "</strong>" +
          "</div>" +
          "<div class='explanation-box math-rendered'><strong>Explanation:</strong> " + renderMath(item.explanation || "No explanation saved.") + "</div>" +
        "</div>";

      container.appendChild(card);
    });
  }

  function renderResultHistory() {
    var profile = getCurrentProfile();
    var body = $("#resultHistoryBody");
    var history = profile && Array.isArray(profile.resultsHistory) ? profile.resultsHistory.slice() : [];

    if (!body) return;

    if (!history.length) {
      body.innerHTML = "<tr><td colspan='6'>This profile has no saved result history yet.</td></tr>";
      return;
    }

    history.reverse();

    body.innerHTML = "";

    history.forEach(function (result) {
      var row = document.createElement("tr");
      var subjects = getSubjectLabels(result).join(", ");

      row.innerHTML =
        "<td>" + escapeHTML(formatDateTime(result.completedAt)) + "</td>" +
        "<td>" + escapeHTML(subjects) + "</td>" +
        "<td class='number-cell'>" + Number(result.score || 0) + " / " + Number(result.totalQuestions || result.questionCount || 0) + "</td>" +
        "<td class='number-cell'>" + Number(result.percentage || 0) + "%</td>" +
        "<td class='number-cell'>" + escapeHTML(formatTime(result.timeUsedSeconds)) + "</td>" +
        "<td>" + escapeHTML(result.paceLabel || result.pace || "-") + "</td>";

      body.appendChild(row);
    });
  }

  function updateWrongQuestionStatus() {
    var wrong = getWrongQuestions();
    var button = $("#retryWrongBtn");

    setText("#wrongQuestionStatus", wrong.length + " saved wrong question" + (wrong.length === 1 ? "" : "s") + " for this profile.");

    if (button) button.disabled = wrong.length === 0;
  }

  function retryWrongQuestions() {
    var wrong = getWrongQuestions();
    var subjects = {};
    var subjectList = [];
    var ids = [];
    var questionCount;

    if (!wrong.length) {
      alert("There are no saved wrong questions for this profile.");
      return;
    }

    wrong.forEach(function (item) {
      if (item && item.subject && !subjects[item.subject]) {
        subjects[item.subject] = true;
        subjectList.push(item.subject);
      }

      if (item && item.originalId) {
        ids.push(item.originalId);
      }
    });

    if (!subjectList.length) subjectList = ["maths1"];

    if (wrong.length <= 10) questionCount = 10;
    else if (wrong.length <= 20) questionCount = 20;
    else questionCount = 27;

    saveJSON(CONFIG_KEY, {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      destination: "exam",
      selectedSubjects: subjectList,
      questionCount: questionCount,
      pace: "untimed",
      durationSeconds: null,
      shuffleQuestions: true,
      shuffleOptions: false,
      allowReview: true,
      practiceMode: "wrongQuestions",
      retryWrongQuestionIds: ids,
      selectedTopics: [],
      source: "results.html"
    });

    removeStorageItem(ACTIVE_EXAM_KEY);
    window.location.href = "exam.html";
  }

  function exportResultAsJSON(result) {
    var data = JSON.stringify(result, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    var date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = "esat-result-" + date + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function clearWrongQuestions() {
    var ok = window.confirm("Clear saved wrong questions for this profile only?");
    if (!ok) return;

    if (window.ESATProfiles && typeof window.ESATProfiles.updateCurrentProfile === "function") {
      window.ESATProfiles.updateCurrentProfile(function (profile) {
        profile.wrongQuestionIds = [];
        profile.wrongQuestions = [];
      });
    }

    renderWrongQuestions();
    updateWrongQuestionStatus();
  }

  function wireButtons(result) {
    var retryButton = $("#retryWrongBtn");
    var exportButton = $("#exportJsonBtn");
    var clearButton = $("#clearWrongBtn");

    if (retryButton) retryButton.addEventListener("click", retryWrongQuestions);

    if (exportButton) {
      exportButton.addEventListener("click", function () {
        exportResultAsJSON(result);
      });
    }

    if (clearButton) clearButton.addEventListener("click", clearWrongQuestions);
  }

  function renderAll() {
    var result = getLatestResult();
    var noResultState = $("#noResultState");
    var resultContent = $("#resultContent");

    if (!result) {
      if (noResultState) noResultState.hidden = false;
      if (resultContent) resultContent.hidden = true;
      renderWrongQuestions();
      renderResultHistory();
      updateWrongQuestionStatus();
      return;
    }

    if (noResultState) noResultState.hidden = true;
    if (resultContent) resultContent.hidden = false;

    renderDashboard(result);
    renderTopicBreakdown(result);
    renderReview(result);
    renderWrongQuestions();
    renderResultHistory();
    updateWrongQuestionStatus();
    wireButtons(result);
  }

  function init() {
    renderAll();

    window.addEventListener("esatProfileChanged", function () {
      renderAll();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
}());