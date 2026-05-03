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

  // Danh sách phụ âm đầu (ưu tiên dài trước ngắn)
  initialConsonants: [
    "ngh", "ng", "nh", "ch", "tr", "ph", "th", "kh", "gi", "qu",
    "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x"
  ],

  normalize(word) {
    let raw = word.toLowerCase();

    // 1. Xử lý các ký tự đặc biệt
    let processed = raw
      .replace(/dd/g, "đ")
      .replace(/aa/g, "â")
      .replace(/ee/g, "ê")
      .replace(/oo/g, "ô")
      .replace(/aw/g, "ă")
      .replace(/uw/g, "ư")
      .replace(/ow/g, "ơ")
      .replace(/w/g, "ư");   // w cuối cùng thành ư

    // 2. Tách dấu thanh (lấy dấu cuối cùng)
    let tone = "";
    let content = processed;
    for (let i = processed.length - 1; i >= 0; i--) {
      if ("sfrxj".includes(processed[i])) {
        tone = processed[i];
        content = processed.slice(0, i) + processed.slice(i + 1);
        break;
      }
    }
    if (!tone) return processed;

    // 3. Phân tích cấu trúc âm tiết: Phụ âm đầu - Nguyên âm - Âm cuối
    const { head, vowels, tail } = this.parseSyllable(content);

    if (!vowels) return processed;

    // 4. Xác định nguyên âm mang dấu
    const markedVowels = this.applyTone(vowels, tail, tone);

    return head + markedVowels + tail;
  },

  // Phân tích âm tiết chi tiết
  parseSyllable(str) {
    let head = "";
    let remaining = str;

    // Tìm phụ âm đầu dài nhất
    for (let init of this.initialConsonants) {
      if (remaining.startsWith(init)) {
        head = init;
        remaining = remaining.slice(init.length);
        break;
      }
    }

    // Phần còn lại là nguyên âm + âm cuối
    const vowelRegex = /^([aeiouyăâêôơư]+)(.*)$/;
    const match = remaining.match(vowelRegex);

    if (!match) {
      return { head: str, vowels: "", tail: "" };
    }

    return {
      head,
      vowels: match[1],
      tail: match[2]
    };
  },

  // Áp dụng dấu thanh theo quy tắc tiếng Việt
  applyTone(vowels, tail, tone) {
    const v = vowels;
    let targetIdx = 0;

    if (v.length === 1) {
      targetIdx = 0;
    } 
    else if (v.length === 2) {
      // Các cặp nguyên âm ưu tiên dấu ở chữ sau
      if (["oa", "oe", "uy", "ue", "uô", "yê", "iê", "ia", "ua"].includes(v)) {
        targetIdx = 1;
      } else {
        targetIdx = 0;
      }

      // Nếu có âm cuối thì dấu thường rơi vào nguyên âm thứ 2
      if (tail.length > 0) {
        targetIdx = 1;
      }
    } 
    else if (v.length === 3) {
      // Ví dụ: oai, uye, iêu, uôi, etc.
      targetIdx = 1; // Nguyên âm giữa thường mang dấu
    }

    const charToMark = v[targetIdx];
    const markedChar = this.toneMap[charToMark]?.[tone] || charToMark;

    return v.substring(0, targetIdx) + markedChar + v.substring(targetIdx + 1);
  },

  process(buffer, key) {
    return this.normalize(buffer + key);
  }
};