export const CursorManager = {
    isLetter(ch) {
      return ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));
    },
  
    getWord(text, cursor) {
      if (!text) return "";
  
      let start = cursor;
      let end = cursor;
  
      // =====================
      // 1. tìm start (lùi trái)
      // =====================
      while (start > 0 && this.isLetter(text[start - 1])) {
        start--;
      }
  
      // =====================
      // 2. tìm end (tới phải)
      // =====================
      while (end < text.length && this.isLetter(text[end])) {
        end++;
      }
  
      const word = text.slice(start, end);
  
      return word;
    },
  
    getRange(text, cursor) {
      if (!text) return { start: cursor, end: cursor };
  
      const isLetter = this.isLetter;
  
      let start = cursor;
      let end = cursor;
  
      while (start > 0 && isLetter(text[start - 1])) start--;
      while (end < text.length && isLetter(text[end])) end++;
  
      return { start, end };
    }
  };