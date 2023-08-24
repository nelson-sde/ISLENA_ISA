import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PedWhatsappPage } from './ped-whatsapp.page';

const routes: Routes = [
  {
    path: '',
    component: PedWhatsappPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PedWhatsappPageRoutingModule {}
