import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResumenPedPage } from './resumen-ped.page';

const routes: Routes = [
  {
    path: '',
    component: ResumenPedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResumenPedPageRoutingModule {}
