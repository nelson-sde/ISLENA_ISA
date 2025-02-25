import { Component, Input, OnInit } from '@angular/core';
import { IsaService } from '../../services/isa.service';
import { ModalController, NavController, AlertController } from '@ionic/angular';
import { Cardex } from '../../models/cardex';
import { IsaDevService } from 'src/app/services/isa-dev.service';
import { Devolucion, LineasDev, DevolucionDet } from '../../models/devolucion';
import { Productos } from '../../models/productos';
import { environment } from '../../../environments/environment';
import { ProductosPage } from '../productos/productos.page';
import { IsaLSService } from '../../services/isa-ls.service';

@Component({
  selector: 'app-devolucion',
  templateUrl: './devolucion.page.html',
  styleUrls: ['./devolucion.page.scss'],
})
export class DevolucionPage implements OnInit {

  @Input() item: Cardex;
  @Input() directo: boolean;      // Si directo = True, significa que no se envía un item por parámetro

  agregar: boolean = false;
  devoluciones: Devolucion[] = [];
  observaciones: string = '';
  descuento: number = 0;

  constructor( private isa: IsaService,
               private dev: IsaDevService,
               private modalCtrl: ModalController,
               private navCtrl: NavController,
               private alertController: AlertController ) { }

  ngOnInit() {
    console.log(this.item);
    console.log( this.dev.devolucionDet );
  }

  validaDev(){
    console.log(this.item);
    if ( this.item.cantPedido >= this.item.cantDev ){
      this.agregar = true;
    } else {
      this.agregar = false;
      this.isa.presentAlertW('Devolución', 'El monto de la devolución no puede ser mayor a lo facturado...');
    }
  }

