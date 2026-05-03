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

  initialConsonants: [
    "ngh", "ng", "nh", "ch", "tr", "ph", "th", "kh", "gi", "qu",
    "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x"
  ],

  normalize(rawInput) {
    let raw = rawInput.toLowerCase().trim();

    if (!raw) return "";

    // Ưu tiên thứ tự thay thế quan trọng (giống mobile Telex)
    let text = raw
      .replace(/dd/g, "đ")
      .replace(/aa/g, "â")
      .replace(/ee/g, "ê")
      .replace(/oo/g, "ô")
      .replace(/aw/g, "ă")
      .replace(/ow/g, "ơ")
      .replace(/uw/g, "ư")
      .replace(/w/g, "ư");           // w đơn lẻ → ư

    // Tách dấu thanh (lấy dấu cuối cùng như mobile)
    let tone = "";
    let content = text;
    for (let i = text.length - 1; i >= 0; i--) {
      if ("sfrxj".includes(text[i])) {
        tone = text[i];
        content = text.slice(0, i) + text.slice(i + 1);
        break;
      }
    }

    if (!tone) return text;

    const { head, vowels, tail } = this.parseSyllable(content);

    if (!vowels) return text;

    const markedVowels = this.applyTone(vowels, tail, tone);

    return head + markedVowels + tail;
  },

  parseSyllable(str) {
    let head = "";
    let remaining = str;

    // Phụ âm đầu (ưu tiên dài trước)
    for (let init of this.initialConsonants) {
      if (remaining.startsWith(init)) {
        head = init;
        remaining = remaining.slice(init.length);
        break;
      }
    }

    // Tách nguyên âm + âm cuối
    // Cho phép nhiều nguyên âm hơn (oai, uye, iêu...)
    const vowelMatch = remaining.match(/^([aeiouyăâêôơư]+)(.*)$/);

    if (!vowelMatch) {
      return { head: str, vowels: "", tail: "" };
    }

    return {
      head,
      vowels: vowelMatch[1],
      tail: vowelMatch[2]
    };
  },

  applyTone(vowels, tail, tone) {
    let v = vowels;
    let target = 0;

    if (v.length === 1) {
      target = 0;
    } 
    else if (v.length === 2) {
      // Quy tắc mobile phổ biến
      if (tail.length > 0 || 
          /^(oa|oe|uy|uô|uo|ie|ia|ya|yu)/.test(v)) {
        target = 1;                    // dấu rơi vào nguyên âm thứ 2
      } else {
        target = 0;
      }
    } 
    else if (v.length >= 3) {
      // oai, uye, iêu, uôi, ayê...
      target = 1; // thường là nguyên âm giữa
    }

    const char = v[target];
    const marked = this.toneMap[char]?.[tone] || char;

    return v.slice(0, target) + marked + v.slice(target + 1);
  }
};