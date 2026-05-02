class BKNode {
  constructor(word) {
    this.word = word;
    this.children = {};
  }
}

class BKTree {
  constructor(dist) {
    this.root = null;
    this.dist = dist;
  }

  add(word) {
    if (!this.root) {
      this.root = new BKNode(word);
      return;
    }

    let node = this.root;

    while (true) {
      let d = this.dist(word, node.word);

      if (!node.children[d]) {
        node.children[d] = new BKNode(word);
        return;
      }

      node = node.children[d];
    }
  }

  search(q, max = 2) {
    let res = [];

    function dfs(node) {
      let d = levenshtein(q, node.word);

      if (d <= max) res.push(node.word);

      for (let k in node.children) {
        if (k >= d - max && k <= d + max) {
          dfs(node.children[k]);
        }
      }
    }

    if (this.root) dfs(this.root);
    return res;
  }
}

const bkTree = new BKTree(levenshtein);
dictionaryWordList?.forEach(w => bkTree.add(w));