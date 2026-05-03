import { BufferManager } from './core/buffer-manager.js';
import { TelexEngine } from './core/telex-engine.js';

let activeContextID = 0;

chrome.input.ime.onFocus.addListener((c) => { activeContextID = c.contextID; BufferManager.clear(); });
chrome.input.ime.onBlur.addListener(() => { activeContextID = 0; BufferManager.clear(); });

chrome.input.ime.onKeyEvent.addListener((engineID, keyData, requestId) => {
  if (keyData.type === "keyup" || activeContextID === 0) return false;
  if (keyData.ctrlKey || keyData.altKey) return false;

  const key = keyData.key;

  // Xử lý Backspace
  if (key === "Backspace") {
    BufferManager.removeLast();
    return false; // Để hệ thống tự xóa
  }

  // Kết thúc từ
  if (key === " " || key === "Enter") {
    BufferManager.clear();
    return false;
  }

  // Xử lý gõ phím chính
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    const lastChar = BufferManager.get().slice(-1);
    const result = TelexEngine.checkTransformation(lastChar, key);

    if (result) {
      // Gửi lệnh xóa và thay thế
      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: (result.shouldDelete ? "\b" : "") + result.transformed
      });

      // Cập nhật bộ nhớ đệm
      if (result.shouldDelete) {
        BufferManager.update(BufferManager.get().slice(0, -1) + result.transformed);
      } else {
        BufferManager.add(result.transformed);
      }

      // QUAN TRỌNG: Trả về true để trình duyệt KHÔNG tự gõ phím gốc
      return true; 
    }

    // Nếu không có biến đổi, lưu vào buffer và trả về false để phím hiện bình thường
    BufferManager.add(key.toLowerCase());
    return false;
  }

  return false;
});