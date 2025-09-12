@echo off
echo ========================================
echo Portfolio Website Setup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to https://nodejs.org
    echo 2. Download the LTS version
    echo 3. Run the installer
    echo 4. Restart this command prompt
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo Checking npm version:
npm --version
echo.

echo Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Dependencies installed successfully!
echo ========================================
echo.

echo Next steps:
echo 1. Create .env file with your Gmail credentials
echo 2. Run: npm start
echo 3. Visit: http://localhost:3000
echo.

echo Creating .env file from template...
if not exist .env (
    copy env-template.txt .env
    echo .env file created! Please edit it with your Gmail credentials.
) else (
    echo .env file already exists.
)

echo.
echo Setup complete! 
echo.
pause
