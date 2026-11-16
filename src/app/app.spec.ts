import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { MarketService } from './market.service';
import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(async () => {
    // Мокаем сервис, так как компонент вызывает startRun в ngOnInit
    const mockMarketService = {
      startRun: () => {},
      currentSettings: { instrumentCount: 5, updatesPerBatch: 100, batchInterval: 500 },
      metrics$: new BehaviorSubject([]),
      isPaused$: new BehaviorSubject(false)
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: MarketService, useValue: mockMarketService }
      ]
    }).compileComponents();
  });

  it('должен создаваться', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});