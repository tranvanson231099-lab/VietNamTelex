const cache = new Map();

function suggest(buffer, trie, bk) {
  const key = buffer.raw + "|" + buffer.cursor;

  if (cache.has(key)) return cache.get(key);

  const words = buffer.raw.split(" ");
  const current = words.pop() || "";
  const prev = words[words.length - 1];

  let candidates = [
    ...trie.search(current, 10),
    ...bk.search(current, 2),
    ...(prev ? Object.keys(bigram[prev] || {}) : [])
  ];

  candidates = [...new Set(candidates)];

  let ranked = candidates.map(w => {
    let score = 0;

    // prefix mạnh nhất
    if (w.startsWith(current)) score += 100;

    // context
    if (prev && bigram[prev]?.[w]) {
      score += bigram[prev][w] * 5;
    }

    // user learning
    score += (userFreq[w] || 0) * 10;

    // phạt typo
    score -= levenshtein(current, w) * 10;

    return { w, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  const result = ranked.slice(0, 5).map(x => x.w);

  cache.set(key, result);
  return result;
}