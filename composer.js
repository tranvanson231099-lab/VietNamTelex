function compose(buffer) {
  let result = "";
  let cursorPos = 0;
  let i = 0;

  while (i <= buffer.raw.length) {
    let start = i;

    while (i < buffer.raw.length && buffer.raw[i] !== " ") i++;

    let rawWord = buffer.raw.slice(start, i);
    let textWord = transformWord(rawWord);

    if (buffer.cursor >= start && buffer.cursor <= i) {
      let local = buffer.cursor - start;
      cursorPos = result.length + Math.min(local, textWord.length);
    }

    result += textWord;

    if (i < buffer.raw.length) {
      result += " ";
      if (buffer.cursor === i) cursorPos = result.length;
    }

    i++;
  }

  return {
    text: result.normalize("NFC"),
    cursor: cursorPos
  };
}