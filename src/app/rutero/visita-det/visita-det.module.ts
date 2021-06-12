import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitaDetPageRoutingModule } from './visita-det-routing.module';

import { VisitaDetPage } from './visita-det.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitaDetPageRoutingModule
  ],
  declarations: [VisitaDetPage]
})
export class VisitaDetPageModule {}
