export interface MarketUpdate {
  instrument: string;
  priceCents: number;
  tradeQuantity: number;
  bidCents: number;
  askCents: number;
  bidQuantity: number;
  askQuantity: number;
}

export interface WorkerMessage {
  type: 'INIT' | 'PAUSE' | 'RESUME' | 'STOP' | 'BATCH';
  config?: ProducerSettings;
  payload?: MarketUpdate[];
}

export interface MarketUpdate {
  instrument: string; priceCents: number; tradeQuantity: number;
  bidCents: number; askCents: number; bidQuantity: number; askQuantity: number;
}

export interface InstrumentMetrics {
  symbol: string; lastPrice: number | null; spread: number | null;
  volume: number; vwap: number | null; imbalance: number | null;
  _totalValueCents: number;
}

export interface ProducerSettings {
  instrumentCount: number; updatesPerBatch: number; batchInterval: number;
}