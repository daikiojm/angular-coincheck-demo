import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule, MatIconModule } from '@angular/material';

const modules = [MatButtonModule, MatCardModule, MatIconModule];

@NgModule({
  imports: [...modules],
  exports: [...modules],
  providers: [],
})
export class MaterialModule {}
