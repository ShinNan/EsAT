/*
  ESAT Simulator Shared App Script
  --------------------------------
  Includes:
  1. Lightweight local maths renderer.
  2. Local student profile system.
  3. Homepage setup behaviour.
*/

(function () {
  "use strict";

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var symbolMap = {
    theta: "θ",
    lambda: "λ",
    Delta: "Δ",
    delta: "δ",
    Omega: "Ω",
    omega: "ω",
    mu: "μ",
    pi: "π",
    rho: "ρ",
    alpha: "α",
    beta: "β",
    gamma: "γ",
    times: "×",
    cdot: "·",
    degree: "°",
    pm: "±",
    approx: "≈",
    leq: "≤",
    geq: "≥",
    neq: "≠",
    infty: "∞"
  };

  function isCommandChar(char) {
    return /[A-Za-z]/.test(char);
  }

  function skipSpaces(input, index) {
    while (index < input.length && /\s/.test(input[index])) index += 1;
    return index;
  }

  function readCommand(input, index) {
    var start = index;
    while (index < input.length && isCommandChar(input[index])) index += 1;

    return {
      command: input.slice(start, index),
      index: index
    };
  }

  function parseGroup(input, index) {
    index = skipSpaces(input, index);

    if (input[index] === "{") {
      return parseExpression(input, index + 1, "}");
    }

    return parseToken(input, index);
  }

  function parseToken(input, index) {
    var char = input[index];

    if (char === "\\") return parseBackslashCommand(input, index);

    if (char === "-" && index + 1 < input.length) {
      return {
        html: escapeHTML(input.slice(index, index + 2)),
        index: index + 2
      };
    }

    return {
      html: escapeHTML(char || ""),
      index: index + 1
    };
  }

  function parseBackslashCommand(input, index) {
    var commandData = readCommand(input, index + 1);
    var command = commandData.command;
    var nextIndex = commandData.index;
    var numerator;
    var denominator;
    var radicand;

    if (command === "frac") {
      numerator = parseGroup(input, nextIndex);
      denominator = parseGroup(input, numerator.index);

      return {
        html:
          "<span class=\"math-frac\">" +
            "<span class=\"math-num\">" + numerator.html + "</span>" +
            "<span class=\"math-den\">" + denominator.html + "</span>" +
          "</span>",
        index: denominator.index
      };
    }

    if (command === "sqrt") {
      radicand = parseGroup(input, nextIndex);

      return {
        html:
          "<span class=\"math-sqrt\">" +
            "<span class=\"math-radicand\">" + radicand.html + "</span>" +
          "</span>",
        index: radicand.index
      };
    }

    if (symbolMap[command]) {
      return {
        html: escapeHTML(symbolMap[command]),
        index: nextIndex
      };
    }

    return {
      html: escapeHTML("\\" + command),
      index: nextIndex
    };
  }

  function parseExpression(input, index, stopChar) {
    var html = "";
    var result;
    var group;
    var char;

    while (index < input.length) {
      char = input[index];

      if (stopChar && char === stopChar) {
        return {
          html: html,
          index: index + 1
        };
      }

      if (char === "\\") {
        result = parseBackslashCommand(input, index);
        html += result.html;
        index = result.index;
        continue;
      }

      if (char === "^") {
        group = parseGroup(input, index + 1);
        html += "<sup>" + group.html + "</sup>";
        index = group.index;
        continue;
      }

      if (char === "_") {
        group = parseGroup(input, index + 1);
        html += "<sub>" + group.html + "</sub>";
        index = group.index;
        continue;
      }

      if (char === "{") {
        group = parseExpression(input, index + 1, "}");
        html += group.html;
        index = group.index;
        continue;
      }

      if (char === "}") {
        return {
          html: html,
          index: index + 1
        };
      }

      html += escapeHTML(char);
      index += 1;
    }

    return {
      html: html,
      index: index
    };
  }

  function renderMathToString(value) {
    if (value === null || value === undefined) return "";
    return "<span class=\"math-inline\">" + parseExpression(String(value), 0, null).html + "</span>";
  }

  function renderMathElement(element, value) {
    if (!element) return;
    element.innerHTML = renderMathToString(value);
    element.classList.add("math-rendered");
  }

  window.ESATMath = {
    escapeHTML: escapeHTML,
    renderToString: renderMathToString,
    renderElement: renderMathElement
  };
}());

