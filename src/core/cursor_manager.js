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