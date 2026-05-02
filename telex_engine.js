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
    if (TONE_KEYS.includes(k)) {
      this.tone = k; // overwrite => đổi dấu tự do
      return;
    }

    // ===== base transform incremental
    const last = this.chars[this.chars.length - 1] || "";
    const pair = last + k;

    // uow → ươ
    if (this._endsWith("uo") && k === "w") {
      this.chars.pop();
      this.chars.pop();
      this.chars.push("ư", "ơ");
      return;
    }

    // dd
    if (pair === "dd") {
      this.chars.pop();
      this.chars.push("đ");
      return;
    }

    // aa, aw, ...
    if (BASE_MAP[pair]) {
      this.chars.pop();
      this.chars.push(BASE_MAP[pair]);
      return;
    }

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

    if (!this.tone) return out.join("");

    const idx = this._findMainVowel(out);
    if (idx === -1) return out.join("");

    out[idx] = addTone(out[idx], this.tone);
    return out.join("");
  }

  // =====================
  // RULE TIẾNG VIỆT
  // =====================
  _findMainVowel(chars) {
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
      const pair = chars[v[0]] + chars[v[1]];
      if (["oa", "oe", "uy", "oy"].includes(pair)) return v[1];
      return v[0];
    }

    if (v.length === 3) return v[1];

    return v[0];
  }
}

// =====================
// ENGINE MULTI WORD
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

  // =====================
  // INPUT
  // =====================
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

  // =====================
  // BUILD FULL TEXT
  // =====================
  build() {
    let result = "";
    let cursorPos = 0;
    let index = 0;

    while (index <= this.raw.length) {
      let start = index;

      // find word
      while (index < this.raw.length && this.raw[index] !== " ") {
        index++;
      }

      let wordRaw = this.raw.slice(start, index);
      let state = new WordState(wordRaw);
      let wordText = state.getText();

      // cursor mapping
      if (this.cursor >= start && this.cursor <= index) {
        const local = this.cursor - start;
        cursorPos = result.length + Math.min(local, wordText.length);
      }

      result += wordText;

      // space
      if (index < this.raw.length) {
        result += " ";
        if (this.cursor === index) {
          cursorPos = result.length;
        }
      }

      index++;
    }

    return {
      text: result.normalize("NFC"),
      cursorPos: cursorPos
    };
  }
}

function transformFull(raw, cursor) {
  const engine = new TelexEngine();
  engine.raw = raw;
  engine.cursor = cursor;
  return engine.build();
}

// =====================
// TONE APPLY
// =====================
function addTone(char, toneKey) {
  const base = char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return (base + TONE_MAP[toneKey]).normalize("NFC");
}
