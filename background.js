const TONE_KEYS = ["s","f","r","x","j"];
const VOWELS = "aăâeêioôơuưy";

const BASE_MAP = {
  aa: "â", aw: "ă",
  ee: "ê",
  oo: "ô", ow: "ơ",
  uw: "ư",
  dd: "đ"
};

const TONE_MAP = {
  s: "\u0301",
  f: "\u0300",
  r: "\u0309",
  x: "\u0303",
  j: "\u0323"
};

class TelexTransformer {
  constructor(raw) {
    this.raw = raw;
  }

  getText() {
    return this.transformWord(this.raw);
  }

  transformWord(raw) {
    if (!this.isVietnamese(raw)) return raw;

    let tone = this.extractTone(raw);
    let chars = [];

    for (let i = 0; i < raw.length; i++) {
      let k = raw[i];

      if (TONE_KEYS.includes(k)) continue;

      let last = chars[chars.length - 1] || "";
      let pair = last + k;

      // ✅ FIX ươ
      if (
        chars.length >= 2 &&
        chars[chars.length - 2] === "u" &&
        chars[chars.length - 1] === "o" &&
        k === "w"
      ) {
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

    chars = chars.map(this.removeTone);

    if (!tone) return chars.join("");

    let idx = this.findMainVowel(chars);
    if (idx === -1) return chars.join("");

    chars[idx] = this.addTone(chars[idx], tone);

    return chars.join("").normalize("NFC");
  }

  extractTone(raw) {
    for (let i = raw.length - 1; i >= 0; i--) {
      if (TONE_KEYS.includes(raw[i])) return raw[i];
    }
    return null;
  }

  isVietnamese(raw) {
    if (/[ăâêôơưđáàảãạ]/i.test(raw)) return false;
    return /(aa|aw|ee|oo|ow|uw|dd|[sfrxj])/i.test(raw);
  }

  removeTone(c) {
    return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  addTone(c, t) {
    return (this.removeTone(c) + TONE_MAP[t]).normalize("NFC");
  }

  findMainVowel(chars) {
    let v = [];

    for (let i = 0; i < chars.length; i++) {
      if (VOWELS.includes(chars[i])) v.push(i);
    }

    if (v.length === 0) return -1;

    const word = chars.join("");

    if (word.startsWith("qu")) return v[1] || v[0];
    if (word.startsWith("gi")) return v[1] || v[0];

    if (v.length === 1) return v[0];

    if (v.length === 2) {
      const [i1, i2] = v;

      if (i2 < chars.length - 1) return i2;

      const pair = chars[i1] + chars[i2];
      if (["oa","oe","uy"].includes(pair)) return i2;

      return i1;
    }

    if (v.length === 3) return v[1];

    return v[0];
  }
}

// This file handles the composition of multiple words and cursor mapping.
class Composer {
  transform(raw, cursor) {
    let text = "";
    let newCursor = 0;
    let currentWordRaw = "";

    function processWord() {
      if (currentWordRaw) {
        const transformer = new TelexTransformer(currentWordRaw);
        const wordText = transformer.getText();
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
        newCursor = text.length + currentWordRaw.length;
      }
    }
    processWord();

    const finalTransformer = new TelexTransformer(currentWordRaw);
    const remainingText = finalTransformer.getText();
    
    if (cursor >= raw.length) {
       newCursor = text.length + remainingText.length;
    }

    return {
        text: text + remainingText,
        cursorPos: newCursor
    };
  }
}

const composer = new Composer();

let contextID = -1;

let rawBuffer = "";
let cursor = 0;

// =====================
// FOCUS / BLUR
// =====================
chrome.input.ime.onFocus.addListener((context) => {
  contextID = context.contextID;
});

chrome.input.ime.onBlur.addListener(() => {
  contextID = -1;
  rawBuffer = "";
  cursor = 0;
});

// FIX click chuột
chrome.input.ime.onSurroundingTextChanged.addListener(() => {
  rawBuffer = "";
  cursor = 0;
});

// =====================
// KEY EVENT
// =====================
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type !== "keydown" || contextID === -1) return false;

  const key = keyData.key;

  // ✅ không chặn phím hệ thống
  if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) {
    return false;
  }

  // =====================
// BACKSPACE
// =====================
  if (key === "Backspace") {
    if (cursor > 0) {
      rawBuffer =
        rawBuffer.slice(0, cursor - 1) +
        rawBuffer.slice(cursor);
      cursor--;
      render();
      return true;
    }
    return false;
  }

  // =====================
  // ARROW
  // =====================
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

  // =====================
  // ENTER
  // =====================
  if (key === "Enter") {
    if (rawBuffer.length > 0) {
      const { text } = composer.transform(rawBuffer, cursor);

      chrome.input.ime.commitText({
        contextID,
        text
      });

      chrome.input.ime.clearComposition({ contextID });

      rawBuffer = "";
      cursor = 0;
    }

    return false; // giữ hành vi xuống dòng
  }

  // =====================
  // SPACE
  // =====================
  if (key === " ") {
    if (rawBuffer.length > 0) {
      const { text } = composer.transform(rawBuffer, cursor);

      chrome.input.ime.commitText({
        contextID,
        text: text + " "
      });

      chrome.input.ime.clearComposition({ contextID });

      rawBuffer = "";
      cursor = 0;
      return true;
    }
    return false;
  }

  // =====================
  // TEXT INPUT
  // =====================
  if (
    key.length === 1 &&
    !keyData.ctrlKey &&
    !keyData.altKey &&
    !keyData.metaKey
  ) {
    rawBuffer =
      rawBuffer.slice(0, cursor) +
      key +
      rawBuffer.slice(cursor);

    cursor++;
    render();
    return true;
  }

  return false;
});

// =====================
// RENDER
// =====================
function render() {
  const { text, cursorPos } = composer.transform(rawBuffer, cursor);

  chrome.input.ime.setComposition({
    contextID,
    text,
    cursor: cursorPos,
    selectionStart: cursorPos,
    selectionEnd: cursorPos,
    segments: [
      {
        start: 0,
        end: text.length,
        style: "noUnderline" // ✅ FIX crash
      }
    ]
  });
}
