# 🌙 Midnight Miner - Wallet Consolidation Tool

A user-friendly tool to consolidate NIGHT tokens from multiple wallets into a single destination address, with optional developer donation support.

## ✨ Features

- 🔄 **Automatic wallet generation** from mnemonic phrase
- 💰 **Balance checking** for all wallets
- 🎯 **Smart consolidation** to single destination address
- 💝 **Optional developer donation** (automatically selects ~1% of total balance)
- 📊 **Beautiful dashboard** with real-time progress
- 📝 **Detailed logging** of all transactions
- 🖥️ **Cross-platform** support (Windows, Mac, Linux)

## 📋 Prerequisites

- **Node.js** (version 16 or higher)
- Your wallet **mnemonic phrase** (12 or 24 words)
- **Destination address** (must be registered at https://sm.midnight.gd)

## 🚀 Quick Start

### For Windows Users

1. **Download the tool**
   - Download all files to a folder (e.g., `C:\MidnightMiner\`)

2. **Install Node.js** (if not already installed)
   - Visit https://nodejs.org/
   - Download and install the **LTS version** (recommended)
   - Keep all default options during installation

3. **Create your settings file**
   - Copy `settings.example.json` to `settings.json`
   - Edit `settings.json` with Notepad:
   ```json
   {
     "mnemonic": "your twelve or twenty four word mnemonic phrase goes here",
     "gen_end_index": 400
   }
   ```
   - Replace the mnemonic with your actual phrase
   - Set `gen_end_index` to the number of wallets you want to consolidate

4. **Run the tool**
   - Double-click `run.bat`
   - OR open Command Prompt in the folder and run:
   ```batch
   run.bat addr1q_YOUR_DESTINATION_ADDRESS
   ```

### For Mac Users

1. **Download the tool**
   - Download all files to a folder (e.g., `~/MidnightMiner/`)

2. **Install Node.js** (if not already installed)
   
   **Option A: Using Homebrew (recommended)**
   ```bash
   # Install Homebrew if you don't have it
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Node.js
   brew install node
   ```
   
   **Option B: Direct download**
   - Visit https://nodejs.org/
   - Download and install the **LTS version**

3. **Create your settings file**
   - Open Terminal
   - Navigate to the tool folder:
   ```bash
   cd ~/MidnightMiner
   ```
   - Copy the example settings:
   ```bash
   cp settings.example.json settings.json
   ```
   - Edit with your preferred text editor:
   ```bash
   nano settings.json
   ```
   - Add your mnemonic and wallet count, then save (Ctrl+O, Enter, Ctrl+X)

4. **Run the tool**
   - Make the script executable:
   ```bash
   chmod +x run.sh
   ```
   - Run the tool:
   ```bash
   ./run.sh addr1q_YOUR_DESTINATION_ADDRESS
   ```

### For Linux Users

1. **Download the tool**
   - Download all files to a folder (e.g., `~/MidnightMiner/`)

2. **Install Node.js** (if not already installed)
   
   **Ubuntu/Debian:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
   
   **Fedora/RHEL/CentOS:**
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
   sudo yum install -y nodejs
   ```
   
   **Arch Linux:**
   ```bash
   sudo pacman -S nodejs npm
   ```

3. **Create your settings file**
   - Open Terminal
   - Navigate to the tool folder:
   ```bash
   cd ~/MidnightMiner
   ```
   - Copy the example settings:
   ```bash
   cp settings.example.json settings.json
   ```
   - Edit with your preferred text editor:
   ```bash
   nano settings.json
   # or
   vim settings.json
   ```
   - Add your mnemonic and wallet count, then save

4. **Run the tool**
   - Make the script executable:
   ```bash
   chmod +x run.sh
   ```
   - Run the tool:
   ```bash
   ./run.sh addr1q_YOUR_DESTINATION_ADDRESS
   ```

## 📖 Usage

### Command Line Options

```bash
# With destination address
node consolidate.js --destination addr1q_YOUR_DESTINATION_ADDRESS

# Show help
node consolidate.js --help
```

### What Happens When You Run It?

1. **Wallet Generation**: Generates wallets from your mnemonic
2. **Balance Check**: Checks NIGHT balance for all wallets
3. **Dashboard Display**: Shows summary and consolidation details
4. **Developer Donation Prompt**: Option to donate ~1% to developer
5. **Consolidation**: Transfers all NIGHT to destination address
6. **Log Creation**: Saves detailed report to `consolidate.log`

### Interactive Prompts

When you run the tool, you'll see:

```
Donate 58.691320 NIGHT from 3 smallest wallets (1.00% of total) to developer?
Type YES to donate, NO to skip, or CANCEL to abort:
```

- Type **YES** to donate to developer (thank you! 🙏)
- Type **NO** to skip developer donation
- Type **CANCEL** to abort the entire process

## 📁 File Structure

```
MidnightMiner/
├── consolidate.js           # Main consolidation script
├── package.json            # Node.js dependencies
├── settings.json           # Your configuration (create this!)
├── settings.example.json   # Example configuration
├── run.bat                 # Windows launcher
├── run.sh                  # Linux/Mac launcher
├── README.md              # This file
└── consolidate.log        # Generated log file (after running)
```

## 🔒 Security Notes

- **NEVER share your mnemonic phrase** with anyone
- **Keep `settings.json` private** - it contains your mnemonic
- The tool runs **locally on your computer** - your keys never leave your machine
- All code is **open source** - you can review it before running

## ⚙️ Configuration

Edit `settings.json`:

```json
{
  "mnemonic": "your twelve or twenty four word phrase here",
  "gen_end_index": 400
}
```

- **mnemonic**: Your wallet recovery phrase (12 or 24 words)
- **gen_end_index**: Number of wallets to consolidate (default: 400)

## 📊 Understanding the Dashboard

```
═══════════════════════════════════════════════════════════════════════
           MIDNIGHT MINER - WALLET CONSOLIDATION
═══════════════════════════════════════════════════════════════════════

Date: Monday, November 17, 2025
Time: 14:30:45

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WALLET SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Total Wallets:              400
  Wallets with Balance:       350
  Total Solutions:            8400
  Total NIGHT Balance:        5841.148109 NIGHT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSOLIDATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Destination Address:
  addr1q9jzapsmek489epz7zyueeye3hpsn50jge8duj0790l3cwzt0e
  quyu45zegnz2ckv599gv6ry54sj45v2anexmv9hfxqjav4dk

  Amount to Consolidate:      5782.456789 NIGHT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEVELOPER DONATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  From wallets: 3 smallest wallets
  Amount:      58.691320 NIGHT (1.00% of total)

  Thank you for supporting development! 🙏
```

## 📝 Log File

After running, check `consolidate.log` for:
- Complete list of all wallets
- Source and destination addresses
- Amount consolidated from each wallet
- Success/failure status
- Developer donation details (if applicable)

## ❓ Troubleshooting

### "Node.js is not installed"
- Install Node.js from https://nodejs.org/
- Choose the **LTS version** (Long Term Support)
- Restart your terminal/command prompt after installation

### "settings.json not found"
- Create `settings.json` by copying `settings.example.json`
- Make sure it's in the same folder as the script

### "Invalid mnemonic"
- Check your mnemonic phrase is correct
- Ensure it's 12 or 24 words
- Use spaces between words, not commas
- No extra quotes needed in the JSON file

### "Destination address is not registered"
- Register your destination address at https://sm.midnight.gd
- Wait a few minutes after registration
- Make sure you're using the correct address format (starts with `addr1`)

### "Failed to install packages"
- Check your internet connection
- Try running `npm install` manually
- On Linux/Mac, you may need to use `sudo npm install`

## 🤝 Contributing

This is an open-source tool. You can:
- Review the code
- Report issues
- Suggest improvements
- Fork and modify for your needs

## ⚠️ Disclaimer

This tool is provided as-is. Always:
- Test with small amounts first
- Keep backups of your mnemonic
- Verify destination addresses
- Review the code before running

## 📞 Support

- Check the log file for error details
- Review this README for common issues
- Ensure all prerequisites are met

## 💝 Developer Donation

The tool offers an optional donation of ~1% of your total NIGHT balance to support development. This:
- Selects the smallest wallets automatically
- Is completely optional (you can choose NO)
- Helps support continued development
- Shows appreciation for the tool

---

**Made with ❤️ for the Midnight community**
