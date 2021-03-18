import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaPedidoService } from 'src/app/services/isa-pedido.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-tab3-datos',
  templateUrl: './tab3-datos.page.html',
  styleUrls: ['./tab3-datos.page.scss'],
})
export class Tab3DatosPage {

  constructor( private navController: NavController,
               private alertCtrl: AlertController,
               private isa: IsaService,
               private isaPedidos: IsaPedidoService,
               private isaCobros: IsaCobrosService,
               private isaCardex: IsaCardexService ) { }


  async sincronizar(){
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Confirmación',
      message: '<strong>Cuidado</strong> Esta accion borrara toda la informacion de la ruta que no haya transmitido!!!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Continúa',
          handler: () => {
            this.realizarSinc();
          }
        }
      ]
    });
    await alert.present();
  }

  realizarSinc(){
    this.isa.syncClientes(this.isa.varConfig.numRuta);       // Carga la BD de Clientes de la ruta
    this.isa.syncProductos(this.isa.varConfig.numRuta);     // Actualiza la BD de productos
    this.isa.syncCardex(this.isa.varConfig.numRuta);
    this.isa.syncCxC(this.isa.varConfig.numRuta);
    this.isa.syncBancos();
    this.isa.syncExoneraciones();
    this.isa.syncSugerido();
    this.isaPedidos.borrarPedidos();
    this.isaCobros.borrarRecibos();
    this.isaCardex.borrarCardex();
    this.regresar();
  }

  regresar(){
    this.navController.back();
  }

}
