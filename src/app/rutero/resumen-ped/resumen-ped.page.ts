import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Pedido } from 'src/app/models/pedido';

@Component({
  selector: 'app-resumen-ped',
  templateUrl: './resumen-ped.page.html',
  styleUrls: ['./resumen-ped.page.scss'],
})
export class ResumenPedPage {

  @Input() pedido: Pedido;

  constructor( private modalCtrl: ModalController ) { }

  regresar(){
    this.modalCtrl.dismiss();
  }
}
