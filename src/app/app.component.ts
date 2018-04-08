import { Component, OnInit } from '@angular/core';

import { WebsocketClientService } from './services/websocket-client.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private websocketClientService: WebsocketClientService) {}

  ngOnInit() {
    const wsEndpoint = environment.ws.endpoint;
    this.websocketClientService.createConnection(wsEndpoint);
  }
}
