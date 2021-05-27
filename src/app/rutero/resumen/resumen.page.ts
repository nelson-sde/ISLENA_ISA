import { Component } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Recibo } from 'src/app/models/cobro';
import { PedEnca, Pedido } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';
import { ResumenPedPage } from '../resumen-ped/resumen-ped.page';
import { ResumenRecPage } from '../resumen-rec/resumen-rec.page';

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

  refrescar(){
    this.totalPedidos = 0;
    this.totalRecibos = 0;
    this.cargarPedidos();
    this.cargarRecibos();
    this.total = this.totalPedidos;
    this.refrescarRojos();
  }

  refrescarRojos(){
    if (this.pedidos.length > 0){
      for (let i = 0; i < this.pedidos.length; i++) {
        if (!this.pedidos[i].envioExitoso){
          this.buscarPedido(i);
        }
      }
    }
  }

  buscarPedido( i: number ){
    let pedidoBD: PedEnca;

    this.isa.getPedido( this.pedidos[i].numPedido ).subscribe(
      resp => {
        console.log('Pedido', resp );
        pedidoBD = resp;
        if ( this.pedidos[i].codCliente === pedidoBD.COD_CLT ){
          this.pedidos[i].envioExitoso = true;
          console.log('Pedido Encontrado');
        } else {
          console.log('Pedido no en BD');
        }
      }, error => {
        console.log('Error conexión: ', error.message);
      }
    );
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
    if (localStorage.getItem('pedidos')){
      this.pedidos = JSON.parse( localStorage.getItem('pedidos'));
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

  async abrirDetallePedido( i: number ){
    const modal = await this.modalCtrl.create({
      component: ResumenPedPage,
      componentProps: {
        'pedido': this.pedidos[i]
      },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async abrirDetalleRecibo( i: number ){
    const modal = await this.modalCtrl.create({
      component: ResumenRecPage,
      componentProps: {
        'recibo': this.recibos[i]
      },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  regresar(){
    this.navController.back();
  }


}
