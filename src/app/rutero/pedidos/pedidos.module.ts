import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidosPageRoutingModule } from './pedidos-routing.module';

import { PedidosPage } from './pedidos.page';
import { NoimagePipe } from 'src/app/pipes/noimage';
import { ColonesPipe } from 'src/app/pipes/colones';
import { CambiaBoolPipe } from 'src/app/pipes/cambia-bool';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PedidosPageRoutingModule
  ],
  declarations: [PedidosPage, NoimagePipe, ColonesPipe, CambiaBoolPipe]
})
export class PedidosPageModule {}
