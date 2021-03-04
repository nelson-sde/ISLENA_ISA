
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Productos } from 'src/app/models/productos';
import { DetallePedido, Existencias, Pedido } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';
import { AlertController, IonList, NavController, PopoverController} from '@ionic/angular';
import { IsaPedidoService } from 'src/app/services/isa-pedido.service';
import { Cardex } from 'src/app/models/cardex';
import { PedidoFooterComponent } from '../pedido-footer/pedido-footer.component';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';


@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage {

  busquedaProd: Productos[] = [];           // Arreglo que contiene la sublista de productos seleccionados
  producto: Productos;                     // Producto seleccionado de la busqueda     
  texto: string = '';                             // campo de busqueda de productos
  cantidad: number = 6;                        // variable temporal con la cantidad de Items a agregar en el pedido
  descuento: number = 0;                      // variable temporal con el % del descuento
  montoIVA: number;                          // variable temporal con el monto del IVA
  montoDescLinea: number;                // variable temporal con el monto del descuento de la línea del pedido
  montoDescGen: number;                 // Descuento general del pedido
  montoSub: number;                    // variable temporal con el monto bruto del pedido
  montoTotal: number;                 // Variable temporal con el monto del pedido
  pedido: Pedido;                    // Pedido del cliente
  nuevoDetalle: DetallePedido;      // Variable temporal con la nueva linea de pedido 
  j: number = -1;                  // j es el index de la linea que se esta modificando en el detalle
  impuesto: number = 0;
  hayCardex: boolean = false;               // True = se cargó como pedido un cardex del cliente
  mostrarListaProd: boolean = false;       // La seleccion de productos respondio multiples lineas
  mostrarProducto: boolean = false;       // True: Se ha seleccionado un producto para agregar al pedido
  defaultCant: boolean = true;           // Boolean que nos indica si estamos agregando cantidades o descuentos
  pedidoSinSalvar: boolean = false;     // nos indica si hemos iniciado con un pedido
  modificando: boolean = false;        // Si es true se esta modificando una linea del pedido


  @ViewChild('myList') ionList: IonList;

  constructor( private activateRoute: ActivatedRoute,
               private isaConfig: IsaService,
               private isaPedido: IsaPedidoService,
               private isaCardex: IsaCardexService,
               private alertController: AlertController,
               private navController: NavController,
               private popoverController: PopoverController ) {

    this.activateRoute.params.subscribe((data: any) => {    // Como parametro ingresa al modulo la info del cliente del rutero
      //this.cliente = new Cliente(data.codCliente, data.nombreCliente, data.dirCliente, 0, 0);
      this.pedido = new Pedido( this.isaConfig.varConfig.consecutivoPedidos, this.isaConfig.clienteAct.id, 0, 0, 0, 0, 0, 0, '', false);
      const fecha = new Date();
      this.pedido.fechaEntrega.setDate( fecha.getDate() + 1);
      this.validaSiCardex();
    });
  }

  validaSiCardex(){
    let prod: Productos[] = [];
    let result: Cardex[] = [];

    this.isaCardex.cargarCardex();
    result = this.isaCardex.cardex.filter( d => d.codCliente == this.isaConfig.clienteAct.id && d.aplicado == false )
    if ( result.length > 0 ){
      this.hayCardex = true;
      for (let i = 0; i < result.length; i++) {
        prod = this.isaConfig.productos.filter(p => p.id == result[i].codProducto);
        this.impuesto = this.calculaImpuesto( prod[0].impuesto );
        this.montoSub = result[i].cantPedido * prod[0].precio;
        this.montoIVA = this.montoSub * this.impuesto;
        this.montoTotal = this.montoSub + this.montoIVA;
        this.nuevoDetalle = new DetallePedido(result[i].codProducto, prod[0].nombre, prod[0].precio, result[i].cantPedido, this.montoSub, this.montoIVA, 
                                              0, 0, this.montoTotal, prod[0].impuesto, prod[0].canastaBasica);
        this.pedido.detalle.push( this.nuevoDetalle );
        this.pedido.subTotal = this.pedido.subTotal + this.nuevoDetalle.subTotal;
        this.pedido.iva = this.pedido.iva + this.nuevoDetalle.iva;
        this.pedido.descuento = this.pedido.descuento + this.nuevoDetalle.descuento;
        this.pedido.total = this.pedido.total + this.nuevoDetalle.total;
        this.pedidoSinSalvar = true;
      }
      this.texto = '';
      this.mostrarListaProd = false;
      this.mostrarProducto = false;
      this.cantidad = 0;
      this.descuento = 0;
      this.montoIVA = 0;
      this.montoDescLinea = 0;
      this.montoDescGen = 0;
      this.montoSub = 0;
      this.montoTotal = 0;
      this.defaultCant = true;
    }
  }

  buscarProducto(){

    if ( !this.mostrarListaProd ){
      if (this.texto.length !== 0) {    
        this.busqueda();                  // Llena el arreglo BusquedaProd con los articulos que cumplen la seleccion
      }
    } else {
      console.log(this.busquedaProd);
      const listaAux = this.busquedaProd.filter( d => d.seleccionado );
      console.log(listaAux);
      if ( listaAux.length == 1 ){   // Un solo producto seleccionado
        this.productoSelect(0);
      } else if ( listaAux.length > 1 ){          // Se seleccionaron varios productos
        this.busquedaProd = listaAux.slice(0);
        this.productoSelect( -1 );
      } else {                    // No se seleccionó ningún producto o se cambio el texto de seleccion
        this.busquedaProd = [];
        // this.mostrarListaProd = false;
        this.busqueda();
      }
    }
  }

  busqueda(){
    if (isNaN(+this.texto)) {            // Se buscará por código de producto
      // Se recorre el arreglo para buscar coincidencias
      this.mostrarProducto = false;
      for (let i = 0; i < this.isaConfig.productos.length; i++) {
        if (this.isaConfig.productos[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
            this.busquedaProd.push(this.isaConfig.productos[i]);
        }
      }
    } else {                      // la busqueda es por codigo de producto
      const product = this.isaConfig.productos.find( e => e.id == this.texto );
      if ( product !== undefined ){
        this.busquedaProd.push(product);
        this.productoSelect(0);
      }
    }
    if (this.busquedaProd.length == 0){                    // no hay coincidencias
      this.isaConfig.presentAlertW( this.texto, 'No hay coincidencias' );
      this.texto = '';
      this.mostrarListaProd = false;
      this.mostrarProducto = false;
    } else if (this.busquedaProd.length == 1){        // La coincidencia es exacta
      this.productoSelect(0);
    } else {
      this.mostrarListaProd = true;                // Se muestra el Arr busquedaProd con el subconjunto de productos
    }
  }

  productoSelect( i: number ){                  // Cuando se seleciona un producto, se quita la lista de seleccion
    this.mostrarListaProd = false;             // Y se activa el flag de mostrar producto
    if ( i >= 0 ){
      this.busquedaProd[i].seleccionado = false;
      this.producto = this.busquedaProd[i];
      this.texto = this.busquedaProd[i].nombre;
      this.impuesto = this.calculaImpuesto( this.busquedaProd[i].impuesto );
      const j = this.existeEnDetalle(this.busquedaProd[i].id);
      if (j >= 0){
        this.cantidad = this.pedido.detalle[j].cantidad;
        this.descuento = this.pedido.detalle[j].descuento * 100 / this.pedido.detalle[j].subTotal;
        this.modificando = true;
        this.j = j;
        this.pedido.subTotal = this.pedido.subTotal - this.pedido.detalle[j].subTotal;
        this.pedido.iva = this.pedido.iva - this.pedido.detalle[j].iva;
        this.pedido.descuento = this.pedido.descuento - this.pedido.detalle[j].descuento;
        this.pedido.total = this.pedido.total - this.pedido.detalle[j].total;
      }
      this.mostrarProducto = true;
    } else {      // Se seleccionaron varios articulos
      for (let x = 0; x < this.busquedaProd.length; x++) {
        if ( this.existeEnDetalle(this.busquedaProd[x].id) < 0 ) {   // si el articulo no existe en el detalle se agrega
          this.impuesto = this.calculaImpuesto( this.busquedaProd[x].impuesto );
          this.montoSub = 1 * this.busquedaProd[x].precio;
          this.montoIVA = this.montoSub * this.impuesto;
          this.montoTotal = this.montoSub + this.montoIVA;
          this.nuevoDetalle = new DetallePedido(this.busquedaProd[x].id, this.busquedaProd[x].nombre, this.busquedaProd[x].precio, 1, this.montoSub, this.montoIVA, 
                                                0, 0, this.montoTotal, this.busquedaProd[x].impuesto, this.busquedaProd[x].canastaBasica);
          this.pedido.detalle.unshift( this.nuevoDetalle );
          this.pedido.subTotal = this.pedido.subTotal + this.nuevoDetalle.subTotal;
          this.pedido.iva = this.pedido.iva + this.nuevoDetalle.iva;
          this.pedido.descuento = this.pedido.descuento + this.nuevoDetalle.descuento;
          this.pedido.total = this.pedido.total + this.nuevoDetalle.total;
        }
        this.busquedaProd[x].seleccionado = false;
      }
      this.pedidoSinSalvar = true;
      this.texto = '';
      this.mostrarListaProd = false;
      this.mostrarProducto = false;
      this.cantidad = 6;
      this.descuento = 0;
      this.montoIVA = 0;
      this.montoDescLinea = 0;
      this.montoDescGen = 0;
      this.montoSub = 0;
      this.montoTotal = 0;
      this.impuesto = 0;
      this.defaultCant = true;
    }
    this.busquedaProd = [];
  }

  existeEnDetalle( id: string ){
    if ( this.pedido.detalle.length !== 0 ){
      const j = this.pedido.detalle.findIndex( data => data.codProducto == id );
      return j;
    } else {
      return -1;
    }
  }

  accionPedido( event: any ){          // Segmento de IONIC que determina si la cantidad a ingresar es Q o Descuentos
    const a = event.detail;
    if(a.value.toString() == 'desc'){
      this.defaultCant = false;
    } else if(a.value.toString() == 'cant'){
      this.defaultCant = true;
    } 
  }

  calculaLineaPedido(){           // Boton de aceptar la linea de pedido
    this.montoSub = this.cantidad * this.producto.precio;
    this.montoDescLinea = this.montoSub * this.descuento / 100;
    this.montoDescGen = (this.montoSub - this.montoDescLinea) * this.pedido.porcentajeDescGeneral / 100;
    this.montoIVA = (this.montoSub - this.montoDescLinea - this.montoDescGen) * this.impuesto;
    this.montoTotal = this.montoSub + this.montoIVA - this.montoDescLinea - this.montoDescGen;

    if (this.modificando){          // Si modificando = true se esta modificando una linea del detalle
      this.pedido.detalle[this.j].cantidad = this.cantidad;
      this.pedido.detalle[this.j].subTotal = this.montoSub;
      this.pedido.detalle[this.j].iva = this.montoIVA;
      this.pedido.detalle[this.j].descuento = this.montoDescLinea;
      this.pedido.detalle[this.j].descGeneral = this.montoDescGen;
      this.pedido.detalle[this.j].total = this.montoTotal;
      this.modificando = false;
      this.j = -1;
    } else {                        // SINO se esta creando una nueva linea de detalle
      this.nuevoDetalle = new DetallePedido(this.producto.id, this.producto.nombre, this.producto.precio, this.cantidad, this.montoSub, this.montoIVA, 
                                  this.montoDescLinea, this.montoDescGen,this.montoTotal, this.producto.impuesto, this.producto.canastaBasica);
      this.pedido.detalle.unshift( this.nuevoDetalle );
    }
    this.pedido.subTotal = this.pedido.subTotal + this.montoSub;
    this.pedido.iva = this.pedido.iva + this.montoIVA;
    this.pedido.descuento = this.pedido.descuento + this.montoDescLinea;
    this.pedido.descGeneral = this.pedido.descGeneral + this.montoDescGen;
    this.pedido.total = this.pedido.total + this.montoTotal;
    
    this.pedidoSinSalvar = true;
    this.texto = '';
    this.mostrarListaProd = false;
    this.mostrarProducto = false;
    this.cantidad = 6;
    this.descuento = 0;
    this.montoIVA = 0;
    this.montoDescLinea = 0;
    this.montoDescGen = 0;
    this.montoSub = 0;
    this.montoTotal = 0;
    this.impuesto = 0;
    this.defaultCant = true;
  }

  masFunction(){
    if (this.defaultCant){ moveTo
      this.cantidad = this.cantidad + 1;
    } else {
      this.descuento = this.descuento + this.descuentoPermitido( this.isaConfig.clienteAct.id, this.producto.id );
    }
  }

  menosFunction(){
    if (this.defaultCant && this.cantidad > 0){
      this.cantidad = this.cantidad - 1;
    }else if( this.descuento > 0 ){
      this.descuento = this.descuento - 1;
    }
  }

  carrito(){
    if (this.pedidoSinSalvar){
      this.isaPedido.validaPedido( this.pedido, 'N' );     // Transmite mediante el API el pedido a Isleña; N = nuevo pedido
      this.isaCardex.actualizaAplicado(this.isaConfig.clienteAct.id);
      this.isaConfig.varConfig.consecutivoPedidos = this.isaConfig.nextConsecutivo( this.isaConfig.varConfig.consecutivoPedidos );
      this.isaConfig.guardarVarConfig();
      this.pedidoSinSalvar = false;
      this.texto = '';
      this.mostrarListaProd = false;
      this.mostrarProducto = false;
      this.cantidad = 6;
      this.descuento = 0;
      this.montoIVA = 0;
      this.montoDescLinea = 0;
      this.montoDescGen = 0;
      this.montoSub = 0;
      this.montoTotal = 0;
      this.defaultCant = true;
      this.impuesto = 0;
      this.pedido = new Pedido( this.isaConfig.varConfig.consecutivoPedidos, this.isaConfig.clienteAct.id, 0, 0, 0, 0, 0, 0, '', false);
    }
  }

  descuentoPermitido( codCliente: string, codProducto: string ){
    return 5;
  }

  borrarDetalle( i: number ){
    let data: DetallePedido[] = [];

    this.pedido.subTotal = this.pedido.subTotal - this.pedido.detalle[i].subTotal;
    const descGen = this.pedido.subTotal * this.pedido.porcentajeDescGeneral / 100;
    this.pedido.descuento = this.pedido.descuento - this.pedido.detalle[i].descuento;
    this.pedido.descGeneral = this.pedido.descGeneral - this.pedido.detalle[i].descGeneral;
    this.pedido.iva = this.pedido.iva - this.pedido.detalle[i].iva;
    this.pedido.total = this.pedido.total - this.pedido.detalle[i].total;

    if (i > 0){
      data = this.pedido.detalle.slice(0, i);
    } 
    if (i+1 < this.pedido.detalle.length){
      data = data.concat(this.pedido.detalle.slice(i+1, this.pedido.detalle.length));
    }
    this.pedido.detalle = data.slice(0);
  }

  editarDetalle( i: number ){
    this.cantidad = this.pedido.detalle[i].cantidad;
    this.descuento = this.pedido.detalle[i].descuento * 100 / this.pedido.detalle[i].subTotal;  // % descuento linea
    this.producto = this.isaConfig.productos.find(data => data.id == this.pedido.detalle[i].codProducto);  // Funcion que retorna el producto a editar
    this.texto = this.producto.nombre;
    this.impuesto = this.calculaImpuesto( this.producto.impuesto );
    this.mostrarListaProd = false;
    this.mostrarProducto = true;
    this.modificando = true;
    this.j = i;
    this.pedido.subTotal = this.pedido.subTotal - this.pedido.detalle[i].subTotal;
    this.pedido.iva = this.pedido.iva - this.pedido.detalle[i].iva;
    this.pedido.descuento = this.pedido.descuento - this.pedido.detalle[i].descuento;
    this.pedido.descGeneral = this.pedido.descGeneral - this.pedido.detalle[i].descGeneral;
    this.pedido.total = this.pedido.total - this.pedido.detalle[i].total;
    this.ionList.closeSlidingItems();
  }

  async presentAlertSalir() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Cuidado!!!',
      message: 'Desea salir del pedido.  Se perdera la informacion no salvada.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Si',
          handler: () => {
            this.navController.back();
          }
        }
      ]
    });
    await alert.present();
  }

  async pedidoFooter(ev: any) {
    const popover = await this.popoverController.create({
      component: PedidoFooterComponent,
      componentProps: {value: this.pedido},
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  async descuentoGeneral(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Descuento General',
      inputs: [
        {
          name: 'descuento',
          type: 'number',
          placeholder: '%',
          value: this.pedido.porcentajeDescGeneral,
          min: -0,
          max: this.isaConfig.clienteAct.descuento,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Ok',
          handler: (data) => {
            this.pedido.porcentajeDescGeneral = +data.descuento;
            this.recalcularDesGeneral();
          }
        }
      ]
    });

    await alert.present();
  }

  recalcularDesGeneral(){               // esta función recalcula el descuento general si existen lineas en el detalle
    let montoDescGen: number;
    let montoIVA: number;
    let montoTotal: number;
    let tax: number;

    if (this.pedido.detalle.length > 0){
      for (let i = 0; i < this.pedido.detalle.length; i++) {
        tax = this.calculaImpuesto(this.pedido.detalle[i].impuesto);
        montoDescGen = (this.pedido.detalle[i].subTotal - this.pedido.detalle[i].descuento) * this.pedido.porcentajeDescGeneral / 100;
        montoIVA = (this.pedido.detalle[i].subTotal - this.pedido.detalle[i].descuento - montoDescGen) * tax;
        montoTotal = this.pedido.detalle[i].subTotal + montoIVA - this.pedido.detalle[i].descuento - montoDescGen;
        this.pedido.descGeneral = this.pedido.descGeneral - this.pedido.detalle[i].descGeneral + montoDescGen;
        this.pedido.detalle[i].descGeneral = montoDescGen;
        this.pedido.iva = this.pedido.iva - this.pedido.detalle[i].iva + montoIVA;
        this.pedido.detalle[i].iva = montoIVA;
        this.pedido.total = this.pedido.total - this.pedido.detalle[i].total + montoTotal;
        this.pedido.detalle[i].total = montoTotal;
      }
    }
  }

  async observaciones(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Observaciones',
      inputs: [
        {
          name: 'observacion',
          id: 'paragraph',
          type: 'textarea',
          placeholder: 'Texto',
          value: this.pedido.observaciones
        },
        {
          name: 'entrega',
          id: 'entrega',
          type: 'date',
          placeholder: 'Fecha entrega',
          value: new Date(this.pedido.fechaEntrega)
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Ok',
          handler: (data) => {
            this.pedido.observaciones = data.observacion;
            this.pedido.fechaEntrega = new Date(data.entrega);
            console.log(data.entrega);
            console.log(this.pedido.fechaEntrega);
          }
        }
      ]
    });

    await alert.present();
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

  async ingresaCantidad(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Cantidades!',
      inputs: [
        {
          name: 'cantidad',
          type: 'number',
          placeholder: 'Cantidad',
          min: 0,
          max: 1000
        },
        {
          name: 'descuento',
          type: 'number',
          placeholder: 'Descuento',
          min: 0,
          max: 1000
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
          handler: (data) => {
            console.log('Confirm Ok', data);
            if (data.cantidad.length > 0){
              this.cantidad = +data.cantidad;
            }
            if (data.descuento.length > 0){
              this.descuento = +data.descuento;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  existencia(){
    console.log(this.producto);
    this.isaPedido.getExistencias( this.producto.id ).subscribe(
      resp => {
        console.log('Success Existencias...', resp);
        this.mostrarExistencias( resp );
      }, error => {
        console.log('Error Existencias ', error);
        this.isaConfig.presentaToast( 'Error Leyendo Datos...' );
      }
    );
  }

  mostrarExistencias( existe: Existencias[] ){
    const str = 'Cantidad: ' + existe[0].existencia.toString();
    this.isaConfig.presentAlertW(this.producto.nombre, str);
  }

  regresar(){
    if (this.pedidoSinSalvar){
      this.presentAlertSalir();
    } else {
      this.navController.back();
    }
  }

}
