import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, filter, tap } from 'rxjs/operators';

import { CoincheckOrderbookService } from '../../services/coincheck-orderbook.service';
import { CoincheckOrder } from '../../models/coincheck.model';

@Component({
  selector: 'app-orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./orderbook.component.scss'],
})
export class OrderbookComponent implements OnInit {
  ordersBids$: Observable<CoincheckOrder[]>;
  ordersAsks$: Observable<CoincheckOrder[]>;

  constructor(private obService: CoincheckOrderbookService) {}

  ngOnInit() {
    this.obService.startSubscribe();
    this.ordersBids$ = this.obService.getBidsHistory().pipe(tap((x) => console.log(x)));
    this.ordersAsks$ = this.obService.getAsksHistory().pipe(tap((x) => console.log(x)));
  }
}
