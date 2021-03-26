import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { Cardex } from 'src/app/models/cardex';
import { Productos } from 'src/app/models/productos';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { IsaService } from 'src/app/services/isa.service';
import { CardexPage } from '../cardex/cardex.page';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})

export class InventarioPage {

  productos: Productos[] = [];
  cardexHistorico: Cardex [] = [];
  cardex: Cardex[] = [];
  filtra: boolean = false;

  constructor( private isa: IsaService,
               private isaCardex: IsaCardexService,
               private modalCtrl: ModalController,
               private navController: NavController,
               private alertController: AlertController ) {
    this.cardex = this.isaCardex.cargarCardexCliente( this.isa.clienteAct.id );
    this.reordenaHistorico();
  }

  reordenaHistorico(){
    let i = 0;
    let j = 1;

    this.cardexHistorico = this.isaCardex.cargarCardex('TODO');
    while (i < this.cardexHistorico.length && j < this.cardexHistorico.length) {
      if(new Date(this.cardexHistorico[j].fecha).getDate() == new Date(this.cardexHistorico[i].fecha).getDate()){
        this.cardexHistorico[j].fecha = null;
        j++
      } else {
        i = j;
        j++;
      }
    }
  }

  filtraItem( producto: string ){
    this.cardexHistorico = this.isaCardex.cargarCardex(producto);
    this.filtra = true;
  }

  cancelarFiltro(){
    this.reordenaHistorico();
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
