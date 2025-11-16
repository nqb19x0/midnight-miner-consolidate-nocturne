#!/usr/bin/env node
/**
 * Consolidate Script - Enhanced with earnings check and static dashboard
 */

const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
const bip39 = require('bip39');
const axios = require('axios');
const fs = require('fs');
const cbor = require('cbor');
const readline = require('readline');

const API_BASE = 'https://scavenger.prod.gd.midnighttge.io';
const DEV_ADDRESS = 'addr1q9jzapsmek489epz7zyueeye3hpsn50jge8duj0790l3cwzt0equyu45zegnz2ckv599gv6ry54sj45v2anexmv9hfxqjav4dk';

// ANSI color codes
const COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    WHITE: '\x1b[37m',
};

function harden(num) {
    return 0x80000000 + num;
}

function clearScreen() {
    process.stdout.write('\x1b[2J\x1b[H');
}

function generateWallets(mnemonic, numAccounts) {
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error("Invalid mnemonic!");
    }
    
    const entropyHex = bip39.mnemonicToEntropy(mnemonic);
    const rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
        Buffer.from(entropyHex, 'hex'),
        Buffer.from('')
    );
    
    const wallets = [];
    
    for (let account = 0; account < numAccounts; account++) {
        const accountKey = rootKey
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(account));
        
        const paymentKey = accountKey.derive(0).derive(0);
        const paymentPubKey = paymentKey.to_public();
        const paymentKeyHash = paymentPubKey.to_raw_key().hash();
        
        const stakeKey = accountKey.derive(2).derive(0);
        const stakePubKey = stakeKey.to_public();
        const stakeKeyHash = stakePubKey.to_raw_key().hash();
        
        const baseAddr = CardanoWasm.BaseAddress.new(
            1,
            CardanoWasm.Credential.from_keyhash(paymentKeyHash),
            CardanoWasm.Credential.from_keyhash(stakeKeyHash)
        );
        const address = baseAddr.to_address().to_bech32();
        
        const extendedKey = Buffer.from(paymentKey.as_bytes()).toString('hex');
        const signingKey = extendedKey.substring(0, 128);
        const publicKeyRaw = Buffer.from(paymentPubKey.to_raw_key().as_bytes()).toString('hex');
        
        wallets.push({
            account,
            address,
            pubkey: publicKeyRaw,
            signing_key: signingKey,
            night_balance: 0,
            solutions: 0
        });
    }
    
    return wallets;
}

async function fetchWalletStatistics(address, session = axios) {
    const url = `${API_BASE}/statistics/${address}`;
    try {
        const response = await session.get(url, { timeout: 8000 });
        const payload = response.data;
        const localStats = payload.local || {};
        const nightRaw = localStats.night_allocation || 0;
        const nightTokens = parseFloat(nightRaw) / 1_000_000.0;
        const solutions = parseInt(localStats.crypto_receipts || 0);
        return { nightTokens, solutions };
    } catch (error) {
        return { nightTokens: 0, solutions: 0 };
    }
}

async function checkAllEarnings(wallets) {
    console.log(`\n${COLORS.CYAN}Checking earnings for ${wallets.length} wallets...${COLORS.RESET}\n`);
    
    const batchSize = 10;
    for (let i = 0; i < wallets.length; i += batchSize) {
        const batch = wallets.slice(i, Math.min(i + batchSize, wallets.length));
        const promises = batch.map(wallet => fetchWalletStatistics(wallet.address));
        const results = await Promise.all(promises);
        
        results.forEach((result, idx) => {
            const wallet = batch[idx];
            wallet.night_balance = result.nightTokens;
            wallet.solutions = result.solutions;
        });
        
        const progress = Math.min(i + batchSize, wallets.length);
        const percent = ((progress / wallets.length) * 100).toFixed(1);
        process.stdout.write(`\rProgress: ${progress}/${wallets.length} (${percent}%)  `);
    }
    
    console.log('\n');
    return wallets;
}

/**
 * Select wallets for developer donation (up to 1% of total balance)
 */
