import { BufferManager } from './core/buffer-manager.js';
import { TelexEngine } from './core/telex-engine.js';

let activeContextID = 0;

chrome.input.ime.onFocus.addListener((c) => {
  activeContextID = c.contextID;
  BufferManager.clear();
});

chrome.input.ime.onBlur.addListener(() => {
  activeContextID = 0;
  BufferManager.clear();
});

chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || activeContextID === 0) return false;
  if (keyData.ctrlKey || keyData.altKey) return false;

  const key = keyData.key;

  // =====================
  // BACKSPACE
  // =====================
  if (key === "Backspace") {
    BufferManager.removeLast();
    return false;
  }

  // =====================
  // KẾT THÚC TỪ
  // =====================
  if (key === " " || key === "Enter") {
    BufferManager.clear();
    return false;
  }

  // =====================
  // XỬ LÝ CHỮ
  // =====================
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {

    const buffer = BufferManager.get();

    // 🔥 dùng API mới
    const result = TelexEngine.process(buffer, key);

    if (result) {
      // Xóa toàn bộ từ cũ
      const deleteCount = buffer.length;
      const deleteStr = "\b".repeat(deleteCount);

      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: deleteStr + result.text
      });

      // cập nhật buffer
      BufferManager.update(result.text);

      return true;
    }

    return false;
  }

  return false;
});