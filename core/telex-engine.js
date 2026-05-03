// telex-engine.js ví dụ
export const TelexEngine = {
    rules: {
      "aa": "â",
      "ee": "ê",
      "oo": "ô",
      "dd": "đ"
    },
    checkTransformation: function(lastChar, currentKey) {
      const pair = (lastChar + currentKey).toLowerCase();
      if (this.rules[pair]) {
        return {
          transformed: this.rules[pair],
          shouldDelete: true // Bắt buộc là true để xóa ký tự thứ nhất
        };
      }
      return null;
    }
  };