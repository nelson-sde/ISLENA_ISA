import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Entregas } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-entregas',
  templateUrl: './entregas.page.html',
  styleUrls: ['./entregas.page.scss'],
})
export class EntregasPage implements OnInit {

  entregas: Entregas[] = [];

  constructor( private navCtrl: NavController,
               public isa: IsaService ) { }

  ngOnInit() {
    this.cargarEntregas();
  }

  cargarEntregas(){
    this.entregas = JSON.parse(localStorage.getItem('Entregas')) || [];
  }

  refrescar(){
    this.isa.presentaLoading('Espere por favor');
    this.isa.getEntregas( this.isa.varConfig.numRuta ).subscribe(
      resp => {
        this.entregas = resp.slice(0);
        localStorage.setItem('Entregas', JSON.stringify(resp));
        this.isa.loadingDissmiss();
      }, error => {
        this.isa.loadingDissmiss();
        this.isa.presentAlertW('ERROR', error.message);
      }
    )
  }

  regresar(){
    this.navCtrl.back();
  }

}
