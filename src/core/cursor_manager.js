export const CursorManager = {
    info: {
      text: "",
      focus: 0,
      anchor: 0,
      textBefore: "",
      textAfter: ""
    },
  
    update(info) {
      this.info.text = info.text;
      this.info.focus = info.focus;
      this.info.anchor = info.anchor;
  
      this.info.textBefore = info.text.slice(0, info.focus);
      this.info.textAfter = info.text.slice(info.focus);
    },
  
    // ⚡ FULL WORD theo cursor (chuẩn bạn yêu cầu)
    getFullWord() {
      const text = this.info.text;
      const cursor = this.info.focus;
  
      if (!text || cursor === 0) return "";
  
      const isLetter = (ch) =>
        /[a-zA-ZăâêôơưđĂÂÊÔƠƯĐ]/.test(ch);
  
      // Nếu ký tự bên trái không phải chữ → chưa vào từ
      if (!isLetter(text[cursor - 1])) {
        return "";
      }
  
      let start = cursor;
      let end = cursor;
  
      // ⬅️ tìm đầu từ
      while (start > 0 && isLetter(text[start - 1])) {
        start--;
      }
  
      // ➡️ tìm cuối từ
      while (end < text.length && isLetter(text[end])) {
        end++;
      }
  
      return text.slice(start, end);
    },
  
    // ⚡ Lấy vị trí bắt đầu của full word
    getFullWordRange() {
      const text = this.info.text;
      const cursor = this.info.focus;
  
      const isLetter = (ch) =>
        /[a-zA-ZăâêôơưđĂÂÊÔƠƯĐ]/.test(ch);
  
      if (!text || cursor === 0 || !isLetter(text[cursor - 1])) {
        return { start: cursor, end: cursor };
      }
  
      let start = cursor;
      let end = cursor;
  
      while (start > 0 && isLetter(text[start - 1])) {
        start--;
      }
  
      while (end < text.length && isLetter(text[end])) {
        end++;
      }
  
      return { start, end };
    },
  
    // ❗ giữ lại nếu bạn vẫn cần (word bên trái)
    getCurrentWord() {
      const words = this.info.textBefore.split(/\s+/);
      return words.length ? words[words.length - 1] : "";
    },
  
    getWordStartIndex() {
      const before = this.info.textBefore;
      const lastSpace = before.lastIndexOf(" ");
      return lastSpace === -1 ? 0 : lastSpace + 1;
    },
  
    hasSelection() {
      return this.info.focus !== this.info.anchor;
    },
  
    getCursorIndex() {
      return this.info.focus;
    }
  };