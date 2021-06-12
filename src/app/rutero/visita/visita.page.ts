import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { IsaService } from 'src/app/services/isa.service';
import { VisitaDetPage } from '../visita-det/visita-det.page';

@Component({
  selector: 'app-visita',
  templateUrl: './visita.page.html',
  styleUrls: ['./visita.page.scss'],
})
export class VisitaPage implements OnInit {

  constructor( private navCtrl: NavController,
               private modalCtrl: ModalController,
               private isa: IsaService) { }

  ngOnInit() {
  }

  async abrirDet( i: number ){
    const modal = await this.modalCtrl.create({
      component: VisitaDetPage,
      componentProps: {
        'i': i,
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();
    const {data} = await modal.onWillDismiss();
    localStorage.setItem('rutero', JSON.stringify(this.isa.rutero));
  }

  regresar(){
    this.navCtrl.back();
  }

}
