// Register context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "decode-jwt",
    title: "Decode as JWT",
    contexts: ["selection"],
  });
});

// Handle clicks on the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "decode-jwt") {
    return;
  }

  const selectionText = (info.selectionText || "").trim();
  if (!selectionText) {
    chrome.scripting.executeScript({
      target: {
        tabId: tab.id
      },
      function: () => {
        alert("No selection made. Please select some text.");
      },
    });
    return;
  }

  // Extract all JWT-like strings (three base64url parts separated by dots)
  const jwtPattern = new RegExp('[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+', 'g');
  const tokens = selectionText.match(jwtPattern) || [];

  if (tokens.length === 0) {
    chrome.scripting.executeScript({
      target: {
        tabId: tab.id
      },
      function: () => {
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
}); 