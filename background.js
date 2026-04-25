let contextID = -1;

// Khi focus vào ô nhập
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

// Khi blur
chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
});

// Xử lý phím
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown") return false;

  // chỉ xử lý khi đang focus input
  if (contextID === -1) return false;

  // bỏ qua phím đặc biệt (Shift, Ctrl, Alt,...)
  if (keyData.key.length !== 1) return false;

  // commit ngay ký tự
  chrome.input.ime.commitText({
    contextID,
    text: keyData.key
  });

  return true;
});