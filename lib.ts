export function ggtHistory(one: bigint, two: bigint) {
    const history: [bigint, bigint, bigint, bigint][] = [];
    while (one % two != 0n) {
        const remainder = one % two;
        const factor = (one - remainder) / two;
        history.push([one, two, factor, remainder]);
        [one, two] = [two, one % two];
    }
    return history;
}
export function ggt(one: bigint, two: bigint) {
    while (one % two != 0n) {
        [one, two] = [two, one % two];
    }
    return two;
}
export function linearCombination(one: bigint, two: bigint): [bigint, bigint] {
    return ggtHistory(one, two)
        .reduceRight(([x, y], [_1, _2, factor]) => [y, x - factor * y], [0n, 1n]);
}
export function linearCombinationHistory(one: bigint, two: bigint): [bigint, bigint][] {
    return ggtHistory(one, two)
        .reduceRight(([[x, y], ...other], [_1, _2, factor]) => [[y, x - factor * y], [x, y], ...other], [[0n, 1n]])
        .reverse() as [bigint, bigint][];
}
export function inverse(number: bigint, group: bigint) {
    return (group + (linearCombination(group, number)[1] % group)) % group;
}
export function order(p: bigint, q: bigint) {
    return (p - 1n) * (q - 1n);
}
export function exp(base: bigint, exponent: bigint, group: bigint): bigint {
    if (exponent < 1n) throw new Error(`Invalid Exponent [${exponent}]`);
    else if (exponent == 1n) return base;
    else if (exponent % 2n == 0n) return exp(base ** 2n % group, exponent / 2n, group);
    else return (base * exp(base ** 2n % group, (exponent - 1n) / 2n, group)) % group;
}

export function primroot(p: bigint) {
    const fact: bigint[] = []
    const phi: bigint = p-1n
    let n = phi
    for(let i = 2n; i*i<=n; ++i) {
        if(n % i == 0n) {
            fact.push(i)
            while (n % i == 0n) n /= i
        }
    }
    if(n < 1) {
        fact.push(n)
    }
    for(let res = 2n; res <= p; ++res) {
        let ok = true
        for(let i = 0; i < fact.length && ok; ++i) {
            ok &&= exp(res, phi/fact[i], p) != 1n
        }
        if(ok) return res
    }
    throw new Error(`No primitive root for ${p} found`)
}

export interface Config {
    p: bigint
    q: bigint
    g: bigint
    hashMessage: (message: bigint) => bigint
    hashKey: (message: bigint) => bigint
}

export function verifySignature(NB: bigint, e_B: bigint, {rk, s}: {rk: bigint, s: bigint}, {hashKey, hashMessage, p, g}: Config) {
    console.log('--- Verify Signature', {NB, e_B, rk, s, p, g})
    const hash_NB = hashMessage(NB)
    const hash_rk = hashKey(rk)
    const links = exp(rk, s, p)
    const rechts = (exp(e_B, hash_rk, p) * exp(g, hash_NB, p)) % p

    console.log({ hash_NB, hash_rk, links, rechts })

    console.log('--- End Verify Signature', { verify: links == rechts })

    return links == rechts
}

export function generatePublicKey(d_A: bigint, {p, g}: {p: bigint, g: bigint}) {
    console.log('--- Generate public key', { d_A, p, g })
    const key = exp(g, d_A, p)
    console.log('--- End Generate public key', { key })
    return key
}

export function generateSignature(NA: bigint, {d_A, k}: {d_A: bigint, k: bigint}, {p, q, g, hashKey, hashMessage}: Config) {
    console.log('--- Generate Signature', { p, q, g, NA, d_A, k })

    const hashNA = hashMessage(NA)
    const rk = exp(g, k, p)
    const hrk = hashKey(rk)
    const k_inv = inverse(k, q)
    const s = (k_inv * (d_A*hrk + hashNA)) % q
    console.log({ hashNA, hrk, k_inv })

    console.log('--- End Generate Signature', { rk, s })

    return { rk, s }
}

export function generateNextK(k: bigint, q: bigint) {
    while (ggt(k, q) != 1n) k++
    console.log('Generated k', { k })
    return k
}

export function generateConfig(p: bigint, q: bigint) {
    console.log('--- Generate Config', { p, q })
    const h = primroot(p)
    const d = (p-1n)/q
    console.log({ h, d })
    const g = exp(h, d, p)

    const hashMessage = (m: bigint) => exp(g, m, p) % q
    const hashKey = (m: bigint): bigint => {
        const hash = m.toString().split('').map(v => BigInt(parseInt(v))).reduce((sum, current) => sum + current, 0n)
        if(hash.toString().length > 1) {
            return hashKey(hash)
        }
        return hash
    }

    console.log('--- End Generate Config', { p, q, g })

    return { p, q, g, hashKey, hashMessage }
}
