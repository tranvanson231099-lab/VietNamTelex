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
  if (keyData.type !== "keydown" || contextID === -1) return false;

  // bỏ Ctrl/Alt/Meta
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) return false;

  // =====================
  // BACKSPACE
  // =====================
  if (keyData.key === "Backspace") {
    chrome.input.ime.sendKeyEvents({
      contextID,
      keyData: [keyData]
    });
    return true;
  }

  // =====================
  // ENTER / SPACE / NORMAL KEYS
  // =====================
  if (keyData.key && keyData.key.length === 1) {
    chrome.input.ime.sendKeyEvents({
      contextID,
      keyData: [keyData]
    });
    return true;
  }

  if (keyData.key === "Enter" || keyData.key === " ") {
    chrome.input.ime.sendKeyEvents({
      contextID,
      keyData: [keyData]
    });
    return true;
  }

  return false;
});