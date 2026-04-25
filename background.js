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
  // Chỉ xử lý khi có context và là keydown
  if (contextID === -1 || keyData.type !== 'keydown') {
    return false;
  }

  // Chỉ xử lý các phím in được (có độ dài là 1)
  if (keyData.key.length === 1) {
    chrome.input.ime.commitText({
      contextID: contextID,
      text: keyData.key
    });
    // Đã xử lý, không để trình duyệt gõ lại
    return true;
  }

  // Cho phép các phím khác (Backspace, Enter, mũi tên...) hoạt động bình thường
  return false;
});
