import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Pedido } from 'src/app/models/pedido';
import { IsaPedidoService } from 'src/app/services/isa-pedido.service';

@Component({
  selector: 'app-resumen-ped',
  templateUrl: './resumen-ped.page.html',
  styleUrls: ['./resumen-ped.page.scss'],
})
export class ResumenPedPage {

  @Input() pedido: Pedido;

  constructor( private modalCtrl: ModalController,
               private isaPedidos: IsaPedidoService ) { }

  transmitirPedido(){
    if ( !this.pedido.envioExitoso ) {
      this.isaPedidos.validaPedido( this.pedido, 'R' );
    }
  }

  regresar(){
    this.modalCtrl.dismiss();
  }
}
