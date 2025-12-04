#!/bin/bash

# RealProof Marketplace - Branch Management Setup Script
# This script helps configure the branch management system for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🚀 RealProof Marketplace - Branch Management Setup${NC}"
echo -e "${BLUE}=================================================${NC}"
echo

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a Git repository. Please run this script from the project root."
        exit 1
    fi
    print_status "Git repository detected"
}

# Function to check if required dependencies are installed
check_dependencies() {
    print_info "Checking dependencies..."

    # Check for Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    # Check for npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

    if [ "$MAJOR_VERSION" -lt 18 ]; then
        print_error "Node.js version $NODE_VERSION detected. Please upgrade to Node.js 18 or higher."
        exit 1
    fi

    print_status "Node.js $NODE_VERSION detected"
    print_status "All dependencies are satisfied"
}

# Function to create environment configuration files
create_env_templates() {
    print_info "Creating environment configuration templates..."

    # Create .env.example if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env.example" ]; then
        cat > "$PROJECT_ROOT/.env.example" << 'EOF'
# RealProof Marketplace Environment Configuration
# Copy this file to .env.local for local development

# App Mode Configuration
# Values: coming-soon | full-site | development | demo
NEXT_PUBLIC_APP_MODE=development

# Release Date (ISO 8601 format)
# When to automatically switch from coming-soon to full-site
NEXT_PUBLIC_RELEASE_DATE=2025-03-01T00:00:00Z

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Overrides (optional)
# Set these to override branch-specific behavior in development
# DEV_FORCE_APP_MODE=coming-soon
# DEV_FORCE_RELEASE_DATE=2025-12-31T23:59:59Z
EOF
        print_status "Created .env.example"
    else
        print_warning ".env.example already exists, skipping..."
    fi

    # Create .env.local for local development if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env.local"
        print_status "Created .env.local from template"
        print_warning "Please update .env.local with your actual environment values"
    else
        print_warning ".env.local already exists, please review and update if needed"
    fi
}

# Function to create Vercel environment variable templates
create_vercel_config() {
    print_info "Creating Vercel environment configuration..."

    mkdir -p "$PROJECT_ROOT/.vercel"

    cat > "$PROJECT_ROOT/.vercel/env-main.json" << 'EOF'
{
  "name": "Environment Variables for MAIN branch (Coming Soon Mode)",
  "description": "Set these in Vercel Project Settings > Environment Variables for the 'main' branch",
  "variables": {
    "NEXT_PUBLIC_APP_MODE": {
      "value": "coming-soon",
      "description": "Shows coming soon page with countdown"
    },
    "NEXT_PUBLIC_RELEASE_DATE": {
      "value": "2025-03-01T00:00:00Z",
      "description": "When to automatically switch to full site (ISO 8601 format)"
    }
  },
  "instructions": [
    "1. Go to Vercel Project Settings",
    "2. Navigate to Environment Variables",
    "3. Add each variable above",
    "4. Set 'Git Branch' to 'main' for each variable",
    "5. Deploy main branch to apply changes"
  ]
}
EOF

    cat > "$PROJECT_ROOT/.vercel/env-develop.json" << 'EOF'
{
  "name": "Environment Variables for DEVELOP branch (Development Mode)",
  "description": "Set these in Vercel Project Settings > Environment Variables for the 'develop' branch",
  "variables": {
    "NEXT_PUBLIC_APP_MODE": {
      "value": "development",
      "description": "Shows full site with demo pages enabled"
    }
  },
  "instructions": [
    "1. Go to Vercel Project Settings",
    "2. Navigate to Environment Variables",
    "3. Add the variable above",
    "4. Set 'Git Branch' to 'develop' for the variable",
    "5. Deploy develop branch to apply changes"
  ]
}
EOF

    cat > "$PROJECT_ROOT/.vercel/env-staging.json" << 'EOF'
{
  "name": "Environment Variables for STAGING branch (Full Site Mode)",
  "description": "Set these in Vercel Project Settings > Environment Variables for the 'staging' branch",
  "variables": {
    "NEXT_PUBLIC_APP_MODE": {
      "value": "full-site",
      "description": "Shows full site without demo pages (production-like)"
    }
  },
  "instructions": [
    "1. Go to Vercel Project Settings",
    "2. Navigate to Environment Variables",
    "3. Add the variable above",
    "4. Set 'Git Branch' to 'staging' for the variable",
    "5. Deploy staging branch to apply changes"
  ]
}
EOF

    print_status "Created Vercel environment configuration files in .vercel/"
}

