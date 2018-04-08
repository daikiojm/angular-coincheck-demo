import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, filter, tap } from 'rxjs/operators';

import { CoincheckTradesService } from '../../services/coincheck-trades.service';
import { CoincheckTrade } from '../../models/coincheck.model';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss'],
})
export class TradesComponent implements OnInit {
  trades$: Observable<CoincheckTrade[]>;

  constructor(private tradesService: CoincheckTradesService) {}

  ngOnInit() {
    this.tradesService.startSubscribe();
    this.trades$ = this.tradesService.getTradeHistory().pipe(tap((x) => console.log(x)));
  }
}
