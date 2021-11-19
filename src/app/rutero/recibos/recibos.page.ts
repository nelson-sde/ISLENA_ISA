import { Component } from '@angular/core';
import { AlertController, NavController, Platform, PopoverController } from '@ionic/angular';
import { Bancos } from 'src/app/models/bancos';
import { Cheque } from 'src/app/models/cheques';
import { Det_Recibo, Pen_Cobro, Recibo } from 'src/app/models/cobro';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaService } from 'src/app/services/isa.service';
import { environment } from 'src/environments/environment';
import { FacturasPage } from '../facturas/facturas.page';
import { Plugins, FilesystemDirectory } from "@capacitor/core";
const { Filesystem } = Plugins;
import { PdfMakeWrapper, Txt, Table, Img  } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { FileOpener } from '@ionic-native/file-opener/ngx';

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
    cheque: 0,
    otrosMov: 0,
    monto_NC: 0
  }

  constructor( private isa: IsaService,
               private isaCobros: IsaCobrosService,
               private navController: NavController,
               private popoverCtrl: PopoverController,
               private alertCtrl: AlertController,
               private fileOpener: FileOpener,
               private plt: Platform ) {
    
    let det: Det_Recibo;
    PdfMakeWrapper.setFonts(pdfFonts);

    this.tipoCambio = environment.tipoCambio;
    this.recibo = new Recibo( isa.varConfig.numRuta, this.isa.clienteAct.id, this.isa.varConfig.consecutivoRecibos, new Date(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 'L' );
    this.docsPagar = this.isaCobros.cxc.filter( d => d.pago );
    if ( this.docsPagar.length > 0 ){
      this.docsPagar.forEach( e => {
        if (e.tipoDocumen == '1'){    // Es una factura
          this.hayFactura = true;
          this.recibo.montoLocal += e.saldoLocal;
          this.recibo.montoDolar = this.recibo.montoLocal / this.tipoCambio;
          det = new Det_Recibo( e.tipoDocumen, e.numeroDocumen, true, e.fechaDoc, 0, 0, e.montoLocal / this.tipoCambio, 
            e.montoLocal, e.saldoLocal, e.saldoLocal / this.tipoCambio, e.saldoLocal, e.saldoDolar );
          this.recibo.detalle.push(det);
          this.saldoFactura += e.saldoLocal;
        } else {              // es una devolución
          this.hayNC = true;
          this.cantNC++;
          det = new Det_Recibo( e.tipoDocumen, e.numeroDocumen, false, e.fechaDoc, 0, 0, e.montoLocal / this.tipoCambio, e.montoLocal, e.saldoLocal, e.saldoLocal / this.tipoCambio, e.saldoLocal, e.saldoDolar );
          this.recibo.detalle.push(det);
        }
      });
      this.reciboSinSalvar = true;
      this.recibo.montoEfectivoL = this.recibo.montoLocal;
      this.recibo.montoEfectivoD = this.recibo.montoDolar;
      this.recibo.tipoDoc = 'R';
      
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
      //this.saldoFactura = this.recibo.detalle[0].abonoDolar;
    } else {
      this.etiquetaMoneda = 'Colones';
      this.moneda = "¢";
      this.reciboTemp.monto = this.recibo.montoLocal;
      this.reciboTemp.abono = this.recibo.montoLocal;
      this.reciboTemp.efectivo = this.recibo.montoLocal;
      this.recibo.moneda = 'L';
      //this.saldoFactura = this.recibo.detalle[0].abonoDolar;
    }
  }

  modificarRecibo(){ //debugger
    if ( this.cantNC == this.asignadasNC ){
      if ( this.edicion ){                    // Se estaba modificando los valores del recibo
        this.reiniciaSaldos();
        if ( this.reciboTemp.efectivo > 0 ) {
          if ( this.reciboTemp.efectivo <= this.reciboTemp.monto ){
            if ( this.dolares ){
              this.recibo.montoEfectivoD = this.reciboTemp.efectivo;
              this.recibo.montoEfectivoL = this.reciboTemp.efectivo * this.tipoCambio;
              this.recibo.montoLocal = this.recibo.montoEfectivoL;
              this.recibo.montoDolar = this.recibo.montoEfectivoD;
              this.reciboTemp.monto = this.recibo.montoDolar;
              this.modificarDetalle( this.recibo.montoEfectivoL, this.recibo.montoEfectivoD );
            } else {
              this.recibo.montoEfectivoL = this.reciboTemp.efectivo;
              this.recibo.montoEfectivoD = this.recibo.montoEfectivoL / this.tipoCambio;
              this.recibo.montoLocal = this.recibo.montoEfectivoL;
              this.recibo.montoDolar = this.recibo.montoEfectivoD;
              this.reciboTemp.monto = this.recibo.montoLocal;
              this.modificarDetalle( this.recibo.montoEfectivoL, this.recibo.montoEfectivoD );
            }
            this.edicion = false;
            this.recibo.tipoDoc = 'R';
          } else {
            this.isa.presentAlertW('Efectivo', 'El monto del Efectivo no puede ser mayor al monto del Recibo');
          }
        } else {
          this.recibo.montoEfectivoL = 0;
          this.recibo.montoEfectivoD = 0;
          this.recibo.tipoDoc = null;
        }
        if ( this.hayCheque ){
          if ( this.cheque.monto > 0 && this.cheque.numeroCheque !== null  && this.cheque.numeroCuenta !== null && this.banco.banco !== ''){                                 // Valida la información del Cheque
            this.recibo.tipoDoc = 'R';
            if ( (this.cheque.monto + this.reciboTemp.efectivo) <= this.saldoFactura ){
              this.cheque.codCliente = this.recibo.codCliente.toString();
              this.cheque.codigoBanco = this.banco.banco;
              this.cheque.numeroRecibo = this.recibo.numeroRecibo;
              this.reciboTemp.cheque = this.cheque.monto;
              if ( this.dolares ){
                this.recibo.montoChequeD = this.cheque.monto;
                this.recibo.montoChequeL = this.cheque.monto * this.tipoCambio;
                this.reciboTemp.abono = this.cheque.monto + this.reciboTemp.efectivo;
                this.recibo.montoDolar = this.reciboTemp.abono;
                this.modificarDetalle( this.recibo.montoChequeL, this.recibo.montoChequeD);
                this.reciboTemp.monto = this.recibo.montoDolar;
              } else {
                this.recibo.montoChequeL = this.cheque.monto;
                this.recibo.montoChequeD = this.cheque.monto / this.tipoCambio;
                this.reciboTemp.abono = this.cheque.monto + this.reciboTemp.efectivo;
                this.recibo.montoLocal = this.reciboTemp.abono;
                this.modificarDetalle( this.recibo.montoChequeL, this.recibo.montoChequeD);
                this.reciboTemp.monto = this.recibo.montoLocal;
              }
              this.reciboCheque = true;
              this.edicion = false;
              this.hayCheque = false;
            } else {
              this.isa.presentAlertW('Cheque', 'La suma de los montos del Cheque y el efectivo no puede ser mayores al saldo de la factura...');
            }
          } else {
            this.isa.presentAlertW('Cheque', 'ERROR: Información del cheque, incompleta.');
            //this.hayCheque = false;
            this.recibo.montoChequeD = 0;
            this.recibo.montoChequeL = 0;
            //this.reciboTemp.cheque = 0;
            this.recibo.tipoDoc = null;
            //this.edicion = false;
          }
        } else {
          this.recibo.montoChequeD = 0;
          this.recibo.montoChequeL = 0;
          this.reciboTemp.cheque = 0;
          this.hayCheque = false;
        }
        if ( this.reciboTemp.tarjeta > 0 ) {    // Valida los montos de las tarjetas
          if ( this.recibo.tipoDoc === null ){
            if ( this.reciboTemp.tarjeta <= this.saldoFactura ){
              this.recibo.tipoDoc = 'T';
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
              return;
            }
          } else {
            this.isa.presentAlertW('Tarjeta', 'No puede registarse un cargo por tarjeta si se está registrando un recibo de efectivo o cheque.');
            this.recibo.montoTarjetaD = 0;
            this.recibo.montoTarjetaL = 0;
            this.reciboTemp.tarjeta = 0;
          }
        } else {
          this.recibo.montoTarjetaD = 0;
          this.recibo.montoTarjetaL = 0;
        }
        if ( this.reciboTemp.deposito > 0 ) {          // Valida si el pago es con un deposito bancario
          if ( this.recibo.tipoDoc === null ){
            if ( this.reciboTemp.deposito <= this.saldoFactura ){
              this.recibo.tipoDoc = 'T';
              if ( this.recibo.numTR !== null ) {
                this.recibo.numeroRecibo =  `${this.recibo.numeroRuta}T${this.recibo.numTR}`;
                if ( this.dolares ){
                  this.recibo.montoDepositoD = this.reciboTemp.deposito;
                  this.recibo.montoDepositoL = this.reciboTemp.deposito * this.tipoCambio;
                  this.modificarDetalle( this.recibo.montoDepositoL, this.recibo.montoDepositoD );
                } else {
                  this.recibo.montoDepositoL = this.reciboTemp.deposito;
                  this.recibo.montoDepositoD = this.recibo.montoDepositoL / this.tipoCambio;
                  this.modificarDetalle( this.recibo.montoDepositoL, this.recibo.montoDepositoD );
                }
                this.edicion = false;
              } else {
                this.isa.presentAlertW('Depósito', 'El número de la Transferencia no puede ser nulo...!!!');
                return;
              }
            } else {
              this.isa.presentAlertW('Depósito', 'El monto del Deposito no puede ser mayor al monto del Recibo');
              return;
            }
          }  else {
            this.isa.presentAlertW('Depósito', 'No puede registarse un cargo por Transferencia si se está registrando un recibo de efectivo o cheque.');
            this.recibo.montoDepositoD = 0;
            this.recibo.montoDepositoL = 0;
            this.recibo.numTR = null;
            this.reciboTemp.deposito = 0;
          }
        } else {
          this.recibo.montoDepositoD = 0;
          this.recibo.montoDepositoL = 0;
          this.recibo.numTR = null;
        }
        if (this.reciboTemp.otrosMov > 0){     // Se registraron otros movimientos que restan el saldo
          this.recibo.otrosMov = this.reciboTemp.otrosMov;
          this.saldo -= this.recibo.otrosMov;
        }
        if (this.reciboTemp.monto_NC > 0){     // Se registraron Notas de Crédito que restan el saldo
          this.recibo.monto_NC = this.reciboTemp.monto_NC;
          this.saldo -= this.recibo.monto_NC;
        }
        if (( this.cheque.monto + this.reciboTemp.deposito + this.reciboTemp.efectivo + this.reciboTemp.tarjeta + this.reciboTemp.otrosMov + this.reciboTemp.monto_NC) <= this.saldoFactura ){
          //this.edicion = false;
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
        console.log(this.recibo);            // Valida la información del efectivo
      } else {
        this.edicion = true;
      }
    } else {
      this.isa.presentAlertW('Notas de Credito', 'Debe asignar las NC a una factura antes de editar el recibo');
    }
  }

  modificarDetalle( montoL: number, montoD: number ){
    let abonoL: number = montoL;
    let abonoD: number = montoD;

    this.recibo.detalle.forEach( d => {
      if ( d.saldoLocal > 0 ){
        if ( d.saldoLocal < abonoL ){
          d.abonoLocal += d.saldoLocal;
          d.abonoDolar += d.saldoDolar;
          abonoL -= d.saldoLocal;
          abonoD -= d.saldoDolar;
          this.saldo -= d.saldoLocal;
          d.saldoLocal = 0;
          d.saldoDolar = 0;
        } else {
          d.abonoLocal += abonoL;
          d.abonoDolar += abonoD;
          d.saldoLocal = d.saldoAntL - d.abonoLocal;
          d.saldoDolar = d.saldoAntD - d.abonoDolar;
          this.saldo -= abonoL;
          abonoL = 0;
          abonoD = 0;
        }
      }
    });
  }

  reiniciaSaldos(){
    this.saldo = 0;
    this.recibo.detalle.forEach( d => {
      d.abonoDolar = 0;
      d.abonoLocal = 0;
      d.saldoLocal = d.saldoAntL;
      d.saldoDolar = d.saldoAntD;
      this.saldo += d.saldoLocal; 
    });

  }

  async salvarRecibo(){
    if (!this.edicion){ 
      if ( this.recibo.montoLocal > 0 && this.hayFactura ){         // valida si se está abonando almenos una factura
        const alert = await this.alertCtrl.create({
          cssClass: 'my-custom-class',
          header: 'Salvar Recibo...!!!',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            }, {
              text: 'Email',
              handler: () => {
                this.procesaRecibo();
              }
            },
            {
              text: 'PDF & Email',
              handler: () => {
                this.procesaRecibo();
                this.procesaPDF();
              }
            },
          ]
        });
        await alert.present();
      } else {
        this.isa.presentAlertW( 'Salvar Recibo', 'No es posible guardar el Recibo si no se aplica un abono a una factura' );
      }
    } else {
      this.isa.presentAlertW('Salvar', 'No se puede salvar el recibo de dinero si está editando el recibo...');
    }
  }

  async procesaPDF(){
    const pdf = new PdfMakeWrapper();
    let day = new Date(this.recibo.fecha).getDate();
    let month = new Date(this.recibo.fecha).getMonth()+1;
    let year = new Date(this.recibo.fecha).getFullYear();
    let texto: string = '';
    let saldoAnterior: number = 0;
    let saldoActual: number = 0;
    let efectivo: string = '  ';
    let hayCheque: string = '  ';
    let etiqueta: string = 'Recibo de Dinero';
    let numRecibo: string = this.recibo.numeroRecibo;

    if ( this.recibo.tipoDoc === 'T' ){
      etiqueta = 'Transferencia Dinero';
      numRecibo = this.recibo.numTR;
    }

    pdf.info({
      title: this.recibo.numeroRecibo,
      author: this.isa.varConfig.numRuta,
      subject: 'Recibo de Dinero',
    });
    
    pdf.add(
      pdf.ln(2)
    );
    pdf.add(new Txt(`Fecha: ${day}-${month}-${year}`).alignment('right').bold().end);
    pdf.add(new Table([
      [ await new Img('/assets/img/islena.png').build(), 
        new Txt('Distribuidora Isleña de Alimentos S.A.').alignment('center').end, 
        new Txt(etiqueta).alignment('center').end
      ],
      [ this.isa.varConfig.numRuta, 
        new Txt('Cédula Jurídica 3-101-109180').alignment('center').end, 
        new Txt(numRecibo).alignment('center').end
      ],
    ]).widths([ '*', '*', '*' ]).end);
    pdf.add(pdf.ln(1));
    pdf.add(new Txt(`RECIBIMOS DE: (${this.isa.clienteAct.id}) ${this.isa.clienteAct.nombre}`).bold().end);
    pdf.add(pdf.ln(1));
    pdf.add(new Txt(`LA SUMA DE: ${this.isaCobros.colones(this.recibo.montoLocal)} colones.`).end);
    pdf.add(pdf.ln(1));

    this.recibo.detalle.forEach( d => {
      texto = texto.concat(`, ${d.numeroDocumen}`);
      saldoAnterior += d.montoLocal;
      saldoActual += d.saldoLocal; 
    });
    
    saldoAnterior = saldoActual + this.recibo.montoLocal;
    const saldoFinal = saldoActual - this.recibo.otrosMov - this.recibo.monto_NC;
    pdf.add(new Txt(`POR CONCEPTO DE: Abono a Factura${texto}. ${this.recibo.observaciones}`).end);
    pdf.add(pdf.ln(1));

    if (this.recibo.montoEfectivoL > 0){
      efectivo = 'X';
    }
    if (this.recibo.montoChequeL > 0){
      hayCheque = 'X';
    }
    pdf.add(new Txt(`[${efectivo}] Efectivo   [${hayCheque}] Cheque No. ${this.cheque.numeroCheque}, Banco: ${this.cheque.codigoBanco}`).end);
    pdf.add(pdf.ln(1));

    pdf.add(new Table([
      [ 'Saldo Anterior', 
        new Txt(`${this.isaCobros.colones(saldoAnterior)}`).alignment('right').end
      ],
      [ 'Este abono', 
        new Txt(`${this.isaCobros.colones(this.recibo.montoLocal)}`).alignment('right').end
      ],
      [ 'Saldo actual', 
        new Txt(`${this.isaCobros.colones(saldoActual)}`).alignment('right').end
      ],
      [ 'Notas Credito', 
        new Txt(`- ${this.isaCobros.colones(this.recibo.monto_NC)}`).alignment('right').end
      ],
      [ 'Otros Creditos', 
        new Txt(`- ${this.isaCobros.colones(this.recibo.otrosMov)}`).alignment('right').end
      ],
      [ 'Saldo', 
        new Txt(`${this.isaCobros.colones(saldoFinal)}`).alignment('right').end
      ],
    ]).end);
    pdf.add(pdf.ln(1));
    if ( this.recibo.tipoDoc === 'T') {
      pdf.add(new Txt('Nota: La validez de esta transacción queda sujeta a qué se compruebe la confirmación de los fondos en nuestras cuentas bancarias.').end);
      pdf.add(pdf.ln(1));
    } else {
      pdf.add(new Txt('Nota: La validez de este recibo queda sujeta a que el banco honre su cheque.').end);
      pdf.add(pdf.ln(1));
    }
    pdf.add(new Txt('Atentamente.').end);
    pdf.add(pdf.ln(1));
    pdf.add(new Txt('Departamento de Crédito y Cobro.').end);
    pdf.add(new Txt('Distribuidora Isleña de Alimentos S.A.').end);
    pdf.add(new Txt('Barreal de Heredia, de la Embotelladora Pepsi 100m Este, 500m Norte.').end);
    pdf.add(new Txt('Tel: (506)2293-0609 - Fax: (506)2293-3231. Apdo: 463-1200 Pavas.').end);
    pdf.add(new Txt('www.distribuidoraislena.com').end);


    if (this.plt.is('capacitor')){
      pdf.create().getBase64( async (data) => {
        try {
          let path = `pdf/${this.recibo.numeroRecibo}.pdf`;
          const result = await Filesystem.writeFile({
            path,
            data,
            directory: FilesystemDirectory.Documents,
            recursive: true
          });
          this.fileOpener.open(`${result.uri}`, 'application/pdf');
              
        } catch (e) {
          console.log('Error Creando el archivo', JSON.stringify(e));
        }
      });
    } else {
      pdf.create().download(this.recibo.numeroRecibo);
    }
  }

  procesaRecibo(){
    let cxc: Pen_Cobro[] = [];
    let j: number;

    if (this.cantNC == this.asignadasNC ){                     // Valida si no quedó una NC sin asignar a una factura
      cxc = JSON.parse(localStorage.getItem('cxc'));
      for (let i = 0; i < this.recibo.detalle.length; i++) {                                  // Actualiza CxC con los nuevos saldos por recibo
        j = cxc.findIndex( d => d.numeroDocumen == this.recibo.detalle[i].numeroDocumen );
        cxc[j].saldoLocal = this.recibo.detalle[i].saldoLocal;
        cxc[j].saldoDolar = this.recibo.detalle[i].saldoDolar;
      }
      localStorage.setItem('cxc', JSON.stringify(cxc));                                     // Actualiza CxC en el Local Storage
      if (this.recibo.tipoDoc === 'R') {
        this.isaCobros.transmitirRecibo( this.recibo, this.cheque, this.reciboCheque, true );
        this.isa.varConfig.consecutivoRecibos = this.isa.nextConsecutivo(this.isa.varConfig.consecutivoRecibos);
        this.isa.guardarVarConfig();
      } else {
        this.isaCobros.reciboSimple( this.recibo, true );
      }
      this.navController.back();
      this.navController.back();
    } else {
      this.isa.presentAlertW( 'Salvar Recibo', 'No es posible transmitir el Recibo si no se aplica la NC a una factura' );
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
