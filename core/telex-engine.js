import { VietnameseVowelMap, ToneMap } from './core/vietnamese_vowel_map.js';
// import { VietnamesePhonology } from './vietnamese_phonology.js'; // nếu cần dùng sau

export const TelexEngine = {
  // Sử dụng map chi tiết từ file của bạn
  vowelMap: VietnameseVowelMap,

  // Phụ âm đầu (kết hợp từ phonology)
  initialConsonants: [
    "ngh", "ng", "nh", "ch", "tr", "ph", "th", "kh", "gi", "qu",
    "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x"
  ],

  normalize(rawInput) {
    if (!rawInput) return "";

    const raw = rawInput.toLowerCase();

    // 1. XÁC ĐỊNH DẤU THANH
    let toneKey = "";
    let base = raw;
    for (let i = raw.length - 1; i >= 0; i--) {
      if ("sfrxj".includes(raw[i])) {   // z cũng có thể thêm nếu cần
        toneKey = raw[i];
        base = raw.slice(0, i) + raw.slice(i + 1);
        break;
      }
    }

    // 2. XÁC ĐỊNH ÂM ĐẦU
    let head = "";
    let remaining = base;
    for (let cons of this.initialConsonants) {
      if (remaining.startsWith(cons)) {
        head = cons;
        remaining = remaining.slice(cons.length);
        break;
      }
    }

    // 3. XỬ LÝ NGUYÊN ÂM + ÂM CUỐI
    const { nucleus, coda } = this.parseVowels(remaining);

    // Thay thế đặc biệt cho nguyên âm
    let processed = nucleus
      .replace(/aw/g, "aw")
      .replace(/ow/g, "ow")
      .replace(/uw/g, "uw")
      .replace(/w/g, "uw");   // w đơn → uw (ư)

    // Tìm trong VowelMap
    let resultNucleus = processed;

    // Thử các key trong map (ưu tiên key dài)
    const keys = Object.keys(this.vowelMap).sort((a, b) => b.length - a.length);

    for (let key of keys) {
      if (processed === key || processed.startsWith(key)) {
        const entries = this.vowelMap[key];
        const toneIndex = ToneMap[toneKey] || 0;

        if (entries && entries[toneIndex]) {
          resultNucleus = entries[toneIndex].char;
          break;
        }
      }
    }

    const finalText = head + resultNucleus + coda;

    return this.formatCase(finalText, rawInput);
  },

  parseVowels(str) {
    // Tách nguyên âm và âm cuối
    const match = str.match(/^([aeiouyăâêôơưw]+)([a-z]*)$/);
    if (!match) return { nucleus: str, coda: "" };

    return {
      nucleus: match[1],
      coda: match[2]
    };
  },

  formatCase(result, original) {
    if (original[0] === original[0].toUpperCase()) {
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  }
};