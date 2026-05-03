// background.js
import { BufferManager } from './core/buffer-manager.js';
import { TelexEngine } from './core/telex-engine.js';

chrome.input.ime.onKeyEvent.addListener((engineID, keyData, requestId) => {
  if (keyData.type === "keyup" || activeContextID === 0) return false;
  if (keyData.ctrlKey || keyData.altKey) return false;

  const key = keyData.key;

  // Xử lý phím đơn
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    const lastChar = BufferManager.get().slice(-1);
    const result = TelexEngine.checkTransformation(lastChar, key);

    if (result) {
      // BƯỚC QUAN TRỌNG: Gửi lệnh commit
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

      // TRẢ VỀ TRUE: Để ngăn hệ thống gõ thêm phím 'a' hoặc 'e' thừa vào màn hình
      return true; 
    }

    // Nếu không phải Telex, lưu vào buffer và trả về FALSE để gõ tự nhiên
    BufferManager.add(key.toLowerCase());
    return false;
  }

  return false;
});