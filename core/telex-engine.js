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
  // NORMALIZE (FIX CHUẨN)
  // =====================
  normalize(rawInput) {
    if (!rawInput) return "";

    let raw = rawInput.toLowerCase();

    // ====================
    // 1. LẤY DẤU THANH
    // ====================
    let tone = "";
    raw = raw.replace(/[sfrxj]/g, (m) => {
      tone = m;
      return "";
    });

    // ====================
    // 2. CHUYỂN TELEX → UTF
    // ====================
    raw = raw
      .replace(/dd/g, "đ")
      .replace(/aa/g, "â")
      .replace(/aw/g, "ă")
      .replace(/ee/g, "ê")
      .replace(/oo/g, "ô")
      .replace(/ow/g, "ơ")
      .replace(/uw/g, "ư");

    // ❗ QUAN TRỌNG: KHÔNG replace w → ư

    // ====================
    // 3. TÌM NGUYÊN ÂM
    // ====================
    const vowelRegex = /[aeiouyăâêôơư]/;
    const chars = raw.split("");

    let vowelIndexes = [];

    for (let i = 0; i < chars.length; i++) {
      if (vowelRegex.test(chars[i])) {
        vowelIndexes.push(i);
      }
    }

    if (vowelIndexes.length === 0 || !tone) {
      return this.formatCase(raw, rawInput);
    }

    // ====================
    // 4. CHỌN VỊ TRÍ ĐẶT DẤU
    // ====================
    let targetIndex;

    if (vowelIndexes.length === 1) {
      targetIndex = vowelIndexes[0];
    } else if (vowelIndexes.length === 2) {

      const pair = chars[vowelIndexes[0]] + chars[vowelIndexes[1]];

      // các cặp đặc biệt
      if (["oa", "oe", "uy"].includes(pair)) {
        targetIndex = vowelIndexes[0];
      } else {
        targetIndex = vowelIndexes[1];
      }

    } else {
      // 3 nguyên âm → đánh vào giữa
      targetIndex = vowelIndexes[1];
    }

    // ====================
    // 5. ÁP DỤNG DẤU
    // ====================
    const char = chars[targetIndex];
    const marked = this.toneMap[char]?.[tone];

    if (marked) {
      chars[targetIndex] = marked;
    }

    const result = chars.join("");
    return this.formatCase(result, rawInput);
  },

  formatCase(result, original) {
    if (original[0] === original[0].toUpperCase()) {
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  }
};