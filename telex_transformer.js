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
function transformWord(raw) {
  if (!isVietnamese(raw)) return raw;

  const tone = extractTone(raw);
  let chars = buildBase(raw).map(removeTone);

  if (!tone) return chars.join("");

  const idx = findMainVowel(chars);
  if (idx === -1) return chars.join("");

  chars[idx] = addTone(chars[idx], tone);
  return chars.join("");
}

// =====================
function buildBase(raw) {
  let chars = [];

  for (let i = 0; i < raw.length; i++) {
    let k = raw[i];

    if (TONE_KEYS.includes(k)) continue;

    let last = chars[chars.length - 1] || "";
    let pair = last + k;

    if (chars.join("").endsWith("uo") && k === "w") {
      chars.pop(); chars.pop();
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

  return chars;
}

// =====================
function extractTone(raw) {
  for (let i = raw.length - 1; i >= 0; i--) {
    if (TONE_KEYS.includes(raw[i])) return raw[i];
  }
  return null;
}

// =====================
function isVietnamese(raw) {
  return /(aa|aw|ee|oo|ow|uw|dd|[sfrxj])/i.test(raw);
}

// =====================
function removeTone(c) {
  return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function addTone(c, tone) {
  return (removeTone(c) + TONE_MAP[tone]).normalize("NFC");
}

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
    const pair = chars[v[0]] + chars[v[1]];
    if (["oa", "oe", "uy"].includes(pair)) return v[1];
    return v[0];
  }

  if (v.length === 3) return v[1];

  return v[0];
}