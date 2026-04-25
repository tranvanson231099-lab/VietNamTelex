export const IMEBuffer = {
  text: "",
  cursor: 0,

  insert(char) {
    const before = this.text.slice(0, this.cursor);
    const after = this.text.slice(this.cursor);

    this.text = before + char + after;
    this.cursor++;
  },

  moveCursor(delta) {
    this.cursor = Math.max(0, Math.min(this.text.length, this.cursor + delta));
  },

  deleteBackward() {
    if (this.cursor <= 0) return;

    const before = this.text.slice(0, this.cursor - 1);
    const after = this.text.slice(this.cursor);

    this.text = before + after;
    this.cursor--;
  }
};