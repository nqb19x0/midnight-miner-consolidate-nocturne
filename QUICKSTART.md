# 🚀 QUICK START GUIDE - For Complete Beginners

## Step 1: Download Everything

1. Download ALL files from the release to a folder on your computer
   - **Windows**: Create folder `C:\MidnightMiner\`
   - **Mac/Linux**: Create folder `~/MidnightMiner/`

2. You should have these files:
   - ✅ `consolidate.js`
   - ✅ `package.json`
   - ✅ `settings.example.json`
   - ✅ `run.bat` (Windows)
   - ✅ `run.sh` (Mac/Linux)
   - ✅ `README.md`
   - ✅ `QUICKSTART.md` (this file)

## Step 2: Install Node.js (One Time Only)

### Windows:
1. Go to https://nodejs.org/
2. Click the big green button that says "LTS" (e.g., "20.11.0 LTS")
3. Download and run the installer
4. Click "Next" through all options (keep defaults)
5. Click "Install"
6. Wait for installation to complete
7. Restart your computer (important!)

### Mac:
**Easy Way (Recommended):**
1. Open Terminal (press Cmd+Space, type "Terminal")
2. Install Homebrew (copy and paste this command):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Install Node.js:
   ```bash
   brew install node
   ```

**Alternative:**
1. Go to https://nodejs.org/
2. Click "LTS" version
3. Download the `.pkg` file
4. Double-click and install

### Linux (Ubuntu/Debian):
Open Terminal and run:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Step 3: Create Your Settings File

YOU HAVE THE " settings.json " from your Nocturne miner folder!!!

### Windows:
1. Right-click `settings.example.json`
2. Click "Open with" → "Notepad"
3. You'll see:
   ```json
   {
     "mnemonic": "your twelve or twenty four word mnemonic phrase goes here",
     "gen_end_index": 400
   }
   ```
4. Replace `your twelve or twenty four word mnemonic phrase goes here` with your actual mnemonic
   - Keep the quotes!
   - Use spaces between words
   - Example: `"word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"`
5. Change `400` if you want fewer/more wallets
6. Click "File" → "Save As"
7. Save as `settings.json` (change from .example.json to .json)
8. **Important**: Choose "All Files" for file type, not "Text Documents"

### Mac/Linux:
1. Open Terminal
2. Navigate to your folder:
   ```bash
   cd ~/MidnightMiner
   ```
3. Copy the example:
   ```bash
   cp settings.example.json settings.json
   ```
4. Edit the file:
   ```bash
   nano settings.json
   ```
5. Replace the mnemonic with yours
6. Press `Ctrl+O` to save
7. Press `Enter` to confirm
8. Press `Ctrl+X` to exit

## Step 4: Get Your Destination Address Ready

1. Go to https://sm.midnight.gd
2. Register your destination address (the address where you want all NIGHT to go)
3. Copy the address (it starts with `addr1q...`)
4. **IMPORTANT**: Keep this address ready - you'll need it in the next step!

## Step 5: Run the Tool

### Windows:
**Method 1 (Easiest):**
1. Double-click `run.bat`
2. When it asks for destination address, paste your address
3. Press Enter

**Method 2 (With Address):**
1. Right-click `run.bat`
2. Click "Edit"
3. At the bottom, find the line with `node consolidate.js --destination %1`
4. Change it to: `node consolidate.js --destination addr1q_YOUR_ADDRESS_HERE`
5. Save and close
6. Double-click `run.bat`

### Mac/Linux:
**First time only - make it executable:**
```bash
cd ~/MidnightMiner
chmod +x run.sh
```

**Then run:**
```bash
./run.sh addr1q_YOUR_DESTINATION_ADDRESS_HERE
```

Or without address (it will prompt you):
```bash
./run.sh
```

## Step 6: Follow the Prompts

1. The tool will check your wallets (this takes a few minutes)
2. You'll see a nice dashboard with:
   - Total wallets
   - Total NIGHT balance
   - Developer donation option (~1% of total)
3. When asked about developer donation:
   - Type `YES` to donate (thank you! 🙏)
   - Type `NO` to skip
   - Type `CANCEL` to abort everything
4. Wait for consolidation to complete
5. Check `consolidate.log` for details

## 🆘 Help! Something Went Wrong!

### "Node.js is not installed"
→ Go back to Step 2 and install Node.js

### "settings.json not found"
→ Go back to Step 3 - make sure you saved as `settings.json` not `settings.example.json`

### "Invalid mnemonic"
→ Check your mnemonic in settings.json:
- Should be 12 or 24 words
- Separated by spaces
- Keep the quotes around it
- No extra characters

### "Destination address is not registered"
→ Register at https://sm.midnight.gd first!

### Windows: "Cannot run scripts" error
→ Right-click `run.bat`, click "Run as Administrator"

### Mac: "Permission denied"
→ Run: `chmod +x run.sh` first

### Linux: "command not found"
→ Make sure you're in the right folder: `cd ~/MidnightMiner`

## ✅ Checklist

Before running, make sure you have:
- [ ] Downloaded all files
- [ ] Installed Node.js
- [ ] Created `settings.json` with your mnemonic
- [ ] Registered your destination address at https://sm.midnight.gd
- [ ] Destination address copied and ready

## 🎉 Success!

If everything worked:
- You'll see "✓ Consolidation completed successfully!"
- Check `consolidate.log` for full details
- Your NIGHT is now in your destination address (minus dev donation if you chose YES)

---

**Need more help?** Read the full `README.md` file!
