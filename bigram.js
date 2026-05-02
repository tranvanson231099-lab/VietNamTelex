const bigram = {
    map: {},
    add(a,b){
      if(!this.map[a]) this.map[a]={};
      this.map[a][b]=(this.map[a][b]||0)+1;
    },
    get(a){
      return Object.keys(this.map[a]||{});
    }
  };