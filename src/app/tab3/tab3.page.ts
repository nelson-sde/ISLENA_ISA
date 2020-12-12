import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IsaService } from '../services/isa.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  numRuta: string;

  constructor( public isa: IsaService,
               private router: Router ) {
    this.numRuta = isa.varConfig.numRuta;
    console.log(isa.varConfig);
  }

  configRuta(){
    if (this.isa.varConfig.usuario !== 'admin'){
      // abre el modal de logeo
    }
    if (this.isa.varConfig.usuario == 'admin'){
      console.log('Abrir Config');
      this.router.navigate(['tab3-config']);
    }
  }

}
