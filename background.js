import { IMEBuffer } from "./src/core/ime_buffer.js";

let contextID = -1;

// =====================
// FOCUS
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;

  IMEBuffer.text = "";
  IMEBuffer.cursor = 0;
});

// =====================
// BLUR
// =====================
chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
});

// =====================
// KEY EVENT
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) return false;

  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) return false;

  // =====================
  // BACKSPACE
  // =====================
  if (keyData.key === "Backspace") {
    IMEBuffer.deleteBackward();
    updateComposition();
    return true;
  }

  // =====================
  // SPACE → COMMIT WORD
  // =====================
  if (keyData.key === " ") {
    commitWord();
    return true;
  }

  // =====================
  // CHARACTER INPUT
  // =====================
  if (keyData.key && keyData.key.length === 1) {
    IMEBuffer.insert(keyData.key);
    updateComposition();
    return true;
  }

  return false;
});

// =====================
// COMPOSITION UPDATE
// =====================
function updateComposition() {
  chrome.input.ime.setComposition({
    contextID,
    text: IMEBuffer.text,
    cursor: IMEBuffer.cursor
  });
}

// =====================
// COMMIT WORD
// =====================
function commitWord() {
  chrome.input.ime.commitText({
    contextID,
    text: IMEBuffer.text
  });

  IMEBuffer.text = "";
  IMEBuffer.cursor = 0;

  chrome.input.ime.setComposition({
    contextID,
    text: "",
    cursor: 0
  });
}