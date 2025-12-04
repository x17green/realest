#!/bin/bash

# Quick branch switching script for RealProof Marketplace

set -e

BRANCH=$1

if [ -z "$BRANCH" ]; then
    echo "Usage: ./scripts/switch-branch.sh <branch-name>"
    echo "Available branches: main, develop, staging"
    exit 1
fi

echo "🔄 Switching to $BRANCH branch..."

# Stash any uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "💾 Stashing uncommitted changes..."
    git stash push -m "Auto-stash before branch switch $(date)"
fi

# Switch branch and pull latest
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "✅ Successfully switched to $BRANCH branch"

# Show current status
echo "📊 Current status:"
git status --short
