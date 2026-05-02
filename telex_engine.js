const baseMap = {
    aa: "â", aw: "ă", ee: "ê",
    oo: "ô", ow: "ơ", uw: "ư",
    dd: "đ"
  };
  
  const toneMap = {
    s: "\u0301",
    f: "\u0300",
    r: "\u0309",
    x: "\u0303",
    j: "\u0323"
  };
  
  const vowels = "aăâeêioôơuưy";
  
  // =====================
  // TRANSFORM FULL STRING
  // =====================
  function transformFull(raw, cursor) {
    let words = splitWords(raw);
  
    let result = "";
    let currentPos = 0;
    let newCursor = 0;
  
    for (let w of words) {
      let transformed = transformWord(w.text);
  
      if (cursor >= w.start && cursor <= w.end) {
        let localCursor = cursor - w.start;
        newCursor = result.length + mapCursor(w.text, transformed, localCursor);
      }
  
      result += transformed;
    }
  
    return { text: result.normalize("NFC"), cursorPos: newCursor };
  }
  
  // =====================
  // SPLIT WORDS
  // =====================
  function splitWords(text) {
    let words = [];
    let start = 0;
  
    for (let i = 0; i <= text.length; i++) {
      if (i === text.length || text[i] === " ") {
        words.push({
          text: text.slice(start, i),
          start,
          end: i
        });
  
        if (i < text.length) {
          words.push({
            text: " ",
            start: i,
            end: i + 1
          });
        }
  
        start = i + 1;
      }
    }
  
    return words;
  }
  
  // =====================
  // TRANSFORM 1 WORD
  // =====================
  function transformWord(input) {
    let text = input.toLowerCase();
  
    // uow → ươ
    text = text.replace(/uow/g, "ươ");
  
    // base transform
    for (let k in baseMap) {
      text = text.replace(new RegExp(k, "g"), baseMap[k]);
    }
  
    // tone
    let last = text.slice(-1);
    let tone = toneMap[last];
  
    if (!tone) return text;
  
    text = text.slice(0, -1);
    text = removeTone(text);
  
    let idx = findMainVowel(text);
    if (idx === -1) return text;
  
    return (
      text.slice(0, idx) +
      (text[idx] + tone) +
      text.slice(idx + 1)
    );
  }
  
  // =====================
  // CURSOR MAP (ĐƠN GIẢN)
  // =====================
  function mapCursor(raw, transformed, cursor) {
    return Math.min(cursor, transformed.length);
  }
  
  // =====================
  // REMOVE TONE
  // =====================
  function removeTone(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  
  // =====================
  // FIND MAIN VOWEL
  // =====================
  function findMainVowel(word) {
    let v = [];
  
    for (let i = 0; i < word.length; i++) {
      if (vowels.includes(word[i])) v.push(i);
    }
  
    if (v.length === 0) return -1;
  
    if (word.startsWith("qu")) return v[1] || v[0];
    if (word.startsWith("gi")) return v[1] || v[0];
  
    if (v.length === 1) return v[0];
  
    if (v.length === 2) {
      let [i1, i2] = v;
      let pair = word[i1] + word[i2];
      if (["oa", "oe", "uy"].includes(pair)) return i2;
      return i1;
    }
  
    if (v.length === 3) return v[1];
  
    return v[0];
  }