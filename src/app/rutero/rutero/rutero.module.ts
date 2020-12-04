import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RuteroPageRoutingModule } from './rutero-routing.module';

import { RuteroPage } from './rutero.page';
import { IsaService } from 'src/app/services/isa.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RuteroPageRoutingModule,
  ],
  declarations: [RuteroPage]
})
export class RuteroPageModule {}
