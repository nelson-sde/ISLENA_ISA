import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClienteInfoPageRoutingModule } from './cliente-info-routing.module';

import { ClienteInfoPage } from './cliente-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClienteInfoPageRoutingModule
  ],
  declarations: [ClienteInfoPage]
})
export class ClienteInfoPageModule {}
