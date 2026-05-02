importScripts(
  "telex_engine.js",
  "dictionary.js",
  "bktree.js",
  "bigram.js",
  "trigram.js",
  "embedding.js",
  "ranking.js",
  "suggestion_ai.js"
);

let contextID = -1;
const engine = new TelexEngine();

let currentSuggestions = [];

// =====================
chrome.input.ime.onFocus.addListener(ctx => {
  contextID = ctx.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  engine.reset();
});

// =====================
chrome.input.ime.onKeyEvent.addListener((id, e) => {
  if (e.type !== "keydown" || contextID === -1) return false;

  const k = e.key;

  if (k === "Backspace") {
    engine.backspace();
    render();
    return true;
  }

  if (k === "ArrowLeft") {
    engine.moveLeft();
    render();
    return true;
  }

  if (k === "ArrowRight") {
    engine.moveRight();
    render();
    return true;
  }

  if (k === " " || k === "Enter") {
    const { text } = engine.build();

    chrome.input.ime.commitText({
      contextID,
      text: k === " " ? text + " " : text
    });

    learnSentence(text.split(" "));
    engine.reset();
    chrome.input.ime.clearComposition({ contextID });
    return true;
  }

  if (k.length === 1) {
    engine.insert(k);
    render();
    return true;
  }

  return false;
});

// =====================
function render() {
  const { text, cursor } = engine.build();

  const suggestions = getSuggestionsNeural(engine);
  currentSuggestions = suggestions;

  chrome.input.ime.setComposition({
    contextID,
    text,
    cursor,
    selectionStart: cursor,
    selectionEnd: cursor,
    segments: [{ start: 0, end: text.length, style: "noUnderline" }]
  });

  chrome.input.ime.setCandidates({
    contextID,
    candidates: suggestions.map((s, i) => ({
      candidate: s,
      id: i
    }))
  });
}

// =====================
chrome.input.ime.onCandidateClicked.addListener((id, i) => {
  const word = currentSuggestions[i];

  chrome.input.ime.commitText({
    contextID,
    text: word + " "
  });

  learnSentence([word]);
  engine.reset();
});