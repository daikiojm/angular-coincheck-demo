import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

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
    this.ordersBids$ = this.obService.getBidsHistory();
    this.ordersAsks$ = this.obService.getAsksHistory();
  }

  orderByRate(index: number, order: CoincheckOrder) {
    return order.rate;
  }
}
