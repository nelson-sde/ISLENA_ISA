import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'rutero',
    loadChildren: () => import('./rutero/rutero/rutero.module').then( m => m.RuteroPageModule)
  },
  {
    path: 'clientes/:value',
    loadChildren: () => import('./rutero/clientes/clientes.module').then( m => m.ClientesPageModule)
  },
  {
    path: 'pedidos',
    loadChildren: () => import('./rutero/pedidos/pedidos.module').then( m => m.PedidosPageModule)
  },
  {
    path: 'tab3-config',
    loadChildren: () => import('./tab3-config/tab3-config.module').then( m => m.Tab3ConfigPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
