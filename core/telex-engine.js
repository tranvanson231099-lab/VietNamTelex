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
  // NORMALIZE (FIX NUỐT s f r x j)
  // =====================
  normalize(word) {
    let base = word.toLowerCase();

    // 1. Biến đổi nguyên âm
    base = base
      .replace(/dd/g, "đ")
      .replace(/aa/g, "â")
      .replace(/aw/g, "ă")
      .replace(/ee/g, "ê")
      .replace(/oo/g, "ô")
      .replace(/ow/g, "ơ")
      .replace(/uw/g, "ư");

    // 2. Kiểm tra có nguyên âm không
    const hasVowel = /[aeiouyăâêôơư]/.test(base);

    // ❗ KHÔNG có nguyên âm → không xử lý dấu
    if (!hasVowel) return base;

    // 3. Tách dấu (chỉ khi có nguyên âm)
    let tone = "";
    let clean = "";

    for (let c of base) {
      if ("sfrxj".includes(c)) {
        tone = c; // lấy dấu cuối cùng
      } else {
        clean += c;
      }
    }

    if (!tone) return clean;

    // 4. Đặt dấu
    for (let i = clean.length - 1; i >= 0; i--) {
      const char = clean[i];
      const toneMap = this.toneMap[char];

      if (toneMap && toneMap[tone]) {
        return clean.slice(0, i) + toneMap[tone] + clean.slice(i + 1);
      }
    }

    return clean;
  },

  process(buffer, key) {
    return this.normalize(buffer + key);
  }
};