import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IsaService } from '../services/isa.service';

@Component({
  selector: 'app-tab3-config',
  templateUrl: './tab3-config.page.html',
  styleUrls: ['./tab3-config.page.scss'],
})
export class Tab3ConfigPage {

  texto:string;
  numRuta: string;

  constructor( public isa: IsaService,
               private alertCtrl: AlertController ) {
    this.numRuta = isa.varConfig.numRuta;
  }

  cargaConfig(){
    if (this.isa.varConfig.numRuta !== this.texto){
      this.presentAlertConfirm();
    } else {
      this.cargaFast();
    }
  }

  cargaRuta(){
    this.isa.varConfig.numRuta = this.texto;
    this.isa.varConfig.nombreVendedor = 'Mauricio Herra';
    this.isa.varConfig.consecutivoPedidos = 1;
    this.isa.varConfig.consecutivoRecibos = 1;
    this.isa.guardarVarConfig();
  }

  cargaFast(){
    this.isa.varConfig.numRuta = this.texto;
    this.isa.varConfig.nombreVendedor = 'Mauricio Herra';
    this.isa.varConfig.consecutivoPedidos = 1;
    this.isa.varConfig.consecutivoRecibos = 1;
    this.isa.guardarVarConfig();
  }

  async presentAlertConfirm() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Confirma',
      message: 'Cuidado <strong>Esta accion borrara toda la informacion de la ruta</strong>!!! Y volvera a cargarla',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            return;
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.cargaRuta();
          }
        }
      ]
    });

    await alert.present();
  }

}
