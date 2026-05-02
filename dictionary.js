const trie = new Trie();
const freqMap = {};
const dictionaryWordList = [];

function loadDictionary(words) {
  for (let w of words) {
    trie.insert(w, 1);
    freqMap[w] = (freqMap[w] || 0) + 1;
    dictionaryWordList.push(w);
  }
}

// demo
loadDictionary([
  "tôi","bạn","đang","đi","ăn","cơm",
  "hương","hướng","hưởng","tương",
  "việt","nam","học","làm","code"
]);