import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResumenDevPageRoutingModule } from './resumen-dev-routing.module';

import { ResumenDevPage } from './resumen-dev.page';
import { ColonesPipe } from '../../pipes/colones';
import { ClientePipe } from '../../pipes/cliente';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResumenDevPageRoutingModule
  ],
  declarations: [ResumenDevPage, ColonesPipe, ClientePipe]
})
export class ResumenDevPageModule {}
