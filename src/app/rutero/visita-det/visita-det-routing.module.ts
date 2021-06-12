import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitaDetPage } from './visita-det.page';

const routes: Routes = [
  {
    path: '',
    component: VisitaDetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitaDetPageRoutingModule {}
