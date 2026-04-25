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
// KEY EVENT (RAW PASS THROUGH)
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) {
    return false;
  }

  // bỏ Ctrl / Alt / Meta
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    return false;
  }

  // forward toàn bộ phím về Chrome
  chrome.input.ime.sendKeyEvents({
    contextID,
    keyData: [keyData]
  });

  return true;
});