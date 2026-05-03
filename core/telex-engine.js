// ===============================
// TELEX ENGINE - FREE STYLE (LABAN LIKE)
// ===============================

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
  // NORMALIZE FREE TELEX
  // =====================
  normalize(word) {
    let base = word.toLowerCase();

    // 1. Biến đổi nguyên âm trước
    base = base
      .replace(/dd/g, "đ")
      .replace(/aa/g, "â")
      .replace(/aw/g, "ă")
      .replace(/ee/g, "ê")
      .replace(/oo/g, "ô")
      .replace(/ow/g, "ơ")
      .replace(/uw/g, "ư");

    // 2. Lấy dấu thanh (giữ dấu cuối cùng)
    let tone = "";
    base = base.replace(/[sfrxj]/g, (m) => {
      tone = m;
      return "";
    });

    if (!tone) return base;

    // 3. Đặt dấu vào nguyên âm gần cuối
    for (let i = base.length - 1; i >= 0; i--) {
      const char = base[i];
      const toneMap = this.toneMap[char];

      if (toneMap && toneMap[tone]) {
        return base.slice(0, i) + toneMap[tone] + base.slice(i + 1);
      }
    }

    return base;
  },

  // =====================
  // PROCESS
  // =====================
  process(buffer, key) {
    const raw = buffer + key;
    return this.normalize(raw);
  }
};