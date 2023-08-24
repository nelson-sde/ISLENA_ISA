import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { BackOrders, Entregas } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';
import { BackordersPage } from '../backorders/backorders.page';

@Component({
  selector: 'app-entregas',
  templateUrl: './entregas.page.html',
  styleUrls: ['./entregas.page.scss'],
})
export class EntregasPage implements OnInit {

  entregas: Entregas[] = [];
  backOrders: BackOrders[] = [];

  constructor( private navCtrl: NavController,
               public isa: IsaService,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    this.cargarEntregas();
  }

  cargarEntregas(){

    this.entregas = JSON.parse(localStorage.getItem('Entregas')) || [];
    this.backOrders = JSON.parse(localStorage.getItem('BackOrders')) || [];

    if ( this.backOrders.length > 0 ){
      this.backOrders.forEach( x=> {
        const i = this.entregas.findIndex( y => y.idCliente == x.clientE_ORIGEN );
        this.entregas[i].observaciones = 'BO';
      });
    }
  }

  refrescar(){
    this.isa.presentaLoading('Espere por favor');
    this.isa.getEntregas( this.isa.varConfig.numRuta ).subscribe(
      resp => {
        this.entregas = [];
        this.backOrders = [];
        localStorage.setItem('Entregas', JSON.stringify(resp));
        this.cargarEntregas();
        this.isa.loadingDissmiss();
      }, error => {
        this.isa.loadingDissmiss();
        this.isa.presentAlertW('ERROR', error.message);
      }
    )
  }

  async backOrder(i: number){

    const arregloBO: BackOrders[] = [];

    if (this.entregas[i].observaciones == 'BO'){
      
      const arregloBO = this.backOrders.filter( x => x.clientE_ORIGEN == this.entregas[i].idCliente );
      console.log(arregloBO);

      const modal = await this.modalCtrl.create({
        component: BackordersPage,
        componentProps: {
          arregloBO
        },
        cssClass: 'my-custom-class'
      });
      await modal.present();
      
    }
  }

  regresar(){
    this.navCtrl.back();
  }

}
