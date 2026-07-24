# ASCEND Token Deployment Guide

## Prerequisites
- Phantom wallet with ~0.1 SOL
- Node.js installed

## Step 1: Export your Phantom wallet secret key

1. Open Phantom wallet
2. Click the gear icon (Settings)
3. Click "Export Secret Key"
4. Copy the array of numbers (e.g., [42,183,7,201,...])

## Step 2: Save the secret key

Create `token/wallet.json` with your secret key array:
```
[42,183,7,201,155,23,99,12,...]  <-- your 64 numbers
```

⚠️  NEVER share wallet.json or commit it to git.

## Step 3: Install dependencies

```bash
cd token
npm install
```

## Step 4: Deploy

```bash
node deploy.mjs
```

This will:
- Create the ASCEND mint
- Mint 1,000,000,000 tokens to your wallet
- Remove mint authority (fixed supply forever)
- Remove freeze authority (non-freezable)
- Save deployment info to deployment.json

## Step 5: Copy mint address

After deployment, you'll see:
```
Mint Address: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copy this address and add it to `.env` in the project root:
```
VITE_ASCEND_MINT=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 6: Rebuild the frontend

```bash
cd ..
npm run build
```

## Done!

Your wallet now holds 1B ASCEND tokens.
Hold 100+ ASCEND in your wallet to unlock the full oracle deck.
