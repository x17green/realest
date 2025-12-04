# Branch Management & Environment Configuration

This document outlines the intelligent branch management system implemented for the RealProof Marketplace, enabling different versions of the application to run simultaneously across development, staging, and production environments.

## Overview

Our branch management strategy uses environment variables and conditional rendering to deploy different versions of the application without code duplication. This allows us to:

- Display a "Coming Soon" page on production while continuing development
- Show full functionality on development and staging environments
- Automatically transition from "Coming Soon" to full site based on a countdown timer
- Maintain clean Git history with standard merge workflows

## Branch Structure

### `main` Branch
- **Purpose**: Production deployment with "Coming Soon" experience
- **URL**: `realest.ng` (production domain)
- **Features**: 
  - Coming Soon hero with countdown timer
  - Automatic transition to full site when countdown expires
  - Restricted access to demo pages and admin features
  - Authentication disabled until launch

### `develop` Branch
- **Purpose**: Active development with full website functionality
- **URL**: `dev.realest.ng`
- **Features**:
  - Full website functionality
  - Access to all demo pages
  - Authentication enabled
  - All features and components available

### `staging` Branch
- **Purpose**: Testing and QA with production-like environment
- **URL**: `demo.realest.ng`
- **Features**:
  - Full website functionality
  - Authentication enabled
  - Production-like configuration
  - No demo/test pages

### Feature Branches
- **Purpose**: Individual feature development
- **Naming**: `feat/feature-name`, `fix/bug-name`, `chore/task-name`
- **Base**: Created from `develop`
- **Merge**: Into `develop` when complete

## Environment Variables

### Vercel Configuration

Set these environment variables in your Vercel project settings for each branch:

#### Main Branch (`main`)
```bash
NEXT_PUBLIC_APP_MODE=coming-soon
NEXT_PUBLIC_RELEASE_DATE=2025-03-01T00:00:00Z
```

#### Develop Branch (`develop`)
```bash
NEXT_PUBLIC_APP_MODE=development
```

#### Staging Branch (`staging`)
```bash
NEXT_PUBLIC_APP_MODE=full-site
```

### Environment Variable Reference

| Variable | Values | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_APP_MODE` | `coming-soon` \| `full-site` \| `development` \| `demo` | Controls which version of the app is displayed |
| `NEXT_PUBLIC_RELEASE_DATE` | ISO 8601 date string | When to automatically transition from coming soon to full site |

### App Mode Behavior

| Mode | Demo Pages | Full Site | Authentication | Restricted Routes |
|------|------------|-----------|----------------|-------------------|
| `coming-soon` | ❌ | ❌* | ❌* | `/admin`, `/buyer`, `/owner`, `/demo` |
| `full-site` | ❌ | ✅ | ✅ | None |
| `development` | ✅ | ✅ | ✅ | None |
| `demo` | ✅ | ✅ | ✅ | None |

*\* Automatically enabled when `NEXT_PUBLIC_RELEASE_DATE` is reached*

## Workflow

### Daily Development Workflow

1. **Feature Development**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/new-feature
   # ... develop feature
   git commit -m "feat: add new feature"
   git push origin feat/new-feature
   ```

2. **Merge to Develop**
   ```bash
   git checkout develop
   git merge feat/new-feature --no-ff
   git push origin develop
   # Automatically deploys to dev.realest.ng
   ```

3. **Promote to Staging**
   ```bash
   git checkout staging
   git pull origin staging
   git merge develop --no-ff
   git push origin staging
   # Automatically deploys to demo.realest.ng
   ```

4. **Backup to Main (Code Sync)**
   ```bash
   git checkout main
   git pull origin main
   git merge staging --no-ff
   git push origin main
   # Deploys to realest.ng with "Coming Soon" due to env vars
   ```

### Release Workflow

When ready to launch the full website:

1. **Update Environment Variables** in Vercel for `main` branch:
   ```bash
   NEXT_PUBLIC_APP_MODE=full-site
   # Remove NEXT_PUBLIC_RELEASE_DATE or set to past date
   ```

2. **Trigger Deployment**
   - Vercel will automatically redeploy `main` with new environment variables
   - Site will now show full functionality

## File Structure

### Key Files

```
├── app/
│   ├── (public)/page.tsx          # Main entry point with conditional rendering
│   ├── (demo)/                    # Demo pages (restricted in coming-soon mode)
│   │   └── layout.tsx            # Demo layout with route guard
│   └── layout.tsx                # Root layout
├── components/
│   ├── coming-soon-hero.tsx      # Coming soon component with countdown
│   ├── hero-section.tsx          # Original hero for full site
│   └── ...
├── lib/
│   ├── app-mode.ts               # App mode utilities and configuration
│   └── supabase/
│       └── middleware.ts         # Enhanced middleware with route guards
├── middleware.ts                 # Main middleware
└── next.config.mjs              # Enhanced with environment support
```

