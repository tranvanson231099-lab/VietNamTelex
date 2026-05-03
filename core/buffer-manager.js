// Quản lý bộ nhớ đệm cho các phím đã gõ
export const BufferManager = {
    currentBuffer: "",
  
    // Thêm phím mới vào hàng đợi
    add: function(char) {
      this.currentBuffer += char.toLowerCase();
    },
  
    // Xóa ký tự cuối khi người dùng nhấn Backspace
    removeLast: function() {
      this.currentBuffer = this.currentBuffer.slice(0, -1);
    },
  
    // Xóa sạch bộ đệm khi kết thúc một từ (Space, Enter...)
    clear: function() {
      this.currentBuffer = "";
    },
  
    // Lấy chuỗi ký tự đang lưu trong bộ đệm
    get: function() {
      return this.currentBuffer;
    },
  
    // Cập nhật lại bộ đệm sau khi đã biến đổi Telex (VD: aa thành â)
    update: function(newWord) {
      this.currentBuffer = newWord;
    }
  };