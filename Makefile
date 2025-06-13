VERSION ?= 1.0.0
SOURCES = background.js decode.html decode.js content.js icon.svg style.css
OUT_DIR = dist

# Highlight.js configuration
HLJS_VERSION = 11.8.0
HLJS_DIR = lib/highlightjs
HLJS_BASE_URL = https://cdnjs.cloudflare.com/ajax/libs/highlight.js/$(HLJS_VERSION)
HLJS_FILES = highlight.min.js default.min.css dark.min.css
HLJS_SRCS = $(addprefix $(HLJS_DIR)/,$(HLJS_FILES))

# Highlight.js line numbers configuration  
HLJS_LINE_NUMBERS_VERSION = 2.9.0
HLJS_LINE_NUMBERS_DIR = lib/highlightjs-line-numbers
HLJS_LINE_NUMBERS_SRC = $(HLJS_LINE_NUMBERS_DIR)/highlightjs-line-numbers.min.js
HLJS_LINE_NUMBERS_URL = https://cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@$(HLJS_LINE_NUMBERS_VERSION)/dist/highlightjs-line-numbers.min.js

# Build directories
CHROME_DIR = $(OUT_DIR)/jwt-decoder-chrome-$(VERSION)
FIREFOX_DIR = $(OUT_DIR)/jwt-decoder-firefox-$(VERSION)

# Prevent deletion of intermediate files
.SECONDARY:

# Declare phony targets
.PHONY: all clean dirs chrome-dir firefox-dir chrome-zip firefox-zip help

# Default target
all: chrome-zip firefox-zip

# Help target
help:
	@echo "Available targets:"
	@echo "  all          - Build both Chrome and Firefox extensions (default)"
	@echo "  chrome-zip   - Build Chrome extension zip"
	@echo "  firefox-zip  - Build Firefox extension zip"
	@echo "  chrome-dir   - Build Chrome extension directory"
	@echo "  firefox-dir  - Build Firefox extension directory"
	@echo "  dirs         - Build both extension directories"
	@echo "  clean        - Remove all build artifacts"
	@echo "  help         - Show this help message"

# Convenience target for directories
dirs: chrome-dir firefox-dir

# Create output directory
$(OUT_DIR):
	mkdir -p $@

# Download highlight.js files individually for better caching
$(HLJS_DIR)/%.min.js: | $(HLJS_DIR)
	wget $(HLJS_BASE_URL)/$*.min.js -O $@

$(HLJS_DIR)/%.min.css: | $(HLJS_DIR)
	wget $(HLJS_BASE_URL)/styles/$*.min.css -O $@

# Create highlight.js directory
$(HLJS_DIR):
	mkdir -p $@

# Download highlight.js line numbers plugin
$(HLJS_LINE_NUMBERS_SRC): | $(HLJS_LINE_NUMBERS_DIR)
	wget $(HLJS_LINE_NUMBERS_URL) -O $@

# Create line numbers directory
$(HLJS_LINE_NUMBERS_DIR):
	mkdir -p $@

# Chrome extension directory
chrome-dir: $(CHROME_DIR)/.built

$(CHROME_DIR)/.built: $(SOURCES) $(HLJS_SRCS) $(HLJS_LINE_NUMBERS_SRC) manifests/manifest_chrome.template.json | $(OUT_DIR)
	@echo "Building Chrome extension directory..."
	mkdir -p $(CHROME_DIR)
	sed "s/{{VERSION}}/$(VERSION)/" manifests/manifest_chrome.template.json > $(CHROME_DIR)/manifest.json
	cp $(SOURCES) $(CHROME_DIR)/
	mkdir -p $(CHROME_DIR)/lib/highlightjs
	cp $(HLJS_SRCS) $(CHROME_DIR)/lib/highlightjs/
	cp $(HLJS_LINE_NUMBERS_SRC) $(CHROME_DIR)/lib/highlightjs/highlightjs-line-numbers.min.js
	@touch $@

# Firefox extension directory  
firefox-dir: $(FIREFOX_DIR)/.built

$(FIREFOX_DIR)/.built: $(SOURCES) $(HLJS_SRCS) $(HLJS_LINE_NUMBERS_SRC) manifests/manifest_firefox.template.json | $(OUT_DIR)
	@echo "Building Firefox extension directory..."
	mkdir -p $(FIREFOX_DIR)
	sed "s/{{VERSION}}/$(VERSION)/" manifests/manifest_firefox.template.json > $(FIREFOX_DIR)/manifest.json
	cp $(SOURCES) $(FIREFOX_DIR)/
	mkdir -p $(FIREFOX_DIR)/lib/highlightjs
	cp $(HLJS_SRCS) $(FIREFOX_DIR)/lib/highlightjs/
	cp $(HLJS_LINE_NUMBERS_SRC) $(FIREFOX_DIR)/lib/highlightjs/highlightjs-line-numbers.min.js
	@touch $@

# Chrome extension zip
chrome-zip: $(OUT_DIR)/jwt-decoder-chrome-$(VERSION).zip

$(OUT_DIR)/jwt-decoder-chrome-$(VERSION).zip: $(CHROME_DIR)/.built
	@echo "Creating Chrome extension zip..."
	cd $(CHROME_DIR) && zip -r ../jwt-decoder-chrome-$(VERSION).zip ./*

# Firefox extension zip
firefox-zip: $(OUT_DIR)/jwt-decoder-firefox-$(VERSION).zip

$(OUT_DIR)/jwt-decoder-firefox-$(VERSION).zip: $(FIREFOX_DIR)/.built
	@echo "Creating Firefox extension zip..."
	cd $(FIREFOX_DIR) && zip -r ../jwt-decoder-firefox-$(VERSION).zip ./*

# Clean up all build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(OUT_DIR)
	rm -rf $(HLJS_DIR)
	rm -rf $(HLJS_LINE_NUMBERS_DIR)