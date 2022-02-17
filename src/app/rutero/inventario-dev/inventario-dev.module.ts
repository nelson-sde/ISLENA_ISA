import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventarioDevPageRoutingModule } from './inventario-dev-routing.module';

import { InventarioDevPage } from './inventario-dev.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventarioDevPageRoutingModule
  ],
  declarations: [InventarioDevPage]
})
export class InventarioDevPageModule {}
