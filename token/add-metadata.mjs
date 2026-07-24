import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { readFileSync } from 'fs';

const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

function findMetadataPda(mint) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    MPL_TOKEN_METADATA_PROGRAM_ID,
  );
}

async function main() {
  const RPC_URL = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';
  const connection = new Connection(RPC_URL, 'confirmed');
  const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync('./wallet.json', 'utf-8'))));
  const { mint } = JSON.parse(readFileSync('./deployment.json', 'utf-8'));
  const mintPub = new PublicKey(mint);

  const [metadataPda] = findMetadataPda(mintPub);

  console.log('🔮 Adding metadata to ASCEND token...');
  console.log('Metadata PDA:', metadataPda.toBase58());

  // CreateMetadataAccountV3 data
  const name = 'ASCEND';
  const symbol = 'ASCEND';
  const uri = 'https://raw.githubusercontent.com/nicegram/nicegram/master/README.md';

  const nameBuf = Buffer.from(name);
  const symbolBuf = Buffer.from(symbol);
  const uriBuf = Buffer.from(uri);

  const data = Buffer.concat([
    Buffer.from([33]), // CreateMetadataAccountV3 instruction discriminator
    // DataV2 struct
    new Uint8Array(new Uint32Array([nameBuf.length]).buffer), nameBuf,
    new Uint8Array(new Uint32Array([symbolBuf.length]).buffer), symbolBuf,
    new Uint8Array(new Uint32Array([uriBuf.length]).buffer), uriBuf,
    new Uint8Array(new Uint16Array([0]).buffer), // seller_fee_basis_points
    new Uint8Array(new Uint32Array([0]).buffer), // creators = None
    Buffer.from([0]), // collection = None
    Buffer.from([0]), // uses = None
    Buffer.from([true]), // is_mutable
    Buffer.from([0]), // collection_details = None
  ]);

  const keys = [
    { pubkey: metadataPda, isSigner: false, isWritable: true },
    { pubkey: mintPub, isSigner: false, isWritable: false },
    { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  const ix = new TransactionInstruction({
    keys,
    programId: MPL_TOKEN_METADATA_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const sig = await connection.sendTransaction(tx, [wallet]);
  await connection.confirmTransaction(sig, 'confirmed');

  console.log('✅ Metadata added!');
  console.log('Transaction:', sig);
  console.log('');
  console.log('Restart Phantom or remove and re-add the token to see the name.');
}

main().catch(console.error);
