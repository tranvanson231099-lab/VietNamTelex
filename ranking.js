function neuralScore(input, prev1, prev2, word){
    let score=0;
  
    if(prev1 && bigram.get(prev1).includes(word)) score+=30;
    if(prev1 && prev2 && trigram.get(prev2,prev1).includes(word)) score+=60;
  
    score += (freqMap[word]||1);
  
    score += cosine(wordToVec(input), wordToVec(word))*20;
  
    return score;
  }