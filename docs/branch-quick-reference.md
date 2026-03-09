# Quick Reference - Branch Management

## Branch Overview

| Branch | Purpose | URL | App Mode |
|--------|---------|-----|----------|
| `main` | Production (Coming Soon) | `realest.ng` | `coming-soon` |
| `develop` | Development | `dev.realest.ng` | `development` |
| `staging` | Testing/QA | `demo.realest.ng` | `full-site` |

## Quick Commands

### Switch Branches
```bash
./scripts/switch-branch.sh develop
./scripts/switch-branch.sh staging
./scripts/switch-branch.sh main
```

### Check Status
```bash
./scripts/check-deployment.sh
```

### Local Development
```bash
# Test coming soon mode
NEXT_PUBLIC_APP_MODE=coming-soon npm run dev

# Test full site mode
NEXT_PUBLIC_APP_MODE=full-site npm run dev

# Test with countdown
NEXT_PUBLIC_APP_MODE=coming-soon NEXT_PUBLIC_RELEASE_DATE=2025-12-31T23:59:59Z npm run dev

# Test route lockdown (coming-soon mode only allows home route)
npm run test:lockdown
```

### Deployment Workflow
```bash
# 1. Develop feature
git checkout develop
git checkout -b feat/new-feature
# ... work on feature
git commit -m "feat: add new feature"

# 2. Merge to develop
git checkout develop
git merge feat/new-feature --no-ff
git push origin develop

# 3. Promote to staging
git checkout staging
git merge develop --no-ff
git push origin staging

# 4. Backup to main (code sync)
git checkout main
git merge staging --no-ff
git push origin main
```

## Environment Variables (Vercel)

### Main Branch
```
NEXT_PUBLIC_APP_MODE=coming-soon
NEXT_PUBLIC_RELEASE_DATE=2025-03-01T00:00:00Z
```

### Develop Branch
```
NEXT_PUBLIC_APP_MODE=development
```

### Staging Branch
```
NEXT_PUBLIC_APP_MODE=full-site
```

## Route Protection (Coming Soon Mode)

### Complete Lockdown
In `coming-soon` mode, only these routes are accessible:
- ✅ `/` - Shows coming soon page
- ✅ `/not-found` - 404 page  
- ✅ `/favicon.ico` - Browser favicon
- ✅ Static assets (`/_next/`, images, CSS, etc.)

### All Other Routes Blocked
- ❌ `/about`, `/buy`, `/rent`, `/contact` - Shows 404
- ❌ `/admin`, `/owner`, `/agent` - Shows 404  
- ❌ `/login`, `/register` - Shows 404
- ❌ Demo pages - Shows 404

### Testing Route Protection
```bash
# Start coming soon mode
npm run dev:coming-soon

# Test route lockdown (in another terminal)
npm run test:lockdown

# Verbose testing
VERBOSE=true npm run test:lockdown
```

## Troubleshooting

- **Wrong page showing?** → Check environment variables in Vercel
- **Demo pages not accessible?** → Ensure `NEXT_PUBLIC_APP_MODE=development`
- **Countdown not working?** → Verify `NEXT_PUBLIC_RELEASE_DATE` format
- **Routes accessible in coming-soon?** → Run `npm run test:lockdown` to verify
- **Build errors?** → Run `npm run build` locally to debug

For detailed documentation, see `docs/BRANCH_MANAGEMENT.md`
