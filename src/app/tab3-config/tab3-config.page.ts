
import { Component } from '@angular/core';
import { AlertController, NavController, PopoverController } from '@ionic/angular';
import { IsaService } from '../services/isa.service';
import { Tab3PopPage } from '../tab3-pop/tab3-pop.page';

@Component({
  selector: 'app-tab3-config',
  templateUrl: './tab3-config.page.html',
  styleUrls: ['./tab3-config.page.scss'],
})
 
export class Tab3ConfigPage {

  texto:string;

  constructor( public isa: IsaService,
               private alertCtrl: AlertController,
               private navControler: NavController,
               private popoverCtrl: PopoverController ) {

    if (this.isa.rutas.length == 0) {
      this.isa.getRutas().subscribe(
        resp => {
          console.log('RutasBD', resp );
          this.isa.rutas = resp;
          /*resp.forEach(element => {
            this.isa.rutas.push(element);
          });*/
          console.log( 'Arreglo', this.isa.rutas );
        }, error => {
          console.log(error.message);
        }
      );                                // Actualiza la lista de rutas en ISA
    }
    
  }

  async rutasPoppover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: Tab3PopPage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();

    const {data} = await popover.onWillDismiss();
    console.log(data);
    if (data !== undefined) {
      this.isa.varConfig.numRuta = this.isa.rutas[data.indice].Ruta;         // Asigna la nueva ruta a la varaible de entorno de ISA
      this.isa.varConfig.nomVendedor = this.isa.rutas[data.indice].Agente;
      this.isa.varConfig.usuario = this.isa.rutas[data.indice].Ruta;
      this.isa.varConfig.clave = this.isa.rutas[data.indice].HandHeld;
    }
  }

  rutaEnter( ruta: string ){
    const i = this.isa.rutas.findIndex( r => r.Ruta == ruta );
    if ( i >= 0 && this.texto !== this.isa.varConfig.numRuta){
      this.presentAlertConfirm( i );
    } else if ( i < 0 ){
      console.log('Ruta no existe');
      this.isa.presentAlertW(this.texto, 'La ruta no existe');
      this.texto = '';
      this.isa.varConfig.numRuta = '';         
      this.isa.varConfig.nomVendedor = '';
      this.isa.varConfig.usuario = '';
      this.isa.varConfig.clave = '';
    }
  }

  cargaConfig(){
    if ( this.isa.varConfig.numRuta.length > 0 &&
         this.isa.varConfig.clave.length > 0 &&
         this.isa.varConfig.usuario.length > 0) {
      this.isa.guardarVarConfig();                              // Actualiza la informacion de entorno
      this.isa.syncClientes(this.isa.varConfig.numRuta);       // Carga la BD de Clientes de la ruta
      this.isa.syncProductos(this.isa.varConfig.numRuta);     // Actualiza la BD de productos
      this.regresar();
    } else {
      this.isa.presentAlertW(this.texto, 'Faltan datos claves para sincronizar la información.');
    }
  }

  async presentAlertConfirm( i: number ) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Confirma',
      message: 'Cuidado <strong>Esta accion borrara toda la informacion de la ruta que no haya sincronizado</strong>!!!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Ok',
          handler: () => {
            this.isa.varConfig.numRuta = this.isa.rutas[i].Ruta;         // Asigna la nueva ruta a la varaible de entorno de ISA
            this.isa.varConfig.nomVendedor = this.isa.rutas[i].Agente;
            this.isa.varConfig.usuario = this.isa.rutas[i].Ruta;
            this.isa.varConfig.clave = this.isa.rutas[i].HandHeld;
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
