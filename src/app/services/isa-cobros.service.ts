import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pen_Cobro, RecDetaBD, RecEncaBD, Recibo } from '../models/cobro';
import { IsaService } from './isa.service';
import { environment } from 'src/environments/environment';
import { Cheque, ChequeBD } from '../models/cheques';
import { Email } from '../models/email';

@Injectable({
  providedIn: 'root'
})
export class IsaCobrosService {
  
  cxc: Pen_Cobro[] = [];
  reciboBD: RecEncaBD = {
    coD_CIA : 'ISLENA',
    nuM_REC : '',
    coD_CLT : '',
    coD_TIP_DC : '5',
    coD_ZON : this.isa.varConfig.numRuta,
    feC_PRO : new Date(),
    inD_ANL : 'A',
    inD_MON : 'L',
    moN_DOC_LOC : 0,
    moN_DOC_DOL : 0,
    moN_EFE_LOCAL : 0,
    moN_EFE_DOLAR : 0,
    moN_CHE_DOLAR : 0,
    moN_CHE_LOCAL : 0,
    hoR_INI : new Date(),
    hoR_FIN : new Date(),
    doC_PRO : null,
    impreso : 'N',
    ncfmodificado : null,
    moN_TAR_LOCAL : 0,
    moN_TAR_DOLAR : 0,
    moN_TRANS_LOCAL : 0,
    moN_TRANS_DOLAR : 0,
    moN_DEP_LOCAL : 0,
    moN_DEP_DOLAR : 0,
    moN_BONCER_LOCAL : 0,
    moN_BONCER_DOLAR : 0,
    createDate : new Date(),
    createdBy : 'ISA',
    noteExistsFlag : 0,
    recordDate : new Date(),
    rowPointer : '',
    updatedBy : 'ISA',
    APLICACION : '',
  }

  detalleReciboBD: RecDetaBD[] = [];
  detalleRec: RecDetaBD;

  constructor( private isa: IsaService,
               private http: HttpClient ) { }

  cargarCxC( codCliente: string ){
    let c: Pen_Cobro[] = [];

    if (localStorage.getItem('cxc')){
      c = JSON.parse(localStorage.getItem('cxc'));
      this.cxc = c.filter( d => d.codCliente == codCliente && d.tipoDocumen == '1' && d.saldoLocal > 0);
      if ( this.cxc.length > 0 ){
        c = this.cxc.slice(0);
        this.cxc = c.sort((a,b) => new Date(a.fechaDoc).getTime() - new Date(b.fechaDoc).getTime());
      }
    }
  }

  private guardarRecibo( recibo: Recibo ){           // Guarda el Recibo en el Local Storage
    let recibosLS: Recibo[] = [];

    if (localStorage.getItem('recibos')){
      recibosLS = JSON.parse( localStorage.getItem('recibos'));
    }
    recibosLS.push( recibo );
    localStorage.setItem('recibos', JSON.stringify(recibosLS));
  }

  transmitirRecibo( recibo: Recibo, cheque: Cheque, hayCheque: boolean, nuevo: boolean ){

    let rowPointer: string = '';
    this.detalleReciboBD = [];
    let email: Email;

    email = new Email( this.isa.clienteAct.email, `RECIBO DE DINERO ${recibo.numeroRecibo}`, this.getBody(recibo) );

    rowPointer = this.isa.generate();

    this.reciboBD.nuM_REC = recibo.numeroRecibo;
    this.reciboBD.coD_CLT = recibo.codCliente.toString();
    this.reciboBD.coD_ZON = this.isa.varConfig.numRuta;
    this.reciboBD.moN_DOC_LOC = recibo.montoLocal;
    this.reciboBD.moN_DOC_DOL = recibo.montoDolar;
    this.reciboBD.moN_EFE_LOCAL = recibo.montoEfectivoL;
    this.reciboBD.moN_EFE_DOLAR = recibo.montoEfectivoD;
    this.reciboBD.moN_CHE_DOLAR = recibo.montoChequeD;
    this.reciboBD.moN_CHE_LOCAL = recibo.montoChequeL;
    this.reciboBD.moN_TAR_LOCAL = recibo.montoTarjetaL;
    this.reciboBD.moN_TAR_DOLAR = recibo.montoTarjetaD;
    this.reciboBD.moN_DEP_LOCAL = recibo.montoDepositoL;
    this.reciboBD.moN_DEP_DOLAR = recibo.montoDepositoD;
    this.reciboBD.rowPointer = rowPointer;
    this.reciboBD.APLICACION = recibo.observaciones;

    for (let i = 0; i < recibo.detalle.length; i++) {
      rowPointer = this.isa.generate();
      this.detalleRec = new RecDetaBD();
      if ( recibo.detalle[i].tipoDocumen == '1' ){
        this.detalleRec.coD_TIP_DC = '5';
        this.detalleRec.nuM_DOC = recibo.numeroRecibo;
        this.detalleRec.moN_SAL_LOC = recibo.detalle[i].saldoLocal;
        this.detalleRec.moN_SAL_DOL = recibo.detalle[i].saldoDolar;
      } else {
        this.detalleRec.coD_TIP_DC = '7';
        this.detalleRec.nuM_DOC = recibo.detalle[i].numeroDocumen;
        this.detalleRec.moN_SAL_LOC = recibo.detalle[i].saldoNCFL;
        this.detalleRec.moN_SAL_DOL = recibo.detalle[i].saldoNCFD;
      }
      this.detalleRec.coD_ZON = this.isa.varConfig.numRuta;
      this.detalleRec.coD_CLT = recibo.codCliente.toString();
      this.detalleRec.nuM_REC = recibo.numeroRecibo;
      this.detalleRec.nuM_DOC_AF = recibo.detalle[i].numeroDocumenAf;
      this.detalleRec.feC_DOC = recibo.detalle[i].fechaDocu;
      this.detalleRec.moN_MOV_LOCAL = recibo.detalle[i].abonoLocal;
      this.detalleRec.moN_MOV_DOL = recibo.detalle[i].abonoDolar;
      
      this.detalleRec.rowPointer = rowPointer;
      this.detalleReciboBD.push(this.detalleRec);
    } 

    if (nuevo) {
      this.guardarRecibo( recibo );                              // Se guarda el pedido en el Local Stotage
    }

    this.postRecibo( this.reciboBD ).subscribe(                    // Transmite el encabezado del pedido al Api
      resp => {
        console.log('Success RecEnca...', resp);
        this.agregarDetalle( this.detalleReciboBD, cheque, hayCheque, email );
      }, error => {
        console.log('Error RecEnca ', error);
        this.isa.presentaToast( 'Error de Envío...' );
      }
    );
    console.log('Encabezado JSON',JSON.stringify(this.reciboBD));
    console.log('Detalle JSON',JSON.stringify(this.detalleReciboBD));
  }

