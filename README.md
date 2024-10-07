# PCG.s - PCG // P-RNG, Script Edition

[PCG-Random website]: (http://www.pcg-random.org/)

This code provides an implementation of the Permuted Congrentual Generator (PCG) family of Random Number Generators (RNGs), which are fast, statistically excellent, and offer a number of useful features.

Full details can be found at the [PCG-Random website]. This version mainly focusing on flexibility and high quality resultant of numbers. Currently made in JavaScript (JS) and TypeScript (TS, under development).

There are other version and implementation of this algorithm can be found in the previously mentioned site's and it's founder implementation.

## Doc & Xamples
These are some small explanations into this implementation on how it works and how to use it. 

### Features
In this version, the work of this code uses a class `PCG` which leads to the use of object oriented functionality. Here is the list of the features provided by this implementation:

1. **Initialization**
    
    The class constructor can be used to initialize the set up of the PCG RNG by default or with custom preferred seed (first state) and chosen sequence.

    ```js ts
    const bar = new PCG();
    // By default it takes current time as the seed and the first sequence for the RNG set up input
    
    const foo = new PCG((_ => 42.01n)(), (0x6 * 9));
    // It basically accept any kind of number for it's input, but it will be converted to 128-bit unsigned integer anyway
    ```

2. **Ste et Quo: State Seeding and Sequences**

    In this class instance, the state and sequence can be set back up again with a new input using the **`seq`** method so it can be used to make a new different generation depends on the set up.

    ```js ts
    bar.seq(0x2a, 54);
    // This method will reset the state and sequence then start again to these new values
    ```

    This method was called and used in the first initialization and can be used again for custom set up changes. As it's mentioned before, it's mainly focused on flexibility and high quality resultant of numbers.

3. **ROLL: Base Generator**

    Getter method **`roll`**, used to generate a new random number in 64-bit unsigned integer form. It really can generate a high quality number for good statistical purpose.

    ```js ts
    bar.roll;
    // Generates and return a new random number in 64-bit unsigned integer form
    // Basically, the number range can be reach from 0 to 2^64 - 1
    ```

4. **BIND: Generator with Range Bound**

    A method that can be used to generate a random number within a given range. **`bind`** takes the range as an argument and generates a random number within that range.

    ```js ts
    foo.bind(100);
    // Always generates a random number start within 0 to the given range
    // This example won't return 100 as it is the boundary of the given range
    ```

    Usually if the expected result require to include the boundary, it will be introduced in another method later after this. Note, that it needs to be an integer at least 2 as the smallest possible number that can be generated is within the minimum boundary of the range.

5. **FLUSH, PULL, YIELD: Random Float Point Generator**

    These are all the getter methods that can be used to generate a random number in floating point form within range of 0 to 1 ~ `[0, 1)`. Each of these method has it own ways to generate the number and this use of choices would really improve the flexibility of generation.

    ```js ts
    bar.flush;
    // This method uses the base generator to generate a random number
    // then parse it to the value 0 after the floating point

    foo.pull;
    // This method uses bind method inside with a range of 10^19 to generate a random number
    // then parse it to the value 0 after the floating point

    bar.yield;
    // Different from others, this method uses the base generator to generate a random number
    // then divide it in novel way with a suggested formula and parse it back to the floating point result
    ```

6. **CLIP: Scoped Range Generator**

    Last method that can be used to generate a random number within a given range. **`clip`** takes boundaries as an argument and generates a random number within that range (including the boundary itself).

    ```js ts
    foo.clip(0, 100);
    // Always generates a random number start within 0 to the given range,
    // in this case it can possibly return 100 by the generator as it was included

    bar.clip(-42.013, (0x6 * 9), 1);
    // It also accepts any kind of number as the boundary, and an option
    // to generate a floating point number on the third argument

    foo.clip(-42n, .54, 0);
    // By default the float type option was set to false, so to generate a floating point number
    // the third argument require any kind of value that is equal as true
    ```

7. **Jump OVER the State**

    `over` is a setter that can be used to jump back or ahead on the state. This method accept any integer as delta and jump to the calculated state.

    ```js ts
    bar.over = 13;
    // It will jump ahead thru 13 steps on the state

    foo.over = -7;
    /* It will jump back over 7 steps on the state, but basically it was a cycle
    since it jump in the cycle of state in 128-bit unsigned integer form which
    has a cycle length of 2^128 - 1, as the signed integer will be converted back
    to that form in the end and returning a state that already stepped by before */
    ```

8. **lil' d**

    Can't tell what to name this method was and it's not even on capital (yea, no cap), but anyway it was first for debugging purpose or says it's a developer mode. `d`, a getter, just calling it will toggle some processes on many functions for profiling or monitoring 'em on their work.

    ```js ts
    const rng = new PCG(); // d == !1
    // The d is disabled from the start of initialization
    
    console.log(rng.d); // d == !0
    // This will switch the current mode after the call and returning it after the switch
    // Defo turning all the inspection on
    ```

9. **BIN: What's the number?**

    Just a simple converter method to get the binary representation of any number in a form of array of decimal based sequence. That's `bin`. Just think as one kind of small utility tool.

    ```js ts
    rng.bin(42n); // ['0010', '1010']
    // This is not a static method, so it can only be called after initialization of the instance

    rng.bin(-13); // ['-', '1101']
    // Again, any kind of number. Flex goes brrrr~

    rng.bin(.007);
    // ['000.', '0000', '0001', '1100', '1010', '1100', '0000', '1000', '0011', '0001', '0010', '0110', '1110', '1001', '0111', '1001']
    // This is actually a long binary for such a small number
    ```

---
Not just it's functionality, the base and structure of this implementation is also very important to get the job of this work done.

#### Structure
By using the same logic of the original algorithm **`XSL-RR`**, the method were used can be found and specified as such:
1. **`XOR`**&nbsp;: **Bitwise Exclusive `OR` Operation**
    
    Planted in one private getter method **`#r`** in the `PCG` class to step one time ahead on state and new sequence generation.

2. **`Shift`**&nbsp;: **Bitwise Shifting Operation**
    
    Implemented as one private method **`#s`** in the `PCG` class with a novel way to work, following the given directional value.

3. **`LCG`**&nbsp;: **Linear Congruential Generator**
    
    Applied an addition and multiplication formula to calculate value based on other values and sequence.

4. **`Rotation`**&nbsp;: **Rotating Sequence**
    
    Using the combination of `XOR`, `Shift` and `LCG` (`XSL`) to calculate value based on preferred values and sequence and set it into the current generation state.

5. **`Reseed`**&nbsp;: **State Changes Repetition**
    
    Using the resultant state after rotation to generate new sequence and other state values as the next state to use.

#### 128 Math
In most modern machines, script couldn't handle a bigger size number for the sake of performance and flexibility. Even if it was possible, it's not worth too much as it all depends on the use of it. But on the other hand, we're just gonna use any available ways on the breakdown for it's functionality.

Since JS and TS was mostly used in these days, the current work is mainly focused on those for compatibility purposes. But in the mean time, there are many differences on these scripting languages in coding or programming compared with basic or normal programming languages.

The only obstacle seems to be found was the many uses of different number size which later need to be accounted for performance. By default, the current work doesn't support any bigger size than 32-bit but still recommend other features to handle it. And here, where `BigInt` plays it's role.

Even the work could classify and handle those numbers pretty well, it seems that it take up much work in the background which leads to some performance related task. And these support after all also has a different feature implementation which force this work to make and use it's own utility to figure it out and follow the base of the original reference's logic.

This implementation get the job done by keep on circulating the use of `BigInt` and `Number` in the code. As it could be found in `#c` private method to convert different use of unsigned integer sizes to the preferred one using `BigInt`. And to keep on track of the performance, this class has it's own monitoring system and avoid on storing value in the memory as much as possible by taking a direct use of those values.

### Usage
The ways to use this code is shown as in the `demo` files and prepared for different cases. Just for reminder, that the generator instance should and will always be seeded before use.

```js ts
let autoSeed;

const rng = autoSeed? new PCG(): new PCG(42n, (0x6 * 9)); // The generator instance

console.log(rng.roll); // Generate a random number in 64-bit unsigned integer form

console.log(rng.bind(2)); // Random 0 or 1, can be used for binary or boolean for blind decision

console.log(rng.clip(0, 5, 1));
// Generate random float number from 0 to 5, a bit scary if u want to make bot that randomly rate a movie or item on sales
```

#### Running
It can run in any environment at any case.

```
Chrome, Firefox, Node.js, Vercel, Three.js, you name it.
```

It's just flexible on it's own.

#### Testing
You can test it in any environment too, but can't neither will guarantee any kind of corrections or problems. It still could be monkey-patched for personal use, but this work is also available for contribution and discussion. So, in the mean time, the work will still be available under the watch for a while.

#### Production
> Currently this work is not available for deployment or production built level, and will be kept as open project for future plan and development.

### FAQ
More common questions about this work can be found here.

1. **The result of base generator is 64-bit unsigned int in bigint type, how can i generate bigger size number?**

    Well, to convert the generated number to smaller one is easier. But to generate bigger number without messing up the class it could be tried by combining two results from the base generator and form it into the preferred one.

    ```js ts
    const rng = new PCG(42n, (0x6 * 9)); // The generator instance

    const lump = _ => BigInt('' + BigInt('0x' + rng.roll.toString(16).padStart(16, '0').slice(0, 8)) + BigInt('0x' + rng.roll.toString(16).padStart(16, '0')));
    /* Create a combined base generator, where it takes first 32 digits from the first result and then combines it with the full second result in a novel way */
    
    console.log(lump()); // Generate a random number in range of 96-bit unsigned integer form
    ```

    Or it can also be done using combination of bind too, for more flexibility of bigger sizes. Well, to mention bind also based on the base generator, so it also gonna be limited to 64-bit result. But the combination can be created from more than one, so any solution is possible.

    Or just want to mess up the code with custom size, others don't mind as long as it met the preffered use.

2. **Now the PCG is implemented in object oriented style, can the generated result be used as one of the input for the instance again?**

    Yes, it can. But it won't be recommended tho, especially injecting the result dirrectly to any parameters. Since it's gonna take time and have many call stacks, the suggestion here is to store the result and reconvert it to safe bigint form (if it wasn't float number). Then after store it can be used again for any action that need the number.

    ```js ts
    const rng = new PCG(); // The generator instance

    // Imagine that clip was used, and the built-in code also use bind which also use roll and roll need to call step method and in any of those there is conversion or shifting operation
    
    console.log(rng.bind(rng.clip(42, 10 ** 7))); // This might be working, but it's not recommended. Since it's gonna take time and cause performance issues

    let reuse = BigInt(rng.roll.toString()); // A safe use by storing the result
    rng.seq(reuse, reuse); // Using the stored result for more action
    console.log(rng.roll);
    ```

3. **If there are bigint and can be used in this case, why there are no big float type?**

    This is one of the big deal of this work, which focusing on flexibility while it has multiple different uses of features but don't have the support of this float case.
    At first combination might be and could be one solution, but again it's not easy to apply the use of the result.

    There is solution to this from online source, but again it gonna be a work arround the performance. If there are any request on contribution, this work gonna be open for further development that will include this matter for more solution.

4. **Is this unpredictable? Safe? Can it be used for good simulation?**

    Well the current work doesn't seem to be worth of comparison due to it's lack of performance. But for the concept of some measure, the work of the original algorithm might has the explanation to this question. Thus for security measure it won't be ideal and for a high quality results of number, still might be harder to predict but it can't promise the best performance and safety either. So you can use it for fun on your project with this work - just don't get the mac burnt.

For more further question, discussion will be opened in this work when it already need to be.

---
Visit [PCG-Random website] for more information on how this library and algorithm works, or look
at the sample code named as `demo.*` in the directory -- hopefully it should be fairly
self explanatory.

> This version of implementation is currently not yet available as part of the actual official original implementation nor part of the familiars.

## Tribute & License
The license for this work does not require anyone to share changes they make in their own version of the code. Contributions are welcome, however.

© 2024 · [El Roy Situmorang](https://github.com/el-ang)

This work, algorithm, code, implementation, versions, and any kind of related derivatives is distributed under the MIT license. See [LICENSE](LICENSE) file for details.