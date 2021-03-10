import { Component } from '@angular/core';
import { AlertController, NavController, PopoverController } from '@ionic/angular';
import { Bancos } from 'src/app/models/bancos';
import { Cheque } from 'src/app/models/cheques';
import { Det_Recibo, Pen_Cobro, Recibo } from 'src/app/models/cobro';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaService } from 'src/app/services/isa.service';
import { FacturasPage } from '../facturas/facturas.page';

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
  hayFactura: boolean = false;           // Indicador utilizado para saber que se aplicará el recibo a una factura
  hayNC: boolean = false;            // Nos indica si hay una nota de credito en los documentos a aplicar
  ncAsignada: boolean = false          // true si la NC ya fue asignada a una factura
  edicion: boolean = false;           // true = editar información de cheques y depositos
  hayCheque: boolean = false;           // True = se captura info de cheque
  reciboCheque: boolean = false;       // True = se agregó un cheque al recibo
  cantNC: number = 0;
  asignadasNC: number = 0;
  monto: number = 0;
  abono: number = 0;
  saldo: number = 0;
  cheque: Cheque;
  bancos: Bancos[] = [];
  banco: Bancos;

  constructor( private isa: IsaService,
               private isaCobros: IsaCobrosService,
               private navController: NavController,
               private alertController: AlertController,
               private popoverCtrl: PopoverController ) {
    
    let det: Det_Recibo;

    this.recibo = new Recibo( isa.varConfig.numRuta, this.isa.clienteAct.id, this.isa.varConfig.consecutivoRecibos, new Date(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
    this.docsPagar = this.isaCobros.cxc.filter( d => d.pago );
    if ( this.docsPagar.length > 0 ){
      this.docsPagar.forEach( e => {
        if (e.tipoDocumen == '1'){
          this.hayFactura = true;
          this.recibo.montoLocal = this.recibo.montoLocal + e.saldoLocal;
          this.recibo.montoDolar = this.recibo.montoDolar + e.saldoDolar;
          det = new Det_Recibo( e.tipoDocumen, e.numeroDocumen, true, e.fechaDoc, 0, 0, e.montoDolar, e.montoLocal, e.saldoLocal, e.saldoDolar );
        this.recibo.detalle.push(det);
        } else {
          this.hayNC = true;
          this.cantNC++;
          det = new Det_Recibo( e.tipoDocumen, e.numeroDocumen, false, e.fechaDoc, 0, 0, e.montoDolar, e.montoLocal, e.saldoLocal, e.saldoDolar );
          this.recibo.detalle.push(det);
        }
      });
      this.reciboSinSalvar = true;
      this.recibo.montoEfectivoL = this.recibo.montoLocal;
      this.recibo.montoEfectivoD = this.recibo.montoDolar;
      this.tipoCambio = this.recibo.montoLocal / this.recibo.montoDolar;
      this.monto = this.recibo.montoLocal;
      this.abono = this.recibo.montoLocal;
    }
    this.cheque = new Cheque('', this.isa.clienteAct.id.toString(), this.isa.varConfig.consecutivoRecibos, '', '', 0 );
    this.bancos = this.isa.cargarBancos();
    this.banco = new Bancos('','');
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

  modificarRecibo(){
    if ( this.cantNC == this.asignadasNC ){
      if ( this.edicion ){
        console.log(this.recibo);
       if ( this.hayCheque ){
         if ( this.cheque.monto > 0 ){
           if ( this.cheque.monto <= this.recibo.montoLocal ){
              if ( this.cheque.numeroCheque !== ''  && this.cheque.numeroCuenta !== '' && this.banco.banco !== '' ) {
                this.cheque.codCliente = this.recibo.codCliente.toString();
                this.cheque.codigoBanco = this.banco.banco;
                this.cheque.numeroRecibo = this.recibo.numeroRecibo;
                this.recibo.montoChequeL = this.cheque.monto;
                this.recibo.montoChequeD = this.cheque.monto / this.tipoCambio;
                this.reciboCheque = true;
                this.edicion = false;
                this.hayCheque = false;
              } else {
                this.isa.presentAlertW('Cheque', 'Faltan campos obligatorios en el cheque.');
              }
            } else {
             this.isa.presentAlertW('Cheque', 'El monto del Cheque no puede ser mayor al del Recibo');
            }
          } else {
            this.hayCheque = false;
            this.recibo.montoChequeD = 0;
          }
        }
        if ( this.recibo.montoEfectivoL > 0 ) {
          if ( this.recibo.montoEfectivoL <= this.recibo.montoLocal ){
            this.recibo.montoEfectivoD = this.recibo.montoEfectivoL / this.tipoCambio;
            this.edicion = false;
          } else {
            this.isa.presentAlertW('Efectivo', 'El monto del Efectivo no puede ser mayor al del Recibo');
          }
        } else {
          this.recibo.montoEfectivoD = 0;
        }
        if ( this.recibo.montoTarjetaL > 0 ) {
          if ( this.recibo.montoTarjetaL <= this.recibo.montoLocal ){
            this.recibo.montoTarjetaD = this.recibo.montoTarjetaL / this.tipoCambio;
            this.edicion = false;
          } else {
            this.isa.presentAlertW('Tarjeta', 'El monto de la Tarjeta no puede ser mayor al del Recibo');
          }
        } else {
          this.recibo.montoTarjetaD = 0;
        }
        if ( this.recibo.montoDepositoL > 0 ) {
          if ( this.recibo.montoDepositoL <= this.recibo.montoLocal ){
            this.recibo.montoDepositoD = this.recibo.montoChequeL / this.tipoCambio;
            this.edicion = false;
          } else {
            this.isa.presentAlertW('Depósito', 'El monto del Deposito no puede ser mayor al del Recibo');
          }
        } else {
          this.recibo.montoDepositoD = 0;
        }
        if (( this.recibo.montoChequeL + this.recibo.montoDepositoL + this.recibo.montoEfectivoL + this.recibo.montoTarjetaL ) == this.recibo.montoLocal ){
          this.edicion = false;
        } else {
          this.isa.presentAlertW('Recibo', 'El monto de los componentes del Recibo no pueden ser mayores al monto del recibo');
          this.edicion = true;
        }
      } else {
        this.edicion = true;
      }
    } else {
      this.isa.presentAlertW('Notas de Credito', 'Debe asignar las NC a una factura antes de editar el recibo');
    }
  }

  salvarRecibo(){
    let cxc: Pen_Cobro[] = [];
    let j: number;

    if ( this.recibo.montoLocal > 0 && this.hayFactura ){         // valida si se está abonando almenos una factura
      if (this.cantNC == this.asignadasNC ){                     // Valida si no quedó una NC sin asignar a una factura
        cxc = JSON.parse(localStorage.getItem('cxc'));
        for (let i = 0; i < this.recibo.detalle.length; i++) {                                  // Actualiza CxC con los nuevos saldos por recibo
          j = cxc.findIndex( d => d.numeroDocumen == this.recibo.detalle[i].numeroDocumen );
          cxc[j].saldoLocal = this.recibo.detalle[i].saldoLocal;
          cxc[j].saldoDolar = this.recibo.detalle[i].saldoDolar;
        }
        localStorage.setItem('cxc', JSON.stringify(cxc));                                     // Actualiza CxC en el Local Storage
        this.isaCobros.transmitirRecibo( this.recibo, this.cheque, this.reciboCheque );
        this.isa.varConfig.consecutivoRecibos = this.isa.nextConsecutivo(this.isa.varConfig.consecutivoRecibos);
        this.isa.guardarVarConfig();
        this.navController.back();
        this.navController.back();
      } else {
        this.isa.presentAlertW( 'Salvar Recibo', 'No es posible transmitir el Recibo si no se aplica la NC a una factura' );
      }
    } else {
      this.isa.presentAlertW( 'Salvar Recibo', 'No es posible guardar el Recibo si no se aplica un abono a una factura' );
    }
  }

  async asignaFactura( i: number, ev ){    // recibo.detalle[i] es la NC que se está asignando a una factura
    let facturas: Pen_Cobro[] = [];

    if ( this.recibo.detalle[i].tipoDocumen == '7' ){                    // tipoDoucmen = 7 si es una NC
      facturas = this.docsPagar.filter( d => d.tipoDocumen == '1' );    // Filtra las facturas a las que les puede aplicar la NC
      if ( facturas.length > 0 ){
        const popover = await this.popoverCtrl.create({
          component: FacturasPage,
          componentProps: {value: facturas},
          cssClass: 'my-custom-class',
          event: ev,
          translucent: true
        });
        await popover.present();
  
        const {data} = await popover.onWillDismiss();
        if ( data !== undefined){
          if ( !this.recibo.detalle[i].ncAsignada ){
            this.recibo.detalle[i].numeroDocumenAf = data.item; 
            this.recibo.detalle[i].ncAsignada = true;
            this.asignadasNC++;
            const j = this.recibo.detalle.findIndex( d => d.numeroDocumen == data.item );   // obtenemos el indice J de la factura asignada a la NC
            this.recibo.detalle[j].abonoLocal -= this.recibo.detalle[i].abonoLocal;        // Se le resta al abono de la factura el saldo de la NC
            this.recibo.detalle[j].abonoDolar -= this.recibo.detalle[i].abonoDolar;
            this.recibo.detalle[i].saldoNCFL = this.recibo.detalle[j].abonoLocal;        // El saldo de la NC será el saldo de la factura
            this.recibo.detalle[i].saldoNCFD = this.recibo.detalle[j].abonoDolar;
            this.recibo.montoLocal -= this.recibo.detalle[i].abonoLocal;                // Se le resta al recibo el monto de la NC
            this.recibo.montoDolar -= this.recibo.detalle[i].abonoDolar;
            this.recibo.montoEfectivoL -= this.recibo.detalle[i].abonoLocal;
            this.recibo.montoEfectivoD -= this.recibo.detalle[i].abonoDolar;
          }
        }
      }
    }
  }

  regresar(){
    this.navController.back();
  }

}
