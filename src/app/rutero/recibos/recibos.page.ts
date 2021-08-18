import { Component } from '@angular/core';
import { AlertController, NavController, PopoverController } from '@ionic/angular';
import { Bancos } from 'src/app/models/bancos';
import { Cheque } from 'src/app/models/cheques';
import { Det_Recibo, Pen_Cobro, Recibo } from 'src/app/models/cobro';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaService } from 'src/app/services/isa.service';
import { environment } from 'src/environments/environment';
import { FacturasPage } from '../facturas/facturas.page';

@Component({
  selector: 'app-recibos',
  templateUrl: './recibos.page.html',
  styleUrls: ['./recibos.page.scss'],
})
export class RecibosPage {

  docsPagar: Pen_Cobro[] = [];            // Arreglo con las facturas a cancelar.
  recibo: Recibo;                        // Recibo que cancela las facturas
  tipoCambio: number = 1;               // Tipo de cambio al que se registró la factura
  dolares: boolean = false;            // True = recibo en dólares, caso contrario colones
  moneda: string = '¢';
  etiquetaMoneda: string = 'Colones';
  reciboSinSalvar: boolean = false;
  hayFactura: boolean = false;              // Indicador utilizado para saber que se aplicará el recibo a una factura
  hayNC: boolean = false;                  // Nos indica si hay una nota de credito en los documentos a aplicar
  ncAsignada: boolean = false             // true si la NC ya fue asignada a una factura
  edicion: boolean = false;              // true = editar información del recibo tales como efectivo, cheques, tarjeta etc.
  hayCheque: boolean = false;           // True = se captura info de cheque
  reciboCheque: boolean = false;       // True = se agregó un cheque al recibo
  saldoFactura: number = 0;           // Saldo de la factura a cancelar
  cantNC: number = 0;
  asignadasNC: number = 0;
  monto: number = 0;
  abono: number = 0;
  saldo: number = 0;
  cheque: Cheque;
  bancos: Bancos[] = [];
  banco: Bancos;
  reciboTemp = {                   // Estructura que visualmente en el HTML contiene los valores del recibo según la moneda en la variable dolares
    monto : 0,
    abono: 0,
    efectivo: 0,
    tarjeta: 0,
    deposito: 0,
    cheque: 0
  }

