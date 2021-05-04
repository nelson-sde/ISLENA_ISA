import { Component, ViewChild } from '@angular/core';
import { AlertController, IonInfiniteScroll, ModalController, NavController } from '@ionic/angular';
import { Cardex } from 'src/app/models/cardex';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { IsaService } from 'src/app/services/isa.service';
import { CardexPage } from '../cardex/cardex.page';
import { ProductosPage } from '../productos/productos.page';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})

export class InventarioPage {

  productos: Cardex[] = [];
  cardexHistorico: Cardex [] = [];       // Carga la totalidad del histórico de ventas del cliente
  historico: Cardex[] = [];             // Arreglo que contiene la data a mostrar en pantalla
  cardex: Cardex[] = [];               // Arreglo que contiene el cardex que estamos construyendo al cliente
  filtra: boolean = false;
  tamPagina: number = 30;            // Cantidad de registros a mostrar en la pagina 
  paginaIni: number = 0;
  paginaFin: number = 30;

  @ViewChild( IonInfiniteScroll ) infiniteScroll: IonInfiniteScroll;

  constructor( private isa: IsaService,
               private isaCardex: IsaCardexService,
               private modalCtrl: ModalController,
               private navController: NavController,
               private alertController: AlertController ) {
    this.cardex = this.isaCardex.cargarCardexCliente( this.isa.clienteAct.id );
    this.reordenaHistorico();
  }

  incrementaPagina(){
    const array = this.cardexHistorico.slice( this.paginaIni, this.paginaFin );
    this.historico = this.historico.concat( array );
    this.paginaIni += this.tamPagina;
    this.paginaFin += this.tamPagina;
  }

  loadData( event ){
    setTimeout(() => {

      if (this.paginaFin >= this.cardexHistorico.length ) {
        this.infiniteScroll.complete();
        this.infiniteScroll.disabled = true;
        return;
      }
      this.incrementaPagina();
      this.infiniteScroll.complete();
    }, 500)
  }

  async reordenaHistorico(){
    let i = 0;
    let j = 1;

    this.cardexHistorico = await this.isaCardex.cargarCardex('TODO');
    while (i < this.cardexHistorico.length && j < this.cardexHistorico.length) {
      if(new Date(this.cardexHistorico[j].fecha).getDate() == new Date(this.cardexHistorico[i].fecha).getDate()){
        this.cardexHistorico[j].fecha = null;
        j++
      } else {
        i = j;
        j++;
      }
    }
    this.incrementaPagina();
    this.cargarProductos();
  }

  cargarProductos(){
    let i: number;

    this.cardexHistorico.forEach( d => {
      i = this.productos.findIndex( f => f.codProducto === d.codProducto );
      if ( i === -1 ){
        this.productos.push( d );
      }
    });
    if (this.productos.length > 0){
      this.productos.sort( function(a,b){
        if (a.desProducto > b.desProducto){
          return 1;
        }
        if (a.desProducto < b.desProducto){
          return -1;
        }
        return 0;
      });
    }
    console.log('Productos:', this.productos);
  }

  async filtraProductos(){
    const modal = await this.modalCtrl.create({
      component: ProductosPage,
      componentProps: {
        'cardex': this.productos,
        'mostrar': true,
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    if (data.codProducto !== null){
      const i = this.cardexHistorico.findIndex( d => d.codProducto === data.codProducto );
      this.abrirCardex( i );
    }
  }

  async abrirCardex( i: number ){
    let codProducto: string = null;
    let nombre: string = null;
    let descuento: number = 0;

    if (i >= 0){
      codProducto = this.cardexHistorico[i].codProducto;
      descuento = this.cardexHistorico[i].descuento;
      nombre = this.cardexHistorico[i].desProducto;
    }
    const modal = await this.modalCtrl.create({
      component: CardexPage,
      componentProps: {
        codProd: codProducto,
        nombre: nombre,
        desc: descuento,
        cardex: this.cardex,
        productos: this.productos,
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();
    const {data} = await modal.onWillDismiss();
    if ( data !== undefined){
      this.cardex = data.cardex.slice(0);
    }
  }

  async presentAlertSalir() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Cuidado!!!',
      message: 'Desea salir del Cardex.  Se perdera la informacion no salvada.',
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
            this.isaCardex.cardex = [];
            this.isaCardex.cardexSinSalvar = false;
            this.navController.back();
          }
        }
      ]
    });
    await alert.present();
  }

  regresar(){
    if (this.isaCardex.cardexSinSalvar){
      this.presentAlertSalir();
    } else {
      this.navController.back();
    }
  }

}
