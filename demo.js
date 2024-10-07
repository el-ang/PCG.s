/**
 * PCG Random Number Generation for JS.
 * 
 * For additional information about the PCG random number generation scheme,
 * visit http://www.pcg-random.org/.
 * 
 * @copyright © 2024 [El Roy Situmorang](https://github.com/el-ang)
 * @license [MIT](LICENSE)
 */

/* Read command-line options */

let r = 5, ds = !0;

const
    PCG = require('./PCG.js'),
    rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }),

    /* You should *always* seed the RNG. The usual time to do it is the point
    in time when you create RNG (typically at the beginning of the program). */

    /* PCG seed takes two 128-bit constants (the initial state, and the RNG
    sequence selector; rngs with different sequence selectors will *never*
    have random sequences that coincide, at all) - the code below shows some
    possible ways to do so. */

    /* If it choses to use a determined seed, the seed will take a fixed
    value or constant. Else, it will take external input for the seed. */

    /**
     * Create, set up, and start a new RNG from the PCG instance using the
     * preferred given seed
     * @returns {PCG} The new PCG RNG object
     */
    rng = _ => new PCG(ds? 42: Date.now(), ds? 54: (Math.random() * (10 ** 19))),

    /**
     * Main code of the demo
     * @param {PCG} rng - The PCG RNG to use
     */
    main = rng => {
        console.log("pcg.js:\n\t- result:\t64-bit unsigned int\n\t- period:\t2^128\t(* 2^127 streams)\n\t- output func:\tXSL-RR\n");
    
        for (let i = 1, j, d, o; i <= r; ++i) {
            o = 'Round ' + i + ':\n  64bit:';

            /* Make some 64-bit numbers */
            for (j = 0; j < 6; ++j) o += ' 0x' + rng.roll.toString(16).padStart(16, '0');
            o += '\n  Again:';
            rng.over = -6;
            for (j = 0; j < 6; ++j) o += ' 0x' + rng.roll.toString(16).padStart(16, '0');

            /* Toss some coins */
            o += '\n  Coins: ';
            for (j = 0; j < 113; ++j) o += rng.bind(2)? 'H': 'T';

            /* Roll some dice */
            o += '\n  Rolls:';
            for (j = 0; j < 57; ++j) o += ' ' + (rng.bind(6) + 1n);

            /* Deal some cards */
            o += '\n  Cards:';
            for (j = 0, d = []; j < 52; ++j) d[j] = j;
            for (; j > 1;) {
                let p = rng.bind(j), c = d[p];
                d[p] = d[--j];
                d[j] = c;
            }
            for (; j < 52; ++j) o += ' ' + ['A', 2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K'][d[j] % 13] + ['h', 'd', 'c', 's'][d[j] % 4] + (j % 38?  '': '\n\t');
            
            /* Make a long number */
            o += '\n  Combo: ';
            for (j = 0, d = ''; j < 6; ++j) d += {0: rng.clip(-1n * (10n ** 19n), 10n ** 19n), 3: rng.clip(0, 9, 1)}[j] ?? rng.roll;
            console.log(o += ((d.length < 113)? d + rng.bind(10n ** BigInt(113 - d.length)): d.slice(0, 113)) + '\n');
        }
    }

/**
 * Command Line Interface (CLI) Menu
 * @param {string} l - The command line input
 */
rl.on('line', l => {
    /**
     * Menu selection:
     * x - Exit
     * tas - Toggle auto-seed (ds, determined seed), default on
     * r[0-9] - Set round count
     * Ctrl + C - Force close 
     */

    if (l === 'x') { rl.close(); return process.exit(0); }
    else if (l === 'tas') ds = !ds, main(rng());
    else if (l.startsWith('r')) r = parseInt(l.slice(1)), main(rng());
    else console.clear(), main(rng());
});