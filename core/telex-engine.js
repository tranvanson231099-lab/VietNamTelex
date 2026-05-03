export const TelexEngine = {

    transformMap: {
      "aa": "â", "ee": "ê", "oo": "ô",
      "aw": "ă", "ow": "ơ", "uw": "ư",
      "dd": "đ"
    },
  
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
  
    process(buffer, key) {
      const lowerKey = key.toLowerCase();
  
      // =====================
      // 1. BIẾN ĐỔI aa, aw...
      // =====================
      const lastChar = buffer.slice(-1);
      const pair = lastChar + lowerKey;
  
      if (this.transformMap[pair]) {
        return buffer.slice(0, -1) + this.transformMap[pair];
      }
  
      // =====================
      // 2. DẤU THANH
      // =====================
      if ("sfrxj".includes(lowerKey)) {
        for (let i = buffer.length - 1; i >= 0; i--) {
          const char = buffer[i];
          const tone = this.toneMap[char];
  
          if (tone && tone[lowerKey]) {
            return buffer.slice(0, i) + tone[lowerKey] + buffer.slice(i + 1);
          }
        }
      }
  
      // =====================
      // 3. KHÔNG BIẾN ĐỔI
      // =====================
      return buffer + key;
    }
  };