export const BufferManager = {
  currentBuffer: "",

  add(char) {
    this.currentBuffer += char; // lưu RAW
  },

  removeLast() {
    this.currentBuffer = this.currentBuffer.slice(0, -1);
  },

  clear() {
    this.currentBuffer = "";
  },

  get() {
    return this.currentBuffer;
  },

  hasData() {
    return this.currentBuffer.length > 0;
  }
};