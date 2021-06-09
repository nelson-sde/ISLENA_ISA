import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CardexPageRoutingModule } from './cardex-routing.module';
import { ColonesPipe } from 'src/app/pipes/colones';

import { CardexPage } from './cardex.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardexPageRoutingModule
  ],
  declarations: [CardexPage, ColonesPipe]
})
export class CardexPageModule {}
