import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventarioDevPage } from './inventario-dev.page';

const routes: Routes = [
  {
    path: '',
    component: InventarioDevPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventarioDevPageRoutingModule {}
