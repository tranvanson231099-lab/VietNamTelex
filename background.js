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

    chrome.input.ime.setComposition({
      contextID,
      text: IMEBuffer.text,
      cursor: IMEBuffer.cursor
    });

    return true;
  }

  // =====================
  // CHARACTER INPUT
  // =====================
  if (keyData.code.startsWith("Key")) {
    IMEBuffer.insert(keyData.key);

    // 🔥 HIỂN THỊ CHỮ ĐANG GÕ (BUFFER)
    chrome.input.ime.setComposition({
      contextID,
      text: IMEBuffer.text,
      cursor: IMEBuffer.cursor
    });

    return true;
  }

  return false;
});