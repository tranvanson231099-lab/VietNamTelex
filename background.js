import { CursorManager } from './src/core/cursor_manager.js';

let contextID = -1;

// 1. Theo dõi Focus/Blur để quản lý contextID
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
});

// 2. Cập nhật vị trí con trỏ và dữ liệu văn bản xung quanh
chrome.input.ime.onSurroundingTextChanged.addListener((engineID, info) => {
  if (info) {
    CursorManager.update(info);
    console.log("Cursor Position:", CursorManager.getCursorIndex());
    console.log("Current Word:", CursorManager.getCurrentWord());
  }
});

// 3. Xử lý sự kiện bàn phím
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  // Bỏ qua nếu không phải sự kiện nhấn phím hoặc đang mất focus
  if (keyData.type !== "keydown" || contextID === -1) {
    return false;
  }

  // Bỏ qua nếu có phím chức năng hệ thống (Ctrl, Alt, Meta)
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    return false;
  }

  // CHỈ can thiệp các phím từ a-z (KeyA, KeyB, ..., KeyZ)
  if (keyData.code.startsWith("Key")) {
    
    // Ở ĐÂY LÀ NƠI XỬ LÝ LOGIC TIẾNG VIỆT
    // Bạn có thể dùng CursorManager.getCurrentWord() để phân tích từ cũ
    // Ví dụ: const word = CursorManager.getCurrentWord();
    
    // Gửi văn bản vào ô nhập liệu
    chrome.input.ime.commitText({
      contextID: contextID,
      text: keyData.key
    });

    return true; // Chặn Chrome gõ ký tự gốc (tránh bị lặp chữ)
  }

  // Các phím khác (Số, Backspace, Enter, Space, Điều hướng) -> Trả cho hệ thống xử lý
  return false;
});