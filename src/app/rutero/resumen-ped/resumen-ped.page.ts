import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Pedido } from 'src/app/models/pedido';
import { IsaPedidoService } from 'src/app/services/isa-pedido.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-resumen-ped',
  templateUrl: './resumen-ped.page.html',
  styleUrls: ['./resumen-ped.page.scss'],
})
export class ResumenPedPage {

  @Input() pedido: Pedido;

  constructor( private modalCtrl: ModalController,
               private isaPedidos: IsaPedidoService,
               private isa: IsaService ){}


  transmitirPedido(){

    if ( !this.pedido.envioExitoso && this.isa.transmitiendo.length === 0 ) {
      this.isa.transmitiendo.push(this.pedido.numPedido);
      console.log('Retransmitiendo pedido');
      this.isa.addBitacora( true, 'START', `Retransmite Pedido: ${this.pedido.numPedido}`);
      this.isaPedidos.transmitirPedTemp( this.pedido, 'R' );
      this.regresar();
    } else {
      if ( this.isa.transmitiendo ){
        this.isa.presentAlertW('Retransmitir', 'No se puede transmitir el pedido.  Hay otro en proceso.  Por favor espere.');
      }
    }
  }

  regresar(){
    this.modalCtrl.dismiss();
  }
}
