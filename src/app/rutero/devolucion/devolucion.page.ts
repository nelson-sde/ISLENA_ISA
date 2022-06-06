import { Component, Input, OnInit } from '@angular/core';
import { IsaService } from '../../services/isa.service';
import { ModalController, NavController, AlertController } from '@ionic/angular';
import { Cardex } from '../../models/cardex';
import { IsaDevService } from 'src/app/services/isa-dev.service';
import { Devolucion, LineasDev, DevolucionDet } from '../../models/devolucion';
import { Productos } from '../../models/productos';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-devolucion',
  templateUrl: './devolucion.page.html',
  styleUrls: ['./devolucion.page.scss'],
})
export class DevolucionPage implements OnInit {

  @Input() item: Cardex;
  agregar: boolean = false;
  devoluciones: Devolucion[] = [];
  observaciones: string = '';

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

  agregarDev(){
    if ( this.dev.devolucionDet.findIndex( x => x.numFactura === this.item.factura && x.articulo === this.item.codProducto ) === -1 ){
      const devolucion = new LineasDev ( this.item.factura, this.item.fecha, this.item.codCliente, this.item.codProducto, this.item.desProducto, this.item.precio, this.item.cantPedido,
                                         this.item.cantDev, this.item.montoDescuento, this.item.descuento, this.item.impuesto, this.item.monto, this.item.linea, this.item.bodega, 0 );
      this.dev.devolucionDet.unshift( devolucion );
      this.agregar = false;
      this.dev.sinSalvar = true;
    } else {
      this.isa.presentAlertW('Devolución', 'El artículo ya existe en la lista de devoluciones...');
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

    console.log('Devoluciones: ', this.dev.devolucionDet);
    if ( this.dev.sinSalvar && this.dev.devolucionDet.length > 0 ){

      this.dev.devolucionDet.forEach( x => {
        i = this.devoluciones.findIndex( z => z.numFactura === x.numFactura );
        if ( i === -1 ){
          p = this.isa.productos.find( y => y.id === x.articulo );
          if ( p !== undefined ){ 
            devolucion = new Devolucion(this.isa.varConfig.consecutivoDevoluciones, x.cliente, x.numFactura, new Date(), new Date(), x.fechaFac, this.observaciones, 
                        1, this.isa.clienteAct.listaPrecios, x.monto, x.descuento, x.impuestos, x.bodega, p.nivelPrecio, 'L', this.isa.clienteAct.divGeografica1, 
                        this.isa.clienteAct.divGeografica2, environment.actividadEco );

            // incrementar el consecutivo de la devolución
            c = this.isa.nextConsecutivo(this.isa.varConfig.consecutivoDevoluciones);
            this.isa.varConfig.consecutivoDevoluciones = c;

            detDev = new DevolucionDet( x.articulo, x.monto, x.precio, x.cantDevuelta, null, x.montoDesc, x.descuento, p.impuesto.slice(0,2), p.impuesto.slice(2), 
                      this.isa.calculaImpuesto( p.impuesto, x.articulo ) * 100 );
            devolucion.lineas.push( detDev );

            this.devoluciones.push( devolucion );
          } else {
            this.isa.presentAlertW('Producto Inactivo', `El producto ${x.articulo} ya no se encuentra activo.  No se puede devolver...!!!`);
          }
        } else {
          detDev = new DevolucionDet( x.articulo, x.monto, x.precio, x.cantDevuelta, null, x.montoDesc, x.descuento, p.impuesto.slice(0,2), p.impuesto.slice(2),
          this.isa.calculaImpuesto( p.impuesto, x.articulo ) * 100 );
          this.devoluciones[i].lineas.push(detDev);
          this.devoluciones[i].numItems += 1;
          this.devoluciones[i].montoSinIVA += x.monto;
          this.devoluciones[i].montoImp += x.impuestos;
          this.devoluciones[i].montoDesc += x.montoDesc;
        }
      });
      this.dev.guardarDevoluciones(this.devoluciones);
      this.isa.guardarVarConfig();

      this.dev.devolucionDet = [];
      this.dev.sinSalvar = false;
      this.modalCtrl.dismiss();
      this.navCtrl.back();
      this.isa.presentaToast('Devolución Exitosa...');
    }
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
