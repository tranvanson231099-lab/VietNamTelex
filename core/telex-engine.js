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

  // Quy tắc vị trí dấu cho nguyên âm kép và ba
  vowelToneRules: {
    "oa": 1, "oe": 1, "uy": 1, "uo": 1, "uô": 1,
    "ie": 1, "ia": 1, "ya": 1, "yu": 1,
    "ươ": 1, "ưu": 1, "ơu": 1, "uơ": 1,
    "ai": 1, "ay": 1, "âu": 1, "ôu": 1,
    "uyê": 1, "uye": 1, "uôi": 1, "oai": 1, "oay": 1, "iêu": 1, "uây": 1
  },

  initialConsonants: [
    "ngh", "ng", "nh", "ch", "tr", "ph", "th", "kh", "gi", "qu",
    "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x"
  ],

  normalize(rawInput) {
    if (!rawInput) return "";
    
    let raw = rawInput.toLowerCase();

    // ==================== 1. XÁC ĐỊNH DẤU THANH ====================
    let tone = "";
    let base = raw;
    for (let i = raw.length - 1; i >= 0; i--) {
      if ("sfrxj".includes(raw[i])) {
        tone = raw[i];
        base = raw.slice(0, i) + raw.slice(i + 1);
        break;
      }
    }

    // ==================== 2. XÁC ĐỊNH ÂM ĐẦU ====================
    let head = "";
    let remaining = base;

    for (let cons of this.initialConsonants) {
      if (remaining.startsWith(cons)) {
        head = cons;
        remaining = remaining.slice(cons.length);
        break;
      }
    }

    // ==================== 3. XỬ LÝ NGUYÊN ÂM (1, 2, 3) + ÂM CUỐI ====================
    const { nucleus, coda } = this.parseVowels(remaining);

    // Thay thế ký tự đặc biệt (aw, ow, w...) sau khi tách âm đầu
    let processedNucleus = nucleus
      .replace(/aw/g, "ă")
      .replace(/ow/g, "ơ")
      .replace(/uw/g, "ư")
      .replace(/w/g, "ư");

    if (!tone) {
      const result = head + processedNucleus + coda;
      return this.formatCase(result, rawInput);
    }

    // Áp dụng dấu thanh vào nguyên âm
    const markedNucleus = this.applyTone(processedNucleus, coda, tone);

    const finalResult = head + markedNucleus + coda;
    return this.formatCase(finalResult, rawInput);
  },

  // Xử lý nguyên âm 1 - 2 - 3 ký tự
  parseVowels(str) {
    const match = str.match(/^([aeiouyăâêôơư]*)([a-z]*)$/);
    if (!match) return { nucleus: str, coda: "" };

    return {
      nucleus: match[1],
      coda: match[2]
    };
  },

  applyTone(nucleus, coda, tone) {
    if (!nucleus) return nucleus;

    let v = nucleus;
    let target = 0;

    if (v.length === 1) {
      target = 0;
    } else if (v.length >= 2) {
      target = this.vowelToneRules[v] !== undefined ? this.vowelToneRules[v] : 1;
    }

    // Ưu tiên khi có âm cuối (quan trọng cho vanw, sonw, ...n)
    if (coda.length > 0 && v.length >= 2) {
      target = 1;
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