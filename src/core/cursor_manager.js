export const CursorManager = {
  isLetter(ch) {
    return ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));
  },

  getWord(text, cursor) {
    if (!text) return "";

    let start = cursor;
    let end = cursor;

    while (start > 0 && this.isLetter(text[start - 1])) start--;
    while (end < text.length && this.isLetter(text[end])) end++;

    return text.slice(start, end);
  }
};