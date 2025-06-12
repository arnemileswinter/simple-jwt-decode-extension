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

function decodeJWT(token) {
  const parts = token.split(".");
  if (parts.length < 2) {
    throw new Error("Input does not appear to be a JWT (need at least header and payload)");
  }
  const headerJSON = base64urlDecode(parts[0]);
  const payloadJSON = base64urlDecode(parts[1]);

  let header, payload;
  try {
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
}

(function () {
  const params = new URLSearchParams(window.location.search);
  // Collect all "token" parameters (support multiple values)
  const tokens = params.getAll("token").map(t => t.trim()).filter(Boolean);

  if (tokens.length === 0) {
    render("<p class=\"error\">No token supplied.</p>");
    return;
  }

  let html = "";

  tokens.forEach((token, idx) => {
    try {
      const { header, payload, signature } = decodeJWT(token);

      html += `<section>`;
      if(tokens.length > 1) {
        html += `<h2>Token ${idx + 1}</h2>`;
      }
      html += "<h3>Header</h3><pre>" + JSON.stringify(header, null, 2) + "</pre>";
      html += "<h3>Payload</h3><pre>" + JSON.stringify(payload, null, 2) + "</pre>";
      if (signature) {
        html += "<h3>Signature (base64url)</h3><pre>" + signature + "</pre>";
      }
      html += "<h3>Raw Token</h3><pre>" + token + "</pre>";
      html += `</section>`;
    } catch (err) {
      html += `<section><h2>Token ${idx + 1}</h2><p class=\"error\">Error: ${err.message}</p></section>`;
    }
  });

  render(html);
})(); 