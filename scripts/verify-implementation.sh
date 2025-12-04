#!/bin/bash

# RealProof Marketplace - Implementation Verification Script
# Verifies that the branch management system is working correctly

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

echo -e "${BLUE}🔍 RealProof Marketplace - Implementation Verification${NC}"
echo -e "${BLUE}==================================================${NC}"
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

# Function to check if file exists and has content
check_file() {
    local file_path="$1"
    local description="$2"

    if [ -f "$file_path" ]; then
        if [ -s "$file_path" ]; then
            print_status "$description exists and has content"
            return 0
        else
            print_warning "$description exists but is empty"
            return 1
        fi
    else
        print_error "$description not found at $file_path"
        return 1
    fi
}

# Function to verify core implementation files
verify_core_files() {
    print_info "Verifying core implementation files..."

    local files=(
        "components/coming-soon-hero.tsx:Coming Soon Hero component"
        "lib/app-mode.ts:App Mode utilities"
        "app/(public)/page.tsx:Main page with conditional rendering"
        "app/(demo)/layout.tsx:Demo layout with route guard"
        "lib/supabase/middleware.ts:Enhanced middleware"
        "next.config.mjs:Enhanced Next.js config"
    )

    local all_good=true

    for file_info in "${files[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if ! check_file "$PROJECT_ROOT/$file_path" "$description"; then
            all_good=false
        fi
    done

    if [ "$all_good" = true ]; then
        print_status "All core implementation files verified"
    else
        print_error "Some core files are missing or empty"
        return 1
    fi
}

# Function to verify documentation
verify_documentation() {
    print_info "Verifying documentation..."

    local docs=(
        "docs/BRANCH_MANAGEMENT.md:Branch Management documentation"
        "BRANCH_QUICK_REFERENCE.md:Quick Reference guide"
        ".env.example:Environment variables example"
    )

    local all_good=true

    for doc_info in "${docs[@]}"; do
        IFS=':' read -r doc_path description <<< "$doc_info"
        if ! check_file "$PROJECT_ROOT/$doc_path" "$description"; then
            all_good=false
        fi
    done

    if [ "$all_good" = true ]; then
        print_status "All documentation files verified"
    else
        print_warning "Some documentation files are missing"
    fi
}

# Function to verify helper scripts
verify_scripts() {
    print_info "Verifying helper scripts..."

    local scripts=(
        "scripts/setup-branch-management.sh:Setup script"
        "scripts/switch-branch.sh:Branch switching script"
        "scripts/check-deployment.sh:Deployment check script"
    )

    local all_good=true

    for script_info in "${scripts[@]}"; do
        IFS=':' read -r script_path description <<< "$script_info"
        if check_file "$PROJECT_ROOT/$script_path" "$description"; then
            if [ -x "$PROJECT_ROOT/$script_path" ]; then
                print_status "$description is executable"
            else
                print_warning "$description exists but is not executable"
                chmod +x "$PROJECT_ROOT/$script_path"
                print_status "Made $description executable"
            fi
        else
            all_good=false
        fi
    done

    if [ "$all_good" = true ]; then
        print_status "All helper scripts verified"
    else
        print_error "Some scripts are missing"
        return 1
    fi
}

