import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Recibo } from 'src/app/models/cobro';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-liquida-info',
  templateUrl: './liquida-info.page.html',
  styleUrls: ['./liquida-info.page.scss'],
})
export class LiquidaInfoPage implements OnInit {

  recibos: Recibo [] = [];
  montoEfectivo: number = 0;
  montoCheque: number = 0;
  fecha: Date = new Date();

  constructor( private navController: NavController,
               private isa: IsaService ) { }

  ngOnInit() {
    if ( localStorage.getItem('recibos')){
      this.recibos = JSON.parse(localStorage.getItem('recibos'));
      this.recibos.forEach( d => {
        this.montoEfectivo += d.montoEfectivoL;
        this.montoCheque += d.montoChequeL;
      });
    }
  }

  liquidar(){
    this.enviarEmail();
    localStorage.removeItem('recibos');
    this.navController.back();
    this.navController.back();
    this.navController.back();
  }

  enviarEmail(){

  }

  regresar(){
    this.navController.back();
    this.navController.back();
  }

}
