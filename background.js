const engineID = "my_custom_ime";

chrome.input.ime.onActivate.addListener((engineID) => {
  console.log("onActivate", engineID);
});

chrome.input.ime.onDeactivated.addListener((engineID) => {
  console.log("onDeactivated", engineID);
});

chrome.input.ime.onFocus.addListener((context) => {
  console.log("onFocus", context.contextID);
});

chrome.input.ime.onBlur.addListener((contextID) => {
  console.log("onBlur", contextID);
});

chrome.input.ime.onKeyEvent.addListener((engineID, keyData, requestId) => {
  console.log("onKeyEvent", keyData);
  if (keyData.type === "keydown") {
    if (keyData.key.length === 1) {
      chrome.input.ime.commitText({
        contextID: -1, // You might need to manage context ID here
        text: keyData.key,
      });
      return true;
    }
  }
  return false;
});

chrome.input.ime.onMenuItemClicked.addListener((engineID, name) => {
  console.log("onMenuItemClicked", engineID, name);
});
