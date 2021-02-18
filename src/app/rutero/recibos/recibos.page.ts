import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Det_Recibo, Pen_Cobro, Recibo } from 'src/app/models/cobro';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-recibos',
  templateUrl: './recibos.page.html',
  styleUrls: ['./recibos.page.scss'],
})
export class RecibosPage {

  docsPagar: Pen_Cobro[] = [];
  recibo: Recibo;
  tipoCambio: number = 1;
  reciboSinSalvar: boolean = false;
  monto: number = 0;
  abono: number = 0;
  saldo: number = 0;

  constructor( private isa: IsaService,
               private isaCobros: IsaCobrosService,
               private navController: NavController,
               private alertController: AlertController ) {
    
    let det: Det_Recibo;

    this.recibo = new Recibo( isa.varConfig.numRuta, isa.clienteAct.id, isa.varConfig.consecutivoRecibos, new Date(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
    this.docsPagar = this.isaCobros.cxc.filter( d => d.pago );
    if ( this.docsPagar.length > 0 ){
      this.docsPagar.forEach( e => {
        this.recibo.montoLocal = this.recibo.montoLocal + e.saldoLocal;
        this.recibo.montoDolar = this.recibo.montoDolar + e.saldoDolar;
        det = new Det_Recibo( '1', e.numeroDocumen, e.fechaDoc, 0, 0, e.montoDolar, e.montoLocal, e.saldoLocal, e.saldoDolar );
        this.recibo.detalle.push(det);
      });
      this.reciboSinSalvar = true;
      this.recibo.montoEfectivoL = this.recibo.montoLocal;
      this.recibo.montoEfectivoD = this.recibo.montoDolar;
      this.tipoCambio = this.recibo.montoLocal / this.recibo.montoDolar;
      this.monto = this.recibo.montoLocal;
      this.abono = this.recibo.montoLocal;
    }
  }

  async modificarAbono( i: number){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Abono!',
      inputs: [
        {
          name: 'abono',
          type: 'number',
          placeholder: 'Abono',
          value: this.recibo.detalle[i].abonoLocal,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (d) => {
            if ( +d.abono > 0 && +d.abono <= this.recibo.detalle[i].abonoLocal ){
              const montoAntLocal = this.recibo.detalle[i].abonoLocal;
              const montoAntDolar = this.recibo.detalle[i].abonoDolar;
              this.recibo.detalle[i].abonoLocal = +d.abono;
              this.recibo.detalle[i].abonoDolar = +d.abono / this.tipoCambio;
              this.recibo.detalle[i].saldoLocal = this.recibo.detalle[i].montoLocal - this.recibo.detalle[i].abonoLocal;
              this.recibo.detalle[i].saldoDolar = this.recibo.detalle[i].montoDolar - this.recibo.detalle[i].abonoDolar;
              this.recibo.montoLocal = this.recibo.montoLocal - montoAntLocal + +d.abono;
              this.recibo.montoDolar = this.recibo.montoDolar - montoAntDolar + this.recibo.detalle[i].abonoDolar;
              this.saldo = this.saldo + montoAntLocal - +d.abono;
              this.recibo.montoEfectivoL = this.recibo.montoLocal;
              this.recibo.montoEfectivoD = this.recibo.montoDolar;
              this.recibo.montoChequeL = 0;
              this.recibo.montoChequeD = 0;
              this.recibo.montoTarjetaL = 0;
              this.recibo.montoTarjetaD = 0;
              this.recibo.montoDepositoL = 0;
              this.recibo.montoDepositoD = 0;
            }
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  async modificarRecibo(){
    let efectivo: string = '';
    let cheque: string = '';
    let tarjeta: string = '';
    let deposito: string = '';

    if ( this.recibo.montoEfectivoL > 0 ){
      efectivo = this.recibo.montoEfectivoL.toString();
    }
    if ( this.recibo.montoChequeL > 0 ){
      cheque = this.recibo.montoChequeL.toString();
    }
    if ( this.recibo.montoTarjetaL > 0 ){
      tarjeta = this.recibo.montoTarjetaL.toString();
    }
    if ( this.recibo.montoDepositoL > 0 ){
      deposito = this.recibo.montoDepositoL.toString();
    }
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Forma Pago!',
      inputs: [
        {
          name: 'efectivo',
          type: 'number',
          placeholder: 'Efectivo',
          value: efectivo,
        },
        {
          name: 'cheque',
          type: 'number',
          placeholder: 'Cheque',
          value: cheque,
        },
        {
          name: 'tarjeta',
          type: 'number',
          placeholder: 'Tarjeta',
          value: tarjeta,
        },
        {
          name: 'deposito',
          type: 'number',
          placeholder: 'Deposito',
          value: deposito,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (d) => {
            const suma = +d.efectivo + +d.cheque + +d.deposito + +d.tarjeta;
            if ( suma == this.recibo.montoLocal ){
              this.recibo.montoEfectivoL = +d.efectivo;
              this.recibo.montoEfectivoD = this.recibo.montoEfectivoL / this.tipoCambio;
              this.recibo.montoChequeL = +d.cheque;
              this.recibo.montoChequeD = this.recibo.montoChequeL / this.tipoCambio;
              this.recibo.montoTarjetaL = +d.tarjeta;
              this.recibo.montoTarjetaD = this.recibo.montoTarjetaL / this.tipoCambio;
              this.recibo.montoDepositoL = +d.deposito;
              this.recibo.montoDepositoD = this.recibo.montoDepositoL / this.tipoCambio;
            }
            console.log('Confirm Ok');
          }
        }
      ]
    });
    await alert.present();
  }

  salvarRecibo(){
    console.log(this.recibo);
    let cxc: Pen_Cobro[] = [];
    let j: number;

    if ( this.recibo.montoLocal > 0 ){
      cxc = JSON.parse(localStorage.getItem('cxc'));
      for (let i = 0; i < this.recibo.detalle.length; i++) {                                  // Actualiza CxC con los nuevos saldos por recibo
        j = cxc.findIndex( d => d.numeroDocumen == this.recibo.detalle[i].numeroDocumen );
        cxc[j].saldoLocal = this.recibo.detalle[i].saldoLocal;
        cxc[j].saldoDolar = this.recibo.detalle[i].saldoDolar;
      }
      localStorage.setItem('cxc', JSON.stringify(cxc));                                     // Actualiza CxC en el Local Storage

      this.isaCobros.transmitirRecibo( this.recibo );
      this.isa.varConfig.consecutivoRecibos = this.isa.nextConsecutivo(this.isa.varConfig.consecutivoRecibos);
      this.isa.guardarVarConfig();
    }
  }

  regresar(){
    this.navController.back();
  }

}
