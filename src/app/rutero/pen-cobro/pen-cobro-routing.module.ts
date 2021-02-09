import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PenCobroPage } from './pen-cobro.page';

const routes: Routes = [
  {
    path: '',
    component: PenCobroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PenCobroPageRoutingModule {}
