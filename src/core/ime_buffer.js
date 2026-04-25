// ime_buffer.js
export const IMEBuffer = {
  text: "",
  cursor: 0,

  set(text, cursor) {
    this.text = text || "";
    this.cursor = cursor ?? 0;
  },

  reset() {
    this.text = "";
    this.cursor = 0;
  },

  insert(char) {
    this.text =
      this.text.slice(0, this.cursor) +
      char +
      this.text.slice(this.cursor);

    this.cursor += char.length;
  },

  deleteBackward() {
    if (this.cursor <= 0) return;

    this.text =
      this.text.slice(0, this.cursor - 1) +
      this.text.slice(this.cursor);

    this.cursor--;
  }
};