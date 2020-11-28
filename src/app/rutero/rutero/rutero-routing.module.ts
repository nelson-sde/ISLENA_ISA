import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RuteroPage } from './rutero.page';

const routes: Routes = [
  {
    path: '',
    component: RuteroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RuteroPageRoutingModule {}
