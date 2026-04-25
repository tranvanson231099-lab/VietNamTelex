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
    render();
    return true;
  }

  // =====================
  // SPACE → COMMIT WORD
  // =====================
  if (keyData.key === " ") {
    commitWord(" ");
    return true;
  }

  // =====================
  // ENTER → COMMIT WORD
  // =====================
  if (keyData.key === "Enter") {
    commitWord("\n");
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
// RENDER COMPOSITION (FIXED)
// =====================
function render() {
  if (contextID === -1) return;

  const text = IMEBuffer.text;

  chrome.input.ime.setComposition({
    contextID,
    text: text,
    cursor: IMEBuffer.cursor
  }, () => {
    if (chrome.runtime.lastError) {
      console.warn("Composition error:", chrome.runtime.lastError.message);
    }
  });
}

// =====================
// COMMIT WORD (FIXED)
// =====================
function commitWord(extra = "") {
  if (contextID === -1) return;

  const finalText = IMEBuffer.text + extra;

  chrome.input.ime.commitText({
    contextID,
    text: finalText
  });

  IMEBuffer.text = "";
  IMEBuffer.cursor = 0;

  chrome.input.ime.setComposition({
    contextID,
    text: "",
    cursor: 0
  });
}