# Function to setup Git branches
setup_branches() {
    print_info "Setting up Git branches..."

    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Current branch: $CURRENT_BRANCH"

    # Check if we have uncommitted changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        print_error "You have uncommitted changes. Please commit or stash them before running this script."
        exit 1
    fi

    # Create develop branch if it doesn't exist
    if ! git show-ref --verify --quiet refs/heads/develop; then
        print_info "Creating develop branch..."
        git checkout -b develop
        git push -u origin develop
        print_status "Created and pushed develop branch"
    else
        print_warning "develop branch already exists"
    fi

    # Create staging branch if it doesn't exist
    if ! git show-ref --verify --quiet refs/heads/staging; then
        print_info "Creating staging branch..."
        git checkout -b staging
        git push -u origin staging
        print_status "Created and pushed staging branch"
    else
        print_warning "staging branch already exists"
    fi

    # Return to original branch
    git checkout "$CURRENT_BRANCH"
    print_status "Returned to $CURRENT_BRANCH branch"
}

# Function to install dependencies if needed
install_dependencies() {
    print_info "Checking and installing dependencies..."

    cd "$PROJECT_ROOT"

    # Check if node_modules exists
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        print_info "Installing npm dependencies..."
        npm ci
        print_status "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
}

# Function to run type checking
check_types() {
    print_info "Running TypeScript type checking..."

    cd "$PROJECT_ROOT"

    if npm run build > /dev/null 2>&1; then
        print_status "TypeScript compilation successful"
    else
        print_warning "TypeScript compilation has warnings/errors (this is expected for initial setup)"
        print_info "You can run 'npm run build' manually to see detailed output"
    fi
}

# Function to create helpful scripts
create_helper_scripts() {
    print_info "Creating helper scripts..."

    # Create branch switching script
    cat > "$PROJECT_ROOT/scripts/switch-branch.sh" << 'EOF'
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
EOF
    chmod +x "$PROJECT_ROOT/scripts/switch-branch.sh"

    # Create deployment status script
    cat > "$PROJECT_ROOT/scripts/check-deployment.sh" << 'EOF'
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
EOF
    chmod +x "$PROJECT_ROOT/scripts/check-deployment.sh"

    print_status "Created helper scripts in scripts/ directory"
}

# Function to create documentation
create_quick_reference() {
    print_info "Creating quick reference documentation..."

    cat > "$PROJECT_ROOT/BRANCH_QUICK_REFERENCE.md" << 'EOF'
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

## Troubleshooting

- **Wrong page showing?** → Check environment variables in Vercel
- **Demo pages not accessible?** → Ensure `NEXT_PUBLIC_APP_MODE=development`
- **Countdown not working?** → Verify `NEXT_PUBLIC_RELEASE_DATE` format
- **Build errors?** → Run `npm run build` locally to debug

For detailed documentation, see `docs/BRANCH_MANAGEMENT.md`
EOF

    print_status "Created BRANCH_QUICK_REFERENCE.md"
}

# Main execution
main() {
    echo -e "${BLUE}Starting branch management setup...${NC}"
    echo

    # Run all setup steps
    check_git_repo
    check_dependencies
    create_env_templates
    create_vercel_config
    setup_branches
    install_dependencies
    check_types
    create_helper_scripts
    create_quick_reference

    echo
    echo -e "${GREEN}🎉 Branch management setup completed successfully!${NC}"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "${YELLOW}1.${NC} Configure environment variables in Vercel (see .vercel/env-*.json files)"
    echo -e "${YELLOW}2.${NC} Update .env.local with your Supabase credentials"
    echo -e "${YELLOW}3.${NC} Test locally with different app modes:"
    echo "   NEXT_PUBLIC_APP_MODE=coming-soon npm run dev"
    echo "   NEXT_PUBLIC_APP_MODE=full-site npm run dev"
    echo -e "${YELLOW}4.${NC} Deploy branches and verify functionality"
    echo -e "${YELLOW}5.${NC} Check BRANCH_QUICK_REFERENCE.md for common commands"
    echo
    echo -e "${GREEN}Happy developing! 🚀${NC}"
}

# Run main function
main "$@"
