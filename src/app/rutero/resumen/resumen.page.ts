import { Component } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Recibo } from 'src/app/models/cobro';
import { Pedido } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';
import { ResumenPedPage } from '../resumen-ped/resumen-ped.page';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
})
export class ResumenPage {

  pedidos: Pedido[] = [];
  recibos: Recibo[] = [];
  total: number = 0;
  totalPedidos: number = 0;
  totalRecibos: number = 0;
  mostrarPedidos: boolean = true;
  mostrarRecibos: boolean = false;
  mostrarDevol: boolean = false;
  mostrarBitacora: boolean = false;

  constructor( private navController: NavController,
               private modalCtrl: ModalController,
               private isa: IsaService ) {
    this.cargarPedidos();
    this.cargarRecibos();
    this.total = this.totalPedidos;
  }

  segmentChanged(ev: any) {
    if (ev.detail.value == 'Pedidos'){
      this.total = this.totalPedidos;
      this.mostrarPedidos = true;
      this.mostrarDevol = false;
      this.mostrarRecibos = false;
      this.mostrarBitacora = false;
    } else if (ev.detail.value == 'Recibos'){
      this.total = this.totalRecibos;
      this.mostrarPedidos = false;
      this.mostrarDevol = false;
      this.mostrarRecibos = true;
      this.mostrarBitacora = false;
    } else if (ev.detail.value == 'Devoluciones'){
      this.total = 0;
      this.mostrarPedidos = false;
      this.mostrarDevol = true;
      this.mostrarRecibos = false;
      this.mostrarBitacora = false;
    } else if (ev.detail.value == 'Bitacora'){ 
      this.total = 0;
      this.mostrarPedidos = false;
      this.mostrarDevol = false;
      this.mostrarRecibos = false;
      this.mostrarBitacora = true;
    }
    console.log('Segment changed', ev);
  }

  cargarPedidos(){
    let pedidos: Pedido[] = [];
    const hoy: Date = new Date();

    if (localStorage.getItem('pedidos')){
      pedidos = JSON.parse( localStorage.getItem('pedidos'));
      this.pedidos = pedidos.filter( d => new Date(d.fecha).getDate() === new Date(hoy).getDate() );
      if (this.pedidos){
        this.pedidos.forEach(e => {
          this.totalPedidos += e.total;
        });
      }
    }
  }

  cargarRecibos(){
    if (localStorage.getItem('recibos')){
      this.recibos = JSON.parse( localStorage.getItem('recibos'));
      this.recibos.forEach(e => {
        this.totalRecibos += e.montoLocal;
      });
    }
  }

  async abrirDetalle( i: number ){
    const modal = await this.modalCtrl.create({
    component: ResumenPedPage,
    componentProps: {
      'pedido': this.pedidos[i]
    },
    cssClass: 'my-custom-class'
  });
  return await modal.present();
}

  regresar(){
    this.navController.back();
  }


}
