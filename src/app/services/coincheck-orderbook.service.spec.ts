import { TestBed, inject } from '@angular/core/testing';

import { CoincheckOrderbookService } from './coincheck-orderbook.service';

describe('CoincheckOrderbookService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoincheckOrderbookService]
    });
  });

  it('should be created', inject([CoincheckOrderbookService], (service: CoincheckOrderbookService) => {
    expect(service).toBeTruthy();
  }));
});
