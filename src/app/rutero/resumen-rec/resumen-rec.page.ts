import { Component, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Cheque } from 'src/app/models/cheques';
import { Recibo } from 'src/app/models/cobro';
import { Email } from 'src/app/models/email';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-resumen-rec',
  templateUrl: './resumen-rec.page.html',
  styleUrls: ['./resumen-rec.page.scss'],
})
export class ResumenRecPage {

  @Input() recibo: Recibo;

  reciboAnulado: Recibo;

  constructor( private modalCtrl: ModalController,
               private alertCtrl: AlertController,
               private isa: IsaService,
               private isaCobros: IsaCobrosService ) { }

  transmitirRecibo(){
    let recibos: Recibo[] = [];
    let reciboTemp: Recibo;

    if ( !this.recibo.envioExitoso ) {
      if ( this.recibo.tipoDoc === 'R' ) { 
        this.isa.transmitiendo.push(this.recibo.numeroRecibo);
        console.log('Retransmitiendo recibo');
        this.isaCobros.retransmitirRecibo( this.recibo );
      } else if ( this.recibo.tipoDoc === 'T' ) {
        console.log('Retransmitiendo Transferencia');
        this.isaCobros.reciboSimple( this.recibo, false );
      } else {
        const idRecibo = this.recibo.numeroRecibo.slice( 0, 4 ) + 'R' + this.recibo.numeroRecibo.slice(5);
        console.log('Retransmitiendo Recibo Anulado: ', idRecibo);
        if (localStorage.getItem('recibos')){
          recibos = JSON.parse(localStorage.getItem('recibos'));
          reciboTemp = recibos.find( d => d.numeroRecibo === idRecibo );
          if ( reciboTemp !== undefined ){
            this.isaCobros.anularRecibo( reciboTemp, this.recibo );
          } else {
            this.isa.presentAlertW('Retransmitir', 'Recibo no encontrado...');
          }
        } else {
          this.isa.presentAlertW('Retransmitir', 'Recibo no encontrado...');
        }
      }
      this.regresar();
    } else {
      if ( this.isa.transmitiendo ){
        this.isa.presentAlertW('Retransmitir', 'No se puede transmitir el recibo.  Hay otro en proceso.  Por favor espere.');
      }
    }
  }

  async anularRecibo(){
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Anular Recibo',
      message: `Desea anular el recibo ${this.recibo.numeroRecibo}.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Si',
          handler: () => {
            const idRecibo = this.recibo.numeroRecibo.slice( 0, 4 ) + 'A' + this.recibo.numeroRecibo.slice(5);
            this.reciboAnulado = new Recibo( this.isa.varConfig.numRuta, this.recibo.codCliente, idRecibo, -1 * this.recibo.montoDolar, 
                                            -1 * this.recibo.montoLocal, -1 * this.recibo.montoEfectivoL, -1 * this.recibo.montoEfectivoD,
                                            -1 * this.recibo.montoChequeL, -1 * this.recibo.montoChequeD, 0, 0, 0, 0, this.recibo.observaciones, this.recibo.moneda );
            this.reciboAnulado.tipoDoc = 'A';   // Crea el recibo que anula en reciboAnulado
            this.recibo.anulado = true;        // Anula el recibo
            this.isaCobros.guardarRecibo( this.reciboAnulado );      // Guarda ambos recibos en el LS
            this.isaCobros.guardarRecibo( this.recibo );
            this.isaCobros.anularRecibo( this.recibo, this.reciboAnulado );      // Ejecuta el Post en la BD insertando el reciboAnulado en la tabla ISA_Liquidacion
            this.regresar();
          }
        }
      ]
    });
    await alert.present();
  }

  reenviarEmail(){
    let hayCheque: boolean = false;
    let cheque: Cheque;
    let subject: string = '';
    const cliente = this.isa.clientes.find( d => d.id === this.recibo.codCliente );
    
    this.isa.addBitacora( true, 'START', `Reenvía Emial de Recibo: ${this.recibo.numeroRecibo}`);
    cheque = this.isaCobros.consultarCheque( this.recibo.numeroRecibo );
    if ( cheque !== undefined ){
      hayCheque = true;
    } else {
      cheque = new Cheque('', '', '', '', '', 0);
    }
    const email = new Email( cliente.email, subject, this.isaCobros.getBody( this.recibo, cheque, cliente.nombre) );

    if ( this.recibo.tipoDoc === 'R' ){
      subject = `RECIBO DE DINERO ${this.recibo.numeroRecibo}`, this.isaCobros.getBody(this.recibo, cheque, cliente.nombre);
    } else {
      subject = `NOTIFICACION POR COBRO DE DINERO RUTA: ${this.recibo.numeroRuta}`, this.isaCobros.getBody(this.recibo, cheque, cliente.nombre, false);
    }
    email.subject = subject;
    this.isa.enviarEmail( email );
    email.toEmail = this.isa.varConfig.emailVendedor;
    this.isa.enviarEmail( email );
    email.toEmail = this.isa.varConfig.emailCxC;
    this.isa.enviarEmail( email );
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
