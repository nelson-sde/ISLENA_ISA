import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedWhatsappPageRoutingModule } from './ped-whatsapp-routing.module';

import { PedWhatsappPage } from './ped-whatsapp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PedWhatsappPageRoutingModule
  ],
  declarations: [PedWhatsappPage]
})
export class PedWhatsappPageModule {}
