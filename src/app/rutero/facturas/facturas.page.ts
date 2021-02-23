import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Pen_Cobro } from 'src/app/models/cobro';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.page.html',
  styleUrls: ['./facturas.page.scss'],
})
export class FacturasPage {

  facturas: Pen_Cobro[] = [];

  constructor( private navParams: NavParams,
               private popoverCtrl: PopoverController ) {
    this.facturas = this.navParams.get('value');
  }

  onClick( i: number ){
    this.popoverCtrl.dismiss({item: this.facturas[i].numeroDocumen});
  }
}
