export const CursorManager = {
    info: {
      text: "",
      focus: 0,
      anchor: 0,
      textBefore: "",
      textAfter: ""
    },
  
    update(info) {
      this.info.text = info.text || "";
      this.info.focus = info.focus || 0;
      this.info.anchor = info.anchor || 0;
  
      this.info.textBefore = this.info.text.slice(0, this.info.focus);
      this.info.textAfter = this.info.text.slice(this.info.focus);
    },
  
    // =========================
    // 🔥 UNICODE WORD DETECTOR
    // =========================
    getFullWord() {
      const text = this.info.text;
      const cursor = this.info.focus;
  
      if (!text || cursor <= 0) return "";
  
      const isLetter = (ch) =>
        ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));
  
      if (!isLetter(text[cursor - 1])) return "";
  
      let start = cursor;
      let end = cursor;
  
      while (start > 0 && isLetter(text[start - 1])) start--;
      while (end < text.length && isLetter(text[end])) end++;
  
      return text.slice(start, end);
    },
  
    // =========================
    // 🔥 RANGE FOR IME REPLACE
    // =========================
    getFullWordRange() {
      const text = this.info.text;
      const cursor = this.info.focus;
  
      const isLetter = (ch) =>
        ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));
  
      if (!text || cursor <= 0 || !isLetter(text[cursor - 1])) {
        return { start: cursor, end: cursor };
      }
  
      let start = cursor;
      let end = cursor;
  
      while (start > 0 && isLetter(text[start - 1])) start--;
      while (end < text.length && isLetter(text[end])) end++;
  
      return { start, end };
    },
  
    getCursorIndex() {
      return this.info.focus;
    }
  };