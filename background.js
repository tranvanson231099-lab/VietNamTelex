let contextID = -1;
let buffer = "";

chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  buffer = "";
});

chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown") return false;
  if (contextID === -1) return false;

  const key = keyData.key;

  // SPACE = commit từ
  if (key === " ") {
    chrome.input.ime.commitText({
      contextID,
      text: buffer + " "
    });

    chrome.input.ime.clearComposition({ contextID });
    buffer = "";
    return true;
  }

  // chỉ nhận ký tự thường
  if (key.length !== 1) return false;

  buffer += key;

  // 🔥 chỉ bôi đen từ đang gõ
  chrome.input.ime.setComposition({
    contextID,
    text: buffer,
    selectionStart: 0,
    selectionEnd: buffer.length
  });

  return true;
});