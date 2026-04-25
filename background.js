import { IMEBuffer } from "./src/core/ime_buffer.js";
import { CursorManager } from "./src/core/cursor_manager.js";

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
// KEY EVENT CORE
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) return false;

  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) return false;

  // =====================
  // BACKSPACE
  // =====================
  if (keyData.key === "Backspace") {
    IMEBuffer.deleteBackward();
    return true;
  }

  // =====================
  // CHARACTER INPUT
  // =====================
  if (keyData.code.startsWith("Key")) {
    IMEBuffer.insert(keyData.key);

    const word = CursorManager.getWord(
      IMEBuffer.text,
      IMEBuffer.cursor
    );

    console.log("WORD:", word);

    return true;
  }

  return false;
});