import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LiquidaPageRoutingModule } from './liquida-routing.module';

import { LiquidaPage } from './liquida.page';
import { ColonesPipe } from 'src/app/pipes/colones';
import { ClientePipe } from 'src/app/pipes/cliente';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LiquidaPageRoutingModule
  ],
  declarations: [LiquidaPage, ColonesPipe, ClientePipe]
})
export class LiquidaPageModule {}
