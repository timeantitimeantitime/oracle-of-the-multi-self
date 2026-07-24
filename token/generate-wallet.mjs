import { Keypair } from '@solana/web3.js';
import { writeFileSync } from 'fs';

const wallet = Keypair.generate();

writeFileSync('./wallet.json', JSON.stringify(Array.from(wallet.secretKey)));

console.log('✅ New wallet generated');
console.log(`\nPublic Key: ${wallet.publicKey.toBase58()}`);
console.log('\nFund this wallet with SOL, then run:');
console.log('  node deploy.mjs');
console.log('\n⚠️  Save wallet.json securely — it controls your tokens.');