function selectDeveloperWallets(wallets) {
    const totalNight = wallets.reduce((sum, w) => sum + w.night_balance, 0);
    const targetAmount = totalNight * 0.01; // 1% of total
    
    // Sort by balance ascending (smallest first)
    const walletsWithBalance = wallets.filter(w => w.night_balance > 0);
    walletsWithBalance.sort((a, b) => a.night_balance - b.night_balance);
    
    if (walletsWithBalance.length === 0) {
        return { wallets: [], totalAmount: 0 };
    }
    
    // Try to find single wallet close to 1%
    const singleWallet = walletsWithBalance.find(w => w.night_balance >= targetAmount * 0.8);
    if (singleWallet && singleWallet.night_balance <= targetAmount * 1.2) {
        return { wallets: [singleWallet], totalAmount: singleWallet.night_balance };
    }
    
    // Otherwise, collect smallest wallets until we reach ~1%
    const selectedWallets = [];
    let accumulatedAmount = 0;
    
    for (const wallet of walletsWithBalance) {
        if (accumulatedAmount >= targetAmount) break;
        selectedWallets.push(wallet);
        accumulatedAmount += wallet.night_balance;
    }
    
    return { wallets: selectedWallets, totalAmount: accumulatedAmount };
}

/**
 * Split long address for display
 */
function formatAddress(address, lineWidth = 60) {
    if (address.length <= lineWidth) {
        return [address];
    }
    
    const lines = [];
    for (let i = 0; i < address.length; i += lineWidth) {
        lines.push(address.substring(i, i + lineWidth));
    }
    return lines;
}

function displayDashboard(wallets, destinationAddress, devSelection, donateToDev) {
    clearScreen();
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    
    const totalNight = wallets.reduce((sum, w) => sum + w.night_balance, 0);
    const totalSolutions = wallets.reduce((sum, w) => sum + w.solutions, 0);
    const walletsWithBalance = wallets.filter(w => w.night_balance > 0).length;
    
    const devNight = devSelection ? devSelection.totalAmount : 0;
    const toDestination = totalNight - (donateToDev ? devNight : 0);
    const devPercentage = totalNight > 0 ? (devNight / totalNight * 100) : 0;
    
    console.log(`${COLORS.BRIGHT}${COLORS.CYAN}╔═══════════════════════════════════════════════════════════════════════╗${COLORS.RESET}`);
    console.log(`${COLORS.BRIGHT}${COLORS.CYAN}║${COLORS.RESET}           ${COLORS.BRIGHT}MIDNIGHT MINER - WALLET CONSOLIDATION${COLORS.RESET}                    ${COLORS.BRIGHT}${COLORS.CYAN}║${COLORS.RESET}`);
    console.log(`${COLORS.BRIGHT}${COLORS.CYAN}╚═══════════════════════════════════════════════════════════════════════╝${COLORS.RESET}`);
    console.log();
    
    console.log(`${COLORS.DIM}Date:${COLORS.RESET} ${dateStr}`);
    console.log(`${COLORS.DIM}Time:${COLORS.RESET} ${timeStr}`);
    console.log();
    
    console.log(`${COLORS.BRIGHT}${COLORS.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}`);
    console.log(`${COLORS.BRIGHT}WALLET SUMMARY${COLORS.RESET}`);
    console.log(`${COLORS.BRIGHT}${COLORS.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}`);
    console.log();
    console.log(`  Total Wallets:              ${COLORS.BRIGHT}${wallets.length}${COLORS.RESET}`);
    console.log(`  Wallets with Balance:       ${COLORS.BRIGHT}${COLORS.GREEN}${walletsWithBalance}${COLORS.RESET}`);
    console.log(`  Total Solutions:            ${COLORS.BRIGHT}${totalSolutions}${COLORS.RESET}`);
    console.log(`  Total NIGHT Balance:        ${COLORS.BRIGHT}${COLORS.YELLOW}${totalNight.toFixed(6)} NIGHT${COLORS.RESET}`);
    console.log();
    
    console.log(`${COLORS.BRIGHT}${COLORS.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}`);
    console.log(`${COLORS.BRIGHT}CONSOLIDATION DETAILS${COLORS.RESET}`);
    console.log(`${COLORS.BRIGHT}${COLORS.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}`);
    console.log();
    console.log(`  ${COLORS.DIM}Destination Address:${COLORS.RESET}`);
    const destLines = formatAddress(destinationAddress);
    destLines.forEach(line => console.log(`  ${COLORS.BRIGHT}${line}${COLORS.RESET}`));
    console.log();
    console.log(`  ${COLORS.DIM}Amount to Consolidate:${COLORS.RESET}      ${COLORS.BRIGHT}${COLORS.GREEN}${toDestination.toFixed(6)} NIGHT${COLORS.RESET}`);
    console.log();
    
    if (devSelection && devSelection.wallets.length > 0 && donateToDev) {
        console.log(`${COLORS.BRIGHT}${COLORS.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}`);
        console.log(`${COLORS.BRIGHT}DEVELOPER DONATION${COLORS.RESET}`);
        console.log(`${COLORS.BRIGHT}${COLORS.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}`);
        console.log();
        if (devSelection.wallets.length === 1) {
            console.log(`  ${COLORS.DIM}From wallet:${COLORS.RESET} ${devSelection.wallets[0].address.substring(0, 20)}...`);
        } else {
            console.log(`  ${COLORS.DIM}From wallets:${COLORS.RESET} ${devSelection.wallets.length} smallest wallets`);
        }
        console.log(`  ${COLORS.DIM}Amount:${COLORS.RESET}      ${COLORS.BRIGHT}${COLORS.YELLOW}${devNight.toFixed(6)} NIGHT${COLORS.RESET} ${COLORS.DIM}(${devPercentage.toFixed(2)}% of total)${COLORS.RESET}`);
        console.log();
        console.log(`  ${COLORS.GREEN}Thank you for supporting development! 🙏${COLORS.RESET}`);
        console.log();
    }
    
    console.log(`${COLORS.BRIGHT}${COLORS.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}`);
}

