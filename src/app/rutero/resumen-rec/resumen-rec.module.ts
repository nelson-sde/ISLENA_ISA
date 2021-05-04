import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResumenRecPageRoutingModule } from './resumen-rec-routing.module';

import { ResumenRecPage } from './resumen-rec.page';
import { ColonesPipe } from 'src/app/pipes/colones';
import { ClientePipe } from 'src/app/pipes/cliente';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResumenRecPageRoutingModule
  ],
  declarations: [ResumenRecPage, ColonesPipe, ClientePipe]
})
export class ResumenRecPageModule {}
