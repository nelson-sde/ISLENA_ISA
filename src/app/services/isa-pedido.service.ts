
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Email } from '../models/email';
import { Existencias, PedDeta, PedEnca, Pedido } from '../models/pedido';
import { IsaService } from './isa.service';


@Injectable({
  providedIn: 'root'
})
export class IsaPedidoService {


  constructor( private isa: IsaService,
               private http: HttpClient ) {}

  private guardarPedido( pedido: Pedido ){
    let pedidosLS: Pedido[] = [];

    if (localStorage.getItem('pedidos')){
      pedidosLS = JSON.parse( localStorage.getItem('pedidos'));
    }
    pedidosLS.push( pedido );
    localStorage.setItem('pedidos', JSON.stringify(pedidosLS));
  }

  borrarPedidos(){
    if (localStorage.getItem('pedidos')){
      localStorage.removeItem('pedidos');
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

  procesaPedido( pedido: Pedido, frio: boolean, seco: boolean ){
    let pedidoSeco: Pedido;
    let pedidoFrio: Pedido;

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

    pedidoNuevo = new Pedido( pedido.numPedido, pedido.codCliente, 0, 0, 0, pedido.porcentajeDescGeneral, 0, 0, pedido.observaciones, pedido.fechaEntrega, false );
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
    pedidoOriginal = new Pedido( pedido.numPedido, pedido.codCliente, pedido.subTotal, pedido.iva, pedido.descuento, pedido.porcentajeDescGeneral, pedido.descGeneral,
                                pedido.total, pedido.observaciones, pedido.fechaEntrega, false );
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
        this.transmitirPedido( pedidoAux, 'N');
      } else {
        console.log('Pedido final', pedidoOriginal);
        this.isa.addBitacora( true, 'INSERT', `Inserta Pedido: ${pedidoOriginal.numPedido}.`);
        lineas = 0;
        console.log('Transmite: ',this.isa.transmitiendo);
        this.transmitirPedido( pedidoOriginal, 'N');
      }
    }
  }

