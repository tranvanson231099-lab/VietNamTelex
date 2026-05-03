export const TelexEngine = {

  toneMap: {
    a: { s: "á", f: "à", r: "ả", x: "ã", j: "ạ" },
    ă: { s: "ắ", f: "ằ", r: "ẳ", x: "ẵ", j: "ặ" },
    â: { s: "ấ", f: "ầ", r: "ẩ", x: "ẫ", j: "ậ" },

    e: { s: "é", f: "è", r: "ẻ", x: "ẽ", j: "ẹ" },
    ê: { s: "ế", f: "ề", r: "ể", x: "ễ", j: "ệ" },

    i: { s: "í", f: "ì", r: "ỉ", x: "ĩ", j: "ị" },

    o: { s: "ó", f: "ò", r: "ỏ", x: "õ", j: "ọ" },
    ô: { s: "ố", f: "ồ", r: "ổ", x: "ỗ", j: "ộ" },
    ơ: { s: "ớ", f: "ờ", r: "ở", x: "ỡ", j: "ợ" },

    u: { s: "ú", f: "ù", r: "ủ", x: "ũ", j: "ụ" },
    ư: { s: "ứ", f: "ừ", r: "ử", x: "ữ", j: "ự" },

    y: { s: "ý", f: "ỳ", r: "ỷ", x: "ỹ", j: "ỵ" }
  },

  // =====================
  // ÂM ĐẦU
  // =====================
  initialConsonants: [
    "ngh", "ng", "nh", "ch", "tr", "ph", "th", "kh", "gi", "qu",
    "b","c","d","đ","g","h","k","l","m","n","p","q","r","s","t","v","x"
  ],

  // =====================
  // NORMALIZE
  // =====================
  normalize(rawInput) {
    if (!rawInput) return "";

    let raw = rawInput.toLowerCase();

    // =====================
    // 1. TÁCH DẤU
    // =====================
    let tone = "";
    raw = raw.replace(/[sfrxj]/g, (m) => {
      tone = m;
      return "";
    });

    // =====================
    // 2. TELEX → UTF
    // =====================
    raw = raw
      .replace(/dd/g, "đ")
      .replace(/aa/g, "â")
      .replace(/aw/g, "ă")
      .replace(/ee/g, "ê")
      .replace(/oo/g, "ô")
      .replace(/ow/g, "ơ")
      .replace(/uw/g, "ư");

    // =====================
    // 3. TÁCH ÂM ĐẦU (FIX TR)
    // =====================
    let head = "";
    let rest = raw;

    for (let cons of this.initialConsonants) {
      if (raw.startsWith(cons)) {
        head = cons;
        rest = raw.slice(cons.length);
        break;
      }
    }

    // =====================
    // 4. TÌM NGUYÊN ÂM
    // =====================
    const chars = rest.split("");
    const vowels = [];
    const vowelRegex = /[aeiouyăâêôơư]/;

    for (let i = 0; i < chars.length; i++) {
      if (vowelRegex.test(chars[i])) {
        vowels.push(i);
      }
    }

    if (vowels.length === 0 || !tone) {
      return this.formatCase(head + rest, rawInput);
    }

    // =====================
    // 5. CHỌN VỊ TRÍ ĐẶT DẤU
    // =====================
    let target;

    if (vowels.length === 1) {
      target = vowels[0];
    } else if (vowels.length === 2) {
      const pair = chars[vowels[0]] + chars[vowels[1]];

      if (["oa", "oe", "uy"].includes(pair)) {
        target = vowels[0];
      } else {
        target = vowels[1];
      }
    } else {
      target = vowels[1];
    }

    // =====================
    // 6. ÁP DẤU
    // =====================
    const char = chars[target];
    const marked = this.toneMap[char]?.[tone];

    if (marked) {
      chars[target] = marked;
    }

    const result = head + chars.join("");
    return this.formatCase(result, rawInput);
  },

  // =====================
  // GIỮ HOA CHỮ
  // =====================
  formatCase(result, original) {
    if (!original) return result;
    if (original[0] === original[0].toUpperCase()) {
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  }
};