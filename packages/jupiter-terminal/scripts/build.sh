#!/bin/bash

# Create temp directory for Jupiter terminal
TEMP_DIR="temp-jupiter"
BUNDLE_DEST="./dist"
COMMIT="34f8c0a3160e493dee4ecc22d5effbc1506c5c11"

# 1. Clone and prepare Jupiter terminal repo
if [ -d "$TEMP_DIR" ]; then
  rm -rf "$TEMP_DIR"
fi
git clone --depth 1 --branch main "https://${GITHUB_TOKEN}@github.com/jup-ag/terminal.git" $TEMP_DIR
cd $TEMP_DIR
git reset --hard origin/main
git fetch origin $COMMIT
git reset --hard $COMMIT

# 2. Copy our customized files
cd ../
cp -r overrides/* $TEMP_DIR/

# 3. Build the widget
cd $TEMP_DIR
# Update package.json to use stylus 0.0.1-security
pnpm add stylus@0.0.1-security -D --ignore-workspace

# Install dependencies
pnpm install --ignore-workspace
pnpm tsup

# 4. Create internal deps directory and move bundle
cd ..
if [ ! -d "$BUNDLE_DEST" ]; then
  mkdir -p $BUNDLE_DEST
fi
cp -rf $TEMP_DIR/dist/* $BUNDLE_DEST/

# 5. Cleanup
rm -rf $TEMP_DIR
