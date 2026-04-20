#!/bin/bash

# Team Development Environment Setup Script
# This script ensures all team members use consistent tool versions

set -e

echo "🚀 Setting up development environment..."

# Check Node.js version
echo "📦 Checking Node.js version..."
if command -v nvm &> /dev/null; then
    nvm use || nvm install
fi

NODE_VERSION=$(node --version)
REQUIRED_NODE="v22.13.1"
if [[ "$NODE_VERSION" != "$REQUIRED_NODE" ]]; then
    echo "❌ Node.js version mismatch. Expected $REQUIRED_NODE, got $NODE_VERSION"
    echo "💡 Run: nvm use $REQUIRED_NODE"
    exit 1
fi
echo "✅ Node.js $NODE_VERSION"

# Check npm version
echo "📦 Checking npm version..."
NPM_VERSION=$(npm --version)
REQUIRED_NPM="11.0.0"
if [[ "$NPM_VERSION" != "$REQUIRED_NPM" ]]; then
    echo "❌ npm version mismatch. Expected $REQUIRED_NPM, got $NPM_VERSION"
    echo "💡 Run: npm install -g npm@$REQUIRED_NPM"
    exit 1
fi
echo "✅ npm $NPM_VERSION"

# Check PHP version
echo "🐘 Checking PHP version..."
PHP_VERSION=$(php --version | head -n 1 | cut -d' ' -f2 | cut -d'-' -f1)
REQUIRED_PHP="8.4.0"
if [[ "$PHP_VERSION" != "$REQUIRED_PHP" ]]; then
    echo "❌ PHP version mismatch. Expected $REQUIRED_PHP, got $PHP_VERSION"
    exit 1
fi
echo "✅ PHP $PHP_VERSION"

# Check Composer version
echo "📦 Checking Composer version..."
COMPOSER_VERSION=$(composer --version | head -n 1 | cut -d' ' -f3)
echo "✅ Composer $COMPOSER_VERSION"

# Install dependencies
echo "📦 Installing PHP dependencies..."
composer install

echo "📦 Installing Node.js dependencies..."
npm install

# Setup environment
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file from .env.example"
    echo "⚠️  Please update your .env file with proper database credentials"
fi

# Generate app key if not set
if ! grep -q "APP_KEY=.*[^base64:]" .env; then
    php artisan key:generate
    echo "🔑 Generated application key"
fi

# Run migrations
echo "🗄️  Setting up database..."
php artisan migrate:fresh --seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start development servers:"
echo "   composer run dev"
echo ""
echo "📱 Access your application:"
echo "   http://localhost:8000"
echo ""
echo "🔐 Test login:"
echo "   Email: test@example.com"
echo "   Password: password"
