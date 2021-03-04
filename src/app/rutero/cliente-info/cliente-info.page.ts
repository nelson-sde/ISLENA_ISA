import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-cliente-info',
  templateUrl: './cliente-info.page.html',
  styleUrls: ['./cliente-info.page.scss'],
})
export class ClienteInfoPage {

  constructor( private isa: IsaService,
               private popoverCtrl: PopoverController ) { }

  guardar(){
    this.popoverCtrl.dismiss({
      modificado: true
    });
  }

}
