function neuralScore({
    input,
    prev1,
    prev2,
    candidate,
    freqMap,
    bigram,
    trigram,
    userHistory
  }) {
    let score = 0;
  
    // ===== 1. TRIGRAM (cao nhất)
    if (prev1 && prev2) {
      const tri = trigram.get(prev2, prev1, 10);
      if (tri.includes(candidate)) score += 80;
    }
  
    // ===== 2. BIGRAM
    if (prev1) {
      const bi = bigram.get(prev1, 10);
      if (bi.includes(candidate)) score += 40;
    }
  
    // ===== 3. EMBEDDING SIMILARITY
    const v1 = wordToVec(input);
    const v2 = wordToVec(candidate);
    score += cosine(v1, v2) * 30;
  
    // ===== 4. FREQUENCY
    score += (freqMap[candidate] || 1);
  
    // ===== 5. USER LEARNING
    score += (userHistory[candidate] || 0) * 20;
  
    return score;
  }