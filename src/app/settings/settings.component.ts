import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MarketService } from '../market.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: `./settings.component.html`,
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  applied = false;

  constructor(private fb: FormBuilder, private market: MarketService) {
    this.form = this.fb.group({
      instrumentCount: [5, [Validators.required, Validators.min(1), Validators.max(50)]],
      updatesPerBatch: [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
      batchInterval: [500, [Validators.required, Validators.min(50), Validators.max(2000)]]
    });
  }

  ngOnInit() { this.form.patchValue(this.market.currentSettings); }

  apply() {
    if (this.form.valid) {
      this.market.startRun(this.form.value);
      this.applied = true;
      setTimeout(() => this.applied = false, 2000);
    }
  }
}