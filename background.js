import { BufferManager } from './core/buffer-manager.js';
import { TelexEngine } from './core/telex-engine.js';

let activeContextID = 0;

// =====================
// FOCUS
// =====================
chrome.input.ime.onFocus.addListener((c) => {
  activeContextID = c.contextID;
  BufferManager.clear();
});

// =====================
// BLUR
// =====================
chrome.input.ime.onBlur.addListener(() => {
  activeContextID = 0;
  BufferManager.clear();
});

// =====================
// KEY EVENT
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {

  if (keyData.type !== "keydown" || activeContextID === 0) return false;

  // Không chặn Ctrl/Cmd
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

      const newText = TelexEngine.normalize(BufferManager.get());
      BufferManager.update(newText);

      if (newText) {
        chrome.input.ime.setComposition({
          contextID: activeContextID,
          text: newText,
          cursor: newText.length
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

    const raw = BufferManager.get() + key;

    const newText = TelexEngine.normalize(raw);

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