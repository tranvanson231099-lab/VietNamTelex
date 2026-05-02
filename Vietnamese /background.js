const TONE_KEYS = ["s", "f", "r", "x", "j"];
const VOWELS = "aăâeêioôơuưy";
const BASE_MAP = { aa: "â", aw: "ă", ee: "ê", oo: "ô", ow: "ơ", uw: "ư", dd: "đ" };
const TONE_MAP = { s: "\u0301", f: "\u0300", r: "\u0309", x: "\u0303", j: "\u0323" };

// =====================
// TelexTransformer & Composer (No changes needed here)
// =====================
function TelexTransformer(raw) { this.raw = raw || ""; }
TelexTransformer.prototype.getText = function() { return this.transformWord(this.raw); };
TelexTransformer.prototype.transformWord = function(raw) {
  if (typeof raw !== 'string' || !this.isVietnamese(raw)) return raw;
  let tone = this.extractTone(raw);
  let chars = [];
  for (let i = 0; i < raw.length; i++) {
    let k = raw[i];
    if (TONE_KEYS.includes(k)) continue;
    let last = chars[chars.length - 1] || "";
    let pair = last + k;
    if (chars.length >= 2 && chars[chars.length - 2] === "u" && chars[chars.length - 1] === "o" && k === "w") { chars.pop(); chars.pop(); chars.push("ư", "ơ"); continue; }
    if (pair === "dd") { chars.pop(); chars.push("đ"); continue; }
    if (BASE_MAP[pair]) { chars.pop(); chars.push(BASE_MAP[pair]); continue; }
    chars.push(k);
  }
  chars = chars.map(c => this.removeTone(c));
  if (!tone) return chars.join("");
  let idx = this.findMainVowel(chars);
  if (idx === -1) return chars.join("");
  chars[idx] = this.addTone(chars[idx], tone);
  return chars.join("").normalize("NFC");
};
TelexTransformer.prototype.extractTone = function(raw) { for (let i = raw.length - 1; i >= 0; i--) { if (TONE_KEYS.includes(raw[i])) return raw[i]; } return null; };
TelexTransformer.prototype.isVietnamese = function(raw) { if (/[ăâêôơưđáàảãạ]/i.test(raw)) return false; return /(aa|aw|ee|oo|ow|uw|dd|[sfrxj])/i.test(raw); };
TelexTransformer.prototype.removeTone = function(c) { return c.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
TelexTransformer.prototype.addTone = function(c, t) { return (this.removeTone(c) + TONE_MAP[t]).normalize("NFC"); };
TelexTransformer.prototype.findMainVowel = function(chars) {
  let v = [];
  for (let i = 0; i < chars.length; i++) { if (VOWELS.includes(chars[i])) v.push(i); }
  if (v.length === 0) return -1;
  const word = chars.join("");
  if (word.startsWith("qu") || word.startsWith("gi")) return v[1] || v[0];
  if (v.length === 1) return v[0];
  if (v.length === 2) { const [i1, i2] = v; if (i2 < chars.length - 1) return i2; const pair = chars[i1] + chars[i2]; if (["oa", "oe", "uy"].includes(pair)) return i2; return i1; }
  if (v.length === 3) return v[1];
  return v[0];
};
function Composer() {}
Composer.prototype.transform = function(raw, cursor) {
  raw = String(raw || '');
  const rawToCursor = raw.slice(0, cursor);
  const transformedToCursor = new TelexTransformer(rawToCursor).getText() || "";
  const newCursor = transformedToCursor.length;
  const transformedText = new TelexTransformer(raw).getText() || "";
  return { text: transformedText, cursorPos: newCursor };
};

// =====================
// ROBUST STATE MANAGEMENT with chrome.storage.session
// =====================
const STATE_KEY = "ime_state";
const composer = new Composer();

async function getState() {
    const result = await chrome.storage.session.get(STATE_KEY);
    return result[STATE_KEY] || { contextID: -1, rawBuffer: "", cursor: 0 };
}

async function setState(newState) {
    await chrome.storage.session.set({ [STATE_KEY]: newState });
}

// =====================
// ASYNC EVENT LISTENERS
// =====================

chrome.input.ime.onFocus.addListener(async (context) => {
    await setState({ contextID: context.contextID, rawBuffer: "", cursor: 0 });
});

chrome.input.ime.onBlur.addListener(async () => {
    const state = await getState();
    if (state.rawBuffer.length > 0) {
        const { text } = composer.transform(state.rawBuffer, state.cursor);
        // Use a temporary contextID for commit as the original might be gone.
        chrome.input.ime.commitText({ contextID: state.contextID, text });
    }
    await setState({ contextID: -1, rawBuffer: "", cursor: 0 });
});

chrome.input.ime.onKeyEvent.addListener(async (engineID, keyData) => {
    if (keyData.type !== 'keydown') return false;

    let state = await getState();
    if (state.contextID === -1) return false;

    const key = keyData.key;
    if (keyData.ctrlKey || keyData.altKey || keyData.metaKey) return false;

    let handled = false;

    if (key === "Backspace") {
        if (state.cursor > 0) {
            state.rawBuffer = state.rawBuffer.slice(0, state.cursor - 1) + state.rawBuffer.slice(state.cursor);
            state.cursor--;
            handled = true;
        }
    } else if (key === "ArrowLeft") {
        if (state.cursor > 0) {
            state.cursor--;
            handled = true;
        }
    } else if (key === "ArrowRight") {
        if (state.cursor < state.rawBuffer.length) {
            state.cursor++;
            handled = true;
        }
    } else if (key === "Enter") {
        if (state.rawBuffer.length > 0) {
            const { text } = composer.transform(state.rawBuffer, state.cursor);
            chrome.input.ime.commitText({ contextID: state.contextID, text });
            state.rawBuffer = "";
            state.cursor = 0;
        }
        // Let Enter do its default action (e.g., new line)
        return false;
    } else if (key === " ") {
        if (state.rawBuffer.length > 0) {
            const { text } = composer.transform(state.rawBuffer, state.cursor);
            chrome.input.ime.commitText({ contextID: state.contextID, text: text + " " });
            state.rawBuffer = "";
            state.cursor = 0;
            handled = true;
        } else {
            // Allow default space behavior if buffer is empty
            return false;
        }
    } else if (key.length === 1 && !/[\s]/.test(key)) {
        state.rawBuffer = state.rawBuffer.slice(0, state.cursor) + key + state.rawBuffer.slice(state.cursor);
        state.cursor++;
        handled = true;
    }

    await setState(state);

    if (handled) {
        const { text, cursorPos } = composer.transform(state.rawBuffer, state.cursor);
        chrome.input.ime.setComposition({
            contextID: state.contextID,
            text: text,
            cursor: cursorPos,
            segments: [{ start: 0, end: text.length, style: "noUnderline" }]
        });
    }
    
    return handled;
}, ["async"], ); // Specify "async" capability
