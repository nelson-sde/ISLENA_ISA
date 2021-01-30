import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResumenPedPageRoutingModule } from './resumen-ped-routing.module';

import { ResumenPedPage } from './resumen-ped.page';
import { ColonesPipe } from 'src/app/pipes/colones';
import { ClientePipe } from "src/app/pipes/cliente";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResumenPedPageRoutingModule
  ],
  declarations: [ResumenPedPage, ColonesPipe, ClientePipe]
})
export class ResumenPedPageModule {}
