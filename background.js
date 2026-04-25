const imeEngine = {
    engineID: "telex",
    contextId: -1, 
    menuItems: [
        { id: "about", label: "About this IME" }
    ],

    onActivate: (engineID) => {
        console.log("onActivate", engineID);
    },

    onDeactivated: (engineID) => {
        console.log("onDeactivated", engineID);
    },

    onFocus: (context) => {
        console.log("onFocus", context.contextID);
        imeEngine.contextId = context.contextID;
    },

    onBlur: (contextID) => {
        console.log("onBlur", contextID);
        if (imeEngine.contextId === contextID) {
            imeEngine.contextId = -1;
        }
    },

    onKeyEvent: (engineID, keyData, requestId) => {
        console.log("onKeyEvent", keyData);
        if (keyData.type === "keydown" && imeEngine.contextId !== -1) {
            if (keyData.key.length === 1) {
                chrome.input.ime.commitText({
                    contextID: imeEngine.contextId,
                    text: keyData.key
                });
                return true;
            }
        }
        return false;
    },

    onMenuItemClicked: (engineID, name) => {
        console.log("onMenuItemClicked", engineID, name);
    }
}

chrome.input.ime.onActivate.addListener(imeEngine.onActivate);
chrome.input.ime.onDeactivated.addListener(imeEngine.onDeactivated);
chrome.input.ime.onFocus.addListener(imeEngine.onFocus);
chrome.input.ime.onBlur.addListener(imeEngine.onBlur);
chrome.input.ime.onKeyEvent.addListener(imeEngine.onKeyEvent);
chrome.input.ime.onMenuItemClicked.addListener(imeEngine.onMenuItemClicked);
