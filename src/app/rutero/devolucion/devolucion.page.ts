import { Component, Input, OnInit } from '@angular/core';
import { IsaService } from '../../services/isa.service';
import { ModalController, NavController } from '@ionic/angular';
import { Cardex } from '../../models/cardex';
import { IsaDevService } from 'src/app/services/isa-dev.service';
import { LineasDev } from '../../models/devolucion';

@Component({
  selector: 'app-devolucion',
  templateUrl: './devolucion.page.html',
  styleUrls: ['./devolucion.page.scss'],
})
export class DevolucionPage implements OnInit {

  @Input() item: Cardex;
  agregar: boolean = false;

  constructor( private isa: IsaService,
               private dev: IsaDevService,
               private modalCtrl: ModalController,
               private navCtrl: NavController ) { }

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
                                         this.item.cantDev, this.item.montoDescuento, this.item.impuesto, this.item.monto, this.item.linea, this.item.bodega, 0 );
      this.dev.devolucionDet.unshift( devolucion );
      this.agregar = false;
      this.dev.sinSalvar = true;
    } else {
      this.isa.presentAlertW('Devolución', 'El artículo ya existe en la lista de devoluciones...');
    }
  }

  guardarDev(){
    console.log('Devoluciones: ', this.dev.devolucionDet);
    if ( this.dev.sinSalvar ){
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
