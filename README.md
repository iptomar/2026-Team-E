# 2026-Team-E

Form Builder Application built with Laravel 13, React, Inertia.js, and TypeScript.

## 🛠️ Development Environment Setup

### Prerequisites

Before setting up the project, ensure you have the following tools installed with the correct versions:

- **Node.js**: v22.13.1 or higher
- **npm**: v11.0.0 or higher
- **PHP**: 8.4.0
- **Composer**: 2.8.12 or higher

### Quick Setup (Recommended)

For the fastest setup, run the automated setup script:

**Windows:**
`ash
./setup.bat
`

**macOS/Linux:**
`ash
./setup.sh
`

### Manual Setup

If you prefer to set up manually:

1. **Clone the repository**
   `ash
   git clone https://github.com/iptomar/2026-Team-E.git
   cd 2026-Team-E
   `

2. **Set correct tool versions**
   `ash
   # Node.js (if using nvm)
   nvm use

   # Verify versions
   node --version  # Should be v22.13.1
   npm --version   # Should be 11.0.0
   php --version   # Should be 8.4.0
   composer --version
   `

3. **Install dependencies**
   `ash
   composer install
   npm install
   `

4. **Environment setup**
   `ash
   cp .env.example .env
   php artisan key:generate
   `

5. **Database setup**
   `ash
   php artisan migrate:fresh --seed
   `

## 🚀 Running the Application

Start both development servers:

`ash
composer run dev
`

This will start:
- Laravel server on http://localhost:8000
- Vite dev server on http://localhost:5173

## 📱 Accessing the Application

- **Home Page**: http://localhost:8000
- **Form Builder**: http://localhost:8000/builder (requires login)

### Test Login Credentials

- Email: 	est@example.com
- Password: password

## 🔧 Development Guidelines

### Tool Version Management

To avoid conflicts when pulling updates:

1. **Always use the specified versions** listed in Prerequisites
2. **Run setup scripts** after pulling major updates
3. **Don't commit lock files** generated with different tool versions

### Version Files

The project includes version specification files:
- .nvmrc - Node.js version
- .php-version - PHP version
- package.json - Node.js/npm engines specification
- composer.json - PHP platform specification

### Troubleshooting

If you encounter issues after pulling updates:

1. **Clear caches**:
   `ash
   composer dump-autoload
   php artisan config:clear
   php artisan cache:clear
   npm run dev -- --force
   `

2. **Reinstall dependencies**:
   `ash
   rm -rf vendor node_modules
   composer install
   npm install
   `

3. **Reset database** (if needed):
   `ash
   php artisan migrate:fresh --seed
   `

## 📋 Available Scripts

- composer run dev - Start all development servers
- 
pm run dev - Start Vite dev server only
- php artisan serve - Start Laravel server only
- 
pm run build - Build for production
- 
pm run lint - Run ESLint
- 
pm run format - Format code with Prettier

## 🧪 Testing

`ash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage
`

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Inertia.js Documentation](https://inertiajs.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
