#!/bin/bash
set -e

TARGET="frontend/public/v86"
RAW="https://raw.githubusercontent.com/copy/v86/master"

mkdir -p "$TARGET"

echo "Downloading v86 binaries..."
curl -L --fail -o "$TARGET/libv86.js"      "https://cdn.jsdelivr.net/npm/v86/build/libv86.js"
curl -L --fail -o "$TARGET/seabios.bin"    "$RAW/bios/seabios.bin"
curl -L --fail -o "$TARGET/vgabios.bin"    "$RAW/bios/vgabios.bin"
curl -L --fail -o "$TARGET/freedos722.img" "$RAW/images/freedos722.img"

echo "Done."
ls -lh "$TARGET"
