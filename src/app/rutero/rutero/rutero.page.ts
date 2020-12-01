import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Cliente } from 'src/app/models/cliente';
import { DataClientes } from 'src/app/models/data-clientes';
import { ClientesPage } from '../clientes/clientes.page';

@Component({
  selector: 'app-rutero',
  templateUrl: './rutero.page.html',
  styleUrls: ['./rutero.page.scss'],
})
export class RuteroPage {

  texto: string = '';                          // Campo de busqueda del cliente
  direccion: string = '';                     // Direccion del cliente en el rutero
  dir: boolean = false;                      // Hay direccion = true
  clientes: Cliente[] = [];                 // Arreglo de los clientes de la ruta
  busquedaClientes: Cliente[] = [];        // Arreglo de los clientes a seleccionar
  codigoCliente: number = 0;

  constructor( private alertController: AlertController,
               public modalCtrl: ModalController,
               private router: Router ) {
    this.clientes = DataClientes.slice(0);
  }

  buscarCliente(){

    if (this.texto.length == 0) {                  // Se busca en todos los cliente
      this.busquedaClientes = this.clientes;      // El modal se abrira con el arreglo completo de clientes
    } else {                                     // Se recorre el arreglo para buscar coincidencias
      this.busquedaClientes = [];
      for (let i = 0; i < this.clientes.length; i++) {
        if (this.clientes[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
          this.busquedaClientes.push(this.clientes[i]);
        }
      }
    }

    if (this.busquedaClientes.length == 0){                               // no hay coincidencias
      this.presentAlert( this.texto, 'No hay coincidencias' );
      this.texto = '';
      this.direccion = '';
      this.dir = false;
      this.codigoCliente = 0;
  } else if (this.busquedaClientes.length == 1){                        // La coincidencia es exacta
      this.texto = this.busquedaClientes[0].nombre;
      this.direccion = this.busquedaClientes[0].direccion;
      this.codigoCliente = this.busquedaClientes[0].id;
      this.dir = true;
    } else {                                                           // Se debe abrir el modal para busqueda de clientes
      this.modalClientes();
    }
  }
                                // abre el modal para la seleccion del cliente
  async modalClientes (){
    const modal = await this.modalCtrl.create({ component: ClientesPage, componentProps: {value: this.texto} });
    modal.onDidDismiss()
      .then((data) => {
        this.codigoCliente = data['data'];             // Codigo del cliente seleccionado
        console.log(this.codigoCliente);
        this.buscarCodigoCliente (this.codigoCliente);
    });
    await modal.present();
  }

  buscarCodigoCliente( codigo: number ){                 // busca un cliente por codigo de cliente
    if (codigo !== 0){
      for (let i = 0; i < this.clientes.length; i++) {
        if (this.clientes[i].id == codigo ){
          this.texto = this.clientes[i].nombre;
          this.direccion = this.clientes[i].direccion;
          this.dir = true;
          return;
        }
      }
    } else {
      this.codigoCliente = 0;
      this.texto = '';
      this.direccion = '';
      this.dir = false;
    }
  }

  abrirPedidos(){
    if (this.codigoCliente !== 0){
      this.router.navigate(['/pedidos', {
                            codCliente: this.codigoCliente,
                            nombreCliente: this.texto,
                            dirCliente: this.direccion
      }]);
    }
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
