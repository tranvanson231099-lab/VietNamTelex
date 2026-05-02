// This file handles the composition of multiple words and cursor mapping.
importScripts('telex.js');

// =====================
// COMPOSER
// =====================
class Composer {
  transform(raw, cursor) {
    let text = "";
    let newCursor = 0;
    let currentWordRaw = "";

    function processWord() {
      if (currentWordRaw) {
        const transformer = new TelexTransformer(currentWordRaw);
        const wordText = transformer.getText();
        text += wordText;
        currentWordRaw = "";
      }
    }

    for (let i = 0; i < raw.length; i++) {
      const char = raw[i];
      if (char === ' ' || char === '\n' || char === '\t') {
        processWord();
        text += char;
      } else {
        currentWordRaw += char;
      }
      if (i < cursor) {
        newCursor = text.length + currentWordRaw.length;
      }
    }
    processWord();

    const finalTransformer = new TelexTransformer(currentWordRaw);
    const remainingText = finalTransformer.getText();
    
    if (cursor >= raw.length) {
       newCursor = text.length + remainingText.length;
    }

    return {
        text: text + remainingText,
        cursorPos: newCursor
    };
  }
}
