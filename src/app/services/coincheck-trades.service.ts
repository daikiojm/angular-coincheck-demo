import { Injectable, OnDestroy } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { map, flatMap, takeUntil, startWith, take, filter } from 'rxjs/operators';

import { WebsocketClientService } from './websocket-client.service';
import { ApiClientService } from './api-client.service';
import {
  CoincheckWsOrderResponse,
  CoincheckWsTradeResponse,
  CoincheckOrderResponse,
  CoincheckTradesResponse,
  CoincheckTrade,
  CoincheckWsMessage,
  CoincheckOrder,
} from '../models/coincheck.model';
import { environment } from '../../environments/environment';

const DEFAULT_SELECTED_PAIR = 'btc_jpy';
const FILTER_KEY_BIDS = 'bids';
const FILTER_KEY_ASKS = 'asks';
const TRADE_HISTORY_RIMIT = 20;

@Injectable()
export class CoincheckTradesService implements OnDestroy {
  private tradeHistory: CoincheckTrade[];
  private tradeHistory$: ReplaySubject<CoincheckTrade[]> = new ReplaySubject<CoincheckTrade[]>(1);

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private wsService: WebsocketClientService, private apiService: ApiClientService) {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  startSubscribe() {
    // setup web socket connection.
    const message: CoincheckWsMessage = { type: environment.ws.trades.type, channel: environment.ws.trades.channel };
    this.wsService.sendMessage(JSON.stringify(message));

    this.getInitialTrades()
      .pipe(
        flatMap((bulkTrades: CoincheckWsTradeResponse[]) => {
          return this.wsService.getConnectionObservable().pipe(
            map((trades: CoincheckWsTradeResponse) => [trades]),
            takeUntil(this.destroy$),
            startWith(bulkTrades),
            filter((trades: CoincheckWsOrderResponse | CoincheckWsTradeResponse[]) => {
              return this.isTradesEvent(trades);
            }),
          );
        })
      ).subscribe((event: CoincheckWsTradeResponse[]) => {
        const trade = this.adaptTradeType(event);
        this.tradeHistory = this.addTrade(this.tradeHistory, trade, TRADE_HISTORY_RIMIT);
        this.tradeHistory$.next(this.tradeHistory);
      });
  }

  getTradeHistory(): Observable<CoincheckTrade[]> {
    return this.tradeHistory$.asObservable();
  }

  private isTradesEvent(trades: CoincheckWsOrderResponse | CoincheckWsTradeResponse[]): boolean {
    // if the 0th array is the typeof number.
    return typeof trades[0][0] === 'number';
  }

  private addTrade(trade: CoincheckTrade[], newTrade: CoincheckTrade[], limit: number): CoincheckTrade[] {
    const resultTrade = newTrade.concat(trade);
    resultTrade.splice(limit);
    return resultTrade;
  }

  private adaptTradeType(tradeTupleArray: CoincheckWsTradeResponse[]): CoincheckTrade[] {
    const result = tradeTupleArray.map((tradeTuple: CoincheckWsTradeResponse) => {
      return {
        id: tradeTuple[0],
        amount: tradeTuple[3],
        rate: +tradeTuple[2],
        pair: tradeTuple[1],
        order_type: tradeTuple[4] as 'sell' | 'buy',
        created_at: null,
      };
    });
    return result;
  }

  private getInitialTrades(): Observable<CoincheckWsTradeResponse[]> {
    // const url = environment.api.endpoint + environment.api.trades;
    const url = environment.api.trades;
    const params = new HttpParams()
      .set('pair', DEFAULT_SELECTED_PAIR)
      .set('limit', TRADE_HISTORY_RIMIT.toString());
    return this.apiService.get<CoincheckTradesResponse>(url, params).pipe(
      map((apiRes: CoincheckTradesResponse) => {
        // mapping to tuple from string array.
        const result: CoincheckWsTradeResponse[] = apiRes.data.map((item: CoincheckTrade) => {
          return [item.id, item.pair,  item.rate, item.amount, item.order_type];
        }) as CoincheckWsTradeResponse[];
        return result;
      }),
    );
  }
}
