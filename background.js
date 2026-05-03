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
  if (keyData.ctrlKey || keyData.altKey) return false;

  const key = keyData.key;

  // =====================
  // BACKSPACE
  // =====================
  if (key === "Backspace") {

    if (BufferManager.hasData()) {

      BufferManager.removeLast();

      if (BufferManager.hasData()) {
        chrome.input.ime.setComposition({
          contextID: activeContextID,
          text: BufferManager.get(),
          cursor: BufferManager.get().length
        });
      } else {
        chrome.input.ime.clearComposition({
          contextID: activeContextID
        });
      }

      return true;
    }

    return false;
  }

  // =====================
  // ENTER (FIX CHUẨN)
  // =====================
  if (key === "Enter") {

    // Nếu đang gõ → commit + xuống dòng
    if (BufferManager.hasData()) {

      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: BufferManager.get() + "\n"
      });

      chrome.input.ime.clearComposition({
        contextID: activeContextID
      });

      BufferManager.clear();
      return true;
    }

    // Không gõ → để hệ thống xử lý Enter
    return false;
  }

  // =====================
  // SPACE
  // =====================
  if (key === " ") {

    if (BufferManager.hasData()) {

      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: BufferManager.get() + " "
      });

      chrome.input.ime.clearComposition({
        contextID: activeContextID
      });

      BufferManager.clear();
      return true;
    }

    return false;
  }

  // =====================
  // A-Z
  // =====================
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {

    const buffer = BufferManager.get();
    const newText = TelexEngine.process(buffer, key);

    BufferManager.update(newText);

    chrome.input.ime.setComposition({
      contextID: activeContextID,
      text: newText,
      cursor: newText.length
    });

    return true;
  }

  return false;
});