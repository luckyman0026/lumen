#!/bin/bash

# Lumen Quick Start Script
# Sets up the development environment and runs the example app

set -e  # Exit on error

echo "Lumen Quick Start"
echo "========================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed"
    echo "Install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js 18+ required, found: $(node -v)"
    exit 1
fi
echo "  Node.js: $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed"
    echo "Install with: npm install -g pnpm"
    exit 1
fi
echo "  pnpm: $(pnpm --version)"
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
pnpm install
echo "Done"
echo ""

# Step 2: Build packages
echo "Step 2: Building packages..."
pnpm build
echo "Done"
echo ""

# Step 3: Run tests
echo "Step 3: Running tests..."
pnpm test run
echo "All tests passed"
echo ""

# Step 4: Set up example app
echo "Step 4: Setting up example app..."
cd examples/nextjs-16-app

if [ ! -f .env.local ]; then
    cat > .env.local << 'EOF'
# Lumen Configuration
# See docs/environment.md for full configuration reference

# Backend ingest endpoint (use webhook.site for testing)
INTELLITRACK_INGEST_URL=https://webhook.site/YOUR-UNIQUE-ID

# Key identifier for HMAC signing
INTELLITRACK_KEY_ID=dev-key

# HMAC secret (generate with: openssl rand -base64 32)
INTELLITRACK_HMAC_SECRET=dev-secret-not-for-production

# Sample rate: 1.0 = 100% for development
INTELLITRACK_SAMPLE_RATE=1.0
EOF
    echo "Created .env.local (update INTELLITRACK_INGEST_URL before running)"
else
    echo ".env.local already exists, skipping"
fi

cd ../..
echo ""

# Complete
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. Get a test endpoint:"
echo "   Visit https://webhook.site and copy your unique URL"
echo ""
echo "2. Update the ingest URL:"
echo "   Edit examples/nextjs-16-app/.env.local"
echo "   Set INTELLITRACK_INGEST_URL to your webhook.site URL"
echo ""
echo "3. Start the example app:"
echo "   cd examples/nextjs-16-app && pnpm dev"
echo ""
echo "4. Open your browser:"
echo "   http://localhost:3001"
echo ""
echo "5. Watch webhook.site for incoming events!"
echo ""
echo "Documentation:"
echo "  - Architecture:   docs/architecture/overview.md"
echo "  - API Reference:  docs/api.md"
echo "  - Environment:    docs/environment.md"
echo "  - Testing:        docs/testing.md"
echo "  - Contributing:   CONTRIBUTING.md"
echo ""