(function () {
  "use strict";

  var PROFILES_KEY = "esatSimulator.profiles";
  var CURRENT_PROFILE_KEY = "esatSimulator.currentProfileId";

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

  function makeProfileId(name) {
    return String(name || "Guest")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s/g, "-") || "guest";
  }

  function uniqueArray(items) {
    var seen = {};
    var output = [];

    if (!Array.isArray(items)) return output;

    items.forEach(function (item) {
      var value = String(item);
      if (!seen[value]) {
        seen[value] = true;
        output.push(value);
      }
    });

    return output;
  }

  function emptyProfile(name, id) {
    var now = new Date().toISOString();

    return {
      id: id || makeProfileId(name),
      name: String(name || "Guest").trim() || "Guest",
      createdAt: now,
      lastActive: now,
      attemptedQuestionIds: [],
      wrongQuestionIds: [],
      wrongQuestions: [],
      resultsHistory: [],
      latestResult: null,
      topicStats: {}
    };
  }

  function normaliseProfile(profile, id) {
    var clean = emptyProfile(profile && profile.name ? profile.name : id || "Guest", id);

    if (!profile || typeof profile !== "object") return clean;

    clean.id = profile.id || id || clean.id;
    clean.name = profile.name || clean.name;
    clean.createdAt = profile.createdAt || clean.createdAt;
    clean.lastActive = profile.lastActive || clean.lastActive;
    clean.attemptedQuestionIds = uniqueArray(profile.attemptedQuestionIds);
    clean.wrongQuestionIds = uniqueArray(profile.wrongQuestionIds);
    clean.wrongQuestions = Array.isArray(profile.wrongQuestions) ? profile.wrongQuestions : [];
    clean.resultsHistory = Array.isArray(profile.resultsHistory) ? profile.resultsHistory : [];
    clean.latestResult = profile.latestResult || null;
    clean.topicStats = profile.topicStats && typeof profile.topicStats === "object" ? profile.topicStats : {};

    return clean;
  }

  function getProfiles() {
    var profiles = loadJSON(PROFILES_KEY, {});

    if (!profiles || typeof profiles !== "object" || Array.isArray(profiles)) {
      profiles = {};
    }

    Object.keys(profiles).forEach(function (id) {
      profiles[id] = normaliseProfile(profiles[id], id);
    });

    return profiles;
  }

  function saveProfiles(profiles) {
    return saveJSON(PROFILES_KEY, profiles);
  }

  function getCurrentProfileId() {
    return window.localStorage.getItem(CURRENT_PROFILE_KEY);
  }

  function setCurrentProfileId(id) {
    window.localStorage.setItem(CURRENT_PROFILE_KEY, id);
  }

  function ensureCurrentProfile() {
    var profiles = getProfiles();
    var currentId = getCurrentProfileId();

    if (currentId && profiles[currentId]) {
      profiles[currentId].lastActive = new Date().toISOString();
      saveProfiles(profiles);
      return profiles[currentId];
    }

    if (!profiles.guest) {
      profiles.guest = emptyProfile("Guest", "guest");
    }

    setCurrentProfileId("guest");
    profiles.guest.lastActive = new Date().toISOString();
    saveProfiles(profiles);

    return profiles.guest;
  }

  function getCurrentProfile() {
    return ensureCurrentProfile();
  }

  function listProfiles() {
    var profiles = getProfiles();

    return Object.keys(profiles)
      .map(function (id) {
        return profiles[id];
      })
      .sort(function (a, b) {
        return String(a.name).localeCompare(String(b.name));
      });
  }

  function createProfile(name) {
    var trimmed = String(name || "").trim();
    var id;
    var profiles;

    if (!trimmed) {
      alert("Please enter a profile name.");
      return null;
    }

    id = makeProfileId(trimmed);
    profiles = getProfiles();

    if (!profiles[id]) {
      profiles[id] = emptyProfile(trimmed, id);
    }

    profiles[id].name = trimmed;
    profiles[id].lastActive = new Date().toISOString();

    saveProfiles(profiles);
    setCurrentProfileId(id);

    dispatchProfileChanged();
    return profiles[id];
  }

  function changeProfile(id) {
    var profiles = getProfiles();

    if (!profiles[id]) return null;

    profiles[id].lastActive = new Date().toISOString();
    saveProfiles(profiles);
    setCurrentProfileId(id);

    dispatchProfileChanged();
    return profiles[id];
  }

  function resetCurrentProfileProgress() {
    var profiles = getProfiles();
    var profile = ensureCurrentProfile();
    var ok;

    ok = window.confirm("Reset progress for " + profile.name + "? This clears attempted questions, wrong questions, topic stats and result history for this profile only.");

    if (!ok) return null;

    profiles[profile.id] = emptyProfile(profile.name, profile.id);
    profiles[profile.id].createdAt = profile.createdAt || new Date().toISOString();
    profiles[profile.id].lastActive = new Date().toISOString();

    saveProfiles(profiles);
    dispatchProfileChanged();

    return profiles[profile.id];
  }

  function updateCurrentProfile(mutator) {
    var profiles = getProfiles();
    var profile = ensureCurrentProfile();

    if (!profiles[profile.id]) {
      profiles[profile.id] = profile;
    }

    mutator(profiles[profile.id]);

    profiles[profile.id].lastActive = new Date().toISOString();
    profiles[profile.id] = normaliseProfile(profiles[profile.id], profile.id);

    saveProfiles(profiles);
    dispatchProfileChanged();

    return profiles[profile.id];
  }

  function updateTopicStats(profile, result) {
    if (!profile.topicStats || typeof profile.topicStats !== "object") {
      profile.topicStats = {};
    }

    if (!Array.isArray(result.topicBreakdown)) return;

    result.topicBreakdown.forEach(function (topic) {
      var key = (topic.subject || "unknown") + "::" + (topic.topic || "Uncategorised");

      if (!profile.topicStats[key]) {
        profile.topicStats[key] = {
          subject: topic.subject || "",
          subjectLabel: topic.subjectLabel || "",
          topic: topic.topic || "Uncategorised",
          total: 0,
          answered: 0,
          correct: 0,
          incorrect: 0,
          attempts: 0,
          percentage: 0,
          lastUpdated: null
        };
      }

      profile.topicStats[key].total += Number(topic.total || 0);
      profile.topicStats[key].answered += Number(topic.answered || 0);
      profile.topicStats[key].correct += Number(topic.correct || 0);
      profile.topicStats[key].incorrect += Number(topic.incorrect || 0);
      profile.topicStats[key].attempts += 1;
      profile.topicStats[key].percentage = profile.topicStats[key].total
        ? Math.round((profile.topicStats[key].correct / profile.topicStats[key].total) * 100)
        : 0;
      profile.topicStats[key].lastUpdated = new Date().toISOString();
    });
  }

  function updateAfterResult(result) {
    var profile = ensureCurrentProfile();

    result.profileId = profile.id;
    result.profileName = profile.name;

    return updateCurrentProfile(function (draft) {
      var attemptedIds = [];
      var incorrectIds = {};
      var wrongMap = {};

      draft.wrongQuestions.forEach(function (item) {
        if (item && item.originalId) {
          wrongMap[item.originalId] = item;
        }
      });

      if (Array.isArray(result.paper)) {
        result.paper.forEach(function (question) {
          if (question && question.originalId) {
            attemptedIds.push(question.originalId);
          }
        });
      }

      if (Array.isArray(result.incorrectQuestions)) {
        result.incorrectQuestions.forEach(function (item) {
          if (item && item.originalId) {
            incorrectIds[item.originalId] = true;
            wrongMap[item.originalId] = item;
          }
        });
      }

      draft.attemptedQuestionIds = uniqueArray(draft.attemptedQuestionIds.concat(attemptedIds));
      draft.wrongQuestionIds = uniqueArray(draft.wrongQuestionIds.concat(Object.keys(incorrectIds)));
      draft.wrongQuestions = Object.keys(wrongMap).map(function (id) {
        return wrongMap[id];
      });

      draft.latestResult = result;
      draft.resultsHistory.push(result);

      updateTopicStats(draft, result);
    });
  }

  function exportCurrentProfile() {
    var profile = ensureCurrentProfile();
    var data = JSON.stringify({
      type: "esat-simulator-profile",
      exportedAt: new Date().toISOString(),
      profile: profile
    }, null, 2);

    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = "esat-profile-" + profile.name.replace(/\s+/g, "-").toLowerCase() + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function importProfileObject(data) {
    var profile;
    var profiles;
    var id;
    var ok;

    if (data && data.profile) {
      profile = data.profile;
    } else {
      profile = data;
    }

    if (!profile || typeof profile !== "object" || !profile.name) {
      alert("This JSON file does not look like an ESAT profile export.");
      return null;
    }

    id = profile.id || makeProfileId(profile.name);
    profiles = getProfiles();

    if (profiles[id]) {
      ok = window.confirm("A profile with this name already exists. Replace it with the imported progress?");
      if (!ok) return null;
    }

    profiles[id] = normaliseProfile(profile, id);
    profiles[id].lastActive = new Date().toISOString();

    saveProfiles(profiles);
    setCurrentProfileId(id);
    dispatchProfileChanged();

    return profiles[id];
  }

  function dispatchProfileChanged() {
    window.dispatchEvent(new CustomEvent("esatProfileChanged", {
      detail: {
        profile: ensureCurrentProfile()
      }
    }));

    renderProfileWidget();
  }

  function renderProfileWidget() {
    var existing = document.querySelector("#profileWidget");
    var header;
    var profile;
    var profiles;
    var html;

    if (document.body.classList.contains("exam-body")) return;

    header = document.querySelector(".site-header, .practice-header, .results-header");
    if (!header) return;

    if (!existing) {
      existing = document.createElement("section");
      existing.id = "profileWidget";
      existing.className = "profile-widget";
      header.insertAdjacentElement("afterend", existing);
    }

    profile = ensureCurrentProfile();
    profiles = listProfiles();

    html = "";
    html += "<div class='profile-widget-main'>";
    html += "<div>";
    html += "<p class='eyebrow'>Student profile</p>";
    html += "<h2>Current profile: <span>" + escapeHTML(profile.name) + "</span></h2>";
    html += "<p>" + profile.attemptedQuestionIds.length + " attempted · " + profile.wrongQuestionIds.length + " wrong · " + profile.resultsHistory.length + " result" + (profile.resultsHistory.length === 1 ? "" : "s") + "</p>";
    html += "</div>";
    html += "</div>";

    html += "<div class='profile-widget-actions'>";
    html += "<select id='profileSelect' aria-label='Choose student profile'>";

    profiles.forEach(function (item) {
      html += "<option value='" + escapeHTML(item.id) + "'" + (item.id === profile.id ? " selected" : "") + ">" + escapeHTML(item.name) + "</option>";
    });

    html += "</select>";
    html += "<button type='button' id='profileChangeBtn' class='button button-secondary'>Change profile</button>";
    html += "<button type='button' id='profileCreateBtn' class='button button-secondary'>Create new profile</button>";
    html += "<button type='button' id='profileResetBtn' class='button button-ghost'>Reset this profile’s progress</button>";
    html += "<button type='button' id='profileExportBtn' class='button button-secondary'>Export profile JSON</button>";
    html += "<label class='button button-secondary profile-import-label'>Import profile JSON<input type='file' id='profileImportInput' accept='application/json,.json'></label>";
    html += "</div>";

    existing.innerHTML = html;

    wireProfileWidget();
  }

  function wireProfileWidget() {
    var changeButton = document.querySelector("#profileChangeBtn");
    var createButton = document.querySelector("#profileCreateBtn");
    var resetButton = document.querySelector("#profileResetBtn");
    var exportButton = document.querySelector("#profileExportBtn");
    var importInput = document.querySelector("#profileImportInput");

    if (changeButton) {
      changeButton.addEventListener("click", function () {
        var select = document.querySelector("#profileSelect");
        if (select) changeProfile(select.value);
      });
    }

    if (createButton) {
      createButton.addEventListener("click", function () {
        var name = window.prompt("Enter the new student profile name:");
        if (name) createProfile(name);
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        resetCurrentProfileProgress();
      });
    }

    if (exportButton) {
      exportButton.addEventListener("click", exportCurrentProfile);
    }

    if (importInput) {
      importInput.addEventListener("change", function () {
        var file = importInput.files && importInput.files[0];
        var reader;

        if (!file) return;

        reader = new FileReader();

        reader.onload = function () {
          var data = safeJSONParse(reader.result, null);
          importProfileObject(data);
          importInput.value = "";
        };

        reader.readAsText(file);
      });
    }
  }

  window.ESATProfiles = {
    getProfiles: getProfiles,
    listProfiles: listProfiles,
    ensureCurrentProfile: ensureCurrentProfile,
    getCurrentProfile: getCurrentProfile,
    createProfile: createProfile,
    changeProfile: changeProfile,
    resetCurrentProfileProgress: resetCurrentProfileProgress,
    updateCurrentProfile: updateCurrentProfile,
    updateAfterResult: updateAfterResult,
    exportCurrentProfile: exportCurrentProfile,
    importProfileObject: importProfileObject,
    renderProfileWidget: renderProfileWidget,
    keys: {
      profiles: PROFILES_KEY,
      currentProfile: CURRENT_PROFILE_KEY
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensureCurrentProfile();
    renderProfileWidget();
  });
}());

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

    if (remainingSeconds === 0) return minutes + " min";
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
    var profile = window.ESATProfiles ? window.ESATProfiles.ensureCurrentProfile() : null;

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
      practiceMode: "mixed",
      selectedTopics: [],
      retryWrongQuestionIds: [],
      profileId: profile ? profile.id : null,
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
        status.textContent = "Ready. Your settings and profile progress will be saved locally in this browser.";
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

    window.location.href = destination === "practice" ? "practice.html" : "exam.html";
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
}());