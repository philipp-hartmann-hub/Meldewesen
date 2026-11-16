#!/usr/bin/env bash
# GitHub-Repo für A2 eMeldewesen anlegen und ersten Push ausführen.
# Voraussetzung: GitHub CLI (gh) installiert und eingeloggt.
#
# Installation (einmalig, macOS):
#   brew install gh
#   gh auth login
#
# Nutzung:
#   ./scripts/github-setup.sh
#   ./scripts/github-setup.sh mein-github-user anderer-repo-name

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

GITHUB_USER="${1:-}"
REPO_NAME="${2:-meldewesen-a2}"

GH=""
if command -v gh >/dev/null 2>&1; then
  GH="gh"
elif [ -x "${REPO_ROOT}/.tools/gh" ]; then
  GH="${REPO_ROOT}/.tools/gh"
else
  echo "Fehler: 'gh' (GitHub CLI) ist nicht installiert."
  echo "  brew install gh"
  echo "  oder: Projektroot .tools/gh bereitstellen"
  echo "  gh auth login"
  exit 1
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Fehler: Nicht bei GitHub angemeldet. Bitte ausführen: $GH auth login"
  exit 1
fi

if [ -z "$GITHUB_USER" ]; then
  GITHUB_USER="$("$GH" api user -q .login)"
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' existiert bereits:"
  git remote -v
  echo "Abbruch. Zum Neuverbinden: git remote remove origin"
  exit 1
fi

echo "Erstelle privates Repo: ${GITHUB_USER}/${REPO_NAME}"
"$GH" repo create "${REPO_NAME}" \
  --private \
  --source=. \
  --remote=origin \
  --description "HEUREKA 2.0 – A2 eMeldewesen (Prototyp)" \
  --push

echo ""
echo "Fertig: https://github.com/${GITHUB_USER}/${REPO_NAME}"
