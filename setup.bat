@echo off
REM Team Development Environment Setup Script (Windows)
REM This script ensures all team members use consistent tool versions

echo ?? Setting up development environment...

REM Check Node.js version
echo ?? Checking Node.js version...
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
set REQUIRED_NODE=v22.13.1
if not "%NODE_VERSION%"=="%REQUIRED_NODE%" (
    echo ? Node.js version mismatch. Expected %REQUIRED_NODE%, got %NODE_VERSION%
    echo ?? Run: nvm use %REQUIRED_NODE%
    exit /b 1
)
echo ? Node.js %NODE_VERSION%

REM Check npm version
echo ?? Checking npm version...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
set REQUIRED_NPM=11.0.0
if not "%NPM_VERSION%"=="%REQUIRED_NPM%" (
    echo ? npm version mismatch. Expected %REQUIRED_NPM%, got %NPM_VERSION%
    echo ?? Run: npm install -g npm@%REQUIRED_NPM%
    exit /b 1
)
echo ? npm %NPM_VERSION%

REM Check PHP version
echo ?? Checking PHP version...
for /f "tokens=2" %%i in ('php --version ^| findstr "PHP"') do set PHP_VERSION=%%i
set REQUIRED_PHP=8.4.0
if not "%PHP_VERSION%"=="%REQUIRED_PHP%" (
    echo ? PHP version mismatch. Expected %REQUIRED_PHP%, got %PHP_VERSION%
    exit /b 1
)
echo ? PHP %PHP_VERSION%

REM Check Composer version
echo ?? Checking Composer version...
for /f "tokens=3" %%i in ('composer --version ^| findstr "Composer"') do set COMPOSER_VERSION=%%i
echo ? Composer %COMPOSER_VERSION%

REM Install dependencies
echo ?? Installing PHP dependencies...
composer install

echo ?? Installing Node.js dependencies...
npm install

REM Setup environment
echo ?? Setting up environment...
if not exist .env (
    copy .env.example .env
    echo ?? Created .env file from .env.example
    echo ??  Please update your .env file with proper database credentials
)

REM Generate app key if not set
findstr /c:"APP_KEY=base64:" .env >nul
if errorlevel 1 (
    php artisan key:generate
    echo ?? Generated application key
)

REM Run migrations
echo ???  Setting up database...
php artisan migrate:fresh --seed

echo.
echo ?? Setup complete!
echo.
echo ?? To start development servers:
echo    composer run dev
echo.
echo ?? Access your application:
echo    http://localhost:8000
echo.
echo ?? Test login:
echo    Email: test@example.com
echo    Password: password

pause
