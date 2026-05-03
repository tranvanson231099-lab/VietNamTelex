import { BufferManager } from './core/buffer-manager.js';
import { TelexEngine } from './core/telex-engine.js';

let activeContextID = 0;

// FOCUS
chrome.input.ime.onFocus.addListener((c) => {
  activeContextID = c.contextID;
  BufferManager.clear();
});

// BLUR
chrome.input.ime.onBlur.addListener(() => {
  activeContextID = 0;
  BufferManager.clear();
});

// KEY EVENT
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {

  if (keyData.type !== "keydown" || activeContextID === 0) return false;

  // không chặn ctrl
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    return false;
  }

  const key = keyData.key;

  // =====================
  // BACKSPACE
  // =====================
  if (key === "Backspace") {

    if (BufferManager.hasData()) {

      BufferManager.removeLast();

      const raw = BufferManager.get();
      const display = TelexEngine.normalize(raw);

      if (display) {
        chrome.input.ime.setComposition({
          contextID: activeContextID,
          text: display,
          cursor: display.length
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
  // ENTER
  // =====================
  if (key === "Enter") {

    if (BufferManager.hasData()) {

      const text = TelexEngine.normalize(BufferManager.get());

      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: text + "\n"
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
  // SPACE
  // =====================
  if (key === " ") {

    if (BufferManager.hasData()) {

      const text = TelexEngine.normalize(BufferManager.get());

      chrome.input.ime.commitText({
        contextID: activeContextID,
        text: text + " "
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

    // ✅ lưu RAW
    BufferManager.add(key);

    const raw = BufferManager.get();
    const display = TelexEngine.normalize(raw);

    chrome.input.ime.setComposition({
      contextID: activeContextID,
      text: display,
      cursor: display.length
    });

    return true;
  }

  return false;
});