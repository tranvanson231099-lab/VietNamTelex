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

  // Quy tắc vị trí đặt dấu cho nguyên âm kép và ba
  vowelToneRules: {
    // Nguyên âm 2 chữ - Dấu rơi vào vị trí thứ mấy (0-based)
    "oa": 1, "oe": 1, "uy": 1, "uo": 1, "uô": 1,
    "ie": 1, "ia": 1, "ya": 1, "yu": 1,
    "ươ": 1, "ưu": 1, "ơu": 1, "uơ": 1,
    "ôu": 1, "âu": 1, "ai": 1, "ay": 1,
    
    // Nguyên âm 3 chữ
    "uyê": 1, "uye": 1, "uôi": 1, "oai": 1, 
    "oay": 1, "iêu": 1, "uây": 1, "uă": 1
  },

  initialConsonants: [
    "ngh", "ng", "nh", "ch", "tr", "ph", "th", "kh", "gi", "qu",
    "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x"
  ],

  normalize(rawInput) {
    let raw = rawInput.toLowerCase();
    if (!raw) return "";

    // Thay thế ký tự đặc biệt
    let text = raw
      .replace(/dd/g, "đ")
      .replace(/aa/g, "â")
      .replace(/ee/g, "ê")
      .replace(/oo/g, "ô")
      .replace(/aw/g, "ă")
      .replace(/ow/g, "ơ")
      .replace(/uw/g, "ư")
      .replace(/w/g, "ư");

    // Tách dấu thanh
    let tone = "";
    let content = text;
    for (let i = text.length - 1; i >= 0; i--) {
      if ("sfrxj".includes(text[i])) {
        tone = text[i];
        content = text.slice(0, i) + text.slice(i + 1);
        break;
      }
    }

    if (!tone) return this.formatCase(content, rawInput);

    const { head, nucleus, coda } = this.parseSyllable(content);
    if (!nucleus) return this.formatCase(content, rawInput);

    const markedNucleus = this.applyTone(nucleus, coda, tone);

    return this.formatCase(head + markedNucleus + coda, rawInput);
  },

  parseSyllable(str) {
    let head = "";
    let remaining = str;

    for (let cons of this.initialConsonants) {
      if (remaining.startsWith(cons)) {
        head = cons;
        remaining = remaining.slice(cons.length);
        break;
      }
    }

    const match = remaining.match(/^([aeiouyăâêôơư]+)([a-z]*)$/);
    if (!match) {
      return { head: str, nucleus: "", coda: "" };
    }

    return {
      head,
      nucleus: match[1],
      coda: match[2]
    };
  },

  applyTone(nucleus, coda, tone) {
    const v = nucleus;
    let target = 0;

    if (v.length === 1) {
      target = 0;
    } 
    else if (v.length === 2 || v.length === 3) {
      // Dùng bảng quy tắc đã khai báo
      target = this.vowelToneRules[v] ?? 1;   // mặc định rơi vào vị trí thứ 2
    }

    // Nếu có âm cuối, ưu tiên dịch chuyển dấu ra sau (quy tắc phổ biến)
    if (coda.length > 0 && v.length >= 2) {
      target = Math.max(target, 1);
    }

    const char = v[target];
    const marked = this.toneMap[char]?.[tone] || char;

    return v.slice(0, target) + marked + v.slice(target + 1);
  },

  formatCase(result, original) {
    if (original[0] === original[0].toUpperCase()) {
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  }
};