// Utility: base64-url decode a string
function base64urlDecode(str) {
  // Replace URL-safe characters
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '='
  const padding = str.length % 4;
  if (padding) {
    str += "=".repeat(4 - padding);
  }
  // Decode
  try {
    return atob(str);
  } catch (err) {
    throw new Error("Invalid base64 input");
  }
}

// Escape HTML entities so that JSON is rendered literally inside <code> blocks
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);
}

function decodeJWT(token) {
  const parts = token.split(".");
  if (parts.length < 2) {
    throw new Error("Input does not appear to be a JWT (need at least header and payload)");
  }
  const headerJSON = base64urlDecode(parts[0]);
  const payloadJSON = base64urlDecode(parts[1]);

  let header, payload;
  try {
    // remove any leading text before the json object
    if (headerJSON.indexOf('{') > 0) {
      headerJSON = headerJSON.split('{')[1]
    }
    header = JSON.parse(headerJSON);
  } catch (_) {
    throw new Error("Header is not valid JSON");
  }
  try {
    payload = JSON.parse(payloadJSON);
  } catch (_) {
    throw new Error("Payload is not valid JSON");
  }

  return { header, payload, signature: parts[2] || "" };
}

function render(output) {
  const container = document.getElementById("output");
  container.innerHTML = output;

  // Apply syntax highlighting & line numbers if highlight.js is present
  if (window.hljs) {
    hljs.initLineNumbersOnLoad && hljs.initLineNumbersOnLoad();
    container.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
      if (typeof hljs.lineNumbersBlock === "function") {
        hljs.lineNumbersBlock(block);
      }
    });
  }
}

(function () {
  const params = new URLSearchParams(window.location.search);

  // Helper that runs the existing rendering logic once we have tokens
  const processTokens = (tokens) => {
    if (!Array.isArray(tokens) || tokens.length === 0) {
      render("<p class=\"error\">No token supplied.</p>");
      return;
    }

    let html = "";

    tokens.forEach((token, idx) => {
      // start a collapsible details block
      let hasError = false;
      let segmentClasses = ["segment"];
      // Determine parsing success for open state / class
      try {
        decodeJWT(token);
      } catch (_) {
        hasError = true;
        segmentClasses.push("invalid");
      }

      const isOpen = !hasError; // open successful segments by default
      let segmentHTML = `<details class=\"${segmentClasses.join(" ")}\"${isOpen ? " open" : ""}>`;
      const title = tokens.length > 1 ? `Segment ${idx + 1}` : "Token";
      segmentHTML += `<summary>${title}</summary>`;

      // Always show raw token
      segmentHTML += "<h3>Raw</h3><pre>" + token + "</pre>";

      if (hasError) {
        // Re-run to get error message
        try {
          decodeJWT(token);
        } catch (err) {
          segmentHTML += "<p class=\"error\">Error: " + err.message + "</p>";
        }
      } else {
        try {
          const { header, payload, signature } = decodeJWT(token);
          segmentHTML += "<h3>Header</h3><pre><code class=\"language-json\">" + escapeHtml(JSON.stringify(header, null, 2)) + "</code></pre>";
          segmentHTML += "<h3>Payload</h3><pre><code class=\"language-json\">" + escapeHtml(JSON.stringify(payload, null, 2)) + "</code></pre>";
          if (signature) {
            segmentHTML += "<h3>Signature (base64url)</h3><pre>" + signature + "</pre>";
          }
        } catch (err) {
          // Should not reach here because we already parsed successfully, but fallback
          segmentHTML += "<p class=\"error\">Error: " + err.message + "</p>";
        }
      }

      segmentHTML += `</details>`;
      html += segmentHTML;
    });

    render(html);

    // Attach collapse all button behaviour
    const collapseBtn = document.getElementById("collapseAll");
    if (collapseBtn) {
      collapseBtn.addEventListener("click", () => {
        document.querySelectorAll("details.segment").forEach(det => det.removeAttribute("open"));
      });
    }

    // Attach expand all button behaviour
    const expandBtn = document.getElementById("expandAll");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        document.querySelectorAll("details.segment").forEach(det => det.setAttribute("open", ""));
      });
    }

    // Theme toggle functionality
    const themeBtn = document.getElementById("toggleTheme");
    if (themeBtn) {
      const applyTheme = (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("jwt_decoder_theme", theme);
        themeBtn.textContent = theme === "dark" ? "Lights on" : "Lights off";

        // Toggle highlight.js theme stylesheets
        const hlLight = document.getElementById("hljs-light");
        const hlDark = document.getElementById("hljs-dark");
        if (hlLight && hlDark) {
          hlLight.disabled = theme === "dark";
          hlDark.disabled = theme !== "dark";
        }
      };

      // Initialize from localStorage or prefers-color-scheme
      const savedTheme = localStorage.getItem("jwt_decoder_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

      themeBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    }
  };

  if (params.has("id")) {
    const id = params.get("id");
    chrome.storage?.local.get(id, (result) => {
      const stored = result && result[id];
      processTokens(Array.isArray(stored) ? stored : []);
      // Clean up the stored entry afterwards
      chrome.storage?.local.remove(id);
    });
  } else {
    // Collect all "token" parameters (support multiple values)
    const tokens = params.getAll("token").map(t => t.trim()).filter(Boolean);
    processTokens(tokens);
  }
})(); 