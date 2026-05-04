// import { VietnameseVowelMap, ToneMap } from './vietnamese_vowel_map.js';

export const TelexEngine = {
  // vowelMap: VietnameseVowelMap,

  initialConsonants: [
    "ngh", "ng", "nh", "ch", "tr", "ph", "th", "kh", "gi", "qu",
    "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x"
  ],

  normalize(rawInput) {
    console.log(rawInput);
  }

  // normalize(rawInput) {
  //   if (!rawInput) return "";

  //   let raw = rawInput.toLowerCase();

    // // 1. Tách dấu thanh
    // let toneKey = "";
    // let base = raw;
    // for (let i = raw.length - 1; i >= 0; i--) {
    //   if ("sfrxjz".includes(raw[i])) {
    //     toneKey = raw[i];
    //     base = raw.slice(0, i) + raw.slice(i + 1);
    //     break;
    //   }
    }

    // // 2. Xác định âm đầu
    // let head = "";
    // let remaining = base;
    // for (let cons of this.initialConsonants) {
    //   if (remaining.startsWith(cons)) {
    //     head = cons;
    //     remaining = remaining.slice(cons.length);
    //     break;
    //   }
    // }

  //   // 3. Phần còn lại là nguyên âm + âm cuối
  //   let nucleus = remaining.replace(/[^aeiouyăâêôơưw]/g, ''); // chỉ giữ nguyên âm
  //   let coda = remaining.replace(nucleus, '');

  //   // Thay thế w → uw, aw, ow...
  //   let processed = nucleus
  //     .replace(/aw/g, "aw")
  //     .replace(/ow/g, "ow")
  //     .replace(/uw/g, "uw")
  //     .replace(/w/g, "uw");

  //   // 4. Tra cứu trong VowelMap
  //   let resultNucleus = processed; // fallback

  //   const searchKeys = Object.keys(this.vowelMap).sort((a, b) => b.length - a.length);

  //   for (let key of searchKeys) {
  //     if (processed === key || processed.startsWith(key)) {
  //       const entries = this.vowelMap[key];
  //       const toneIndex = ToneMap[toneKey] || 0;

  //       if (entries && entries[toneIndex]) {
  //         resultNucleus = entries[toneIndex].char;
  //         break;
  //       }
  //     }
  //   }

  //   // Nếu không tìm thấy, thử cách thay thế cơ bản
  //   if (resultNucleus === processed) {
  //     resultNucleus = this.basicReplace(processed);
  //   }

  //   const finalText = head + resultNucleus + coda;

  //   return this.formatCase(finalText, rawInput);
  // },

  // // Thay thế cơ bản khi map không match
  // basicReplace(str) {
  //   return str
  //     .replace(/aw/g, "ă")
  //     .replace(/ow/g, "ơ")
  //     .replace(/uw/g, "ư")
  //     .replace(/w/g, "ư")
  //     .replace(/aa/g, "â")
  //     .replace(/ee/g, "ê")
  //     .replace(/oo/g, "ô")
  //     .replace(/dd/g, "đ");
  // },

  // formatCase(result, original) {
  //   if (original[0] === original[0].toUpperCase()) {
  //     return result.charAt(0).toUpperCase() + result.slice(1);
  //   }
  //   return result;
  // }
};