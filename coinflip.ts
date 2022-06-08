import { inverse, exp } from "./lib.ts";

function squareRootModulo(a: bigint, p: bigint) {
    console.log('-- SQRTMOD', a, p)
    if(p % 4n == 3n) {
        const x = exp(a, (p+1n)/4n, p)
        console.log('-- SQRTMOD RESULT (%4 = 3):', x)
        return [ x, p-x ]
    } else if (p % 4n == 1n && p % 8n == 5n) {
        const x_a = 2n*a*(exp(4n*a, p-5n/8n, p)) % p
        const x_b = exp(a, (p+3n)/8n, p)
        console.log('-- SQRTMOD RESULT (%4 = 1)')
        if(exp(x_a, 2n, p) == a) return [x_a, p-x_a]
        if(exp(x_b, 2n, p) == a) return [x_b, p-x_b]
    }
    throw new Error('Square Root not possible')
}

function possibleSolutions(p: bigint, q: bigint, b_2: bigint) {
    const m = p*q
    console.log('m', m)

    const b_2_mod_p = b_2 % p
    const b_2_mod_q = b_2 % q
    console.log('b_2_mod_p', b_2_mod_p)
    console.log('b_2_mod_q', b_2_mod_q)

    const y1 = squareRootModulo(b_2_mod_p, p)
    const y2 = squareRootModulo(b_2_mod_q, q)
    console.log('y1', y1)
    console.log('y2', y2)

    const x_p_1 = (inverse(q, p) * y1[0]) % p
    const x_p_2 = (inverse(q, p) * y1[1]) % p
    const x_q_1 = (inverse(p, q) * y2[0]) % q
    const x_q_2 = (inverse(p, q) * y2[1]) % q
    console.log('x_p_1', x_p_1)
    console.log('x_p_2', x_p_2)
    console.log('x_q_1', x_q_1)
    console.log('x_q_2', x_q_2)

    const x_1 = (x_p_1 * q + x_q_1 * p) % m
    const x_2 = (x_p_1 * q + x_q_2 * p) % m
    const x_3 = (x_p_2 * q + x_q_1 * p) % m
    const x_4 = (x_p_2 * q + x_q_2 * p) % m
    console.log('x_1', x_1)
    console.log('x_2', x_2)
    console.log('x_3', x_3)
    console.log('x_4', x_4)
    return [x_1, x_2, x_3, x_4]
}

const p = 1000000007n
const q = 1000000093n
const m = p*q
const b = 9283424n
const b_2 = (b ** 2n) % m
console.log('b_2', b_2)

console.log(possibleSolutions(p, q, b_2))
