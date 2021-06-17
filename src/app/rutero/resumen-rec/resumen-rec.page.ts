import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Cheque } from 'src/app/models/cheques';
import { Recibo } from 'src/app/models/cobro';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-resumen-rec',
  templateUrl: './resumen-rec.page.html',
  styleUrls: ['./resumen-rec.page.scss'],
})
export class ResumenRecPage {

  @Input() recibo: Recibo;

  constructor( private modalCtrl: ModalController,
               private isa: IsaService,
               private isaCobros: IsaCobrosService ) { }

  transmitirRecibo(){
    let hayCheque: boolean = false;
    let cheque: Cheque;

    if ( !this.recibo.envioExitoso && this.isa.transmitiendo.length === 0 ) {
      this.isa.transmitiendo.push(this.recibo.numeroRecibo);
      console.log('Retransmitiendo recibo');
      this.isa.addBitacora( true, 'START', `Retransmite Recibo: ${this.recibo.numeroRecibo}`);
      cheque = this.isaCobros.consultarCheque( this.recibo.numeroRecibo );
      if ( cheque !== undefined ){
        hayCheque = true;
      } else {
        cheque = new Cheque('', '', '', '', '', 0);
      }
      this.isaCobros.transmitirRecibo( this.recibo, cheque, hayCheque, false);
      this.regresar();
    } else {
      if ( this.isa.transmitiendo ){
        this.isa.presentAlertW('Retransmitir', 'No se puede transmitir el recibo.  Hay otro en proceso.  Por favor espere.');
      }
    }
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
