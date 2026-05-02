importScripts('telex_engine.js');

let contextID = -1;
let rawBuffer = "";
let cursor = 0;

// =====================
// Event Listeners
// =====================
chrome.input.ime.onFocus.addListener(context => {
  contextID = context.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  rawBuffer = "";
  cursor = 0;
});

chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) {
    return false;
  }

  const key = keyData.key;

  if (handleSpecialKey(key)) {
    return true;
  }

  if (key.length === 1) {
    insertChar(key);
    return true;
  }

  return false;
});

// =====================
// Key Handlers
// =====================
function handleSpecialKey(key) {
  switch (key) {
    case "Backspace":
      return handleBackspace();
    case "Enter":
      return handleEnter();
    case " ": // Spacebar
      return handleSpace();
    case "ArrowLeft":
      return handleArrowLeft();
    case "ArrowRight":
      return handleArrowRight();
    default:
      return false;
  }
}

function handleBackspace() {
  if (cursor > 0) {
    rawBuffer = rawBuffer.slice(0, cursor - 1) + rawBuffer.slice(cursor);
    cursor--;
    render();
    return true;
  }
  return false;
}

function handleEnter() {
  if (rawBuffer.length > 0) {
    const { text } = transformFull(rawBuffer, cursor);
    commit(text);
  }
  return false; // Allow Enter to perform its default action (e.g., new line)
}

function handleSpace() {
  if (rawBuffer.length > 0) {
    const { text } = transformFull(rawBuffer, cursor);
    commit(text + " ");
    return true;
  }
  return false; // Allow space to be inserted if buffer is empty
}

function handleArrowLeft() {
  if (cursor > 0) {
    cursor--;
    render();
  }
  return true;
}

function handleArrowRight() {
  if (cursor < rawBuffer.length) {
    cursor++;
    render();
  }
  return true;
}

function insertChar(key) {
  rawBuffer = rawBuffer.slice(0, cursor) + key + rawBuffer.slice(cursor);
  cursor++;
  render();
}

// =====================
// IME API Calls
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

function commit(text) {
  chrome.input.ime.commitText({
    contextID,
    text: text
  });
  chrome.input.ime.clearComposition({ contextID });
  rawBuffer = "";
  cursor = 0;
}
