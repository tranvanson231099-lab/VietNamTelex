export const IMEBuffer = {
  text: "",
  cursor: 0,

  insert(char) {
    const before = this.text.slice(0, this.cursor);
    const after = this.text.slice(this.cursor);

    this.text = before + char + after;
    this.cursor++;
  },

  deleteBackward() {
    if (this.cursor <= 0) return;

    this.text =
      this.text.slice(0, this.cursor - 1) +
      this.text.slice(this.cursor);

    this.cursor--;
  }
};