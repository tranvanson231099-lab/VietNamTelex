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

  vowelToneRules: {
    "oa": 1, "oe": 1, "uy": 1, "uo": 1, "uô": 1,
    "ie": 1, "ia": 1, "ya": 1, "yu": 1,
    "ươ": 1, "ưu": 1, "ơu": 1,
    "ai": 1, "ay": 1, "âu": 1, "ôu": 1,
    "uyê": 1, "uôi": 1, "oai": 1, "iêu": 1
  },

  initialConsonants: [
    "ngh", "ng", "nh", "ch", "tr", "ph", "th", "kh", "gi", "qu",
    "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x"
  ],

  normalize(rawInput) {
    if (!rawInput) return "";

    const raw = rawInput.toLowerCase();

    // Tách dấu thanh trước
    let tone = "";
    let base = raw;
    for (let i = raw.length - 1; i >= 0; i--) {
      if ("sfrxj".includes(raw[i])) {
        tone = raw[i];
        base = raw.slice(0, i) + raw.slice(i + 1);
        break;
      }
    }

    // Thay thế đặc biệt
    let text = base
      .replace(/dd/g, "đ")
      .replace(/aa/g, "â")
      .replace(/ee/g, "ê")
      .replace(/oo/g, "ô")
      .replace(/aw/g, "ă")
      .replace(/ow/g, "ơ")
      .replace(/uw/g, "ư")
      .replace(/w/g, "ư");

    if (!tone) return this.formatCase(text, rawInput);

    const { head, nucleus, coda } = this.parseSyllable(text);
    if (!nucleus) return this.formatCase(text, rawInput);

    const marked = this.applyTone(nucleus, coda, tone);

    return this.formatCase(head + marked + coda, rawInput);
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
    return match 
      ? { head, nucleus: match[1], coda: match[2] }
      : { head: str, nucleus: "", coda: "" };
  },

  applyTone(nucleus, coda, tone) {
    let v = nucleus;
    let target = v.length > 1 ? 1 : 0;   // mặc định rơi vào nguyên âm sau

    // Áp dụng quy tắc đặc biệt
    if (this.vowelToneRules[v] !== undefined) {
      target = this.vowelToneRules[v];
    }

    // Ưu tiên khi có âm cuối (rất quan trọng cho vanw, sonw...)
    if (coda.length > 0 && v.length >= 2) {
      target = 1;
    }

    const char = v[target];
    const markedChar = this.toneMap[char]?.[tone] || char;

    return v.slice(0, target) + markedChar + v.slice(target + 1);
  },

  formatCase(result, original) {
    if (original[0] === original[0].toUpperCase()) {
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  }
};