### Component Architecture

#### `app/(public)/page.tsx`
Central routing logic that decides between Coming Soon and Full Site based on environment variables.

#### `components/coming-soon-hero.tsx`
Self-contained Coming Soon page with:
- Countdown timer that updates every second
- Automatic transition to full site when countdown expires
- Responsive design matching the existing design system
- Feature previews and branding

#### `lib/app-mode.ts`
Utility functions for:
- Detecting current app mode
- Checking route accessibility
- Managing release date logic
- Development mode overrides

## Security Considerations

### Route Protection

Routes are automatically protected based on app mode:

- **Coming Soon Mode**: Only allows public routes, blocks `/admin`, `/buyer`, `/owner`, `/demo`
- **Full Site Mode**: All routes accessible with proper authentication
- **Development Mode**: All routes accessible including demo pages

### Authentication

- **Coming Soon**: Authentication disabled to prevent user confusion
- **Full Site**: Full Supabase authentication enabled
- **Development**: Authentication enabled for testing

### Middleware Protection

The enhanced middleware (`lib/supabase/middleware.ts`) automatically:
- Redirects unauthorized access to restricted routes
- Respects app mode configuration
- Maintains existing Supabase session management

## Development Tools

### Local Development

Override app mode locally for testing:

```javascript
// In browser console (development only)
import { devUtils } from '@/lib/app-mode'

// Force coming soon mode
devUtils.forceAppMode('coming-soon')

// Force full site mode
devUtils.forceAppMode('full-site')

// Clear override
devUtils.clearForcedMode()
```

### Environment Testing

Test different modes locally by setting environment variables:

```bash
# Test coming soon mode
NEXT_PUBLIC_APP_MODE=coming-soon npm run dev

# Test full site mode
NEXT_PUBLIC_APP_MODE=full-site npm run dev

# Test with countdown (set date in future)
NEXT_PUBLIC_APP_MODE=coming-soon NEXT_PUBLIC_RELEASE_DATE=2025-12-31T23:59:59Z npm run dev
```

## Deployment

### Vercel Integration

The system is designed for seamless Vercel deployment:

1. **Automatic Deployments**: Each branch push triggers appropriate deployment
2. **Environment Variables**: Set once in Vercel, automatically applied
3. **Preview URLs**: Each branch gets its own preview URL
4. **Zero Downtime**: Environment variable changes trigger redeployment

### Branch-Specific Deployments

| Branch | Vercel Environment | URL Pattern |
|--------|-------------------|-------------|
| `main` | Production | `realest.ng` |
| `staging` | Preview | `demo.realest.ng` |
| `develop` | Preview | `dev.realest.ng` |
| Feature branches | Preview | `realest-marketplace-git-{branch}-{team}.vercel.app` |

## Maintenance

### Regular Tasks

1. **Weekly Merges**: Merge `develop` → `staging` → `main` to keep code in sync
2. **Environment Review**: Verify environment variables are correctly set
3. **Countdown Updates**: Update release date if launch timeline changes

### Monitoring

Monitor the following:

- **Vercel Deployments**: Ensure all branches deploy successfully
- **Environment Variables**: Verify correct variables are set for each branch
- **Route Access**: Test that restricted routes are properly blocked
- **Countdown Accuracy**: Verify countdown timer displays correctly

### Troubleshooting

#### Common Issues

1. **Wrong App Mode**: Check environment variables in Vercel
2. **Routes Accessible When They Shouldn't Be**: Verify middleware configuration
3. **Countdown Not Working**: Check `NEXT_PUBLIC_RELEASE_DATE` format
4. **Demo Pages Not Showing**: Ensure `NEXT_PUBLIC_APP_MODE=development` for develop branch

#### Debug Tools

Use the app mode utilities to debug:

```typescript
import { getAppConfig, getVercelBranchConfig } from '@/lib/app-mode'

console.log('App Config:', getAppConfig())
console.log('Vercel Config:', getVercelBranchConfig())
```

## Best Practices

### Development

1. **Feature Branches**: Always create feature branches from `develop`
2. **Demo Pages**: Place experimental features in `(demo)` route group
3. **Environment Testing**: Test features in all app modes before merging
4. **Clean Commits**: Use conventional commit messages

### Deployment

1. **Environment Variables**: Set once, verify twice
2. **Staged Rollouts**: Always test in staging before main
3. **Backup Strategy**: Main branch serves as code backup
4. **Release Planning**: Update release date well in advance

### Code Organization

1. **Conditional Logic**: Use app mode utilities instead of manual checks
2. **Component Separation**: Keep Coming Soon and Full Site components separate
3. **Type Safety**: Leverage TypeScript for app mode configurations
4. **Documentation**: Update this file when adding new modes or features

---

This branch management system provides a robust, maintainable solution for deploying different versions of the application while maintaining a clean codebase and development workflow.