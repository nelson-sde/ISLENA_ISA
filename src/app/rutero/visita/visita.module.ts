import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitaPageRoutingModule } from './visita-routing.module';

import { VisitaPage } from './visita.page';
import { ClientePipe } from 'src/app/pipes/cliente';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitaPageRoutingModule
  ],
  declarations: [VisitaPage, ClientePipe]
})
export class VisitaPageModule {}
