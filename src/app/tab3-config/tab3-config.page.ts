import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { IsaService } from '../services/isa.service';

@Component({
  selector: 'app-tab3-config',
  templateUrl: './tab3-config.page.html',
  styleUrls: ['./tab3-config.page.scss'],
})
export class Tab3ConfigPage {

  texto:string;

  constructor( public isa: IsaService,
               private alertCtrl: AlertController,
               private navControler: NavController ) {
    this.isa.cargaRutas();
  }

  cargaConfig(){
    this.isa.ruta = this.isa.rutas.find(l => l.numRuta == this.texto);
    console.log(this.isa.ruta);
    if (this.isa.ruta !== undefined && this.texto !== this.isa.varConfig.numRuta){
      this.presentAlertConfirm();
    } else if (this.isa.ruta !== undefined){
      this.cargaFast();
    } else {
      console.log('Ruta no existe');
      this.isa.presentAlertW(this.texto, 'La ruta no existe');
    }
  }

  cargaRuta(){
    this.isa.varConfig = this.isa.ruta;
    this.isa.syncClientes();
    this.isa.guardarVarConfig();
    this.isa.syncClientes();
    this.isa.syncProductos();
  }

  cargaFast(){
    this.isa.varConfig = this.isa.ruta;
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

  regresar(){
    this.navControler.back();
  }

}
