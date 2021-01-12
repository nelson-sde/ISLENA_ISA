import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { IsaService } from 'src/app/services/isa.service';
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
  codigoCliente: number = 0;

  constructor( private alertController: AlertController,
               private router: Router,
               public isa: IsaService,
               private popoverCtrl: PopoverController ) {

    this.isa.cargarClientes();
  }

  abrirPedidos(){
    if (this.codigoCliente !== 0 && this.texto.length !== 0){
      this.router.navigate(['/pedidos', {
                            codCliente: this.codigoCliente,
                            nombreCliente: this.texto,
                            dirCliente: this.direccion
      }]);
    } else {
      this.presentAlert('Pedidos', 'Debe seleccionar un cliente para ingresar un pedido.')
    }
  }

  abrirInventario(){
    if (this.codigoCliente !== 0 && this.texto.length !== 0){
      this.router.navigate(['/inventario']);
    } else {
      this.presentAlert('Inventarios', 'Debe seleccionar un cliente para realizar un inventario.');
    }
  }

  buscarCliente( ev: any ){

    if (this.texto.length == 0) {                               // Se busca en todos los cliente
      this.isa.buscarClientes = this.isa.clientes.slice(0);      // El modal se abrira con el arreglo completo de clientes
    } else {                                                  // Se recorre el arreglo para buscar coincidencias
      this.isa.buscarClientes = [];
      for (let i = 0; i < this.isa.clientes.length; i++) {
        if (this.isa.clientes[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
          this.isa.buscarClientes.push(this.isa.clientes[i]);
        }
      }
    }
    if (this.isa.buscarClientes.length == 0){                               // no hay coincidencias
      this.presentAlert( this.texto, 'No hay coincidencias' );
      this.texto = '';
      this.direccion = '';
      this.dir = false;
      this.codigoCliente = 0;
  } else if (this.isa.buscarClientes.length == 1){                        // La coincidencia es exacta
      this.texto = this.isa.buscarClientes[0].nombre;
      this.direccion = this.isa.buscarClientes[0].direccion;
      this.codigoCliente = this.isa.buscarClientes[0].id;
      this.dir = true;
      this.isa.clienteAct = this.isa.buscarClientes[0];
    } else {                                                           // Se debe abrir el modal para busqueda de clientes
      this.clientesPopover( ev );
    }
  }

  async clientesPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ClientesPage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();

    const {data} = await popover.onWillDismiss();
    console.log(data);
    if ( data !== undefined){
      if (data.codCliente == this.isa.clienteAct.id){
        this.codigoCliente = this.isa.clienteAct.id;
        this.texto = this.isa.clienteAct.nombre;
        this.direccion = this.isa.clienteAct.direccion;
        this.dir = true;
      } else {
        this.codigoCliente = 0;
        this.texto = '';
        this.direccion = '';
        this.dir = false;
      }
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
