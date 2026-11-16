const UPDATE_SIZE = 7;
let instrumentBasePrices: Int32Array = new Int32Array(0);
let instrumentCount: i32 = 0;

// Выделяем фиксированный буфер в памяти
export const batchBuffer = new Int32Array(1000 * UPDATE_SIZE);

// Экспортируем указатель на буфер, чтобы JS мог его прочитать
export function getBufferPointer(): usize {
  return batchBuffer.dataStart;
}

export function initGenerator(count: i32): void {
  instrumentCount = count;
  instrumentBasePrices = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    instrumentBasePrices[i] = i32(Math.random() * 15000.0) + 5000;
  }
}

export function generateBatch(batchSize: i32): void {
  for (let i = 0; i < batchSize; i++) {
    let instIdx = i32(Math.random() * f64(instrumentCount));
    if (instIdx >= instrumentCount) instIdx = instrumentCount - 1;

    let basePrice = instrumentBasePrices[instIdx];
    let change = i32(Math.random() * 101.0) - 50;
    basePrice += change;
    if (basePrice < 100) basePrice = 100;
    instrumentBasePrices[instIdx] = basePrice;

    let spread = i32(Math.random() * 18.0) + 2;
    let bidCents = basePrice - spread / 2;
    let askCents = bidCents + spread;
    let priceCents = Math.random() > 0.5 ? bidCents : askCents;
    
    let tradeQuantity = i32(Math.random() * 99.0) + 1;
    let bidQuantity = i32(Math.random() * 990.0) + 10;
    let askQuantity = i32(Math.random() * 990.0) + 10;

    let offset = i * UPDATE_SIZE;
    batchBuffer[offset + 0] = instIdx;
    batchBuffer[offset + 1] = priceCents;
    batchBuffer[offset + 2] = tradeQuantity;
    batchBuffer[offset + 3] = bidCents;
    batchBuffer[offset + 4] = askCents;
    batchBuffer[offset + 5] = bidQuantity;
    batchBuffer[offset + 6] = askQuantity;
  }
}