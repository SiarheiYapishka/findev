import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { MarketService } from '../market.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockMarketService: any;
  let metricsSubject: BehaviorSubject<any[]>;
  let isPausedSubject: BehaviorSubject<boolean>;
  
  // Обычные переменные вместо spyOn
  let pauseCalled = false;
  let resumeCalled = false;

  beforeEach(async () => {
    metricsSubject = new BehaviorSubject<any[]>([]);
    isPausedSubject = new BehaviorSubject<boolean>(false);
    pauseCalled = false;
    resumeCalled = false;

    // Мокаем сервис с ручным отслеживанием вызовов
    mockMarketService = {
      metrics$: metricsSubject,
      isPaused$: isPausedSubject,
      pause: () => { pauseCalled = true; },
      resume: () => { resumeCalled = true; }
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: MarketService, useValue: mockMarketService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('должен отображать "Waiting for data..." при пустом списке', () => {
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState).toBeTruthy();
    expect(emptyState.nativeElement.textContent).toContain('Waiting for data...');
  });

  it('должен корректно рендерить таблицу с метриками и заменять null на N/A', () => {
    metricsSubject.next([
      { symbol: 'ALFA', lastPrice: 102, spread: 0.04, volume: 40, vwap: 101.5, imbalance: 0.2 },
      { symbol: 'BETA', lastPrice: null, spread: null, volume: 0, vwap: null, imbalance: null }
    ]);
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);

    const alfaRow = rows[0].nativeElement.textContent;
    expect(alfaRow).toContain('ALFA');
    expect(alfaRow).toContain('$102.00');
    expect(alfaRow).toContain('0.20');

    const betaRow = rows[1].nativeElement.textContent;
    expect(betaRow).toContain('BETA');
    expect(betaRow).toContain('N/A');
  });

  it('должен вызывать методы pause и resume при клике на кнопку', () => {
    const pauseBtn = fixture.debugElement.query(By.css('.pause-btn')).nativeElement;
    
    pauseBtn.click();
    expect(pauseCalled).toBe(true);

    isPausedSubject.next(true);
    fixture.detectChanges();
    
    pauseBtn.click();
    expect(resumeCalled).toBe(true);
  });
});