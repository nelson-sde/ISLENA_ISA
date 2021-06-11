import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-visita',
  templateUrl: './visita.page.html',
  styleUrls: ['./visita.page.scss'],
})
export class VisitaPage implements OnInit {

  constructor( private navCtrl: NavController,
               private isa: IsaService) { }

  ngOnInit() {
  }

  regresar(){
    this.navCtrl.back();
  }

}
