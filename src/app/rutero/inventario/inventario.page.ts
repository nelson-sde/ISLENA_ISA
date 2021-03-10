import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Cardex } from 'src/app/models/cardex';
import { Productos } from 'src/app/models/productos';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})

export class InventarioPage {

  productos: Productos[] = [];
  cardexHistorico: Cardex [] = [];
  filtra: boolean = false;

  constructor( public isa: IsaService,
               public isaCardex: IsaCardexService,
               private navController: NavController,
               private router: Router,
               private alertController: AlertController ) {
    this.reordenaHistorico();
  }

  reordenaHistorico(){
    let i = 0;
    let j = 1;

    this.cardexHistorico = this.isa.cargarCardex('TODO');
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
    this.cardexHistorico = this.isa.cargarCardex(producto);
    this.filtra = true;
  }

  cancelarFiltro(){
    this.reordenaHistorico();
  }

  abrirCardex( i: number ){
    if (i >= 0){
      this.router.navigate(['/cardex', {
        codProducto: this.cardexHistorico[i].codProducto,
        nombreProd: this.cardexHistorico[i].desProducto,
        descuento: this.cardexHistorico[i].descuento }]);
    } else{
      this.router.navigate(['/cardex', {
        codProducto: null,
        nombreProd: null }]);
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
