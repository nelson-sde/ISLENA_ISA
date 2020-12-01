import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Productos } from 'src/app/models/productos';
import { DataProductos } from 'src/app/models/data-productos';
import { Cliente } from 'src/app/models/cliente';
import { Pedido } from 'src/app/models/pedido';
import { DetallePedido } from 'src/app/models/detallePedido';
import { IsaService } from 'src/app/services/isa.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage {

  cliente: Cliente;
  productos: Productos[] = [];
  busquedaProd: Productos[] = [];
  producto: Productos;
  texto: string = '';
  mostrarListaProd: boolean = false;
  mostrarProducto: boolean = false;
  cantidad: number = 6;
  descuento: number = 0;
  montoIVA: number;
  montoDescuento: number;
  montoSub: number;
  montoTotal: number;
  defaultCant: boolean = true;
  pedido: Pedido;
  detallePedido: DetallePedido[] = [];
  nuevoDetalle: DetallePedido;
  pedidoSinSalvar: boolean = false;


  constructor( private activateRoute: ActivatedRoute,
               private isaService: IsaService,
               private alertController: AlertController ) {

    this.activateRoute.params.subscribe((data: any) => {
      console.log(data);
      this.cliente = new Cliente(data.codCliente, data.nombreCliente, data.dirCliente, 0, 0);
      this.productos = DataProductos.slice(0);
      this.pedido = new Pedido( '1', this.cliente.id, 0, 0, 0, 0);
    });
  }

  buscarProducto(){
    if (this.texto.length == 0) {    
      this.mostrarProducto = false;                // Se busca en todos los cliente
      this.busquedaProd = this.productos;         // El modal se abrira con el arreglo completo de clientes
    } else {                                     // Se recorre el arreglo para buscar coincidencias
      this.busquedaProd = [];
      this.mostrarProducto = false;
      for (let i = 0; i < this.productos.length; i++) {
        if (this.productos[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
          this.busquedaProd.push(this.productos[i]);
        }
      }
    }

    if (this.busquedaProd.length == 0){                               // no hay coincidencias
      this.isaService.presentAlertW( this.texto, 'No hay coincidencias' );
      this.texto = '';
      this.mostrarListaProd = false;
      this.mostrarProducto = false;
    } else if (this.busquedaProd.length == 1){                        // La coincidencia es exacta
      this.producto = this.busquedaProd[0];
      this.texto = this.busquedaProd[0].nombre;
      this.mostrarListaProd = false;
      this.mostrarProducto = true;
    } else {
      this.mostrarListaProd = true;
    } 
  }

  productoSelect( i: number ){
    this.mostrarListaProd = false;
    this.producto = this.busquedaProd[i];
    this.texto = this.busquedaProd[i].nombre;
    this.mostrarProducto = true;
  }

  accionPedido( event: any ){
    const a = event.detail;
    if(a.value.toString() == 'desc'){
      this.defaultCant = false;
    } else if(a.value.toString() == 'cant'){
      this.defaultCant = true;
    } 
  }

  calculaLineaPedido(){
    this.montoSub = this.cantidad * this.producto.precio;
    this.montoIVA = this.montoSub * 0.13;
    this.montoDescuento = this.montoSub * this.descuento / 100;
    this.montoTotal = this.montoSub + this.montoIVA - this.montoDescuento;
    this.nuevoDetalle = new DetallePedido(this.producto.id, this.cantidad, this.montoSub, this.montoIVA, this.montoDescuento, 
                                           this.montoTotal);
    this.presentAlertConfirm(this.nuevoDetalle.subTotal, 
                             this.nuevoDetalle.iva, 
                             this.nuevoDetalle.descuento, 
                             this.nuevoDetalle.total );
  }

  async presentAlertConfirm( sub: number, iva: number, desc: number, total: number ) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'Sub: ' + sub.toString() + ' IVA: ' + iva.toString() + ' Des: ' + desc.toString() + ' Total: ' + total.toString(),
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
          handler: () => {
            this.pedido.detalle.push( this.nuevoDetalle );
            this.detallePedido.push(this.nuevoDetalle);
            this.pedido.subTotal = this.pedido.subTotal + this.nuevoDetalle.subTotal;
            this.pedido.iva = this.pedido.iva + this.nuevoDetalle.iva;
            this.pedido.descuento = this.pedido.descuento + this.nuevoDetalle.descuento;
            this.pedido.total = this.pedido.total + this.nuevoDetalle.total;
            this.pedidoSinSalvar = true;
            console.log(this.pedido);
            this.texto = '';
            this.mostrarListaProd = false;
            this.mostrarProducto = false;
            this.cantidad = 6;
            this.descuento = 0;
            this.montoIVA = 0;
            this.montoDescuento = 0;
            this.montoSub = 0;
            this.montoTotal = 0;
            this.defaultCant = true;
            console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }

  masFunction(){
    if (this.defaultCant){
      this.cantidad = this.cantidad + 1;
    } else {
      this.descuento = this.descuento + this.descuentoPermitido( this.cliente.id, this.producto.id );
    }
  }

  menosFunction(){
    if (this.defaultCant && this.cantidad > 0){
      this.cantidad = this.cantidad - 1;
    }else if( this.descuento > 0 ){
      this.descuento = this.descuento - 1;
    }
  }

  carrito(){}

  descuentoPermitido( codCliente: number, codProducto: number ){
    return 5;
  }


}
