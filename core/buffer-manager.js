// Quản lý bộ nhớ đệm
export const BufferManager = {
    currentBuffer: "",
  
    add: function(char) {
      this.currentBuffer += char.toLowerCase();
    },
  
    removeLast: function() {
      this.currentBuffer = this.currentBuffer.slice(0, -1);
    },
  
    clear: function() {
      this.currentBuffer = "";
    },
  
    get: function() {
      return this.currentBuffer;
    },
  
    update: function(newText) {
      this.currentBuffer = newText;
    }
  };