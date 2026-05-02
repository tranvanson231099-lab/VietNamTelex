// This file contains the pure transformation logic for a single Telex word.

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

const VOWEL_TABLE = {
  a: "aàáảãạ",
  ă: "ăằắẳẵặ",
  â: "âầấẩẫậ",
  e: "eèéẻẽẹ",
  ê: "êềếểễệ",
  i: "iìíỉĩị",
  o: "oòóỏõọ",
  ô: "ôồốổỗộ",
  ơ: "ơờớởỡợ",
  u: "uùúủũụ",
  ư: "ưừứửữự",
  y: "yỳýỷỹỵ"
};

// =====================
// HELPERS
// =====================
function removeToneChar(c) {
  for (let key in VOWEL_TABLE) {
    if (VOWEL_TABLE[key].includes(c)) return key;
  }
  return c;
}

function addTone(char, toneKey) {
  const base = removeToneChar(char);
  const toneIndex = ["", "f", "s", "r", "x", "j"].indexOf(toneKey);
  if (toneIndex === -1) return char;
  const toneName = ["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"];
  const tone = toneName[toneIndex];

  for (let key in VOWEL_TABLE) {
    if (key === base) {
        const index = {
            "ngang": 0, "huyền": 1, "sắc": 2, "hỏi": 3, "ngã": 4, "nặng": 5
        }[tone];
        return VOWEL_TABLE[key][index] || key;
    }
  }
  return char;
}

// =====================
// WORD STATE (TELEX TRANSFORMER)
// =====================
class TelexTransformer {
  constructor(raw = "") {
    this.raw = raw;
    this.chars = [];
    this.tone = null;
    this.hasTelex = false;
    this.build();
  }

  build() {
    this.chars = [];
    this.tone = null;
    this.hasTelex = false;

    for (let k of this.raw) {
      this._input(k);
    }
  }

  _input(k) {
    if (TONE_KEYS.includes(k)) {
      this.tone = k;
      this.hasTelex = true;
      return;
    }

    const last = this.chars.length > 0 ? this.chars[this.chars.length - 1] : "";
    const pair = last + k;

    if (this._endsWith("uo") && k === "w") {
      this.chars.pop();
      this.chars.pop();
      this.chars.push("ư", "ơ");
      this.hasTelex = true;
      return;
    }

    if (BASE_MAP[pair]) {
      this.chars.pop();
      this.chars.push(BASE_MAP[pair]);
      this.hasTelex = true;
      return;
    }

    this.chars.push(k);
  }

  _endsWith(s) {
    return this.chars.join("").endsWith(s);
  }

  getText() {
    if (!this.hasTelex && !this.tone) {
        return this.raw;
    }

    let out = this.chars.map(c => removeToneChar(c));

    if (this.tone) {
        const idx = this._findMainVowel(out);
        if (idx !== -1) {
            out[idx] = addTone(out[idx], this.tone);
        }
    }
    return out.join("");
  }
  
  _findMainVowel(chars) {
    let v = [];

    for (let i = 0; i < chars.length; i++) {
      if (VOWELS.includes(chars[i])) v.push(i);
    }

    if (v.length === 0) return -1;

    const word = chars.join("");

    if (word.startsWith("qu") || word.startsWith("gi")) {
        return v.length > 1 ? v[1] : v[0];
    }

    if (v.length >= 2) {
        const pair = chars[v[0]] + chars[v[1]];
        if (["oa", "oe", "uy", "oy"].includes(pair)) return v[1];
        if (v.length === 3) return v[1];
        return v[0];
    }

    return v[0];
  }
}
