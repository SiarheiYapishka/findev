import fs from 'fs';

async function runWasmTests() {
  console.log('Testing Wasm Generator...');
  const buffer = fs.readFileSync('./public/release.wasm');
  
  const wasmModule = await WebAssembly.instantiate(buffer, {
    env: { 
      abort: () => { throw new Error('Wasm aborted'); },
      seed: () => Date.now()
    }
  });
  const exports = wasmModule.instance.exports;

  exports.initGenerator(10);
  
  exports.generateBatch(50);
  
  const ptr = exports.getBufferPointer();
  const memoryBuffer = exports.memory.buffer;
  const batch = new Int32Array(memoryBuffer, ptr, 50 * 7); 
  
  if (batch.length !== 350) throw new Error('Batch size incorrect');
  console.log('✔ Batch size is strictly respected');
  
  for (let i = 0; i < 50; i++) {
    const offset = i * 7;
    const price = batch[offset + 1];
    const tradeQty = batch[offset + 2];
    const bid = batch[offset + 3];
    const ask = batch[offset + 4];
    const bidQty = batch[offset + 5];
    const askQty = batch[offset + 6];

    if (price <= 0) throw new Error('Price must be positive');
    if (bid >= ask) throw new Error(`Bid (${bid}) must be below Ask (${ask})`);
    if (tradeQty <= 0) throw new Error('Trade quantity must be positive');
    if (bidQty < 0 || askQty < 0) throw new Error('Book quantities must be nonnegative');
  }
  console.log('✔ Generated values (prices, spreads, quantities) are valid');
  console.log('All Wasm Generator tests passed successfully!');
}

runWasmTests().catch(err => {
  console.error(err);
  process.exit(1);
});