  async agregarProducto(){

    let productos: Cardex[] = [];
    let prodArray: Productos[] = [];
    let linea: Cardex;

    this.isa.productos.forEach( x => {
      linea = new Cardex(this.item.codCliente, '', x.id, x.nombre, '', null, 0, 0, 0, 0, 0, 0, x.precio, 0, '', 0, false, 0 );
      productos.push( linea );
    });

    const modal = await this.modalCtrl.create({
      component: ProductosPage,
      componentProps: {
        'cardex': productos,
        'mostrar': true,
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    
    if (data.productos !== null){
      this.item.cantDev = 0;
      this.descuento = 0;
      productos = [];
      prodArray = data.productos.slice(0);
      prodArray.forEach( d => {
        linea = new Cardex(this.isa.clienteAct.id, '', d.id, d.nombre, 'P', new Date(), null, 0, 0, 0, 0, 0, d.precio, 0, this.isa.varConfig.bodega.toString(), 0, false, 0);
        productos.push( linea );
      });
      this.item.codProducto = productos[0].codProducto;
      this.item.desProducto = productos[0].desProducto;
      this.item.precio = productos[0].precio;
      this.item.bodega = productos[0].bodega;
      this.agregar = true;
    }
  }

  agregarDev(){
    if ( this.item.cantDev > 0 ){
      if ( this.directo ){                          // En caso de que el item a realizar la devolución sea sin referencia
        this.item.descuento = this.descuento;      // Se calculan los montos
        this.item.monto = this.item.cantDev * this.item.precio;
        this.item.montoDescuento = this.item.monto * this.item.descuento / 100;
        this.item.monto -= this.item.montoDescuento;
      }
      const montoLinea = this.item.cantDev * this.item.precio;
      const montoDesc = montoLinea * (this.item.descuento / 100);
      const porcenDesGen = this.item.descGeneral * 100 / this.item.monto
      const montoDescGen = (montoLinea - montoDesc) * porcenDesGen / 100;

      if ( this.dev.devolucionDet.findIndex( x => x.numFactura === this.item.factura && x.articulo === this.item.codProducto ) === -1 ){
        const devolucion = new LineasDev ( this.item.factura, this.item.fecha, this.item.codCliente, this.item.codProducto, this.item.desProducto, this.item.precio, this.item.cantPedido,
                                          this.item.cantDev, this.item.descuento, montoDesc, this.item.impuesto, montoLinea, this.item.linea, 
                                          this.item.bodega, montoDescGen, porcenDesGen );
        this.dev.devolucionDet.unshift( devolucion );
        this.agregar = false;
        this.dev.sinSalvar = true;
        console.log('Devolución: ', devolucion);
      } else {
        this.isa.presentAlertW('Devolución', 'El artículo ya existe en la lista de devoluciones...');
      }
    } else {
      this.isa.presentAlertW('Agregar', 'No se puede agregar una línea en cero...!!!');
    }
  }

  async guardar(){
    const maxchar = environment.maxCharDev;
    let diaSemana: string = 'ND'; 

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Observaciones',
      inputs: [
        {
          name: 'observacion',
          value: this.observaciones,
          id: 'paragraph',
          type: 'textarea',
          placeholder: 'Texto',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Ok',
          handler: (data) => {
            this.observaciones = data.observacion;
            if ( this.observaciones.length > maxchar ){
              const arr = this.observaciones.slice( 0, maxchar );
              this.observaciones = arr;
              console.log(arr);
            }
            this.crearDevoluciones();
          }
        }
      ]
    });
    await alert.present();
  }

  crearDevoluciones(){
    let i: number = 0;
    let p: Productos;
    let c: string = '';
    let devolucion: Devolucion;
    let detDev: DevolucionDet;
    let porcenImp: number;
    let montoImp: number;

    console.log('Devoluciones: ', this.dev.devolucionDet);
    if ( this.dev.sinSalvar && this.dev.devolucionDet.length > 0 ){

      this.dev.devolucionDet.forEach( x => {
        p = this.isa.productos.find( y => y.id === x.articulo );   // Información del artículo seleccionado
        i = this.devoluciones.findIndex( z => z.numFactura === x.numFactura );

        if ( p !== undefined ){      // Se calcula el impuesto de la linea
          porcenImp = this.isa.calculaImpuesto( p.impuesto, x.articulo );
          montoImp = x.monto * porcenImp;
          console.log('Articulo', x.articulo, ': DG ', x.descGeneral, ', P ', x.precio, ', DL ', x.montoDesc, ', %L ', x.descuento, ', %G ', x.porcenDesGen);
        } else {
          this.isa.presentAlertW('Producto Inactivo', `El producto ${x.articulo} ya no se encuentra activo.  No se puede devolver...!!!`);
          return
        }

        if ( i === -1 ){   // Si i = -1 la devolución no existe en el arreglo
          // Se crea el encabezado de la devolución
          devolucion = new Devolucion(this.isa.varConfig.consecutivoDevoluciones, x.cliente, x.numFactura, new Date(), new Date(), x.fechaFac, this.observaciones, 
                      1, this.isa.clienteAct.listaPrecios, x.monto, x.descGeneral, montoImp, x.bodega, p.nivelPrecio, 'L', this.isa.clienteAct.divGeografica1, 
                      this.isa.clienteAct.divGeografica2, environment.actividadEco, x.porcenDesGen );

          // incrementar el consecutivo de la devolución
          c = this.isa.nextConsecutivo(this.isa.varConfig.consecutivoDevoluciones);
          this.isa.varConfig.consecutivoDevoluciones = c;

          // se agrega la línea de la devolución en el detalle
          detDev = new DevolucionDet( x.articulo, p.nombre, x.monto, x.precio, x.cantDevuelta, null, x.montoDesc, x.descuento, p.impuesto.slice(0,2), p.impuesto.slice(2), 
                    this.isa.calculaImpuesto( p.impuesto, x.articulo ) * 100 );
          devolucion.lineas.push( detDev );

          this.devoluciones.push( devolucion );
        } else {       // SINO la devolución si existe y solo se agrega la línea en el detalle.  Se actualizan totales
          detDev = new DevolucionDet( x.articulo, p.nombre, x.monto, x.precio, x.cantDevuelta, null, x.montoDesc, x.descuento, p.impuesto.slice(0,2), p.impuesto.slice(2),
          this.isa.calculaImpuesto( p.impuesto, x.articulo ) * 100 );
          this.devoluciones[i].lineas.push(detDev);
          this.devoluciones[i].numItems += 1;
          this.devoluciones[i].montoSinIVA += x.monto;
          this.devoluciones[i].montoImp += montoImp;
          this.devoluciones[i].montoDesc += x.descGeneral;
        }
      });

      this.dev.guardarDevoluciones(this.devoluciones);
      this.isa.guardarVarConfig();
      this.dev.transmitirDev( this.devoluciones );     // Función que invoca el servicio HTTP y realiza el POST a la BD

      this.dev.devolucionDet = [];
      this.dev.sinSalvar = false;
      this.modalCtrl.dismiss();
      this.navCtrl.back();
    }
  }

  mostrarDev( devoluciones: Devolucion[] ){  // Este procedimiento le indica al vendedor cuales fueron la Devoluciones generadas
    let texto: string = ''
    let array: string

    devoluciones.forEach( x => {
      array = texto.concat( `${x.numDevolucion} `)
      texto = array
    })
    this.isa.presentAlertW('Devoluciones', 'Las devoluciones generadas son: ' + texto);
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
