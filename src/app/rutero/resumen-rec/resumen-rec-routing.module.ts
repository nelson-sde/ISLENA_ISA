import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResumenRecPage } from './resumen-rec.page';

const routes: Routes = [
  {
    path: '',
    component: ResumenRecPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResumenRecPageRoutingModule {}
