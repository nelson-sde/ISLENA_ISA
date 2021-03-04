import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Tab3ConfigPage } from './tab3-config.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3ConfigPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab3ConfigPageRoutingModule {}
