import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockoutsPageRoutingModule } from './stockouts-routing.module';

import { StockoutsPage } from './stockouts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockoutsPageRoutingModule
  ],
  declarations: [StockoutsPage]
})
export class StockoutsPageModule {}
