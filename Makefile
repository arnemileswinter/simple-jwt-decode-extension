VERSION ?= 1.0.0
SOURCES=background.js decode.html decode.js content.js icon.svg style.css
OUT_DIR=dist
HLJS_SRCS=lib/highlightjs/build/highlight.min.js lib/highlightjs/build/styles/default.min.css lib/highlightjs/build/styles/dark.min.css

HLJS_WEBSRCS=https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/default.min.css https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/dark.min.css
HLJS_DIR=lib/highlightjs
HLJS_SRCS=$(HLJS_DIR)/highlight.min.js $(HLJS_DIR)/default.min.css $(HLJS_DIR)/dark.min.css

HLJS_LINE_NUMBERS_WEBSRC=https://cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@2.9.0/dist/highlightjs-line-numbers.min.js
HLJS_LINE_NUMBERS_SRC=$(HLJS_LINE_NUMBERS_DIR)/highlightjs-line-numbers.min.js
HLJS_LINE_NUMBERS_DIR=lib/highlightjs-line-numbers

.PHONY: all clean dirs chrome-dir firefox-dir chrome-zip firefox-zip $(OUT_DIR)

all: chrome-zip firefox-zip

dirs: chrome-dir firefox-dir

$(HLJS_LINE_NUMBERS_SRC):
	mkdir -p $(HLJS_LINE_NUMBERS_DIR)
	wget $(HLJS_LINE_NUMBERS_WEBSRC) -O $(HLJS_LINE_NUMBERS_SRC)

$(HLJS_SRCS):
	mkdir -p $(HLJS_DIR)
	for file in $(HLJS_WEBSRCS); do \
		wget $$file -O $(HLJS_DIR)/$$(basename $$file); \
	done
	touch $(HLJS_SRCS)

chrome-dir: $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/
$(OUT_DIR)/jwt-decoder-chrome-${VERSION}/: $(SOURCES) $(HLJS_SRCS) $(HLJS_LINE_NUMBERS_SRC) manifests/manifest_chrome.template.json
	mkdir -p $(OUT_DIR)/jwt-decoder-chrome-${VERSION}
	sed "s/{{VERSION}}/${VERSION}/" manifests/manifest_chrome.template.json > $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/manifest.json
	cp $(SOURCES) $(OUT_DIR)/jwt-decoder-chrome-${VERSION}
	mkdir -p $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/lib

	mkdir -p $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/lib/highlightjs
	for file in $(HLJS_SRCS); do \
		cp $$file $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/lib/highlightjs/; \
	done

	cp $(HLJS_LINE_NUMBERS_SRC) $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/lib/highlightjs/highlightjs-line-numbers.min.js

chrome-zip: $(OUT_DIR)/jwt-decoder-chrome-${VERSION}.zip
$(OUT_DIR)/jwt-decoder-chrome-${VERSION}.zip: $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/
	cd $(OUT_DIR)/jwt-decoder-chrome-${VERSION} && zip -r ../jwt-decoder-chrome-${VERSION}.zip ./*

firefox-dir: $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/
$(OUT_DIR)/jwt-decoder-firefox-${VERSION}/: $(SOURCES) $(HLJS_SRCS) $(HLJS_LINE_NUMBERS_SRC) manifests/manifest_firefox.template.json
	mkdir -p $(OUT_DIR)/jwt-decoder-firefox-${VERSION}
	sed "s/{{VERSION}}/${VERSION}/" manifests/manifest_firefox.template.json > $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/manifest.json
	cp $(SOURCES) $(OUT_DIR)/jwt-decoder-firefox-${VERSION}
	mkdir -p $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/lib

	mkdir -p $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/lib/highlightjs
	for file in $(HLJS_SRCS); do \
		cp $$file $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/lib/highlightjs/; \
	done

	cp $(HLJS_LINE_NUMBERS_SRC) $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/lib/highlightjs/highlightjs-line-numbers.min.js

firefox-zip: $(OUT_DIR)/jwt-decoder-firefox-${VERSION}.zip
$(OUT_DIR)/jwt-decoder-firefox-${VERSION}.zip: $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/
	cd $(OUT_DIR)/jwt-decoder-firefox-${VERSION} && zip -r ../jwt-decoder-firefox-${VERSION}.zip ./*

clean:
	rm -rf $(OUT_DIR)
	rm -rf $(HLJS_DIR)
	rm -rf $(HLJS_LINE_NUMBERS_DIR)