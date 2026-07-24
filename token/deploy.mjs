import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, mintTo, setAuthority, AuthorityType, getAssociatedTokenAddress, createAssociatedTokenAccount } from '@solana/spl-token';
import { readFileSync } from 'fs';

// Load or generate wallet
function loadWallet() {
  try {
    const secret = JSON.parse(readFileSync('./wallet.json', 'utf-8'));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } catch {
    const wallet = Keypair.generate();
    console.log('⚠  No wallet.json found. Generated temporary wallet.');
    console.log('   Fund this wallet with SOL before deploying:');
    console.log(`   ${wallet.publicKey.toBase58()}`);
    console.log('   Then save the secret key to wallet.json');
    process.exit(1);
  }
}

async function main() {
  const RPC_URL = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';
  const connection = new Connection(RPC_URL, 'confirmed');
  const wallet = loadWallet();

  console.log('🔮 ASCEND Token Deployment');
  console.log('─'.repeat(40));
  console.log(`Wallet: ${wallet.publicKey.toBase58()}`);

  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    console.log('❌ Insufficient SOL. Need at least 0.05 SOL to deploy.');
    process.exit(1);
  }

  // 1. Create the mint
  console.log('\n1. Creating ASCEND mint...');
  const mint = await createMint(
    connection,
    wallet,
    wallet.publicKey, // freeze authority
    wallet.publicKey, // update authority
    9 // decimals
  );
  console.log(`   Mint: ${mint.toBase58()}`);

  // 2. Create token account for deployer
  console.log('2. Creating token account...');
  const tokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);
  await createAssociatedTokenAccount(connection, wallet, mint, wallet.publicKey);
  console.log(`   Token Account: ${tokenAccount.toBase58()}`);

  // 3. Mint full supply to deployer
  const supply = 1_000_000_000n * BigInt(10 ** 9); // 1B tokens with 9 decimals
  console.log('3. Minting 1,000,000,000 ASCEND...');
  await mintTo(connection, wallet, mint, tokenAccount, wallet, supply);
  console.log('   ✓ Minted');

  // 4. Remove freeze authority (makes token non-freezable, more decentralized)
  console.log('4. Removing freeze authority...');
  await setAuthority(connection, wallet, mint, wallet.publicKey, AuthorityType.FreezeAccount, null);
  console.log('   ✓ Freeze authority removed');

  // 5. Remove mint authority (no more tokens can ever be minted)
  console.log('5. Removing mint authority (fixed supply)...');
  await setAuthority(connection, wallet, mint, wallet.publicKey, AuthorityType.MintTokens, null);
  console.log('   ✓ Mint authority removed — supply is now permanently fixed');

  // Save deployment info
  const deployment = {
    mint: mint.toBase58(),
    tokenAccount: tokenAccount.toBase58(),
    deployer: wallet.publicKey.toBase58(),
    supply: '1,000,000,000',
    decimals: 9,
    deployedAt: new Date().toISOString(),
  };

  const { writeFileSync } = await import('fs');
  writeFileSync('./deployment.json', JSON.stringify(deployment, null, 2));

  console.log('\n' + '─'.repeat(40));
  console.log('✅ ASCEND token deployed successfully!');
  console.log(`\nMint Address: ${mint.toBase58()}`);
  console.log('Save this address — you need it for:');
  console.log('  - Airdrops: node airdrop.mjs');
  console.log('  - Frontend integration');
  console.log('  - DEX listing (Raydium, Jupiter)');
  console.log('\nDeployment saved to deployment.json');
}

main().catch(console.error);
