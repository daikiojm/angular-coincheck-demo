import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
import { filter } from 'rxjs/operators';

@Injectable()
export class WebsocketClientService {
  private socket$: WebSocketSubject<any>;

  constructor() {}

  createConnection(url: string) {
    this.socket$ = WebSocketSubject.create(url);
  }

  closeConnection() {
    this.socket$.complete();
  }

  sendMessage(message): void {
    this.socket$.next(message);
  }

  getConnectionObservable(): Observable<any> {
    if (this.socket$) {
      return this.socket$.asObservable();
    }
  }
}
