
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Productos } from 'src/app/models/productos';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage {

  productos: Productos[] = [];
  busquedaProd: Productos[] = [];
  texto: string;

  constructor( private modalCtrl: ModalController,
               private isa: IsaService ) {
    this.productos = this.isa.productos.slice(0);
  }

  buscarProducto(){
    if (this.texto.length == 0) {    
      this.busquedaProd = this.productos.slice(0);
    } else if (this.texto[0] == '#') {                     // Se buscará por código de producto
      this.busquedaProd = [];
      const idProduct = this.texto.slice(1);
      const product = this.productos.find( e => e.id == idProduct );
      if ( product !== undefined ){
        this.busquedaProd.push(product);
      }
    } else {                       // Se recorre el arreglo para buscar coincidencias
      this.busquedaProd = [];
      for (let i = 0; i < this.productos.length; i++) {
        if (this.productos[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
            this.busquedaProd.push(this.productos[i]);
        }
      }
    }
    if (this.busquedaProd.length == 0){                    // no hay coincidencias
      this.isa.presentAlertW( this.texto, 'No hay coincidencias' );
      this.texto = '';
    }                                             
  }

  productoSelect( i: number ){
    this.modalCtrl.dismiss({codProducto: this.busquedaProd[i].id, desProducto: this.busquedaProd[i].nombre});
  }

  regresar(){
    this.modalCtrl.dismiss({codProducto: null, desProducto: null});
  }

}
