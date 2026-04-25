import { CursorManager } from "./src/core/cursor_manager.js";

let contextID = -1;
let lastWord = "";

// =====================
// FOCUS
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
  lastWord = "";
});

// =====================
// BLUR
// =====================
chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  lastWord = "";
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
    return false; // để Chrome xử lý
  }

  // =====================
  // CHARACTER INPUT
  // =====================
  if (keyData.code.startsWith("Key")) {

    const char = keyData.key;

    lastWord += char;

    console.log("WORD:", lastWord);

    // ⚠️ CHỈ commit CHAR, KHÔNG dùng buffer replace
    chrome.input.ime.commitText({
      contextID,
      text: char
    });

    return true;
  }

  return false;
});