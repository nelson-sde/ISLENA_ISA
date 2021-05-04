
import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController, NavParams } from '@ionic/angular';
import { Productos } from 'src/app/models/productos';
import { IsaService } from 'src/app/services/isa.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Cardex } from 'src/app/models/cardex';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage { 

  busquedaProd: Productos[] = [];
  cardexIn: Cardex[] = [];
  texto: string = '';
  mostrar: boolean;
  tamPagina: number = 30;            // Cantidad de registros a mostrar en la pagina 
  paginaIni: number = 0;
  paginaFin: number = 30;

  @ViewChild ( IonInfiniteScroll ) infiniteScroll: IonInfiniteScroll;

  constructor( private modalCtrl: ModalController,
               private isa: IsaService,
               private barcodeScanner: BarcodeScanner,
               private navParams: NavParams ) {
    
    this.mostrar = this.navParams.get('mostrar');
    this.cardexIn = this.navParams.get('cardex');
    if ( this.mostrar ){
      this.incrementaPagina();
    }
    
  }

  incrementaPagina(){
    let producto: Productos;
    let productos: Productos[] = [];

    const array = this.cardexIn.slice( this.paginaIni, this.paginaFin );
    array.forEach( d => {
      producto = new Productos( d.codProducto, d.desProducto, 0, '', 0, '', '', '', '', '', '' );
      productos.push( producto );
    })
    this.busquedaProd = this.busquedaProd.concat( productos );
    this.paginaIni += this.tamPagina;
    this.paginaFin += this.tamPagina;
  }

  loadData( event ){
    if (this.mostrar && this.texto.length === 0){ 
      setTimeout(() => { 
          if (this.paginaFin >= this.cardexIn.length ) {
            this.infiniteScroll.complete();
            this.infiniteScroll.disabled = true;
            return;
          }
          this.incrementaPagina();
          this.infiniteScroll.complete();
      }, 500);
    } else {
      this.infiniteScroll.complete();
      this.infiniteScroll.disabled = true;
    }
  }

  buscarProducto(){
    let array: Productos[] = [];

    if ( this.texto.length === 0 ){
      this.paginaIni = 0;
      this.paginaFin = 30;
      this.busquedaProd = [];
      this.infiniteScroll.disabled = false;
      this.incrementaPagina();
    } else if (this.texto[0] == '#') {                     // Se buscará por código de producto
      const idProduct = this.texto.slice(1);
      const product = this.isa.productos.find( e => e.id == idProduct );
      if ( product !== undefined ){
        this.busquedaProd = [];
        this.busquedaProd.push(product);
      } else {
        this.isa.presentAlertW( this.texto, 'No hay coincidencias' );
      }
    } else {                       // Se recorre el arreglo para buscar coincidencias
      array = this.busquedaProd.slice(0);
      this.busquedaProd = [];
      for (let i = 0; i < this.isa.productos.length; i++) {
        if (this.isa.productos[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
            this.busquedaProd.push(this.isa.productos[i]);
        }
      }
    }
    if (this.busquedaProd.length === 0){                    // no hay coincidencias
      this.busquedaProd = array.slice(0);
      this.isa.presentAlertW( this.texto, 'No hay coincidencias' );
    } 
  }

  productoSelect( i: number ){
    this.modalCtrl.dismiss({codProducto: this.busquedaProd[i].id, desProducto: this.busquedaProd[i].nombre});
  }

  barcode(){
    let texto: string;

    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      if ( !barcodeData.cancelled ){
        texto = barcodeData.text;
        const item = this.isa.productos.find( d => d.codigoBarras == texto )
        if ( item ){
          this.texto = '#' + item.id;
        } else {
          this.isa.presentAlertW('Scan', 'Producto no existe' + texto);
        }
      } 
      }).catch(err => {
          console.log('Error', err);
      });
  }

  regresar(){
    this.modalCtrl.dismiss({codProducto: null, desProducto: null});
  }

}
