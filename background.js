// Register context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "decode-jwt",
    title: "Extract JWTs from selection",
    contexts: ["selection"],
  });
});

const openDecodePage = (tab, selectionText) => {
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

  // Store tokens in chrome.storage and pass only a short reference ID in the URL
  const entryId = (crypto?.randomUUID ? crypto.randomUUID() :
    Date.now().toString(36) + Math.random().toString(36).substr(2, 5));

  chrome.storage.local.set({ [entryId]: tokens }, () => {
    const url = chrome.runtime.getURL(`decode.html?id=${entryId}`);
    chrome.tabs.create({ url });
  });
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
      // fallback when content script is not available
      openDecodePage(tab, info.selectionText);
    } else {
      const selectionText = (response?.text || "").trim();
      if (!selectionText) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            alert("No selection made. Please select some text.");
          },
        });
        return;
      } else {
        openDecodePage(tab, selectionText);
      }
    }
  }

  try {
    chrome.tabs.sendMessage(tab.id, { action: "simple_jwtdecoder_getSelection" }, (response) => onSelectionMessage(response))
  } catch (error) {
    console.error('Error sending message to content script', error);
  }
}); 