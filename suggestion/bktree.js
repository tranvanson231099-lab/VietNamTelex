class BKTree {
    constructor() {
      this.root = null;
    }
  
    add(word) {
      if (!this.root) {
        this.root = { word, children: {} };
        return;
      }
  
      let node = this.root;
  
      while (true) {
        let d = levenshtein(word, node.word);
  
        if (!node.children[d]) {
          node.children[d] = { word, children: {} };
          return;
        }
  
        node = node.children[d];
      }
    }
  
    search(query, maxDist = 2) {
      let result = [];
  
      const dfs = (node) => {
        const d = levenshtein(query, node.word);
  
        if (d <= maxDist) result.push(node.word);
  
        for (let k in node.children) {
          if (k >= d - maxDist && k <= d + maxDist) {
            dfs(node.children[k]);
          }
        }
      };
  
      if (this.root) dfs(this.root);
      return result;
    }
  }