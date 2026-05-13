#!/bin/bash
set -e

TARGET="frontend/public/v86"
RELEASE="https://github.com/copy/v86/releases/download/latest"

mkdir -p "$TARGET"

echo "Downloading v86 binaries..."
curl -L -o "$TARGET/libv86.js"      "$RELEASE/libv86.js"
curl -L -o "$TARGET/seabios.bin"    "$RELEASE/bios/seabios.bin"
curl -L -o "$TARGET/vgabios.bin"    "$RELEASE/bios/vgabios.bin"
curl -L -o "$TARGET/freedos722.img" "$RELEASE/images/freedos722.img"

echo "Done. Files in $TARGET"
echo "If downloads fail: https://github.com/copy/v86/releases"
