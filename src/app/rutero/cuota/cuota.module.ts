import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CuotaPageRoutingModule } from './cuota-routing.module';

import { CuotaPage } from './cuota.page';
import { ColonesPipe } from 'src/app/pipes/colones';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CuotaPageRoutingModule
  ],
  declarations: [CuotaPage, ColonesPipe]
})
export class CuotaPageModule {}
