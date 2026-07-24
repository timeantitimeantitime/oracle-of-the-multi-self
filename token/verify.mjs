import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getMint } from '@solana/spl-token';
import { readFileSync } from 'fs';

async function main() {
  const RPC_URL = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';
  const connection = new Connection(RPC_URL, 'confirmed');

  let mintAddress = process.argv[2];

  if (!mintAddress) {
    try {
      const deployment = JSON.parse(readFileSync('./deployment.json', 'utf-8'));
      mintAddress = deployment.mint;
      console.log('Using mint from deployment.json');
    } catch {
      console.log('Usage: node verify.mjs <mint_address>');
      process.exit(1);
    }
  }

  const mintPub = new PublicKey(mintAddress);
  const mint = await getMint(connection, mintPub);

  console.log('🔮 ASCEND Token Verification');
  console.log('─'.repeat(40));
  console.log(`Mint: ${mint.address}`);
  console.log(`Supply: ${Number(mint.supply) / 10 ** 9} ASCEND`);
  console.log(`Decimals: ${mint.decimals}`);
  console.log(`Mint Authority: ${mint.mintAuthority ?? 'NONE (fixed supply)'}`);
  console.log(`Freeze Authority: ${mint.freezeAuthority ?? 'NONE (non-freezable)'}`);

  const isImmutable = !mint.mintAuthority && !mint.freezeAuthority;
  console.log(`\n${isImmutable ? '✅ Token is immutable — supply is permanently fixed' : '⚠  Token still has authorities — consider removing for trust'}`);
}

main().catch(console.error);