async function promptUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function createDonationSignature(wallet, destinationAddress) {
    try {
        const message = `Assign accumulated Scavenger rights to: ${destinationAddress}`;
        const signingKeyBytes = Buffer.from(wallet.signing_key, 'hex');
        const privateKey = CardanoWasm.PrivateKey.from_extended_bytes(signingKeyBytes);
        const address = CardanoWasm.Address.from_bech32(wallet.address);
        const addressBytes = address.to_bytes();
        
        const protectedHeaders = new Map();
        protectedHeaders.set(1, -8);
        protectedHeaders.set("address", addressBytes);
        const protectedEncoded = cbor.encode(protectedHeaders);
        
        const unprotectedHeaders = new Map();
        unprotectedHeaders.set("hashed", false);
        
        const payload = Buffer.from(message, 'utf-8');
        const sigStructure = ["Signature1", protectedEncoded, Buffer.alloc(0), payload];
        const toSign = cbor.encode(sigStructure);
        
        const signature = privateKey.sign(toSign);
        const signatureBytes = signature.to_bytes();
        
        const coseSign1 = [protectedEncoded, unprotectedHeaders, payload, signatureBytes];
        const coseEncoded = cbor.encode(coseSign1);
        
        return coseEncoded.toString('hex');
    } catch (e) {
        return null;
    }
}

async function consolidateWallet(destinationAddress, wallet) {
    const signature = createDonationSignature(wallet, destinationAddress);
    if (!signature) return { success: false, error: 'Signature creation failed' };
    
    const url = `${API_BASE}/donate_to/${destinationAddress}/${wallet.address}/${signature}`;
    
    try {
        await axios.post(url, {}, { timeout: 15000 });
        return { success: true };
    } catch (error) {
        if (error.response?.status === 409) {
            return { success: true, alreadyConsolidated: true };
        }
        return { success: false, error: error.response?.data?.message || error.message };
    }
}

async function processConsolidations(wallets, destinationAddress, excludeWallets = []) {
    const excludeAddresses = new Set(excludeWallets.map(w => w.address));
    const toProcess = wallets.filter(w => !excludeAddresses.has(w.address));
    
    console.log(`\n${COLORS.CYAN}Consolidating ${toProcess.length} wallets...${COLORS.RESET}\n`);
    
    let successCount = 0;
    let failCount = 0;
    const failures = [];
    
    for (let i = 0; i < toProcess.length; i++) {
        const wallet = toProcess[i];
        const result = await consolidateWallet(destinationAddress, wallet);
        
        if (result.success) {
            successCount++;
        } else {
            failCount++;
            failures.push({ wallet, error: result.error });
        }
        
        const progress = i + 1;
        const percent = ((progress / toProcess.length) * 100).toFixed(1);
        process.stdout.write(`\rProgress: ${progress}/${toProcess.length} (${percent}%) | ✓ ${successCount} | ✗ ${failCount}  `);
    }
    
    console.log('\n');
    return { successCount, failCount, failures };
}

