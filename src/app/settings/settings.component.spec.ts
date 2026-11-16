import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { MarketService } from '../market.service';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';
describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent, ReactiveFormsModule],
      providers: [MarketService]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('inits with valid default settings', () => {
    expect(component.form.valid).toBe(true);
    expect(component.form.value).toEqual({
      instrumentCount: 5,
      updatesPerBatch: 100,
      batchInterval: 500
    });
  });

  it('validates amount of instruments', () => {
    const control = component.form.get('instrumentCount');
    control?.setValue(0);
    expect(control?.valid).toBe(false);
    
    control?.setValue(51);
    expect(control?.valid).toBe(false);
    
    control?.setValue(25);
    expect(control?.valid).toBe(true);
  });

  it('validates amount of updates in batches', () => {
    const control = component.form.get('updatesPerBatch');
    control?.setValue(0);
    expect(control?.valid).toBe(false);
    
    control?.setValue(1001);
    expect(control?.valid).toBe(false);
    
    control?.setValue(500);
    expect(control?.valid).toBe(true);
  });

  it('validates interval', () => {
    const control = component.form.get('batchInterval');
    control?.setValue(49);
    expect(control?.valid).toBe(false);
    
    control?.setValue(2001);
    expect(control?.valid).toBe(false);
    
    control?.setValue(1000);
    expect(control?.valid).toBe(true);
  });

  it('calls market.startRun and shows success message', () => {
    vi.useFakeTimers(); 

    const marketService = TestBed.inject(MarketService);
    vi.spyOn(marketService, 'startRun').mockImplementation(() => {});

    const emittedValues: boolean[] = [];
    const subscription = component.applied$.subscribe(val => emittedValues.push(val));

    component.form.setValue({ instrumentCount: 10, updatesPerBatch: 50, batchInterval: 1000 });
    component.apply();

    expect(marketService.startRun).toHaveBeenCalledWith({ instrumentCount: 10, updatesPerBatch: 50, batchInterval: 1000 });
    
    expect(emittedValues).toEqual([true]);

    vi.advanceTimersByTime(2000); 
    
    expect(emittedValues).toEqual([true, false]);

    subscription.unsubscribe();
    vi.useRealTimers(); 
  });

  it('doesnt call market.startRun when form is invalid', () => {
    const marketService = TestBed.inject(MarketService);
    vi.spyOn(marketService, 'startRun');

    component.form.controls['instrumentCount'].setValue(0); 
    component.apply();

    expect(marketService.startRun).not.toHaveBeenCalled();
  });
});