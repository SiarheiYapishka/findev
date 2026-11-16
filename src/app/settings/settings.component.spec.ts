import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { MarketService } from '../market.service';
import { ReactiveFormsModule } from '@angular/forms';

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

  it('должен инициализироваться с валидными дефолтными настройками', () => {
    expect(component.form.valid).toBe(true);
    expect(component.form.value).toEqual({
      instrumentCount: 5,
      updatesPerBatch: 100,
      batchInterval: 500
    });
  });

  it('должен валидировать количество инструментов (1-50)', () => {
    const control = component.form.get('instrumentCount');
    control?.setValue(0);
    expect(control?.valid).toBe(false);
    
    control?.setValue(51);
    expect(control?.valid).toBe(false);
    
    control?.setValue(25);
    expect(control?.valid).toBe(true);
  });

  it('должен валидировать количество обновлений в батче (1-1000)', () => {
    const control = component.form.get('updatesPerBatch');
    control?.setValue(0);
    expect(control?.valid).toBe(false);
    
    control?.setValue(1001);
    expect(control?.valid).toBe(false);
    
    control?.setValue(500);
    expect(control?.valid).toBe(true);
  });

  it('должен валидировать интервал (50-2000)', () => {
    const control = component.form.get('batchInterval');
    control?.setValue(49);
    expect(control?.valid).toBe(false);
    
    control?.setValue(2001);
    expect(control?.valid).toBe(false);
    
    control?.setValue(1000);
    expect(control?.valid).toBe(true);
  });
});