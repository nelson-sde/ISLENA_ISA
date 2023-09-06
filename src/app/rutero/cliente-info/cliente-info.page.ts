import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { IsaService } from 'src/app/services/isa.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-cliente-info',
  templateUrl: './cliente-info.page.html',
  styleUrls: ['./cliente-info.page.scss'],
})
export class ClienteInfoPage {

  geoReferencia: boolean = false;
  lista = '';

  constructor( private isa: IsaService,
               private popoverCtrl: PopoverController,
               private geolocation: Geolocation ) {
    const producto = this.isa.productos.find( x => x.listaPrecios == this.isa.clienteAct.listaPrecios);
    this.lista = producto.nivelPrecio;
  }


  guardar(){
    this.popoverCtrl.dismiss({
      modificado: true,
      geoReferencia: this.geoReferencia,
    });
  }

  getGeo(){
    
    this.isa.presentaLoading('Espere por favor...');
    console.log('Cargando Geolocalización');
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      this.geoReferencia = true;
      this.isa.loadingDissmiss();
      console.log(resp);
      this.isa.clienteAct.latitud = resp.coords.latitude;
      this.isa.clienteAct.longitud = resp.coords.longitude;
     }).catch((error) => {
       console.log('Error getting location', error);
       this.isa.loadingDissmiss();
     });
  }

}
