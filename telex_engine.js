// =====================
// CONSTANTS
// =====================
const TONE_KEYS = ["s", "f", "r", "x", "j"];
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

// =====================
// WORD STATE
// =====================
class WordState {
  constructor(raw = "") {
    this.raw = raw;
    this.chars = [];
    this.tone = null;
    this.build();
  }

  build() {
    this.chars = [];
    this.tone = null;

    for (let k of this.raw) {
      this._input(k);
    }
  }

  _input(k) {
    // ===== tone key
    if (TONE_KEYS.includes(k)) {
      this.tone = k; // overwrite → bỏ dấu tự do
      return;
    }

    const last = this.chars[this.chars.length - 1] || "";
    const pair = last + k;

    // ===== ƯU TIÊN: uow → ươ
    if (this._endsWith("uo") && k === "w") {
      this.chars.pop();
      this.chars.pop();
      this.chars.push("ư", "ơ");
      return;
    }

    // ===== dd
    if (pair === "dd") {
      this.chars.pop();
      this.chars.push("đ");
      return;
    }

    // ===== aa, aw...
    if (BASE_MAP[pair]) {
      this.chars.pop();
      this.chars.push(BASE_MAP[pair]);
      return;
    }

    // ===== giữ nguyên (KHÔNG phá phụ âm)
    this.chars.push(k);
  }

  _endsWith(s) {
    return this.chars.join("").endsWith(s);
  }

  // =====================
  // TEXT OUTPUT
  // =====================
  getText() {
    let out = [...this.chars];

    // ===== không có telex → trả raw (fix tiếng Anh)
    if (!this.tone && !this.hasTelexPattern()) {
      return this.raw;
    }

    // ===== remove tone cũ
    out = out.map(c => removeToneChar(c));

    const idx = this._findMainVowel(out);
    if (idx === -1) return out.join("");

    if (this.tone) {
      out[idx] = addTone(out[idx], this.tone);
    }

    return out.join("");
  }

  hasTelexPattern() {
    return /(aa|aw|ee|oo|ow|uw|dd)/.test(this.raw);
  }

  // =====================
  // FIND MAIN VOWEL (FIX CHUẨN)
  // =====================
  _findMainVowel(chars) {
    const word = chars.join("");
    let v = [];

    for (let i = 0; i < chars.length; i++) {
      if (VOWELS.includes(chars[i])) v.push(i);
    }

    if (v.length === 0) return -1;

    // qu, gi
    if (word.startsWith("qu")) return v[1] || v[0];
    if (word.startsWith("gi")) return v[1] || v[0];

    if (v.length === 1) return v[0];

    if (v.length === 2) {
      const pair = chars[v[0]] + chars[v[1]];
      if (["oa", "oe", "uy"].includes(pair)) return v[1];
      return v[0];
    }

    if (v.length === 3) return v[1];

    return v[0];
  }
}

// =====================
// MULTI WORD ENGINE
// =====================
class TelexEngine {
  constructor() {
    this.raw = "";
    this.cursor = 0;
  }

  reset() {
    this.raw = "";
    this.cursor = 0;
  }

  insert(k) {
    this.raw =
      this.raw.slice(0, this.cursor) +
      k +
      this.raw.slice(this.cursor);

    this.cursor++;
  }

  backspace() {
    if (this.cursor === 0) return;

    this.raw =
      this.raw.slice(0, this.cursor - 1) +
      this.raw.slice(this.cursor);

    this.cursor--;
  }

  moveLeft() {
    this.cursor = Math.max(0, this.cursor - 1);
  }

  moveRight() {
    this.cursor = Math.min(this.raw.length, this.cursor + 1);
  }

  build() {
    let result = "";
    let cursorPos = 0;
    let i = 0;

    while (i <= this.raw.length) {
      let start = i;

      while (i < this.raw.length && this.raw[i] !== " ") i++;

      let rawWord = this.raw.slice(start, i);
      let state = new WordState(rawWord);
      let textWord = state.getText();

      if (this.cursor >= start && this.cursor <= i) {
        let local = this.cursor - start;
        cursorPos = result.length + Math.min(local, textWord.length);
      }

      result += textWord;

      if (i < this.raw.length) {
        result += " ";
        if (this.cursor === i) cursorPos = result.length;
      }

      i++;
    }

    return {
      text: result.normalize("NFC"),
      cursor: cursorPos
    };
  }
}

// =====================
// HELPERS
// =====================
function removeToneChar(c) {
  return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function addTone(char, toneKey) {
  const base = removeToneChar(char);
  return (base + TONE_MAP[toneKey]).normalize("NFC");
}