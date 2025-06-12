# JWT Decoder Extension

A simple cross-browser (Chrome & Firefox) WebExtension that adds a context-menu item to decode all JSON Web Tokens (JWTs) found in the selected text.

## Features
* Right-click any selected text and choose **"Decode JWT"**.
* All JWTs detected in the selection are decoded – each token's header, payload, signature, and raw string are rendered in a new tab.

## Installation

### From Releases (Recommended)
1. Go to the [Releases](https://github.com/arnemileswinter/simple-jwt-decode-extension/releases) tab
2. Download the appropriate ZIP file for your browser (Chrome or Firefox) and extract the zips.
3. Follow the installation instructions below for your browser

### Chrome / Edge
4. Open **chrome://extensions** in the browser.
5. Enable **Developer mode** (top-right toggle).
6. Click **Load unpacked** and select the project directory.

### Firefox
4. Open **about:debugging#/runtime/this-firefox**.
5. Click **Load Temporary Add-on…** and select the `manifest.json` file.

### Building

The project uses a Makefile to build browser extensions for both Chrome and Firefox. Here are the available commands:

```bash
# Build both Chrome and Firefox extensions
make all

# Build only Chrome extension
make chrome-zip

# Build only Firefox extension
make firefox-zip

# Clean build artifacts
make clean
```

By default, extensions are built with version "latest". To specify a custom version:

```bash
make VERSION=1.0.0
```

The build process:
1. Creates a distribution directory (`dist/`)
2. Generates browser-specific manifest files
3. Copies all source files
4. Creates ZIP archives ready for distribution

Built extensions can be found in the `dist/` directory.

## License
MIT 