import { TestBed, inject } from '@angular/core/testing';

import { CoincheckTradesService } from './coincheck-trades.service';

describe('CoincheckTradesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoincheckTradesService]
    });
  });

  it('should be created', inject([CoincheckTradesService], (service: CoincheckTradesService) => {
    expect(service).toBeTruthy();
  }));
});
