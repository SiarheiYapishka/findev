import { TestBed } from '@angular/core/testing';
import { MarketService } from './market.service';


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
  it('должен корректно считать метрики по примеру из задания', () => {
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

  it('должен возвращать null для VWAP и Imbalance при делении на ноль', () => {
    const processBatch = (service as any).processBatch.bind(service);
    processBatch([{
      instrument: 'BETA', priceCents: 10000, tradeQuantity: 0,
      bidCents: 10000, askCents: 10000, bidQuantity: 0, askQuantity: 0
    }]);

    const beta = service.metrics$.value.find(m => m.symbol === 'BETA');
    expect(beta?.vwap).toBeNull();
    expect(beta?.imbalance).toBeNull();
  });

  it('должен изолировать метрики разных инструментов', () => {
    const processBatch = (service as any).processBatch.bind(service);
    processBatch([
      { instrument: 'A', priceCents: 100, tradeQuantity: 10, bidCents: 0, askCents: 0, bidQuantity: 0, askQuantity: 0 },
      { instrument: 'B', priceCents: 200, tradeQuantity: 20, bidCents: 0, askCents: 0, bidQuantity: 0, askQuantity: 0 }
    ]);

    const metrics = service.metrics$.value;
    expect(metrics.find(m => m.symbol === 'A')?.volume).toBe(10);
    expect(metrics.find(m => m.symbol === 'B')?.volume).toBe(20);
  });

  it('должен переключать состояние isPaused$ при паузе и возобновлении', () => {
    service.pause();
    expect(service.isPaused$.value).toBe(true);
    
    service.resume();
    expect(service.isPaused$.value).toBe(false);
  });

  it('должен сбрасывать предыдущие результаты при применении новых настроек', () => {
    const processBatch = (service as any).processBatch.bind(service);
    processBatch([{ instrument: 'SYM', priceCents: 100, tradeQuantity: 10, bidCents: 90, askCents: 110, bidQuantity: 10, askQuantity: 10 }]);
    expect(service.metrics$.value.length).toBe(1);

    service.startRun({ instrumentCount: 1, updatesPerBatch: 10, batchInterval: 500 });
    
    expect(service.metrics$.value.length).toBe(0);
    expect(service.isPaused$.value).toBe(false);
  });
});