/// <reference lib="webworker" />

let wasmExports: any = null;
let isPaused = false;
let intervalId: any = null;
let config = { instrumentCount: 5, updatesPerBatch: 100, batchInterval: 500 };
const UPDATE_SIZE = 7;

addEventListener('message', async ({ data }) => {
  switch (data.type) {
    case 'INIT':
      config = data.config;
      if (!wasmExports) {
        try {
          // Скачиваем файл
          const response = await fetch('/release.wasm');
          if (!response.ok) {
            throw new Error(`Failed to fetch wasm: ${response.statusText}`);
          }
          
          // Читаем как сырой буфер (надежнее, чем instantiateStreaming)
          const buffer = await response.arrayBuffer();
          
          // Инициализируем с нужными для AssemblyScript функциями
          const wasmModule = await WebAssembly.instantiate(buffer, {
            env: { 
              abort: (msg: any, file: any, line: any, col: any) => console.error(`Wasm aborted at ${line}:${col}`),
              seed: () => Date.now() // Нужно для работы Math.random() в Wasm
            }
          });
          
          wasmExports = wasmModule.instance.exports;
        } catch (e) {
          console.error("Ошибка при загрузке WebAssembly:", e);
          return;
        }
      }
      wasmExports.initGenerator(config.instrumentCount);
      startLoop();
      break;
    case 'PAUSE':
      isPaused = true;
      break;
    case 'RESUME':
      isPaused = false;
      break;
    case 'STOP':
      stopLoop();
      break;
  }
});

function startLoop() {
  stopLoop();
  isPaused = false;
  intervalId = setInterval(() => {
    if (!isPaused && wasmExports) {
      wasmExports.generateBatch(config.updatesPerBatch);
      
      const ptr = wasmExports.getBufferPointer();
      const memoryBuffer = wasmExports.memory.buffer;
      const batch = new Int32Array(memoryBuffer, ptr, config.updatesPerBatch * UPDATE_SIZE);
      
      const updates = [];
      for (let i = 0; i < config.updatesPerBatch; i++) {
        const offset = i * UPDATE_SIZE;
        updates.push({
          instrument: 'SYM' + batch[offset + 0],
          priceCents: batch[offset + 1],
          tradeQuantity: batch[offset + 2],
          bidCents: batch[offset + 3],
          askCents: batch[offset + 4],
          bidQuantity: batch[offset + 5],
          askQuantity: batch[offset + 6],
        });
      }
      postMessage({ type: 'BATCH', payload: updates });
    }
  }, config.batchInterval);
}

function stopLoop() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}