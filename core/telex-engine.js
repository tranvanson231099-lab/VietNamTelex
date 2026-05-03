export const TelexEngine = {
    rules: {
      "aa": "â",
      "ee": "ê",
      "oo": "ô",
      "dd": "đ",
      "aw": "ă",
      "uw": "ư",
      "ow": "ơ"
    },
  
    checkTransformation: function(lastChar, currentKey) {
      const pair = (lastChar + currentKey).toLowerCase();
      
      // Kiểm tra quy tắc cặp (aa, ee...)
      if (this.rules[pair]) {
        return {
          transformed: this.rules[pair],
          shouldDelete: true
        };
      }
  
      // Xử lý phím 'w' đơn lẻ thành 'ư'
      if (currentKey.toLowerCase() === 'w' && !['a', 'u', 'o'].includes(lastChar.toLowerCase())) {
        return {
          transformed: "ư",
          shouldDelete: false
        };
      }
  
      return null;
    }
  };