
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PedDeta, PedEnca, Pedido } from '../models/pedido';
import { IsaService } from './isa.service';

@Injectable({
  providedIn: 'root'
})
export class IsaPedidoService {


  constructor( private isa: IsaService,
               private http: HttpClient ) {

  }

  guardarPedido( pedido: Pedido ){
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

  actualizaEstadoPedido ( numPedido: string, estado: boolean ){
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

  transmitirPedido( pedido: Pedido ){
    let detalleBD: PedDeta;
    let arrDetBD: PedDeta[] = [];
    let rowPointer: string = '';
    let tax: number;
    const fecha = new Date();
    let fechaDesp = new Date();
    const numPedido = pedido.numPedido;

    fechaDesp.setDate( fecha.getDate() + 1);
    rowPointer = this.isa.generate();

    const pedidoBD = new PedEnca("ISLENA", pedido.numPedido, this.isa.varConfig.numRuta, pedido.codCliente.toString(), '1', fecha, fecha, fechaDesp, fecha, pedido.iva,
                                  0, pedido.subTotal + pedido.iva, pedido.subTotal, pedido.descuento, pedido.detalle.length, this.isa.clienteAct.listaPrecios, 
                                  pedido.observaciones, null, 'N', this.isa.clienteAct.diasCredito.toString(), this.isa.varConfig.bodega.toString(), 'CRI', 'N', 'ND', 
                                  pedido.porcentajeDescGeneral, 0, pedido.descGeneral, 0, 'N', 'N', 'N', null, null, null, this.isa.nivelPrecios, 'L', 0, fecha, 
                                  rowPointer, 'ISA', 'ISA', fecha, null, this.isa.clienteAct.divGeografica1, this.isa.clienteAct.divGeografica2, null, null, null, 
                                  '512211');

    for (let i = 0; i < pedido.detalle.length; i++) {
      tax = this.calculaImpuesto( pedido.detalle[i].impuesto ) * 100;
      rowPointer = this.isa.generate();
      detalleBD = new PedDeta( i + 1, pedido.numPedido, 'ISLENA', pedido.detalle[i].codProducto.toString(), '0', null, pedido.detalle[i].precio, 
                        pedido.detalle[i].descuento * 100 / pedido.detalle[i].subTotal, pedido.detalle[i].subTotal, pedido.detalle[i].descuento,
                        pedido.detalle[i].precio, pedido.detalle[i].cantidad, 0, null, this.isa.clienteAct.listaPrecios, null, 0, fecha, rowPointer, 
                        'ISA', 'ISA', fecha, pedido.detalle[i].impuesto.slice(0,2), pedido.detalle[i].impuesto.slice(2), null, null, 0, 0, tax, 0, 'N', 
                        pedido.detalle[i].esCanastaBasica );
      arrDetBD.push(detalleBD);
    }

    this.guardarPedido( pedido );                              // Se guarda el pedido en el Local Stotage

    this.postPedidos( pedidoBD ).subscribe(                    // Transmite el encabezado del pedido al Api
      resp => {
        console.log('Success Encabezado...', resp);
        this.agregarDetalle( numPedido, arrDetBD );
      }, error => {
        console.log('Error Encabezado ', error);
        this.isa.presentaToast( 'Error de Envío...' );
      }
    );
    
    console.log('Encabezado JSON',JSON.stringify(pedidoBD));
    console.log('Detalle JSON ', JSON.stringify(arrDetBD));
  }

  agregarDetalle( numPedido: string, detalle: PedDeta[] ) {
    console.log('Inicia detalle');
    this.postPedidoDetalle( detalle ).subscribe(
      resp2 => {
        console.log('Success Detalle...', resp2);
        this.actualizaEstadoPedido( numPedido, true );
        this.isa.presentaToast( 'Pedido Transmitido con Exito...' );
      }, error => {
        console.log('Error Detalle ', error);
        console.log('debemos borrar el enca del pedido...');
        this.isa.presentaToast( 'Error de Envío...' );
      }
    );
  }

  private postPedidos( pedido: PedEnca ){
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( environment.PedEncaURL, JSON.stringify(pedido), options );
  }

  private postPedidoDetalle( detalle: PedDeta[] ){
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( environment.PedDetaURL, JSON.stringify(detalle), options );
  }

  calculaImpuesto( texto: string ){
    if (texto == '0101'){
      return 0;
    } else if (texto == '0102'){
      return 0.1;
    } else if (texto == '0103'){
      return 0.2;
    } else if (texto == '0104'){
      return 0.4;
    } else if (texto == '0108'){
      return 0.13;
    } else {
      return 0;
    }
  }

}
