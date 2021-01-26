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

  isItemAvailable: boolean = true;
  cardexSinSalvar: boolean = false;
  productos: Productos[] = [];
  cardexHistorico: Cardex [] = [];

  constructor( public isa: IsaService,
               public isaCardex: IsaCardexService,
               private navController: NavController,
               private router: Router,
               private alertController: AlertController ) {
    this.cardexHistorico = this.isa.historico.slice(0);
  }

  abrirCardex( i: number ){
    this.cardexSinSalvar = true;
    this.router.navigate(['/cardex', {
      codProducto: this.productos[i].id,
      nombreProd: this.productos[i].nombre }]);
  }

  guardarInventario(){
    this.isItemAvailable = false;
  }

  salvarCardex(){
    this.isaCardex.guardarCardex();
    this.navController.back();
  }

  regresar(){
    if (this.cardexSinSalvar){
      this.presentAlertSalir();
    } else {
      this.navController.back();
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
            this.navController.back();
          }
        }
      ]
    });
    await alert.present();
  }

}
