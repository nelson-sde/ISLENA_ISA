import { Component } from '@angular/core';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-cobro-info',
  templateUrl: './cobro-info.page.html',
  styleUrls: ['./cobro-info.page.scss'],
})
export class CobroInfoPage {

  listaPre: string = '';

  constructor( private isa: IsaService ) {
    this.listaPre = this.isa.productos[0].nivelPrecio;
  }


}
