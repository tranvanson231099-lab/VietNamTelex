const trigram = {
  map:{},
  add(a,b,c){
    const k=a+"|"+b;
    if(!this.map[k]) this.map[k]={};
    this.map[k][c]=(this.map[k][c]||0)+1;
  },
  get(a,b){
    return Object.keys(this.map[a+"|"+b]||{});
  }
};