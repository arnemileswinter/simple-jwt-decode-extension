// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "simple_jwtdecoder_getSelection") {
    // Get the full selection text using window.getSelection()
    const selection = window.getSelection();
    const selectionText = selection.toString();
    
    // Send the full selection text back to the background script
    sendResponse({ text: selectionText });
  }
  return true; // Keep the message channel open for async response
}); 