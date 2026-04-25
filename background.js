import { CursorManager } from './src/core/cursor_manager.js';

let contextID = -1;

// 1. Focus / Blur
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
});

// 2. cập nhật cursor
chrome.input.ime.onSurroundingTextChanged.addListener((engineID, info) => {
  if (info) {
    CursorManager.update(info);

    console.log("Cursor Position:", CursorManager.getCursorIndex());
    console.log("Current Word:", CursorManager.getFullWord());
  }
});

// ============================
// 🔥 FIX IME ENGINE CHÍNH
// ============================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) {
    return false;
  }

  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    return false;
  }

  // chỉ xử lý chữ
  if (keyData.code.startsWith("Key")) {

    const cursor = CursorManager.getCursorIndex();
    const { start, end } = CursorManager.getFullWordRange();

    const oldWord = CursorManager.getFullWord();

    // 👉 logic tiếng Việt (tạm thời nối chữ)
    const newWord = oldWord + keyData.key;

    // ==========================
    // 🔥 FIX QUAN TRỌNG NHẤT
    // ==========================

    // 1. xoá word cũ
    chrome.input.ime.deleteSurroundingText({
      contextID,
      offset: start - cursor,
      length: end - start
    });

    // 2. insert word mới
    chrome.input.ime.commitText({
      contextID,
      text: newWord
    });

    return true;
  }

  // space / enter / number / backspace
  return false;
});