const TONE_KEYS = ["s", "f", "r", "x", "j"];
const VOWELS = "aăâeêioôơuưy";
const BASE_MAP = { aa: "â", aw: "ă", ee: "ê", oo: "ô", ow: "ơ", uw: "ư", dd: "đ" };
const TONE_MAP = { s: "\u0301", f: "\u0300", r: "\u0309", x: "\u0303", j: "\u0323" };

// =====================
// TelexTransformer (ES5 Style)
// =====================
function TelexTransformer(raw) {
  this.raw = raw;
}

TelexTransformer.prototype.getText = function() {
  return this.transformWord(this.raw);
};

TelexTransformer.prototype.transformWord = function(raw) {
  if (typeof raw !== 'string') return ""; // Defensive check
  if (!this.isVietnamese(raw)) return raw;
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
// Composer (ES5 Style)
// =====================
function Composer() {}

Composer.prototype.transform = function(raw, cursor) {
  let text = "";
  let newCursor = 0;
  let currentWordRaw = "";

  function processWord() {
    if (currentWordRaw) {
      const transformer = new TelexTransformer(currentWordRaw);
      const wordText = transformer.getText() || ""; // Defensive check
      text += wordText;
      currentWordRaw = "";
    }
  }

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (char === ' ' || char === '\n' || char === '\t') {
      processWord();
      text += char;
    } else {
      currentWordRaw += char;
    }
    if (i < cursor) {
        const textForCursor = new TelexTransformer(currentWordRaw).getText() || ""; // Defensive check
        newCursor = text.length + textForCursor.length;
    }
  }
  processWord();

  if (cursor >= raw.length) {
    const remainingText = new TelexTransformer(currentWordRaw).getText() || ""; // Defensive check
    newCursor = text.length + remainingText.length;
  }

  return {
    text: text,
    cursorPos: newCursor
  };
};

// =====================
// SCRIPT LOGIC
// =====================
const composer = new Composer();
let contextID = -1;
let rawBuffer = "";
let cursor = 0;

chrome.input.ime.onFocus.addListener(context => { contextID = context.contextID; });
chrome.input.ime.onBlur.addListener(() => { contextID = -1; rawBuffer = ""; cursor = 0; });
chrome.input.ime.onSurroundingTextChanged.addListener(() => { rawBuffer = ""; cursor = 0; });

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

  if (key === "ArrowLeft") {
    cursor = Math.max(0, cursor - 1);
    render();
    return true;
  }

  if (key === "ArrowRight") {
    cursor = Math.min(rawBuffer.length, cursor + 1);
    render();
    return true;
  }

  if (key === "Enter") {
    if (rawBuffer.length > 0) {
      const { text } = composer.transform(rawBuffer, cursor);
      chrome.input.ime.commitText({ contextID, text });
      chrome.input.ime.clearComposition({ contextID });
      rawBuffer = "";
      cursor = 0;
    }
    return false;
  }

  if (key === " ") {
    if (rawBuffer.length > 0) {
      const { text } = composer.transform(rawBuffer, cursor);
      chrome.input.ime.commitText({ contextID, text: text + " " });
      chrome.input.ime.clearComposition({ contextID });
      rawBuffer = "";
      cursor = 0;
      return true;
    }
    return false;
  }

  if (key.length === 1) {
    rawBuffer = rawBuffer.slice(0, cursor) + key + rawBuffer.slice(cursor);
    cursor++;
    render();
    return true;
  }

  return false;
});

function render() {
  if (contextID === -1) return;
  const transformResult = composer.transform(rawBuffer, cursor) || {}; // Defensive check
  const text = transformResult.text || ""; // Defensive check
  const cursorPos = transformResult.cursorPos || 0; // Defensive check
  
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
