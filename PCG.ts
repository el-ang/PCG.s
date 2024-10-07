/**
 * PCG.ts - PCG // P-RNG, TypeScript Edition
 * 
 * TypeScript Implementation of Permutation Congruential Generator (PCG), a
 * Pseudo-Random Number Generator (P-RNG). This implementation based on the
 * original implementation of the PCG Family Algorithms by [Melissa O'Neill](https://github.com/imneme)
 * and it's [Contibutors](https://pcg-random.org). Implemented in object oriented
 * way using bigint to support large numbers and workarounds for usage functionality.
 * 
 * @copyright © 2024 · [El Roy Situmorang](https://github.com/el-ang)
 * @license [MIT](LICENSE)
 */
export default class PCG {
    /**
     * State value for the PCG
     * @private
     */
    #t = 0n;

    /**
     * Increment value for the PCG State Cycle
     * @private
     */
    #i = 1n;

    /**
     * Multiplier for the PCG State Cycle
     * @private @constant
     */
    #m = BigInt(this.#s(2549297995355413924n, -64)) + 4865540595714422341n;

    /**
     * Toggle for developer/debug mode for monitoring/profiling purposes
     * @private
     */
    #d = !1;

    /**
     * State Evolution Tag of the PCG State Cycle
     * @private
     */
    #e = -2n;

    /**
     * Initialize the set up for the PCG
     * @param s - seed: Initial seed or state value
     * @param q - seq: Initial sequence number to work with
     */
    constructor(s: number | bigint = Date.now(), q: number | bigint = 0) { this.seq(s, q); }

    /**
     * Set up the seed or state and sequence for the PCG
     * @param s - seed: Seed or state value
     * @param q - seq: Sequence number to work with
     * @returns The current state value after the set up
     */
    seq(s: number | bigint, q: number | bigint) {
        let t = Date.now();
        this.#i |= this.#c(this.#s(q, -1), 3);
        this.#r;
        this.#t += this.#c(s, 3);
        this.#r;
        if (this.#d) console.debug('◉ Init:', {
            seed: s,
            state: { int: this.#t, hex: '0x' + this.#t.toString(16).padStart(32, '0'), bin: this.bin(this.#t) },
            dur: Date.now() - t + 'ms'
        });
        return this.#t;
    }

    /**
     * Convert number to decimal based binary sequence
     * @param n - Number to convert to
     * @returns Array of separated binary digits
     */
    bin(n: number | bigint) { return n.toString(2).split('').reverse().join('').match(/.{1,4}/g)?.reverse().map(c => c.padEnd(4, n < 0? '': '0').split('').reverse().join('')) ?? [] }

    /**
     * Toggle for developer/debug mode for monitoring/profiling purposes
     * @returns The current mode after switched on this call
     */
    get d() { return this.#d = !this.#d }

    /**
     * Convert any kind of number to some classified size of unsigned integer
     * @param i - int: Number to convert to
     * @param p - pow: Level to convert the number to
     * @returns The converted number
     */
    #c(i: number | bigint, p = 0) { return BigInt.asUintN(2 ** (4 + p), BigInt(i)) }

    /**
     * Shift the number by the specified direction
     * @param n - Any kind of number to convert to
     * @param dir - Direction to bit shift the number
     * @returns The shifted number
     */
    #s(n: number | bigint, dir: number | bigint) {
        if (!dir) return n;
        let b = n.toString(2), d = dir > 0, g = BigInt(d? dir: -dir), i = 0;
        for (; i < g; i++) b = d? (b.slice(0, -1) || '0'): b + '0';
        return BigInt('0b' + b);
    }

