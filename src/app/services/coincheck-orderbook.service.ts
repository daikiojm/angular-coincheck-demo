import { Injectable, OnDestroy } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { of } from 'rxjs/observable/of';
import { map, flatMap, takeUntil, startWith, filter, catchError } from 'rxjs/operators';

import { WebsocketClientService } from './websocket-client.service';
import { ApiClientService } from './api-client.service';
import {
  CoincheckWsOrderResponse,
  CoincheckWsTradeResponse,
  CoincheckOrderResponse,
  CoincheckWsMessage,
  CoincheckOrder,
} from '../models/coincheck.model';
import { environment } from '../../environments/environment';

const DEFAULT_SELECTED_PAIR = 'btc_jpy';
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
    this.wsService.sendMessage(JSON.stringify(message));

    // get orderbook from rest api before subscribe web socket connection.
    this.getInitialOrderbook()
      .pipe(
        flatMap((bulkOrder: CoincheckWsOrderResponse) => {
          // start subscribe web socket connection.
          return this.wsService.getConnectionObservable().pipe(
            takeUntil(this.destroy$),
            startWith(bulkOrder),
            filter((order: CoincheckWsOrderResponse | CoincheckWsTradeResponse) => {
              return this.isOrderbookEvent(order);
            }),
          );
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

  private isOrderbookEvent(order: CoincheckWsOrderResponse | CoincheckWsTradeResponse): boolean {
    // if the 0th array is the currently selected pair orderbook.
    return order[0] === DEFAULT_SELECTED_PAIR;
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
    const params = new HttpParams().set('limit', ORDER_HISTORY_RIMIT.toString());
    return this.apiService.get<CoincheckOrderResponse>(url, params).pipe(
      map((apiRes: CoincheckOrderResponse) => {
        // mapping to tuple from string array.
        const mappedBids: Array<Array<string>> = apiRes.bids.map((item: [number, string]) => [item[0].toString(), item[1]]);
        const mappedAsks: Array<Array<string>> = apiRes.asks.map((item: [number, string]) => [item[0].toString(), item[1]]);
        return [DEFAULT_SELECTED_PAIR, { bids: mappedBids, asks: mappedAsks }] as CoincheckWsOrderResponse;
      }),
      // fallback data is flowed when the REST API call fails.
      catchError((error) => of(this.getFailbackOrderbook())),
    );
  }

  private getFailbackOrderbook(): CoincheckWsOrderResponse {
    return [DEFAULT_SELECTED_PAIR, { bids: [['n/a', 'n/a']], asks: [['n/a', 'n/a']] }] as CoincheckWsOrderResponse;
  }
}
