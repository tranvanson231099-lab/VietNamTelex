importScripts('core/telex.js', 'core/composer.js');

const composer = new Composer();

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

// FIX click chuột
chrome.input.ime.onSurroundingTextChanged.addListener(() => {
  rawBuffer = "";
  cursor = 0;
});

// =====================
// KEY EVENT
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) return false;

  const key = keyData.key;

  // ✅ không chặn phím hệ thống
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    return false;
  }

  // =====================
// BACKSPACE
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
  // ARROW
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
  // ENTER
  // =====================
  if (key === "Enter") {
    if (rawBuffer.length > 0) {
      const { text } = composer.transform(rawBuffer, cursor);

      chrome.input.ime.commitText({
        contextID,
        text
      });

      chrome.input.ime.clearComposition({ contextID });

      rawBuffer = "";
      cursor = 0;
    }

    return false; // giữ hành vi xuống dòng
  }

  // =====================
  // SPACE
  // =====================
  if (key === " ") {
    if (rawBuffer.length > 0) {
      const { text } = composer.transform(rawBuffer, cursor);

      chrome.input.ime.commitText({
        contextID,
        text: text + " "
      });

      chrome.input.ime.clearComposition({ contextID });

      rawBuffer = "";
      cursor = 0;
      return true;
    }
    return false;
  }

  // =====================
  // TEXT INPUT
  // =====================
  if (
    key.length === 1 &&
    !keyData.ctrlKey &&
    !keyData.altKey &&
    !keyData.metaKey
  ) {
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
  const { text, cursorPos } = composer.transform(rawBuffer, cursor);

  chrome.input.ime.setComposition({
    contextID,
    text,
    cursor: cursorPos,
    selectionStart: cursorPos,
    selectionEnd: cursorPos,
    segments: [
      {
        start: 0,
        end: text.length,
        style: "noUnderline" // ✅ FIX crash
      }
    ]
  });
}
