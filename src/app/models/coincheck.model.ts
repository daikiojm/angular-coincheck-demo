/**
 * interfaces for websocket and REST Api.
 */

export type CoincheckWsOrderResponse = [string, { [key: string]: Array<Array<string>> }];

export type CoincheckWsTradeResponse = [number, string, string, string, string];

export interface CoincheckOrderResponse {
  asks: Array<[number, string]>;
  bids: Array<[number, string]>;
}

export interface CoincheckWsMessage {
  type: string;
  channel: string;
}

export interface CoincheckOrder {
  rate: string;
  amount: string;
}

export interface CoincheckTicker {
  last: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  volume: string;
  timestamp: number;
}

export interface CoincheckTrade {
  id: number;
  amount: string;
  rate: number;
  pair: string;
  order_type: 'sell' | 'buy';
  created_at?: string;
}

export interface CoincheckTradesResponse {
  success: boolean;
  pagination: {
    limit: number;
    order: string;
    starting_after?: string;
    ending_before?: string;
  };
  data: CoincheckTrade[];
}

export interface CoincheckOrderRate {
  rate: number;
  price: number;
  amount: number;
}

export interface CoincheckOrderRateResponse extends CoincheckOrderRate {
  success: boolean;
}
