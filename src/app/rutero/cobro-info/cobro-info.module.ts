import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CobroInfoPageRoutingModule } from './cobro-info-routing.module';

import { CobroInfoPage } from './cobro-info.page';
import { ColonesPipe } from 'src/app/pipes/colones';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CobroInfoPageRoutingModule
  ],
  declarations: [CobroInfoPage, ColonesPipe]
})
export class CobroInfoPageModule {}
