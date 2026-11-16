import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { MarketService } from './market.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, DashboardComponent, SettingsComponent],
  templateUrl: `./app.html`,
  styleUrl: `./app.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  view = 'dashboard';
  constructor(private market: MarketService) {}

  ngOnInit() {
    this.market.startRun(this.market.currentSettings);
  }
}