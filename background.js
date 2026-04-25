import { IMEBuffer } from "./src/core/ime_buffer.js";
import { CursorManager } from "./src/core/cursor_manager.js";

let contextID = -1;

// =====================
// FOCUS
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
  IMEBuffer.reset();
});

// =====================
// BLUR
// =====================
chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  IMEBuffer.reset();
});

// =====================
// SYNC FROM CHROME TEXT
// =====================
chrome.input.ime.onSurroundingTextChanged.addListener((engineID, info) => {
  if (!info) return;

  IMEBuffer.set(info.text, info.focus);
});

// =====================
// RENDER COMPOSITION
// =====================
function render() {
  if (contextID === -1) return;

  const word = CursorManager.getWord(
    IMEBuffer.text,
    IMEBuffer.cursor
  );

  console.log("TEXT:", IMEBuffer.text);
  console.log("CURSOR:", IMEBuffer.cursor);
  console.log("WORD:", word);

  chrome.input.ime.setComposition({
    contextID,
    text: IMEBuffer.text,
    cursor: IMEBuffer.cursor
  });
}

// =====================
// COMMIT
// =====================
function commit(extra = "") {
  if (contextID === -1) return;

  chrome.input.ime.commitText({
    contextID,
    text: IMEBuffer.text + extra
  });

  IMEBuffer.reset();

  chrome.input.ime.setComposition({
    contextID,
    text: "",
    cursor: 0
  });
}

// =====================
// KEY EVENT
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) return false;

  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) return false;

  // =====================
  // BACKSPACE
  // =====================
  if (keyData.key === "Backspace") {
    IMEBuffer.deleteBackward();
    render();
    return true;
  }

  // =====================
  // SPACE
  // =====================
  if (keyData.key === " ") {
    commit(" ");
    return true;
  }

  // =====================
  // ENTER
  // =====================
  if (keyData.key === "Enter") {
    commit("\n");
    return true;
  }

  // =====================
  // NORMAL CHAR
  // =====================
  if (keyData.key && keyData.key.length === 1) {
    IMEBuffer.insert(keyData.key);
    render();
    return true; // IMPORTANT: BLOCK SYSTEM INPUT
  }

  return false;
});