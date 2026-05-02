function getSuggestionsNeural(engine){
  const raw=engine.raw;
  const cursor=engine.cursor;

  const {start,end}=findCurrentWord(raw,cursor);
  const input=raw.slice(start,end);

  const prev1=getPrevWord(raw,start);
  const prev2=getPrevWord(raw,start-(prev1?.length||0)-1);

  let candidates=[
    ...trie.search(input,5),
    ...bkTree.search(input,2),
    ...(prev1?bigram.get(prev1):[]),
    ...(prev1&&prev2?trigram.get(prev2,prev1):[])
  ];

  candidates=[...new Set(candidates)];

  return candidates
    .map(w=>({w,score:neuralScore(input,prev1,prev2,w)}))
    .sort((a,b)=>b.score-a.score)
    .slice(0,5)
    .map(x=>x.w);
}