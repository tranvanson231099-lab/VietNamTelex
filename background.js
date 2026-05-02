importScripts(
  "telex_transformer.js",
  "text_buffer.js",
  "composer.js"
);

let contextID = -1;
const buffer = new TextBuffer();

// =====================
chrome.input.ime.onFocus.addListener(ctx => {
  contextID = ctx.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  buffer.reset();
});

// =====================
chrome.input.ime.onKeyEvent.addListener((id, e) => {
  if (e.type !== "keydown" || contextID === -1) return false;

  const k = e.key;

  if (k === "Backspace") {
    buffer.backspace();
    render();
    return true;
  }

  if (k === "ArrowLeft") {
    buffer.moveLeft();
    render();
    return true;
  }

  if (k === "ArrowRight") {
    buffer.moveRight();
    render();
    return true;
  }

  if (k === " " || k === "Enter") {
    const { text } = compose(buffer);

    chrome.input.ime.commitText({
      contextID,
      text: k === " " ? text + " " : text
    });

    chrome.input.ime.clearComposition({ contextID });
    buffer.reset();
    return true;
  }

  if (k.length === 1) {
    buffer.insert(k);
    render();
    return true;
  }

  return false;
});

// =====================
function render() {
  const { text, cursor } = compose(buffer);

  chrome.input.ime.setComposition({
    contextID,
    text,
    cursor,
    selectionStart: cursor,
    selectionEnd: cursor,
    segments: [
      { start: 0, end: text.length, style: "noUnderline" }
    ]
  });
}