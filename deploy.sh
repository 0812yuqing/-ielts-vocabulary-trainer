#!/bin/bash

# IELTS Vocabulary Trainer - Deployment Script
# This script builds and prepares the application for deployment

set -e

echo "🚀 Starting deployment process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. Dist directory not found."
    exit 1
fi

# Create a simple .nojekyll file for GitHub Pages
touch dist/.nojekyll

echo "✅ Build successful!"
echo "📁 Built files are in the 'dist' directory"
echo ""
echo "🚀 Deployment ready! You can now:"
echo "   - Deploy to Netlify: netlify deploy --prod --dir=dist"
echo "   - Deploy to Vercel: vercel --prod"
echo "   - Deploy to GitHub Pages: Upload dist folder to gh-pages branch"
echo ""
echo "🎯 PWA features enabled:"
echo "   - Offline functionality"
echo "   - Add to home screen"
echo "   - Responsive design"
echo "   - Fast loading"