import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { mintTo, getAssociatedTokenAddress, createAssociatedTokenAccount } from '@solana/spl-token';
import { readFileSync } from 'fs';

function loadWallet() {
  const secret = JSON.parse(readFileSync('./wallet.json', 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function loadDeployment() {
  return JSON.parse(readFileSync('./deployment.json', 'utf-8'));
}

async function main() {
  const recipient = process.argv[2];
  const amount = process.argv[3];

  if (!recipient || !amount) {
    console.log('Usage: node airdrop.mjs <wallet_address> <amount>');
    console.log('Example: node airdrop.mjs AbC123... 1000');
    console.log('\nAmount is in whole ASCEND tokens (e.g., 1000 = 1000 ASCEND)');
    process.exit(1);
  }

  const RPC_URL = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';
  const connection = new Connection(RPC_URL, 'confirmed');
  const wallet = loadWallet();
  const { mint } = loadDeployment();

  const mintPub = new PublicKey(mint);
  const recipientPub = new PublicKey(recipient);
  const amountBigInt = BigInt(Math.floor(parseFloat(amount))) * BigInt(10 ** 9);

  console.log('🔮 ASCEND Airdrop');
  console.log('─'.repeat(40));
  console.log(`From: ${wallet.publicKey.toBase58()}`);
  console.log(`To:   ${recipient}`);
  console.log(`Amount: ${amount} ASCEND`);

  // Get or create recipient token account
  const recipientATA = await getAssociatedTokenAddress(mintPub, recipientPub);
  try {
    await createAssociatedTokenAccount(connection, wallet, mintPub, recipientPub);
    console.log('   Created new token account for recipient');
  } catch {
    // Account already exists, that's fine
  }

  // Mint to recipient
  await mintTo(connection, wallet, mintPub, recipientATA, wallet, amountBigInt);
  console.log(`\n✅ Airdropped ${amount} ASCEND to ${recipient}`);
}

main().catch(console.error);
