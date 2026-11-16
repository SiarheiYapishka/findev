import { Component } from '@angular/core';
import { MarketService } from '../market.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: `./dashboard.component.html`,
  styleUrl: './dashboard.component.scss'

})
  export class DashboardComponent {
  metrics$;
  isPaused$;

  constructor(private market: MarketService) {
    this.metrics$ = this.market.metrics$;
    this.isPaused$ = this.market.isPaused$;
  }

  togglePause() { 
    this.isPaused$.value ? this.market.resume() : this.market.pause(); 
  }
}