  constructor( private isa: IsaService,
               private isaCobros: IsaCobrosService,
               private navController: NavController,
               private popoverCtrl: PopoverController,
               private alertCtrl: AlertController ) {
    
    let det: Det_Recibo;

    this.tipoCambio = environment.tipoCambio;
    this.recibo = new Recibo( isa.varConfig.numRuta, this.isa.clienteAct.id, this.isa.varConfig.consecutivoRecibos, new Date(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 'L' );
    this.docsPagar = this.isaCobros.cxc.filter( d => d.pago );
    if ( this.docsPagar.length > 0 ){
      this.docsPagar.forEach( e => {
        if (e.tipoDocumen == '1'){
          this.hayFactura = true;
          this.recibo.montoLocal = this.recibo.montoLocal + e.saldoLocal;
          this.recibo.montoDolar = this.recibo.montoLocal / this.tipoCambio;
          det = new Det_Recibo( e.tipoDocumen, e.numeroDocumen, true, e.fechaDoc, 0, 0, e.montoLocal / this.tipoCambio, e.montoLocal, e.saldoLocal, e.saldoLocal / this.tipoCambio );
          this.recibo.detalle.push(det);
          this.saldoFactura = e.saldoLocal;
        } else {
          this.hayNC = true;
          this.cantNC++;
          det = new Det_Recibo( e.tipoDocumen, e.numeroDocumen, false, e.fechaDoc, 0, 0, e.montoLocal / this.tipoCambio, e.montoLocal, e.saldoLocal, e.saldoLocal / this.tipoCambio );
          this.recibo.detalle.push(det);
        }
      });
      this.reciboSinSalvar = true;
      this.recibo.montoEfectivoL = this.recibo.montoLocal;
      this.recibo.montoEfectivoD = this.recibo.montoDolar;
      
      this.reciboTemp.monto = this.recibo.montoLocal;
      this.reciboTemp.abono = this.recibo.montoLocal;
      this.reciboTemp.efectivo = this.recibo.montoLocal;
    }
    this.cheque = new Cheque('', this.isa.clienteAct.id.toString(), this.isa.varConfig.consecutivoRecibos, '', '', 0 );
    this.bancos = this.isa.cargarBancos();
    this.banco = new Bancos('','');
  }

  cambiarMoneda(){
    console.log(this.dolares);
    if ( this.dolares ){
      this.etiquetaMoneda = 'Dólares:';
      this.moneda = "$";
      this.reciboTemp.monto = this.recibo.montoDolar;
      this.reciboTemp.abono = this.recibo.montoDolar;
      this.reciboTemp.efectivo = this.recibo.montoDolar;
      this.recibo.moneda = 'D';
      this.saldoFactura = this.recibo.detalle[0].abonoDolar;
    } else {
      this.etiquetaMoneda = 'Colones';
      this.moneda = "¢";
      this.reciboTemp.monto = this.recibo.montoLocal;
      this.reciboTemp.abono = this.recibo.montoLocal;
      this.reciboTemp.efectivo = this.recibo.montoLocal;
      this.recibo.moneda = 'L';
      this.saldoFactura = this.recibo.detalle[0].abonoDolar;
    }
  }

  modificarRecibo(){
    const montoAntLocal = this.recibo.detalle[0].abonoLocal;
    const montoAntDolar = this.recibo.detalle[0].abonoDolar;

    if ( this.cantNC == this.asignadasNC ){
      if ( this.edicion ){                    // Se estaba modificando los valores del recibo
        console.log(this.recibo);            // Valida la información del efectivo
        if ( this.reciboTemp.efectivo > 0 ) {
          if ( this.reciboTemp.efectivo <= this.reciboTemp.monto ){
            if ( this.dolares ){
              this.recibo.montoEfectivoD = this.reciboTemp.efectivo;
              this.recibo.montoEfectivoL = this.reciboTemp.efectivo * this.tipoCambio;
              this.recibo.montoLocal = this.recibo.montoEfectivoL;
              this.recibo.montoDolar = this.recibo.montoEfectivoD;
              this.reciboTemp.monto = this.recibo.montoDolar;
              this.recibo.detalle[0].abonoLocal = this.recibo.montoEfectivoL;
              this.recibo.detalle[0].abonoDolar = this.recibo.montoEfectivoD;
              this.recibo.detalle[0].saldoLocal = this.recibo.detalle[0].montoLocal - this.recibo.detalle[0].abonoLocal;
              this.recibo.detalle[0].saldoDolar = this.recibo.detalle[0].montoDolar - this.recibo.detalle[0].abonoDolar;
              this.saldo = this.recibo.detalle[0].saldoDolar;
            } else {
              this.recibo.montoEfectivoL = this.reciboTemp.efectivo;
              this.recibo.montoEfectivoD = this.recibo.montoEfectivoL / this.tipoCambio;
              this.recibo.montoLocal = this.recibo.montoEfectivoL;
              this.recibo.montoDolar = this.recibo.montoEfectivoD;
              this.reciboTemp.monto = this.recibo.montoLocal;
              this.recibo.detalle[0].abonoLocal = this.recibo.montoEfectivoL;
              this.recibo.detalle[0].abonoDolar = this.recibo.montoEfectivoD;
              this.recibo.detalle[0].saldoLocal = this.recibo.detalle[0].montoLocal - this.recibo.detalle[0].abonoLocal;
              this.recibo.detalle[0].saldoDolar = this.recibo.detalle[0].montoDolar - this.recibo.detalle[0].abonoDolar;
              this.saldo = this.recibo.detalle[0].saldoLocal;
            }
            this.edicion = false;
          } else {
            this.isa.presentAlertW('Efectivo', 'El monto del Efectivo no puede ser mayor al monto del Recibo');
          }
        } else {
          this.recibo.montoEfectivoL = 0;
          this.recibo.montoEfectivoD = 0;
        }
        if ( this.hayCheque ){              // Valida la información del Cheque
          if ( this.cheque.monto > 0 ){       
            if ( (this.cheque.monto + this.reciboTemp.efectivo) <= this.saldoFactura ){
               if ( this.cheque.numeroCheque !== ''  && this.cheque.numeroCuenta !== '' && this.banco.banco !== '' ) {
                 this.cheque.codCliente = this.recibo.codCliente.toString();
                 this.cheque.codigoBanco = this.banco.banco;
                 this.cheque.numeroRecibo = this.recibo.numeroRecibo;
                 this.reciboTemp.cheque = this.cheque.monto;
                 if ( this.dolares ){
                    this.recibo.montoChequeD = this.cheque.monto;
                    this.recibo.montoChequeL = this.cheque.monto * this.tipoCambio;
                    this.reciboTemp.abono = this.cheque.monto + this.reciboTemp.efectivo;
                    this.recibo.montoDolar = this.reciboTemp.abono;
                    this.recibo.detalle[0].abonoLocal = this.recibo.montoEfectivoL + this.recibo.montoChequeL;
                    this.recibo.detalle[0].abonoDolar = this.recibo.montoEfectivoD + this.recibo.montoChequeD;
                    this.recibo.detalle[0].saldoLocal = this.recibo.detalle[0].montoLocal - this.recibo.detalle[0].abonoLocal;
                    this.recibo.detalle[0].saldoDolar = this.recibo.detalle[0].montoDolar - this.recibo.detalle[0].abonoDolar;
                    this.saldo = this.recibo.detalle[0].saldoDolar;
                    this.reciboTemp.monto = this.recibo.montoDolar;
                 } else {
                    this.recibo.montoChequeL = this.cheque.monto;
                    this.recibo.montoChequeD = this.cheque.monto / this.tipoCambio;
                    this.reciboTemp.abono = this.cheque.monto + this.reciboTemp.efectivo;
                    this.recibo.montoLocal = this.reciboTemp.abono;
                    this.recibo.detalle[0].abonoLocal = this.recibo.montoEfectivoL + this.recibo.montoChequeL;
                    this.recibo.detalle[0].abonoDolar = this.recibo.montoEfectivoD + this.recibo.montoChequeD;
                    this.recibo.detalle[0].saldoLocal = this.recibo.detalle[0].montoLocal - this.recibo.detalle[0].abonoLocal;
                    this.recibo.detalle[0].saldoDolar = this.recibo.detalle[0].montoDolar - this.recibo.detalle[0].abonoDolar;
                    this.saldo = this.recibo.detalle[0].saldoLocal;
                    this.reciboTemp.monto = this.recibo.montoLocal;
                 }
                 this.reciboCheque = true;
                 this.edicion = false;
                 this.hayCheque = false;
               } else {
                 this.isa.presentAlertW('Cheque', 'Faltan campos obligatorios en el cheque.');
               }
             } else {
              this.isa.presentAlertW('Cheque', 'El monto del Cheque no puede ser mayor al saldo de la factura...');
             }
           } else {
             this.hayCheque = false;
             this.recibo.montoChequeD = 0;
             this.recibo.montoChequeL = 0;
             this.reciboTemp.cheque = 0;
           }
        }
        if ( this.reciboTemp.tarjeta > 0 ) {    // Valida los montos de las tarjetas
          if ( this.reciboTemp.tarjeta <= this.reciboTemp.monto ){
            if ( this.dolares ){
              this.recibo.montoTarjetaD = this.reciboTemp.tarjeta;
              this.recibo.montoTarjetaL = this.reciboTemp.tarjeta * this.tipoCambio;
            } else {
              this.recibo.montoTarjetaL = this.reciboTemp.tarjeta;
              this.recibo.montoTarjetaD = this.recibo.montoTarjetaL / this.tipoCambio;
            }
            this.edicion = false;
          } else {
            this.isa.presentAlertW('Tarjeta', 'El monto de la Tarjeta no puede ser mayor al monto del Recibo');
          }
        } else {
          this.recibo.montoTarjetaD = 0;
          this.recibo.montoTarjetaL = 0;
        }
        if ( this.recibo.montoDepositoL > 0 ) {
          if ( this.reciboTemp.deposito <= this.reciboTemp.monto ){
            if ( this.dolares ){
              this.recibo.montoDepositoD = this.reciboTemp.deposito;
              this.recibo.montoDepositoL = this.reciboTemp.deposito * this.tipoCambio;
            } else {
              this.recibo.montoDepositoL = this.reciboTemp.deposito;
              this.recibo.montoDepositoD = this.recibo.montoDepositoL / this.tipoCambio;
            }
            this.edicion = false;
          } else {
            this.isa.presentAlertW('Depósito', 'El monto del Deposito no puede ser mayor al monto del Recibo');
          }
        } else {
          this.recibo.montoDepositoD = 0;
          this.recibo.montoDepositoL = 0;
        }
        if (( this.cheque.monto + this.reciboTemp.deposito + this.reciboTemp.efectivo + this.reciboTemp.tarjeta ) <= this.saldoFactura ){
          this.edicion = false;
          this.reciboTemp.abono = this.cheque.monto + this.reciboTemp.deposito + this.reciboTemp.efectivo + this.reciboTemp.tarjeta;
          if ( this.dolares ){
            this.recibo.montoDolar = this.reciboTemp.abono;
            this.recibo.montoLocal = this.reciboTemp.abono * this.tipoCambio;
          } else {
            this.recibo.montoLocal = this.reciboTemp.abono;
            this.recibo.montoDolar = this.reciboTemp.abono / this.tipoCambio;
          }
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

  async salvarRecibo(){
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Salvar Recibo...!!!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Si',
          handler: () => {
            this.procesaRecibo();
          }
        }
      ]
    });
    await alert.present();
  }

  procesaRecibo(){
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
        if (this.recibo.montoEfectivoL > 0 || this.recibo.montoChequeL > 0) {
          this.isaCobros.transmitirRecibo( this.recibo, this.cheque, this.reciboCheque, true );
          this.isa.varConfig.consecutivoRecibos = this.isa.nextConsecutivo(this.isa.varConfig.consecutivoRecibos);
          this.isa.guardarVarConfig();
        } else {
          this.isaCobros.reciboSimple( this.recibo );
        }
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
