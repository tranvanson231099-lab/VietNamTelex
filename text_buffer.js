class TextBuffer {
  constructor() {
    this.raw = "";
    this.cursor = 0;
  }

  insert(k) {
    this.raw =
      this.raw.slice(0, this.cursor) +
      k +
      this.raw.slice(this.cursor);
    this.cursor++;
  }

  backspace() {
    if (this.cursor === 0) return;

    this.raw =
      this.raw.slice(0, this.cursor - 1) +
      this.raw.slice(this.cursor);
    this.cursor--;
  }

  moveLeft() {
    this.cursor = Math.max(0, this.cursor - 1);
  }

  moveRight() {
    this.cursor = Math.min(this.raw.length, this.cursor + 1);
  }

  reset() {
    this.raw = "";
    this.cursor = 0;
  }
}