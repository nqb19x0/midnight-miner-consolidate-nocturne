@echo off
REM Midnight Miner - Windows Setup and Run Script
REM This script will install Node.js if needed and run the consolidation tool

echo ========================================
echo MIDNIGHT MINER - CONSOLIDATION TOOL
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version recommended
    echo.
    echo After installation, run this script again.
    echo.
    pause
    exit /b 1
)

echo Node.js found: 
call node --version
echo npm found: 
call npm --version
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo.
    echo Please make sure all files are in the same folder.
    echo.
    pause
    exit /b 1
)

REM Always check and install/update packages
echo Checking and installing required packages...
echo This may take a few minutes on first run...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install packages!
    echo.
    echo Try running this manually:
    echo   npm install
    echo.
    pause
    exit /b 1
)
echo.
echo Packages installed successfully!
echo.

REM Check if settings.json exists
if not exist "settings.json" (
    echo ========================================
    echo ERROR: settings.json not found!
    echo ========================================
    echo.
    echo You need to create a settings.json file with your mnemonic.
    echo.
    echo Steps:
    echo 1. Copy settings.example.json to settings.json
    echo 2. Edit settings.json with Notepad
    echo 3. Add your mnemonic phrase
    echo.
    echo Example settings.json:
    echo {
    echo   "mnemonic": "your twelve or twenty four word phrase here",
    echo   "gen_end_index": 400
    echo }
    echo.
    pause
    exit /b 1
)

REM Check if destination address is provided
if "%~1"=="" (
    echo ========================================
    echo DESTINATION ADDRESS REQUIRED
    echo ========================================
    echo.
    echo Please provide your destination address:
    echo.
    set /p DEST_ADDR="Paste your address here: "
    echo.
) else (
    set DEST_ADDR=%~1
)

REM Validate destination address starts with addr1
echo %DEST_ADDR% | findstr /b "addr1" >nul
if errorlevel 1 (
    echo WARNING: Address does not start with 'addr1'
    echo Make sure this is a valid Cardano mainnet address!
    echo.
    pause
)

REM Run the consolidation tool
echo.
echo ========================================
echo Starting Consolidation...
echo ========================================
echo.
echo Destination: %DEST_ADDR%
echo.
echo The tool will:
echo 1. Generate wallets from your mnemonic
echo 2. Check balances for all wallets
echo 3. Ask about developer donation
echo 4. Consolidate all NIGHT to destination
echo.
echo Please wait...
echo.

call node consolidate.js --destination %DEST_ADDR%

if errorlevel 1 (
    echo.
    echo ========================================
    echo Consolidation completed with errors
    echo ========================================
    echo.
    echo Check consolidate.log for details.
) else (
    echo.
    echo ========================================
    echo Consolidation completed successfully!
    echo ========================================
    echo.
    echo Check consolidate.log for full details.
)

echo.
pause
