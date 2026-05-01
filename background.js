let contextID = -1;
let buffer = "";

// =====================
// FOCUS / BLUR
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  buffer = "";
});

// =====================
// KEY EVENT
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown") return false;
  if (contextID === -1) return false;

  const key = keyData.key;

  // =====================
  // BACKSPACE
  // =====================
  if (key === "Backspace") {
    if (buffer.length > 0) {
      buffer = buffer.slice(0, -1);

      if (buffer.length === 0) {
        chrome.input.ime.clearComposition({ contextID });
      } else {
        updateComposition();
      }
      return true;
    }
    return false;
  }

  // =====================
  // SPACE → commit từ
  // =====================
  if (key === " ") {
    if (buffer.length > 0) {
      chrome.input.ime.commitText({
        contextID,
        text: buffer + " "
      });

      chrome.input.ime.clearComposition({ contextID });
      buffer = "";
      return true;
    }
    return false;
  }

  // =====================
  // ENTER → commit
  // =====================
  if (key === "Enter") {
    if (buffer.length > 0) {
      chrome.input.ime.commitText({
        contextID,
        text: buffer
      });

      chrome.input.ime.clearComposition({ contextID });
      buffer = "";
      return true;
    }
    return false;
  }

  // =====================
  // CHỈ NHẬN KÝ TỰ THƯỜNG
  // =====================
  if (key.length !== 1) return false;

  // =====================
  // BUILD WORD
  // =====================
  buffer += key;

  updateComposition();

  return true;
});

// =====================
// UPDATE COMPOSITION
// =====================
function updateComposition() {
  chrome.input.ime.setComposition({
    contextID,
    text: buffer,
    cursor: buffer.length,

    // 👉 KHÔNG bôi đen (UX giống Laban)
    selectionStart: buffer.length,
    selectionEnd: buffer.length,

    // 👉 cố gắng ẩn gạch dưới
    segments: [
      {
        start: 0,
        end: buffer.length,
        style: "none"
      }
    ]
  });
}