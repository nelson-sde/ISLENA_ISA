
import { Component, OnInit, ViewChild } from '@angular/core';
import { Productos } from 'src/app/models/productos';
import { Bonificaciones, DetallePedido, Pedido } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';
import { AlertController, IonList, NavController, PopoverController} from '@ionic/angular';
import { IsaPedidoService } from 'src/app/services/isa-pedido.service';
import { Cardex } from 'src/app/models/cardex';
import { PedidoFooterComponent } from '../pedido-footer/pedido-footer.component';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';


@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  busquedaProd: Productos[] = [];           // Arreglo que contiene la sublista de productos seleccionados
  bonificaciones: Bonificaciones[] = [];   // Arreglo con las bonificaciones de producto
  bonificacion:   Bonificaciones;         // Contiene el objeto de la bonificación si la línea lo posee
  producto: Productos;                     // Producto seleccionado de la busqueda     
  texto: string = '';                             // campo de busqueda de productos
  cantidad: number = 6;                        // variable temporal con la cantidad de Items a agregar en el pedido
  cantBodega: number = 0;
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
  exonerado: number = 0;
  montoExonerado: number = 0;
  hayCardex: boolean = false;               // True = se cargó como pedido un cardex del cliente
  mostrarListaProd: boolean = false;       // La seleccion de productos respondio multiples lineas
  mostrarProducto: boolean = false;       // True: Se ha seleccionado un producto para agregar al pedido
  defaultCant: boolean = true;           // Boolean que nos indica si estamos agregando cantidades o descuentos
  pedidoSinSalvar: boolean = false;     // nos indica si hemos iniciado con un pedido
  modificando: boolean = false;        // Si es true se esta modificando una linea del pedido
  frio: boolean = false;              // True = Pedido tiene líneas con productos categoría de Frio
  seco: boolean = false;             // True = pedido tiene líneas de producto categoria seco.
                                    // Si ambas variables son TRUE, el pedido debe partirse en dos por cada tipo de categoría
  hayBoni = false;                 // True = El artículo tiene bonificación
  numLineas: number = 0;


  @ViewChild('myList') ionList: IonList;

  constructor( private isa: IsaService,
               private isaPedido: IsaPedidoService,
               private isaCardex: IsaCardexService,
               private alertController: AlertController,
               private navController: NavController,
               private popoverController: PopoverController,
               private barcodeScanner: BarcodeScanner,
               private isaCobrosService:IsaCobrosService ) {
  }

   ngOnInit(){
 
    console.log(this.isa.clienteAct, 'clienteAct')
    let fecha = new Date();
    let fecha2 = new Date();
    this.pedido = new Pedido( this.isa.varConfig.consecutivoPedidos, this.isa.clienteAct.id, fecha, 0, 0, 0, 0, 0, 0, '', null, false, null);
    fecha2.setDate(fecha2.getDate() + 1);
    this.pedido.fechaEntrega = fecha2;
    const fec = this.isaPedido.getFecha(this.pedido.fechaEntrega);
    this.pedido.observaciones = `Fecha Entrega: ${fec}`;
    this.isa.addBitacora( true, 'START', `Inicia Pedido: ${this.pedido.numPedido}, del Cliente: ${this.pedido.codCliente} - ${this.isa.clienteAct.nombre}`);
    this.validaSiCardex();
    this.isa.transmitiendo = [];
    this.cargarBonificaciones();
  }

  cargarBonificaciones(){
    this.bonificaciones = JSON.parse(localStorage.getItem('Bonificaciones')) || [];
  }

  validaSiCardex(){
    let prod: Productos[] = [];
    let result: Cardex[] = [];

    result = this.isaCardex.cargarCardexCliente(this.isa.clienteAct.id);
    if ( result.length > 0 ){
      this.hayCardex = true;
      for (let i = 0; i < result.length; i++) {
        prod = this.isa.productos.filter(p => p.id == result[i].codProducto);
        if (prod.length > 0){ 
          this.esFrio( prod[0].frio );
          if ( result[i].cantPedido > 0 ){
            this.impuesto = this.isa.calculaImpuesto( prod[0].impuesto, prod[0].id );
            this.exonerado = this.isa.consultarExoneracion( this.isa.clienteAct.id, prod[0].id )/100;
            this.montoSub = result[i].cantPedido * prod[0].precio;
            this.montoDescLinea = this.montoSub * result[i].descuento / 100;
            this.montoIVA = (this.montoSub - this.montoDescLinea) * this.impuesto;
            this.montoExonerado = this.montoSub * this.exonerado;
            this.montoTotal = this.montoSub + this.montoIVA - this.montoDescLinea;
            this.nuevoDetalle = new DetallePedido(result[i].codProducto, prod[0].nombre, prod[0].precio, result[i].cantPedido, this.montoSub, this.montoIVA, 
                                                  this.montoDescLinea, 0, this.montoTotal, prod[0].impuesto, prod[0].canastaBasica, result[i].descuento, this.impuesto*100, 
                                                  this.exonerado, this.montoExonerado, prod[0].frio );
            this.pedido.detalle.push( this.nuevoDetalle );
            this.pedido.subTotal += this.nuevoDetalle.subTotal;
            this.pedido.iva += this.nuevoDetalle.iva;
            this.pedido.descuento += this.nuevoDetalle.descuento;
            this.pedido.total += this.nuevoDetalle.total;
            this.pedidoSinSalvar = true;
          }
        }
      }
      this.numLineas = this.pedido.detalle.length;
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

  esFrio( frio: boolean ){
    if ( frio ){      // Encendemos el Flag de Frio o Seco
      this.frio = true;
    } else {
      this.seco = true;
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
        this.busquedaProd = listaAux.slice(0);
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
    if (environment.companyCode === '01'){

      // Consideraciones en Isleña

      if (isNaN(+this.texto)) {            // Se buscará por descripción del artículo
        
        this.mostrarProducto = false;

        this.busquedaProd = this.isa.productos.filter( x => x.nombre.toLowerCase().includes(this.texto.toLocaleLowerCase()));

      } else {                      // la busqueda es por codigo de producto
        const codigo = this.texto.toString();
        if ( codigo.length <= environment.maxCharCodigoProd ){    // Busca por código de Producto Isleña
          const product = this.isa.productos.find( e => e.id == this.texto );
          if ( product !== undefined ){
            this.busquedaProd.push(product);
          }
        } else {     // busca por código de barras
          const product = this.isa.productos.find( e => e.codigoBarras == this.texto );
          if ( product !== undefined ){
            this.busquedaProd.push(product);
          }
        }
      }
    } else {

      if (this.texto[0] !== '#') {            // Se buscará por DESCRIPCIÓN de producto

        // Se recorre el arreglo para buscar coincidencias

        this.mostrarProducto = false;
        this.busquedaProd = this.isa.productos.filter( x => x.nombre.toLowerCase().includes(this.texto.toLocaleLowerCase()));

      } else {     // la busqueda es por codigo de producto

        const codigo = this.texto.slice(1);
        const product = this.isa.productos.find( e => e.id == codigo );
        if ( product ){
          this.busquedaProd.push(product);
        }
      
        /*
        const product = this.isa.productos.find( e => e.codigoBarras == codigo );
        if ( product !== undefined ){
          this.busquedaProd.push(product);
        }
        */
        
      }
    }
    
    if (this.busquedaProd.length == 0){                    // no hay coincidencias
      this.isa.presentAlertW( this.texto, 'No hay coincidencias' );
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
      this.cantBodega = this.cantidadBodega( this.producto.id );
      this.impuesto = this.isa.calculaImpuesto( this.busquedaProd[i].impuesto, this.busquedaProd[i].id );

      this.bonificacion = this.bonificaciones.find( x => x.Articulo == this.producto.id && x.Cliente == this.isa.clienteAct.id );
      console.log('Bonificación: ', this.bonificacion);
      if (this.bonificacion){
        this.hayBoni = true;
        if (this.bonificacion.Tipo == 'DESC'){
          this.descuento = this.bonificacion.Bonificacion;
        } else if (this.bonificacion.Tipo == 'ESCA'){
          this.cantidad = this.bonificacion.Cantidad;
          this.descuento = this.bonificacion.Bonificacion;
        } else if (this.bonificacion.Tipo == 'BONI'){
          this.cantidad = this.bonificacion.Cantidad;
        }
      }
      const j = this.existeEnDetalle(this.busquedaProd[i].id);
      if (j >= 0){          // Ya el Item había sido seleccionado anteriormente.
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
          this.esFrio( this.busquedaProd[x].frio );
          this.impuesto = this.isa.calculaImpuesto( this.busquedaProd[x].impuesto, this.busquedaProd[x].id );

          console.log('impuesto Producto', this.impuesto)
          this.exonerado = this.isa.consultarExoneracion( this.isa.clienteAct.id, this.busquedaProd[x].id )/100;
          this.montoSub = 1 * this.busquedaProd[x].precio;
          this.montoExonerado = this.montoSub * this.exonerado;
          this.montoIVA = this.montoSub * this.impuesto;
          this.montoTotal = this.montoSub + this.montoIVA;
          this.nuevoDetalle = new DetallePedido(this.busquedaProd[x].id, this.busquedaProd[x].nombre, this.busquedaProd[x].precio, 1, this.montoSub, this.montoIVA, 
                                                0, 0, this.montoTotal, this.busquedaProd[x].impuesto, this.busquedaProd[x].canastaBasica, 0, this.impuesto*100, 
                                                this.montoExonerado, this.exonerado, this.busquedaProd[x].frio);
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
      this.exonerado = 0;
      this.montoExonerado = 0;
      this.defaultCant = true;
      console.log(this.pedido,'pedido')
    }
    this.busquedaProd = [];
    this.numLineas = this.pedido.detalle.length;
  }

  existeEnDetalle( id: string ){
    if ( this.pedido.detalle.length !== 0 ){
      const j = this.pedido.detalle.findIndex( data => data.codProducto == id );
      return j;
    } else {
      return -1;
    }
  }

  cantidadBodega( codProducto: string ){

    const cant = this.isa.existencias.find( d => d.articulo == codProducto );
    if ( cant !== undefined ){
      return cant.existencia;
    } else {
      return 0;
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
    let hayBoni = false;
    let mod = 0;           // Utilizado para determinar el residuo en la cantidad de una bonificación escalonada
    let div = 0;          // Cantidad de Packs que lleva el cliente

    if (this.bonificacion && this.isa.varConfig.usaBonis){

      // Valida que las bonificaciones se estén usando de manera correcta

      if ( this.descuento > this.bonificacion.Bonificacion && (this.bonificacion.Tipo == 'ESCA' || this.bonificacion.Tipo == 'DESC' )){
        this.isa.presentAlertW('Descuento', 'El descuento es superior al límite permitido');
        return;
      }
      hayBoni = true;         // hayBoni indica que debe crearse una línea por una bonificación

      if (this.bonificacion.Tipo == 'ESCA'){
        if (this.descuento > this.bonificacion.Bonificacion){
          this.isa.presentAlertW('Descuento', 'El artículo tiene un descuento mayor al permitido.');
          return;
        }
        div = Math.floor(this.cantidad / this.bonificacion.Cantidad);
        mod = this.cantidad % this.bonificacion.Cantidad;
        this.cantidad = div * this.bonificacion.Cantidad;
      } else if (this.bonificacion.Tipo == 'BONI'){
        if (this.descuento > 0){
          this.isa.presentAlertW('Descuento', 'El artículo no tiene descuento permitido.');
          return;
        }
        div = Math.floor(this.cantidad / this.bonificacion.Cantidad);
      } else if (this.descuento > this.bonificacion.Bonificacion){
        this.isa.presentAlertW('Descuento', 'El artículo tiene un descuento mayor al permitido.');
        return;
      }
    } else if (this.isa.varConfig.usaBonis && this.descuento > 0){
      this.isa.presentAlertW('Descuento', 'El artículo no tiene descuento permitido.');
      return;
    }
    
    if ( this.cantidad > 0 ){ 
      this.montoSub = this.cantidad * this.producto.precio;
      this.montoDescLinea = this.montoSub * this.descuento / 100;
      this.montoDescGen = (this.montoSub - this.montoDescLinea) * this.pedido.porcentajeDescGeneral / 100;
      this.montoIVA = (this.montoSub - this.montoDescLinea - this.montoDescGen) * this.impuesto;
      this.montoExonerado = (this.montoSub - this.montoDescLinea - this.montoDescGen) * this.exonerado;
      this.montoTotal = this.montoSub + this.montoIVA - this.montoDescLinea - this.montoDescGen;

      if (this.modificando){          // Si modificando = true se esta modificando una linea del detalle
        this.pedido.detalle[this.j].cantidad = this.cantidad;
        this.pedido.detalle[this.j].subTotal = this.montoSub;
        this.pedido.detalle[this.j].iva = this.montoIVA;
        this.pedido.detalle[this.j].montoExonerado = this.montoExonerado;
        this.pedido.detalle[this.j].descuento = this.montoDescLinea;
        this.pedido.detalle[this.j].porcenDescuento = this.descuento;
        this.pedido.detalle[this.j].descGeneral = this.montoDescGen;
        this.pedido.detalle[this.j].total = this.montoTotal;
        this.modificando = false;
        this.j = -1;

      } else {                        // SINO se esta creando una nueva linea de detalle
        
        this.esFrio( this.producto.frio );
        this.nuevoDetalle = new DetallePedido(this.producto.id, this.producto.nombre, this.producto.precio, this.cantidad, this.montoSub, this.montoIVA, 
                                    this.montoDescLinea, this.montoDescGen,this.montoTotal, this.producto.impuesto, this.producto.canastaBasica, this.descuento, this.impuesto*100,
                                    this.montoExonerado, this.exonerado, this.producto.frio );
        if (hayBoni){
          this.nuevoDetalle.esBoni = true;
          this.nuevoDetalle.tipoBoni = this.bonificacion.Tipo;
        }
        this.pedido.detalle.unshift( this.nuevoDetalle );
        this.numLineas = this.pedido.detalle.length;
      }
      this.pedido.subTotal = this.pedido.subTotal + this.montoSub;
      this.pedido.iva = this.pedido.iva + this.montoIVA;
      this.pedido.descuento = this.pedido.descuento + this.montoDescLinea;
      this.pedido.descGeneral = this.pedido.descGeneral + this.montoDescGen;
      this.pedido.total = this.pedido.total + this.montoTotal;

      if (hayBoni){
        this.crearDetalleBonificacion(mod, div, this.nuevoDetalle.codProducto);
      }
      
      this.bonificacion = undefined;
      this.hayBoni = false;
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
      this.exonerado = 0;
      this.montoExonerado = 0;
      this.defaultCant = true;
    } else {
      this.bonificacion = undefined;
      this.hayBoni = false;
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
      this.exonerado = 0;
      this.montoExonerado = 0;
      this.defaultCant = true;
    }
  }

  crearDetalleBonificacion(mod: number, div: number, idProduc: string){
    if (this.bonificacion.Tipo == 'BONI'){
      const producto = this.isa.productos.filter( x => x.id == this.bonificacion.Articulo_Boni);
      const impuesto = this.isa.calculaImpuesto( producto[0].impuesto, producto[0].id );

      if (producto){
        this.montoSub = this.bonificacion.Bonificacion * div * producto[0].precio;
        this.montoDescLinea = this.montoSub * 99.9 / 100;
        this.montoDescGen = 0;
        this.montoIVA = (this.montoSub - this.montoDescLinea - this.montoDescGen) * impuesto;
        this.montoExonerado = 0;
        this.montoTotal = this.montoSub + this.montoIVA - this.montoDescLinea - this.montoDescGen;

        const item = new DetallePedido(producto[0].id, producto[0].nombre, producto[0].precio, this.bonificacion.Bonificacion * div, 
                              this.montoSub, this.montoIVA, this.montoDescLinea, this.montoDescGen,this.montoTotal, producto[0].impuesto, 
                              producto[0].canastaBasica, 99.9, impuesto*100, this.montoExonerado, this.exonerado, producto[0].frio );
        item.esBoni = true;
        item.tipoBoni = 'BONI';
        item.articuloBoni = idProduc;
        this.pedido.detalle.unshift( item );
        this.numLineas = this.pedido.detalle.length;

        this.pedido.subTotal = this.pedido.subTotal + this.montoSub;
        this.pedido.iva = this.pedido.iva + this.montoIVA;
        this.pedido.descuento = this.pedido.descuento + this.montoDescLinea;
        this.pedido.descGeneral = this.pedido.descGeneral + this.montoDescGen;
        this.pedido.total = this.pedido.total + this.montoTotal;
      }

    } else if (this.bonificacion.Tipo == 'ESCA' && mod > 0){   // La cantidad del pedido de Esca no es divisible
                                                              // entre la cantidad de la bonificación.  Eso implica que hay
                                                             // un residuo
      
      this.montoSub = mod * this.producto.precio;
      this.montoDescLinea = 0;
      this.montoDescGen = 0;
      this.montoIVA = (this.montoSub - this.montoDescLinea - this.montoDescGen) * this.impuesto;
      this.montoExonerado = (this.montoSub - this.montoDescLinea - this.montoDescGen) * this.exonerado;
      this.montoTotal = this.montoSub + this.montoIVA - this.montoDescLinea - this.montoDescGen;

      this.esFrio( this.producto.frio );
      const item  = new DetallePedido(this.producto.id, this.producto.nombre, this.producto.precio, mod, this.montoSub, this.montoIVA, 
                                    this.montoDescLinea, this.montoDescGen,this.montoTotal, this.producto.impuesto, this.producto.canastaBasica, 0, this.impuesto*100,
                                    this.montoExonerado, this.exonerado, this.producto.frio );
      
      this.pedido.detalle.unshift( item );
      this.numLineas = this.pedido.detalle.length;

      this.pedido.subTotal = this.pedido.subTotal + this.montoSub;
      this.pedido.iva = this.pedido.iva + this.montoIVA;
      this.pedido.descuento = this.pedido.descuento + this.montoDescLinea;
      this.pedido.descGeneral = this.pedido.descGeneral + this.montoDescGen;
      this.pedido.total = this.pedido.total + this.montoTotal;
    }
  }

  borrarDetalle( i: number ){
    let data: DetallePedido[] = [];
    let j = -1;

    if ( !this.modificando ){
      console.log('Borrando: ', this.pedido.detalle[i]);
      this.pedido.subTotal = this.pedido.subTotal - this.pedido.detalle[i].subTotal;
      const descGen = this.pedido.subTotal * this.pedido.porcentajeDescGeneral / 100;
      this.pedido.descuento = this.pedido.descuento - this.pedido.detalle[i].descuento;
      this.pedido.descGeneral = this.pedido.descGeneral - this.pedido.detalle[i].descGeneral;
      this.pedido.iva = this.pedido.iva - this.pedido.detalle[i].iva;
      this.pedido.total = this.pedido.total - this.pedido.detalle[i].total;

      if (this.pedido.detalle[i].esBoni && this.pedido.detalle[i].tipoBoni == 'BONI'){
        j = this.pedido.detalle.findIndex( x => x.articuloBoni == this.pedido.detalle[i].codProducto);
        console.log('J: ', j);
      } else if (this.pedido.detalle[i].esBoni && this.pedido.detalle[i].tipoBoni == 'ESCA'){
        j = this.pedido.detalle.findIndex( x => x.codProducto == this.pedido.detalle[i].codProducto);
        console.log('J: ', j);
      }

      if (i > 0){
        data = this.pedido.detalle.slice(0, i);
      } 
      if (i+1 < this.pedido.detalle.length){
        data = data.concat(this.pedido.detalle.slice(i+1, this.pedido.detalle.length));
      }
      this.pedido.detalle = data.slice(0);
      if (this.pedido.detalle.length > 0){
        this.validaFrio();
      } else {
        this.seco = false;
        this.frio = false;
      }
      this.numLineas = this.pedido.detalle.length;

      if (j >= 0 && j !== i){      // true = hay una línea bonificada en el detalle y hay que borrarla igual
        this.borrarDetalle(j);
      }

    } else {
      this.isa.presentAlertW( 'Borrado', 'No se puede borrar una línea si se estaba editando otra.');
      this.ionList.closeSlidingItems();
    } 
  }

  editarDetalle( i: number ){
    if ( !this.modificando ){      // Valida si se está editando una línea... en ese caso no se puede editar.

      if (this.pedido.detalle[i].tipoBoni == 'ESCA'){
        const j = this.pedido.detalle.findIndex( x => x.codProducto == this.pedido.detalle[i].codProducto );
        if (j >= 0 && j !== i){
          this.borrarDetalle(j);
          i -= 1;
        }
      }

      if (this.pedido.detalle[i].tipoBoni !== 'BONI'){
        this.reversarLinea(i);
        this.ionList.closeSlidingItems();
      } else {
        this.isa.presentAlertW( 'Edición', 'No se puede editar la línea porque es una Bonificación.  Puedes borrarla en su lugar.!!!');
        this.ionList.closeSlidingItems();
      }

    } else {
      this.isa.presentAlertW( 'Edición', 'No se puede editar una línea si se estaba editando otra.');
      this.ionList.closeSlidingItems();
    } 
  }

  async mostrarBoni(){
    let etiqueta = '';

    if (this.bonificacion){
      if (this.bonificacion.Tipo == 'DESC'){
        etiqueta = `Artículo con descuento máximo de: ${this.bonificacion.Bonificacion}%`
      } else if (this.bonificacion.Tipo == 'ESCA'){
        etiqueta = `Por la compra de ${this.bonificacion.Cantidad} unidades de este artículo.  Recibes un descuento de ${this.bonificacion.Bonificacion}%`;
      } else {
        const articulo = this.isa.productos.find( x => x.id == this.bonificacion.Articulo_Boni);
        if (articulo){
          etiqueta = `Por la compra de ${this.bonificacion.Cantidad} unidades de este artículo.  Recibes una unidad del artículo ${this.bonificacion.Articulo_Boni} ${articulo.nombre}`;  
        } else {
          etiqueta = `Por la compra de ${this.bonificacion.Cantidad} unidades de este artículo.  Recibes una unidad del artículo ${this.bonificacion.Articulo_Boni}`;
        }
      }
    }
    const alert = await this.alertController.create({
      header: 'Bonificación',
      subHeader: this.bonificacion.Tipo,
      message: etiqueta,
      buttons: ['OK'],
    });

    await alert.present();
  }

  masFunction(){
    if (this.defaultCant){
      this.cantidad = this.cantidad + 1;
    } else {
      this.descuento = this.descuento + this.descuentoPermitido( this.isa.clienteAct.id, this.producto.id );
    }
  }

  menosFunction(){
    if (this.defaultCant && this.cantidad > 0){
      this.cantidad = this.cantidad - 1;
    }else if( this.descuento > 0 ){
      this.descuento = this.descuento - 1;
    }
  }

  async carrito(){
    let botones: any[] = [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
          return;
        }
      }, {
        text: 'Proforma',
        handler: () => {
          console.log('Confirm Proforma');
          this.enviarProforma();
        }
      }, {
        text: 'Transmitir',
        handler: () => {
          console.log('Confirm Transmitir');
          this.transmitir();
        }
      }
    ];

    if ( !this.hayCardex ){        // Si no hay un cardex definido no se habilita el botón de Proforma.
      botones = [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
            return;
          }
        }, {
          text: 'Transmitir',
          handler: () => {
            console.log('Confirm Transmitir');
            this.transmitir();
          }
        }
      ];
    }

    if (this.pedidoSinSalvar && !this.modificando && !this.mostrarListaProd ){
      if ( this.pedido.fechaEntrega !== null ){
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Confirmación',
          message: `Envío de Pedido <strong>${this.pedido.numPedido}</strong>`,
          buttons: botones
        });
        await alert.present();
      } else {
        this.isa.presentAlertW('Fecha Entrega', 'No se puede enviar el pedido sin una fecha de entrega.');
      }
    } else {
      this.isa.presentAlertW('Salvar Pedido', 'No se puede transmitir el pedido si se está editando o modificando una línea.');
    }
  }

  transmitir(){
    if ( this.pedido.total + this.isa.clienteAct.saldoCredito > this.isa.clienteAct.limiteCredito && this.isa.clienteAct.diasCredito > 1){             // Se valida el límite de Crédito
      this.isa.presentAlertW('CREDITO', 'El monto del pedido supera el límite de Crédito del Cliente. Llame a Credito para evitar inconvenientes!!!');
    }
    this.pedido.horaFin = new Date();
    this.isaPedido.procesaPedido( this.pedido, this.frio, this.seco );     // Transmite mediante el API el pedido a Isleña; N = nuevo pedido
    this.isaCardex.actualizaAplicado(this.pedido.codCliente);
    this.isa.incrementaConsec('P');    // Incrementa el consecutivo de los pedidos
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
    this.montoExonerado = 0;
    this.exonerado = 0;
    const fecha = new Date()
    this.pedido = new Pedido( this.isa.varConfig.consecutivoPedidos, this.isa.clienteAct.id, new Date(), 0, 0, 0, 0, 0, 0, '', fecha, false, null);

    let fecha2 =new Date();
    fecha2.setDate(fecha2.getDate() + 1);
    this.pedido.fechaEntrega = fecha2;
    const fec = this.isaPedido.getFecha(this.pedido.fechaEntrega);
    this.pedido.observaciones = `Fecha Entrega: ${fec}`;

    this.numLineas = this.pedido.detalle.length;
    this.isa.transmitiendo = [];
  }

  enviarProforma(){
    this.isaPedido.proforma( this.pedido );
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
    this.montoExonerado = 0;
    this.exonerado = 0;
    const fecha = new Date()
    this.pedido = new Pedido( this.isa.varConfig.consecutivoPedidos, this.isa.clienteAct.id, fecha, 0, 0, 0, 0, 0, 0, '', fecha, false, null);
    this.pedido.fechaEntrega.setDate( fecha.getDate() + 1);
    //this.getGeo();
    this.numLineas = this.pedido.detalle.length;
  }

  descuentoPermitido( codCliente: string, codProducto: string ){
    return 5;
  }

  validaFrio(){
    this.frio = false;
    this.seco = false;

    this.pedido.detalle.forEach( d => {
      this.esFrio( d.frio );
    })
  }

  reversarLinea(i: number){
    
    this.cantidad = this.pedido.detalle[i].cantidad;
    this.descuento = this.pedido.detalle[i].descuento * 100 / this.pedido.detalle[i].subTotal;  // % descuento linea
    this.producto = this.isa.productos.find(data => data.id == this.pedido.detalle[i].codProducto);  // Funcion que retorna el producto a editar
    this.texto = this.producto.nombre;
    this.cantBodega = this.cantidadBodega( this.producto.id );
    this.impuesto = this.isa.calculaImpuesto( this.producto.impuesto, this.pedido.detalle[i].codProducto );
    this.mostrarListaProd = false;
    this.mostrarProducto = true;
    this.modificando = true;
    this.bonificacion = this.bonificaciones.find( x => x.Articulo == this.producto.id && x.Cliente == this.isa.clienteAct.id );
    console.log('Bonificación: ', this.bonificacion);
    if (this.bonificacion){
      this.hayBoni = true;
    }
    this.j = i;
    this.pedido.subTotal = this.pedido.subTotal - this.pedido.detalle[i].subTotal;
    this.pedido.iva = this.pedido.iva - this.pedido.detalle[i].iva;
    this.pedido.descuento = this.pedido.descuento - this.pedido.detalle[i].descuento;
    this.pedido.descGeneral = this.pedido.descGeneral - this.pedido.detalle[i].descGeneral;
    this.pedido.total = this.pedido.total - this.pedido.detalle[i].total;
  }

  async editarInfo(i: number){
    let descuento = 0;

    if (!this.modificando){

      // Primero se consulta el histórico de compras por item
      const historico = await this.isaCardex.cargarCardex(`#${this.pedido.detalle[i].codProducto}`);
      console.log(historico);

      if (historico.length > 0){
        descuento = historico[0].descuento;
      }

      const alert = await this.alertController.create({
        header: 'Confirmación',
        message: `El último descuento dado a este cliente es de: ${descuento}`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Acción de cancelar');
            }
          }, {
            text: 'Aceptar',
            handler: () => {
              console.log('Acción de aceptar');
              this.reversarLinea(i);
              this.descuento = descuento;
              this.calculaLineaPedido()
              this.ionList.closeSlidingItems();
            }
          }
        ]
      });
    
      await alert.present();
      
    } else {
      this.isa.presentAlertW( 'Edición', 'No se puede editar una línea si se estaba editando otra.');
      this.ionList.closeSlidingItems();
    }
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
          max: this.isa.clienteAct.descuento,
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
    let montoExo: number;
    let tax: number;

    if ( this.pedido.porcentajeDescGeneral > environment.DescuentoMaxGen ){
      this.isa.presentAlertW('Descuento','El descuento es superior al máximo permitido...');
    } else if (this.pedido.detalle.length > 0){
      for (let i = 0; i < this.pedido.detalle.length; i++) {
        this.exonerado = this.isa.consultarExoneracion( this.isa.clienteAct.id, this.pedido.detalle[i].codProducto )/100;
        tax = this.isa.calculaImpuesto(this.pedido.detalle[i].impuesto, this.pedido.detalle[i].codProducto );
        montoDescGen = (this.pedido.detalle[i].subTotal - this.pedido.detalle[i].descuento) * this.pedido.porcentajeDescGeneral / 100;
        montoIVA = (this.pedido.detalle[i].subTotal - this.pedido.detalle[i].descuento - montoDescGen) * tax;
        montoExo = (this.pedido.detalle[i].subTotal - this.pedido.detalle[i].descuento - montoDescGen) * this.exonerado;
        montoTotal = this.pedido.detalle[i].subTotal + montoIVA - this.pedido.detalle[i].descuento - montoDescGen;
        this.pedido.descGeneral = this.pedido.descGeneral - this.pedido.detalle[i].descGeneral + montoDescGen;
        this.pedido.detalle[i].descGeneral = montoDescGen;
        this.pedido.iva = this.pedido.iva - this.pedido.detalle[i].iva + montoIVA;
       // this.pedido.detalle[i].iva = montoIVA;
    //    this.pedido.detalle[i].montoExonerado = montoExo;
        this.pedido.total = this.pedido.total - this.pedido.detalle[i].total + montoTotal;
        this.pedido.detalle[i].total = montoTotal;
      }
    }
  }

  async observaciones(){
    const maxchar = environment.maxchar;
    let diaSemana: string = 'ND';
    let fecha2: Date;

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Observaciones',
      inputs: [
        {
          name: 'observacion',
          value: this.pedido.observaciones,
          id: 'paragraph',
          type: 'textarea',
          placeholder: 'Texto',
        },
        {
          name: 'entrega',
          id: 'entrega',
          type: 'date',
          placeholder: 'Fecha entrega',
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
            if ( this.pedido.observaciones.length > maxchar ){
              const arr = this.pedido.observaciones.slice( 0, maxchar );
              this.pedido.observaciones = arr;
              console.log(arr);
            }
            if (data.entrega !== ""){ 
              fecha2 = new Date(data.entrega);
              this.pedido.fechaEntrega = fecha2;
              console.log(fecha2);
              this.pedido.fechaEntrega.setDate( fecha2.getDate() + 1);
              const fec = this.isaPedido.getFecha(this.pedido.fechaEntrega);
              
              this.pedido.observaciones = `Fecha entrega: ${fec}` + this.pedido.observaciones.slice(25);
              //console.log(fec);
            }
          }
        }
      ]
    });

    await alert.present();
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
            this.calculaLineaPedido();
          }
        }
      ]
    });

    await alert.present();
  }

  barcode(){
    let texto: string;

    if ( !this.modificando ){
      this.barcodeScanner.scan().then(barcodeData => {
        console.log('Barcode data', barcodeData);
        if ( !barcodeData.cancelled ){
          texto = barcodeData.text;
          const item = this.isa.productos.find( d => d.codigoBarras == texto )
          if ( item ){
            this.texto = item.id;
          } else {
            this.isa.presentAlertW('Scan', 'Producto no existe' + texto);
          }
        } 
       }).catch(err => {
           console.log('Error', err);
       });
      
    }
  }

  regresar(){
    if (this.pedidoSinSalvar){
      this.presentAlertSalir();
    } else {
      this.navController.back();
    }
  }

}
