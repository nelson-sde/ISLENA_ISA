
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Email } from '../models/email';
import { Existencias, PedDeta, PedEnca, Ped_Temp, Pedido } from '../models/pedido';
import { IsaService } from './isa.service';
import { Pen_Cobro } from '../models/cobro';
import { PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import { Platform } from '@ionic/angular';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Plugins, FilesystemDirectory } from "@capacitor/core";
const { Filesystem } = Plugins;
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Rutero, RuteroBD } from '../models/ruta';



@Injectable({
  providedIn: 'root'
})
export class IsaPedidoService {

  actividadComercial = '512211'


  constructor( private isa: IsaService,
               private http: HttpClient,
               private plt: Platform,
               private fileOpener: FileOpener ) {
    PdfMakeWrapper.setFonts(pdfFonts);
  }

  private guardarPedido( pedido: Pedido ){
    let pedidosLS: Pedido[] = [];

    if (localStorage.getItem('pedidos')){
      pedidosLS = JSON.parse( localStorage.getItem('pedidos'));
    }
    pedidosLS.push( pedido );
    localStorage.setItem('pedidos', JSON.stringify(pedidosLS));
  }

  private guardarEnCxC( pedido: Pedido ){
    let cxcLS: Pen_Cobro[] = [];

    if (localStorage.getItem('cxc')){
      cxcLS = JSON.parse( localStorage.getItem('cxc'));
    }
    const cxcItem = new Pen_Cobro( this.isa.varConfig.numRuta, '0', pedido.numPedido, pedido.codCliente, 0, pedido.total, 0, pedido.total, pedido.fecha,
                          pedido.fecha, this.isa.clienteAct.diasCredito.toString() );
    cxcLS.unshift( cxcItem );
    localStorage.setItem('cxc', JSON.stringify(cxcLS));
  }

  borrarPedidos( completo: boolean ){    // Si completo = true, borra todos los pedidos de la tabla Pedidos
                                        // de lo contrario solo borra los que envioExitoso = true
    let pedidosLS: Pedido[] = [];

    if (localStorage.getItem('pedidos')){
      pedidosLS = JSON.parse( localStorage.getItem('pedidos'));
      const pedidos = pedidosLS.filter( d => !d.envioExitoso );
      if ( pedidos.length > 0 && !completo ){
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
      } else {
        localStorage.removeItem('pedidos');
      }
    }
  }

  private actualizaEstadoPedido ( numPedido: string, estado: boolean ){
    let pedidosLS: Pedido[] = [];

    if (localStorage.getItem('pedidos')){
      pedidosLS = JSON.parse( localStorage.getItem('pedidos'));
      const i = pedidosLS.findIndex( data => data.numPedido == numPedido );
      if (i >= 0){
        pedidosLS[i].envioExitoso = estado;
        localStorage.setItem('pedidos', JSON.stringify(pedidosLS));
      }
    }
  }

  private actualizaVisita( idCliente: string ){
    const existe = this.isa.rutero.findIndex( d => d.cliente === idCliente );
    if (existe >= 0){
      if (this.isa.rutero[existe].razon == 'N'){
        this.isa.rutero[existe].razon = 'E';
        this.insertRutero(this.isa.rutero[existe]);
        localStorage.setItem('rutero', JSON.stringify(this.isa.rutero));
      }
    }
  }

  private insertRutero(visita: Rutero){
    const item: RuteroBD = {
      ruta: visita.ruta,
      hora: new Date(),
      cliente: visita.cliente,
      tipo: visita.razon,
      latitud: visita.latitud,
      longitud: visita.longitud
    }

    const data: RuteroBD[] = [];
    data.push(item);

    this.postRutero(data).subscribe(
      resp => {
        console.log('Rutero insertado con Exito...');
      }, error => {
        console.log('ERROR insertando Rutero...!!!', error.message);
      }
    );
  }

