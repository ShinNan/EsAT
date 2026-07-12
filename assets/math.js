/*
  ESAT Simulator KaTeX adapter
  ----------------------------
  Uses KaTeX when its pinned CDN script is available. The lightweight renderer
  installed by assets/app.js remains the fallback for offline/CDN failures.
*/

(function () {
  "use strict";

  var fallback = window.ESATMath || {};
  var fallbackRender = typeof fallback.renderToString === "function"
    ? fallback.renderToString.bind(fallback)
    : null;
  var escapeHTML = typeof fallback.escapeHTML === "function"
    ? fallback.escapeHTML.bind(fallback)
    : function (value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

  function normaliseLatex(value) {
    return String(value || "")
      .replace(/−/g, "-")
      .replace(/×/g, "\\times ")
      .replace(/≤/g, "\\leq ")
      .replace(/≥/g, "\\geq ")
      .replace(/\\nuclide\s*\{([^{}]+)\}\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g,
        "{}^{$1}_{$2}\\mathrm{$3}");
  }

  function fallbackExpression(value, displayMode) {
    var simplified = String(value || "")
      .replace(/\\(?:left|right)/g, "")
      .replace(/\\mathrm\{([^{}]*)\}/g, "$1")
      .replace(/\\[,;:!]/g, "")
      .replace(/\\\s/g, " ");
    var html = fallbackRender ? fallbackRender(simplified) : escapeHTML(simplified);
    return displayMode ? "<span class=\"math-fallback-display\">" + html + "</span>" : html;
  }

  function renderExpression(value, displayMode) {
    var expression = String(value || "").trim();
    if (!expression) return "";

    if (window.katex && typeof window.katex.renderToString === "function") {
      try {
        return window.katex.renderToString(normaliseLatex(expression), {
          displayMode: Boolean(displayMode),
          throwOnError: true,
          strict: "ignore",
          trust: false,
          output: "htmlAndMathml"
        });
      } catch (error) {
        console.warn("KaTeX could not render an expression; using the local fallback.", expression, error);
      }
    }

    return fallbackExpression(expression, displayMode);
  }

  function renderDelimitedText(value) {
    var text = String(value || "");
    var output = "";
    var cursor = 0;
    var nextInline;
    var nextDisplay;
    var start;
    var isDisplay;
    var closeToken;
    var end;

    while (cursor < text.length) {
      nextInline = text.indexOf("\\(", cursor);
      nextDisplay = text.indexOf("\\[", cursor);
      if (nextInline === -1 && nextDisplay === -1) {
        output += escapeHTML(text.slice(cursor)).replace(/\n/g, "<br>");
        break;
      }

      if (nextDisplay !== -1 && (nextInline === -1 || nextDisplay < nextInline)) {
        start = nextDisplay;
        isDisplay = true;
        closeToken = "\\]";
      } else {
        start = nextInline;
        isDisplay = false;
        closeToken = "\\)";
      }

      output += escapeHTML(text.slice(cursor, start)).replace(/\n/g, "<br>");
      end = text.indexOf(closeToken, start + 2);
      if (end === -1) {
        output += escapeHTML(text.slice(start)).replace(/\n/g, "<br>");
        break;
      }

      output += renderExpression(text.slice(start + 2, end), isDisplay);
      cursor = end + 2;
    }

    return output;
  }

  function unwrapDisplayDelimiters(value) {
    var text = String(value || "").trim();
    if (text.startsWith("\\[") && text.endsWith("\\]")) return text.slice(2, -2);
    return text;
  }

  function looksLikeStandaloneMath(value) {
    var text = String(value || "").trim();
    return /\\(?:frac|sqrt|nuclide|times|cdot|alpha|beta|gamma|theta)|\^\{|_\{/.test(text);
  }

  function renderToString(value, options) {
    var settings = options || {};
    var text = value === null || value === undefined ? "" : String(value);

    if (settings.displayMode) {
      return renderExpression(unwrapDisplayDelimiters(text), true);
    }
    if (text.indexOf("\\(") !== -1 || text.indexOf("\\[") !== -1) {
      return renderDelimitedText(text);
    }
    if (settings.mathOnly || looksLikeStandaloneMath(text)) {
      return renderExpression(text, false);
    }
    return escapeHTML(text).replace(/\n/g, "<br>");
  }

  function renderElement(element, value, options) {
    if (!element) return;
    element.innerHTML = renderToString(value, options);
    element.classList.add("math-rendered");
  }

  window.ESATMath = {
    escapeHTML: escapeHTML,
    normaliseLatex: normaliseLatex,
    renderExpressionToString: renderExpression,
    renderToString: renderToString,
    renderElement: renderElement,
    usingKatex: function () {
      return Boolean(window.katex && typeof window.katex.renderToString === "function");
    },
    fallbackRenderToString: fallbackRender
  };
}());
