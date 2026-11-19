#!/usr/bin/env bash
# Build a macOS .dmg installer (Apple Silicon / ARM64).
# The bundled JRE makes the app run without Java installed on the client machine.
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── 0. Bundled JRE ────────────────────────────────────────────────────────────
JRE_DIR="$ROOT/electron/jre-mac"

if [ ! -f "$JRE_DIR/bin/java" ]; then
  echo "▶ 0/3  Downloading JRE 17 for macOS ARM64 (one-time, ~55 MB)..."
  TMP=$(mktemp -d)

  # Eclipse Temurin 17.0.12 — stable LTS release (July 2024)
  JRE_URL="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12%2B7/OpenJDK17U-jre_aarch64_mac_hotspot_17.0.12_7.tar.gz"
  curl -L --progress-bar "$JRE_URL" -o "$TMP/jre.tar.gz"

  echo "   Extracting JRE..."
  tar xzf "$TMP/jre.tar.gz" -C "$TMP"

  # Temurin macOS tar: the actual JRE lives at jdk-*/Contents/Home/
  JRE_HOME=$(find "$TMP" -type d -name "Home" -path "*/Contents/Home" | head -1)
  mkdir -p "$JRE_DIR"
  # ditto preserves symlinks and extended attributes correctly on macOS
  ditto "$JRE_HOME" "$JRE_DIR"
  chmod +x "$JRE_DIR/bin/java"

  rm -rf "$TMP"
  echo "   → electron/jre-mac/ ($(du -sh "$JRE_DIR" | cut -f1))"
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
echo "▶ 3/3  Packaging with Electron (macOS ARM64)..."
cd "$ROOT/electron"
npm install --silent
npm run build:mac

echo ""
echo "✅  Done!  Installer → electron/dist-electron/"
echo ""
echo "   ┌─ First-launch note ──────────────────────────────────────────────┐"
echo "   │  The DMG is unsigned. macOS Gatekeeper will block it by default. │"
echo "   │  To open on a fresh Mac:                                          │"
echo "   │    Right-click the .app → Open → Open                            │"
echo "   │  Or: System Settings → Privacy & Security → Allow anyway         │"
echo "   └───────────────────────────────────────────────────────────────────┘"
