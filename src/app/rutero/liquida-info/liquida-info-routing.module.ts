import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LiquidaInfoPage } from './liquida-info.page';

const routes: Routes = [
  {
    path: '',
    component: LiquidaInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiquidaInfoPageRoutingModule {}
