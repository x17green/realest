#!/bin/bash

# Check deployment status and environment configuration

set -e

echo "🔍 RealProof Marketplace - Deployment Status"
echo "==========================================="
echo

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check local environment
echo "🏠 Local environment:"
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
    if grep -q "NEXT_PUBLIC_APP_MODE" .env.local; then
        APP_MODE=$(grep "NEXT_PUBLIC_APP_MODE" .env.local | cut -d'=' -f2)
        echo "   📱 App Mode: $APP_MODE"
    fi
else
    echo "   ❌ .env.local not found"
fi

# Check build status
echo "🔨 Build status:"
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Build successful"
else
    echo "   ⚠️  Build has issues"
fi

# Check Vercel configuration files
echo "☁️  Vercel configuration:"
for env_file in .vercel/env-*.json; do
    if [ -f "$env_file" ]; then
        echo "   ✅ $(basename "$env_file") exists"
    fi
done

echo
echo "💡 Next steps:"
echo "   1. Configure environment variables in Vercel"
echo "   2. Deploy branches to test functionality"
echo "   3. Verify coming soon page on main branch"
echo "   4. Test full site on develop/staging branches"
