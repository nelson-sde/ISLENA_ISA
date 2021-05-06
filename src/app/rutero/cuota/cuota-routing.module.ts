import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CuotaPage } from './cuota.page';

const routes: Routes = [
  {
    path: '',
    component: CuotaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CuotaPageRoutingModule {}
