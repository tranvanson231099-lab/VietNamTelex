import { BufferManager } from './core/buffer-manager.js';
import { TelexEngine } from './core/telex-engine.js';

// KHAI BÁO BIẾN Ở ĐÂY ĐỂ TRÁNH LỖI ReferenceError
let activeContextID = 0;

if (chrome.input && chrome.input.ime) {

  // Cập nhật ID khi người dùng nhấn vào ô nhập liệu
  chrome.input.ime.onFocus.addListener((context) => {
    activeContextID = context.contextID;
    BufferManager.clear();
  });

  // Xóa ID khi người dùng rời khỏi ô nhập liệu
  chrome.input.ime.onBlur.addListener((contextID) => {
    if (activeContextID === contextID) {
      activeContextID = 0;
      BufferManager.clear();
    }
  });

  // Lắng nghe phím bấm
  chrome.input.ime.onKeyEvent.addListener((engineID, keyData, requestId) => {
    // 1. Nếu là phím nhả ra (keyup) hoặc không có ô nhập liệu -> Cho qua
    if (keyData.type === "keyup" || activeContextID === 0) return false;

    // 2. Nếu dùng phím chức năng (Ctrl, Alt) -> Cho qua
    if (keyData.ctrlKey || keyData.altKey) return false;

    const key = keyData.key;

    // 3. Xử lý xóa (Backspace)
    if (key === "Backspace") {
      BufferManager.removeLast();
      return false; 
    }

    // 4. Xử lý phím ngắt từ (Space, Enter)
    if (key === " " || key === "Enter" || key === "Tab") {
      BufferManager.clear();
      return false;
    }

    // 5. Xử lý gõ chữ cái
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
      const lastChar = BufferManager.get().slice(-1);
      const result = TelexEngine.checkTransformation(lastChar, key);

      if (result) {
        // Có biến đổi Telex
        chrome.input.ime.commitText({
          contextID: activeContextID,
          text: (result.shouldDelete ? "\b" : "") + result.transformed
        });

        // Cập nhật buffer
        if (result.shouldDelete) {
          BufferManager.update(BufferManager.get().slice(0, -1) + result.transformed);
        } else {
          BufferManager.add(result.transformed);
        }

        return true; // CHẶN PHÍM GỐC: Tránh lỗi lặp chữ (aa -> aâ)
      }

      // Không phải Telex: Lưu vào buffer và để hệ thống gõ phím gốc
      BufferManager.add(key.toLowerCase());
      return false;
    }

    return false; // Mặc định cho qua
  });
}