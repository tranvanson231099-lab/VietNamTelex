import { BufferManager } from './core/buffer-manager.js';
import { TelexEngine } from './core/telex-engine.js';

// contextID của input hiện tại
let activeContextID = 0;

// =====================
// FOCUS: khi user click vào ô input
// =====================
chrome.input.ime.onFocus.addListener((c) => {
  activeContextID = c.contextID;

  // reset buffer
  BufferManager.clear();
});

// =====================
// BLUR: khi rời khỏi input
// =====================
chrome.input.ime.onBlur.addListener(() => {
  activeContextID = 0;

  // reset buffer để tránh lỗi
  BufferManager.clear();
});

// =====================
// XỬ LÝ PHÍM
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {

  // Chỉ xử lý keydown
  if (keyData.type !== "keydown" || activeContextID === 0) return false;

  // =====================
  // QUAN TRỌNG:
  // Không chặn shortcut (Ctrl+C, Ctrl+V...)
  // =====================
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    return false;
  }

  const key = keyData.key;

  // =====================
  // BACKSPACE
  // =====================
  if (key === "Backspace") {

    // Nếu đang gõ → IME xử lý
    if (BufferManager.hasData()) {

      // Xóa ký tự trong buffer
      BufferManager.removeLast();

      // Nếu còn chữ → update composition
      if (BufferManager.hasData()) {
        chrome.input.ime.setComposition({
          contextID: activeContextID,
          text: BufferManager.get(),
          cursor: BufferManager.get().length
        });
      } else {
        // Nếu hết → xóa composition
        chrome.input.ime.clearComposition({
          contextID: activeContextID
        });
      }

      return true; // chặn hệ thống
    }

    // Không có buffer → để hệ thống xử lý
    return false;
  }

  // =====================
  // ENTER
  // =====================
  if (key === "Enter") {

    // Nếu đang gõ → commit + xuống dòng
    if (BufferManager.hasData()) {

      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: BufferManager.get() + "\n"
      });

      // Xóa composition
      chrome.input.ime.clearComposition({
        contextID: activeContextID
      });

      BufferManager.clear();
      return true;
    }

    return false;
  }

  // =====================
  // SPACE
  // =====================
  if (key === " ") {

    // Nếu đang gõ → commit từ
    if (BufferManager.hasData()) {

      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: BufferManager.get() + " "
      });

      chrome.input.ime.clearComposition({
        contextID: activeContextID
      });

      BufferManager.clear();
      return true;
    }

    return false;
  }

  // =====================
  // XỬ LÝ CHỮ A-Z
  // =====================
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {

    // Lấy buffer hiện tại
    const buffer = BufferManager.get();

    // Gửi qua Telex engine
    const newText = TelexEngine.process(buffer, key);

    // Update buffer
    BufferManager.update(newText);

    // =====================
    // HIỂN THỊ REALTIME
    // =====================
    chrome.input.ime.setComposition({
      contextID: activeContextID,
      text: newText,
      cursor: newText.length
    });

    return true; // chặn key gốc
  }

  return false;
});