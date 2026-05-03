const engineID = "my_custom_ime";
let activeContextID = 0;

// This will prevent the extension from crashing on non-ChromeOS devices
// where the chrome.input.ime API is not available.
if (chrome.input && chrome.input.ime) {
  chrome.input.ime.onActivate.addListener((engineID) => {
    console.log("onActivate", engineID);
  });

  chrome.input.ime.onDeactivated.addListener((engineID) => {
    console.log("onDeactivated", engineID);
  });

  chrome.input.ime.onFocus.addListener((context) => {
    console.log("onFocus", context.contextID);
    activeContextID = context.contextID;
  });

  chrome.input.ime.onBlur.addListener((contextID) => {
    console.log("onBlur", contextID);
    if (activeContextID === contextID) {
      activeContextID = 0;
    }
  });

  chrome.input.ime.onKeyEvent.addListener((engineID, keyData, requestId) => {
    console.log("onKeyEvent", keyData);
    if (keyData.type === "keydown" && keyData.key.length === 1) {
      if (activeContextID !== 0) {
        chrome.input.ime.commitText({
          contextID: activeContextID,
          text: keyData.key,
        });
      }
      return true; // Indicates that the key event was handled.
    }
    return false; // Indicates the key event was not handled.
  });

  console.log("Custom IME listeners attached successfully.");

} else {
  console.log("chrome.input.ime API is not available. This extension's IME features are only functional on ChromeOS.");
}
