import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const contractABI = JSON.parse(fs.readFileSync(new URL("../contract/contractABI.json", import.meta.url)));

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

// Store a certificate hash on-chain
export async function storeCertificateHash(hash) {
  console.log('[Blockchain] Storing certificate hash:', hash);
  try {
    const tx = await contract.storeCertificateHash(hash);
    console.log('[Blockchain] Transaction sent:', tx);
    await tx.wait();
    console.log('[Blockchain] Transaction confirmed. Hash:', tx.hash);
    return tx.hash;
  } catch (err) {
    console.error('[Blockchain] Error sending transaction:', err);
    throw err;
  }
}

// Verify a certificate hash on-chain
export async function verifyCertificateHash(hash) {
  return await contract.verifyCertificateHash(hash);
} 