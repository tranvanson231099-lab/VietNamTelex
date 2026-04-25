export const CursorManager = {
    getWord(text, cursor) {
      if (!text) return "";
  
      const isLetter = (ch) =>
        ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));
  
      if (!isLetter(text[cursor - 1])) return "";
  
      let start = cursor;
      let end = cursor;
  
      while (start > 0 && isLetter(text[start - 1])) start--;
      while (end < text.length && isLetter(text[end])) end++;
  
      return text.slice(start, end);
    },
  
    getRange(text, cursor) {
      const isLetter = (ch) =>
        ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));
  
      if (!text || !isLetter(text[cursor - 1])) {
        return { start: cursor, end: cursor };
      }
  
      let start = cursor;
      let end = cursor;
  
      while (start > 0 && isLetter(text[start - 1])) start--;
      while (end < text.length && isLetter(text[end])) end++;
  
      return { start, end };
    }
  };