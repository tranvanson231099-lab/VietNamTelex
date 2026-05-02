const TONE_KEYS = ["s", "f", "r", "x", "j"];
const VOWELS = "aăâeêioôơuưy";
const BASE_MAP = { aa: "â", aw: "ă", ee: "ê", oo: "ô", ow: "ơ", uw: "ư", dd: "đ" };
const TONE_MAP = { s: "\u0301", f: "\u0300", r: "\u0309", x: "\u0303", j: "\u0323" };

// =====================
// TelexTransformer
// =====================
function TelexTransformer(raw) {
  this.raw = raw || "";
}

TelexTransformer.prototype.getText = function() {
  return this.transformWord(this.raw);
};

TelexTransformer.prototype.transformWord = function(raw) {
  if (typeof raw !== 'string' || !this.isVietnamese(raw)) return raw;
  let tone = this.extractTone(raw);
  let chars = [];
  for (let i = 0; i < raw.length; i++) {
    let k = raw[i];
    if (TONE_KEYS.includes(k)) continue;
    let last = chars[chars.length - 1] || "";
    let pair = last + k;
    if (chars.length >= 2 && chars[chars.length - 2] === "u" && chars[chars.length - 1] === "o" && k === "w") {
      chars.pop();
      chars.pop();
      chars.push("ư", "ơ");
      continue;
    }
    if (pair === "dd") {
      chars.pop();
      chars.push("đ");
      continue;
    }
    if (BASE_MAP[pair]) {
      chars.pop();
      chars.push(BASE_MAP[pair]);
      continue;
    }
    chars.push(k);
  }
  chars = chars.map(c => this.removeTone(c));
  if (!tone) return chars.join("");
  let idx = this.findMainVowel(chars);
  if (idx === -1) return chars.join("");
  chars[idx] = this.addTone(chars[idx], tone);
  return chars.join("").normalize("NFC");
};

TelexTransformer.prototype.extractTone = function(raw) {
  for (let i = raw.length - 1; i >= 0; i--) {
    if (TONE_KEYS.includes(raw[i])) return raw[i];
  }
  return null;
};

TelexTransformer.prototype.isVietnamese = function(raw) {
  if (/[ăâêôơưđáàảãạ]/i.test(raw)) return false;
  return /(aa|aw|ee|oo|ow|uw|dd|[sfrxj])/i.test(raw);
};

TelexTransformer.prototype.removeTone = function(c) {
  return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

TelexTransformer.prototype.addTone = function(c, t) {
  return (this.removeTone(c) + TONE_MAP[t]).normalize("NFC");
};

TelexTransformer.prototype.findMainVowel = function(chars) {
  let v = [];
  for (let i = 0; i < chars.length; i++) {
    if (VOWELS.includes(chars[i])) v.push(i);
  }
  if (v.length === 0) return -1;
  const word = chars.join("");
  if (word.startsWith("qu") || word.startsWith("gi")) return v[1] || v[0];
  if (v.length === 1) return v[0];
  if (v.length === 2) {
    const [i1, i2] = v;
    if (i2 < chars.length - 1) return i2;
    const pair = chars[i1] + chars[i2];
    if (["oa", "oe", "uy"].includes(pair)) return i2;
    return i1;
  }
  if (v.length === 3) return v[1];
  return v[0];
};

// =====================
// Composer
// =====================
function Composer() {}

Composer.prototype.transform = function(raw, cursor) {
  raw = String(raw || '');
  const rawToCursor = raw.slice(0, cursor);
  const transformedToCursor = new TelexTransformer(rawToCursor).getText() || "";
  const newCursor = transformedToCursor.length;
  const transformedText = new TelexTransformer(raw).getText() || "";
  return {
    text: transformedText,
    cursorPos: newCursor,
  };
};

// =====================
// SCRIPT LOGIC & STATE MANAGEMENT
// =====================
const composer = new Composer();
let contextID = -1;
let rawBuffer = "";
let cursor = 0;

// A robust lock to prevent race conditions from onSurroundingTextChanged.
let isComposing = false;
let compositionLockTimeout = null;

function lockComposition() {
    isComposing = true;
    if (compositionLockTimeout) {
        clearTimeout(compositionLockTimeout);
    }
    compositionLockTimeout = setTimeout(() => {
        isComposing = false;
    }, 100); // A 100ms lock is enough to debounce multiple spurious events.
}

// =====================
// EVENT LISTENERS
// =====================

chrome.input.ime.onFocus.addListener(context => {
    contextID = context.contextID;
    rawBuffer = "";
    cursor = 0;
});

chrome.input.ime.onBlur.addListener(() => {
    contextID = -1;
    rawBuffer = "";
    cursor = 0;
});

chrome.input.ime.onSurroundingTextChanged.addListener(() => {
    // If the change was caused by our own composition, the lock will be active.
    if (isComposing) {
        return; // Ignore the event.
    }
    // Otherwise, it was a manual change (e.g., mouse click), so reset state.
    rawBuffer = "";
    cursor = 0;
});

chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) return false;

  const key = keyData.key;

  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) return false;

  if (key === "Backspace") {
    if (cursor > 0) {
      rawBuffer = rawBuffer.slice(0, cursor - 1) + rawBuffer.slice(cursor);
      cursor--;
      render();
      return true;
    }
    return false;
  }

  if (key === "ArrowLeft" || key === "ArrowRight") { // Handle both arrows
    cursor = key === "ArrowLeft" ? Math.max(0, cursor - 1) : Math.min(rawBuffer.length, cursor + 1);
    render();
    return true;
  }

  if (key === "Enter") {
    if (rawBuffer.length > 0) {
        const { text } = composer.transform(rawBuffer, cursor);
        lockComposition();
        chrome.input.ime.commitText({ contextID, text });
        rawBuffer = "";
        cursor = 0;
    }
    return false; // Allow default Enter behavior (e.g., new line).
  }

  if (key === " ") {
    if (rawBuffer.length > 0) {
        const { text } = composer.transform(rawBuffer, cursor);
        lockComposition();
        chrome.input.ime.commitText({ contextID, text: text + " " });
        rawBuffer = "";
        cursor = 0;
        return true;
    }
    return false; // Allow default space behavior.
  }

  // Handle character input
  if (key.length === 1 && !/[\s]/.test(key)) {
    rawBuffer = rawBuffer.slice(0, cursor) + key + rawBuffer.slice(cursor);
    cursor++;
    render();
    return true;
  }

  return false;
});

function render() {
  if (contextID === -1) return;
  
  const { text, cursorPos } = composer.transform(rawBuffer, cursor);
  
  lockComposition(); // Activate the lock before updating the composition.
  chrome.input.ime.setComposition({
    contextID,
    text,
    cursor: cursorPos,
    segments: [{
      start: 0,
      end: text.length,
      style: "noUnderline"
    }]
  });
}
