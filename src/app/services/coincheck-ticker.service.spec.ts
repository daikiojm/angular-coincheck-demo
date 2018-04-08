import { TestBed, inject } from '@angular/core/testing';

import { CoincheckTickerService } from './coincheck-ticker.service';

describe('CoincheckTickerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoincheckTickerService],
    });
  });

  it(
    'should be created',
    inject([CoincheckTickerService], (service: CoincheckTickerService) => {
      expect(service).toBeTruthy();
    }),
  );
});
