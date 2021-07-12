import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LiquidaInfoPageRoutingModule } from './liquida-info-routing.module';

import { LiquidaInfoPage } from './liquida-info.page';
import { ColonesPipe } from 'src/app/pipes/colones';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LiquidaInfoPageRoutingModule
  ],
  declarations: [LiquidaInfoPage, ColonesPipe]
})
export class LiquidaInfoPageModule {}
