import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { DataProductos } from 'src/app/models/data-productos';
import { Productos } from 'src/app/models/productos';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})

export class InventarioPage {

  productos: Productos[] =[];
  isItemAvailable: boolean = true;
  cardexSinSalvar: boolean = false;

  constructor( public isa: IsaService,
               public isaCardex: IsaCardexService,
               private navController: NavController,
               private router: Router,
               private alertController: AlertController ) {

    this.productos = DataProductos.slice(0);
  }

  initializeItems(){
    this.productos = DataProductos.slice(0);
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== '') {
        this.isItemAvailable = true;
        this.productos = this.productos.filter((item) => {
            return (item.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
    } else {
        this.isItemAvailable = true;
    }
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
    }
    this.navController.back();
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
            this.navController.back();
          }
        }
      ]
    });
    await alert.present();
  }

}
