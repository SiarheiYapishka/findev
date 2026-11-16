import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app';
import { MarketService } from './market.service';
import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let startRunCalledWith: any = null;
  const mockSettings = { instrumentCount: 5, updatesPerBatch: 100, batchInterval: 500 };

  beforeEach(async () => {
    startRunCalledWith = null;

    const mockMarketService = {
      startRun: (settings: any) => { startRunCalledWith = settings; },
      currentSettings: mockSettings,
      metrics$: new BehaviorSubject([]),
      isPaused$: new BehaviorSubject(false)
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: MarketService, useValue: mockMarketService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('calls market.startRun with currentSettings on ngOnInit', () => {
    fixture.detectChanges();
    expect(startRunCalledWith).toEqual(mockSettings);
  });
});