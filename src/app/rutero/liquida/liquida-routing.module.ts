import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LiquidaPage } from './liquida.page';

const routes: Routes = [
  {
    path: '',
    component: LiquidaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiquidaPageRoutingModule {}
