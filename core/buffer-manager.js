// ===============================
// BUFFER MANAGER
// Lưu trạng thái từ đang gõ
// ===============================
export const BufferManager = {

    // Buffer hiện tại (ví dụ: "tran")
    currentBuffer: "",
  
    // =====================
    // THÊM KÝ TỰ
    // =====================
    add(char) {
      this.currentBuffer += char;
    },
  
    // =====================
    // XÓA KÝ TỰ CUỐI
    // =====================
    removeLast() {
      this.currentBuffer = this.currentBuffer.slice(0, -1);
    },
  
    // =====================
    // XÓA TOÀN BỘ
    // =====================
    clear() {
      this.currentBuffer = "";
    },
  
    // =====================
    // LẤY BUFFER
    // =====================
    get() {
      return this.currentBuffer;
    },
  
    // =====================
    // CẬP NHẬT TOÀN BỘ
    // =====================
    update(text) {
      this.currentBuffer = text;
    },
  
    // =====================
    // CHECK CÓ DỮ LIỆU
    // =====================
    hasData() {
      return this.currentBuffer.length > 0;
    }
  };