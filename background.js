import { CursorManager } from "./src/core/cursor_manager.js";

let contextID = -1;

// =====================
// FOCUS
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

// =====================
// BLUR
// =====================
chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
});

// =====================
// CURSOR UPDATE
// =====================
chrome.input.ime.onSurroundingTextChanged.addListener((engineID, info) => {
  if (info) CursorManager.update(info);
});

// =====================
// KEY EVENT (IME CORE)
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) return false;

  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) return false;

  // =====================
  // HANDLE CHAR INPUT
  // =====================
  if (keyData.code.startsWith("Key")) {

    const cursor = CursorManager.getCursorIndex();
    const { start, end } = CursorManager.getFullWordRange();
    const oldWord = CursorManager.getFullWord();

    const newWord = oldWord + keyData.key;

    // =====================
    // 🔥 IME CORE FIX
    // =====================

    chrome.input.ime.deleteSurroundingText({
      contextID,
      offset: start - cursor,
      length: end - start
    });

    chrome.input.ime.commitText({
      contextID,
      text: newWord
    });

    return true;
  }

  return false;
});