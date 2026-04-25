import { IMEBuffer } from "./src/core/ime_buffer.js";
import { CursorManager } from "./src/core/cursor_manager.js";

let contextID = -1;

// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;

  IMEBuffer.text = "";
  IMEBuffer.cursor = 0;
});

// =====================
chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
});

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
    commitWord(" ");
    return true;
  }

  // =====================
  // ENTER → COMMIT
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
// RENDER (COMPOSITION FIXED)
// =====================
function render() {
  if (contextID === -1) return;

  const word = CursorManager.getWordFromBuffer(IMEBuffer);

  console.log("WORD:", word);

  chrome.input.ime.setComposition({
    contextID,
    text: IMEBuffer.text,
    cursor: IMEBuffer.cursor
  }, () => {
    if (chrome.runtime.lastError) {
      console.warn(chrome.runtime.lastError.message);
    }
  });
}

// =====================
// COMMIT WORD
// =====================
function commitWord(extra = "") {
  if (contextID === -1) return;

  chrome.input.ime.commitText({
    contextID,
    text: IMEBuffer.text + extra
  });

  IMEBuffer.text = "";
  IMEBuffer.cursor = 0;

  chrome.input.ime.setComposition({
    contextID,
    text: "",
    cursor: 0
  });
}