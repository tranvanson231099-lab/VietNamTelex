import { IMEBuffer } from "./src/core/ime_buffer.js";

let contextID = -1;

// =====================
// FOCUS
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;

  IMEBuffer.text = "";
  IMEBuffer.cursor = 0;

  console.log("IME Focus:", contextID);
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
    render();
    return true;
  }

  // =====================
  // SPACE → COMMIT
  // =====================
  if (keyData.key === " ") {
    chrome.input.ime.commitText({
      contextID,
      text: IMEBuffer.text + " "
    });

    IMEBuffer.text = "";
    IMEBuffer.cursor = 0;

    clearComposition();
    return true;
  }

  // =====================
  // NORMAL CHAR
  // =====================
  if (keyData.key && keyData.key.length === 1) {
    IMEBuffer.insert(keyData.key);
    render();
    return true;
  }

  return false;
});

// =====================
// RENDER COMPOSITION (IMPORTANT FIX)
// =====================
function render() {
  if (contextID === -1) return;

  chrome.input.ime.setComposition({
    contextID,
    text: IMEBuffer.text || " ",
    cursor: IMEBuffer.cursor
  }, () => {
    if (chrome.runtime.lastError) {
      console.warn("Composition error:", chrome.runtime.lastError.message);
    }
  });
}

// =====================
// CLEAR
// =====================
function clearComposition() {
  chrome.input.ime.setComposition({
    contextID,
    text: "",
    cursor: 0
  });
}