import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PenCobroPageRoutingModule } from './pen-cobro-routing.module';

import { PenCobroPage } from './pen-cobro.page';
import { ColonesPipe } from 'src/app/pipes/colones';
import { DifdiasPipe } from 'src/app/pipes/difdias';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PenCobroPageRoutingModule
  ],
  declarations: [PenCobroPage, ColonesPipe, DifdiasPipe]
})
export class PenCobroPageModule {}
