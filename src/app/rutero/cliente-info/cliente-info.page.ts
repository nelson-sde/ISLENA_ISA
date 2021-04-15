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

  constructor( private isa: IsaService,
               private popoverCtrl: PopoverController,
               private geolocation: Geolocation ) {}

  guardar(){
    debugger
    if ( this.isa.clienteAct.email.length > 0 ){
      if ( !this.isa.validaEmail( this.isa.clienteAct.email )){
        this.isa.presentAlertW( 'Email', 'El Email ingresado no es valido.');
      }
    } else {
      this.popoverCtrl.dismiss({
        modificado: true,
        geoReferencia: this.geoReferencia,
      });
    }
  }

  getGeo(){
    console.log('Cargando Geolocalización');
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      this.geoReferencia = true;
      console.log(resp);
      this.isa.clienteAct.latitud = resp.coords.latitude;
      this.isa.clienteAct.longitud = resp.coords.longitude;
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

}
