import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';

@Injectable()
export class WebsocketClientService {
  private socket$: WebSocketSubject<any>;

  constructor() {}

  createConnection(url: string, message: string) {
    this.socket$ = WebSocketSubject.create(url);
    this.socket$.next(message);
  }

  getConnectionObservable(): Observable<any> {
    if (this.socket$) {
      return this.socket$.asObservable();
    }
  }
}
