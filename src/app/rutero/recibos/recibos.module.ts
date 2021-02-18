import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecibosPageRoutingModule } from './recibos-routing.module';

import { RecibosPage } from './recibos.page';
import { ColonesPipe } from 'src/app/pipes/colones';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecibosPageRoutingModule
  ],
  declarations: [RecibosPage, ColonesPipe]
})
export class RecibosPageModule {}
