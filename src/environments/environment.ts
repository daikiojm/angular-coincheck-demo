// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  api: {
    endpoint: 'https://coincheck.com',
    ticker: '/api/ticker',
    trades: '/api/trades',
    orderBooks: '/api/order_books',
  },
  ws: {
    endpoint: 'wss://ws-api.coincheck.com/',
    orderbook: {
      type: 'subscribe',
      channel: 'btc_jpy-orderbook',
    },
    trades: {
      type: 'subscribe',
      channel: 'btc_jpy-trades',
    },
  },
};
