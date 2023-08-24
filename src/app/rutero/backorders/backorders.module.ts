import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BackordersPageRoutingModule } from './backorders-routing.module';

import { BackordersPage } from './backorders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BackordersPageRoutingModule
  ],
  declarations: [BackordersPage]
})
export class BackordersPageModule {}
