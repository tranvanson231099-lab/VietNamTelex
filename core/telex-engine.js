// telex-engine.js
export const TelexEngine = {

    // =====================
    // BIẾN ĐỔI NGUYÊN ÂM
    // =====================
    transformMap: {
      "aa": "â",
      "ee": "ê",
      "oo": "ô",
      "aw": "ă",
      "ow": "ơ",
      "uw": "ư",
      "dd": "đ"
    },
  
    // =====================
    // DẤU THANH
    // =====================
    toneMap: {
      "a": { s: "á", f: "à", r: "ả", x: "ã", j: "ạ" },
      "ă": { s: "ắ", f: "ằ", r: "ẳ", x: "ẵ", j: "ặ" },
      "â": { s: "ấ", f: "ầ", r: "ẩ", x: "ẫ", j: "ậ" },
  
      "e": { s: "é", f: "è", r: "ẻ", x: "ẽ", j: "ẹ" },
      "ê": { s: "ế", f: "ề", r: "ể", x: "ễ", j: "ệ" },
  
      "i": { s: "í", f: "ì", r: "ỉ", x: "ĩ", j: "ị" },
  
      "o": { s: "ó", f: "ò", r: "ỏ", x: "õ", j: "ọ" },
      "ô": { s: "ố", f: "ồ", r: "ổ", x: "ỗ", j: "ộ" },
      "ơ": { s: "ớ", f: "ờ", r: "ở", x: "ỡ", j: "ợ" },
  
      "u": { s: "ú", f: "ù", r: "ủ", x: "ũ", j: "ụ" },
      "ư": { s: "ứ", f: "ừ", r: "ử", x: "ữ", j: "ự" },
  
      "y": { s: "ý", f: "ỳ", r: "ỷ", x: "ỹ", j: "ỵ" }
    },
  
    // =====================
    // XỬ LÝ CHÍNH
    // =====================
    process: function(buffer, key) {
      key = key.toLowerCase();
  
      // 1. Kiểm tra biến đổi aa, aw,...
      const last2 = buffer.slice(-1) + key;
      if (this.transformMap[last2]) {
        return {
          text: buffer.slice(0, -1) + this.transformMap[last2],
          replace: true
        };
      }
  
      // 2. Kiểm tra dấu thanh
      if ("sfrxj".includes(key)) {
        for (let i = buffer.length - 1; i >= 0; i--) {
          const char = buffer[i];
          const tone = this.toneMap[char];
  
          if (tone && tone[key]) {
            return {
              text: buffer.slice(0, i) + tone[key] + buffer.slice(i + 1),
              replace: true
            };
          }
        }
      }
  
      // 3. Không biến đổi
      return {
        text: buffer + key,
        replace: false
      };
    }
  };