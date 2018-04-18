import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';

import { CoincheckTickerService } from './services/coincheck-ticker.service';
import { CoincheckTradesService } from './services/coincheck-trades.service';
import { CoincheckOrderbookService } from './services/coincheck-orderbook.service';
import { ApiClientService } from './services/api-client.service';
import { WebsocketClientService } from './services/websocket-client.service';

import { AppComponent } from './app.component';
import { OrderbookComponent } from './components/orderbook/orderbook.component';
import { TradesComponent } from './components/trades/trades.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

@NgModule({
  declarations: [AppComponent, OrderbookComponent, TradesComponent, ToolbarComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, MaterialModule],
  providers: [ApiClientService, WebsocketClientService, CoincheckTickerService, CoincheckTradesService, CoincheckOrderbookService],
  bootstrap: [AppComponent],
})
export class AppModule {}
