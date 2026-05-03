// ===============================
// TELEX ENGINE
// Xử lý logic biến đổi tiếng Việt
// ===============================
export const TelexEngine = {

    // =====================
    // BIẾN ĐỔI NGUYÊN ÂM
    // aa → â, aw → ă, ...
    // =====================
    transformMap: {
      "aa": "â", "ee": "ê", "oo": "ô",
      "aw": "ă", "ow": "ơ", "uw": "ư",
      "dd": "đ"
    },
  
    // =====================
    // BẢNG DẤU THANH
    // key: nguyên âm
    // value: map dấu s,f,r,x,j
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
    // HÀM XỬ LÝ CHÍNH
    // =====================
    process(buffer, key) {
  
      // Chuẩn hóa key về lowercase để xử lý logic
      const lowerKey = key.toLowerCase();
  
      // =====================
      // 1. BIẾN ĐỔI aa, aw...
      // =====================
  
      // Lấy ký tự cuối buffer
      const lastChar = buffer.slice(-1);
  
      // Ghép thành cặp
      const pair = lastChar + lowerKey;
  
      // Nếu có rule → biến đổi
      if (this.transformMap[pair]) {
        return buffer.slice(0, -1) + this.transformMap[pair];
      }
  
      // =====================
      // 2. XỬ LÝ DẤU THANH
      // =====================
  
      // Nếu key là dấu
      if ("sfrxj".includes(lowerKey)) {
  
        // Duyệt từ phải → trái
        for (let i = buffer.length - 1; i >= 0; i--) {
  
          const char = buffer[i];
  
          // Lấy bảng dấu của ký tự đó
          const tone = this.toneMap[char];
  
          // Nếu có thể đặt dấu
          if (tone && tone[lowerKey]) {
  
            // Thay ký tự đó bằng ký tự có dấu
            return buffer.slice(0, i) + tone[lowerKey] + buffer.slice(i + 1);
          }
        }
      }
  
      // =====================
      // 3. KHÔNG BIẾN ĐỔI
      // =====================
  
      // Thêm key vào cuối buffer
      return buffer + key;
    }
  };