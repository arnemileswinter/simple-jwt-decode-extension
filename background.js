// Register context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "decode-jwt",
    title: "Decode as JWT",
    contexts: ["selection"],
  });
});

const openDecodePage = (selectionText) => {
  // Extract all JWT-like strings (three base64url parts separated by dots)
  const jwtPattern = new RegExp('[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+', 'g');
  const tokens = selectionText.match(jwtPattern) || [];

  if (tokens.length === 0) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        alert("No JWT found in selection");
      },
    });
    return;
  }

  // Assemble query string with one 'token' param per JWT
  const params = new URLSearchParams();
  tokens.forEach(t => params.append('token', t));

  const url = chrome.runtime.getURL(`decode.html?${params.toString()}`);
  chrome.tabs.create({ url });
}

// Handle clicks on the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "decode-jwt") {
    return;
  }

  // Send message to content script to get the full selection
  const onSelectionMessage = (response) => {
    const lastError = chrome.runtime.lastError;
    if (lastError) {
      console.error(lastError);
      // Handle error (e.g., content script not ready)
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          alert("Error: Please refresh the page and try again.");
        },
      });
      return;
    }
    const selectionText = (response?.text || "").trim();
    if (!selectionText) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          alert("No selection made. Please select some text.");
        },
      });
      return;
    }
    openDecodePage(selectionText);
  }

  chrome.tabs.sendMessage(tab.id, { action: "simple_jwtdecoder_getSelection" }, (response) => onSelectionMessage(response));
}); 