// telex-engine.js
export const TelexEngine = {
    rules: {
      // Chữ cái
      "aa": "â", "ee": "ê", "oo": "ô", "dd": "đ",
      "aw": "ă", "uw": "ư", "ow": "ơ",
      // Dấu thanh (Ví dụ cơ bản)
      "af": "à", "as": "á", "ar": "ả", "ax": "ã", "aj": "ạ",
      "nf": "n", // Giữ nguyên n khi gõ f (tùy logic bạn muốn)
    },
  
    checkTransformation: function(lastChar, currentKey) {
      const pair = (lastChar + currentKey).toLowerCase();
      
      if (this.rules[pair]) {
        return {
          transformed: this.rules[pair],
          shouldDelete: true
        };
      }
      
      // Xử lý 'w' thành 'ư'
      if (currentKey.toLowerCase() === 'w' && !['a', 'u', 'o'].includes(lastChar.toLowerCase())) {
        return { transformed: "ư", shouldDelete: false };
      }
  
      return null;
    }
  };