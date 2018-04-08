import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { map, flatMap, takeUntil, startWith, take } from 'rxjs/operators';

import { WebsocketClientService } from './websocket-client.service';
import { ApiClientService } from './api-client.service';
import { CoincheckWsOrderResponse, CoincheckOrderResponse, CoincheckWsMessage, CoincheckOrder } from '../models/coincheck.model';
import { environment } from '../../environments/environment';

const FILTER_KEY_BIDS = 'bids';
const FILTER_KEY_ASKS = 'asks';
const ORDER_HISTORY_RIMIT = 10;

@Injectable()
export class CoincheckOrderbookService implements OnDestroy {
  private bidsHistory: CoincheckOrder[];
  private bidsHistory$: ReplaySubject<CoincheckOrder[]> = new ReplaySubject<CoincheckOrder[]>(1);
  private asksHistory: CoincheckOrder[];
  private asksHistory$: ReplaySubject<CoincheckOrder[]> = new ReplaySubject<CoincheckOrder[]>(1);

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private wsService: WebsocketClientService, private apiService: ApiClientService) {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  startSubscribe() {
    // setup web socket connection.
    const message: CoincheckWsMessage = { type: environment.ws.orderbook.type, channel: environment.ws.orderbook.channel };
    this.wsService.createConnection(environment.ws.endpoint, JSON.stringify(message));

    // get orderbook from rest api before subscribe web socket connection.
    this.getInitialOrderbook()
      .pipe(
        flatMap((order: CoincheckWsOrderResponse) => {
          // start subscribe web socket connection.
          return this.wsService.getConnectionObservable().pipe(takeUntil(this.destroy$), startWith(order));
        }),
      )
      .subscribe((event: CoincheckWsOrderResponse) => {
        // bids
        const bids = this.filterOrderType(event, FILTER_KEY_BIDS);
        this.bidsHistory = this.addOrder(this.bidsHistory, bids, ORDER_HISTORY_RIMIT);
        this.bidsHistory$.next(this.bidsHistory);
        // asks
        const asks = this.filterOrderType(event, FILTER_KEY_ASKS);
        this.asksHistory = this.addOrder(this.asksHistory, asks, ORDER_HISTORY_RIMIT);
        this.asksHistory$.next(this.asksHistory);
      });
  }

  getBidsHistory(): Observable<CoincheckOrder[]> {
    return this.bidsHistory$.asObservable();
  }

  getAsksHistory(): Observable<CoincheckOrder[]> {
    return this.asksHistory$.asObservable();
  }

  private addOrder(order: CoincheckOrder[], newOrder: CoincheckOrder[], limit: number): CoincheckOrder[] {
    const resultOrder = newOrder.concat(order);
    resultOrder.splice(limit);
    return resultOrder;
  }

  private filterOrderType(orders: CoincheckWsOrderResponse, type: string): CoincheckOrder[] {
    const ordersArray: Array<string[]> = orders[1][type];
    return ordersArray.map((order) => this.adaptOrderType(order));
  }

  private adaptOrderType(orderArray: string[]): CoincheckOrder {
    return {
      rate: orderArray[0],
      amount: orderArray[1],
    };
  }

  private getInitialOrderbook(): Observable<CoincheckWsOrderResponse> {
    // const url = environment.api.endpoint + environment.api.orderBooks;
    const url = environment.api.orderBooks;
    return this.apiService.get<CoincheckOrderResponse>(url).pipe(
      map((apiRes: CoincheckOrderResponse) => {
        // mapping to tuple from string array.
        const mappedBids: Array<Array<string>> = apiRes.bids.map((item: [number, string]) => [item[0].toString(), item[1]]);
        const mappedAsks: Array<Array<string>> = apiRes.asks.map((item: [number, string]) => [item[0].toString(), item[1]]);
        return ['btc_jpy', { bids: mappedBids, asks: mappedAsks }] as CoincheckWsOrderResponse;
      }),
    );
  }
}
