VERSION ?= latest
SOURCES=background.js decode.html decode.js icon.svg
OUT_DIR=dist

.PHONY: all clean dirs chrome-dir firefox-dir chrome-zip firefox-zip $(OUT_DIR)

all: chrome-zip firefox-zip

dirs: chrome-dir firefox-dir

chrome-dir: $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/
$(OUT_DIR)/jwt-decoder-chrome-${VERSION}/: $(SOURCES) manifests/manifest_chrome.template.json
	mkdir -p $(OUT_DIR)/jwt-decoder-chrome-${VERSION}
	sed "s/{{VERSION}}/${VERSION}/" manifests/manifest_chrome.template.json > $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/manifest.json
	cp $(SOURCES) $(OUT_DIR)/jwt-decoder-chrome-${VERSION}
chrome-zip: $(OUT_DIR)/jwt-decoder-chrome-${VERSION}.zip
$(OUT_DIR)/jwt-decoder-chrome-${VERSION}.zip: $(OUT_DIR)/jwt-decoder-chrome-${VERSION}/
	cd $(OUT_DIR)/jwt-decoder-chrome-${VERSION} && zip -r ../jwt-decoder-chrome-${VERSION}.zip ./*

firefox-dir: $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/
$(OUT_DIR)/jwt-decoder-firefox-${VERSION}/: $(SOURCES) manifests/manifest_firefox.template.json
	mkdir -p $(OUT_DIR)/jwt-decoder-firefox-${VERSION}
	sed "s/{{VERSION}}/${VERSION}/" manifests/manifest_firefox.template.json > $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/manifest.json
	cp $(SOURCES) $(OUT_DIR)/jwt-decoder-firefox-${VERSION}
firefox-zip: $(OUT_DIR)/jwt-decoder-firefox-${VERSION}.zip
$(OUT_DIR)/jwt-decoder-firefox-${VERSION}.zip: $(OUT_DIR)/jwt-decoder-firefox-${VERSION}/
	cd $(OUT_DIR)/jwt-decoder-firefox-${VERSION} && zip -r ../jwt-decoder-firefox-${VERSION}.zip ./*

clean:
	rm -rf $(OUT_DIR)