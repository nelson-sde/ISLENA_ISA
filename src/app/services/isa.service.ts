import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

interface variablesConfig {
  numRuta: string;
  nombreVendedor: string;
  consecutivoPedidos: number;
  consecutivoRecibos: number;
  usuario: string;
  clave: string;
}

@Injectable({
  providedIn: 'root'
})
export class IsaService {

  varConfig: variablesConfig = {
    numRuta: 'R001',
    nombreVendedor: 'No definido',
    consecutivoPedidos: 0,
    consecutivoRecibos: 0,
    usuario: 'Admin',
    clave: 'Admin'
  };

  constructor(public alertController: AlertController) { 
    this.cargaVarConfig();
  }

  cargaVarConfig(){
    if (localStorage.getItem('config')){
      this.varConfig = JSON.parse( localStorage.getItem('config'));
    } 
  }

  guardarVarConfig(){
    localStorage.setItem('config', JSON.stringify(this.varConfig));
  }

  getConfig( id: string ){
    if (id == 'ruta'){
      return this.varConfig.numRuta;
    } else if (id == 'pedidos') {
      return this.varConfig.consecutivoPedidos;
    }
  }

  async presentAlertW( subtitulo: string, mensaje: string ) {
    const alert = await this.alertController.create({
      header: 'Warning',
      subHeader: subtitulo,
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

  
}
