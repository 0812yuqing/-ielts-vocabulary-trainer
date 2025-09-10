#!/bin/bash

# IELTS Vocabulary Trainer - Test Script
# This script runs tests and checks for common issues

set -e

echo "🧪 Running tests..."

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run type checking
echo "🔍 Running TypeScript type checking..."
npm run type-check

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Build the application
echo "🔨 Building application..."
npm run build

# Check if critical files exist
echo "📁 Checking critical files..."
critical_files=(
    "dist/index.html"
    "dist/assets/"
    "dist/manifest.json"
    "dist/sw.js"
)

for file in "${critical_files[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ Critical file missing: $file"
        exit 1
    fi
done

echo "✅ All tests passed!"
echo "🎯 Application is ready for deployment"