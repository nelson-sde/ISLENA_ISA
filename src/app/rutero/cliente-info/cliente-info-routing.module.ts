import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClienteInfoPage } from './cliente-info.page';

const routes: Routes = [
  {
    path: '',
    component: ClienteInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClienteInfoPageRoutingModule {}
