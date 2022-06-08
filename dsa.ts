import { verifySignature, generateSignature, generatePublicKey, generateConfig, generateNextK } from './lib.ts'
// Own
const p = 7918456937n
const q = 1857049n
const d_A = 567n
const NA = 428371345n
const start_k = 23432n;

// Example
// const p = 3675367865201n
// const q = 12234913n
// const d_A = 789n
// const NA = 2542011018535n
// const start_k = 12321n;

const config = generateConfig(p, q)

const e_A = generatePublicKey(d_A, config)

const k = generateNextK(start_k, q);
const signature_A = generateSignature(NA, { d_A, k }, config)

const valid = verifySignature(NA, e_A, signature_A, config)
console.log('Valid', valid)
