import { BufferManager } from './core/buffer-manager.js';
import { TelexEngine } from './core/telex-engine.js';

let activeContextID = 0;

// =====================
// FOCUS / BLUR
// =====================
chrome.input.ime.onFocus.addListener((c) => {
  activeContextID = c.contextID;
  BufferManager.clear();
});

chrome.input.ime.onBlur.addListener(() => {
  activeContextID = 0;
  BufferManager.clear();
});

// =====================
// KEY EVENT
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || activeContextID === 0) return false;

  // Không chặn các phím hệ thống
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    BufferManager.clear();
    return false;
  }

  const key = keyData.key;

  // =====================
  // BACKSPACE
  // =====================
  if (key === "Backspace") {
    if (BufferManager.hasData()) {
      BufferManager.removeLast();
      updateComposition();
      return true;
    }
    return false;
  }

  // =====================
  // ENTER
  // =====================
  if (key === "Enter") {
    if (BufferManager.hasData()) {
      const text = TelexEngine.normalize(BufferManager.get());
      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: text + "\n"
      });
      clearComposition();
      return true;
    }
    return false;
  }

  // =====================
  // SPACE
  // =====================
  if (key === " ") {
    if (BufferManager.hasData()) {
      const text = TelexEngine.normalize(BufferManager.get());
      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: text + " "
      });
      clearComposition();
      return true;
    }
    return false;
  }

  // =====================
  // A-Z (bao gồm cả hoa)
  // =====================
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    BufferManager.add(key.toLowerCase()); // Telex engine thường xử lý lowercase
    updateComposition();
    return true;
  }

  // =====================
  // Các phím khác (số, dấu, mũi tên, Delete...) → commit nếu đang có buffer
  // =====================
  if (BufferManager.hasData()) {
    const text = TelexEngine.normalize(BufferManager.get());
    chrome.input.ime.commitText({
      contextID: activeContextID,
      text: text + key
    });
    clearComposition();
    return true;
  }

  return false;
});

// =====================
// Helper functions
// =====================
function updateComposition() {
  const raw = BufferManager.get();
  const display = TelexEngine.normalize(raw);

  if (display) {
    chrome.input.ime.setComposition({
      contextID: activeContextID,
      text: display,
      cursor: display.length
    });
  } else {
    chrome.input.ime.clearComposition({ contextID: activeContextID });
  }
}

function clearComposition() {
  chrome.input.ime.clearComposition({ contextID: activeContextID });
  BufferManager.clear();
}