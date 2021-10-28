import { Component, ViewChild } from '@angular/core';
import { AlertController, IonInfiniteScroll, ModalController, NavController } from '@ionic/angular';
import { Cardex } from 'src/app/models/cardex';
import { Productos } from 'src/app/models/productos';
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
  filtra: boolean = false;
  tamPagina: number = 30;            // Cantidad de registros a mostrar en la pagina 
  paginaIni: number = 0;
  paginaFin: number = 0;
  faltantes: number = 0;
  textoBuscar: string = '';

  @ViewChild( IonInfiniteScroll ) infiniteScroll: IonInfiniteScroll;

  constructor( private isa: IsaService,
               private isaCardex: IsaCardexService,
               private modalCtrl: ModalController,
               private navController: NavController,
               private alertController: AlertController ) {
    this.reordenaHistorico('TODO');
  }

  incrementaPagina(){
    this.paginaFin += this.tamPagina;
    if ( this.paginaFin > this.cardexHistorico.length ){
      this.paginaFin = this.cardexHistorico.length;
      this.faltantes = 0;
    } else {
      this.faltantes = this.cardexHistorico.length - this.paginaFin;
    }
    const array = this.cardexHistorico.slice( this.paginaIni, this.paginaFin );
    this.historico = this.historico.concat( array );
    this.paginaIni += this.tamPagina;
  }

  loadData( event ){
    setTimeout(() => {
      if ( this.faltantes === 0 ) {
        this.infiniteScroll.complete();
        this.infiniteScroll.disabled = true;
        return;
      }
      this.incrementaPagina();
      this.infiniteScroll.complete();
    }, 500)
  }

  async reordenaHistorico(parametro: string){
    /* let i = 0;
    let j = 1;

    this.cardexHistorico = await this.isaCardex.cargarCardex(parametro);
    while (i < this.cardexHistorico.length && j < this.cardexHistorico.length) {
      if(new Date(this.cardexHistorico[j].fecha).getDate() == new Date(this.cardexHistorico[i].fecha).getDate()){
        this.cardexHistorico[j].fecha = null;
        j++
      } else {
        i = j;
        j++;
      }
    }*/
    this.cardexHistorico = await this.isaCardex.cargarCardex(parametro);
    this.cargarProductos();
    this.cardexHistorico = this.productos.slice(0);
    this.incrementaPagina();
    
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
    let prodArray: Productos[] = [];
    this.cardexHistorico = [];
    this.historico = [];
    this.paginaIni = 0;
    this.paginaFin = 30;

    if (!this.filtra){
      this.filtra = true;
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
      if (data.productos !== null){
        prodArray = data.productos.slice(0);
        this.reordenaHistorico(prodArray[0].id);
      }
    } else {
      this.filtra = false;
      this.reordenaHistorico('TODO');
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
        'codProd': codProducto,
        'nombre': nombre,
        'desc': descuento,
        //'cardex': this.cardex,
        'productos': this.productos,
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();
    const {data} = await modal.onWillDismiss();
    if ( data !== undefined){
      // this.cardex = data.cardex.slice(0);
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

  onSearchChange(event){
    this.textoBuscar = event.detail.value;
  }

  regresar(){
    if (this.isaCardex.cardexSinSalvar){
      this.presentAlertSalir();
    } else {
      this.navController.back();
    }
  }

}
