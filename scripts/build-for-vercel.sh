#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/../" || exit 1

# Validate token
if [ -z "${GITLAB_PAT:-}" ]; then
  echo "❌ GITLAB_PAT not found."
  echo "👉 Set it in Vercel: Project → Settings → Environment Variables"
  exit 1
fi

# Config
CONTENT_DIR="src/vault"
CONTENT_REPO="gitlab.com/artsbymat-me/vault.git"
BRANCH="main"

echo "🔄 Removing old content directory..."
rm -rf "${CONTENT_DIR}"

echo "📥 Cloning private GitLab repository..."

git -c credential.helper= \
  clone \
  --depth 1 \
  --branch "${BRANCH}" \
  "https://${GITLAB_PAT}:@${CONTENT_REPO}" \
  "${CONTENT_DIR}"

echo "🚀 Repo cloned successfully. Building app..."
npm run build
