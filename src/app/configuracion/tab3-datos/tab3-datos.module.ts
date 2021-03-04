import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab3DatosPageRoutingModule } from './tab3-datos-routing.module';

import { Tab3DatosPage } from './tab3-datos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab3DatosPageRoutingModule
  ],
  declarations: [Tab3DatosPage]
})
export class Tab3DatosPageModule {}
