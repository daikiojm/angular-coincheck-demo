import { TestBed, inject } from '@angular/core/testing';

import { WebsocketClientService } from './websocket-client.service';

describe('WebsocketClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebsocketClientService]
    });
  });

  it('should be created', inject([WebsocketClientService], (service: WebsocketClientService) => {
    expect(service).toBeTruthy();
  }));
});
