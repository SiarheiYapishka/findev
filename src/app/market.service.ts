import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class MarketService {
  private worker?: Worker;
  private metricsMap = new Map<string, InstrumentMetrics>();
  
  public metrics$ = new BehaviorSubject<InstrumentMetrics[]>([]);
  public isPaused$ = new BehaviorSubject<boolean>(false);
  
  public currentSettings: ProducerSettings = {
    instrumentCount: 5, updatesPerBatch: 100, batchInterval: 500
  };

  startRun(settings: ProducerSettings) {
    this.currentSettings = settings;
    this.metricsMap.clear();
    this.metrics$.next([]);
    this.isPaused$.next(false);

    if (this.worker) {
      this.worker.postMessage({ type: 'STOP' });
      this.worker.terminate();
    }

    this.worker = new Worker(new URL('./market.worker', import.meta.url), { type: 'module' });
    this.worker.onmessage = ({ data }) => {
      if (data.type === 'BATCH') this.processBatch(data.payload);
    };

    this.worker.postMessage({ type: 'INIT', config: settings });
  }

  pause() {
    this.worker?.postMessage({ type: 'PAUSE' });
    this.isPaused$.next(true);
  }

  resume() {
    this.worker?.postMessage({ type: 'RESUME' });
    this.isPaused$.next(false);
  }

  private processBatch(updates: MarketUpdate[]) {
    updates.forEach(update => {
      let metric = this.metricsMap.get(update.instrument);
      if (!metric) {
        metric = { symbol: update.instrument, lastPrice: null, spread: null, volume: 0, vwap: null, imbalance: null, _totalValueCents: 0 };
        this.metricsMap.set(update.instrument, metric);
      }

      metric.lastPrice = update.priceCents / 100;
      metric.spread = (update.askCents - update.bidCents) / 100;
      metric.volume += update.tradeQuantity;
      metric._totalValueCents += (update.priceCents * update.tradeQuantity);
      
      metric.vwap = metric.volume === 0 ? null : (metric._totalValueCents / metric.volume) / 100;
      const totalDepth = update.bidQuantity + update.askQuantity;
      metric.imbalance = totalDepth === 0 ? null : (update.bidQuantity - update.askQuantity) / totalDepth;
    });
    this.metrics$.next(Array.from(this.metricsMap.values()));
  }
}