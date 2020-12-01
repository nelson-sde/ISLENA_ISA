import { Component } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';
import { Cliente } from 'src/app/models/cliente';
import { DataClientes } from 'src/app/models/data-clientes';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage {

  texto: string;
  clientes: Cliente[] = [];
  busquedaClientes: Cliente[] = [];

  constructor( public modalCtrl: ModalController,
               private navParams: NavParams,
               private alertController: AlertController ) {
    this.texto = this.navParams.get('value');
    this.clientes = DataClientes.slice(0);
    this.buscarCliente();
  }

  buscarCliente(){
    if (this.texto.length == 0) {                  // Se busca en todos los cliente
      this.busquedaClientes = this.clientes;
    } else {                                     // Se recorre el arreglo para buscar coincidencias
      this.busquedaClientes = [];
      for (let i = 0; i < this.clientes.length; i++) {
        if (this.clientes[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
          this.busquedaClientes.push(this.clientes[i]);
        }
      }
      if (this.busquedaClientes.length == 0){
        this.presentAlert( this.texto, 'No hay coincidencias' );
        this.texto = '';
      }
    }
  }

  dismissClientes( codigoCliente: number ){             // Retorna el codigo del cliente seleccionado, sino selecciono
    this.modalCtrl.dismiss( codigoCliente );           //  un cliente retorna cero
  }

  async presentAlert( subtitulo: string, mensaje: string ) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alerta',
      subHeader: subtitulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

}
