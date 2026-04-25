export const CursorManager = {
    getWord(text, cursor) {
      if (!text) return "";
  
      const isLetter = (ch) =>
        ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));
  
      let start = cursor - 1;
      let end = cursor;
  
      if (start < 0 || !isLetter(text[start])) return "";
  
      while (start >= 0 && isLetter(text[start])) start--;
      start++;
  
      while (end < text.length && isLetter(text[end])) end++;
  
      return text.slice(start, end);
    }
  };