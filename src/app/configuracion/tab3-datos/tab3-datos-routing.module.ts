import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Tab3DatosPage } from './tab3-datos.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3DatosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab3DatosPageRoutingModule {}
