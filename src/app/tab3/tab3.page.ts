import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IsaService } from '../services/isa.service';
import { AlertasService } from '../services/alertas.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})



export class Tab3Page {

  numRuta: string;

  constructor( private router: Router,
               private isa: IsaService,
               public alertasService:AlertasService
               
               ) {
  }

  configRuta(){

    this.router.navigate(['tab3-config']);


    // this.router.navigate(['login',{
    //   usuario: 'admin',
    //   navega: 'tab3-config'
    // }]);
  }

  cargarDatos(){
    this.router.navigate(['tab3-datos']);
  }
  onClick(){
this.alertasService.message('ISA','Opcion no disponible!.');
  }
}
