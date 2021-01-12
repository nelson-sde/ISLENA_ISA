import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Tab3PopPage } from './tab3-pop.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3PopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab3PopPageRoutingModule {}