  agregarDetalle( detalle: RecDetaBD[], cheque: Cheque, hayCheque: boolean, email: Email ) {
    console.log('Inicia detalle');
    this.postReciboDetalle( detalle ).subscribe(
      resp2 => {
        console.log('Success Detalle...', resp2);
        this.isa.enviarEmail( email );
        email.toEmail = this.isa.varConfig.email;
        this.isa.enviarEmail( email );
        if ( hayCheque ){
          this.transmitirCheque( cheque );
        }
        this.isa.presentaToast( 'Recibo Transmitido con Exito...' );
      }, error => {
        console.log('Error en Recibo ', error);
        console.log('debemos borrar el enca del recibo...');
        this.isa.presentaToast( 'Error de Envío...' );
      }
    );
  }

  private getBody ( recibo: Recibo ){
    let body: string[] = [];

    body.push(`Fecha: ${this.getFecha(recibo.fecha)}<br/>`);
    body.push(`Cliente: ${recibo.codCliente} - ${this.isa.clienteAct.nombre}<br/>`)
    body.push(`Monto: ${this.colones(recibo.montoLocal)}<br/>`);
    body.push(`<br/>`);
    body.push(`----------------------------- Detalle ----------------------------<br/>`);
    recibo.detalle.forEach( d => {
      body.push(`Documento: ${d.numeroDocumen} - Monto: ${this.colones(d.montoLocal)} - Abono: ${this.colones(d.abonoLocal)}. Saldo: ${this.colones(d.saldoLocal)}<br/>`);
    });
    body.push(`<br/>`);
    body.push(`Atentamente<br/>`);
    body.push(`Departamento de Crédito y Cobro.<br/>`);
    body.push(`Distribuidora La Isleña.<br/>`);
    return body.join('');
  }

  private getFecha( fecha: Date ){
    let day = fecha.getDate();
    let month = fecha.getMonth()+1;
    let year = fecha.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private colones (amount, decimalCount = 2, decimal = ".", thousands = ","){
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
    const negativeSign = amount < 0 ? "-" : "";
    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;
    return negativeSign + '¢' + (j ? i.substr(0, j) + thousands : '') + 
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + 
      (decimalCount ? decimal + Math.abs(amount - Number(i)).toFixed(decimalCount).slice(2) : "");
  }

  transmitirCheque( cheque: Cheque ){
    let chequeBD: ChequeBD = {
      coD_CIA: 'ISLENA',
      coD_ZON: this.isa.varConfig.numRuta,
      coD_BCO: cheque.codigoBanco,
      coD_CLT: cheque.codCliente,
      nuM_REC: cheque.numeroRecibo,
      nuM_CHE: cheque.numeroCheque,
      nuM_CTA: cheque.numeroCuenta,
      moN_CHE: cheque.monto,
      tiP_DOC: '5',
      feC_CHE: new Date(),
      noteExistsFlag: 0,
      recordDate: new Date(),
      rowPointer: this.isa.generate(),
      createdBy: 'ISA',
      updatedBy: 'ISA',
      createDate: new Date()
    }
    this.postCheque( chequeBD ).subscribe(
      resp => {
        console.log('Success Cheque...', resp);
      }, error => {
        console.log('Error en Cheque', error);
      }
    );
  }

  borrarRecibos(){
    if (localStorage.getItem('recibos')){
      localStorage.removeItem('recibos');
    }
  }

  private postRecibo( recEncaBD: RecEncaBD ){
    const URL = this.isa.getURL( environment.RecEncaURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(recEncaBD), options );
  }

  private postReciboDetalle( detalle: RecDetaBD[] ){
    const URL = this.isa.getURL( environment.RecDetaURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(detalle), options );
  }

  private postCheque( cheque: ChequeBD ){
    const URL = this.isa.getURL( environment.ChequeURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(cheque), options );
  }

}
