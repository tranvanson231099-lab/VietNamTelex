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

// =====================
// FULL TRANSFORM
// =====================
function transformFull(raw, cursor) {
  let words = splitWords(raw);

  let result = "";
  let newCursor = 0;

  for (let w of words) {
    let transformed = transformWord(w.text);

    if (cursor >= w.start && cursor <= w.end) {
      let local = cursor - w.start;
      newCursor = result.length + Math.min(local, transformed.length);
    }

    result += transformed;
  }

  return { text: result.normalize("NFC"), cursorPos: newCursor };
}

// =====================
// SPLIT WORD
// =====================
function splitWords(text) {
  let words = [];
  let start = 0;

  for (let i = 0; i <= text.length; i++) {
    if (i === text.length || text[i] === " ") {
      words.push({
        text: text.slice(start, i),
        start,
        end: i
      });

      if (i < text.length) {
        words.push({
          text: " ",
          start: i,
          end: i + 1
        });
      }

      start = i + 1;
    }
  }

  return words;
}

// =====================
// TRANSFORM WORD
// =====================
function transformWord(raw) {
  if (!isVietnamese(raw)) return raw;

  let tone = extractTone(raw);
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

  chars = chars.map(removeTone);

  if (!tone) return chars.join("");

  let idx = findMainVowel(chars);
  if (idx === -1) return chars.join("");

  chars[idx] = addTone(chars[idx], tone);

  return chars.join("");
}

// =====================
function extractTone(raw) {
  for (let i = raw.length - 1; i >= 0; i--) {
    if (TONE_KEYS.includes(raw[i])) return raw[i];
  }
  return null;
}

// =====================
// FIX nhận diện
function isVietnamese(raw) {
  if (/[ăâêôơưđáàảãạ]/i.test(raw)) return false;
  return /(aa|aw|ee|oo|ow|uw|dd|[sfrxj])/i.test(raw);
}

// =====================
function removeTone(c) {
  return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function addTone(c, t) {
  return (removeTone(c) + TONE_MAP[t]).normalize("NFC");
}

// =====================
// FIND MAIN VOWEL
// =====================
function findMainVowel(chars) {
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