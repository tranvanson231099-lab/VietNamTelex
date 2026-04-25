let contextID = -1;

// Gán ID khi ô nhập liệu được chọn
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

// Reset khi thoát ô nhập liệu
chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
});

// Xử lý sự kiện bàn phím
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  // Chỉ xử lý khi nhấn phím xuống (keydown)
  if (keyData.type !== "keydown") return false;

  // Bỏ qua nếu đang nhấn tổ hợp phím chức năng (Ctrl, Alt, Meta)
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) return false;

  /**
   * KIỂM TRA PHÍM CHỮ (a-z):
   * keyData.code của các phím chữ luôn có định dạng "KeyA", "KeyB",... "KeyZ"
   * Cách này loại bỏ mọi phím hệ thống (Space, Enter, Backspace) mà không cần lập danh sách.
   */
  if (keyData.code.startsWith("Key")) {
    chrome.input.ime.commitText({
      contextID: contextID,
      text: keyData.key
    });

    return true; // Đã xử lý, chặn trình duyệt tự gõ ký tự gốc
  }

  // Mọi phím khác (số, ký tự đặc biệt, phím điều hướng) -> Để hệ thống tự xử lý
  return false;
});