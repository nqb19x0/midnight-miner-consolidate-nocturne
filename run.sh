#!/bin/bash
# Midnight Miner - Linux/Mac Setup and Run Script
# This script will install Node.js if needed and run the consolidation tool

echo "========================================"
echo "MIDNIGHT MINER - CONSOLIDATION TOOL"
echo "========================================"
echo ""

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     PLATFORM=Linux;;
    Darwin*)    PLATFORM=Mac;;
    *)          PLATFORM="UNKNOWN:${OS}"
esac

echo "Detected platform: $PLATFORM"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed!"
    echo ""
    
    if [ "$PLATFORM" = "Mac" ]; then
        echo "For Mac, install Node.js using Homebrew:"
        echo "  1. Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo "  2. Install Node.js: brew install node"
        echo ""
        echo "Or download from: https://nodejs.org/"
    elif [ "$PLATFORM" = "Linux" ]; then
        echo "For Linux, install Node.js:"
        echo ""
        echo "Ubuntu/Debian:"
        echo "  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
        echo "  sudo apt-get install -y nodejs"
        echo ""
        echo "Fedora/RHEL:"
        echo "  curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -"
        echo "  sudo yum install -y nodejs"
        echo ""
        echo "Or download from: https://nodejs.org/"
    fi
    
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

echo "Node.js found: $(node --version)"
echo "npm found: $(npm --version)"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    echo ""
    echo "Please make sure all files are in the same folder."
    echo ""
    exit 1
fi

# Always check and install/update packages
echo "Checking and installing required packages..."
echo "This may take a few minutes on first run..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to install packages!"
    echo ""
    echo "Try running this manually:"
    echo "  npm install"
    echo ""
    exit 1
fi

echo ""
echo "Packages installed successfully!"
echo ""

# Check if settings.json exists
if [ ! -f "settings.json" ]; then
    echo "========================================"
    echo "ERROR: settings.json not found!"
    echo "========================================"
    echo ""
    echo "You need to create a settings.json file with your mnemonic."
    echo ""
    echo "Steps:"
    echo "1. Copy settings.example.json to settings.json:"
    echo "   cp settings.example.json settings.json"
    echo ""
    echo "2. Edit settings.json with your favorite editor:"
    echo "   nano settings.json"
    echo ""
    echo "3. Add your mnemonic phrase"
    echo ""
    echo "Example settings.json:"
    echo "{"
    echo "  \"mnemonic\": \"your twelve or twenty four word phrase here\","
    echo "  \"gen_end_index\": 400"
    echo "}"
    echo ""
    exit 1
fi

# Get destination address
if [ -z "$1" ]; then
    echo "========================================"
    echo "DESTINATION ADDRESS REQUIRED"
    echo "========================================"
    echo ""
    echo "Please provide your destination address:"
    read -p "Paste your address here: " DEST_ADDR
    echo ""
else
    DEST_ADDR="$1"
fi

# Validate destination address starts with addr1
if [[ ! "$DEST_ADDR" =~ ^addr1 ]]; then
    echo "WARNING: Address does not start with 'addr1'"
    echo "Make sure this is a valid Cardano mainnet address!"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to cancel..."
fi

# Run the consolidation tool
echo ""
echo "========================================"
echo "Starting Consolidation..."
echo "========================================"
echo ""
echo "Destination: $DEST_ADDR"
echo ""
echo "The tool will:"
echo "1. Generate wallets from your mnemonic"
echo "2. Check balances for all wallets"
echo "3. Ask about developer donation"
echo "4. Consolidate all NIGHT to destination"
echo ""
echo "Please wait..."
echo ""

node consolidate.js --destination "$DEST_ADDR"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "========================================"
    echo "Consolidation completed successfully!"
    echo "========================================"
    echo ""
    echo "Check consolidate.log for full details."
else
    echo "========================================"
    echo "Consolidation completed with errors"
    echo "========================================"
    echo ""
    echo "Check consolidate.log for details."
fi
echo ""

exit $EXIT_CODE
