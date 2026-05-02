const engineID = "my_custom_ime";

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
  });

  chrome.input.ime.onBlur.addListener((contextID) => {
    console.log("onBlur", contextID);
  });

  chrome.input.ime.onKeyEvent.addListener((engineID, keyData, requestId) => {
    console.log("onKeyEvent", keyData);
    if (keyData.type === "keydown" && keyData.key.length === 1) {
      chrome.input.ime.commitText({
        // A context ID of 0 sends text to the currently focused text field.
        contextID: 0,
        text: keyData.key,
      });
      return true; // Indicates that the key event was handled.
    }
    return false; // Indicates the key event was not handled.
  });

  chrome.input.ime.onMenuItemClicked.addListener((engineID, name) => {
    console.log("onMenuItemClicked", engineID, name);
  });

  console.log("Custom IME listeners attached successfully.");

} else {
  console.log("chrome.input.ime API is not available. This extension's IME features are only functional on ChromeOS.");
}
