#!/usr/bin/env bash
# Build a Windows .exe installer from macOS.
# The bundled JRE makes the app run without Java installed on the client machine.
#
# Requirements for building on macOS:
#   brew install --cask wine-stable   (needed for the NSIS packager only)
#
# Alternative — build on a Windows machine:
#   1. Run steps 0-2 manually (mvn package, npm run build)
#   2. Copy the output to the Windows machine
#   3. Run:  cd electron && npm install && npm run build:win
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── 0. Bundled JRE ────────────────────────────────────────────────────────────
JRE_DIR="$ROOT/electron/jre-win"

if [ ! -f "$JRE_DIR/bin/java.exe" ]; then
  echo "▶ 0/3  Downloading JRE 17 for Windows x64 (one-time, ~60 MB)..."
  TMP=$(mktemp -d)

  # Eclipse Temurin 17.0.12 — stable LTS release (July 2024)
  JRE_URL="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12%2B7/OpenJDK17U-jre_x64_windows_hotspot_17.0.12_7.zip"
  curl -L --progress-bar "$JRE_URL" -o "$TMP/jre.zip"

  echo "   Extracting JRE..."
  unzip -q "$TMP/jre.zip" -d "$TMP/jre_extract"

  # Temurin Windows zip: strips to jdk-17.0.12+7-jre/ at the top level
  JRE_SRC=$(find "$TMP/jre_extract" -maxdepth 1 -mindepth 1 -type d | head -1)
  mkdir -p "$JRE_DIR"
  cp -r "$JRE_SRC/." "$JRE_DIR/"

  rm -rf "$TMP"
  echo "   → electron/jre-win/ ($(du -sh "$JRE_DIR" | cut -f1))"
else
  echo "▶ 0/3  JRE already present — skipping download."
fi

# ── 1. Spring Boot JAR ────────────────────────────────────────────────────────
echo "▶ 1/3  Building Spring Boot JAR..."
cd "$ROOT/backend"
mvn package -DskipTests -q
echo "   → backend/target/pointage-backend.jar"

# ── 2. React frontend ─────────────────────────────────────────────────────────
echo "▶ 2/3  Building React app..."
cd "$ROOT/frontend"
npm install --silent
npm run build
echo "   → frontend/dist/"

# ── 3. Electron packaging ─────────────────────────────────────────────────────
echo "▶ 3/3  Packaging with Electron (Windows x64)..."
cd "$ROOT/electron"
npm install --silent
npm run build:win-portable

echo ""
echo "✅  Done!  Installer → electron/dist-electron/"
echo ""
echo "   ┌─ First-launch note ──────────────────────────────────────────────┐"
echo "   │  The EXE is unsigned. Windows SmartScreen may warn about it.     │"
echo "   │  Click 'More info' → 'Run anyway' to proceed with installation.  │"
echo "   └───────────────────────────────────────────────────────────────────┘"