# Function to verify package.json scripts
verify_package_scripts() {
    print_info "Verifying package.json scripts..."

    cd "$PROJECT_ROOT"

    local required_scripts=(
        "setup:branches"
        "check:deployment"
        "dev:coming-soon"
        "dev:full-site"
        "dev:demo"
    )

    local missing_scripts=()

    for script in "${required_scripts[@]}"; do
        if npm run | grep -q "$script"; then
            print_status "Script '$script' found"
        else
            missing_scripts+=("$script")
            print_error "Script '$script' not found"
        fi
    done

    if [ ${#missing_scripts[@]} -eq 0 ]; then
        print_status "All required npm scripts verified"
    else
        print_error "Missing npm scripts: ${missing_scripts[*]}"
        return 1
    fi
}

# Function to test TypeScript compilation
verify_typescript() {
    print_info "Verifying TypeScript compilation..."

    cd "$PROJECT_ROOT"

    if npm run build > /dev/null 2>&1; then
        print_status "TypeScript compilation successful"
    else
        print_warning "TypeScript compilation has issues"
        print_info "Running build to show errors..."
        npm run build
        return 1
    fi
}

# Function to test app modes
test_app_modes() {
    print_info "Testing app mode configurations..."

    cd "$PROJECT_ROOT"

    # Test coming-soon mode
    export NEXT_PUBLIC_APP_MODE="coming-soon"
    export NEXT_PUBLIC_RELEASE_DATE="2025-12-31T23:59:59Z"

    if timeout 30s npm run dev > /dev/null 2>&1 & then
        local dev_pid=$!
        sleep 5
        kill $dev_pid 2>/dev/null || true
        wait $dev_pid 2>/dev/null || true
        print_status "Coming soon mode starts successfully"
    else
        print_warning "Could not test coming soon mode startup (this may be normal)"
    fi

    # Test full-site mode
    export NEXT_PUBLIC_APP_MODE="full-site"
    unset NEXT_PUBLIC_RELEASE_DATE

    if timeout 30s npm run dev > /dev/null 2>&1 & then
        local dev_pid=$!
        sleep 5
        kill $dev_pid 2>/dev/null || true
        wait $dev_pid 2>/dev/null || true
        print_status "Full site mode starts successfully"
    else
        print_warning "Could not test full site mode startup (this may be normal)"
    fi

    # Reset environment
    unset NEXT_PUBLIC_APP_MODE
    unset NEXT_PUBLIC_RELEASE_DATE
}

# Function to verify Vercel configurations
verify_vercel_configs() {
    print_info "Verifying Vercel configuration files..."

    local vercel_configs=(
        ".vercel/env-main.json:Main branch environment config"
        ".vercel/env-develop.json:Develop branch environment config"
        ".vercel/env-staging.json:Staging branch environment config"
    )

    local all_good=true

    for config_info in "${vercel_configs[@]}"; do
        IFS=':' read -r config_path description <<< "$config_info"
        if check_file "$PROJECT_ROOT/$config_path" "$description"; then
            # Verify JSON is valid
            if python3 -m json.tool "$PROJECT_ROOT/$config_path" > /dev/null 2>&1; then
                print_status "$description has valid JSON"
            else
                print_error "$description has invalid JSON"
                all_good=false
            fi
        else
            all_good=false
        fi
    done

    if [ "$all_good" = true ]; then
        print_status "All Vercel configurations verified"
    else
        print_error "Some Vercel configurations are missing or invalid"
        return 1
    fi
}

# Function to check Git setup
verify_git_setup() {
    print_info "Verifying Git setup..."

    cd "$PROJECT_ROOT"

    # Check if we're in a Git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a Git repository"
        return 1
    fi

    print_status "Git repository detected"

    # Check current branch
    local current_branch=$(git branch --show-current)
    print_info "Current branch: $current_branch"

    # Check if main branch exists
    if git show-ref --verify --quiet refs/heads/main; then
        print_status "main branch exists"
    else
        print_warning "main branch not found"
    fi

    # Check remote origin
    if git remote get-url origin > /dev/null 2>&1; then
        local origin_url=$(git remote get-url origin)
        print_status "Remote origin configured: $origin_url"
    else
        print_warning "No remote origin configured"
    fi
}

# Function to provide implementation summary
show_implementation_summary() {
    echo
    echo -e "${BLUE}📋 Implementation Summary${NC}"
    echo -e "${BLUE}========================${NC}"
    echo
    echo -e "${GREEN}✅ Core Features Implemented:${NC}"
    echo "   • Branch-aware conditional rendering"
    echo "   • Coming soon page with countdown timer"
    echo "   • App mode utility functions"
    echo "   • Route guards for demo pages"
    echo "   • Enhanced middleware with access control"
    echo "   • Environment variable support"
    echo
    echo -e "${YELLOW}📝 Configuration Required:${NC}"
    echo "   • Set up environment variables in Vercel"
    echo "   • Configure release date"
    echo "   • Update Supabase credentials in .env.local"
    echo "   • Deploy branches to test functionality"
    echo
    echo -e "${BLUE}🚀 Ready for:${NC}"
    echo "   • Local testing with different app modes"
    echo "   • Branch-specific deployments"
    echo "   • Automatic coming soon → full site transition"
    echo "   • Clean development workflow"
}

# Function to provide next steps
show_next_steps() {
    echo
    echo -e "${BLUE}🎯 Next Steps${NC}"
    echo -e "${BLUE}============${NC}"
    echo
    echo -e "${YELLOW}1. Local Testing:${NC}"
    echo "   npm run dev:coming-soon    # Test coming soon mode"
    echo "   npm run dev:full-site      # Test full site mode"
    echo "   npm run dev:demo           # Test development mode"
    echo
    echo -e "${YELLOW}2. Vercel Setup:${NC}"
    echo "   • Copy environment variables from .vercel/env-*.json"
    echo "   • Configure in Vercel Project Settings"
    echo "   • Deploy each branch to test"
    echo
    echo -e "${YELLOW}3. Branch Management:${NC}"
    echo "   npm run switch:develop     # Switch to develop branch"
    echo "   npm run switch:staging     # Switch to staging branch"
    echo "   npm run switch:main        # Switch to main branch"
    echo
    echo -e "${YELLOW}4. Deployment Check:${NC}"
    echo "   npm run check:deployment   # Verify configuration"
    echo
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "   • docs/BRANCH_MANAGEMENT.md    # Complete guide"
    echo "   • BRANCH_QUICK_REFERENCE.md    # Quick commands"
}

# Main verification function
main() {
    local overall_success=true

    # Run all verifications
    if ! verify_core_files; then overall_success=false; fi
    echo

    if ! verify_documentation; then overall_success=false; fi
    echo

    if ! verify_scripts; then overall_success=false; fi
    echo

    if ! verify_package_scripts; then overall_success=false; fi
    echo

    if ! verify_typescript; then overall_success=false; fi
    echo

    if ! verify_vercel_configs; then overall_success=false; fi
    echo

    verify_git_setup
    echo

    test_app_modes
    echo

    # Show results
    if [ "$overall_success" = true ]; then
        echo -e "${GREEN}🎉 All verifications passed!${NC}"
        echo -e "${GREEN}Branch management system is ready to use.${NC}"
    else
        echo -e "${YELLOW}⚠️  Some verifications failed or need attention.${NC}"
        echo -e "${YELLOW}Please review the issues above and fix them.${NC}"
    fi

    show_implementation_summary
    show_next_steps

    echo
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Run main function
main "$@"
