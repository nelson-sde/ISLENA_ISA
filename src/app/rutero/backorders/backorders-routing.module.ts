import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BackordersPage } from './backorders.page';

const routes: Routes = [
  {
    path: '',
    component: BackordersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackordersPageRoutingModule {}
