import { TestBed } from '@angular/core/testing';
import { MarketService } from './market.service';
import { vi } from 'vitest';


describe('MarketService', () => {
  let service: MarketService;

  beforeEach(() => {
    (globalThis as any).Worker = class {
      postMessage() {}
      terminate() {}
      addEventListener() {}
    };

    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketService);
  });
  it('calculates metrics', () => {
    const processBatch = (service as any).processBatch.bind(service);
    
    processBatch([{
      instrument: 'ALFA', priceCents: 10000, tradeQuantity: 10,
      bidCents: 9900, askCents: 10100, bidQuantity: 500, askQuantity: 500
    }]);
    
    processBatch([{
      instrument: 'ALFA', priceCents: 10200, tradeQuantity: 30,
      bidCents: 10196, askCents: 10200, bidQuantity: 600, askQuantity: 400
    }]);

    const metrics = service.metrics$.value;
    const alfa = metrics.find(m => m.symbol === 'ALFA');

    expect(alfa).toBeTruthy();
    expect(alfa?.lastPrice).toBe(102); 
    expect(alfa?.volume).toBe(40); 
    expect(alfa?.vwap).toBeCloseTo(101.50); 
    expect(alfa?.spread).toBeCloseTo(0.04);
    expect(alfa?.imbalance).toBeCloseTo(0.20);
  });

  it('returns null for VWAP and Imbalance when / with 0', () => {
    const processBatch = (service as any).processBatch.bind(service);
    processBatch([{
      instrument: 'BETA', priceCents: 10000, tradeQuantity: 0,
      bidCents: 10000, askCents: 10000, bidQuantity: 0, askQuantity: 0
    }]);

    const beta = service.metrics$.value.find(m => m.symbol === 'BETA');
    expect(beta?.vwap).toBeNull();
    expect(beta?.imbalance).toBeNull();
  });

  it('isolates metrics of different instruments', () => {
    const processBatch = (service as any).processBatch.bind(service);
    processBatch([
      { instrument: 'A', priceCents: 100, tradeQuantity: 10, bidCents: 0, askCents: 0, bidQuantity: 0, askQuantity: 0 },
      { instrument: 'B', priceCents: 200, tradeQuantity: 20, bidCents: 0, askCents: 0, bidQuantity: 0, askQuantity: 0 }
    ]);

    const metrics = service.metrics$.value;
    expect(metrics.find(m => m.symbol === 'A')?.volume).toBe(10);
    expect(metrics.find(m => m.symbol === 'B')?.volume).toBe(20);
  });

  it('switches paused state', () => {
    service.pause();
    expect(service.isPaused$.value).toBe(true);
    
    service.resume();
    expect(service.isPaused$.value).toBe(false);
  });

  it('resets previous results when applying new settings', () => {
    const processBatch = (service as any).processBatch.bind(service);
    processBatch([{ instrument: 'SYM', priceCents: 100, tradeQuantity: 10, bidCents: 90, askCents: 110, bidQuantity: 10, askQuantity: 10 }]);
    expect(service.metrics$.value.length).toBe(1);

    service.startRun({ instrumentCount: 1, updatesPerBatch: 10, batchInterval: 500 });
    
    expect(service.metrics$.value.length).toBe(0);
    expect(service.isPaused$.value).toBe(false);
  });

  it('stops the previous worker when startRun is called again', () => {
    service.startRun({ instrumentCount: 1, updatesPerBatch: 10, batchInterval: 500 });
    const firstWorker = (service as any).worker;
    vi.spyOn(firstWorker, 'postMessage');
    vi.spyOn(firstWorker, 'terminate');

    service.startRun({ instrumentCount: 2, updatesPerBatch: 20, batchInterval: 1000 });

    expect(firstWorker.postMessage).toHaveBeenCalledWith({ type: 'STOP' });
    expect(firstWorker.terminate).toHaveBeenCalled();
  });

  it('calls processBatch when receiving a BATCH message from a worker', () => {
    service.startRun({ instrumentCount: 1, updatesPerBatch: 10, batchInterval: 500 });
    const worker = (service as any).worker;
    vi.spyOn(service as any, 'processBatch');

    worker.onmessage({
      data: {
        type: 'BATCH',
        payload: [{ instrument: 'TEST', priceCents: 100, tradeQuantity: 10, bidCents: 90, askCents: 110, bidQuantity: 10, askQuantity: 10 }]
      }
    } as MessageEvent);

    expect((service as any).processBatch).toHaveBeenCalled();
  });

  it('stops worker when ngOnDestroy is called', () => {
    service.startRun({ instrumentCount: 1, updatesPerBatch: 10, batchInterval: 500 });
    const worker = (service as any).worker;
    vi.spyOn(worker, 'postMessage');
    vi.spyOn(worker, 'terminate');

    service.ngOnDestroy();

    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'STOP' });
    expect(worker.terminate).toHaveBeenCalled();
  });
});