import { Component } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Pedido } from 'src/app/models/pedido';
import { ResumenPedPage } from '../resumen-ped/resumen-ped.page';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
})
export class ResumenPage {

  pedidos: Pedido[] = [];
  mostrarPedidos: boolean = true;
  mostrarRecibos: boolean = false;
  mostrarDevol: boolean = false;

  constructor( private navController: NavController,
               private modalCtrl: ModalController ) {
    this.cargarPedidos();
  }

  segmentChanged(ev: any) {
    if (ev.detail.value == 'Pedidos'){
      this.mostrarPedidos = true;
      this.mostrarDevol = false;
      this.mostrarRecibos = false;
    } else if (ev.detail.value == 'Recibos'){
      this.mostrarPedidos = false;
      this.mostrarDevol = false;
      this.mostrarRecibos = true;
    } else {
      this.mostrarPedidos = false;
      this.mostrarDevol = true;
      this.mostrarRecibos = false;
    }
    console.log('Segment changed', ev);
  }

  cargarPedidos(){
    if (localStorage.getItem('pedidos')){
      this.pedidos = JSON.parse( localStorage.getItem('pedidos'));
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
