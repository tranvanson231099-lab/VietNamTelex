let contextID = null;
function setupIMEListeners() {
    chrome.input.ime.onFocus.addListener((context) => {
      contextID = context.contextID;
      console.log("Đã focus vào context:", contextID);
    });
    return contextID;
  }