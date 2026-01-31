#!/bin/bash

# Exit on error
set -e

# Directory checks
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
BUILD_DIR="$PROJECT_ROOT/build/bin"
APPDIR="$PROJECT_ROOT/build/AppDir"

# Ensure we are in the project root
cd "$PROJECT_ROOT"

echo "Building Wails project..."
wails build -upx

# Check if build was successful
if [ ! -f "$BUILD_DIR/NezordLauncher" ]; then
    echo "Error: Build failed. Binary not found at $BUILD_DIR/NezordLauncher"
    exit 1
fi

# Prepare AppDir
echo "Preparing AppDir..."
rm -rf "$APPDIR"
mkdir -p "$APPDIR"

# Download linuxdeploy tools if not present
TOOLS_DIR="$PROJECT_ROOT/build/linux/tools"
mkdir -p "$TOOLS_DIR"

LINUXDEPLOY="$TOOLS_DIR/linuxdeploy-x86_64.AppImage"
if [ ! -f "$LINUXDEPLOY" ]; then
    echo "Downloading linuxdeploy..."
    wget -O "$LINUXDEPLOY" https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage
    chmod +x "$LINUXDEPLOY"
fi

export APPIMAGE_EXTRACT_AND_RUN=1
export NO_STRIP=true

# Run linuxdeploy
echo "Generating AppImage..."


cp "$PROJECT_ROOT/build/appicon.png" "$PROJECT_ROOT/build/nezordlauncher.png"
# Resize icon to 512x512
if command -v convert >/dev/null 2>&1; then
    convert "$PROJECT_ROOT/build/nezordlauncher.png" -resize 512x512 "$PROJECT_ROOT/build/nezordlauncher.png"
    echo "Resized icon to 512x512"
else
    echo "Warning: 'convert' not found. Icon might be too large."
fi

# Handle binary name mismatch (Desktop file expects 'nezordlauncher')
cp "$BUILD_DIR/NezordLauncher" "$BUILD_DIR/nezordlauncher"

# Create a temporary desktop file with corrected Exec path
sed 's|Exec=/usr/bin/nezordlauncher|Exec=nezordlauncher|g' "$PROJECT_ROOT/build/NezordLauncher.desktop" > "$PROJECT_ROOT/build/nezordlauncher.desktop"

"$LINUXDEPLOY" \
    --appdir "$APPDIR" \
    --executable "$BUILD_DIR/nezordlauncher" \
    --desktop-file "$PROJECT_ROOT/build/nezordlauncher.desktop" \
    --icon-file "$PROJECT_ROOT/build/nezordlauncher.png" \
    --output appimage

# Cleanup temp files
rm "$PROJECT_ROOT/build/nezordlauncher.desktop" "$PROJECT_ROOT/build/nezordlauncher.png" "$BUILD_DIR/nezordlauncher"

echo "AppImage created successfully!"
ls -lh NezordLauncher*.AppImage
