export function getCurrentWordFull(text, cursorIndex) {
  if (!text || cursorIndex <= 0) return "";

  const isLetter = (ch) =>
    ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));

  const prevChar = text[cursorIndex - 1];

  if (!isLetter(prevChar)) return "";

  let start = cursorIndex;
  let end = cursorIndex;

  while (start > 0 && isLetter(text[start - 1])) {
    start--;
  }

  while (end < text.length && isLetter(text[end])) {
    end++;
  }

  return text.slice(start, end);
}