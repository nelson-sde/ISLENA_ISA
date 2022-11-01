import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockoutsPage } from './stockouts.page';

const routes: Routes = [
  {
    path: '',
    component: StockoutsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockoutsPageRoutingModule {}
