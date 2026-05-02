const bigram = {};
const userFreq = {};

function learnSentence(words) {
  for (let i = 0; i < words.length; i++) {
    let w = words[i];

    userFreq[w] = (userFreq[w] || 0) + 1;

    if (i > 0) {
      const prev = words[i - 1];
      bigram[prev] ??= {};
      bigram[prev][w] = (bigram[prev][w] || 0) + 1;
    }
  }
}