class TrieNode {
  constructor() {
    this.children = {};
    this.isWord = false;
    this.freq = 0;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, freq = 1) {
    let node = this.root;
    for (let c of word) {
      if (!node.children[c]) {
        node.children[c] = new TrieNode();
      }
      node = node.children[c];
    }
    node.isWord = true;
    node.freq += freq;
  }

  search(prefix, limit = 10) {
    let node = this.root;

    for (let c of prefix) {
      if (!node.children[c]) return [];
      node = node.children[c];
    }

    let result = [];

    const dfs = (n, path) => {
      if (n.isWord) {
        result.push({ word: path, freq: n.freq });
      }
      for (let k in n.children) {
        dfs(n.children[k], path + k);
      }
    };

    dfs(node, prefix);

    return result
      .sort((a, b) => b.freq - a.freq)
      .slice(0, limit)
      .map(x => x.word);
  }
}