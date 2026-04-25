export function getCurrentWordFull(text, cursorIndex) {
    if (!text) return "";
  
    // Nếu cursor ở đầu chuỗi
    if (cursorIndex === 0) return "";
  
    const isLetter = (ch) => /[a-zA-Z]/.test(ch);
  
    let start = cursorIndex;
    let end = cursorIndex;
  
    // 👈 Nếu ký tự ngay trước cursor KHÔNG phải chữ → coi như chưa vào từ
    if (!isLetter(text[cursorIndex - 1])) {
      return "";
    }
  
    // ⬅️ tìm start
    while (start > 0 && isLetter(text[start - 1])) {
      start--;
    }
  
    // ➡️ tìm end
    while (end < text.length && isLetter(text[end])) {
      end++;
    }
  
    return text.slice(start, end);
  }