  private postRutero(data: RuteroBD[]){
    const URL = this.isa.getURL( environment.ruteroURL, '');
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(data), options );
  }

  procesaPedido( pedido: Pedido, frio: boolean, seco: boolean ){
    let pedidoSeco: Pedido;
    let pedidoFrio: Pedido;

    this.actualizaVisita( pedido.codCliente );

    if ( frio && seco ){
      this.isa.addBitacora( true, 'INSERT', `Separa los pedidos de Frio y Seco.  Frio: ${pedido.numPedido}`);
      pedidoFrio = this.separaPedido ( pedido, true );
      this.isa.transmitiendo.push(pedidoFrio.numPedido);
      this.validaPedido( pedidoFrio, 'N' );
      this.isa.nextPedido();
      pedido.numPedido = this.isa.varConfig.consecutivoPedidos;
      this.isa.addBitacora( true, 'INSERT', `Separa los pedidos de Frio y Seco.  Seco: ${pedido.numPedido}`);
      pedidoSeco = this.separaPedido( pedido, false );
      this.isa.transmitiendo.push(pedidoSeco.numPedido);
      this.validaPedido( pedidoSeco, 'N' );
    } else {
      this.isa.transmitiendo.push(pedido.numPedido);
      this.validaPedido( pedido, 'N' );
    }
  }

   // separaPedidos *******************
  // Separa los pedidos en Frio y Seco.  Si Tipo = true crea un nuevo pedido con los productos de Frio.  Si Tipo = false con los productos de Seco.

  private separaPedido( pedido: Pedido, tipo: boolean ){
    let pedidoNuevo: Pedido;

    pedidoNuevo = new Pedido( pedido.numPedido, pedido.codCliente, pedido.fecha, 0, 0, 0, pedido.porcentajeDescGeneral, 0, 0, pedido.observaciones, pedido.fechaEntrega, false,
                              pedido.horaFin );

    pedido.detalle.forEach( d => {
      if ( d.frio == tipo ) {
        pedidoNuevo.detalle.push(d);
        pedidoNuevo.subTotal += d.subTotal;
        pedidoNuevo.iva +=  d.iva;
        pedidoNuevo.descuento += d.descuento
        pedidoNuevo.descGeneral += d.descGeneral; 
        pedidoNuevo.total += d.total;
      }
    });
    return pedidoNuevo;
  }

  private validaPedido( pedido: Pedido, tipo: string ) {       // Tipo = N pedido nuevo; R retransmitir
    let lineas = pedido.detalle.length;
    let pedidoAux: Pedido;
    let pedidoOriginal: Pedido;

    console.log('Pedido original', pedido);
    pedidoOriginal = new Pedido( pedido.numPedido, pedido.codCliente, pedido.fecha, pedido.subTotal, pedido.iva, pedido.descuento, pedido.porcentajeDescGeneral, pedido.descGeneral,
                                pedido.total, pedido.observaciones, pedido.fechaEntrega, false, pedido.horaFin );
    pedidoOriginal.detalle = pedido.detalle.slice(0);

    while ( lineas > 0 ) {
      if ( lineas > environment.cantLineasMaxPedido ){
        pedidoAux = this.nuevoPedido( pedidoOriginal );
        console.log('Nuevo Pedido', pedidoAux);
        this.isa.addBitacora( true, 'INSERT', `Separa Pedido: ${pedidoAux.numPedido}, por cantidad de lineas.`);
        lineas -= environment.cantLineasMaxPedido;
        this.isa.nextPedido();
        pedidoOriginal.numPedido = this.isa.varConfig.consecutivoPedidos;
        this.isa.transmitiendo.push(pedidoOriginal.numPedido);
        console.log('Transmite: ',this.isa.transmitiendo);
        this.transmitirPedTemp( pedidoAux, 'N');
      } else {
        console.log('Pedido final', pedidoOriginal);
        this.isa.addBitacora( true, 'INSERT', `Inserta Pedido: ${pedidoOriginal.numPedido}.`);
        lineas = 0;
        console.log('Transmite: ',this.isa.transmitiendo);
        if (environment.companyCode === '01'){
          this.transmitirPedTemp( pedidoOriginal, 'N');
        } else {
          this.transmitirPedTemp(pedidoOriginal, 'N');
        }
      }
    }
  }

  private nuevoPedido( pedido: Pedido ){
    let pedidoNuevo: Pedido;

    pedidoNuevo = new Pedido( pedido.numPedido, pedido.codCliente, pedido.fecha, 0, 0, 0, pedido.porcentajeDescGeneral, 0, 0, pedido.observaciones, pedido.fechaEntrega, false,
                              pedido.horaFin );
    for (let i = 0; i < environment.cantLineasMaxPedido; i++) {
      pedidoNuevo.detalle.push(pedido.detalle[i]);
      pedidoNuevo.subTotal += pedido.detalle[i].subTotal;
      pedidoNuevo.iva +=  pedido.detalle[i].iva;
      pedidoNuevo.descuento += pedido.detalle[i].descuento
      pedidoNuevo.descGeneral += pedido.detalle[i].descGeneral; 
      pedidoNuevo.total += pedido.detalle[i].total;
      pedido.subTotal -= pedido.detalle[i].subTotal;    // Decrementa los valores de la linea en el pedido original
      pedido.iva -=  pedido.detalle[i].iva;
      pedido.descuento -= pedido.detalle[i].descuento
      pedido.descGeneral -= pedido.detalle[i].descGeneral; 
      pedido.total -= pedido.detalle[i].total;
    } 
    const detAux = pedido.detalle.slice(environment.cantLineasMaxPedido);
    pedido.detalle = detAux.slice(0);
    return pedidoNuevo;
  }

  transmitirPedTemp( pedido: Pedido, tipo: string ){

    // Tipo = N pedido nuevo; R retransmitir

    let arreglo: Ped_Temp[] = [];
    let i = 1;
    
    let tax: number;
    let email: Email;
    let email2: Email;
    const fechaPedido = new Date(new Date(pedido.fecha).getTime() - (new Date(pedido.fecha).getTimezoneOffset() * 60000));
    const fechaEntrega = new Date(new Date(pedido.fechaEntrega).getTime() - (new Date(pedido.fechaEntrega).getTimezoneOffset() * 60000));
    const fechaFin = new Date(new Date(pedido.horaFin).getTime() - (new Date(pedido.horaFin).getTimezoneOffset() * 60000));
    const numPedido = pedido.numPedido;
    const cliente = this.isa.clientes.find( d => d.id === pedido.codCliente );

    if (environment.companyCode == '01'){
      cliente.compania = 'ISLENA';
    }

    if ( cliente !== undefined ){ 

      email = new Email( cliente.email, `Pedido: ${pedido.numPedido}`, this.getBody(pedido, cliente.nombre));

      if ( tipo == 'N' ){
        this.guardarPedido( pedido );      // Se guarda el pedido en el Local Stotage
        this.guardarEnCxC( pedido );
      }
      
      const linea0 = new Ped_Temp(cliente.compania, pedido.numPedido, 0, this.isa.varConfig.numRuta, pedido.codCliente, '1', fechaFin, fechaPedido, fechaEntrega,
                      fechaPedido, pedido.iva, 0, pedido.subTotal + pedido.iva, pedido.subTotal, pedido.descuento, pedido.detalle.length, cliente.listaPrecios, pedido.observaciones, 
                      'N', cliente.diasCredito.toString(), this.isa.varConfig.bodega.toString(), 'CRI', 'N', 'ND', pedido.porcentajeDescGeneral, 0, pedido.descGeneral, 0, this.isa.nivelPrecios,
                      'L', cliente.divGeografica1, cliente.divGeografica2, this.actividadComercial, null, 0, 0, 0, 0, 0, 0, null, null, 0, 0, 0, null);

      arreglo.push(linea0);

      pedido.detalle.forEach(x => {
        tax = this.calculaImpuesto( x.impuesto ) * 100;
        const linea = new Ped_Temp(cliente.compania, pedido.numPedido, i, this.isa.varConfig.numRuta, pedido.codCliente, '1', fechaFin, fechaPedido, fechaEntrega,
                          fechaPedido, 0, 0, 0, 0, 0, pedido.detalle.length, cliente.listaPrecios, null, 'N', null, this.isa.varConfig.bodega.toString(), 'CRI', 'N', 'ND', 0, 0, 0, 0, this.isa.nivelPrecios,
                          'L', null, null, null, x.codProducto, x.precio, x.descuento * 100 / x.subTotal, x.subTotal, x.descuento, x.precio, x.cantidad, x.impuesto.slice(0,2), x.impuesto.slice(2), x.porcenExonerado, 
                          x.montoExonerado, tax, x.esCanastaBasica);
        i += 1;
        arreglo.push(linea);
      });

      this.postPedidosTemp( arreglo ).subscribe(                    
        
        // Transmite el encabezado del pedido al Api

        resp => {

          console.log('Success Encabezado...', resp);
          this.isa.addBitacora( true, 'TR', `Pedido: ${pedido.numPedido}, transmitido Encabezado con exito`);
          this.actualizaEstadoPedido( pedido.numPedido, true );
          email.toEmail = 'mauricio.herra@gmail.com';
          this.isa.enviarEmail( email );
          email.toEmail = this.isa.varConfig.emailVendedor;
          this.isa.enviarEmail( email );

          if ( pedido.total + cliente.saldoCredito > cliente.limiteCredito && cliente.diasCredito > 1){             // Se valida el límite de Crédito
            const texto = `El Cliente ${pedido.codCliente} - ${cliente.nombre}, ha excedido el límite de crédito (¢${cliente.limiteCredito}), con el pedido No. ${pedido.numPedido} por un monto de ${this.colones(pedido.total)}`;
            email2 = new Email( this.isa.varConfig.emailCxC, `${this.isa.varConfig.numRuta}. Limite de Credito Excedido`, texto);
            this.isa.enviarEmail( email2 );
            email2.toEmail = this.isa.varConfig.emailSupervisor;
            this.isa.enviarEmail( email2 );
          }
          if ( cliente.id === this.isa.clienteAct.id ){
            this.isa.clienteAct.saldoCredito += pedido.total;
          }

        }, error => {

          console.log('Error Encabezado ', error.message );
          this.isa.addBitacora( false, 'TR', `Pedido: ${pedido.numPedido}, falla en Encabezado. ${error.message}`);
          this.isa.transmitiendo.pop();
          console.log('Transmitió: ', this.isa.transmitiendo);
          this.isa.presentaToast( 'Error de Envío...' );
        }
      );
      
    } else {
      this.isa.presentAlertW( 'Transmitir Pedido', 'Imposible transmitir pedido. Datos del cliente inconsistentes');
    }
  }

  /*
  transmitirPedido( pedido: Pedido, tipo: string ){    // Tipo = N pedido nuevo; R retransmitir
    let detalleBD: PedDeta;
    let arrDetBD: PedDeta[] = [];
    let rowPointer: string = '';
    let tax: number;
    let email: Email;
    let email2: Email;
    const fechaPedido = new Date(new Date(pedido.fecha).getTime() - (new Date(pedido.fecha).getTimezoneOffset() * 60000));
    const fechaEntrega = new Date(new Date(pedido.fechaEntrega).getTime() - (new Date(pedido.fechaEntrega).getTimezoneOffset() * 60000));
    const fechaFin = new Date(new Date(pedido.horaFin).getTime() - (new Date(pedido.horaFin).getTimezoneOffset() * 60000));
    //const fechaPedido = this.getFecha( new Date(), 'JSON');
    //const fechaEntrega = this.getFecha( pedido.fechaEntrega, 'JSON');
    const numPedido = pedido.numPedido;
    const cliente = this.isa.clientes.find( d => d.id === pedido.codCliente );

    if ( cliente !== undefined ){ 

      email = new Email( cliente.email, `Pedido: ${pedido.numPedido}`, this.getBody(pedido, cliente.nombre));
      rowPointer = this.isa.generate();

      if ( tipo == 'N' ){
        this.guardarPedido( pedido );                  // Se guarda el pedido en el Local Stotage
        this.guardarEnCxC( pedido );
      }
      const pedidoBD = new PedEnca("ISLENA", pedido.numPedido, this.isa.varConfig.numRuta, pedido.codCliente.toString(), '1', fechaFin, fechaPedido, 
                                    fechaEntrega, fechaPedido, pedido.iva, 0, pedido.subTotal + pedido.iva, pedido.subTotal, pedido.descuento, 
                                    pedido.detalle.length, cliente.listaPrecios, pedido.observaciones, null, 'N', cliente.diasCredito.toString(), 
                                    this.isa.varConfig.bodega.toString(), 'CRI', 'N', 'ND', pedido.porcentajeDescGeneral, 0, pedido.descGeneral, 0, 'N', 'N', 'N', null, null, null, 
                                    this.isa.nivelPrecios, 'L', 0, fechaPedido, rowPointer, 'ISA', 'ISA', fechaPedido, null, cliente.divGeografica1, 
                                    cliente.divGeografica2, null, null, null, '512211');

      for (let i = 0; i < pedido.detalle.length; i++) {
        tax = this.calculaImpuesto( pedido.detalle[i].impuesto ) * 100;
        rowPointer = this.isa.generate();
        detalleBD = new PedDeta( i + 1, pedido.numPedido, 'ISLENA', pedido.detalle[i].codProducto.toString(), '0', null, pedido.detalle[i].precio, 
                          pedido.detalle[i].descuento * 100 / pedido.detalle[i].subTotal, pedido.detalle[i].subTotal, pedido.detalle[i].descuento,
                          pedido.detalle[i].precio, pedido.detalle[i].cantidad, 0, null, cliente.listaPrecios, null, 0, fechaPedido, rowPointer, 
                          'ISA', 'ISA', fechaPedido, pedido.detalle[i].impuesto.slice(0,2), pedido.detalle[i].impuesto.slice(2), null, null, 
                          pedido.detalle[i].porcenExonerado, pedido.detalle[i].montoExonerado, tax, 0, 'N', pedido.detalle[i].esCanastaBasica );
        arrDetBD.push(detalleBD);
      } 
      this.postPedidos( pedidoBD ).subscribe(                    // Transmite el encabezado del pedido al Api
        resp => {

          console.log('Success Encabezado...', resp);
          this.isa.addBitacora( true, 'TR', `Pedido: ${pedido.numPedido}, transmitido Encabezado con exito`);
          this.agregarDetalle( numPedido, arrDetBD, email );                                                       // Si es exitoso envia el detalle

          if ( pedido.total + cliente.saldoCredito > cliente.limiteCredito && cliente.diasCredito > 1){             // Se valida el límite de Crédito
            const texto = `El Cliente ${pedido.codCliente} - ${cliente.nombre}, ha excedido el límite de crédito (¢${cliente.limiteCredito}), con el pedido No. ${pedido.numPedido} por un monto de ${this.colones(pedido.total)}`;
            email2 = new Email( this.isa.varConfig.emailCxC, `${this.isa.varConfig.numRuta}. Limite de Credito Excedido`, texto);
            this.isa.enviarEmail( email2 );
            email2.toEmail = this.isa.varConfig.emailSupervisor;
            this.isa.enviarEmail( email2 );
          }
          if ( cliente.id === this.isa.clienteAct.id ){
            this.isa.clienteAct.saldoCredito += pedido.total;
          }
        }, error => {
          console.log('Error Encabezado ', error.message );
          this.isa.addBitacora( false, 'TR', `Pedido: ${pedido.numPedido}, falla en Encabezado. ${error.message}`);
          this.isa.transmitiendo.pop();
          console.log('Transmitió: ', this.isa.transmitiendo);
          this.isa.presentaToast( 'Error de Envío...' );
        }
      );
      
      console.log('Encabezado JSON',JSON.stringify(pedidoBD));
      console.log('Detalle JSON ', JSON.stringify(arrDetBD));
    } else {
      this.isa.presentAlertW( 'Transmitir Pedido', 'Imposible transmitir pedido. Datos del cliente inconsistentes');
    }
  }
  */

  private agregarDetalle( numPedido: string, detalle: PedDeta[], email: Email ) {

    console.log('Inicia detalle');
    this.postPedidoDetalle( detalle ).subscribe(
      resp2 => {
        console.log('Success Detalle...', resp2);
        this.isa.addBitacora( true, 'TR', `Pedido: ${numPedido}, transmitido Detalle con exito`);
        this.actualizaEstadoPedido( numPedido, true );
        this.isa.transmitiendo.pop();
        console.log('Transmitió: ', this.isa.transmitiendo);
        this.isa.presentaToast( 'Pedido Transmitido con Exito...' );
        if (email.toEmail !== undefined && email.toEmail !== null && email.toEmail !== '') {
          if (email.toEmail.length > 0){
            this.isa.enviarEmail( email );
          }
        }
        email.toEmail = this.isa.varConfig.emailVendedor;
        this.isa.enviarEmail( email );
      }, error => {
        console.log('Error Detalle ', error.message);
        this.isa.addBitacora( false, 'TR', `Pedido: ${numPedido}, falla en TR Detalle. ${error.message}`);
        this.isa.transmitiendo.pop();
          console.log('Transmitió: ', this.isa.transmitiendo);
        this.isa.presentaToast( 'Error de Envío...' );
      }
    );
  }

  proforma( pedido: Pedido ){
    let email: Email;

    const cliente = this.isa.clientes.find( d => d.id === pedido.codCliente );
    email = new Email( cliente.email, `PROFORMA: ${pedido.numPedido}`, this.getBody(pedido, cliente.nombre));
    //email = new Email( 'mauricio.herra@gmail.com', `PROFORMA: ${pedido.numPedido}`, this.getBody(pedido, cliente.nombre));
    this.isa.enviarEmail( email );
    email.toEmail = this.isa.varConfig.emailVendedor;
    this.isa.enviarEmail( email );
    this.crearPDF(pedido, cliente.nombre);
  }

  getBody( pedido: Pedido, nombre: string ){     // nombre = nombre del cliente del pedido
    let body: string[] = [];
    let texto: string;
    let descuento: number = pedido.descuento + pedido.descGeneral;

    body.push( `<h1>Cliente: ${pedido.codCliente} - ${nombre}</h1>` );
    body.push(`<TABLE><TR><TD>Fecha Pedido: </TD><TD>${this.getFecha(pedido.fecha)}</TD></TR>`);
    body.push(`<TR><TD>Fecha Entrega: </TD><TD>${this.getFecha(pedido.fechaEntrega)}</TD></TR></TABLE>`);
    body.push('<br/>');
    body.push('<TABLE BORDER>');
    body.push('<TR><TH>Cant</TH><TH>Código</TH><TH>Descripción</TH><TH>Precio</TH><TH>IVA</TH><TH>Desc</TH><TH>Total</TH></TR>');
    
    pedido.detalle.forEach( d => {
      texto = `<TR><TD>${d.cantidad}</TD><TD>${d.codProducto}</TD><TD>${d.descripcion}</TD><TD ALIGN=right>${this.colones(d.precio)}</TD><TD ALIGN=right>${d.porcenIVA}%</TD><TD ALIGN=right>${d.porcenDescuento}%</TD><TD ALIGN=right>${this.colones(d.total)}</TD></TR>`;
      body.push(texto);
    });
    texto = `<TR><TD COLSPAN=4><B>TOTALES</B></TD><TD ALIGN=right><B>${this.colones(pedido.iva)}</B></TD><TD ALIGN=right><B>${this.colones(descuento)}</B></TD><TD ALIGN=right><B>${this.colones(pedido.total)}</B></TD></TR>`;
      body.push(texto);
    body.push('</TABLE>');
    body.push('<br>');
    body.push('Notas:<br>');
    body.push(`${pedido.observaciones}<br>`);
    body.push('<br>');
    body.push('Este correo ha sido enviado de forma automática con carácter informativo.<br/>');
    body.push('Favor no responder o escribir a esta cuenta, cualquier consulta pueden dirigirse con Servicio al Cliente ');
    body.push('al 2293-0609 o servicioalcliente@di.cr <br/>');
    body.push('<br/>');
    body.push('Distribuidora Isleña de Alimentos<br/>');

    return body.join('');
  }

  crearPDF( pedido: Pedido, nombre: string ){
    const pdf = new PdfMakeWrapper();
    const descuento = pedido.descuento + pedido.descGeneral;

    pdf.info({
      title: pedido.numPedido,
      author: this.isa.varConfig.numRuta,
      subject: 'PROFORMA',
    });

    pdf.add(new Txt(`P R O F O R M A`).fontSize(18).alignment('center').bold().end);
    pdf.add(
      pdf.ln(2)
    );
    pdf.add(new Txt(`Cliente: ${pedido.codCliente} - ${nombre}`).fontSize(16).alignment('left').bold().end);
    pdf.add(
      pdf.ln(2)
    );
    pdf.add(new Txt(`Fecha Pedido: ${this.getFecha(pedido.fecha)}`).alignment('left').bold().end);
    pdf.add(
      pdf.ln(2)
    );

    pdf.add(new Table([
      [ new Txt('Can').alignment('center').bold().end,
        new Txt('Código').alignment('center').bold().end,
        new Txt('Descripción').alignment('center').bold().end,
        new Txt('Precio').alignment('center').bold().end,
        new Txt('IVA').alignment('center').bold().end,
        new Txt('Desc').alignment('center').bold().end,
        new Txt('Total').alignment('center').bold().end,
      ]]).widths([ 25, 50, 120, 60, 40, 40, 80 ]).end);

      pedido.detalle.forEach( d => {
        pdf.add(new Table([
          [ new Txt(`${d.cantidad}`).alignment('center').end,
            new Txt(`${d.codProducto}`).alignment('center').end,
            new Txt(`${d.descripcion}`).alignment('left').end,
            new Txt(`${this.colones(d.precio)}`).alignment('right').end,
            new Txt(`${d.porcenIVA}%`).alignment('center').end,
            new Txt(`${d.porcenDescuento}%`).alignment('center').end,
            new Txt(`${this.colones(d.total)}`).alignment('right').end,
          ]]).widths([ 25, 50, 120, 60, 40, 40, 80 ]).end);
      });

      pdf.add(new Table([
        [ new Txt('TOTALES').alignment('center').bold().end,
          new Txt(`${this.colones(pedido.iva)}`).alignment('right').bold().end,
          new Txt(`${this.colones(descuento)}`).alignment('right').bold().end,
          new Txt(`${this.colones(pedido.total)}`).alignment('right').bold().end,
        ]]).widths([ 219, 70, 70, 80 ]).end);

      pdf.add(
        pdf.ln(2)
      );
      pdf.add(new Txt(`Notas:`).alignment('left').bold().end);
      pdf.add(new Txt(`${pedido.observaciones}`).alignment('left').bold().end);

      pdf.add(
        pdf.ln(2)
      );
      pdf.add(new Txt(`Este correo ha sido enviado de forma automática con carácter informativo por parte de su Agente de Ventas.`).alignment('left').bold().end);
      pdf.add(new Txt(`Favor no responder o escribir a esta cuenta, cualquier consulta pueden dirigirse con Servicio al Cliente al 2293-0609 o servicioalcliente@di.cr`).alignment('left').bold().end);
      pdf.add(
        pdf.ln(2)
      );
      pdf.add(new Txt(`Distribuidora Isleña.`).alignment('left').bold().end);

      console.log('Capacitor: ', this.plt.is('capacitor'));
      console.log('Directorio: ', FilesystemDirectory.Documents);

      if (this.plt.is('capacitor')){
        pdf.create().getBase64( async (data) => {
          try {
            let path = `${pedido.numPedido}.pdf`;
            const result = await Filesystem.writeFile({
              path,
              data,
              directory: FilesystemDirectory.Documents,
              recursive: true
            });
            this.fileOpener.open(`${result.uri}`, 'application/pdf');
                
          } catch (e) {
            console.log('Error Creando el archivo', JSON.stringify(e));
            this.isa.presentAlertW('PDF', 'Error Creando Archivo PDF');
          }
        });
      } else {
        pdf.create().download(pedido.numPedido);
      }
  }

  getFecha( fecha: Date, tipo?: string ){
    let day = new Date(fecha).getDate();
    let month = new Date(fecha).getMonth() + 1;
    let year = new Date(fecha).getFullYear();
    let dia: string = day.toString();
    let mes: string = month.toString();

    if ( month >= 0 && month <= 9 ) {
      mes = `0${month}`;
    }
    if ( day >= 0 && day <= 9 ){
      dia = `0${day}`;
    }

    if (tipo === 'JSON'){
        return `${year}-${mes}-${dia}T12:00`;
    } else {
      return `${dia}-${mes}-${year}`;
    }
  }

  private postPedidos( pedido: PedEnca ){
    const URL = this.isa.getURL( environment.PedEncaURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    let texto = JSON.stringify(pedido);
    console.log('JSON: ', texto);
    return this.http.post( URL, JSON.stringify(pedido), options );
  }

  private postPedidosTemp( pedido: Ped_Temp[] ){
    const URL = this.isa.getURL( environment.Ped_TempURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    let texto = JSON.stringify(pedido);
    console.log('JSON: ', texto);
    return this.http.post( URL, JSON.stringify(pedido), options );
  }

  private postPedidoDetalle( detalle: PedDeta[] ){
    const URL = this.isa.getURL( environment.PedDetaURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(detalle), options );
  }

  calculaImpuesto( texto: string ){
    if (texto == '0101'){
      return 0;
    } else if (texto == '0102'){
      return 0.01;
    } else if (texto == '0103'){
      return 0.02;
    } else if (texto == '0104'){
      return 0.04;
    } else if (texto == '0108'){
      return 0.13;
    } else {
      return 0;
    }
  }

  getExistencias( codProducto: string ){
    const query: string = environment.Existencias + codProducto;

    return this.http.get<Existencias[]>( query );
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

}
