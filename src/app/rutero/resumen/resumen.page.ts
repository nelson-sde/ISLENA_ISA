import { Component } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Recibo } from 'src/app/models/cobro';
import { PedEnca, Pedido } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';
import { ResumenPedPage } from '../resumen-ped/resumen-ped.page';
import { ResumenRecPage } from '../resumen-rec/resumen-rec.page';
import { Devolucion } from '../../models/devolucion';
import { ResumenDevPage } from '../resumen-dev/resumen-dev.page';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
})
export class ResumenPage {

  pedidos:        Pedido[] = [];
  recibos:        Recibo[] = [];
  devoluciones:   Devolucion[] = [];
  total:          number = 0;
  totalPedidos:   number = 0;
  totalRecibos:   number = 0;
  totalDev:       number = 0;
  mostrarPedidos: boolean = true;
  mostrarRecibos: boolean = false;
  mostrarDev:   boolean = false;
  mostrarBitacora: boolean = false;

  constructor( private navController: NavController,
               private modalCtrl: ModalController,
               private isa: IsaService ) {
    this.cargarPedidos();
    this.cargarRecibos();
    this.cargarDev();
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
    if (this.pedidos.length > 0){        // Filtra los pedidos sin transmitir
      for (let i = 0; i < this.pedidos.length; i++) {
        if (!this.pedidos[i].envioExitoso){
          this.buscarPedidos(i);         // Valida si están en la BD
        }
      }
    }
    if (this.recibos.length > 0){       // Filtra los recibos sin TR
      for (let i = 0; i < this.recibos.length; i++) {
        if (!this.recibos[i].envioExitoso){
          this.buscarRecibos(i);         // Valida si están en la BD
        }
      }
    }
  }

  buscarPedidos( i: number ){      // Busca en la BD si el pedido "i" fue transmitido o no.  Si fue TR lo marca como true en EnvíoExitoso
    this.isa.getDetPedido( this.pedidos[i].numPedido ).subscribe(
      resp => {
        console.log('Pedido', resp );
        if (resp.length > 0){
          this.pedidos[i].envioExitoso = true;
          localStorage.setItem( 'pedidos', JSON.stringify(this.pedidos));
          console.log('Pedido Encontrado');
        } else {
          console.log('Pedido no en BD');
          this.isa.presentAlertW('Pedido', `El pedido ${this.pedidos[i].numPedido} no está en la BD.  Por favor retransmita.`);
        }
      }, error => {
        console.log('Error conexión: ', error.message);
      }
    );
  }

  buscarRecibos( i: number ){      // Busca en la BD si el recibo "i" fue transmitido o no.  Si fue TR lo marca como true en EnvíoExitoso
    this.isa.getRecibo( this.recibos[i].numeroRecibo ).subscribe(
      resp => {
        console.log('Recibo: ', resp );
        if (resp.length > 0){
          const existe = resp.findIndex( d => d.coD_CLT === this.recibos[i].codCliente);
          if ( existe >= 0 ){
            this.recibos[i].envioExitoso = true;
            localStorage.setItem( 'recibos', JSON.stringify(this.recibos));
            console.log('Recibo Encontrado');
          } else {
            console.log('El recibo no corresponde con el cliente...');
          }
        } else {
          console.log('Recibo no en BD');
          this.isa.presentAlertW('Recibo', `El recibo ${this.recibos[i].numeroRecibo} no está en la BD.  Por favor retransmita.`);
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
      this.mostrarDev = false;
      this.mostrarRecibos = false;
      this.mostrarBitacora = false;
    } else if (ev.detail.value == 'Recibos'){
      this.total = this.totalRecibos;
      this.mostrarPedidos = false;
      this.mostrarDev = false;
      this.mostrarRecibos = true;
      this.mostrarBitacora = false;
    } else if (ev.detail.value == 'Devoluciones'){
      this.total = this.totalDev;
      this.mostrarPedidos = false;
      this.mostrarDev = true;
      this.mostrarRecibos = false;
      this.mostrarBitacora = false;
    } else if (ev.detail.value == 'Bitacora'){ 
      this.total = 0;
      this.mostrarPedidos = false;
      this.mostrarDev = false;
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

  cargarDev(){
    if (localStorage.getItem('ISADev')){
      this.devoluciones = JSON.parse( localStorage.getItem('ISADev'));
      this.devoluciones.forEach(e => {
        this.totalDev += e.montoSinIVA;
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

  async abrirDetalleDev( i: number ){
    const modal = await this.modalCtrl.create({
      component: ResumenDevPage,
      componentProps: {
        'devolucion': this.devoluciones[i]
      },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  regresar(){
    this.navController.back();
  }


}
