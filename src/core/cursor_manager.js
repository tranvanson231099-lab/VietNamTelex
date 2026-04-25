export const CursorManager = {
    isLetter(ch) {
      return ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));
    },
  
    getWord(text, cursor) {
      console.log("=== DEBUG GET WORD ===");
      console.log("TEXT:", text);
      console.log("CURSOR:", cursor);
  
      if (!text) {
        console.log("EMPTY TEXT");
        return "";
      }
  
      let start = cursor;
      let end = cursor;
  
      // =====================
      // find start
      // =====================
      while (start > 0 && this.isLetter(text[start - 1])) {
        start--;
      }
  
      // =====================
      // find end
      // =====================
      while (end < text.length && this.isLetter(text[end])) {
        end++;
      }
  
      const word = text.slice(start, end);
  
      console.log("START:", start);
      console.log("END:", end);
      console.log("WORD:", word);
      console.log("=====================");
  
      return word;
    },
  
    getRange(text, cursor) {
      console.log("=== DEBUG RANGE ===");
      console.log("TEXT:", text);
      console.log("CURSOR:", cursor);
  
      if (!text) {
        console.log("EMPTY TEXT");
        return { start: cursor, end: cursor };
      }
  
      let start = cursor;
      let end = cursor;
  
      while (start > 0 && this.isLetter(text[start - 1])) start--;
      while (end < text.length && this.isLetter(text[end])) end++;
  
      console.log("START:", start);
      console.log("END:", end);
      console.log("RESULT:", text.slice(start, end));
      console.log("=====================");
  
      return { start, end };
    }
  };