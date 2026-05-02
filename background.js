importScripts('telex_engine.js');

let contextID = -1;

let rawBuffer = "";
let cursor = 0;

// =====================
// FOCUS / BLUR
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  rawBuffer = "";
  cursor = 0;
});

// =====================
// KEY EVENT
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown") return false;
  if (contextID === -1) return false;

  const key = keyData.key;

  // =====================
  // BACKSPACE (UNDO)
  // =====================
  if (key === "Backspace") {
    if (cursor > 0) {
      rawBuffer =
        rawBuffer.slice(0, cursor - 1) +
        rawBuffer.slice(cursor);
      cursor--;
      render();
      return true;
    }
    return false;
  }

  // =====================
  // ARROW (MOVE CURSOR)
  // =====================
  if (key === "ArrowLeft") {
    cursor = Math.max(0, cursor - 1);
    render();
    return true;
  }

  if (key === "ArrowRight") {
    cursor = Math.min(rawBuffer.length, cursor + 1);
    render();
    return true;
  }

  // =====================
  // SPACE / ENTER
  // =====================
  if (key === " " || key === "Enter") {
    if (rawBuffer.length === 0) {
      return key !== 'Enter';
    }

    const { text } = transformFull(rawBuffer, cursor);

    if (key === " ") {
      commit(text + " ");
      return true;
    }

    if (key === "Enter") {
      commit(text);
      return false;
    }
  }

  // =====================
  // CHAR INPUT
  // =====================
  if (key.length === 1) {
    rawBuffer =
      rawBuffer.slice(0, cursor) +
      key +
      rawBuffer.slice(cursor);

    cursor++;
    render();
    return true;
  }

  return false;
});

// =====================
// RENDER
// =====================
function render() {
  const { text, cursorPos } = transformFull(rawBuffer, cursor);

  chrome.input.ime.setComposition({
    contextID,
    text,
    cursor: cursorPos,
    selectionStart: cursorPos,
    selectionEnd: cursorPos,
    segments: [{ start: 0, end: text.length, style: "noUnderline" }]
  });
}

// =====================
// COMMIT
// =====================
function commit(text) {
  chrome.input.ime.commitText({
    contextID,
    text: text
  });

  chrome.input.ime.clearComposition({ contextID });

  rawBuffer = "";
  cursor = 0;
}