  private nuevoPedido( pedido: Pedido ){
    let pedidoNuevo: Pedido;

    pedidoNuevo = new Pedido( pedido.numPedido, pedido.codCliente, 0, 0, 0, pedido.porcentajeDescGeneral, 0, 0, pedido.observaciones, pedido.fechaEntrega, false );
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

  transmitirPedido( pedido: Pedido, tipo: string ){    // Tipo = N pedido nuevo; R retransmitir
    let detalleBD: PedDeta;
    let arrDetBD: PedDeta[] = [];
    let rowPointer: string = '';
    let tax: number;
    let email: Email;
    const fechaPedido = this.getFecha( new Date(), 'JSON');
    const fechaEntrega = this.getFecha( pedido.fechaEntrega, 'JSON');
    const numPedido = pedido.numPedido;
    const cliente = this.isa.clientes.find( d => d.id === pedido.codCliente );

    if ( cliente !== undefined ){ 

      email = new Email( this.isa.clienteAct.email, `Pedido: ${pedido.numPedido}`, this.getBody(pedido));
      rowPointer = this.isa.generate();

      if ( tipo == 'N' ){
        this.guardarPedido( pedido );                  // Se guarda el pedido en el Local Stotage
      }
      const pedidoBD = new PedEnca("ISLENA", pedido.numPedido, this.isa.varConfig.numRuta, pedido.codCliente.toString(), '1', new Date(fechaPedido), new Date(fechaPedido), 
                                    new Date(fechaEntrega), new Date(fechaPedido), pedido.iva, 0, pedido.subTotal + pedido.iva, pedido.subTotal, pedido.descuento, 
                                    pedido.detalle.length, cliente.listaPrecios, pedido.observaciones, null, 'N', cliente.diasCredito.toString(), 
                                    this.isa.varConfig.bodega.toString(), 'CRI', 'N', 'ND', pedido.porcentajeDescGeneral, 0, pedido.descGeneral, 0, 'N', 'N', 'N', null, null, null, 
                                    this.isa.nivelPrecios, 'L', 0, new Date(fechaPedido), rowPointer, 'ISA', 'ISA', new Date(fechaPedido), null, cliente.divGeografica1, 
                                    cliente.divGeografica2, null, null, null, '512211');

      for (let i = 0; i < pedido.detalle.length; i++) {
        tax = this.calculaImpuesto( pedido.detalle[i].impuesto ) * 100;
        rowPointer = this.isa.generate();
        detalleBD = new PedDeta( i + 1, pedido.numPedido, 'ISLENA', pedido.detalle[i].codProducto.toString(), '0', null, pedido.detalle[i].precio, 
                          pedido.detalle[i].descuento * 100 / pedido.detalle[i].subTotal, pedido.detalle[i].subTotal, pedido.detalle[i].descuento,
                          pedido.detalle[i].precio, pedido.detalle[i].cantidad, 0, null, cliente.listaPrecios, null, 0, new Date(fechaPedido), rowPointer, 
                          'ISA', 'ISA', new Date(fechaPedido), pedido.detalle[i].impuesto.slice(0,2), pedido.detalle[i].impuesto.slice(2), null, null, pedido.detalle[i].porcenExonerado, 
                          pedido.detalle[i].montoExonerado, tax, 0, 'N', pedido.detalle[i].esCanastaBasica );
        arrDetBD.push(detalleBD);
      } 
      this.postPedidos( pedidoBD ).subscribe(                    // Transmite el encabezado del pedido al Api
        resp => {
          console.log('Success Encabezado...', resp);
          this.isa.addBitacora( true, 'TR', `Pedido: ${pedido.numPedido}, transmitido Encabezado con exito`);
          this.agregarDetalle( numPedido, arrDetBD, email );
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

  private agregarDetalle( numPedido: string, detalle: PedDeta[], email: Email ) {

    console.log('Inicia detalle');
    this.postPedidoDetalle( detalle ).subscribe(
      resp2 => {
        console.log('Success Detalle...', resp2);
        this.isa.addBitacora( true, 'TR', `Pedido: ${numPedido}, transmitido Detalle con exito`);
        this.actualizaEstadoPedido( numPedido, true );
        this.isa.transmitiendo.pop();
          console.log('Transmitió: ', this.isa.transmitiendo);
        this.isa.enviarEmail( email );
        this.isa.presentaToast( 'Pedido Transmitido con Exito...' );
      }, error => {
        console.log('Error Detalle ', error.message);
        this.isa.addBitacora( false, 'TR', `Pedido: ${numPedido}, falla en TR Detalle. ${error.message}`);
        this.isa.transmitiendo.pop();
          console.log('Transmitió: ', this.isa.transmitiendo);
        this.isa.presentaToast( 'Error de Envío...' );
      }
    );
  }

  getBody( pedido: Pedido ){
    let body: string[] = [];
    let texto: string;

    body.push( `Cliente: ${pedido.codCliente} - ${this.isa.clienteAct.nombre}<br/>` );
    body.push(`Fecha Pedido: ${this.getFecha(pedido.fecha)}<br/>`);
    body.push(`Fecha Entrega: ${this.getFecha(pedido.fechaEntrega)}<br/>`);
    body.push(`SubTotal: ${this.colones(pedido.subTotal)}<br/>`);
    body.push(`IVA...........:      ${this.colones(pedido.iva)}<br/>`);
    body.push(`Descuento x Línea: ${this.colones(pedido.descuento)}<br/>`);
    body.push(`Descuento General: ${this.colones(pedido.descGeneral)}<br/>`);
    body.push(`<b>Total...........: ${this.colones(pedido.total)}</b><br/>`);
    body.push('<br/>')
    body.push('------------------- Detalle ----------------<br/>');
    body.push('Item<br/>');
    body.push('Cant - SubTotal -    IVA -   Desc -    Total<br/>');
    body.push('--------------------------------------------<br/>');
    pedido.detalle.forEach( d => {
      texto = `${d.descripcion}<br/>`;
      body.push(texto);
      texto = `Q: ${d.cantidad} - ${this.colones(d.subTotal)} - ${this.colones(d.iva)} - ${this.colones(d.descuento)} - ${this.colones(d.total)}<br/>`;
      body.push(texto);
      
    })

    return body.join('');
  }

  private getFecha( fecha: Date, tipo?: string ){
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
