#!/bin/bash
set -e

TARGET="frontend/public/v86"
RELEASE="https://github.com/copy/v86/releases/latest/download"

mkdir -p "$TARGET"

echo "Downloading v86 binaries..."
curl -L --fail -o "$TARGET/libv86.js"      "$RELEASE/libv86.js"
curl -L --fail -o "$TARGET/seabios.bin"    "$RELEASE/seabios.bin"
curl -L --fail -o "$TARGET/vgabios.bin"    "$RELEASE/vgabios.bin"
curl -L --fail -o "$TARGET/freedos722.img" "$RELEASE/freedos722.img"

echo "Done. Files in $TARGET"
ls -lh "$TARGET"