function saveLog(wallets, destinationAddress, devSelection, donateToDev, results, devResults) {
    const now = new Date();
    const totalNight = wallets.reduce((sum, w) => sum + w.night_balance, 0);
    const devNight = devSelection ? devSelection.totalAmount : 0;
    const toDestination = totalNight - (donateToDev ? devNight : 0);
    const devAddresses = devSelection ? new Set(devSelection.wallets.map(w => w.address)) : new Set();
    
    const log = [];
    log.push('═'.repeat(80));
    log.push('MIDNIGHT MINER - CONSOLIDATION LOG');
    log.push('═'.repeat(80));
    log.push('');
    log.push(`Date: ${now.toLocaleString()}`);
    log.push('');
    log.push('─'.repeat(80));
    log.push('SUMMARY');
    log.push('─'.repeat(80));
    log.push(`Total Wallets: ${wallets.length}`);
    log.push(`Total NIGHT: ${totalNight.toFixed(6)}`);
    log.push('');
    log.push(`Destination Address: ${destinationAddress}`);
    log.push(`Amount Consolidated: ${toDestination.toFixed(6)} NIGHT`);
    log.push(`Successful Consolidations: ${results.successCount}`);
    log.push(`Failed Consolidations: ${results.failCount}`);
    log.push('');
    
    if (devSelection && devSelection.wallets.length > 0 && donateToDev) {
        log.push('─'.repeat(80));
        log.push('DEVELOPER DONATION');
        log.push('─'.repeat(80));
        log.push(`Developer Address: ${DEV_ADDRESS}`);
        log.push(`Number of Wallets Donated: ${devSelection.wallets.length}`);
        log.push(`Amount Donated: ${devNight.toFixed(6)} NIGHT (${(devNight/totalNight*100).toFixed(2)}% of total)`);
        log.push('');
        log.push('Donated Wallets:');
        devSelection.wallets.forEach((wallet, idx) => {
            log.push(`  [${idx + 1}] ${wallet.address}`);
            log.push(`      Balance: ${wallet.night_balance.toFixed(6)} NIGHT`);
        });
        log.push('');
        log.push(`Status: ${devResults?.success ? 'SUCCESS' : 'FAILED'}`);
        log.push('');
    }
    
    log.push('─'.repeat(80));
    log.push('ALL WALLET CONSOLIDATIONS');
    log.push('─'.repeat(80));
    log.push('');
    
    // Sort wallets by balance descending for easier review
    const sortedWallets = [...wallets].sort((a, b) => b.night_balance - a.night_balance);
    
    sortedWallets.forEach((wallet, index) => {
        const isDev = devAddresses.has(wallet.address) && donateToDev;
        const destination = isDev ? DEV_ADDRESS : destinationAddress;
        const action = isDev ? 'DONATED' : 'CONSOLIDATED';
        const status = isDev 
            ? (devResults?.success ? 'SUCCESS' : 'FAILED')
            : (results.failures.find(f => f.wallet.address === wallet.address) ? 'FAILED' : 'SUCCESS');
        
        log.push(`[${index + 1}/${wallets.length}] ${wallet.address}`);
        log.push(`  Balance: ${wallet.night_balance.toFixed(6)} NIGHT`);
        log.push(`  Solutions: ${wallet.solutions}`);
        log.push(`  ${action} to: ${destination}`);
        log.push(`  Status: ${status}`);
        log.push('');
    });
    
    if (results.failures.length > 0) {
        log.push('─'.repeat(80));
        log.push('FAILED CONSOLIDATIONS - DETAILS');
        log.push('─'.repeat(80));
        results.failures.forEach(f => {
            log.push(`Address: ${f.wallet.address}`);
            log.push(`Balance: ${f.wallet.night_balance.toFixed(6)} NIGHT`);
            log.push(`Error: ${f.error}`);
            log.push('');
        });
    }
    
    log.push('═'.repeat(80));
    
    fs.writeFileSync('consolidate.log', log.join('\n'));
}