    /**
     * Change the state value to the next evolution
     * @returns The current state value after the change in 128-bit unsigned integer form
     */
    get #r() {
        let t = Date.now();
        this.#t = this.#c(this.#m * this.#t + this.#i, 3);
        this.#e += 1n;
        if (this.#d) console.debug('◬ Step:', {
            evo: this.#e = this.#c(this.#e, 3),
            state: { int: this.#t, hex: '0x' + this.#t.toString(16).padStart(32, '0'), bin: this.bin(this.#t) },
            dur: Date.now() - t + 'ms'
        });
        return this.#t;
    }

    /**
     * Change the state value to jump to any direction in the state evolution sequence
     * @param d - delta: Direction and difference amount to jump to
     */
    set over(d: number | bigint) {
        let v = BigInt(d), t = Date.now(), m = [this.#m, 1n], i = [this.#i, 0n];
        while ((d = this.#c(d, 3)) > 0) {
            if (d & 1n) {
                m[1] = this.#c(m[1] * m[0], 3);
                i[1] = this.#c(i[1] * m[0] + i[0], 3);
            }
            i[0] = this.#c((m[0] + 1n) * i[0], 3);
            m[0] = this.#c(m[0] ** 2n, 3);
            d /= 2n;
        }
        this.#t = this.#c(m[1] * this.#t + i[1], 3);
        this.#e += v;
        if (this.#d) console.debug('◈ Jump:', {
            dir: v,
            evo: this.#e = this.#c(this.#e, 3),
            state: { int: this.#t, hex: '0x' + this.#t.toString(16).padStart(32, '0'), bin: this.bin(this.#t) },
            dur: Date.now() - t + 'ms'
        });
    }

    /**
     * Calculate current state value to generate a new random number
     * @returns The generated random number in 64-bit unsigned integer form
     */
    get roll() {
        let t = Date.now(), v = this.#c(this.#s(this.#r, 64), 2) ^ this.#c(this.#t, 2), r = this.#c(this.#s(this.#t, 122), 1), g = this.#c(BigInt(this.#s(v, r)) | BigInt(this.#s(v, -(-r & 63n))), 2);
        if (this.#d) console.debug('◊ Roll:', {
            state: { int: this.#t, hex: '0x' + this.#t.toString(16).padStart(32, '0'), bin: this.bin(this.#t) },
            gen: { int: g, hex: '0x' + g.toString(16).padStart(16, '0'), bin: this.bin(g) },
            dur: Date.now() - t + 'ms'
        });
        return g;
    }

    /**
     * Bind the random generator to generate a random number within a given range
     * @param r - range: The range to generate a random number in
     * @returns The generated random number within the given range
     * @throws If the range argument is not an integer at least 2
     */
    bind(r: number | bigint) {
        if ((r = BigInt(r)) > 1) {
            let t = Date.now(), n = this.roll, g: bigint;
            for (;;) if (n >= (-r % r)) {
                g = this.#c(n % r, 2);
                break;
            }
            if (this.#d) console.debug('◎ Bind:', {
                range: r,
                res: { int: g, hex: '0x' + g.toString(16), bin: this.bin(g) },
                dur: Date.now() - t + 'ms'
            });
            return g;
        } else throw Error('range argument must be an integer at least 2')
    }
    
    /**
     * Generate a random float between 0 and 1 using the roll method after
     * the decimal point and parse it as a float
     * @returns A random float between 0 and 1 ~ [0, 1)
     */
    get flush() {
        let t = Date.now(), g = parseFloat('0.' + this.roll.toString().padStart(16, '0'));
        if (this.#d) console.debug('⩫ Flush:', {
            res: { int: g, hex: '0x' + g.toString(16), bin: this.bin(g) },
            dur: Date.now() - t + 'ms'
        });
        return g;
    }

    /**
     * Generate a random float between 0 and 1 using the bind method on high
     * value after the decimal point and parse it as a float
     * @returns a random float between 0 and 1 ~ [0, 1)
     */
    get pull() {
        let t = Date.now(), g = parseFloat('0.' + this.bind(10 ** 19).toString().padStart(16, '0'));
        if (this.#d) console.debug('¤ Pull:', {
            res: { int: g, hex: '0x' + g.toString(16), bin: this.bin(g) },
            dur: Date.now() - t + 'ms'
        });
        return g;
    }

    /**
     * Generate a random float between 0 and 1 using the division of the roll
     * method and calculate it as a float
     * @returns A random float between 0 and 1 ~ [0, 1)
     */
    get yield() {
        let t = Date.now(), n = this.roll.toString(), g = [parseFloat(n.slice(0, n.length / 2)), parseFloat(n.slice(-n.length / 2))].map((c, i) => c / ((2 ** 32) * (i? 10 ** (n.length / 2 - i): 1))).reduce((p, n) => p + n);
        if (this.#d) console.debug('⁙ Yield:', {
            res: { int: g, hex: '0x' + g.toString(16), bin: this.bin(g) },
            dur: Date.now() - t + 'ms'
        })    
        return g;
    }

    /**
     * Generate a random number between a given minimum and maximum with number type option
     * @param nium - The minimal boundary value
     * @param xial - The maximum boundary value
     * @param flo - Option whether to use a float or integer
     * @returns The generated random number within the given range
     * @throws If the maximum (xial) argument is not a number greater than the minimal (nium) argument
     */
    clip(nium: number | bigint, xial: number | bigint, flo = !1) {
        try {
            let r = flo? (1 + (xial = Number(xial)) - (nium = Number(nium))): (1n + (xial = BigInt(xial)) - (nium = BigInt(nium))), t = Date.now(), g = flo? ((this[['flush', 'pull', 'yield'][Number(this.bind(3))]] * Number(r)) + Number(nium)): (this.bind(r) + BigInt(nium));
            if (this.#d) console.debug('⩉ Clip:', {
                min: nium,
                max: xial,
                type: flo? 'bloat (float)': 'flat (integer)',
                res: { int: g, hex: (g < 0? '-': '') + '0x' + (g < 0? -g: g).toString(16), bin: this.bin(g) },
                dur: Date.now() - t + 'ms'
            });
            return g;
        } catch (e) {
            if (xial > nium) console.error(e);
            else throw new Error('the maximal (xial) argument must be a number greater than the minimum (nium) argument');
        }
    }
}