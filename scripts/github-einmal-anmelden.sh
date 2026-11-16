#!/usr/bin/env bash
# Einmalig: GitHub-Anmeldung + Repo anlegen + Push
# Im macOS-Terminal ausführen (interaktiv, Browser öffnet sich).

set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if command -v gh >/dev/null 2>&1; then
  GH="gh"
elif [ -x "${REPO_ROOT}/.tools/gh" ]; then
  GH="${REPO_ROOT}/.tools/gh"
else
  echo "Installiere zuerst: brew install gh"
  exit 1
fi

echo "=== Schritt 1: Bei GitHub anmelden ==="
"$GH" auth login -h github.com -p https -w --skip-ssh-key

echo ""
echo "=== Schritt 2: Repo erstellen und pushen ==="
exec "${REPO_ROOT}/scripts/github-setup.sh" "$@"
