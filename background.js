let contextID = -1;

// =====================
// FOCUS
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

// =====================
// BLUR
// =====================
chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
});

// =====================
// KEY EVENT (PASS THROUGH)
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) {
    return false;
  }

  // bỏ phím hệ thống
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    return false;
  }

  // ❌ KHÔNG xử lý gì cả
  // ❌ KHÔNG buffer
  // ❌ KHÔNG composition
  // ❌ KHÔNG commit

  return false; // 👉 trả lại Chrome xử lý bình thường
});