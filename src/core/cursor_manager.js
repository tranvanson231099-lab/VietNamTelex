// cursor_manager.js

export const CursorManager = {
    info: {
      text: "",
      focus: 0,
      anchor: 0,
      textBefore: "",
      textAfter: ""
    },
  
    // Cập nhật dữ liệu từ hệ thống
    update(surroundingInfo) {
      this.info.text = surroundingInfo.text;
      this.info.focus = surroundingInfo.focus;
      this.info.anchor = surroundingInfo.anchor;
      
      // Tách văn bản tại vị trí con trỏ
      this.info.textBefore = surroundingInfo.text.slice(0, surroundingInfo.focus);
      this.info.textAfter = surroundingInfo.text.slice(cursorInfo.focus);
    },
  
    // Lấy từ hiện tại đang gõ (ví dụ: "xin cha" -> "cha")
    getCurrentWord() {
      const words = this.info.textBefore.split(/\s+/);
      return words.length > 0 ? words[words.length - 1] : "";
    },
  
    // Kiểm tra xem người dùng có đang bôi đen (select) văn bản không
    hasSelection() {
      return this.info.focus !== this.info.anchor;
    },
  
    // Lấy tọa độ tương đối (nếu cần xử lý nâng cao)
    getCursorIndex() {
      return this.info.focus;
    }
  };