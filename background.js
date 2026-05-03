import { BufferManager } from './core/buffer-manager.js';

let activeContextID = 0;

if (chrome.input && chrome.input.ime) {

  // Thiết lập ô nhập liệu khi focus
  chrome.input.ime.onFocus.addListener((context) => {
    activeContextID = context.contextID;
    BufferManager.clear();
  });

  chrome.input.ime.onBlur.addListener(() => {
    activeContextID = 0;
    BufferManager.clear();
  });

  chrome.input.ime.onKeyEvent.addListener((engineID, keyData, requestId) => {
    if (keyData.type === "keyup" || activeContextID === 0) return false;
    if (keyData.ctrlKey || keyData.altKey) return false;

    const key = keyData.key;

    // --- XỬ LÝ PHÍM ĐIỀU KHIỂN ---
    if (key === "Backspace") {
      BufferManager.removeLast();
      return false;
    }

    if (key === " " || key === "Enter" || key === "Tab") {
      BufferManager.clear();
      return false;
    }

    // --- XỬ LÝ BIẾN ĐỔI CHỮ CÁI TELEX ---
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
      const char = key.toLowerCase();
      const prevBuffer = BufferManager.get();
      
      // Lấy ký tự cuối cùng trong buffer để so khớp cặp
      const lastChar = prevBuffer.slice(-1); 
      const currentPair = lastChar + char;

      // Bảng quy tắc biến đổi chữ cái (Không có dấu thanh)
      const telexRules = {
        "aa": "â",
        "ee": "ê",
        "oo": "ô",
        "dd": "đ",
        "aw": "ă",
        "uw": "ư",
        "ow": "ơ",
        "w": "ư" // Gõ w đứng riêng lẻ ra ư
      };

      if (telexRules[currentPair]) {
        const transformed = telexRules[currentPair];

        // Thực hiện ghi đè: Xóa ký tự cũ và chèn chữ đã biến đổi
        chrome.input.ime.commitText({
          contextID: activeContextID,
          text: "\b" + transformed
        });

        // Cập nhật buffer: thay ký tự cuối bằng chữ mới
        BufferManager.update(prevBuffer.slice(0, -1) + transformed);
        return true;
      } 
      
      // Trường hợp gõ 'w' khi buffer đang trống hoặc sau một phụ âm (để ra 'ư')
      if (char === "w" && currentPair !== "aw" && currentPair !== "uw" && currentPair !== "ow") {
         chrome.input.ime.commitText({
            contextID: activeContextID,
            text: "ư"
         });
         BufferManager.add("ư");
         return true;
      }

      // Nếu không khớp quy tắc, thêm vào buffer và để hệ thống gõ tự nhiên
      BufferManager.add(char);
      return false;
    }

    return false;
  });
}