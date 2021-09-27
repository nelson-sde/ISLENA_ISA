import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Liquidaciones, Pen_Cobro, RecAnulado, RecDetaBD, RecEncaBD, Recibo } from '../models/cobro';
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

  guardarRecibo( recibo: Recibo ){           // Guarda el Recibo en el Local Storage
    let recibosLS: Recibo[] = [];

    if (localStorage.getItem('recibos')){
      recibosLS = JSON.parse( localStorage.getItem('recibos'));
      const i = recibosLS.findIndex( d => d.numeroRecibo === recibo.numeroRecibo );
      if ( i === -1 ){
        recibosLS.push( recibo );
      } else {
        recibosLS[i] = recibo;
      }
    } else {
      recibosLS.push( recibo );
    }
    localStorage.setItem('recibos', JSON.stringify(recibosLS));
  }

  private guardarCheque( cheque: Cheque ){
    let chequesLS: Cheque[] = [];

    if (localStorage.getItem('cheques')){
      chequesLS = JSON.parse( localStorage.getItem('cheques'));
    }
    chequesLS.push( cheque );
    localStorage.setItem('cheques', JSON.stringify(chequesLS));
  }

  consultarCheque( numRecibo: string ){
    let cheques: Cheque[] = [];
    let cheque: Cheque

    if (localStorage.getItem('cheques')){
      cheques = JSON.parse( localStorage.getItem('cheques'));
    }
    if (cheques.length > 0){
      cheque = cheques.find(d => d.numeroRecibo === numRecibo);
    }
    return cheque;
  }

  private actualizaVisita( idCliente: string ){
    const existe = this.isa.rutero.findIndex( d => d.cliente === idCliente );
    if (existe >= 0){
      this.isa.rutero[existe].razon = 'E';
      localStorage.setItem('rutero', JSON.stringify(this.isa.rutero));
    }
  }

  transmitirRecibo( recibo: Recibo, cheque: Cheque, hayCheque: boolean, nuevo: boolean ){
    let rowPointer: string = '';
    let email: Email;
    const cliente = this.isa.clientes.find( d => d.id === recibo.codCliente );

    if ( cliente !== undefined ){

      email = new Email( cliente.email, `RECIBO DE DINERO ${recibo.numeroRecibo}`, this.getBody(recibo, cheque, cliente.nombre) );

      rowPointer = this.isa.generate();
      this.actualizaVisita( recibo.codCliente );

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
      this.reciboBD.inD_MON = recibo.moneda;
 
      if (nuevo) {
        this.guardarRecibo( recibo );                              // Se guarda el pedido en el Local Stotage
        if (hayCheque){
          this.guardarCheque( cheque );
        }
      }
      this.postRecibo( this.reciboBD ).subscribe(                    // Transmite el encabezado del pedido al Api
        resp => {
          console.log('Success RecEnca...', resp);
          this.isa.addBitacora( true, 'TR', `Recibo: ${recibo.numeroRecibo}, transmitido Encabezado con exito`);
          this.agregarDetalle( recibo, cheque, hayCheque, email );
          this.transmitirISA_Liquid( recibo );       // inserta el recibo en ISA_Liquidaciones
        }, error => {
          console.log('Error RecEnca ', error);
          this.isa.addBitacora( false, 'TR', `Recibo: ${recibo.numeroRecibo}, falla en Encabezado. ${error.message}`);
          this.isa.presentaToast( 'Error de Envío...' );
        }
      );
      console.log('Encabezado JSON',JSON.stringify(this.reciboBD));
    } else {
      this.isa.presentAlertW( 'Transmitir Recibo', 'Imposible transmitir recibo. Datos del cliente inconsistentes');
    }
  }

  agregarDetalle( recibo: Recibo, cheque: Cheque, hayCheque: boolean, email: Email ) {
    let detalleRec: RecDetaBD;
    let detalleRecBD: RecDetaBD[] = [];
    let rowPointer: string;

    for (let i = 0; i < recibo.detalle.length; i++) {
      rowPointer = this.isa.generate();
      detalleRec = new RecDetaBD();
      if ( recibo.detalle[i].tipoDocumen == '1' ){
        detalleRec.coD_TIP_DC = '5';
        detalleRec.nuM_DOC = recibo.numeroRecibo;
        detalleRec.moN_SAL_LOC = recibo.detalle[i].saldoLocal;
        detalleRec.moN_SAL_DOL = recibo.detalle[i].saldoDolar;
      } else {
        detalleRec.coD_TIP_DC = '7';
        detalleRec.nuM_DOC = recibo.detalle[i].numeroDocumen;
        detalleRec.moN_SAL_LOC = recibo.detalle[i].saldoNCFL;
        detalleRec.moN_SAL_DOL = recibo.detalle[i].saldoNCFD;
      }
      detalleRec.coD_ZON = this.isa.varConfig.numRuta;
      detalleRec.coD_CLT = recibo.codCliente.toString();
      detalleRec.nuM_REC = recibo.numeroRecibo;
      detalleRec.nuM_DOC_AF = recibo.detalle[i].numeroDocumenAf;
      detalleRec.feC_DOC = recibo.detalle[i].fechaDocu;
      detalleRec.moN_MOV_LOCAL = recibo.detalle[i].abonoLocal;
      detalleRec.moN_MOV_DOL = recibo.detalle[i].abonoDolar;
      
      detalleRec.rowPointer = rowPointer;
      detalleRecBD.push(detalleRec);
    }
    console.log('Inicia detalle');
    console.log('Detalle JSON',JSON.stringify(detalleRecBD));

    this.postReciboDetalle( detalleRecBD, recibo.tipoDoc ).subscribe(
      resp2 => {
        console.log('Success Detalle...', resp2);
        this.isa.addBitacora( true, 'TR', `Recibo: transmitido Detalle con exito`);
        this.actualizaEstadoRecibo(detalleRecBD[0].nuM_DOC, true);
        if ( hayCheque ){
          this.transmitirCheque( cheque );
        }
        if (email.toEmail !== undefined && email.toEmail !== null && email.toEmail !== '') {
          if (email.toEmail.length > 0){
            this.isa.enviarEmail( email );
          }
        }
        email.toEmail = this.isa.varConfig.emailVendedor;
        this.isa.enviarEmail( email );
        email.toEmail = this.isa.varConfig.emailCxC;
        this.isa.enviarEmail( email );
        this.isa.transmitiendo.pop();
        this.isa.presentaToast( 'Recibo Transmitido con Exito...' );
      }, error => {
        console.log('Error en Recibo ', error);
        this.isa.addBitacora( false, 'TR', `Detalle Recibo FALLÓ... ${error.message}.`);
        console.log('debemos borrar el enca del recibo...');
        this.isa.transmitiendo.pop();
        this.isa.presentaToast( 'Error de Envío...' );
      }
    );
  }

  retransmitirRecibo( recibo: Recibo ){
    let hayCheque: boolean = false;
    let cheque: Cheque;

    this.isa.addBitacora( true, 'START', `Retransmite Recibo: ${recibo.numeroRecibo}`);
    cheque = this.consultarCheque( recibo.numeroRecibo );
    if ( cheque !== undefined ){
      hayCheque = true;
    } else {
      cheque = new Cheque('', '', '', '', '', 0);
    }
    this.transmitirRecibo( recibo, cheque, hayCheque, false);
  }

  retransRecibosPen(){
    let recibos: Recibo[] = [];
    let temp: Recibo[] = [];

    if (localStorage.getItem('recibos')){
      temp = JSON.parse(localStorage.getItem('recibos'));
      recibos = temp.filter( d => !d.envioExitoso );
      if ( recibos.length > 0 ){                          // Si hay recibos sin transmitir
        recibos.forEach( d => {
          this.retransmitirRecibo( d );
        });
      }
    }
  }

  reciboSimple( recibo: Recibo, nuevo: boolean ){     // nuevo = true: se inserta el recibo en el Local Storage
    let email: Email;
    let cheque: Cheque = new Cheque('','','','','',0);
    let reciboBD: RecAnulado = {
      coD_CIA:       'ISLENA',
      nuM_REC:       recibo.numeroRecibo,
      coD_TIP_DC:    recibo.tipoDoc,
      ruta:          recibo.numeroRuta,
      coD_CLT:       recibo.codCliente,
      feC_PRO:       recibo.fecha,
      moN_DOC_LOC:   recibo.montoLocal,
      moN_DOC_DOL:   recibo.montoDolar,
      moN_EFE_LOCAL: recibo.montoEfectivoL,
      moN_EFE_DOLAR: recibo.montoEfectivoD,
      moN_CHE_DOLAR: recibo.montoChequeD,
      moN_CHE_LOCAL: recibo.montoChequeD,
      doC_LIQ:       'N',
      feC_LIQ:       null,
      ejecutivA_CXC: null,
      aplicacion:    recibo.observaciones,
      recordDate:    new Date(),
      createdBy:     'ISA',
      updatedBy:     'ISA',
      createDate:    new Date(),
      inD_MON:       recibo.moneda,
      montO_OTR:     recibo.otrosMov,
      montO_NC:      recibo.monto_NC
    }

    const cliente = this.isa.clientes.find( d => d.id === recibo.codCliente );
    email = new Email( cliente.email, `NOTIFICACION POR COBRO DE DINERO RUTA: ${recibo.numeroRuta}`, this.getBody(recibo, cheque, cliente.nombre, false) );
    if (nuevo) {
      this.guardarRecibo( recibo );                              // Se guarda el recibo en el Local Stotage
    }
    this.postTransfer( reciboBD ).subscribe(
      resp => {
        console.log('Recibo de Transferencia Insertado', resp);
        this.isa.addBitacora( true, 'TR', `Recibo: ${recibo.numeroRecibo}, transmitido Encabezado con exito`);
        this.agregarDetalle( recibo, cheque, false, email );
        this.isa.presentaToast( 'Recibo Transmitido con Exito...' );
      }, error => {
        console.log('Error en Recibo ', error);
        this.isa.addBitacora( false, 'TR', `Recibo FALLÓ... ${error.message}.`);
        console.log('debemos borrar el enca del recibo...');
        this.isa.presentaToast( 'Error de Envío...!!!' );
      }
    );
  }

  private actualizaEstadoRecibo( numRecibo: string, estado: boolean ){
    let recibosLS: Recibo[] = [];

    if (localStorage.getItem('recibos')){
      recibosLS = JSON.parse( localStorage.getItem('recibos'));
      const i = recibosLS.findIndex( data => data.numeroRecibo == numRecibo );
      if (i >= 0){
        recibosLS[i].envioExitoso = estado;
        localStorage.setItem('recibos', JSON.stringify(recibosLS));
      }
    }
  }

  private getBody ( recibo: Recibo, cheque: Cheque, nombre: string, numRecibo: boolean = true, nulo: boolean = false ){
    let body: string[] = [];
    let texto: string = '';
    let efectivo: string = '  ';
    let hayCheque: string = '  ';
    let etiqueta: string = 'Recibo de Dinero';
    let day = new Date(recibo.fecha).getDate();
    let month = new Date(recibo.fecha).getMonth()+1;
    let year = new Date(recibo.fecha).getFullYear();
    let saldoAnterior: number = 0;
    let saldoActual: number = 0;

    if (recibo.tipoDoc === 'T'){
      etiqueta = 'Transferencia';
    }

    body.push(`<TABLE BORDER  CELLPADDING=5 CELLSPACING=0>`);
    body.push(`<Tr><Th ROWSPAN=2><img src="https://di.cr/image/catalog/logotipo_front_home1.png"  width="227" height="70"></Th><Th ROWSPAN=2>Distribuidora Isleña de Alimentos S.A.<Br>Cédula Juridica 3-101-109180</Th><Th>${etiqueta}</Th></Tr>`);
    
    body.push(`<Tr><Td><font color="red">${recibo.numeroRecibo}</font></Td></Tr>`);
    
    if ( nulo ){ 
      body.push(`<Tr><Td ALIGN=center COLSPAN=2><font color="red">**** NULO ****</font></Td><Td ALIGN=right>Fecha: ${day} - ${month} - ${year}</Td></Tr>`);
    } else {
      body.push(`<Tr><Td ALIGN=right COLSPAN=3>Fecha: ${day} - ${month} - ${year}</Td></Tr>`);
    }
    body.push(`</TABLE>`);
    body.push(`<br>`);
    body.push(`RECIBIMOS DE: ${nombre}.<br>`);
    body.push(`<br>`);
    body.push(`Código: ${recibo.codCliente} LA SUMA DE: ${this.colones(recibo.montoLocal)} colones.<br>`);
    body.push(`<br>`);
    
    recibo.detalle.forEach( d => {
      texto = texto.concat(`, ${d.numeroDocumen}`);
      saldoAnterior += d.montoLocal;
      saldoActual += d.saldoLocal; 
    });
    saldoAnterior = saldoActual + recibo.montoLocal;
    body.push(`POR CONCEPTO DE: Abono a Factura${texto}. ${recibo.observaciones}`);
    body.push(`<br>`);
    body.push(`<br>`);

    if (recibo.montoEfectivoL > 0){
      efectivo = 'X';
    }
    if (recibo.montoChequeL > 0){
      hayCheque = 'X';
    }
    const saldo = saldoActual - recibo.monto_NC - recibo.otrosMov;

    body.push(`[${efectivo}] Efectivo   [${hayCheque}] Cheque No. ${cheque.numeroCheque}, Banco: ${cheque.codigoBanco}<br>`);
    body.push(`<br>`);
    body.push(`<TABLE BORDER  CELLPADDING=5 CELLSPACING=0>`);
    body.push(`<Tr><Td>Saldo Anterior: </Td><Td ALIGN=right>${this.colones(saldoAnterior)}</Td></Tr>`);
    body.push(`<Tr><Td>Este abono: </Td><Td ALIGN=right>${this.colones(recibo.montoLocal)}</Td></Tr>`);
    body.push(`<Tr><Td>Saldo Actual: </Td><Td ALIGN=right>${this.colones(saldoActual)}</Td></Tr>`);
    body.push(`<Tr><Td>Notas Crédito: - </Td><Td ALIGN=right>${this.colones(recibo.monto_NC)}</Td></Tr>`);
    body.push(`<Tr><Td>Otros Cargos: - </Td><Td ALIGN=right>${this.colones(recibo.otrosMov)}</Td></Tr>`);
    body.push(`<Tr><Td>Saldo: </Td><Td ALIGN=right>${this.colones(saldo)}</Td></Tr>`);
    body.push(`</TABLE>`);
    body.push(`<br>`);
    if ( recibo.tipoDoc === 'T'){
      body.push(`Nota: La validez de esta transacción queda sujeta a qué se compruebe la confirmación de los fondos en nuestras cuentas bancarias.<br>`);
    } else {
      body.push(`Nota: La validez de este recibo queda sujeta a que el banco honre su cheque.<br>`);
    }
    body.push(`<br>`);
    body.push(`Atentamente<br/>`);
    body.push(`Departamento de Crédito y Cobro.<br>`);
    body.push(`Distribuidora Isleña de Alimentos S.A.<br>`);
    body.push(`Barreal de Heredia, de la Embotelladora Pepsi 100m Este, 500m Norte.<br>`);
    body.push(`Tel: (506)2293-0609 - Fax: (506)2293-3231. Apdo: 463-1200 Pavas.<br>`);
    body.push(`www.distribuidoraislena.com<br>`);

    return body.join('');
  }

  /*private getFecha( fecha: Date ){
    let day = new Date(fecha).getDate();
    let month = new Date(fecha).getMonth()+1;
    let year = new Date(fecha).getFullYear();

    return `${day}-${month}-${year}`;
  }*/

  colones (amount, decimalCount = 2, decimal = ".", thousands = ","){
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
        this.isa.addBitacora( true, 'TR', `Transmite Cheque número: ${cheque.numeroCheque}`);
      }, error => {
        console.log('Error en Cheque', error);
        this.isa.addBitacora( false, 'TR', `Error al transmitir Cheque número: ${cheque.numeroCheque}. ${error.message}`);
      }
    );
  }

  private transmitirISA_Liquid( recibo: Recibo ){
    let liquid: Liquidaciones = {
      coD_CIA:       'ISLENA',
      nuM_REC:       recibo.numeroRecibo,
      coD_TIP_DC:    recibo.tipoDoc,
      ruta:          recibo.numeroRuta,
      coD_CLT:       recibo.codCliente,
      feC_PRO:       recibo.fecha,
      moN_DOC_LOC:   recibo.montoLocal,
      moN_DOC_DOL:   recibo.montoDolar,
      moN_EFE_LOCAL: recibo.montoEfectivoL,
      moN_EFE_DOLAR: recibo.montoEfectivoD,
      moN_CHE_DOLAR: recibo.montoChequeD,
      moN_CHE_LOCAL: recibo.montoChequeL,
      doC_LIQ:       'N',
      feC_LIQ:       null,
      ejecutivA_CXC: null,
      aplicacion:    recibo.observaciones,
      recordDate:    new Date(),
      createdBy:     'ISA',
      updatedBy:     null,
      createDate:    new Date(),
      inD_MON:       recibo.moneda,
      montO_OTR:     recibo.otrosMov,
      montO_NC:      recibo.monto_NC
    }

    this.postISA_Liquid( liquid ).subscribe(
      resp => {
        console.log('Otros Movimientos Insertado');
      }, error => {
        this.isa.addBitacora( false, 'TR', `Recibo FALLÓ en ISA_Liquidación... ${error.message}.`);
        console.log('Error al insertar Otros Movimientos...!!!', error);
      }
    );
  }

  borrarRecibos( completo: boolean ){    // Si completo = true, borra todos los recibos de la tabla Pedidos
                                        // de lo contrario solo borra los que envioExitoso = true){
    let recibosLS: Recibo[] = [];

    if (localStorage.getItem('recibos')){
      recibosLS = JSON.parse( localStorage.getItem('recibos'));
      const recibos = recibosLS.filter( d => !d.envioExitoso );
      if ( recibos.length > 0 && !completo ){
        localStorage.setItem('recibos', JSON.stringify(recibos));
      } else {
        localStorage.removeItem('recibos');
      }
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

  private postReciboDetalle( detalle: RecDetaBD[], tipo: string ){
    let URL: string;
    if ( tipo === 'R' ){ 
      URL = this.isa.getURL( environment.RecDetaURL, '' );
    } else {
      URL = this.isa.getURL( environment.ISA_Mov_DirURL, '' );
    }
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(detalle), options );
  }

  private postTransfer( recibo: RecAnulado ){
    const URL = this.isa.getURL( environment.LiquidURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(recibo), options );
  }

  private postISA_Liquid( liquid: Liquidaciones ){
    const URL = this.isa.getURL( environment.LiquidURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    console.log('ISA_Liquidacion:', JSON.stringify(liquid));
    return this.http.post( URL, JSON.stringify(liquid), options );
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

  private postAnulaRecibo( reciboAnulado: RecAnulado ){
    const URL = this.isa.getURL( environment.LiquidURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(reciboAnulado), options );
  }

  anularRecibo( recibo: Recibo, reciboAnulado: Recibo ){
    let reciboBD: RecAnulado = {
      coD_CIA:      'ISLENA',
      nuM_REC:       reciboAnulado.numeroRecibo,
      coD_TIP_DC:    '0',
      ruta:          reciboAnulado.numeroRuta,
      coD_CLT:       reciboAnulado.codCliente,
      feC_PRO:       reciboAnulado.fecha,
      moN_DOC_LOC:   reciboAnulado.montoLocal,
      moN_DOC_DOL:   reciboAnulado.montoDolar,
      moN_EFE_LOCAL: reciboAnulado.montoEfectivoL,
      moN_EFE_DOLAR: reciboAnulado.montoEfectivoD,
      moN_CHE_DOLAR: reciboAnulado.montoChequeD,
      moN_CHE_LOCAL: reciboAnulado.montoChequeL,
      doC_LIQ:       'N',
      feC_LIQ:       null,
      ejecutivA_CXC: null,
      aplicacion:    recibo.observaciones,
      recordDate:    new Date(),
      createdBy:     'ISA',
      updatedBy:     'ISA',
      createDate:    new Date(),
      inD_MON:       reciboAnulado.moneda,
      montO_OTR:     recibo.otrosMov,
      montO_NC:      recibo.monto_NC
    }
    let email: Email;
    let cheque: Cheque = new Cheque('', '', '', '', '', 0);

    this.postAnulaRecibo( reciboBD ).subscribe(
      resp => {
        console.log('Recibo Anulado. ', resp);
        this.actualizaEstadoRecibo( reciboBD.nuM_REC, true );
        this.isa.addBitacora( true, 'TR', `Inserta Recibo a Anular: ${reciboBD.nuM_REC}`);
        const cliente = this.isa.clientes.find( d => d.id === recibo.codCliente );
        email = new Email( cliente.email, `RECIBO DE DINERO ${recibo.numeroRecibo}`, this.getBody(recibo, cheque, cliente.nombre, true, true) );
        this.isa.enviarEmail( email );
        email.toEmail = this.isa.varConfig.emailVendedor;
        this.isa.enviarEmail( email );
        email.toEmail = this.isa.varConfig.emailCxC;
        this.isa.enviarEmail( email );
        this.isa.presentaToast( 'Recibo Anulado con Exito...' );
      }, error => {
        console.log('Error insertar recibo nulo. ', error);
        this.isa.addBitacora( false, 'TR', `Error al insertar recibo nulo: ${reciboBD.nuM_REC}. ${error.message}`);
        this.isa.presentaToast( 'Error al Anular Recibo...!!!' );
      }
    )
  }

}
