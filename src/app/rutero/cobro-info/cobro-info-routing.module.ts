import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CobroInfoPage } from './cobro-info.page';

const routes: Routes = [
  {
    path: '',
    component: CobroInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CobroInfoPageRoutingModule {}
