#!/usr/bin/env bash
set -euo pipefail

echo "✅ Step 1/5: Build"
npm run build

echo "✅ Step 2/5: Git add"
git add src/pages/Login.tsx

echo "✅ Step 3/5: Git commit"
# Commit only if there are staged changes
if git diff --cached --quiet; then
  echo "ℹ️  No staged changes to commit."
else
  git commit -m "fix(login): bilingual + notify receiver webhook + LanguageContext compatibility"
fi

echo "✅ Step 4/5: Git push"
git push origin master

echo "✅ Step 5/5: Vercel deploy"
npx vercel --prod --force
