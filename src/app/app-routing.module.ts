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
    loadChildren: () => import('./configuracion/tab3-config/tab3-config.module').then( m => m.Tab3ConfigPageModule)
  },
  {
    path: 'inventario',
    loadChildren: () => import('./rutero/inventario/inventario.module').then( m => m.InventarioPageModule)
  },
  {
    path: 'cardex',
    loadChildren: () => import('./rutero/cardex/cardex.module').then( m => m.CardexPageModule)
  },
  {
    path: 'tab3-pop',
    loadChildren: () => import('./configuracion/tab3-pop/tab3-pop.module').then( m => m.Tab3PopPageModule)
  },
  {
    path: 'productos',
    loadChildren: () => import('./rutero/productos/productos.module').then( m => m.ProductosPageModule)
  },
  {
    path: 'resumen',
    loadChildren: () => import('./rutero/resumen/resumen.module').then( m => m.ResumenPageModule)
  },
  {
    path: 'resumen-ped',
    loadChildren: () => import('./rutero/resumen-ped/resumen-ped.module').then( m => m.ResumenPedPageModule)
  },
  {
    path: 'pen-cobro',
    loadChildren: () => import('./rutero/pen-cobro/pen-cobro.module').then( m => m.PenCobroPageModule)
  },
  {
    path: 'recibos',
    loadChildren: () => import('./rutero/recibos/recibos.module').then( m => m.RecibosPageModule)
  },
  {
    path: 'facturas',
    loadChildren: () => import('./rutero/facturas/facturas.module').then( m => m.FacturasPageModule)
  },
  {
    path: 'tab3-datos',
    loadChildren: () => import('./configuracion/tab3-datos/tab3-datos.module').then( m => m.Tab3DatosPageModule)
  },
  {
    path: 'cliente-info',
    loadChildren: () => import('./rutero/cliente-info/cliente-info.module').then( m => m.ClienteInfoPageModule)
  },
  {
    path: 'cobro-info',
    loadChildren: () => import('./rutero/cobro-info/cobro-info.module').then( m => m.CobroInfoPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./configuracion/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'resumen-rec',
    loadChildren: () => import('./rutero/resumen-rec/resumen-rec.module').then( m => m.ResumenRecPageModule)
  },
  {
    path: 'cuota',
    loadChildren: () => import('./rutero/cuota/cuota.module').then( m => m.CuotaPageModule)
  },
  {
    path: 'visita',
    loadChildren: () => import('./rutero/visita/visita.module').then( m => m.VisitaPageModule)
  },
  {
    path: 'visita-det',
    loadChildren: () => import('./rutero/visita-det/visita-det.module').then( m => m.VisitaDetPageModule)
  },
  {
    path: 'liquida',
    loadChildren: () => import('./rutero/liquida/liquida.module').then( m => m.LiquidaPageModule)
  },
  {
    path: 'liquida-info',
    loadChildren: () => import('./rutero/liquida-info/liquida-info.module').then( m => m.LiquidaInfoPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
