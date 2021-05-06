
import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Ruta } from 'src/app/models/ruta';
import { IsaService } from '../../services/isa.service';

@Component({
  selector: 'app-tab3-pop',
  templateUrl: './tab3-pop.page.html',
  styleUrls: ['./tab3-pop.page.scss'],
})
export class Tab3PopPage {

  rutas: Ruta[];

  constructor( private isa: IsaService,
               private popoverCtrl: PopoverController) {

    this.rutas = this.isa.rutas.slice(0);
  }

  rutaSeleccionada( i: number ){
    this.popoverCtrl.dismiss({
      indice: i
    });
  }

}