async function main() {
    try {
        const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
        const mnemonic = settings.mnemonic;
        const numAccounts = settings.gen_end_index || 10;
        
        const args = process.argv.slice(2);
        let destinationAddress = null;
        
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--destination' && i + 1 < args.length) {
                destinationAddress = args[i + 1];
            } else if (args[i] === '--help' || args[i] === '-h') {
                console.log('Usage: node consolidate.js --destination <address>');
                console.log();
                console.log('The script will:');
                console.log('  1. Check earnings for all wallets');
                console.log('  2. Select smallest wallets totaling ~1% of NIGHT for developer donation');
                console.log('  3. Ask for confirmation to donate to developer');
                console.log('  4. Consolidate all other wallets to destination address');
                console.log('  5. Save detailed log to consolidate.log');
                return 0;
            }
        }
        
        if (!destinationAddress) {
            console.error('Error: --destination <address> is required');
            return 1;
        }
        
        console.log(`${COLORS.CYAN}Generating ${numAccounts} wallets...${COLORS.RESET}`);
        let wallets = generateWallets(mnemonic, numAccounts);
        
        wallets = await checkAllEarnings(wallets);
        
        // Select wallets for developer donation (up to 1% of total)
        const devSelection = selectDeveloperWallets(wallets);
        
        // Display dashboard with dev donation option
        displayDashboard(wallets, destinationAddress, devSelection, true);
        
        let donateToDev = false;
        if (devSelection.wallets.length > 0) {
            const totalNight = wallets.reduce((sum, w) => sum + w.night_balance, 0);
            const percentage = (devSelection.totalAmount / totalNight * 100).toFixed(2);
            
            if (devSelection.wallets.length === 1) {
                console.log(`${COLORS.YELLOW}Donate ${COLORS.BRIGHT}${devSelection.totalAmount.toFixed(6)} NIGHT${COLORS.RESET}${COLORS.YELLOW} (${percentage}% of total) to developer?${COLORS.RESET}`);
            } else {
                console.log(`${COLORS.YELLOW}Donate ${COLORS.BRIGHT}${devSelection.totalAmount.toFixed(6)} NIGHT${COLORS.RESET}${COLORS.YELLOW} from ${devSelection.wallets.length} smallest wallets (${percentage}% of total) to developer?${COLORS.RESET}`);
            }
            
            const answer = await promptUser(`Type ${COLORS.GREEN}YES${COLORS.RESET} to donate, ${COLORS.RED}NO${COLORS.RESET} to skip, or ${COLORS.YELLOW}CANCEL${COLORS.RESET} to abort: `);
            
            if (answer.toUpperCase() === 'CANCEL') {
                console.log(`\n${COLORS.YELLOW}Consolidation cancelled.${COLORS.RESET}`);
                return 0;
            }
            
            donateToDev = answer.toUpperCase() === 'YES';
        }
        
        // Update dashboard with final decision
        displayDashboard(wallets, destinationAddress, devSelection, donateToDev);
        
        // Consolidate to destination (excluding dev wallets if donating)
        const excludeWallets = donateToDev ? devSelection.wallets : [];
        const results = await processConsolidations(wallets, destinationAddress, excludeWallets);
        
        // Donate dev wallets if confirmed
        let devResults = null;
        if (donateToDev && devSelection.wallets.length > 0) {
            console.log(`${COLORS.CYAN}Processing developer donation (${devSelection.wallets.length} wallet${devSelection.wallets.length > 1 ? 's' : ''})...${COLORS.RESET}`);
            
            let devSuccess = true;
            for (const wallet of devSelection.wallets) {
                const result = await consolidateWallet(DEV_ADDRESS, wallet);
                if (!result.success) {
                    devSuccess = false;
                }
            }
            
            devResults = { success: devSuccess };
            console.log(devSuccess ? `${COLORS.GREEN}✓ Developer donation successful${COLORS.RESET}` : `${COLORS.RED}✗ Developer donation failed${COLORS.RESET}`);
        }
        
        // Save log
        saveLog(wallets, destinationAddress, devSelection, donateToDev, results, devResults);
        
        // Final summary
        console.log();
        console.log(`${COLORS.BRIGHT}${COLORS.GREEN}═══════════════════════════════════════════════════════════════════════${COLORS.RESET}`);
        console.log(`${COLORS.BRIGHT}${COLORS.GREEN}CONSOLIDATION COMPLETE${COLORS.RESET}`);
        console.log(`${COLORS.BRIGHT}${COLORS.GREEN}═══════════════════════════════════════════════════════════════════════${COLORS.RESET}`);
        console.log();
        console.log(`✓ Successfully consolidated: ${COLORS.BRIGHT}${results.successCount}${COLORS.RESET} wallets`);
        console.log(`✗ Failed: ${COLORS.BRIGHT}${results.failCount}${COLORS.RESET} wallets`);
        if (donateToDev && devSelection.wallets.length > 0) {
            console.log(`💝 Developer donation: ${COLORS.BRIGHT}${devSelection.wallets.length}${COLORS.RESET} wallet${devSelection.wallets.length > 1 ? 's' : ''} (${COLORS.BRIGHT}${devSelection.totalAmount.toFixed(6)} NIGHT${COLORS.RESET})`);
        }
        console.log();
        console.log(`📄 Detailed log saved to: ${COLORS.BRIGHT}consolidate.log${COLORS.RESET}`);
        console.log();
        
        return results.failCount > 0 ? 1 : 0;
        
    } catch (error) {
        console.error(`${COLORS.RED}Fatal error: ${error.message}${COLORS.RESET}`);
        return 1;
    }
}

main().then(code => process.exit(code));
