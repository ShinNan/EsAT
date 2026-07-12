#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
let assertionCount = 0;

function assert(condition, message) {
  assertionCount += 1;
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function loadRenderer(katex) {
  const context = {
    console: {
      log: console.log.bind(console),
      warn: function () {},
      error: console.error.bind(console)
    },
    document: {
      addEventListener: function () {},
      querySelector: function () { return null; },
      querySelectorAll: function () { return []; },
      body: { classList: { contains: function () { return true; } } }
    },
    CustomEvent: function CustomEvent() {},
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
  };

  context.window = context;
  if (katex) context.katex = katex;
  vm.createContext(context);
  vm.runInContext(read("assets/app.js"), context, { filename: "assets/app.js" });
  vm.runInContext(read("assets/math.js"), context, { filename: "assets/math.js" });
  return context.ESATMath;
}

function checkKatexPath() {
  const calls = [];
  const renderer = loadRenderer({
    renderToString: function (expression, options) {
      calls.push({ expression: expression, options: options });
      return '<span class="katex">' + expression + "</span>";
    }
  });

  assert(renderer && typeof renderer.renderToString === "function", "ESATMath renderer was not installed");
  assert(renderer.usingKatex(), "ESATMath did not detect an available KaTeX renderer");

  ["\\sqrt{3}", "\\frac{x}{2}", "R^{2}T^{4}", "\\nuclide{235}{92}{U}"].forEach(function (expression) {
    const output = renderer.renderToString(expression, { mathOnly: true });
    assert(output.includes("katex"), "KaTeX path did not render " + expression);
  });

  const displayOutput = renderer.renderToString("\\[\\frac{x}{2}\\]", { displayMode: true });
  assert(displayOutput.includes("katex"), "display-mode expression was not rendered by KaTeX");
  assert(calls.some(function (call) { return call.options && call.options.displayMode === true; }), "KaTeX never received displayMode: true");
  assert(
    calls.some(function (call) { return call.expression.includes("{}^{235}_{92}\\mathrm{U}"); }),
    "nuclide notation was not converted to KaTeX-compatible LaTeX"
  );
  assert(
    renderer.renderToString("Value is \\(\\frac{x}{2}\\). ").includes("katex"),
    "inline delimited maths was not rendered inside prose"
  );
  assert(
    renderer.renderToString("<script>alert(1)</script>").includes("&lt;script&gt;"),
    "plain text was not HTML-escaped"
  );
}

function checkFallbackPath() {
  const renderer = loadRenderer(null);
  assert(!renderer.usingKatex(), "fallback smoke context unexpectedly reports KaTeX");

  const expectations = [
    ["\\sqrt{3}", "math-sqrt"],
    ["\\frac{x}{2}", "math-frac"],
    ["R^{2}T^{4}", "<sup>"],
    ["\\nuclide{235}{92}{U}", "nuclide"]
  ];
  expectations.forEach(function (item) {
    const output = renderer.renderToString(item[0], { mathOnly: true });
    assert(output && output.includes(item[1]), "fallback renderer did not handle " + item[0]);
  });
}

function loadQuestionBank() {
  const source = read("assets/questionBank.js");
  const marker = /window\.ESAT_QUESTION_BANK\s*=\s*/.exec(source);
  assert(marker, "assets/questionBank.js has no ESAT_QUESTION_BANK assignment");
  let payload = source.slice(marker.index + marker[0].length).trim();
  if (payload.endsWith(";")) payload = payload.slice(0, -1).trim();
  return JSON.parse(payload);
}

function findQuestion(bank, id) {
  const subjects = bank.subjects || {};
  for (const subject of Object.values(subjects)) {
    const question = (subject.questions || []).find(function (item) { return item.id === id; });
    if (question) return question;
  }
  return null;
}

function checkLiveImages() {
  const bank = loadQuestionBank();
  const expected = {
    ENGAA_2016_P1_Q04: "assets/question-images/ENGAA_2016_P1_Q04_graph.svg",
    ENGAA_2016_P1_Q06: "assets/question-images/ENGAA_2016_P1_Q06_fission-diagrams.svg"
  };

  Object.entries(expected).forEach(function (entry) {
    const question = findQuestion(bank, entry[0]);
    assert(question, entry[0] + " is missing from the question bank");
    assert(question.imagePath === entry[1], entry[0] + " is not using the reviewed SVG fallback");
    assert(question.imageStatus === "ready-svg-fallback", entry[0] + " has an unexpected imageStatus");
    const imagePath = path.join(ROOT, question.imagePath);
    assert(fs.statSync(imagePath).size > 0, entry[0] + " image is missing or empty");
  });
}

function hasScript(html, filename) {
  const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp('<script[^>]+src=["\\\'](?:\\.\\./)?' + escaped + '["\\\']', "i").test(html);
}

function checkPreviewPage() {
  const html = read("admin/question-preview.html");
  assert(hasScript(html, "assets/questionBank.js"), "question preview does not load assets/questionBank.js");
  assert(hasScript(html, "assets/app.js"), "question preview does not load assets/app.js");
  assert(hasScript(html, "assets/math.js"), "question preview does not load assets/math.js");
  assert(/katex(?:\.min)?\.js/i.test(html), "question preview does not load KaTeX");
  const inlineScripts = Array.from(html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi));
  assert(inlineScripts.length > 0, "question preview has no inline preview logic");
  inlineScripts.forEach(function (match, index) {
    new vm.Script(match[1], { filename: "admin/question-preview.html:inline-" + (index + 1) });
  });
}

function checkRuntimeScriptOrder(relativePath, finalScript) {
  const html = read(relativePath);
  const katexIndex = html.search(/katex(?:\.min)?\.js/i);
  const appIndex = html.indexOf('src="assets/app.js"');
  const mathIndex = html.indexOf('src="assets/math.js"');
  const finalIndex = html.indexOf('src="' + finalScript + '"');
  assert(katexIndex >= 0 && katexIndex < appIndex, relativePath + " must load KaTeX before app.js");
  assert(appIndex >= 0 && appIndex < mathIndex, relativePath + " must load app.js before math.js");
  assert(mathIndex >= 0 && mathIndex < finalIndex, relativePath + " must load math.js before its page script");
}

function main() {
  checkKatexPath();
  checkFallbackPath();
  checkLiveImages();
  checkPreviewPage();
  checkRuntimeScriptOrder("exam.html", "assets/exam.js");
  checkRuntimeScriptOrder("results.html", "assets/results.js");
  console.log("PASS: display smoke checks (" + assertionCount + " assertions)");
}

try {
  main();
} catch (error) {
  console.error("FAIL: " + error.message);
  process.exitCode = 1;
}
