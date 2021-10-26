
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
  faltantes: number = 0;

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

    this.faltantes = this.cardexIn.length - this.paginaFin;
    if ( this.paginaFin > this.cardexIn.length ){
      this.paginaFin = this.cardexIn.length;
      this.faltantes = 0;
    } 

    const array = this.cardexIn.slice( this.paginaIni, this.paginaFin );
    array.forEach( d => {
      producto = new Productos( d.codProducto, d.desProducto, 0, '', 0, '', '', '', '', '', '' );
      productos.push( producto );
    })
    this.busquedaProd = this.busquedaProd.concat( productos );
    this.paginaIni += this.tamPagina;
    
    if ( this.paginaFin < this.cardexIn.length ){
      this.paginaFin += this.tamPagina;
    }
  }

  loadData( event ){
    if (this.mostrar && this.texto.length === 0){ 
      setTimeout(() => { 
          if (this.faltantes === 0 ) {
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

    const selectArray = this.busquedaProd.filter( d => d.seleccionado );
    if ( selectArray.length > 0){         // Se seleccionaron uno o varios artículos
      this.modalCtrl.dismiss({ productos: selectArray });
    }

    if ( this.texto.length === 0 ){
      this.paginaIni = 0;
      this.paginaFin = 30;
      this.busquedaProd = [];
      this.infiniteScroll.disabled = false;
      this.incrementaPagina();
    } else if ( isNaN( +this.texto )){      // Se recorre el arreglo para buscar coincidencias en el texto
      array = this.busquedaProd.slice(0);
      this.busquedaProd = [];
      for (let i = 0; i < this.isa.productos.length; i++) {
        if (this.isa.productos[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
            this.busquedaProd.push(this.isa.productos[i]);
        }
      }
    } else {              // La búsqueda es por código de producto
      const product = this.isa.productos.find( e => e.id === this.texto );
      if ( product !== undefined ){
        this.busquedaProd = [];
        this.busquedaProd.push(product);
      } else {           // Sino se busca por código de barras
        const product2 = this.isa.productos.find( e => e.codigoBarras === this.texto );
        if ( product2 !== undefined ){
          this.busquedaProd = [];
          this.busquedaProd.push(product2);
        } else {
          this.isa.presentAlertW( this.texto, 'No hay coincidencias' );
        }
      }
    }
    if (this.busquedaProd.length === 0){                    // no hay coincidencias
      this.busquedaProd = array.slice(0);
      this.isa.presentAlertW( this.texto, 'No hay coincidencias' );
    } 
  }

  barcode(){
    let texto: string;

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

  regresar(){
    this.modalCtrl.dismiss({ productos: null });
  }

}
