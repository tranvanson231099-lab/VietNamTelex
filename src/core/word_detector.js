export function getCurrentWordFull(text, cursorIndex) {
  if (!text || cursorIndex < 0) return "";

  const isLetter = (ch) =>
    ch && /[\p{L}\p{M}]/u.test(ch.normalize("NFC"));

  // nếu ngay trước cursor không phải chữ → không trong word
  const prev = text[cursorIndex - 1];
  if (!isLetter(prev)) return "";

  let start = cursorIndex;
  let end = cursorIndex;

  // ⬅️ tìm start
  while (start > 0 && isLetter(text[start - 1])) {
    start--;
  }

  // ➡️ tìm end  (QUAN TRỌNG FIX)
  while (end < text.length && isLetter(text[end])) {
    end++;
  }

  return text.slice(start, end);
}